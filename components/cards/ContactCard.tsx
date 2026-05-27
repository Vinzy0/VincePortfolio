"use client";

import CardShell from "./CardShell";
import { PERSONA } from "@/lib/persona";

const LINKS = [
  { label: "GitHub", handle: "Vinzy0", url: PERSONA.links.github },
  { label: "LinkedIn", handle: "vincentpedres", url: PERSONA.links.linkedin },
  { label: "Email", handle: "vinzpedres@gmail.com", url: `mailto:${PERSONA.links.email}` },
];

export default function ContactCard() {
  return (
    <CardShell>
      <div style={{ padding: "20px 22px" }}>
        <div style={{ fontFamily: "var(--font)", fontWeight: 700, fontSize: "1rem", color: "var(--ink)", marginBottom: "4px" }}>
          Let&apos;s Connect
        </div>
        <div style={{ fontFamily: "var(--font)", fontSize: "0.82rem", color: "var(--ink-muted)", lineHeight: 1.5, marginBottom: "18px" }}>
          {PERSONA.availability.status}
        </div>

        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "18px" }}>
          {LINKS.map(({ label, handle, url }) => (
            <a
              key={label}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "5px",
                padding: "12px 16px",
                background: "rgba(232,230,240,0.04)",
                border: "1px solid rgba(232,230,240,0.08)",
                borderRadius: "12px",
                textDecoration: "none",
                flex: "1 1 120px",
                transition: "border-color 0.2s, background 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "rgba(224,192,64,0.35)";
                e.currentTarget.style.background = "rgba(224,192,64,0.05)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "rgba(232,230,240,0.08)";
                e.currentTarget.style.background = "rgba(232,230,240,0.04)";
              }}
            >
              <span style={{ fontSize: "0.7rem", fontFamily: "var(--font)", color: "var(--ink-muted)", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase" }}>
                {label}
              </span>
              <span style={{ fontSize: "0.82rem", fontFamily: "var(--font)", color: "var(--ink)", fontWeight: 600 }}>
                {handle} ↗
              </span>
            </a>
          ))}
        </div>

        <div style={{ fontFamily: "var(--font)", fontSize: "0.78rem", color: "var(--ink-muted)", lineHeight: 1.6 }}>
          Looking for: frontend, backend, full-stack builds, AI/ML, scraping, browser extensions, chatbots
        </div>
      </div>
    </CardShell>
  );
}
