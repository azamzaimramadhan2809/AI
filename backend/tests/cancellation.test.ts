import assert from "node:assert/strict";
import { test } from "node:test";
import express from "express";
import { once } from "node:events";
import { ChatController } from "../src/modules/chat/chat.controller";
import { AIChatService } from "../src/modules/ai/ai.chat.service";
import { GeminiProvider } from "../src/modules/ai/providers/gemini.provider";
import { ChatService } from "../src/modules/chat/chat.service";

for (const early of [true, false]) {
  test(`HTTP disconnect aborts upstream ${early ? 'before' : 'after'} first chunk`, async () => {
    let began!: () => void, aborted!: () => void;
    const started = new Promise<void>(resolve => { began = resolve; });
    const stopped = new Promise<void>(resolve => { aborted = resolve; });
    const controller = Object.create(ChatController.prototype) as ChatController;
    Object.assign(controller, { service: {
      async assertAccess() {},
      async *sendStream(_user: string, _input: unknown, signal: AbortSignal) {
        began();
        if (!early) yield "first";
        await new Promise<void>((_resolve, reject) => {
          const stop = () => { aborted(); reject(signal.reason); };
          if (signal.aborted) stop(); else signal.addEventListener('abort', stop, { once: true });
        });
      },
    } });
    const app = express(); app.use(express.json());
    app.post('/', (req, res) => { Object.assign(req, { user: { userId: 'u' } }); return controller.streamMessage(req, res); });
    const server = app.listen(0, '127.0.0.1'); await once(server, 'listening');
    const cancellation = new AbortController();
    try {
      const port = (server.address() as { port: number }).port;
      const request = fetch(`http://127.0.0.1:${port}/`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ aiId: 'a', content: 'hi' }), signal: cancellation.signal });
      const handled = request.catch(() => null);
      await started;
      if (!early) { const response = await handled; assert.ok(response); await response.body!.getReader().read(); }
      cancellation.abort();
      await Promise.race([stopped, new Promise((_r, reject) => setTimeout(() => reject(new Error('upstream not aborted')), 1500).unref())]);
      await handled;
    } finally { server.closeAllConnections(); await new Promise<void>(resolve => server.close(() => resolve())); }
  });
}

test('Gemini SDK receives the cancellation signal', async () => {
  const signal = new AbortController().signal;
  const provider = Object.create(GeminiProvider.prototype) as GeminiProvider;
  Object.assign(provider, { client: { models: { async *generateContentStream(input: any) {
    assert.equal(input.config.abortSignal, signal);
    yield { candidates: [{ content: { parts: [{ text: 'ok' }] } }] };
  } } } });
  for await (const _ of provider.stream({ systemPrompt: '', message: 'hi', signal })) { /* consume */ }
});

test('cancelled stream never saves a partial assistant reply', async () => {
  const cancellation = new AbortController(); let saves = 0;
  const service = new ChatService({ create: async () => { saves++; }, findLatestMessages: async () => [] } as any,
    { getMyAI: async () => ({ id: 'a', memory: true }) } as any,
    { async *stream() { yield 'partial'; cancellation.abort(); cancellation.signal.throwIfAborted(); } } as any,
    { retrieve: async () => [] } as any, { save: async () => null } as any);
  await assert.rejects(async () => { for await (const _ of service.sendStream('u', { aiId: 'a', content: 'hi' }, cancellation.signal)) { /* consume */ } });
  assert.equal(saves, 1, 'only user message may already have been saved');
});

test('aborted tool loop does not execute another tool', async () => {
  const cancellation = new AbortController(); let executed = 0;
  const service = new AIChatService({ async chat() { return { text: '' }; }, async *stream() {
    cancellation.abort();
    return { text: '', toolCalls: [{ name: 'calculator', arguments: {} }] };
  } }, { execute: async () => { executed++; return { result: 1 }; } } as any);
  await assert.rejects(async () => { for await (const _ of service.stream({ ai: { id: 'a', name: 'test' } as any, message: 'hi', signal: cancellation.signal })) { /* consume */ } });
  assert.equal(executed, 0);
});
