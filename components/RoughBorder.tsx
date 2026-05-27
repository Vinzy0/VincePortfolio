"use client";

import { useEffect, useRef, type ReactNode, type CSSProperties } from "react";

interface RoughBorderProps {
  children: ReactNode;
  color?: string;
  roughness?: number;
  strokeWidth?: number;
  padding?: number;
  style?: CSSProperties;
  className?: string;
}

export default function RoughBorder({
  children,
  color = "#1e1e2e",
  roughness = 2.2,
  strokeWidth = 2,
  padding = 10,
  style,
  className,
}: RoughBorderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const svg = svgRef.current;
    if (!container || !svg) return;

    let rc: ReturnType<typeof import("roughjs")["default"]["svg"]> | null = null;

    const draw = async () => {
      if (!rc) {
        const mod = await import("roughjs");
        rc = mod.default.svg(svg);
      }

      const { width, height } = container.getBoundingClientRect();
      if (!width || !height) return;

      svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
      svg.setAttribute("width", String(width));
      svg.setAttribute("height", String(height));

      while (svg.firstChild) svg.removeChild(svg.firstChild);

      const node = rc.rectangle(padding / 2, padding / 2, width - padding, height - padding, {
        roughness,
        stroke: color,
        strokeWidth,
        fill: "none",
      });
      svg.appendChild(node);
    };

    draw();

    const observer = new ResizeObserver(draw);
    observer.observe(container);
    return () => observer.disconnect();
  }, [color, roughness, strokeWidth, padding]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ position: "relative", ...style }}
    >
      <svg
        ref={svgRef}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          overflow: "visible",
          pointerEvents: "none",
          zIndex: 1,
        }}
        aria-hidden="true"
      />
      <div style={{ position: "relative", zIndex: 2 }}>{children}</div>
    </div>
  );
}
