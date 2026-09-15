# Backend progress — 2026-09-12

## Completed

- Gemini uses AUTO tool selection for ordinary and streaming chat.
- Both flows execute tools and preserve the original message, all tool turns, call IDs, and thought signatures.
- System instructions use the SDK systemInstruction field.
- Tool execution is bounded to three rounds; empty responses and exhausted loops raise errors.
- Streaming continues after tool results and still emits JSON string SSE chunks followed by [DONE]. Failures emit an `event: error` with a JSON message and no [DONE].
- test-stream.html displays streaming errors.
- Cross-account access: AI detail now checks ownership; AI create/update only accepts allowed configuration fields. Registration/profile updates cannot pass nested Prisma relations or ownership/role fields. Chat access denials return 403, including before opening SSE.

## Verification

- `npm test`: offline regression tests using mocked Gemini responses and real calculator execution.
- `npx tsc --noEmit`: TypeScript validation.
- `npx tsx scripts/smoke-tools.ts`: opt-in live Gemini test using the configured API key (may incur API usage); no database access. Both chat and streaming called calculator once and returned 420000. Streaming returned two text chunks in the observed run.
- `npx tsx scripts/smoke-http.ts`: live HTTP integration against an ephemeral localhost server, configured MySQL database, and Gemini. Verified health, missing-token rejection, registration, wrong-password rejection, login/JWT, and AI creation. Both send and stream persisted exact replies and extracted memories with memory ON. Both used sessionHistory without database writes when the request overrode memory to OFF. Recall succeeded after deleting chat history while retaining long-term memories. The randomly named test account and cascading test data were removed. Results: `scripts/http-smoke-result.json`.

## Remaining

- Further cases: AI-level memory OFF defaults, provider failures, and concurrent requests.
- Stream cancellation.
- Tools are implemented for the active Gemini provider. Grok remains text-only.

Reference for preserving model parts and signatures: https://ai.google.dev/gemini-api/docs/generate-content/thought-signatures

## Cross-account verification — 2026-09-12

- `npx tsx scripts/test-access.ts`: real local HTTP/JWT/MySQL with a deterministic mock AI provider (no external AI requests). Two temporary accounts tested in both directions: 22 denied requests covering AI detail/update/delete, chat history read/delete, send/stream with memory ON/OFF, and regeneration with mismatched AI/message IDs. Every denial returned 403 JSON, left the target AI/messages/memories unchanged, and never called the provider.
- Owner read/send/stream continued working with only the owner's history and memory. Creation/update/profile body attacks could not move ownership or attach foreign records; owner AI deletion succeeded.
- There is currently no public memory CRUD route. Memory isolation was checked through chat retrieval/persistence and nested relation injection attempts.
- Both test accounts and their cascading test records were cleaned up. Machine-readable result: `scripts/access-test-result.json`.
- All 19 offline regression tests passed; TypeScript validation passed.

## API error handling — 2026-09-12

- Shared error responses retain `{ success: false, message }`; validation adds `issues` with field paths. Unknown errors return a generic 500 without database/provider details.
- Status mapping: invalid input/JSON 400, credentials 401, ownership 403, missing data/routes 404, duplicate resources/AI limit 409, oversized body 413. Provider rate limits use 429, unavailable service 503, reported timeouts 504, and other provider failures/empty replies/tool-loop exhaustion 502. No automatic retry was added.
- Register/login/profile/password inputs are validated. `/api/ai/test` now requires `{ aiId, message }` and resolves the authenticated owner's AI instead of passing an invalid string to the chat service.
- Streaming waits for its first chunk before committing SSE headers. Early failures return JSON and the proper HTTP status; late failures emit `event: error` with the same error body and no `[DONE]`. Existing text chunks and successful `[DONE]` remain unchanged.
- Validation: 26 offline tests passed, including HTTP error cases with mocked services/providers; TypeScript and diff checks passed. Real HTTP/JWT/MySQL cross-account tests were rerun and passed; temporary accounts were cleaned up. Provider outages were simulated, not induced against Gemini.

## Cancellation and connected frontend — verified 2026-09-14

- AbortSignal propagates from client disconnect through chat service/tool loop to Gemini SDK and Grok fetch. Cancelled assistant responses are not persisted; an already saved user message may remain.
- Connected login/register, AI list/create, history, streaming, persisted memory toggle, session history for memory OFF, Stop, and logout are available on the Chat page. Existing other pages remain demo UI.
- Revalidation: frontend production build passed; backend TypeScript passed; all 31 backend tests passed, including disconnect before/after first chunk, SDK signal propagation, and no partial assistant persistence.
- Browser test using local API and Gemini passed: login, AI creation, calculator answer 420000, Stop, history reload without cancelled assistant reply, memory OFF response, logout. Database checks confirmed only the completed reply persisted and the memory-OFF exchange was absent. Test account cleaned up.
- Development: run npm run dev in backend and frontend, then open http://127.0.0.1:5173. Vite proxies /api to port 3000; production can use VITE_API_BASE_URL or an /api reverse proxy. Token storage uses sessionStorage.

## Supabase preparation — 2026-09-14

Active Prisma provider is now PostgreSQL; MySQL schema/migrations archived under prisma/legacy-mysql. Fresh PostgreSQL migration includes RLS on all four application tables. Existing app authentication stays in Express. No MySQL data imported/deleted. Schema validation, client generation and TypeScript passed with placeholder URLs. Project creation and backend/.env DATABASE_URL + DIRECT_URL are still required before prisma:deploy and remote integration tests; see SUPABASE.md. Backend dev server stopped for Prisma client regeneration.
