# Card Components — Detailed Plan

## Overview

Transform the chatbot from plain-text responses into a hybrid chat + portfolio gallery. When users ask about projects, skills, or contact info, the AI signals the UI to render rich card components instead of walls of text.

---

## 1. Signal Format

**Why custom delimiters over JSON:**
- Works character-by-character during streaming
- No JSON parsing edge cases
- Clean regex matching
- Renders as soon as closing `::` arrives

**Signals:**

| Signal | Trigger | Renders |
|--------|---------|---------|
| `::show-projects::` | User asks about projects | ProjectList (grid of all projects) |
| `::project:{id}::` | User asks about specific project | ProjectCard (detail view) |
| `::skills::{category}::` | User asks about skills | SkillCard |
| `::contact::` | User asks for contact info | ContactCard |

**Examples in AI output:**
```
I've built a few things — here's what I've shipped:

::show-projects::

Which one interests you?
```

```
The DLSUD Notion Importer was a pain to build honestly.

::project:dlsud-notion-importer::

Chrome MV3's service worker lifecycle drove me crazy.
```

---

## 2. Component Architecture

```
components/
└── cards/
    ├── ProjectCard.tsx      # Single project detail (README-style)
    ├── ProjectList.tsx      # Grid of all projects
    ├── SkillCard.tsx        # Skill category display
    ├── ContactCard.tsx      # Contact links
    └── CardShell.tsx        # Shared wrapper (border, bg, animation)
```

### 2a. ProjectCard.tsx

**Layout — GitHub README style:**

```
┌──────────────────────────────────────────────────────────────┐
│ [icon] DLSUD Notion Importer                                  │
│ Chrome extension that syncs DLSUD LMS assignments to Notion   │
├──────────────────────────────────────────┬────────────────────┤
│                                          │  About             │
│  ## What it does                         │  ─────             │
│  {project.description}                   │  {project.tags}    │
│                                          │                    │
│  ## What was hard                        │  Tech Stack        │
│  {project.challenges as list}            │  ─────             │
│                                          │  {project.stack}   │
│  ## What I learned                       │                    │
│  {project.whatILearned}                  │  Links             │
│                                          │  ─────             │
│                                          │  GitHub →          │
│                                          │  Live →            │
└──────────────────────────────────────────┴────────────────────┘
```

**Props:**
```typescript
interface ProjectCardProps {
  projectId: string;  // matches PERSONA.projects[].id
}
```

**Data source:** `PERSONA.projects.find(p => p.id === projectId)`

**Sidebar sections:**
- **About** — tags array (e.g., "Browser Extension", "Full-Stack", "Production")
- **Tech Stack** — stack array with icon if available
- **Links** — GitHub URL, live URL (if exists), status badge

**Responsive:** Sidebar collapses below main content on mobile (< 640px)

---

### 2b. ProjectList.tsx

**Layout — Grid of project cards:**

```
┌──────────────────────────────────────────────────────────────┐
│  Projects                                                      │
├──────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │ [icon]          │  │ [icon]          │  │ [icon]          │ │
│  │ DLSUD Notion    │  │ Anxiety         │  │ Hairoscope      │ │
│  │ Importer        │  │ Detection       │  │ Sentiment       │ │
│  │                 │  │                 │  │ Analyzer        │ │
│  │ Browser Ext ·   │  │ Computer Vision │  │ NLP · AI/ML     │ │
│  │ Full-Stack      │  │ · Thesis        │  │                 │ │
│  │                 │  │                 │  │                 │ │
│  │ [View Details]  │  │ [View Details]  │  │ [View Details]  │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
│                                                                  │
│  ┌─────────────────┐  ┌─────────────────┐                      │
│  │ [icon]          │  │ [icon]          │                      │
│  │ Automata Theory │  │ RondeauCo       │                      │
│  │ Visualizer      │  │ RAG Chatbot     │                      │
│  │                 │  │                 │                      │
│  │ Frontend ·      │  │ AI/ML · RAG ·   │                      │
│  │ Education       │  │ Full-Stack      │                      │
│  │                 │  │                 │                      │
│  │ [View Details]  │  │ [View Details]  │                      │
│  └─────────────────┘  └─────────────────┘                      │
└──────────────────────────────────────────────────────────────┘
```

**Props:**
```typescript
interface ProjectListProps {
  onSelect: (projectId: string) => void;
}
```

**Behavior:**
- Renders all projects from `PERSONA.projects`
- Click "View Details" → calls `onSelect(projectId)`
- `onSelect` triggers: inject "tell me about {project}" into chat + scroll to ProjectCard

**Grid:** 3 columns on desktop, 2 on tablet, 1 on mobile

---

### 2c. SkillCard.tsx

**Layout:**

```
┌──────────────────────────────────────────────────────────────┐
│  AI / ML                                                       │
├──────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────┐ │
│  │ OpenCV ··········································· Advanced │ │
│  │ Core tool for thesis and computer vision work             │ │
│  └─────────────────────────────────────────────────────────┘ │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │ MediaPipe ······································· Advanced │ │
│  │ Landmark detection, used heavily in anxiety detection     │ │
│  └─────────────────────────────────────────────────────────┘ │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │ NLP ········································· Intermediate │ │
│  │ Sentiment analysis, text processing pipelines             │ │
│  └─────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
```

**Props:**
```typescript
interface SkillCardProps {
  category: "languages" | "aiml" | "frontend" | "backend" | "tools";
}
```

**Data source:** `PERSONA.skills[category]`

**Level indicators:**
- Advanced: filled bar (100%)
- Intermediate: partial bar (66%)
- Beginner: minimal bar (33%)

---

### 2d. ContactCard.tsx

**Layout:**

```
┌──────────────────────────────────────────────────────────────┐
│  Let's Connect                                                 │
├──────────────────────────────────────────────────────────────┤
│                                                                │
│  Open to work — freelance, part-time, or collaborations.       │
│                                                                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        │
│  │   GitHub     │  │   LinkedIn   │  │    Email     │        │
│  │   Vinzy0     │  │   /in/       │  │   vinz@...   │        │
│  │   [→]        │  │   vincent    │  │   [→]        │        │
│  └──────────────┘  └──────────────┘  └──────────────┘        │
│                                                                │
│  Looking for: scraping, AI/ML integrations, browser            │
│  extensions, chatbots, full-stack builds                       │
│                                                                │
└──────────────────────────────────────────────────────────────┘
```

**Data source:** `PERSONA.links`, `PERSONA.availability`

**Click behavior:** Opens link in new tab (actual `<a>` tags)

---

### 2e. CardShell.tsx

**Shared wrapper for all cards:**
- Glassmorphism background (`rgba(5, 6, 14, 0.45)` + backdrop blur)
- Subtle border (`rgba(255,255,255,0.07)`)
- Rounded corners (16px)
- Fade-in animation on mount
- Hover lift effect on interactive cards

---

## 3. ChatBot.tsx Changes

### 3a. Signal Detection in `renderContent()`

**Current:** Splits by newlines, handles bold markdown

**Updated flow:**
```typescript
function renderContent(text: string) {
  // 1. Split text by signal patterns
  const segments = splitBySignals(text);
  
  // 2. Render each segment
  return segments.map((segment, i) => {
    if (segment.type === "text") {
      return <TextSegment key={i} content={segment.content} />;
    }
    if (segment.type === "signal") {
      return <SignalRenderer key={i} signal={segment.signal} />;
    }
  });
}
```

**`splitBySignals()` logic:**
```typescript
type Segment = 
  | { type: "text"; content: string }
  | { type: "signal"; signal: string };

function splitBySignals(text: string): Segment[] {
  const regex = /::([\w-]+)(?::([\w-]+))?::/g;
  // Split text around signals, preserve signal info
}
```

### 3b. Streaming Considerations

**Problem:** During streaming, `::show-project` is incomplete — we don't know if it's a signal or just text.

**Solution — Buffer approach:**
1. During streaming, render text normally
2. When we detect `::` at the end of accumulated text, mark it as "potential signal"
3. Don't render the `::` yet — buffer it
4. If next chunk completes the signal (e.g., `s::`), render the card
5. If next chunk is not signal-like, flush buffer as plain text

**Implementation:**
```typescript
// In the streaming loop
if (accumulated.endsWith("::")) {
  // Buffer — might be start of signal
  setBufferedSignal("::");
} else if (bufferedSignal) {
  // Check if this completes a signal
  const match = (bufferedSignal + chunk).match(/^([\w-]+)(?::([\w-]+))?::$/);
  if (match) {
    // It's a signal! Render the card
    renderCard(match[1], match[2]);
    setBufferedSignal(null);
  } else {
    // Not a signal — flush buffer as text
    flushBuffer();
  }
}
```

**Simpler alternative:** Only parse signals after streaming completes. Card appears at the end instead of mid-stream. Less fancy but way simpler.

---

## 4. Interaction Flow

### 4a. Project List → Project Card

```
1. User clicks "View Details" on project card in ProjectList
2. onClick handler:
   a. Injects user message: "Tell me about {project.name}"
   b. Scrolls to bottom of chat
   c. Sets pendingProjectId state
3. AI responds with text + ::project:{id}:: signal
4. renderContent detects signal → renders ProjectCard
5. ProjectCard fades in with animation
```

### 4b. Quick Action Chips

**Current chips on page.tsx:**
- "What projects have you built?"
- "What's your tech stack?"
- "Are you available for work?"

**Updated behavior:**
- "What projects have you built?" → sends message, AI responds with `::show-projects::`
- "What's your tech stack?" → sends message, AI responds with `::skills::languages::` or similar
- "Are you available for work?" → sends message, AI responds with `::contact::`

---

## 5. System Prompt Updates

**Add to SYSTEM_PROMPT in route.ts:**

```
## Card Signals
When the user asks about projects, skills, or contact info, use these signals to trigger rich UI components:

- When listing all projects: include ::show-projects:: on its own line
- When discussing a specific project: include ::project:{project-id}:: on its own line
  Valid project IDs: dlsud-notion-importer, anxiety-detection, hairoscope, automata-theory, rondeauco
- When discussing skills by category: include ::skills::{category}:: on its own line
  Valid categories: languages, aiml, frontend, backend, tools
- When sharing contact info: include ::contact:: on its own line

Use signals naturally — don't force them. If someone asks "what have you built?", use ::show-projects::. If they ask about a specific project, use ::project:{id}::.

Always accompany signals with conversational text. Don't just drop a signal with no context.
```

---

## 6. Styling Approach

**Match existing portfolio aesthetic:**
- Dark theme (existing CSS vars: `--bg`, `--ink`, `--ink-muted`)
- Glassmorphism (backdrop blur, semi-transparent backgrounds)
- Hand-drawn/Excalidraw vibe if applicable (from persona interests)
- Yellow accent color (`--yellow`)

**Animations:**
- Cards fade in (opacity 0→1, translateY 10px→0)
- Project list cards stagger (each delayed 50ms)
- Hover effects: slight lift + border glow

**Responsive breakpoints:**
- Desktop (>1024px): Full sidebar layout
- Tablet (768-1024px): Sidebar stacks below content
- Mobile (<768px): Single column, full-width cards

---

## 7. File Changes Summary

| File | Action | Description |
|------|--------|-------------|
| `components/cards/ProjectCard.tsx` | Create | Single project detail (README-style) |
| `components/cards/ProjectList.tsx` | Create | Grid of all projects |
| `components/cards/SkillCard.tsx` | Create | Skill category display |
| `components/cards/ContactCard.tsx` | Create | Contact links |
| `components/cards/CardShell.tsx` | Create | Shared wrapper |
| `components/ChatBot.tsx` | Modify | Add signal detection in renderContent() |
| `app/api/chat/route.ts` | Modify | Update SYSTEM_PROMPT with signal docs |
| `plan.md` | Modify | Mark card components as done |

---

## 8. Open Questions

1. **Streaming approach:** Buffer signals during streaming (fancy) or parse after complete (simple)?
2. **Project images:** Should ProjectCard include a screenshot/thumbnail? Would need to add images to PERSONA data.
3. **Sapture card:** Sapture is in `currentlyBuilding`, not `projects`. Should it get its own card type or be merged into ProjectCard?
4. **Skill visualization:** Bar chart for levels, or just text labels?
5. **Card dismissal:** Can users close/dismiss cards, or do they stay in chat history permanently?

---

## 9. Implementation Order

1. **CardShell.tsx** — Shared wrapper first
2. **ProjectCard.tsx** — Core component, most complex layout
3. **ProjectList.tsx** — Grid wrapper around ProjectCard
4. **Signal detection** — Update renderContent() in ChatBot.tsx
5. **System prompt** — Teach AI about signals
6. **SkillCard.tsx** — Simpler, similar pattern
7. **ContactCard.tsx** — Simplest
8. **Polish** — Animations, responsive, hover effects
9. **Update plan.md** — Mark complete
