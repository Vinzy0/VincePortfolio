# Portfolio Build Plan

## Phase 1 — Content ✅ DONE

## Phase 2 — Core AI ✅ DONE

- [x] Swap regex → streaming API
  - OpenRouter + DeepSeek via OpenAI-compatible SDK. Streaming SSE in `app/api/chat/route.ts`.

- [x] Knowledge base
  - Single source of truth: `lib/persona.ts`. Imported by both `route.ts` and `scripts/embed.ts`.

- [x] Set up Supabase + pgvector
  - Supabase project created, pgvector enabled, `documents` table with `embedding vector(3072)`.

- [x] Embed knowledge base → Supabase
  - Google Gemini embeddings (gemini-embedding-001, 3072 dimensions). 13 chunks: bio, availability, 5 projects, Sapture, 5 skill categories.

- [x] Write / polish system prompt
  - Injects `meta.chatbotPersonality`, `personality.vibe`, `personality.humor`. Fixed `availability` object reference.

- [x] Wire RAG into `app/api/chat/route.ts`
  - Embed query via Google Gemini → similarity search Supabase → inject top results as context into system prompt.

## Phase 3 — Features

- [x] Prompt injection protection ✅ DONE
  - Input sanitization (1000 char cap, regex patterns for injection attempts)
  - RAG chunk sanitization (strips injection patterns from retrieved docs)
  - Structural separation (system prompt hardcoded, RAG in `<documents>` delimiters)
  - Rate limiting (100 requests/hr per IP, in-memory store)
  - Only user turns sanitized in history, assistant turns untouched

- [ ] ProjectCard, SkillCard, ContactCard components
  - Structured card components the chatbot can render inline when projects, skills, or contact info is mentioned.

- [ ] JSON signal detection
  - Detect when the AI responds with a JSON payload (e.g. `{ type: "project", id: "..." }`) and render the matching card component instead of plain text.

## Phase 4 — Ship

- [ ] Deploy portfolio to Vercel
  - Deploy this Next.js site with all env vars wired up (OpenRouter key, Supabase URL + anon key, Google AI key).

- [ ] Build Page 2
  - Second page of the portfolio (content TBD).

- [ ] Deploy Automata-Theory to Vercel (separate project)
  - Push the standalone React/Vite app to its own Vercel project. Unrelated to portfolio — can be done anytime.
