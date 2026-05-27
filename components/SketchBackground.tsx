"use client";

import { useEffect, useRef, useCallback } from "react";

interface SketchGroup {
  outer: SVGGElement;
  inner: SVGGElement;
  dropDelay: number;
  dropDuration: number;
  fallY: number;
  ongoingAnim: string;
}

export default function SketchBackground({
  visible = true,
  bgVisible = true,
  cloudsVisible = true,
}: {
  visible?: boolean;
  bgVisible?: boolean;
  cloudsVisible?: boolean;
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const groups = useRef<SketchGroup[]>([]);
  const visibleRef = useRef(visible);
  const cloudsRef = useRef<SVGGElement | null>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const rafs = useRef<number[]>([]);

  useEffect(() => { visibleRef.current = visible; });

  const clearPending = useCallback(() => {
    timers.current.forEach(clearTimeout);
    rafs.current.forEach(cancelAnimationFrame);
    timers.current = [];
    rafs.current = [];
  }, []);

  const triggerDropIn = useCallback(() => {
    clearPending();
    groups.current.forEach(({ outer, inner, dropDelay, dropDuration, ongoingAnim }) => {
      outer.style.animation = "";
      inner.style.animation = "";
      outer.style.opacity = "0";
      const raf = requestAnimationFrame(() => {
        outer.style.animation = `sk-drop ${dropDuration}s cubic-bezier(0.22,1,0.36,1) ${dropDelay}s both`;
        const tid = setTimeout(() => {
          inner.style.animation = ongoingAnim;
        }, (dropDelay + dropDuration) * 1000 + 60);
        timers.current.push(tid);
      });
      rafs.current.push(raf);
    });
  }, [clearPending]);

  const hideAll = useCallback(() => {
    clearPending();
    groups.current.forEach(({ outer, inner }) => {
      outer.style.animation = "";
      inner.style.animation = "";
      outer.style.opacity = "0";
    });
  }, [clearPending]);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    let cancelled = false;

    async function draw() {
      const mod = await import("roughjs");
      if (cancelled) return;

      const rc = mod.default.svg(svg!);
      const W = window.innerWidth;
      const H = window.innerHeight;

      svg!.setAttribute("viewBox", `0 0 ${W} ${H}`);
      svg!.setAttribute("width", String(W));
      svg!.setAttribute("height", String(H));
      while (svg!.firstChild) svg!.removeChild(svg!.firstChild);
      groups.current = [];

      // ── Painted sky background ────────────────────────────────
      const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");

      // Sky filter — large organic turbulence mapped to dark navy → teal-blue
      // feColorMatrix rows: [R_in G_in B_in A_in const] → one row per output channel
      // fractalNoise R channel ≈ 0..1 noise → we scale it to colour range
      defs.innerHTML = `
        <filter id="sk-sky" x="0%" y="0%" width="100%" height="100%" color-interpolation-filters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency="0.013 0.008" numOctaves="6" seed="8" result="noise"/>
          <feColorMatrix type="matrix" in="noise"
            values="0.03  0  0  0  0.012
                    0.06  0  0  0  0.028
                    0.12  0  0  0  0.070
                    0     0  0  0  1"
            result="skyColor"/>
          <feComposite in="skyColor" in2="SourceGraphic" operator="in"/>
        </filter>

        <filter id="sk-grain" x="0%" y="0%" width="100%" height="100%" color-interpolation-filters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency="0.72" numOctaves="4" seed="3" result="grain"/>
          <feColorMatrix type="saturate" values="0" in="grain" result="greyGrain"/>
          <feBlend in="SourceGraphic" in2="greyGrain" mode="overlay"/>
        </filter>

        <radialGradient id="sk-upper-glow" cx="0.42" cy="0.28" r="0.45"
          gradientUnits="objectBoundingBox" fx="0.42" fy="0.26">
          <stop offset="0%"   stop-color="#142850" stop-opacity="0.15"/>
          <stop offset="50%"  stop-color="#0a1838" stop-opacity="0.05"/>
          <stop offset="100%" stop-color="#02040a" stop-opacity="0"/>
        </radialGradient>

        <radialGradient id="sk-edge-vignette" cx="0.50" cy="0.50" r="0.70"
          gradientUnits="objectBoundingBox" fx="0.50" fy="0.50">
          <stop offset="0%"   stop-color="transparent"/>
          <stop offset="100%" stop-color="#010208" stop-opacity="0.90"/>
        </radialGradient>

        <linearGradient id="sk-bottom-fade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="35%"  stop-color="transparent"/>
          <stop offset="100%" stop-color="#02040a" stop-opacity="0.95"/>
        </linearGradient>
      `;
      svg!.appendChild(defs);

      // Base dark rect — near-black space blue
      const skyRect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      skyRect.setAttribute("width", String(W));
      skyRect.setAttribute("height", String(H));
      skyRect.setAttribute("fill", "#02040a");
      svg!.appendChild(skyRect);

      // Oversized noise rect so it has room to drift without showing edges
      const skyNoiseRect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      skyNoiseRect.setAttribute("x", String(-W * 0.25));
      skyNoiseRect.setAttribute("y", String(-H * 0.15));
      skyNoiseRect.setAttribute("width", String(W * 1.5));
      skyNoiseRect.setAttribute("height", String(H * 1.3));
      skyNoiseRect.setAttribute("fill", "white");
      skyNoiseRect.setAttribute("filter", "url(#sk-sky)");
      skyNoiseRect.style.animation = "sk-sky-drift 90s ease-in-out infinite";
      svg!.appendChild(skyNoiseRect);

      // Upper-area atmospheric glow (upper-middle, not dead center)
      const upperGlow = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      upperGlow.setAttribute("width", String(W));
      upperGlow.setAttribute("height", String(H));
      upperGlow.setAttribute("fill", "url(#sk-upper-glow)");
      svg!.appendChild(upperGlow);

      // Fine grain overlay — subtle, only in upper half, fades in slowly
      const grainRect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      grainRect.setAttribute("width", String(W));
      grainRect.setAttribute("height", String(H * 0.65));
      grainRect.setAttribute("fill", "#4a6aaa");
      grainRect.setAttribute("filter", "url(#sk-grain)");
      grainRect.style.opacity = "0";
      grainRect.style.mixBlendMode = "soft-light";
      grainRect.style.animation = "sk-grain-fade 4s ease-out 1.5s forwards";
      svg!.appendChild(grainRect);

      // Edge vignette — darkens corners/edges
      const vigRect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      vigRect.setAttribute("width", String(W));
      vigRect.setAttribute("height", String(H));
      vigRect.setAttribute("fill", "url(#sk-edge-vignette)");
      svg!.appendChild(vigRect);

      // Bottom fade — pulls lower half back to near-black
      const bottomFade = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      bottomFade.setAttribute("width", String(W));
      bottomFade.setAttribute("height", String(H));
      bottomFade.setAttribute("fill", "url(#sk-bottom-fade)");
      svg!.appendChild(bottomFade);

      // ── Clouds ────────────────────────────────────────────────
      const cloudsGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
      cloudsGroup.classList.add("sk-clouds");
      cloudsGroup.style.opacity = "0";
      cloudsGroup.style.transform = "translateY(60px)";
      cloudsGroup.style.transition = "opacity 1.2s ease, transform 1.2s cubic-bezier(0.22, 1, 0.36, 1)";
      cloudsRef.current = cloudsGroup;

      // Puffy cumulus clouds built from overlapping ellipses
      function drawCloudCluster(
        cx: number,
        cy: number,
        scale: number,
        color: string,
        opacity: number,
        seed: number
      ) {
        const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
        g.style.opacity = String(opacity);

        // Define puffs relative to center: [dx, dy, rx, ry]
        const puffs: [number, number, number, number][] = [
          [0, -10, 90, 70],
          [-70, 8, 65, 50],
          [70, 8, 65, 50],
          [-30, -45, 55, 50],
          [30, -45, 55, 50],
          [0, -70, 45, 38],
          [-90, 20, 45, 35],
          [90, 20, 45, 35],
          [-50, -20, 40, 35],
          [50, -20, 40, 35],
        ];

        puffs.forEach(([dx, dy, rx, ry]) => {
          const node = rc.ellipse(
            cx + dx * scale,
            cy + dy * scale,
            rx * scale * 2,
            ry * scale * 2,
            {
              fill: color,
              fillStyle: "hachure",
              hachureGap: 5 + scale * 2,
              hachureAngle: 45 + seed,
              roughness: 2.0,
              stroke: "none",
              seed: seed + dx,
            }
          );
          g.appendChild(node);
        });

        return g;
      }

      // Draw cloud layers from back to front — pushed down to bottom edge
      // Back layer
      const backClouds = [
        { x: W * -0.05, y: H * 0.82, s: 1.8 },
        { x: W * 0.22, y: H * 0.78, s: 2.0 },
        { x: W * 0.55, y: H * 0.80, s: 1.9 },
        { x: W * 0.85, y: H * 0.83, s: 1.7 },
        { x: W * 1.05, y: H * 0.85, s: 1.6 },
      ];
      backClouds.forEach((c, i) => {
        cloudsGroup.appendChild(drawCloudCluster(c.x, c.y, c.s, "#3a5070", 0.88, 100 + i * 50));
      });

      // Middle layer
      const midClouds = [
        { x: W * -0.08, y: H * 0.90, s: 1.5 },
        { x: W * 0.18, y: H * 0.88, s: 1.7 },
        { x: W * 0.45, y: H * 0.86, s: 1.8 },
        { x: W * 0.72, y: H * 0.89, s: 1.6 },
        { x: W * 0.98, y: H * 0.91, s: 1.4 },
      ];
      midClouds.forEach((c, i) => {
        cloudsGroup.appendChild(drawCloudCluster(c.x, c.y, c.s, "#4a6085", 0.82, 200 + i * 50));
      });

      // Front layer — sitting at the very bottom
      const frontClouds = [
        { x: W * 0.05, y: H * 0.96, s: 1.3 },
        { x: W * 0.30, y: H * 0.93, s: 1.5 },
        { x: W * 0.58, y: H * 0.95, s: 1.4 },
        { x: W * 0.82, y: H * 0.97, s: 1.2 },
      ];
      frontClouds.forEach((c, i) => {
        cloudsGroup.appendChild(drawCloudCluster(c.x, c.y, c.s, "#5a7095", 0.78, 300 + i * 50));
      });

      svg!.appendChild(cloudsGroup);

      // ── CSS animations ────────────────────────────────────────
      const styleEl = document.createElementNS("http://www.w3.org/2000/svg", "style");
      styleEl.textContent = `
        .sk-o, .sk-i, .sk-clouds { transform-box: fill-box; transform-origin: center; }
        @keyframes sk-drop {
          from { opacity: 0; transform: translateY(var(--sk-y, -50px)); }
          to   { opacity: 1; transform: translateY(0px); }
        }
        @keyframes sk-star {
          0%,100% { transform: scale(1) rotate(0deg); opacity: 1; }
          20%     { transform: scale(0.6) rotate(9deg); opacity: 0.2; }
          50%     { transform: scale(1.22) rotate(-6deg); opacity: 0.9; }
          75%     { transform: scale(0.78) rotate(12deg); opacity: 0.4; }
        }
        @keyframes sk-sky-drift {
          0%   { transform: translate(0px,    0px);   }
          25%  { transform: translate(-60px, -25px);  }
          50%  { transform: translate(-30px, -50px);  }
          75%  { transform: translate( 40px, -20px);  }
          100% { transform: translate(0px,    0px);   }
        }
        @keyframes sk-grain-fade {
          from { opacity: 0; }
          to   { opacity: 0.035; }
        }
      `;
      svg!.appendChild(styleEl);

      // ── Helpers ───────────────────────────────────────────────
      function makeG(dropDelay: number, dropDuration: number, fallY: number, ongoing: string): SVGGElement {
        const outer = document.createElementNS("http://www.w3.org/2000/svg", "g") as SVGGElement;
        outer.classList.add("sk-o");
        outer.style.opacity = "0";
        outer.style.setProperty("--sk-y", `-${fallY}px`);
        const inner = document.createElementNS("http://www.w3.org/2000/svg", "g") as SVGGElement;
        inner.classList.add("sk-i");
        outer.appendChild(inner);
        svg!.appendChild(outer);
        groups.current.push({ outer, inner, dropDelay, dropDuration, fallY, ongoingAnim: ongoing });
        return inner;
      }

      function drawStar(cx: number, cy: number, oR: number, iR: number, opts: object, seed: number) {
        const pts: string[] = [];
        for (let i = 0; i < 10; i++) {
          const r = i % 2 === 0 ? oR : iR;
          const a = (Math.PI * i) / 5 - Math.PI / 2;
          pts.push(`${i === 0 ? "M" : "L"} ${(cx + r * Math.cos(a)).toFixed(1)} ${(cy + r * Math.sin(a)).toFixed(1)}`);
        }
        pts.push("Z");
        return rc.path(pts.join(" "), { ...opts, seed } as Parameters<typeof rc.path>[1]);
      }

      // ── Large stars ───────────────────────────────────────────
      const lgStars: [number, number, number, number, number][] = [
        [W * 0.11, H * 0.08, 25, 10, 1],
        [W * 0.38, H * 0.06, 23, 9,  2],
        [W * 0.54, H * 0.13, 29, 12, 3],
        [W * 0.24, H * 0.27, 21, 8,  4],
        [W * 0.83, H * 0.31, 19, 8,  5],
        [W * 0.07, H * 0.42, 17, 7,  6],
      ];
      lgStars.forEach(([x, y, oR, iR, s], i) => {
        const dur = (2.4 + i * 0.55).toFixed(1);
        const g = makeG(0.1 + i * 0.15, 0.95, 28 + i * 9, `sk-star ${dur}s ease-in-out -${(i * 0.85).toFixed(1)}s infinite`);
        g.appendChild(drawStar(x, y, oR, iR, {
          roughness: 3.2, stroke: "#9a6e10", strokeWidth: 2.2,
          fill: "rgba(215,176,40,0.92)", fillStyle: "hachure", hachureGap: 4,
        }, s));
      });

      // ── Small stars ───────────────────────────────────────────
      const smStars: [number, number, number, number, number][] = [
        [W * 0.47, H * 0.21, 11, 4.5, 10],
        [W * 0.67, H * 0.08, 9,  3.8, 11],
        [W * 0.91, H * 0.19, 10, 4.0, 12],
        [W * 0.31, H * 0.14, 8,  3.2, 13],
        [W * 0.17, H * 0.49, 8,  3.0, 14],
        [W * 0.61, H * 0.35, 12, 5.0, 15],
        [W * 0.03, H * 0.19, 9,  3.5, 16],
      ];
      smStars.forEach(([x, y, oR, iR, s], i) => {
        const dur = (3.0 + i * 0.4).toFixed(1);
        const g = makeG(0.6 + i * 0.1, 0.88, 20 + i * 5, `sk-star ${dur}s ease-in-out -${(i * 1.1).toFixed(1)}s infinite`);
        g.appendChild(drawStar(x, y, oR, iR, {
          roughness: 2.6, stroke: "#8a6010", strokeWidth: 1.5,
          fill: "rgba(215,176,40,0.74)", fillStyle: "hachure", hachureGap: 3,
        }, s));
      });


      if (visibleRef.current) triggerDropIn();
    }

    draw();
    window.addEventListener("resize", draw);
    return () => {
      cancelled = true;
      window.removeEventListener("resize", draw);
      clearPending();
    };
  }, [triggerDropIn, clearPending]);

  useEffect(() => {
    if (visible) triggerDropIn();
    else hideAll();
  }, [visible, triggerDropIn, hideAll]);

  useEffect(() => {
    if (cloudsRef.current) {
      cloudsRef.current.style.opacity = cloudsVisible ? "1" : "0";
      cloudsRef.current.style.transform = cloudsVisible ? "translateY(0px)" : "translateY(60px)";
    }
  }, [cloudsVisible]);

  return (
    <svg
      ref={svgRef}
      style={{
        position: "fixed", inset: 0,
        width: "100vw", height: "100vh",
        pointerEvents: "none", zIndex: 0, overflow: "visible",
        opacity: bgVisible ? 1 : 0,
        transition: "opacity 1s ease",
      }}
      aria-hidden="true"
    />
  );
}
