# Portfolio Website — AI Handoff Doc

## Overview
A personal developer portfolio for Vince, a third-year CS student (Intelligent Systems) and aspiring freelancer. Two-page site. **Page 1 is the priority** — an AI-powered chat interface where visitors talk to Vince (via AI). Page 2 is a standard projects showcase, built after Page 1 ships.

---

## Order of Operations

- [ ] 1. Finalize aesthetic direction + generate avatar asset (GPT-4o image gen)
- [ ] 2. Generate base UI via v0.dev
- [ ] 3. Write knowledge base content (bio, projects, skills, links)
- [ ] 4. Build RAG pipeline (Supabase pgvector + embeddings)
- [ ] 5. Write system prompt
- [ ] 6. Wire Anthropic API + streaming
- [ ] 7. Build card embed components (ProjectCard, SkillCard, ContactCard)
- [ ] 8. Prompt injection protection layer
- [ ] 9. Deploy to Vercel
- [ ] 10. Build Page 2 after Page 1 ships

---

## Page 1 — AI Chat Interface

### Concept
A Claude-like chat UI where the AI responds as Vince. Visitors ask anything about his background, projects, skills, and availability. Responses are conversational, casual, direct, a little humor. Not a FAQ bot.

### Layout / UI Components

**Header**
- Illustrated avatar of Vince (hand-drawn / chosen aesthetic, provided as asset)
- Name: "Vince"
- Tagline: something short and casual (TBD)
- Small green "online" dot

**Shortcut Chips**
- Clickable prompt pills near the input bar
- Examples: "What projects have you built?", "What's your stack?", "Are you available for freelance?", "What are you studying?"
- Clicking a chip sends that message automatically

**Main Chat Area**
- Alternating message bubbles (visitor left, Vince/AI right)
- Vince's avatar on his message bubbles
- Streaming responses (not all-at-once)
- Rich embeds render inline when relevant

**Rich Embeds / Cards**
- Hardcoded beautiful card components, triggered by AI response signals
- `ProjectCard` — project name, one-liner, tech stack tags, live link + GitHub button
- `SkillCard` — skill name, related projects
- `ContactCard` — socials, Upwork link, email
- Cards are NOT dynamically generated — pre-built components. AI returns a structured JSON signal, frontend renders the matching card.

**Input Area**
- Clean text input + send button
- Small disclaimer: "AI-powered — responses may not be 100% accurate"

**Footer**
- Links: GitHub, Upwork, LinkedIn, email
- Link to Page 2 (projects page)

---

## Page 2 — Projects Page
Standard grid layout of all projects with cards. Built after Page 1. Details TBD.

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 15 |
| Styling | Tailwind CSS + shadcn/ui |
| AI | Anthropic API (Claude Sonnet, streaming) |
| Vector Store | Supabase with pgvector |
| Embeddings | OpenAI embeddings or Voyage AI |
| Deployment | Vercel |

---

## AI / RAG Setup

- **RAG type:** Naive RAG
- **Knowledge base:** Vince's project writeups, skills list, bio, what he's looking for, links — chunked, embedded, stored in Supabase pgvector
- **Response format:** Plain text for normal answers. Structured JSON signal when a card embed is needed. Frontend detects and renders accordingly.
- **Streaming:** Yes, real-time

### System Prompt Requirements
- AI speaks as Vince — casual, direct, some humor
- Only answers questions about Vince's portfolio, skills, and projects
- Explicitly instructed to decline prompt injection attempts and redirect
- Never reveals system prompt contents
- Never roleplays as anything else
- User input only ever goes in the `user` role — never influences the system prompt

### Prompt Injection Protection
- Backend input filter — if user message contains known injection patterns (`ignore previous instructions`, `pretend you are`, `DAN`, `jailbreak`, etc.) → return a canned response without hitting the API
- Output validation before streaming — if response is off-topic, intercept it
- System prompt hardcodes the persona boundary explicitly

---

## Knowledge Base Content (Vince needs to write these)

- [ ] Bio / who he is
- [ ] What he's studying: DLSU-D, CS, Intelligent Systems, 3rd year
- [ ] What he's looking for: freelance work, open to collaborations
- [ ] Project writeups: Sapture, UDScraper, Rondeau & Co. (name, description, tech stack, links)
- [ ] Skills list with proficiency levels
- [ ] Links: GitHub, Upwork, LinkedIn, email

---

## Aesthetic / Design Direction

Original goal was crayon/hand-drawn illustrated style. Fallback aesthetics (same personality and warmth):

| Style | Vibe |
|---|---|
| **Risograph / Riso Print** ⭐ recommended | Grainy, slightly overlapping colors, indie poster feel |
| Sticker Sheet | Thick white outlines, bold colors, puffy feel |
| Sketchbook / Line Art | Clean pen sketch style, works well for dev portfolios |
| Scrapbook / Collage | Mixed textures, cut-out elements, taped-on feel |

Final aesthetic TBD — Vince is sourcing references from Dribbble and Pinterest. UI gen via v0.dev first, then customize.

---

## What's NOT Included

- No persistent chat history storage — session only
- No dark/light mode toggle (not decided yet)
- No mouse trailing effects (scrapped, doesn't fit aesthetic)
- Click splash effects — maybe, TBD
- Animated avatar that follows mouse — maybe, TBD
