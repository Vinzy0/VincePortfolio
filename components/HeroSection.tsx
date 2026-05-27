"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import dynamic from "next/dynamic";
import { TegakiRenderer } from "tegaki/react";
import caveat from "tegaki/fonts/caveat";

const SketchBackground = dynamic(() => import("./SketchBackground"), { ssr: false });

interface HeroSectionProps {
  onEnter: (firstMessage: string) => void;
}

type Phase = "dark" | "bg" | "clouds" | "stars" | "writing" | "subtitle" | "done";

export default function HeroSection({ onEnter }: HeroSectionProps) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);
  const [phase, setPhase] = useState<Phase>("dark");
  const [nameWritten, setNameWritten] = useState(false);
  const [taglineDone, setTaglineDone] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sequence timer
  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    timers.push(setTimeout(() => setPhase("bg"), 0));         // sky visible immediately
    timers.push(setTimeout(() => setPhase("clouds"), 1000));  // clouds fade in
    timers.push(setTimeout(() => setPhase("stars"), 2000));   // stars drop
    timers.push(setTimeout(() => setPhase("writing"), 3500)); // text starts
    return () => timers.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    if (taglineDone) {
      setTimeout(() => inputRef.current?.focus(), 400);
    }
  }, [taglineDone]);

  const handleSend = useCallback(async () => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 500));
    onEnter(trimmed);
    setLoading(false);
  }, [input, loading, onEnter]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSend();
    }
  };

  const canSend = input.trim().length > 0 && !loading;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 100,
        background: "transparent",
        overflow: "hidden",
      }}
    >
      {/* Background — sky immediate, clouds at 1s, stars at 2s */}
      <SketchBackground
        visible={phase === "stars" || phase === "writing" || phase === "subtitle" || phase === "done"}
        bgVisible={true}
        cloudsVisible={phase === "clouds" || phase === "stars" || phase === "writing" || phase === "subtitle" || phase === "done"}
      />

      <div
        style={{
          position: "relative",
          zIndex: 10,
          textAlign: "center",
          maxWidth: "680px",
          padding: "0 24px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "20px",
        }}
      >
        {/* Name — only starts writing after stars settle */}
        {phase === "writing" || phase === "subtitle" || phase === "done" ? (
          <TegakiRenderer
            font={caveat as any}
            time={{ mode: "uncontrolled", speed: 1.2 }}
            onComplete={() => {
              setNameWritten(true);
              setPhase("subtitle");
            }}
            style={{
              fontSize: "clamp(4rem, 13vw, 7.5rem)",
              fontWeight: 700,
              color: "#e8e6f0",
              letterSpacing: "-2px",
              lineHeight: 1.05,
            }}
          >
            Vince Pedres
          </TegakiRenderer>
        ) : (
          <div style={{ height: "clamp(4rem, 13vw, 7.5rem)" }} />
        )}

        {/* Subtitle + tagline — fade in after name writes */}
        <div
          style={{
            opacity: nameWritten ? 1 : 0,
            transition: "opacity 0.3s ease",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "16px",
          }}
        >
          {nameWritten && (
            <TegakiRenderer
              font={caveat as any}
              time={{ mode: "uncontrolled", speed: 1.8 }}
              onComplete={() => {
                setTaglineDone(true);
                setPhase("done");
              }}
              style={{
                fontSize: "clamp(1.4rem, 4vw, 2rem)",
                fontWeight: 500,
                color: "rgba(232,230,240,0.55)",
              }}
            >
              Creative Developer & Designer
            </TegakiRenderer>
          )}

          {/* "feel inevitable" — fades in after subtitle */}
          <span
            style={{
              fontFamily: "var(--font-caveat, 'Caveat', cursive)",
              fontSize: "clamp(1rem, 2.5vw, 1.2rem)",
              color: "rgba(232,230,240,0.35)",
              opacity: taglineDone ? 1 : 0,
              transition: "opacity 0.6s ease 0.1s",
              display: "block",
            }}
          >
            I build things that feel inevitable
          </span>
        </div>

        {/* Divider + CTA — fade in last */}
        <div
          style={{
            opacity: taglineDone ? 1 : 0,
            transition: "opacity 0.6s ease 0.3s",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "20px",
            width: "100%",
          }}
        >
          <div
            style={{
              width: "100px",
              height: "2px",
              background: "linear-gradient(90deg, transparent, var(--yellow), transparent)",
            }}
          />

          <p
            style={{
              fontFamily: "var(--font-caveat, 'Caveat', cursive)",
              fontSize: "1.05rem",
              color: "var(--yellow-light)",
              opacity: 0.85,
              margin: 0,
            }}
          >
            ↓ Say hi to unlock my portfolio ↓
          </p>

          {/* Input bar */}
          <div
            style={{
              width: "100%",
              maxWidth: "500px",
              display: "flex",
              alignItems: "center",
              background: "rgba(232,230,240,0.06)",
              border: `1.5px solid ${focused ? "rgba(232,230,240,0.35)" : "rgba(232,230,240,0.12)"}`,
              borderRadius: "100px",
              padding: "6px 6px 6px 22px",
              gap: "10px",
              boxShadow: focused
                ? "0 0 0 3px rgba(224,192,64,0.12), 0 16px 48px rgba(0,0,0,0.4)"
                : "0 8px 32px rgba(0,0,0,0.35)",
              transition: "border-color 0.2s, box-shadow 0.2s",
            }}
          >
            <input
              ref={inputRef}
              type="text"
              placeholder="Say something..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              disabled={loading}
              style={{
                flex: 1,
                fontFamily: "var(--font-caveat, 'Caveat', cursive)",
                fontSize: "1.15rem",
                background: "transparent",
                border: "none",
                outline: "none",
                color: "var(--ink)",
                minWidth: 0,
              }}
            />
            <button
              onClick={handleSend}
              disabled={!canSend}
              style={{
                flexShrink: 0,
                height: "42px",
                padding: "0 22px",
                borderRadius: "100px",
                border: "none",
                background: canSend
                  ? "linear-gradient(135deg, var(--yellow), var(--orange-dark))"
                  : "rgba(232,230,240,0.08)",
                color: canSend ? "#0a0a1a" : "rgba(232,230,240,0.25)",
                fontFamily: "var(--font-caveat, 'Caveat', cursive)",
                fontSize: "1.05rem",
                fontWeight: 700,
                cursor: canSend ? "pointer" : "default",
                whiteSpace: "nowrap",
                transition: "background 0.2s, color 0.2s, transform 0.1s",
                transform: canSend ? "scale(1)" : "scale(0.97)",
                letterSpacing: "0.02em",
              }}
              onMouseDown={(e) => { if (canSend) (e.currentTarget.style.transform = "scale(0.95)"); }}
              onMouseUp={(e) => { if (canSend) (e.currentTarget.style.transform = "scale(1)"); }}
            >
              {loading ? "···" : "Enter →"}
            </button>
          </div>

          <p
            style={{
              fontFamily: "var(--font-caveat, 'Caveat', cursive)",
              fontSize: "0.85rem",
              color: "var(--ink-muted)",
              opacity: 0.45,
              margin: 0,
            }}
          >
            Press Enter or click the button to continue
          </p>
        </div>
      </div>
    </div>
  );
}
