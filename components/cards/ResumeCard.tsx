"use client";

import CardShell from "./CardShell";
import { PERSONA } from "@/lib/persona";

export default function ResumeCard() {
  return (
    <CardShell>
      <div style={{ padding: "20px 22px" }}>
        <div style={{ fontFamily: "var(--font)", fontWeight: 700, fontSize: "1rem", color: "var(--ink)", marginBottom: "4px" }}>
          Resume
        </div>
        <div style={{ fontFamily: "var(--font)", fontSize: "0.82rem", color: "var(--ink-muted)", lineHeight: 1.5, marginBottom: "18px" }}>
          {PERSONA.education}
        </div>

        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "18px" }}>
          {PERSONA.focus.map((item) => (
            <span
              key={item}
              style={{
                padding: "6px 12px",
                background: "rgba(232,230,240,0.04)",
                border: "1px solid rgba(232,230,240,0.08)",
                borderRadius: "8px",
                fontFamily: "var(--font)",
                fontSize: "0.75rem",
                color: "var(--ink-muted)",
                fontWeight: 600,
                letterSpacing: "0.03em",
              }}
            >
              {item}
            </span>
          ))}
        </div>

        <a
          href={PERSONA.links.resume}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            padding: "10px 18px",
            background: "rgba(224,192,64,0.1)",
            border: "1px solid rgba(224,192,64,0.25)",
            borderRadius: "10px",
            fontFamily: "var(--font)",
            fontSize: "0.82rem",
            color: "var(--ink)",
            fontWeight: 600,
            textDecoration: "none",
            transition: "border-color 0.2s, background 0.2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "rgba(224,192,64,0.5)";
            e.currentTarget.style.background = "rgba(224,192,64,0.15)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "rgba(224,192,64,0.25)";
            e.currentTarget.style.background = "rgba(224,192,64,0.1)";
          }}
        >
          View Resume ↗
        </a>
      </div>
    </CardShell>
  );
}
