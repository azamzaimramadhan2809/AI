import assert from "node:assert/strict";
import { test } from "node:test";
import { once } from "node:events";
import jwt from "jsonwebtoken";
import { apiErrorResponse, providerError } from "../src/core/errors/api-error";
import { AIService } from "../src/modules/ai/ai.service";
import { UsersService } from "../src/modules/users/users.service";
import { ChatService } from "../src/modules/chat/chat.service";
import { ProviderFactory } from "../src/modules/ai/providers/provider.factory";

for (const [status, expected] of [[429,429], [503,503], [504,504], [401,502], [500,502]]) {
  test(`provider ${status} maps to safe ${expected}`, () => {
    const result = apiErrorResponse(providerError({ status, message: "secret upstream payload" }));
    assert.equal(result.status, expected);
    assert.ok(!JSON.stringify(result).includes("secret"));
  });
}
test("unknown errors never expose database details", () => {
  assert.deepEqual(apiErrorResponse(new Error("mysql://private:password@host")), {
    status: 500, body: { success: false, message: "Internal Server Error" },
  });
});

test("HTTP error contract for validation, not found, conflicts, provider failures and SSE", async t => {
  // Isolated test process; no real database or external AI requests.
  t.mock.method(ProviderFactory, "create", () => ({ async chat() { return { text: "ok" }; }, async *stream() { yield "ok"; } }));
  t.mock.method(AIService.prototype, "getMyAI", async (_user: string, id: string) => {
    if (id === "missing") throw new Error("AI not found");
    if (id === "other") throw new Error("Forbidden");
    return { id, userId: "user" } as any;
  });
  t.mock.method(UsersService.prototype, "createUser", async () => { throw new Error("Email already exists"); });
  t.mock.method(ChatService.prototype, "sendMessage", async (_user: string, input: any) => {
    if (input.aiId === "missing") throw new Error("AI not found");
    if (input.aiId === "other") throw new Error("Forbidden");
    throw providerError({ status: Number(input.content), message: "secret" });
  });
  t.mock.method(ChatService.prototype, "sendStream", async function* (_user: string, input: any) {
    if (input.content === "late") { yield "partial"; throw providerError({ status: 503 }); }
    throw providerError({ status: 429 });
  });
  const { default: app } = await import("../src/app");
  const server = app.listen(0, "127.0.0.1");
  await once(server, "listening");
  t.after(async () => { server.closeAllConnections(); await new Promise<void>(resolve => server.close(() => resolve())); });
  const addr = server.address() as { port: number };
  const token = jwt.sign({ userId: "user" }, process.env.JWT_SECRET || "jarvis-secret");
  async function request(path: string, body?: unknown, raw?: string) {
    return fetch(`http://127.0.0.1:${addr.port}/api${path}`, {
      method: body === undefined && raw === undefined ? "GET" : "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: raw ?? (body === undefined ? undefined : JSON.stringify(body)),
    });
  }
  const cases: Array<[string, unknown, number]> = [
    ["/chat/send", {}, 400], ["/chat/stream", { aiId: "a", content: "  " }, 400],
    ["/auth/login", {}, 400], ["/auth/register", {}, 400],
    ["/auth/register", { username: "test", email: "a@example.com", password: "password1" }, 409],
    ["/ai/missing", undefined, 404], ["/ai/other", undefined, 403],
    ["/chat/send", { aiId: "missing", content: "hi" }, 404],
    ["/chat/stream", { aiId: "missing", content: "hi" }, 404],
    ["/chat/stream", { aiId: "other", content: "hi" }, 403],
    ["/chat/send", { aiId: "a", content: "429" }, 429],
    ["/chat/send", { aiId: "a", content: "503" }, 503],
    ["/chat/send", { aiId: "a", content: "504" }, 504],
    ["/chat/send", { aiId: "a", content: "500" }, 502],
    ["/chat/stream", { aiId: "a", content: "early" }, 429],
    ["/no-such-route", undefined, 404],
    ["/ai/test", { message: "hello" }, 400],
  ];
  for (const [path, input, status] of cases) {
    const response = await request(path, input);
    assert.equal(response.status, status, path + " " + JSON.stringify(input));
    assert.match(response.headers.get("content-type") ?? "", /application\/json/);
    const body = await response.json() as any;
    assert.equal(body.success, false);
    assert.equal(typeof body.message, "string");
    assert.ok(!JSON.stringify(body).includes("secret"));
  }
  const malformed = await request("/chat/send", undefined, '{"password":"secret",');
  assert.equal(malformed.status, 400);
  assert.deepEqual(await malformed.json(), { success: false, message: "Invalid JSON body" });
  const oversized = await request("/chat/send", { content: "a".repeat(110000) });
  assert.equal(oversized.status, 413);
  const late = await request("/chat/stream", { aiId: "a", content: "late" });
  assert.equal(late.status, 200);
  const wire = await late.text();
  assert.ok(wire.includes('data: "partial"'));
  assert.ok(wire.includes("event: error"));
  assert.ok(!wire.includes("[DONE]"));
  assert.ok(wire.includes("temporarily unavailable"));
});
