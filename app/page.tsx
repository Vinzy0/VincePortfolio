"use client";

import { useRef, useCallback, useState } from "react";
import dynamic from "next/dynamic";
import type { ChatBotHandle } from "@/components/ChatBot";

const ChatBot = dynamic(() => import("@/components/ChatBot"), { ssr: false });
const StarfieldBackground = dynamic(() => import("@/components/StarfieldBackground"), { ssr: false });

const CHIPS = [
  { label: "Who are you?",       prompt: "Who are you?" },
  { label: "Projects",           prompt: "What projects have you built?" },
  { label: "Resume",             prompt: "Walk me through your resume." },
  { label: "How do I reach you?", prompt: "How can I reach out to you?" },
];

const CHAT_COLLAPSED = 192;
const CHAT_EXPANDED = "min(78vh, 720px)";

export default function Home() {
  const chatRef = useRef<ChatBotHandle>(null);
  const [chatExpanded, setChatExpanded] = useState(false);
  const [clickedChips, setClickedChips] = useState<Set<string>>(new Set());

  const handleFirstMessage = useCallback(() => {
    setChatExpanded(true);
  }, []);

  const handleChipClick = useCallback((label: string, prompt: string) => {
    setChatExpanded(true);
    setClickedChips((prev) => new Set(prev).add(label));
    setTimeout(() => chatRef.current?.sendMessage(prompt), 50);
  }, []);

  return (
    <>
      <StarfieldBackground />

      {/* Name — fills space above the fixed chat dock */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: chatExpanded ? CHAT_EXPANDED : `${CHAT_COLLAPSED}px`,
          zIndex: 10,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          opacity: chatExpanded ? 0 : 1,
          transition: "bottom 0.38s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease",
          pointerEvents: chatExpanded ? "none" : "auto",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <h1
            style={{
              fontFamily: "var(--font-nunito), sans-serif",
              fontSize: "clamp(3rem, 8vw, 5.5rem)",
              fontWeight: 800,
              color: "#fff",
              margin: 0,
              letterSpacing: "0.02em",
              lineHeight: 1.1,
              textShadow: "0 0 60px rgba(255,255,255,0.15)",
            }}
          >
            Vince Pedres
          </h1>
          <p
            style={{
              fontFamily: "var(--font)",
              fontSize: "clamp(0.85rem, 1.6vw, 1rem)",
              fontWeight: 400,
              color: "var(--ink-muted)",
              margin: "10px 0 0",
              letterSpacing: "0.03em",
            }}
          >
            CS Student · AI/ML · Full-Stack · Philippines
          </p>
        </div>
      </div>

      {/* Chat dock — fixed to bottom, grows upward */}
      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 20,
          height: chatExpanded ? CHAT_EXPANDED : `${CHAT_COLLAPSED}px`,
          transition: "height 0.38s cubic-bezier(0.4, 0, 0.2, 1)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          overflow: "hidden",
        }}
      >
        <ChatBot
          ref={chatRef}
          onFirstMessage={handleFirstMessage}
          chips={CHIPS.filter((c) => !clickedChips.has(c.label))}
          onChipClick={handleChipClick}
        />
      </div>
    </>
  );
}
