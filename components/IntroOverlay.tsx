"use client";

import { useState } from "react";
import { TegakiRenderer } from "tegaki/react";
import caveat from "tegaki/fonts/caveat";

type Phase = "drawing" | "pause" | "fadeout" | "hidden";

interface Props {
  onComplete: () => void;
}

export default function IntroOverlay({ onComplete }: Props) {
  const [phase, setPhase] = useState<Phase>("drawing");

  const handleDrawComplete = () => {
    setPhase("pause");
    setTimeout(() => {
      setPhase("fadeout");
      setTimeout(() => {
        setPhase("hidden");
        onComplete();
      }, 1000);
    }, 700);
  };

  if (phase === "hidden") return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        backgroundColor: "#000",
        display: "flex",
        flexDirection: "column",
        opacity: phase === "fadeout" ? 0 : 1,
        transition: phase === "fadeout" ? "opacity 1s ease" : "none",
        pointerEvents: "none",
      }}
    >
      {/* Mirrors the flex:1 name section so text lands at the same Y as the real name */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <TegakiRenderer
          font={caveat}
          style={{
            fontSize: "clamp(3rem, 8vw, 5.5rem)",
            color: "#ffffff",
            fontWeight: 700,
          }}
          onComplete={handleDrawComplete}
        >
          Vince Pedres
        </TegakiRenderer>
      </div>
      {/* Placeholder heights matching cards + chat so the flex:1 above compresses identically */}
      <div style={{ flexShrink: 0, height: 180 }} />
      <div style={{ flexShrink: 0, height: 192 }} />
    </div>
  );
}
