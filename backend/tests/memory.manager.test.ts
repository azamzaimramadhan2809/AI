import assert from "node:assert/strict";
import test from "node:test";

import { MemoryManager } from "../src/modules/memory/memory.manager";

function createManager() {
  const saved: Array<{ aiId: string; content: string }> = [];
  const memoryService = {
    async createMemory(aiId: string, content: string) {
      saved.push({ aiId, content });
      return { id: "memory-1", aiId, content };
    },
  };

  return {
    manager: new MemoryManager(memoryService as never),
    saved,
  };
}

test("stores the English identity statement used by the chat UI", async () => {
  const { manager, saved } = createManager();
  const content = "Nice to meet you Loki, my name is Zaim.";

  await manager.save("ai-1", content);

  assert.deepEqual(saved, [{ aiId: "ai-1", content }]);
});

test("stores common English preferences, goals, and project facts", async () => {
  const { manager, saved } = createManager();

  await manager.save("ai-1", "I prefer concise answers.");
  await manager.save("ai-1", "My goal is to finish Jarvis this month.");
  await manager.save("ai-1", "I am working on a desktop AI assistant.");

  assert.deepEqual(saved.map((item) => item.content), [
    "I prefer concise answers.",
    "My goal is to finish Jarvis this month.",
    "I am working on a desktop AI assistant.",
  ]);
});

test("does not store English questions", async () => {
  const { manager, saved } = createManager();

  const result = await manager.save("ai-1", "What is my name?");

  assert.equal(result, null);
  assert.deepEqual(saved, []);
});
