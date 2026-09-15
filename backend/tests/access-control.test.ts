import assert from "node:assert/strict";
import { test } from "node:test";
import { AIService } from "../src/modules/ai/ai.service";
import { AIController } from "../src/modules/ai/ai.controller";
import { ChatController } from "../src/modules/chat/chat.controller";
import { UsersService } from "../src/modules/users/users.service";

const attack = { userId: "victim", user: { connect: { id: "victim" } }, messages: { connect: { id: "private" } }, memories: { create: { content: "injected" } } };

test("AI creation strips ownership overrides and nested writes", async () => {
  let captured: any;
  const service = new AIService({ countByUserId: async () => 0, create: async (data: any) => { captured = data; return data; } } as any,
    { findById: async () => ({ id: "owner" }) } as any);
  await service.createAI("owner", { name: "Test", ...attack });
  assert.equal(captured.userId, "owner");
  for (const key of ["user", "messages", "memories"]) assert.equal(key in captured, false);
});

test("AI updates cannot move ownership or attach another account's messages", async () => {
  let captured: any;
  const service = new AIService({
    findById: async () => ({ id: "ai", userId: "owner" }),
    update: async (_id: string, data: any) => { captured = data; return data; },
  } as any);
  await service.updateAI("owner", "ai", { name: "Changed", ...attack });
  assert.deepEqual(captured, { name: "Changed" });
  await assert.rejects(service.updateAI("outsider", "ai", { name: "Bad" }), /Forbidden/);
});

test("AI detail checks the authenticated user's ownership", async () => {
  const controller = Object.create(AIController.prototype) as AIController;
  Object.assign(controller, { service: { async getMyAI(userId: string, aiId: string) {
    assert.equal(userId, "outsider"); assert.equal(aiId, "private"); throw new Error("Forbidden");
  } } });
  let status = 0, body: unknown;
  await controller.getById({ user: { userId: "outsider" }, params: { id: "private" } } as any, {
    status(code: number) { status = code; return this; }, json(value: unknown) { body = value; },
  } as any);
  assert.equal(status, 403);
  assert.deepEqual(body, { success: false, message: "Forbidden" });
});

test("unauthorized stream never opens SSE or starts generation", async () => {
  const controller = Object.create(ChatController.prototype) as ChatController;
  Object.assign(controller, { service: {
    async assertAccess() { throw new Error("Forbidden"); },
    sendStream() { assert.fail("must not start generation"); },
  } });
  let status = 0, body: unknown;
  await controller.streamMessage({ user: { userId: "outsider" }, body: { aiId: "private", content: "Hello" } } as any, {
    headersSent: false,
    setHeader() { assert.fail("must not open SSE"); },
    status(code: number) { status = code; return this; }, json(value: unknown) { body = value; },
  } as any);
  assert.equal(status, 403);
  assert.deepEqual(body, { success: false, message: "Forbidden" });
});

test("profile updates cannot transfer AI ownership through nested relations", async () => {
  let captured: any;
  const service = new UsersService({
    findById: async () => ({ id: "owner", username: "owner" }),
    updateById: async (id: string, data: any) => { assert.equal(id, "owner"); captured = data; },
  } as any);
  await service.updateProfile("owner", { displayName: "Name", id: "victim", role: "admin", ais: { connect: { id: "private" } } } as any);
  assert.deepEqual(captured, { displayName: "Name", username: undefined, bio: undefined, avatar: undefined });
});
