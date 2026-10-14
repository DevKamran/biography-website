"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ChevronUp, FileDown, Loader2, Mail, MessageCircle, Minus, Send, User, X } from "lucide-react";
import { profile } from "@/lib/portfolio-data";
import { renderBold } from "@/lib/render-bold";
import { useResumeChat } from "@/lib/use-resume-chat";
import { useChatWidget } from "./ChatWidgetProvider";

const BULLET_RE = /^[*-]\s+/;

// The backend answers over a single request/response, so we can't observe
// tool-call events directly — this infers which tool is likely running from
// the visitor's own wording, purely to pick a matching loading state. Plain
// questions (no tool implied) fall back to the regular "thinking" indicator.
type LoadingStage = { key: "email" | "download" | "thinking"; label: string };

function getLoadingStage(lastVisitorText: string): LoadingStage {
  const t = lastVisitorText.toLowerCase();
  if (/\b(email|mail)\b/.test(t) && /\b(send|mail|share)\b/.test(t)) {
    return { key: "email", label: "Calling send_resume_email…" };
  }
  if (/\b(resume|cv)\b/.test(t) && /\b(pdf|download|file|link|copy)\b/.test(t)) {
    return { key: "download", label: "Calling get_resume_pdf_link…" };
  }
  return { key: "thinking", label: "Thinking…" };
}

const LOADING_ICONS: Record<LoadingStage["key"], typeof Mail> = {
  email: Mail,
  download: FileDown,
  thinking: MessageCircle,
};

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
      aria-hidden="true"
      className="relative flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full border"
      style={{ borderColor: "var(--color-border-default)" }}
    >
      <Image src="/img/logo.png" alt="" fill className="object-cover" />
    </span>
  );
}

function UserAvatar() {
  return (
    <span
      aria-hidden="true"
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

/** Plain-text version of an agent reply for the screen-reader announcement:
 * drops the **bold** markers and turns [label](href) links into their label. */
function toSpokenText(text: string) {
  return text
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/^[*-]\s+/gm, "");
}

const ICON_BUTTON_CLASS =
  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors duration-150 hover:opacity-70";

export default function ChatWidget() {
  const { open, setOpen } = useChatWidget();
  const [input, setInput] = useState("");
  const [minimized, setMinimized] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const { sendMessage, messages, sending } = useResumeChat();
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const launcherRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLElement>(null);
  // Whatever had focus when the chat opened ("Chat with my AI", or the
  // "Try it" button in ChatAgentFeature) gets focus back on close (WCAG 2.4.3).
  const openerRef = useRef<HTMLElement | null>(null);
  const wasOpenRef = useRef(false);
  const announcedIdRef = useRef<string | null>(null);

  const lastVisitorMessage = [...messages].reverse().find((m) => m.from === "visitor");
  const loadingStage = getLoadingStage(lastVisitorMessage?.text ?? "");
  const LoadingIcon = LOADING_ICONS[loadingStage.key];

  useEffect(() => {
    if (open) {
      openerRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      // Reset so the widget always opens in its normal state.
      setMinimized(false);
      inputRef.current?.focus();
    } else if (wasOpenRef.current) {
      const opener = openerRef.current;
      const target = opener && opener.isConnected && opener !== document.body ? opener : launcherRef.current;
      target?.focus();
    }
    wasOpenRef.current = open;
  }, [open]);

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: reduceMotion ? "auto" : "smooth" });
  }, [messages, sending]);

  // Screen readers hear the progress and each new agent reply through one
  // polite live region, so focus can stay in the input (WCAG 4.1.3). The
  // visitor's own messages are not announced back to them.
  useEffect(() => {
    if (sending) {
      setAnnouncement(loadingStage.key === "thinking" ? `${profile.name}'s AI is thinking…` : loadingStage.label);
      return;
    }
    const last = messages[messages.length - 1];
    if (last && last.from === "agent" && last.id !== announcedIdRef.current) {
      announcedIdRef.current = last.id;
      setAnnouncement(`${profile.name} said: ${toSpokenText(last.text)}`);
    }
  }, [messages, sending, loadingStage.key, loadingStage.label]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) {
      inputRef.current?.focus();
      return;
    }
    console.log("ChatWidget: sending message to", "/api/resume-query");
    sendMessage(input);
    setInput("");
  };

  // Escape closes the chat while focus is anywhere inside it.
  useEffect(() => {
    const panel = panelRef.current;
    if (!open || !panel) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        setOpen(false);
      }
    };
    panel.addEventListener("keydown", onKeyDown);
    return () => panel.removeEventListener("keydown", onKeyDown);
  }, [open, setOpen]);

  return (
    <div data-chat-widget className="pointer-events-none fixed inset-x-3 bottom-3 z-[110] flex justify-end sm:inset-x-auto sm:right-6">
      {open && (
        <section
          id="chat-panel"
          ref={panelRef}
          role="dialog"
          aria-modal="false"
          aria-labelledby="chat-title"
          aria-describedby="chat-help"
          className={`pointer-events-auto mb-2 flex max-h-[calc(100dvh-1.5rem)] w-full flex-col overflow-hidden rounded-2xl border shadow-2xl sm:w-[26rem] md:w-[32rem] ${
            minimized ? "h-auto" : "h-[75dvh] sm:h-[44rem] md:h-[50rem]"
          }`}
          style={{
            backgroundColor: "var(--color-bg-raised)",
            borderColor: "var(--color-border-default)",
          }}
        >
          <p id="chat-help" className="sr-only">
            Answers come from an AI agent trained on {profile.name}&apos;s experience. New replies are read out
            automatically. Press Escape to close the chat.
          </p>

          <div
            className="flex items-center justify-between border-b px-4 py-3"
            style={{ borderColor: "var(--color-border-subtle)" }}
          >
            <div className="flex min-w-0 items-center gap-3">
              <span
                aria-hidden="true"
                className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full border"
                style={{ borderColor: "var(--color-border-default)" }}
              >
                <Image src="/img/logo.png" alt="" fill className="object-cover" />
              </span>
              <div className="min-w-0">
                <h2
                  id="chat-title"
                  className="font-accent text-sm font-semibold"
                  style={{ color: "var(--color-text-primary)" }}
                >
                  {profile.name}
                  <span className="sr-only"> — AI assistant chat</span>
                </h2>
                {/* Visual only: the live region below speaks this to screen readers. */}
                <p
                  aria-hidden="true"
                  className="flex items-center gap-1.5 font-mono-label text-[11px]"
                  style={{ color: "var(--color-text-tertiary)" }}
                >
                  <span className="relative flex h-1.5 w-1.5 shrink-0">
                    <span className="absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75 motion-safe:animate-ping" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-green-400" />
                  </span>
                  {sending ? loadingStage.label : "Online"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setMinimized((m) => !m)}
                className={ICON_BUTTON_CLASS}
                style={{ color: "var(--color-text-tertiary)" }}
                aria-label={minimized ? "Restore chat" : "Minimize chat"}
              >
                {minimized ? <ChevronUp size={16} aria-hidden="true" /> : <Minus size={16} aria-hidden="true" />}
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className={ICON_BUTTON_CLASS}
                style={{ color: "var(--color-text-tertiary)" }}
                aria-label="Close chat"
              >
                <X size={16} aria-hidden="true" />
              </button>
            </div>
          </div>

          <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
            {announcement}
          </div>

          {!minimized && (
          <>
          <div
            ref={scrollRef}
            role="region"
            aria-label="Conversation"
            // Focusable so keyboard users can scroll back through long replies
            // (axe: scrollable-region-focusable).
            // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
            tabIndex={0}
            className="flex-1 overflow-y-auto px-4 py-3"
          >
            {messages.length === 0 && (
              <p className="font-accent text-sm leading-relaxed" style={{ color: "var(--color-text-tertiary)" }}>
                This is my AI agent — trained on my real experience, skills and projects. Chat with it
                like you&apos;re chatting with the actual {profile.name}.
              </p>
            )}
            <ol className="space-y-3" aria-busy={sending}>
              {messages.map((m) => (
                <li
                  key={m.id}
                  className={`flex items-end gap-2 ${m.from === "visitor" ? "flex-row-reverse" : ""}`}
                >
                  {m.from === "visitor" ? <UserAvatar /> : <AgentAvatar />}
                  <div
                    className="max-w-[78%] break-words rounded-xl px-3 py-2 text-sm"
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
                    {/* Who said it, for screen readers — the bubble side and colour carry it visually (1.3.1). */}
                    <span className="sr-only">{m.from === "visitor" ? "You said: " : `${profile.name} said: `}</span>
                    {m.from === "agent" ? <FormattedMessage text={m.text} /> : m.text}
                  </div>
                </li>
              ))}
            </ol>
            {sending && (
              <div className="mt-3 flex items-end gap-2" aria-hidden="true">
                <AgentAvatar />
                {loadingStage.key === "thinking" ? (
                  <div
                    className="flex w-fit items-center gap-1 rounded-xl px-3 py-2.5"
                    style={{ backgroundColor: "var(--color-bg-sunken)" }}
                  >
                    <span
                      className="h-1.5 w-1.5 rounded-full motion-safe:animate-bounce [animation-delay:-0.3s]"
                      style={{ backgroundColor: "var(--color-text-tertiary)" }}
                    />
                    <span
                      className="h-1.5 w-1.5 rounded-full motion-safe:animate-bounce [animation-delay:-0.15s]"
                      style={{ backgroundColor: "var(--color-text-tertiary)" }}
                    />
                    <span
                      className="h-1.5 w-1.5 rounded-full motion-safe:animate-bounce"
                      style={{ backgroundColor: "var(--color-text-tertiary)" }}
                    />
                  </div>
                ) : (
                  <div
                    className="flex w-fit items-center gap-2 rounded-xl px-3 py-2.5"
                    style={{ backgroundColor: "var(--color-bg-sunken)" }}
                  >
                    <span className="relative flex h-4 w-4 shrink-0 items-center justify-center">
                      <LoadingIcon size={13} style={{ color: "var(--color-text-accent)" }} />
                      <Loader2
                        size={20}
                        className="absolute motion-safe:animate-spin"
                        style={{ color: "var(--color-text-accent)", opacity: 0.35 }}
                      />
                    </span>
                    <span className="text-xs font-medium" style={{ color: "var(--color-text-tertiary)" }}>
                      {loadingStage.label}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          <form
            onSubmit={handleSubmit}
            className="flex items-center gap-2 border-t p-3"
            style={{ borderColor: "var(--color-border-subtle)" }}
          >
            <label htmlFor="chat-input" className="sr-only">
              Message {profile.name}&apos;s AI
            </label>
            <input
              id="chat-input"
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message…"
              autoComplete="off"
              enterKeyHint="send"
              className="min-w-0 flex-1 rounded-lg border px-3 py-2 text-sm placeholder-[var(--color-text-tertiary)]"
              style={{
                backgroundColor: "var(--color-bg-sunken)",
                borderColor: "var(--color-border-input)",
                color: "var(--color-text-primary)",
              }}
            />
            <button
              type="submit"
              aria-label="Send message"
              className="js-btn flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border transition-colors duration-150"
              data-variant="primary"
              style={{
                backgroundColor: "var(--color-bg-accent)",
                color: "var(--color-text-on-accent)",
                borderColor: "var(--color-bg-accent)",
              }}
            >
              <Send size={15} aria-hidden="true" />
            </button>
          </form>
          </>
          )}
        </section>
      )}

      {!open && (
        <button
          ref={launcherRef}
          type="button"
          onClick={() => setOpen(true)}
          aria-haspopup="dialog"
          className="js-btn pointer-events-auto inline-flex h-12 items-center gap-2.5 rounded-full border px-5 font-accent text-sm font-semibold shadow-lg transition-colors duration-150"
          data-variant="primary"
          style={{
            backgroundColor: "var(--color-bg-accent)",
            color: "var(--color-text-on-accent)",
            borderColor: "var(--color-bg-accent)",
          }}
        >
          <span aria-hidden="true" className="relative flex h-2 w-2 shrink-0">
            <span className="absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75 motion-safe:animate-ping" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-green-400" />
          </span>
          <MessageCircle size={16} aria-hidden="true" />
          Chat with my AI
        </button>
      )}
    </div>
  );
}
