import assert from "node:assert/strict";
import { test } from "node:test";
import { AI } from "@prisma/client";
import { AIChatService } from "../src/modules/ai/ai.chat.service";
import { GeminiProvider } from "../src/modules/ai/providers/gemini.provider";

const data = {
  ai: { id: "ai-test", userId: "user-test", name: "Jarvis", assistantType: "normal" } as AI,
  message: "Hitung 600 * 700 lalu tambahkan 1",
};
const call = (id: string, expression: string) => ({
  role: "model", parts: [{
    functionCall: { id, name: "calculator", args: { expression } },
    thoughtSignature: "signature-" + id,
  }],
});
function setup(turns: any[]) {
  const requests: any[] = [];
  const provider = Object.create(GeminiProvider.prototype) as GeminiProvider;
  Object.assign(provider, { client: { models: {
    async generateContent(input: any) {
      requests.push(input);
      const content = turns[requests.length - 1];
      return {
        candidates: [{ content }],
        functionCalls: content.parts.filter((part: any) => part.functionCall).map((part: any) => part.functionCall),
        text: content.parts.map((part: any) => part.text ?? "").join(""),
      };
    },
    async *generateContentStream(input: any) {
      requests.push(input);
      const content = turns[requests.length - 1];
      for (const part of content.parts) {
        yield { candidates: [{ content: { role: "model", parts: [part] } }] };
      }
    },
  } } });
  return { service: new AIChatService(provider), requests };
}
const final = { role: "model", parts: [{ text: "Hasilnya " }, { text: "420001." }] };

for (const mode of ["chat", "stream"] as const) {
  test(mode + " executes calculator and preserves multiple tool turns and signatures", async () => {
    const first = call("one", "600 * 700");
    const second = call("two", "420000 + 1");
    const { service, requests } = setup([first, second, final]);
    let reply = "";
    if (mode === "chat") reply = await service.chat(data);
    else for await (const chunk of service.stream(data)) reply += chunk;
    assert.equal(reply, "Hasilnya 420001.");
    assert.equal(requests.length, 3);
    const contents = requests[2].contents;
    assert.equal(contents[0].parts[0].text, data.message);
    assert.deepEqual(contents[1], first);
    assert.equal(contents[2].parts[0].functionResponse.response.result, 420000);
    assert.deepEqual(contents[3], second);
    assert.equal(contents[4].parts[0].functionResponse.response.result, 420001);
    assert.equal(requests[0].config.systemInstruction.includes("Jarvis"), true);
  });

  test(mode + " stops repeated tool requests after three executions", async () => {
    const { service, requests } = setup(Array.from({ length: 4 }, (_, i) => call(String(i), "1+1")));
    await assert.rejects(async () => {
      if (mode === "chat") await service.chat(data);
      else for await (const _ of service.stream(data)) { /* consume */ }
    }, /tool call limit exceeded/);
    assert.equal(requests.length, 4);
  });

  test(mode + " rejects empty model responses", async () => {
    const { service } = setup([{ role: "model", parts: [] }]);
    await assert.rejects(async () => {
      if (mode === "chat") await service.chat(data);
      else for await (const _ of service.stream(data)) { /* consume */ }
    }, /empty response/);
  });
}

test("stream emits text incrementally and hides thought text", async () => {
  const { service, requests } = setup([{ role: "model", parts: [
    { text: "private reasoning", thought: true }, { text: "Halo " }, { text: "dunia" },
  ] }]);
  const stream = service.stream(data);
  assert.deepEqual(await stream.next(), { done: false, value: "Halo " });
  assert.deepEqual(await stream.next(), { done: false, value: "dunia" });
  assert.equal((await stream.next()).done, true);
  assert.equal(requests.length, 1);
});

test("multiple tools in one turn are executed and returned with matching IDs", async () => {
  const combined = { role: "model", parts: [...call("a", "2*3").parts, ...call("b", "4*5").parts] };
  const { service, requests } = setup([combined, final]);
  for await (const _ of service.stream(data)) { /* consume */ }
  assert.deepEqual(requests[1].contents.at(-1).parts.map((part: any) => part.functionResponse), [
    { name: "calculator", id: "a", response: { result: 6 } },
    { name: "calculator", id: "b", response: { result: 20 } },
  ]);
});
