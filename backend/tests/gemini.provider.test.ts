import assert from "node:assert/strict";
import { test } from "node:test";
import { FunctionCallingConfigMode } from "@google/genai";
import { GeminiProvider } from "../src/modules/ai/providers/gemini.provider";

// Replace the SDK client without constructing it or contacting the API.
function providerWithResponse(response: unknown) {
  let request: any;
  const provider = Object.create(GeminiProvider.prototype) as GeminiProvider;
  Object.assign(provider, {
    client: { models: {
      async generateContent(input: unknown) {
        request = input;
        return response;
      },
    } },
  });
  return { provider, request: () => request };
}

const tools = [{ name: "calculator" }, { name: "time" }];

test("ordinary chat can answer directly without a forced calculator call", async () => {
  const stub = providerWithResponse({ text: "Halo!" });
  const result = await stub.provider.chat({
    systemPrompt: "", message: "Halo", tools,
  });
  assert.equal(result.text, "Halo!");
  assert.equal(result.toolCalls, undefined);
  assert.deepEqual(stub.request().config.toolConfig.functionCallingConfig, {
    mode: FunctionCallingConfigMode.AUTO,
  });
  assert.deepEqual(stub.request().config.tools[0].functionDeclarations, tools);
});

test("non-calculator calls retain their arguments and model context", async () => {
  const context = { role: "model", parts: [{ functionCall: { id: "call-1", name: "time", args: {} } }] };
  const stub = providerWithResponse({
    functionCalls: [{ id: "call-1", name: "time", args: {} }],
    candidates: [{ content: context }],
  });
  const result = await stub.provider.chat({ systemPrompt: "", message: "Jam berapa?", tools });
  assert.deepEqual(result.toolCalls, [{ id: "call-1", name: "time", arguments: {} }]);
  assert.deepEqual(result.toolCallContext, [
    { role: "user", parts: [{ text: "Jam berapa?" }] }, context,
  ]);
  assert.equal(result.text, "");
});

test("tool result follow-up permits a final text response", async () => {
  const stub = providerWithResponse({ text: "Sekarang pukul 10.00." });
  const result = await stub.provider.chat({
    systemPrompt: "", message: "", tools,
    toolResults: [{ id: "call-1", name: "time", result: "10:00" }],
  });
  assert.equal(result.text, "Sekarang pukul 10.00.");
  assert.equal(stub.request().config.toolConfig.functionCallingConfig.mode, FunctionCallingConfigMode.AUTO);
  assert.deepEqual(stub.request().contents.at(-1).parts[0].functionResponse, {
    name: "time", id: "call-1", response: { result: "10:00" },
  });
});

test("chat without tools does not send tool configuration", async () => {
  const stub = providerWithResponse({ text: "Halo!" });
  await stub.provider.chat({ systemPrompt: "", message: "Halo" });
  assert.equal(stub.request().config, undefined);
});
