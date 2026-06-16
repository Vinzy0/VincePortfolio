"use client";

import {
  useEffect,
  useRef,
  useState,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from "react";
import ProjectCard from "./cards/ProjectCard";
import ProjectList from "./cards/ProjectList";
import SkillCard from "./cards/SkillCard";
import ContactCard from "./cards/ContactCard";
import ResumeCard from "./cards/ResumeCard";

interface Message {
  role: "user" | "assistant";
  content: string;
  id: number;
}

let msgId = 0;

const INITIAL: Message = {
  role: "assistant",
  id: ++msgId,
  content:
    "Hey! 👋 I'm the AI version of Vince. I know all about his work, skills, and creative process. What would you like to know?",
};

export interface ChatBotHandle {
  sendMessage: (text: string) => void;
}

interface Chip {
  label: string;
  prompt: string;
}

interface ChatBotProps {
  onFirstMessage?: () => void;
  chips?: Chip[];
  onChipClick?: (label: string, prompt: string) => void;
}

const ChatBot = forwardRef<ChatBotHandle, ChatBotProps>(({ onFirstMessage, chips = [], onChipClick }, ref) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [hasSentMessage, setHasSentMessage] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const send = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || loading) return;

      const userMsg: Message = { role: "user", id: ++msgId, content: trimmed };
      setMessages((prev) => [...prev, userMsg]);
      setInput("");

      if (!hasSentMessage) {
        setHasSentMessage(true);
        onFirstMessage?.();
      }

      if (inputRef.current) {
        inputRef.current.style.height = "auto";
      }

      setLoading(true);
      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: [...messages, userMsg].slice(-10).map((m) => ({
              role: m.role,
              content: m.content,
            })),
          }),
        });

        if (!res.ok || !res.body) throw new Error("Bad response");

        const assistantId = ++msgId;
        setMessages((prev) => [
          ...prev,
          { role: "assistant", id: assistantId, content: "" },
        ]);
        setLoading(false);

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let accumulated = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          accumulated += decoder.decode(value, { stream: true });
          const snap = accumulated;
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId ? { ...m, content: snap } : m
            )
          );
        }
      } catch {
        setLoading(false);
        setMessages((prev) => [
          ...prev,
          { role: "assistant", id: ++msgId, content: "Oops — something went wrong. Try again!" },
        ]);
      } finally {
        setLoading(false);
      }
    },
    [loading, messages]
  );

  useImperativeHandle(ref, () => ({ sendMessage: send }), [send]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  };

  type Segment =
    | { type: "text"; content: string }
    | { type: "signal"; name: string; param?: string };

  function splitBySignals(text: string): Segment[] {
    const regex = /::([\w-]+)(?::([\w-]+))?::/g;
    const segments: Segment[] = [];
    let lastIndex = 0;
    let match;
    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        segments.push({ type: "text", content: text.slice(lastIndex, match.index) });
      }
      segments.push({ type: "signal", name: match[1], param: match[2] });
      lastIndex = match.index + match[0].length;
    }
    if (lastIndex < text.length) {
      segments.push({ type: "text", content: text.slice(lastIndex) });
    }
    return segments;
  }

  function renderText(text: string, key: number) {
    return text.split("\n").map((line, i, arr) => {
      const parts = line.split(/\*\*(.+?)\*\*/g);
      return (
        <span key={`${key}-${i}`}>
          {parts.map((part, j) =>
            j % 2 === 1 ? <strong key={j}>{part}</strong> : part
          )}
          {i < arr.length - 1 && <br />}
        </span>
      );
    });
  }

  function renderContent(text: string) {
    const segments = splitBySignals(text);
    return segments.map((seg, i) => {
      if (seg.type === "signal") {
        if (seg.name === "show-projects") return <ProjectList key={i} />;
        if (seg.name === "project" && seg.param) return <ProjectCard key={i} projectId={seg.param} />;
        if (seg.name === "skills" && seg.param) return <SkillCard key={i} category={seg.param as "languages" | "aiml" | "frontend" | "backend" | "tools"} />;
        if (seg.name === "contact") return <ContactCard key={i} />;
        if (seg.name === "resume") return <ResumeCard key={i} />;
        return null;
      }
      return <span key={i}>{renderText(seg.content, i)}</span>;
    });
  }

  function hasSignals(text: string): boolean {
    return /::([\w-]+)(?::([\w-]+))?::/.test(text);
  }

  const canSend = input.trim().length > 0 && !loading;

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "780px",
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
    >
      {/* Messages scroll area — hidden until first message sent */}
      <div
        role="log"
        aria-live="polite"
        aria-label="Chat with Vince's AI"
        className="chat-messages"
        style={{
          flex: messages.length > 0 ? 1 : 0,
          overflowY: "auto",
          padding: messages.length > 0 ? "24px 24px 16px" : "0",
          display: "flex",
          flexDirection: "column",
          gap: "20px",
          minHeight: 0,
        }}
      >

        {messages.map((msg) => (
          <div
            key={msg.id}
            style={{
              display: "flex",
              justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
              alignItems: "flex-start",
              gap: "12px",
            }}
          >
            {msg.role === "assistant" && (
              <div
                aria-hidden="true"
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  background: "rgba(232, 230, 240, 0.07)",
                  border: "1.5px solid rgba(232, 230, 240, 0.15)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "0.75rem",
                  flexShrink: 0,
                  marginTop: "2px",
                }}
              >
                😎
              </div>
            )}
            <div
              style={{
                maxWidth: msg.role === "assistant" && hasSignals(msg.content) ? "95%" : "72%",
                width: msg.role === "assistant" && hasSignals(msg.content) ? "95%" : undefined,
                fontSize: "0.975rem",
                fontWeight: 400,
                lineHeight: 1.65,
                padding: "10px 16px",
                borderRadius: msg.role === "user" ? "20px 20px 4px 20px" : "20px 20px 20px 4px",
                background: msg.role === "user"
                  ? "var(--yellow)"
                  : "rgba(28, 30, 45, 0.75)",
                color: msg.role === "user" ? "var(--bg)" : "var(--ink)",
                backdropFilter: msg.role === "assistant" ? "blur(8px)" : "none",
                WebkitBackdropFilter: msg.role === "assistant" ? "blur(8px)" : "none",
                border: msg.role === "assistant" ? "1px solid rgba(255,255,255,0.06)" : "none",
              }}
            >
              {renderContent(msg.content)}
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {loading && (
          <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
            <div
              aria-hidden="true"
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                background: "rgba(232, 230, 240, 0.07)",
                border: "1.5px solid rgba(232, 230, 240, 0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "0.75rem",
                flexShrink: 0,
              }}
            >
              😎
            </div>
            <div style={{ paddingTop: "8px", display: "flex", gap: "5px" }}>
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  style={{
                    width: "7px",
                    height: "7px",
                    borderRadius: "50%",
                    background: "rgba(232,230,240,0.4)",
                    display: "inline-block",
                    animation: `dotBounce 1.2s ease-in-out ${i * 0.2}s infinite`,
                  }}
                />
              ))}
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Chips — above input, only show unclicked ones */}
      {chips.length > 0 && (
        <div style={{
          display: "flex", gap: "8px", flexWrap: "wrap", justifyContent: "center",
          padding: "0 24px 10px",
          maxWidth: "780px", width: "100%", alignSelf: "center",
        }}>
          {chips.map((chip) => (
            <button
              key={chip.label}
              onClick={() => {
                onChipClick?.(chip.label, chip.prompt);
                send(chip.prompt);
              }}
              style={{
                fontFamily: "var(--font)", fontSize: "0.82rem", fontWeight: 500,
                padding: "7px 16px", borderRadius: "100px",
                border: "1px solid rgba(255,255,255,0.12)",
                background: "rgba(5, 6, 14, 0.45)",
                backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)",
                color: "rgba(255,255,255,0.75)", cursor: "pointer", whiteSpace: "nowrap",
                transition: "border-color 0.2s, color 0.2s, background 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "rgba(224,192,64,0.55)";
                e.currentTarget.style.color = "#fff";
                e.currentTarget.style.background = "rgba(224,192,64,0.08)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)";
                e.currentTarget.style.color = "rgba(255,255,255,0.75)";
                e.currentTarget.style.background = "rgba(5, 6, 14, 0.45)";
              }}
            >
              {chip.label}
            </button>
          ))}
        </div>
      )}

      {/* Input bar — pinned to bottom */}
      <div style={{ padding: "0 24px", paddingBottom: "max(48px, env(safe-area-inset-bottom))" }}>

        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            gap: "10px",
            background: "rgba(5, 6, 14, 0.45)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            border: `1.5px solid ${focused ? "rgba(224,192,64,0.55)" : "rgba(255,255,255,0.07)"}`,
            borderRadius: "16px",
            padding: "12px 12px 12px 18px",
            boxShadow: focused ? "0 0 24px rgba(224,192,64,0.18), 0 0 8px rgba(224,192,64,0.10)" : "none",
            transition: "border-color 0.2s, box-shadow 0.2s",
          }}
        >
          <textarea
            ref={inputRef}
            aria-label="Message Vince's AI"
            placeholder="Ask Vince anything."
            rows={1}
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              e.target.style.height = "auto";
              e.target.style.height = Math.min(e.target.scrollHeight, 140) + "px";
            }}
            onKeyDown={handleKeyDown}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            style={{
              flex: 1,
              fontFamily: "var(--font)",
              fontSize: "0.975rem",
              fontWeight: 400,
              lineHeight: 1.6,
              background: "transparent",
              border: "none",
              outline: "none", /* focus shown on parent container */
              color: "var(--ink)",
              resize: "none",
              minHeight: "24px",
              maxHeight: "140px",
              padding: 0,
            }}
          />
          <button
            onClick={() => send(input)}
            disabled={!canSend}
            style={{
              width: "34px",
              height: "34px",
              borderRadius: "10px",
              border: "none",
              background: canSend
                ? "var(--yellow)"
                : "rgba(232,230,240,0.08)",
              color: canSend ? "var(--bg)" : "rgba(232,230,240,0.25)",
              cursor: canSend ? "pointer" : "default",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              fontSize: "1rem",
              transition: "background 0.2s, color 0.2s",
            }}
            aria-label="Send"
          >
            ↑
          </button>
        </div>

        <div
          style={{
            textAlign: "center",
            fontSize: "0.75rem",
            color: "var(--ink-muted)",
            marginTop: "8px",
          }}
        >
          (not really vince lol)
        </div>
      </div>

      <style>{`
        @keyframes dotBounce {
          0%, 100% { transform: translateY(0); opacity: 0.4; }
          50% { transform: translateY(-5px); opacity: 1; }
        }
      `}</style>
    </div>
  );
});

ChatBot.displayName = "ChatBot";
export default ChatBot;
