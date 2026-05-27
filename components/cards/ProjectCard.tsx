"use client";

import { useState } from "react";
import CardShell from "./CardShell";
import { PERSONA } from "@/lib/persona";

interface UnifiedProject {
  id: string;
  name: string;
  oneliner: string;
  description: string;
  stack: string[];
  tags?: string[];
  status: string;
  github: string;
  live?: string | null;
  challenges?: string[];
  whatILearned?: string;
  isCurrent?: boolean;
}

function getProject(id: string): UnifiedProject | null {
  if (id === "sapture") {
    return { id: "sapture", isCurrent: true, ...PERSONA.currentlyBuilding };
  }
  return PERSONA.projects.find((p) => p.id === id) ?? null;
}

export default function ProjectCard({ projectId, defaultExpanded = false }: { projectId: string; defaultExpanded?: boolean }) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const project = getProject(projectId);

  if (!project) return null;

  return (
    <CardShell>
      {/* Compact header — always visible, click to expand */}
      <button
        onClick={() => setExpanded((e) => !e)}
        style={{
          width: "100%",
          textAlign: "left",
          background: "transparent",
          border: "none",
          padding: "18px 22px",
          cursor: "pointer",
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: "12px",
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "5px", flexWrap: "wrap" }}>
            <span style={{ fontFamily: "var(--font)", fontWeight: 700, fontSize: "0.95rem", color: "var(--ink)" }}>
              {project.name}
            </span>
            {project.isCurrent && (
              <span style={{
                fontSize: "0.62rem", fontFamily: "var(--font)", fontWeight: 700,
                padding: "2px 8px", borderRadius: "100px",
                background: "rgba(224,192,64,0.12)", color: "var(--yellow)",
                border: "1px solid rgba(224,192,64,0.2)", letterSpacing: "0.05em", textTransform: "uppercase",
              }}>
                Building
              </span>
            )}
          </div>
          <div style={{ fontFamily: "var(--font)", fontSize: "0.82rem", color: "var(--ink-muted)", lineHeight: 1.5, marginBottom: "10px" }}>
            {project.oneliner}
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
            {(project.tags ?? project.stack.slice(0, 3)).map((t) => (
              <span key={t} style={{
                fontSize: "0.68rem", fontFamily: "var(--font)", fontWeight: 500,
                padding: "2px 8px", borderRadius: "100px",
                background: "rgba(224,192,64,0.07)", color: "rgba(224,192,64,0.6)",
                border: "1px solid rgba(224,192,64,0.12)",
              }}>
                {t}
              </span>
            ))}
          </div>
        </div>
        <span style={{
          color: "var(--ink-muted)", fontSize: "0.85rem", flexShrink: 0, marginTop: "2px",
          transition: "transform 0.2s", transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
          display: "inline-block",
        }}>
          ↓
        </span>
      </button>

      {/* Expanded detail */}
      {expanded && (
        <div style={{
          borderTop: "1px solid rgba(232,230,240,0.06)",
          padding: "18px 22px 20px",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
        }}>
          <p style={{ fontFamily: "var(--font)", fontSize: "0.855rem", color: "var(--ink-muted)", lineHeight: 1.65, margin: 0 }}>
            {project.description}
          </p>

          {project.challenges && project.challenges.length > 0 && (
            <div>
              <div style={{ fontFamily: "var(--font)", fontSize: "0.72rem", fontWeight: 700, color: "var(--ink)", letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: "8px" }}>
                What was hard
              </div>
              <ul style={{ margin: 0, paddingLeft: "16px", display: "flex", flexDirection: "column", gap: "5px" }}>
                {project.challenges.map((c, i) => (
                  <li key={i} style={{ fontFamily: "var(--font)", fontSize: "0.82rem", color: "var(--ink-muted)", lineHeight: 1.55 }}>
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {project.whatILearned && (
            <div>
              <div style={{ fontFamily: "var(--font)", fontSize: "0.72rem", fontWeight: 700, color: "var(--ink)", letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: "6px" }}>
                What I learned
              </div>
              <p style={{ fontFamily: "var(--font)", fontSize: "0.82rem", color: "var(--ink-muted)", lineHeight: 1.55, margin: 0 }}>
                {project.whatILearned}
              </p>
            </div>
          )}

          <div>
            <div style={{ fontFamily: "var(--font)", fontSize: "0.72rem", fontWeight: 700, color: "var(--ink)", letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: "8px" }}>
              Stack
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
              {project.stack.map((s) => (
                <span key={s} style={{
                  fontSize: "0.72rem", fontFamily: "var(--font)", fontWeight: 500,
                  padding: "3px 10px", borderRadius: "6px",
                  background: "rgba(232,230,240,0.06)", color: "var(--ink-muted)",
                  border: "1px solid rgba(232,230,240,0.08)",
                }}>
                  {s}
                </span>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            <a
              href={project.github}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontFamily: "var(--font)", fontSize: "0.82rem", fontWeight: 600,
                color: "var(--yellow)", textDecoration: "none", padding: "6px 14px",
                border: "1px solid rgba(224,192,64,0.25)", borderRadius: "8px",
                background: "rgba(224,192,64,0.06)", transition: "background 0.2s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(224,192,64,0.12)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(224,192,64,0.06)"; }}
            >
              GitHub ↗
            </a>
            {project.live && (
              <a
                href={project.live}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontFamily: "var(--font)", fontSize: "0.82rem", fontWeight: 600,
                  color: "var(--ink)", textDecoration: "none", padding: "6px 14px",
                  border: "1px solid rgba(232,230,240,0.12)", borderRadius: "8px",
                  background: "rgba(232,230,240,0.04)", transition: "background 0.2s",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(232,230,240,0.08)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(232,230,240,0.04)"; }}
              >
                Live ↗
              </a>
            )}
          </div>
        </div>
      )}
    </CardShell>
  );
}
