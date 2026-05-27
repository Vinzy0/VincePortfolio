"use client";

interface ProjectCardProps {
  name: string;
  oneliner: string;
  stack: string[];
  onClick: () => void;
}

export default function ProjectCard({ name, oneliner, stack, onClick }: ProjectCardProps) {
  return (
    <button
      onClick={onClick}
      style={{
        background: "rgba(5, 6, 14, 0.45)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: "16px",
        padding: "20px 22px",
        cursor: "pointer",
        textAlign: "left",
        transition: "transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease",
        flex: "1 1 200px",
        maxWidth: "300px",
        minWidth: "180px",
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget;
        el.style.borderColor = "rgba(224, 192, 64, 0.55)";
        el.style.transform = "translateY(-4px)";
        el.style.boxShadow = "0 0 24px rgba(224, 192, 64, 0.18), 0 0 8px rgba(224, 192, 64, 0.10), 0 16px 40px rgba(0,0,0,0.5)";
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget;
        el.style.borderColor = "rgba(232,230,240,0.08)";
        el.style.transform = "translateY(0)";
        el.style.boxShadow = "none";
      }}
    >
      <div
        style={{
          fontFamily: "var(--font)",
          fontWeight: 700,
          fontSize: "0.95rem",
          color: "var(--ink)",
          marginBottom: "7px",
          letterSpacing: "-0.01em",
        }}
      >
        {name}
      </div>
      <div
        style={{
          fontFamily: "var(--font)",
          fontSize: "0.81rem",
          color: "var(--ink-muted)",
          lineHeight: 1.55,
          marginBottom: "14px",
        }}
      >
        {oneliner}
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
        {stack.slice(0, 3).map((s) => (
          <span
            key={s}
            style={{
              fontSize: "0.70rem",
              fontFamily: "var(--font)",
              fontWeight: 500,
              padding: "3px 9px",
              borderRadius: "100px",
              background: "rgba(224,192,64,0.07)",
              color: "rgba(224,192,64,0.55)",
              border: "1px solid rgba(224,192,64,0.12)",
              letterSpacing: "0.01em",
            }}
          >
            {s}
          </span>
        ))}
      </div>
    </button>
  );
}
