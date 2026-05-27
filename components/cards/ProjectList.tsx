"use client";

import { useState } from "react";
import CardShell from "./CardShell";
import ProjectCard from "./ProjectCard";
import { PERSONA } from "@/lib/persona";

const ALL_PROJECTS = [
  ...PERSONA.projects.map((p) => ({
    id: p.id,
    name: p.name,
    oneliner: p.oneliner,
    tags: p.tags as string[],
    isCurrent: false,
  })),
  {
    id: "sapture",
    name: PERSONA.currentlyBuilding.name,
    oneliner: PERSONA.currentlyBuilding.oneliner,
    tags: PERSONA.currentlyBuilding.stack.slice(0, 2),
    isCurrent: true,
  },
];

export default function ProjectList() {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  if (selectedId) {
    return (
      <div style={{ width: "100%" }}>
        <button
          onClick={() => setSelectedId(null)}
          style={{
            background: "transparent", border: "none", cursor: "pointer",
            fontFamily: "var(--font)", fontSize: "0.8rem", color: "var(--ink-muted)",
            padding: "0 0 8px", display: "flex", alignItems: "center", gap: "5px",
          }}
        >
          ← All projects
        </button>
        <ProjectCard projectId={selectedId} defaultExpanded />
      </div>
    );
  }

  return (
    <CardShell>
      <div style={{ padding: "18px 22px" }}>
        <div style={{ fontFamily: "var(--font)", fontWeight: 700, fontSize: "1rem", color: "var(--ink)", marginBottom: "14px" }}>
          Projects
        </div>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(190px, 1fr))",
          gap: "10px",
        }}>
          {ALL_PROJECTS.map((p, i) => (
            <button
              key={p.id}
              onClick={() => setSelectedId(p.id)}
              style={{
                textAlign: "left",
                background: "rgba(232,230,240,0.03)",
                border: "1px solid rgba(232,230,240,0.07)",
                borderRadius: "12px",
                padding: "14px 16px",
                cursor: "pointer",
                transition: "border-color 0.2s, background 0.2s, transform 0.2s",
                animation: `cardStagger 0.3s ease ${i * 50}ms both`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "rgba(224,192,64,0.35)";
                e.currentTarget.style.background = "rgba(224,192,64,0.04)";
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "rgba(232,230,240,0.07)";
                e.currentTarget.style.background = "rgba(232,230,240,0.03)";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "5px", flexWrap: "wrap" }}>
                <span style={{ fontFamily: "var(--font)", fontWeight: 700, fontSize: "0.84rem", color: "var(--ink)" }}>
                  {p.name}
                </span>
                {p.isCurrent && (
                  <span style={{
                    fontSize: "0.6rem", fontFamily: "var(--font)", fontWeight: 700,
                    padding: "1px 6px", borderRadius: "100px",
                    background: "rgba(224,192,64,0.12)", color: "var(--yellow)",
                    border: "1px solid rgba(224,192,64,0.2)", letterSpacing: "0.05em", textTransform: "uppercase",
                  }}>
                    Building
                  </span>
                )}
              </div>
              <div style={{ fontFamily: "var(--font)", fontSize: "0.76rem", color: "var(--ink-muted)", lineHeight: 1.5, marginBottom: "10px" }}>
                {p.oneliner}
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginBottom: "10px" }}>
                {p.tags.slice(0, 2).map((t) => (
                  <span key={t} style={{
                    fontSize: "0.63rem", fontFamily: "var(--font)", fontWeight: 500,
                    padding: "2px 7px", borderRadius: "100px",
                    background: "rgba(224,192,64,0.07)", color: "rgba(224,192,64,0.6)",
                    border: "1px solid rgba(224,192,64,0.12)",
                  }}>
                    {t}
                  </span>
                ))}
              </div>
              <div style={{ fontFamily: "var(--font)", fontSize: "0.74rem", color: "rgba(224,192,64,0.5)", fontWeight: 600 }}>
                View details →
              </div>
            </button>
          ))}
        </div>
      </div>
      <style>{`
        @keyframes cardStagger {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </CardShell>
  );
}
