import "dotenv/config";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { once } from "node:events";
import { writeFile } from "node:fs/promises";
import { prisma } from "../src/database/prisma";

const checks: string[] = [];
const suffix = randomUUID().replaceAll("-", "");
const email = `smoke-${suffix}@example.invalid`;
const password = randomUUID();
let userId: string | undefined;
let server: ReturnType<(typeof import("../src/app"))["default"]["listen"]> | undefined;
let cleanup = false;
function pass(label: string) { checks.push(label); console.log("PASS: " + label); }
try {
  await prisma.$connect();
  pass("database connection");
  const { default: app } = await import("../src/app");
  server = app.listen(0, "127.0.0.1");
  await once(server, "listening");
  const address = server.address();
  assert.ok(address && typeof address !== "string");
  const base = `http://127.0.0.1:${address.port}/api`;
  let token = "";
  async function request(path: string, method = "GET", body?: unknown, authenticated = true) {
    return fetch(base + path, {
      method,
      headers: { "Content-Type": "application/json", ...(authenticated && token ? { Authorization: `Bearer ${token}` } : {}) },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: AbortSignal.timeout(90000),
    });
  }
  async function json(path: string, method = "GET", body?: unknown, expected = 200) {
    const response = await request(path, method, body);
    assert.equal(response.status, expected, `${method} ${path} status`);
    const result = await response.json() as any;
    assert.equal(result.success, true, `${method} ${path} success`);
    return result;
  }
  await json("/health");
  assert.equal((await request("/chat/history?aiId=missing", "GET", undefined, false)).status, 401);
  pass("HTTP health and unauthenticated access rejection");
  const registered = await json("/auth/register", "POST", { username: `smoke_${suffix}`, email, password }, 201);
  userId = registered.data.id;
  assert.ok(userId);
  const wrong = await request("/auth/login", "POST", { email, password: "incorrect" });
  assert.equal(wrong.status, 401);
  const login = await json("/auth/login", "POST", { email, password });
  token = login.data.token;
  assert.equal((await json("/auth/me")).data.id, userId);
  pass("registration, wrong password rejection, login, JWT /me");
  const ai = (await json("/ai", "POST", {
    name: "HTTP Smoke Jarvis", memory: true,
    prompt: "Answer briefly in Indonesian. Use calculator when explicitly asked. Use provided relevant memories and session history when answering.",
  }, 201)).data;
  const aiId = ai.id as string;
  async function counts() {
    return { messages: await prisma.message.count({ where: { aiId } }), memories: await prisma.memory.count({ where: { aiId } }) };
  }
  async function send(mode: string, body: unknown) {
    if (mode === "send") return (await json("/chat/send", "POST", body)).data.reply as string;
    const response = await request("/chat/stream", "POST", body);
    assert.equal(response.status, 200);
    assert.match(response.headers.get("content-type") ?? "", /text\/event-stream/);
    const reader = response.body!.getReader();
    const decoder = new TextDecoder();
    let buffer = "", reply = "", done = false, chunks = 0;
    while (true) {
      const next = await reader.read();
      if (next.done) break;
      buffer += decoder.decode(next.value, { stream: true });
      const events = buffer.split("\n\n");
      buffer = events.pop() ?? "";
      for (const event of events) {
        assert.ok(!event.startsWith("event: error"), "SSE error event received");
        if (!event.startsWith("data:")) continue;
        const value = event.slice(5).trim();
        if (value === "[DONE]") { done = true; continue; }
        const chunk = JSON.parse(value);
        assert.equal(typeof chunk, "string");
        reply += chunk;
        chunks++;
      }
    }
    assert.ok(done && chunks > 0, "SSE must contain text and DONE");
    return reply;
  }
  for (const mode of ["send", "stream"]) {
    const before = await counts();
    const content = mode === "send"
      ? "Nama saya NaraTest. Gunakan tool calculator untuk menghitung 600 dikali 700."
      : "Saya suka astronomi. Gunakan tool calculator untuk menghitung 25 dikali 4.";
    const reply = await send(mode, { aiId, content });
    assert.match(reply.replace(/[.,\s]/g, ""), mode === "send" ? /420000/ : /100/);
    const after = await counts();
    assert.equal(after.messages, before.messages + 2);
    assert.equal(after.memories, before.memories + 1);
    const history = (await json(`/chat/history?aiId=${aiId}`)).data;
    assert.ok(history.some((message: any) => message.role === "ASSISTANT" && message.content === reply));
    pass(`${mode}: memory ON, real calculator response, exact reply persisted, memory extracted`);
  }
  await json(`/chat/history?aiId=${aiId}`, "DELETE");
  assert.deepEqual(await counts(), { messages: 0, memories: 2 });
  const recalled = await send("send", { aiId, content: "Siapa nama saya?" });
  assert.match(recalled, /NaraTest/i);
  pass("long-term memory recalled after deleting test chat history");
  for (const mode of ["send", "stream"]) {
    const before = await counts();
    const reply = await send(mode, {
      aiId, memory: false,
      content: "Saya suka sesi sementara. Sebutkan kode sesi yang saya berikan tadi, tanpa tambahan kata.",
      sessionHistory: [{ role: "user", content: "Kode sesi sementara adalah ORBIT731." }, { role: "assistant", content: "Baik." }],
    });
    assert.match(reply, /ORBIT731/);
    assert.deepEqual(await counts(), before);
    pass(`${mode}: memory OFF override uses sessionHistory and writes no messages or memories`);
  }
} catch (error) {
  console.error("HTTP smoke failed: " + (error instanceof Error ? error.message : "unknown error"));
  process.exitCode = 1;
} finally {
  try {
    // Delete only this run's randomly named test account and its cascading test data.
    const owned = await prisma.user.findUnique({ where: { email }, select: { id: true } });
    if (owned) {
      assert.ok(!userId || owned.id === userId);
      await prisma.user.delete({ where: { id: owned.id, email } });
    }
    cleanup = true;
    console.log("CLEANUP: test account and related test data removed");
  } catch {
    console.error("CLEANUP FAILED: inspect test account " + email);
    process.exitCode = 1;
  }
  if (server) {
    server.closeAllConnections();
    await new Promise<void>(resolve => server!.close(() => resolve()));
  }
  await prisma.$disconnect();
  await writeFile("scripts/http-smoke-result.json", JSON.stringify({
    timestamp: new Date().toISOString(), passed: !process.exitCode, checks, cleanup,
  }, null, 2));
}
