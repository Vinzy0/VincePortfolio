import { NextRequest } from "next/server";
import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { PERSONA } from "@/lib/persona";
import { sanitizeInput, sanitizeChunks } from "@/lib/sanitize";
import { checkRateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

interface Message {
  role: "user" | "assistant";
  content: string;
}

function getClient() {
  return new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: process.env.OPENROUTER_API_KEY,
    timeout: 30 * 1000,
    defaultHeaders: {
      "HTTP-Referer": "https://vincepedres.com",
      "X-Title": "Vince Pedres Portfolio",
    },
  });
}

function getSupabase() {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!
  );
}

function getGenAI() {
  return new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);
}

// ── RAG Functions ───────────────────────────────────────────────────────────

async function embedQuery(text: string): Promise<number[]> {
  const model = getGenAI().getGenerativeModel({ model: "gemini-embedding-001" });
  const result = await model.embedContent(text);
  return result.embedding.values;
}

async function searchKnowledgeBase(query: string): Promise<string[]> {
  const embedding = await embedQuery(query);

  const { data, error } = await getSupabase().rpc("match_documents", {
    query_embedding: embedding,
    match_threshold: 0.3,
    match_count: 5,
  });

  if (error) {
    console.error("RAG search error:", error);
    return [];
  }

  return data?.map((doc: { content: string }) => doc.content) ?? [];
}

// ── System Prompt ───────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are ${PERSONA.name} ("${PERSONA.alias}"), talking to visitors on your portfolio site. First person. You're not an AI assistant — you're just a dev chatting about your work.

## How you talk
${PERSONA.meta.chatbotPersonality}

## Rules
- Only talk about Vince's portfolio, projects, skills, background, education, and availability.
- Off-topic? Steer back: "That's outside what I can help with here — ask me about my work or projects instead."
- 1-3 sentences max unless they ask for details. No walls of text.
- Em dashes are banned. Use commas, periods, or restructure the sentence.
- No headers. Bold for emphasis only when needed.
- Sound like someone fun to talk to, not a LinkedIn post.
- Don't assume they're a recruiter. If they ask for contact info, just give it simply.
- When mentioning a project, say what was hard or cool about it — not just what it does. Mention real outcomes if you have them (shipped to production, live users, etc.).
- If they ask for resume: ${PERSONA.links.resume}
- Availability: ${PERSONA.availability.status}
- If someone mentions hiring or a gig, then be warm and confident about availability. Otherwise just be yourself and let the work speak.

## Card Signals
The UI renders interactive cards. Use these instead of typing out lists.

- Projects (any, all, what you've built) → ::show-projects::
- Specific project → ::project:{id}::
  IDs: dlsud-notion-importer, anxiety-detection, hairoscope, automata-theory, rondeauco, sapture
- Skills/tech stack → ::skills::{category}::
  Categories: languages, aiml, frontend, backend, tools
  Broad question? Drop all 5 signals.
- Contact info → ::contact::

One signal per line. One short sentence before or after. Never type out lists when a signal works.

## Your data
${JSON.stringify(PERSONA, null, 2)}`;

export async function POST(req: NextRequest) {
  try {
    // ── Rate Limiting ─────────────────────────────────────────────────────
    const ip = req.headers.get("x-forwarded-for") || 
               req.headers.get("x-real-ip") || 
               "unknown";
    
    const { allowed, remaining, resetAt } = checkRateLimit(ip);
    
    if (!allowed) {
      return new Response("Slow down — too many requests. Try again later.", {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil((resetAt - Date.now()) / 1000)),
          "X-RateLimit-Remaining": "0",
        },
      });
    }

    // ── Parse & Validate Input ────────────────────────────────────────────
    const { messages }: { messages: Message[] } = await req.json();
    
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response("No messages provided.", { status: 400 });
    }

    // Get and sanitize the user's latest message
    const rawMessage = messages[messages.length - 1]?.content || "";
    const userMessage = sanitizeInput(rawMessage);

    if (!userMessage) {
      return new Response("Message is empty or invalid.", { status: 400 });
    }

    // ── RAG Search (with sanitized input) ─────────────────────────────────
    const rawChunks = await searchKnowledgeBase(userMessage);
    const contextChunks = sanitizeChunks(rawChunks);

    // Build the user message with RAG context in delimiters
    const userContent = contextChunks.length > 0
      ? `<documents>\n${contextChunks.join("\n\n")}\n</documents>\n\nQuestion: ${userMessage}`
      : userMessage;

    // ── Build Messages Array ──────────────────────────────────────────────
    const stream = await getClient().chat.completions.create({
      model: "anthropic/claude-3.5-haiku",
      max_tokens: 512,
      stream: true,
      messages: [
        // System prompt stays hardcoded (trusted)
        { role: "system", content: SYSTEM_PROMPT },
        // Conversation history — only sanitize user turns
        ...messages.slice(0, -1).map((m) => ({
          role: m.role,
          content: m.role === "user" ? sanitizeInput(m.content) : m.content,
        })),
        // Latest user message with RAG context
        { role: "user", content: userContent },
      ],
    });

    // ── Stream Response ───────────────────────────────────────────────────
    const readable = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        for await (const chunk of stream) {
          const text = chunk.choices[0]?.delta?.content;
          if (text) controller.enqueue(encoder.encode(text));
        }
        controller.close();
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
        "X-Content-Type-Options": "nosniff",
        "X-RateLimit-Remaining": String(remaining),
      },
    });
  } catch (err: any) {
    console.error("Chat API error:", err?.message || err);
    return new Response(
      err?.message || "Something glitched on my end — try again!",
      { status: 500 }
    );
  }
}
