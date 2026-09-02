"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { MessageCircle, Send, User, X } from "lucide-react";
import { profile } from "@/lib/portfolio-data";
import { renderBold } from "@/lib/render-bold";
import { useResumeChat } from "@/lib/use-resume-chat";
import { useChatWidget } from "./ChatWidgetProvider";

const BULLET_RE = /^[*-]\s+/;

function FormattedMessage({ text }: { text: string }) {
  // The backend sometimes runs bullets together on one line (e.g. "intro: * item * item")
  // instead of separating them with newlines, so split those out first.
  const normalized = text.replace(/\s(?=[*-]\s+\*\*)/g, "\n");
  const lines = normalized.split("\n").filter((line) => line.trim() !== "");

  const blocks: { type: "p" | "ul"; lines: string[] }[] = [];
  for (const line of lines) {
    const isBullet = BULLET_RE.test(line.trim());
    const last = blocks[blocks.length - 1];
    const type = isBullet ? "ul" : "p";
    if (last && last.type === type) {
      last.lines.push(line);
    } else {
      blocks.push({ type, lines: [line] });
    }
  }

  return (
    <>
      {blocks.map((block, i) =>
        block.type === "ul" ? (
          <ul key={i} className={`list-disc space-y-1 pl-4 ${i > 0 ? "mt-2" : ""}`}>
            {block.lines.map((line, j) => (
              <li key={j}>{renderBold(line.trim().replace(BULLET_RE, ""))}</li>
            ))}
          </ul>
        ) : (
          block.lines.map((line, j) => (
            <p key={`${i}-${j}`} className={i > 0 || j > 0 ? "mt-2" : undefined}>
              {renderBold(line)}
            </p>
          ))
        )
      )}
    </>
  );
}

function AgentAvatar() {
  return (
    <span
      className="relative flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full border"
      style={{ borderColor: "var(--color-border-default)" }}
    >
      <Image src="/img/logo.png" alt={profile.name} fill className="object-cover" />
    </span>
  );
}

function UserAvatar() {
  return (
    <span
      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border"
      style={{
        borderColor: "var(--color-border-default)",
        backgroundColor: "var(--color-bg-sunken)",
        color: "var(--color-text-tertiary)",
      }}
    >
      <User size={14} />
    </span>
  );
}

export default function ChatWidget() {
  const { open, setOpen } = useChatWidget();
  const [input, setInput] = useState("");
  const { sendMessage, messages, sending } = useResumeChat();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, sending]);

  const handleSend = () => {
    if (!input.trim()) return;
    console.log("ChatWidget: sending message to", "/api/resume-query");
    sendMessage(input);
    setInput("");
  };

  return (
    <div className="fixed bottom-3 right-6 z-50">
      {open && (
        <div
          className="mb-2 flex h-[44rem] w-[26rem] max-h-[85vh] flex-col overflow-hidden rounded-2xl border shadow-2xl sm:h-[50rem] sm:w-[32rem]"
          style={{
            backgroundColor: "var(--color-bg-raised)",
            borderColor: "var(--color-border-default)",
          }}
        >
          <div
            className="flex items-center justify-between border-b px-4 py-3"
            style={{ borderColor: "var(--color-border-subtle)" }}
          >
            <div className="flex items-center gap-3">
              <span
                className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full border"
                style={{ borderColor: "var(--color-border-default)" }}
              >
                <Image src="/img/logo.png" alt={profile.name} fill className="object-cover" />
              </span>
              <div>
                <p className="font-accent text-sm font-semibold" style={{ color: "var(--color-text-primary)" }}>
                  {profile.name}
                </p>
                <p className="flex items-center gap-1.5 font-mono-label text-[11px]" style={{ color: "var(--color-text-tertiary)" }}>
                  <span className="relative flex h-1.5 w-1.5 shrink-0">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-green-400" />
                  </span>
                  {sending ? "Thinking…" : "Online"}
                </p>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors duration-150 hover:opacity-70"
              style={{ color: "var(--color-text-tertiary)" }}
              aria-label="Close chat"
            >
              <X size={16} />
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-3">
            {messages.length === 0 && (
              <p className="font-accent text-sm leading-relaxed" style={{ color: "var(--color-text-tertiary)" }}>
                This is my AI agent — trained on my real experience, skills and projects. Chat with it
                like you&apos;re chatting with the actual {profile.name}.
              </p>
            )}
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex items-end gap-2 ${m.from === "visitor" ? "flex-row-reverse" : ""}`}
              >
                {m.from === "visitor" ? <UserAvatar /> : <AgentAvatar />}
                <div
                  className="max-w-[78%] rounded-xl px-3 py-2 text-sm"
                  style={
                    m.from === "visitor"
                      ? {
                          backgroundColor: "var(--color-bg-accent)",
                          color: "var(--color-text-on-accent)",
                        }
                      : {
                          backgroundColor: "var(--color-bg-sunken)",
                          color: "var(--color-text-primary)",
                        }
                  }
                >
                  {m.from === "agent" ? <FormattedMessage text={m.text} /> : m.text}
                </div>
              </div>
            ))}
            {sending && (
              <div className="flex items-end gap-2">
                <AgentAvatar />
                <div
                  className="flex w-fit items-center gap-1 rounded-xl px-3 py-2.5"
                  style={{ backgroundColor: "var(--color-bg-sunken)" }}
                  aria-label="Kamran's AI agent is thinking"
                >
                  <span
                    className="h-1.5 w-1.5 animate-bounce rounded-full [animation-delay:-0.3s]"
                    style={{ backgroundColor: "var(--color-text-tertiary)" }}
                  />
                  <span
                    className="h-1.5 w-1.5 animate-bounce rounded-full [animation-delay:-0.15s]"
                    style={{ backgroundColor: "var(--color-text-tertiary)" }}
                  />
                  <span
                    className="h-1.5 w-1.5 animate-bounce rounded-full"
                    style={{ backgroundColor: "var(--color-text-tertiary)" }}
                  />
                </div>
              </div>
            )}
          </div>

          <div
            className="flex items-center gap-2 border-t p-3"
            style={{ borderColor: "var(--color-border-subtle)" }}
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Type a message…"
              className="flex-1 rounded-lg px-3 py-2 text-sm outline-none placeholder-[var(--color-text-tertiary)]"
              style={{
                backgroundColor: "var(--color-bg-sunken)",
                color: "var(--color-text-primary)",
              }}
            />
            <button
              onClick={handleSend}
              aria-label="Send message"
              className="js-btn flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border transition-colors duration-150"
              data-variant="primary"
              style={{
                backgroundColor: "var(--color-bg-accent)",
                color: "var(--color-text-on-accent)",
                borderColor: "var(--color-bg-accent)",
              }}
            >
              <Send size={15} />
            </button>
          </div>
        </div>
      )}

      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="js-btn inline-flex h-12 items-center gap-2.5 rounded-full border px-5 font-accent text-sm font-semibold shadow-lg transition-colors duration-150"
          data-variant="primary"
          style={{
            backgroundColor: "var(--color-bg-accent)",
            color: "var(--color-text-on-accent)",
            borderColor: "var(--color-bg-accent)",
          }}
        >
          <span className="relative flex h-2 w-2 shrink-0">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-green-400" />
          </span>
          <MessageCircle size={16} />
          Chat with my AI
        </button>
      )}
    </div>
  );
}
