"use client";

import CardShell from "./CardShell";
import { PERSONA } from "@/lib/persona";

type SkillCategory = "languages" | "aiml" | "frontend" | "backend" | "tools";

const CATEGORY_LABELS: Record<SkillCategory, string> = {
  languages: "Languages",
  aiml: "AI / ML",
  frontend: "Frontend",
  backend: "Backend",
  tools: "Tools & Infra",
};

const LEVEL_WIDTH: Record<string, string> = {
  advanced: "100%",
  intermediate: "66%",
  beginner: "33%",
};

export default function SkillCard({ category }: { category: SkillCategory }) {
  const skills = PERSONA.skills[category];

  return (
    <CardShell>
      <div style={{ padding: "20px 22px" }}>
        <div style={{ fontFamily: "var(--font)", fontWeight: 700, fontSize: "1rem", color: "var(--ink)", marginBottom: "16px" }}>
          {CATEGORY_LABELS[category]}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {skills.map((skill) => (
            <div
              key={skill.name}
              style={{
                padding: "12px 14px",
                background: "rgba(232,230,240,0.03)",
                border: "1px solid rgba(232,230,240,0.06)",
                borderRadius: "10px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
                <span style={{ fontFamily: "var(--font)", fontWeight: 600, fontSize: "0.875rem", color: "var(--ink)" }}>
                  {skill.name}
                </span>
                <span style={{ fontFamily: "var(--font)", fontSize: "0.7rem", color: "var(--ink-muted)", textTransform: "capitalize" }}>
                  {skill.level}
                </span>
              </div>
              <div style={{ height: "2px", background: "rgba(232,230,240,0.08)", borderRadius: "2px", marginBottom: "8px" }}>
                <div style={{
                  height: "100%",
                  width: LEVEL_WIDTH[skill.level] ?? "50%",
                  background: "var(--yellow)",
                  borderRadius: "2px",
                  opacity: 0.65,
                }} />
              </div>
              <div style={{ fontFamily: "var(--font)", fontSize: "0.78rem", color: "var(--ink-muted)", lineHeight: 1.5 }}>
                {skill.note}
              </div>
            </div>
          ))}
        </div>
      </div>
    </CardShell>
  );
}
