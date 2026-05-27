"use client";

import { useEffect, useRef } from "react";

interface CardShellProps {
  children: React.ReactNode;
  style?: React.CSSProperties;
}

export default function CardShell({ children, style }: CardShellProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.opacity = "0";
    el.style.transform = "translateY(8px)";
    const frame = requestAnimationFrame(() => {
      el.style.transition = "opacity 0.35s ease, transform 0.35s ease";
      el.style.opacity = "1";
      el.style.transform = "translateY(0)";
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div
      ref={ref}
      style={{
        background: "rgba(5, 6, 14, 0.55)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: "16px",
        overflow: "hidden",
        width: "100%",
        margin: "8px 0",
        ...style,
      }}
    >
      {children}
    </div>
  );
}
