"use client";

import { useEffect, useRef, useState } from "react";

interface ProjectNoteProps {
  title: string;
  description: string;
  tags?: string[];
  bgColor?: string;
  tiltClass?: string;
  onAskAbout?: (question: string) => void;
}

export default function ProjectNote({
  title,
  description,
  tags = [],
  bgColor = "#caffbf",
  tiltClass = "",
  onAskAbout,
}: ProjectNoteProps) {
  const [wiredLoaded, setWiredLoaded] = useState(false);
  const cardRef = useRef<HTMLElement>(null);

  // Map light colors to dark mode variants
  const darkBgMap: Record<string, string> = {
    "#caffbf": "rgba(42, 90, 58, 0.6)",
    "#ffd6a5": "rgba(106, 74, 42, 0.6)",
    "#e0c3fc": "rgba(74, 42, 106, 0.6)",
  };
  const darkBg = darkBgMap[bgColor] || "var(--bg-card)";

  // Pin accent colors
  const pinColorMap: Record<string, string> = {
    "#caffbf": "#4ae070",
    "#ffd6a5": "#e0a050",
    "#e0c3fc": "#a050e0",
  };
  const pinColor = pinColorMap[bgColor] || "#e05080";

  useEffect(() => {
    import("wired-elements").then(() => setWiredLoaded(true)).catch(() => setWiredLoaded(false));
  }, []);

  const cardContent = (
    <div
      style={{
        padding: "16px 18px 14px",
        fontFamily: "var(--font-caveat, 'Caveat', cursive)",
        maxWidth: "200px",
      }}
    >
      {/* pin */}
      <div
        style={{
          width: "14px",
          height: "14px",
          borderRadius: "50%",
          background: pinColor,
          border: "2px solid rgba(232,230,240,0.35)",
          margin: "0 auto 10px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.4)",
        }}
      />
      <h3
        style={{
          fontSize: "1.15rem",
          fontWeight: 700,
          marginBottom: "6px",
          lineHeight: 1.2,
          color: "var(--ink)",
        }}
      >
        {title}
      </h3>
      <p
        style={{
          fontSize: "0.95rem",
          color: "rgba(232,230,240,0.75)",
          lineHeight: 1.4,
          marginBottom: "10px",
        }}
      >
        {description}
      </p>
      {tags.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginBottom: "10px" }}>
          {tags.map((t) => (
            <span
              key={t}
              style={{
                fontSize: "0.75rem",
                background: "rgba(232,230,240,0.1)",
                borderRadius: "3px",
                padding: "1px 6px",
                color: "var(--ink)",
              }}
            >
              {t}
            </span>
          ))}
        </div>
      )}
      {onAskAbout && (
        <button
          onClick={() => onAskAbout(`Tell me more about ${title}`)}
          style={{
            fontFamily: "var(--font-caveat, 'Caveat', cursive)",
            fontSize: "0.9rem",
            color: "var(--yellow-light)",
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 0,
            textDecoration: "underline wavy",
            textUnderlineOffset: "3px",
            opacity: 0.8,
          }}
        >
          ask about this →
        </button>
      )}
    </div>
  );

  return (
    <div
      className={tiltClass}
      style={{
        transition: "transform 0.2s",
        transformOrigin: "center center",
        filter: "drop-shadow(2px 4px 8px rgba(0,0,0,0.3))",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.transform = "scale(1.04) rotate(0deg)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.transform = "";
      }}
    >
      {wiredLoaded ? (
        // @ts-expect-error – wired-card is a custom element registered at runtime
        <wired-card
          ref={cardRef}
          elevation="2"
          style={{
            display: "block",
            background: darkBg,
            "--wired-card-background-color": darkBg,
            borderRadius: "2px",
          }}
        >
          {cardContent}
          {/* @ts-expect-error */}
        </wired-card>
      ) : (
        <div
          style={{
            background: darkBg,
            border: "2px solid rgba(232,230,240,0.15)",
            borderRadius: "4px",
          }}
        >
          {cardContent}
        </div>
      )}
    </div>
  );
}
