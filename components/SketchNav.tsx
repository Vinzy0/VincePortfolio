"use client";

import { useEffect, useRef } from "react";

interface NavLink {
  label: string;
  topic: string;
}

interface SketchNavProps {
  onTopicSelect: (topic: string) => void;
  onLogoClick?: () => void;
}

const links: NavLink[] = [
  { label: "About", topic: "Tell me about yourself" },
  { label: "Work", topic: "What projects have you built?" },
  { label: "Skills", topic: "What's your tech stack?" },
  { label: "Hire me", topic: "How can I contact you or hire you?" },
];

const logoStyle: React.CSSProperties = {
  fontFamily: "var(--font)",
  fontSize: "2.1rem",
  fontWeight: 700,
  color: "var(--ink)",
  letterSpacing: "-0.5px",
  lineHeight: 1,
  display: "flex",
  alignItems: "center",
  gap: "10px",
};

export default function SketchNav({ onTopicSelect, onLogoClick }: SketchNavProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    let roughMod: any | undefined;
    let cancelled = false;

    const draw = async () => {
      if (!roughMod) {
        const mod = await import("roughjs");
        if (cancelled) return;
        roughMod = mod;
      }
      while (svg.firstChild) svg.removeChild(svg.firstChild);
      const rc = roughMod.default.svg(svg);
      const w = svg.parentElement?.getBoundingClientRect().width ?? 800;
      svg.setAttribute("viewBox", `0 0 ${w} 8`);
      svg.setAttribute("width", String(w));
      svg.setAttribute("height", "8");
      const line = rc.line(0, 4, w, 4, {
        roughness: 2.5,
        stroke: "rgba(232,230,240,0.15)",
        strokeWidth: 1.5,
      });
      svg.appendChild(line);
    };

    draw();
    window.addEventListener("resize", draw);
    return () => {
      cancelled = true;
      window.removeEventListener("resize", draw);
    };
  }, []);

  return (
    <nav
      style={{
        position: "relative",
        zIndex: 10,
        padding: "20px 40px 16px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "16px",
        background: "var(--bg)",
      }}
    >
      {/* Logo */}
      {onLogoClick ? (
        <button
          onClick={onLogoClick}
          style={{ ...logoStyle, background: "none", border: "none", padding: 0, cursor: "pointer" }}
        >
          <span style={{ display: "inline-block", transform: "rotate(-8deg)", fontSize: "1.6rem" }}>✏️</span>
          Vince Pedres
        </button>
      ) : (
        <div style={logoStyle}>
          <span style={{ display: "inline-block", transform: "rotate(-8deg)", fontSize: "1.6rem" }}>✏️</span>
          Vince Pedres
        </div>
      )}

      {/* Nav links */}
      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
        {links.map(({ label, topic }) => (
          <button
            key={label}
            onClick={() => onTopicSelect(topic)}
            className="nav-link"
            style={{
              fontFamily: "var(--font)",
              fontSize: "1rem",
              fontWeight: 600,
              background: "transparent",
              border: "none",
              cursor: "pointer",
              padding: "10px 18px",
              minHeight: "44px",
              letterSpacing: "0.04em",
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* sketchy underline */}
      <svg
        ref={svgRef}
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          width: "100%",
          height: "8px",
          overflow: "visible",
          pointerEvents: "none",
        }}
        aria-hidden="true"
      />
    </nav>
  );
}
