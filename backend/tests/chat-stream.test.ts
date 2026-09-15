import assert from "node:assert/strict";
import { test } from "node:test";
import { ChatController } from "../src/modules/chat/chat.controller";

for (const fail of [false, true]) {
  test(fail ? "SSE reports failure without DONE" : "SSE sends string chunks followed by DONE", async () => {
    const controller = Object.create(ChatController.prototype) as ChatController;
    Object.assign(controller, { service: {
      async assertAccess() {},
      async *sendStream() {
        yield "Halo";
        if (fail) throw new Error("provider failed");
      },
    } });
    const chunks: string[] = [];
    let ended = false;
    const res = {
      headersSent: false,
      setHeader() {},
      flushHeaders() { this.headersSent = true; },
      write(chunk: string) { chunks.push(chunk); },
      end() { ended = true; },
    };
    await controller.streamMessage({ user: { userId: "user" }, body: { aiId: "ai", content: "Halo" } } as any, res as any);
    assert.equal(ended, true);
    assert.equal(chunks[0], 'data: "Halo"\n\n');
    assert.equal(chunks.join("").includes("data: [DONE]"), !fail);
    assert.equal(chunks.join("").includes("event: error"), fail);
  });
}
