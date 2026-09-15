import "dotenv/config";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { once } from "node:events";
import { writeFile } from "node:fs/promises";
import { prisma } from "../src/database/prisma";
import { ProviderFactory } from "../src/modules/ai/providers/provider.factory";
import { ChatProviderInput } from "../src/modules/ai/providers/provider.types";

// Real HTTP/auth/database, deterministic provider: no Gemini requests or charges.
const calls: ChatProviderInput[] = [];
ProviderFactory.create = () => ({
  async chat(input) { calls.push(input); return { text: "Test response" }; },
  async *stream(input) { calls.push(input); yield "Test response"; },
});
const accounts: Array<{ email: string; id: string; token: string; aiId: string; messageId: string; marker: string }> = [];
const emails: string[] = [];
const checks: string[] = [];
let server: ReturnType<(typeof import("../src/app"))["default"]["listen"]> | undefined;
let cleanup = false;
const pass = (label: string) => { checks.push(label); console.log("PASS: " + label); };
try {
  await prisma.$connect();
  const { default: app } = await import("../src/app");
  server = app.listen(0, "127.0.0.1");
  await once(server, "listening");
  const address = server.address();
  assert.ok(address && typeof address !== "string");
  const base = `http://127.0.0.1:${address.port}/api`;
  async function request(token: string, path: string, method = "GET", body?: unknown) {
    return fetch(base + path, { method, headers: {
      "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}),
    }, body: body === undefined ? undefined : JSON.stringify(body), signal: AbortSignal.timeout(15000) });
  }
  async function json(token: string, path: string, method = "GET", body?: unknown, status = 200) {
    const res = await request(token, path, method, body);
    assert.equal(res.status, status, `${method} ${path}`);
    return await res.json() as any;
  }
  for (const label of ["A", "B"]) {
    const suffix = randomUUID().replaceAll("-", "");
    const email = `access-${suffix}@example.invalid`;
    emails.push(email);
    const password = randomUUID();
    const user = (await json("", "/auth/register", "POST", {
      username: `access_${suffix}`, email, password, role: "admin", isVerified: true,
    }, 201)).data;
    assert.equal(user.role, "user");
    assert.equal(user.isVerified, false);
    const token = (await json("", "/auth/login", "POST", { email, password })).data.token;
    const marker = `private_${label}_${suffix}`;
    const ai = (await json(token, "/ai", "POST", { name: `Access test ${label}`, prompt: marker, memory: true }, 201)).data;
    await prisma.message.create({ data: { aiId: ai.id, role: "USER", content: marker } });
    const message = await prisma.message.create({ data: { aiId: ai.id, role: "ASSISTANT", content: marker } });
    await prisma.memory.create({ data: { aiId: ai.id, content: "astronomi " + marker } });
    accounts.push({ email, id: user.id, token, aiId: ai.id, messageId: message.id, marker });
  }
  pass("two test users registered; client-supplied role and verification ignored");
  async function snapshot(aiId: string) {
    return JSON.stringify(await prisma.aI.findUnique({ where: { id: aiId }, include: {
      messages: { orderBy: { id: "asc" } }, memories: { orderBy: { id: "asc" } },
    } }));
  }
  for (const [actor, target] of [[accounts[0], accounts[1]], [accounts[1], accounts[0]]]) {
    const before = await snapshot(target.aiId);
    const initialCalls = calls.length;
    const cases: Array<[string, string, unknown?]> = [
      [`/ai/${target.aiId}`, "GET"],
      [`/ai/${target.aiId}`, "PUT", { name: "unauthorized" }],
      [`/ai/${target.aiId}`, "DELETE"],
      [`/chat/history?aiId=${target.aiId}`, "GET"],
      [`/chat/history?aiId=${target.aiId}`, "DELETE"],
      ["/chat/send", "POST", { aiId: target.aiId, content: "astronomi", memory: true }],
      ["/chat/send", "POST", { aiId: target.aiId, content: "astronomi", memory: false }],
      ["/chat/stream", "POST", { aiId: target.aiId, content: "astronomi", memory: true }],
      ["/chat/stream", "POST", { aiId: target.aiId, content: "astronomi", memory: false }],
      ["/chat/regenerate", "POST", { aiId: target.aiId, messageId: target.messageId }],
      ["/chat/regenerate", "POST", { aiId: actor.aiId, messageId: target.messageId }],
    ];
    for (const [path, method, body] of cases) {
      const response = await request(actor.token, path, method, body);
      assert.equal(response.status, 403, method + " " + path);
      assert.match(response.headers.get("content-type") ?? "", /application\/json/);
      assert.deepEqual(await response.json(), { success: false, message: "Forbidden" });
      assert.equal(await snapshot(target.aiId), before, "victim data changed");
      assert.equal(calls.length, initialCalls, "unauthorized request reached provider/memory context");
    }
    pass("11 cross-account AI/chat/regenerate requests rejected; no data changes or provider calls");
    const list = (await json(actor.token, "/ai")).data;
    assert.ok(list.every((ai: any) => ai.userId === actor.id));
    assert.equal((await json(actor.token, `/ai/${actor.aiId}`)).data.id, actor.aiId);
    assert.ok((await json(actor.token, `/chat/history?aiId=${actor.aiId}`)).data.length >= 2);
    for (const mode of ["send", "stream"]) {
      const response = await request(actor.token, `/chat/${mode}`, "POST", { aiId: actor.aiId, content: "astronomi" });
      assert.equal(response.status, 200);
      const text = await response.text();
      assert.ok(text.includes("Test response"));
      const context = JSON.stringify(calls.at(-1));
      assert.ok(context.includes(actor.marker));
      assert.ok(!context.includes(target.marker), "other account memory leaked");
    }
    pass("owner read/send/stream works; history and memory context stays scoped to owner");
  }
  const [actor, target] = accounts;
  const targetBefore = await snapshot(target.aiId);
  const created = (await json(actor.token, "/ai", "POST", {
    name: "Spoofed ownership test", userId: target.id,
    user: { connect: { id: target.id } },
    messages: { connect: { id: target.messageId } },
    memories: { create: { content: "injected" } },
  }, 201)).data;
  assert.equal(created.userId, actor.id);
  assert.equal(await prisma.message.count({ where: { aiId: created.id } }), 0);
  assert.equal(await prisma.memory.count({ where: { aiId: created.id } }), 0);
  await json(actor.token, `/ai/${created.id}`, "PUT", { userId: target.id, name: "Owner update", messages: { connect: { id: target.messageId } } });
  assert.equal((await prisma.aI.findUniqueOrThrow({ where: { id: created.id } })).userId, actor.id);
  await json(actor.token, "/users/profile", "PUT", {
    displayName: "Owner profile", id: target.id, role: "admin",
    ais: { connect: { id: target.aiId } },
  });
  assert.equal((await prisma.user.findUniqueOrThrow({ where: { id: actor.id } })).role, "user");
  assert.equal(await snapshot(target.aiId), targetBefore);
  await json(actor.token, `/ai/${created.id}`, "DELETE");
  assert.equal(await prisma.aI.findUnique({ where: { id: created.id } }), null);
  pass("creation/update/profile cannot override owner or mutate nested relations; owner deletion works");
} catch (error) {
  console.error("ACCESS TEST FAILED: " + (error instanceof Error ? error.message : "unknown"));
  process.exitCode = 1;
} finally {
  try {
    for (const email of emails) {
      const user = await prisma.user.findUnique({ where: { email }, select: { id: true } });
      if (user) await prisma.user.delete({ where: { id: user.id, email } });
    }
    cleanup = true;
    console.log("CLEANUP: both test accounts and cascading data removed");
  } catch {
    console.error("Cleanup failed for test emails: " + emails.join(", "));
    process.exitCode = 1;
  }
  if (server) { server.closeAllConnections(); await new Promise<void>(resolve => server!.close(() => resolve())); }
  await prisma.$disconnect();
  await writeFile("scripts/access-test-result.json", JSON.stringify({ timestamp: new Date().toISOString(), passed: !process.exitCode, checks, cleanup, provider: "mock; real HTTP, JWT, MySQL" }, null, 2));
}
