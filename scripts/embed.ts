/**
 * One-time script to chunk PERSONA data and embed into Supabase pgvector.
 *
 * Usage:
 *   npx tsx scripts/embed.ts
 *
 * Requires env vars: GOOGLE_API_KEY, SUPABASE_URL, SUPABASE_ANON_KEY
 *
 * To update knowledge base:
 *   1. Edit lib/persona.ts
 *   2. Run: npx tsx scripts/embed.ts
 */

import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

import { createClient } from "@supabase/supabase-js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { PERSONA } from "../lib/persona";

// ── Config ──────────────────────────────────────────────────────────────────

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

const EMBEDDING_MODEL = "gemini-embedding-001";
const EMBEDDING_DIMENSIONS = 3072;

// ── Chunking ────────────────────────────────────────────────────────────────

interface Chunk {
  content: string;
  metadata: {
    type: string;
    id?: string;
    name?: string;
  };
}

function chunkPersona(): Chunk[] {
  const chunks: Chunk[] = [];

  // Bio chunk
  chunks.push({
    content: `About Vince: ${PERSONA.bio}\n\nEducation: ${PERSONA.education}\nLocation: ${PERSONA.location}\nCurrently studying: ${PERSONA.currentCourses.join(", ")}`,
    metadata: { type: "bio", name: "About Vince" },
  });

  // Availability chunk
  chunks.push({
    content: `Availability: ${PERSONA.availability.status}\n\nWhat he's looking for: ${PERSONA.availability.specifics}\n\nContact: Email ${PERSONA.links.email}, GitHub ${PERSONA.links.github}, LinkedIn ${PERSONA.links.linkedin}`,
    metadata: { type: "availability", name: "Availability & Contact" },
  });

  // Project chunks (one per project)
  for (const project of PERSONA.projects) {
    chunks.push({
      content: `Project: ${project.name}\n\n${project.description}\n\nRole: ${project.role}\n\nStack: ${project.stack.join(", ")}\n\nChallenges:\n- ${project.challenges.join("\n- ")}\n\nWhat I learned: ${project.whatILearned}\n\nStatus: ${project.status}\nGitHub: ${project.github}`,
      metadata: { type: "project", id: project.id, name: project.name },
    });
  }

  // Currently building chunk
  chunks.push({
    content: `Currently building: ${PERSONA.currentlyBuilding.name}\n\n${PERSONA.currentlyBuilding.description}\n\nStatus: ${PERSONA.currentlyBuilding.status}\nStack: ${PERSONA.currentlyBuilding.stack.join(", ")}\nGitHub: ${PERSONA.currentlyBuilding.github}`,
    metadata: {
      type: "project",
      id: "sapture",
      name: PERSONA.currentlyBuilding.name,
    },
  });

  // Skills chunks (grouped by category)
  const skillCategories = {
    languages: "Programming Languages",
    aiml: "AI/ML & Computer Vision",
    frontend: "Frontend Development",
    backend: "Backend Development",
    tools: "Tools & Platforms",
  };

  for (const [key, label] of Object.entries(skillCategories)) {
    const skills =
      PERSONA.skills[key as keyof typeof PERSONA.skills];
    const skillList = skills
      .map((s) => `${s.name} (${s.level})`)
      .join(", ");
    chunks.push({
      content: `${label}: ${skillList}`,
      metadata: { type: "skills", name: label },
    });
  }

  return chunks;
}

// ── Embedding ───────────────────────────────────────────────────────────────

async function embed(text: string): Promise<number[]> {
  const model = genAI.getGenerativeModel({ model: EMBEDDING_MODEL });
  const result = await model.embedContent(text);
  return result.embedding.values;
}

// ── Main ────────────────────────────────────────────────────────────────────

async function main() {
  console.log("Chunking PERSONA data...");
  const chunks = chunkPersona();
  console.log(`Created ${chunks.length} chunks\n`);

  // Clear existing documents
  console.log("Clearing existing documents...");
  const { error: deleteError } = await supabase
    .from("documents")
    .delete()
    .neq("id", "00000000-0000-0000-0000-000000000000"); // delete all

  if (deleteError) {
    console.error("Error clearing documents:", deleteError);
    process.exit(1);
  }

  // Embed and insert each chunk
  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    console.log(
      `[${i + 1}/${chunks.length}] Embedding: ${chunk.metadata.name}...`
    );

    const embedding = await embed(chunk.content);

    const { error: insertError } = await supabase.from("documents").insert({
      content: chunk.content,
      metadata: chunk.metadata,
      embedding,
    });

    if (insertError) {
      console.error(`  Error inserting: ${insertError.message}`);
    } else {
      console.log(`  ✓ Done`);
    }
  }

  console.log("\nAll done! Knowledge base embedded.");
}

main().catch(console.error);
