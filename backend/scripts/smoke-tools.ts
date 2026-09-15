import "dotenv/config";
import assert from "node:assert/strict";
import { AI } from "@prisma/client";
import { AIChatService } from "../src/modules/ai/ai.chat.service";
import { ToolExecutor } from "../src/modules/tools/tool.executor";
import { toolRegistry } from "../src/modules/tools/tools.module";
import { GeminiProvider } from "../src/modules/ai/providers/gemini.provider";

const executor = new ToolExecutor(toolRegistry);
const execute = executor.execute.bind(executor);
let calls = 0;
executor.execute = async (...args) => {
  calls++;
  return execute(...args);
};
const service = new AIChatService(new GeminiProvider(), executor);
const ai = {
  id: "smoke-ai", userId: "smoke-user", name: "Jarvis", assistantType: "normal",
  prompt: "Use calculator whenever the user explicitly asks for it. Answer briefly in Indonesian.",
} as AI;
try {
  for (const mode of ["chat", "stream"] as const) {
    calls = 0;
    const data = { ai, message: "Gunakan tool calculator untuk menghitung 600 dikali 700." };
    let reply = "";
    let chunks = 0;
    if (mode === "chat") reply = await service.chat(data);
    else for await (const chunk of service.stream(data)) { reply += chunk; chunks++; }
    assert.ok(calls > 0, "Gemini did not call calculator");
    assert.match(reply.replace(/[.,\s]/g, ""), /420000/);
    console.log(JSON.stringify({ mode, passed: true, toolCalls: calls, chunks, reply }));
  }
} catch (error) {
  // Never print request headers or credentials from SDK error objects.
  console.error(error instanceof Error ? error.message : "Smoke test failed");
  process.exitCode = 1;
}
