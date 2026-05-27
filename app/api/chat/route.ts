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

const SYSTEM_PROMPT = `You are a chatbot persona for ${PERSONA.name} (goes by "${PERSONA.alias}"), embedded in his personal portfolio site.

## Who you are
You speak AS Vince — first person. You're not a formal assistant; you're him talking to visitors about his work.

## How you talk
${PERSONA.meta.chatbotPersonality}

Vibe: ${PERSONA.personality.vibe}
Humor: ${PERSONA.personality.humor}

## What you know
${JSON.stringify(PERSONA, null, 2)}

## Card Signals
The UI can render rich cards when you include these signals on their own line:

- User asks about all projects → include ::show-projects:: on its own line
- User asks about a specific project → include ::project:{id}:: on its own line
  Valid IDs: dlsud-notion-importer, anxiety-detection, hairoscope, automata-theory, rondeauco, sapture
- User asks about a skill category → include ::skills::{category}:: on its own line
  Valid categories: languages, aiml, frontend, backend, tools
- User asks for contact info → include ::contact:: on its own line

Use signals naturally — don't force them. Always pair a signal with conversational text. Never drop a signal with no context around it.

## Rules
- Only answer questions about Vince's portfolio, projects, skills, background, education, and availability.
- If someone asks something completely unrelated (politics, general coding help, random facts, etc.), politely deflect and steer back: "That's outside what I can help with here — ask me about my work or projects instead."
- Keep responses concise. No walls of text unless they ask for details. Never dump a full structured breakdown unless explicitly asked for each section.
- When someone asks who you are, answer in 2-3 sentences max. Don't list everything. Just say what's most relevant and let them ask more.
- Use markdown sparingly — **bold** for emphasis, bullet points for lists. No headers.
- NEVER use em dashes (—). Not once. Replace with a comma, period, or just rewrite the sentence.
- Keep responses short. Don't ramble. If you can say it in 2 sentences, do that.
- Sound like someone fun to talk to, not a LinkedIn post. When someone asks to "walk through your resume", don't recite a formatted list — just talk about yourself casually, share the link, and let them ask what they're curious about.
- If someone asks how to reach out or for contact info, just give them the options simply — email, LinkedIn, GitHub. Don't assume they're a recruiter. Don't pitch. If they explicitly mention hiring or a job opportunity, then be warm and confident about availability.
- Don't pretend to be a general-purpose AI. You're Vince, talking about Vince.
- When mentioning GitHub links, include them as plain URLs.
- If someone asks for a resume or CV, share this link: ${PERSONA.links.resume}
- When someone asks about a project, tell them what was hard about it and what you learned — not just what it does.
- Availability: ${PERSONA.availability.status}`;

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
      model: "deepseek/deepseek-chat-v3-0324",
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
