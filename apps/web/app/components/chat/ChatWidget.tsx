"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import Image from "next/image";
import { AlertCircle, ChevronUp, MessageCircle, Minus, Send, Square, User, X } from "lucide-react";
import { profile } from "@/lib/portfolio-data";
import { renderBold } from "@/lib/render-bold";
import { useResumeChat, type ChatStatus } from "@/lib/use-resume-chat";
import { useChatWidget } from "./ChatWidgetProvider";

const BULLET_RE = /^[*-]\s+/;

// Progress labels for the agent's tools, as reported by the stream (see
// apps/agent/main.py /query/stream). Anything unknown is just "Thinking…".
const TOOL_LABELS: Record<string, string> = {
  resume_qa: "Searching my resume…",
  get_profile: "Looking up my profile…",
  get_skills: "Looking up my skills…",
  get_projects: "Looking up my projects…",
  get_experience: "Looking up my experience…",
  send_resume_email: "Sending the email…",
  get_resume_pdf_link: "Getting the resume link…",
  get_blog_posts: "Checking my blog posts…",
};

function progressLabel(status: ChatStatus, activeTool: string | null) {
  if (activeTool && TOOL_LABELS[activeTool]) return TOOL_LABELS[activeTool];
  return status === "streaming" ? "Replying…" : "Thinking…";
}

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
  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors duration-150 hover:bg-[var(--color-bg-sunken)]";

// How close (px) to the bottom still counts as "following" the conversation.
const STICKY_SCROLL_PX = 48;
const INPUT_MAX_HEIGHT_PX = 128;
// After a reply finishes on its own, Escape is ignored for this long: someone
// pressing Escape to stop a reply that has just ended means "stop", not
// "close the chat" (closing would also send their next keystrokes elsewhere).
const ESCAPE_GRACE_MS = 1500;

export default function ChatWidget() {
  const { open, setOpen } = useChatWidget();
  const [input, setInput] = useState("");
  const [minimized, setMinimized] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const [inputHint, setInputHint] = useState("");
  const { sendMessage, stop, retry, messages, status, busy, error, activeTool } = useResumeChat();
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const launcherRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLElement>(null);
  // Whatever had focus when the chat opened ("Chat with my AI", or the
  // "Try it" button in ChatAgentFeature) gets focus back on close (WCAG 2.4.3).
  const openerRef = useRef<HTMLElement | null>(null);
  const wasOpenRef = useRef(false);
  const followRef = useRef(true);
  const prevStatusRef = useRef<ChatStatus>(status);
  const announceTimerRef = useRef<number>();
  const prevToolRef = useRef<string | null>(null);
  const replyEndedAtRef = useRef(0);

  const label = progressLabel(status, activeTool);
  const agentName = `${profile.name}'s AI`;

  useEffect(() => {
    // A screen reader reads the status region as part of the dialog when it
    // opens, so leftover text ("…is thinking") would be announced as if live.
    setAnnouncement("");
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

  // Keep the newest message in view, but only while the visitor is already
  // at the bottom: never yank them away from something they scrolled back to.
  // Reduced motion gets an instant jump instead of a smooth scroll (2.3.3).
  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (!el || !followRef.current) return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollTo({ top: el.scrollHeight, behavior: reduceMotion ? "auto" : "smooth" });
  }, [messages, status]);

  const onConversationScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    followRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < STICKY_SCROLL_PX;
  };

  // Screen-reader announcements go through one polite live region so focus
  // can stay in the input (WCAG 4.1.3). While a reply streams in, the text
  // is NOT announced piece by piece — that floods the speech queue and gets
  // cut off. Instead: one "replying" notice (plus tool progress), then the
  // whole reply once it's complete, or a "stopped" notice. Errors are
  // announced separately by the role="alert" box.
  useEffect(() => {
    // Clear, then set on the next tick, so the same text twice in a row
    // (e.g. "thinking" for consecutive questions) is still announced.
    const announce = (text: string) => {
      setAnnouncement("");
      window.clearTimeout(announceTimerRef.current);
      announceTimerRef.current = window.setTimeout(() => setAnnouncement(text), 50);
    };
    const prev = prevStatusRef.current;
    prevStatusRef.current = status;
    const prevTool = prevToolRef.current;
    prevToolRef.current = activeTool;

    if (status === "waiting" && prev !== "waiting") {
      announce(`${agentName} is thinking. Press Escape to stop.`);
    } else if (busy && activeTool && activeTool !== prevTool && TOOL_LABELS[activeTool]) {
      announce(TOOL_LABELS[activeTool]);
    } else if (status === "idle" && (prev === "waiting" || prev === "streaming")) {
      replyEndedAtRef.current = Date.now();
      const last = messages[messages.length - 1];
      if (last?.from === "agent") announce(`${profile.name} said: ${toSpokenText(last.text)}`);
    } else if (status === "error" && prev !== "error") {
      // The role="alert" box announces the error; don't leave "thinking" behind.
      window.clearTimeout(announceTimerRef.current);
      setAnnouncement("");
    } else if (status === "stopped" && prev !== "stopped") {
      const last = messages[messages.length - 1];
      announce(
        last?.from === "agent" && last.stopped && last.text
          ? "Response stopped. The partial reply is kept in the conversation."
          : "Response stopped."
      );
    }
  }, [status, busy, activeTool, messages, agentName]);

  useEffect(() => () => window.clearTimeout(announceTimerRef.current), []);

  const resizeInput = () => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, INPUT_MAX_HEIGHT_PX)}px`;
  };

  useLayoutEffect(resizeInput, [input]);

  const submit = () => {
    if (busy) {
      setInputHint("Wait for the reply to finish, or press Escape to stop it.");
      return;
    }
    if (!input.trim()) {
      setInputHint("Type a message first.");
      inputRef.current?.focus();
      return;
    }
    if (sendMessage(input)) {
      setInput("");
      setInputHint("");
      followRef.current = true;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submit();
  };

  // Enter sends, Shift+Enter adds a new line. Ignore Enter while an IME is
  // composing so it can confirm the candidate text.
  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      submit();
    }
  };

  // Escape stops a reply in progress; otherwise it closes the chat (see ESCAPE_GRACE_MS).
  useEffect(() => {
    const panel = panelRef.current;
    if (!open || !panel) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      e.stopPropagation();
      if (busy) stop();
      else if (Date.now() - replyEndedAtRef.current >= ESCAPE_GRACE_MS) setOpen(false);
    };
    panel.addEventListener("keydown", onKeyDown);
    return () => panel.removeEventListener("keydown", onKeyDown);
  }, [open, setOpen, busy, stop]);

  const handleRetry = () => {
    // The Retry button disappears once the request restarts, so put focus
    // somewhere stable rather than letting it fall to <body> (2.4.3).
    inputRef.current?.focus();
    followRef.current = true;
    retry();
  };

  return (
    <div data-chat-widget className="pointer-events-none fixed inset-x-3 bottom-3 z-[110] flex justify-end sm:inset-x-auto sm:right-6">
      {open && (
        // On short viewports (400% zoom, landscape phones) the panel takes the
        // full height and the chrome tightens, so the conversation keeps
        // several readable lines instead of ~1 (WCAG 1.4.10 / 1.4.4).
        <section
          id="chat-panel"
          ref={panelRef}
          role="dialog"
          aria-modal="false"
          aria-labelledby="chat-title"
          aria-describedby="chat-help"
          className={`pointer-events-auto mb-2 flex max-h-[calc(100dvh-1.5rem)] w-full flex-col overflow-hidden rounded-2xl border shadow-2xl sm:w-[26rem] md:w-[32rem] ${
            minimized ? "h-auto" : "h-[75dvh] sm:h-[44rem] md:h-[50rem] [@media(max-height:500px)]:!h-[calc(100dvh-1.5rem)]"
          }`}
          style={{
            backgroundColor: "var(--color-bg-raised)",
            borderColor: "var(--color-border-default)",
          }}
        >
          <p id="chat-help" className="sr-only">
            Answers come from an AI agent trained on {profile.name}&apos;s experience. New replies are read out
            automatically when they finish. Press Escape to stop a reply, or to close the chat.
          </p>

          <div
            className="flex items-center justify-between border-b px-4 py-3 [@media(max-height:500px)]:py-1.5"
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
                  className="flex items-center gap-1.5 font-mono-label text-[11px] [@media(max-height:500px)]:!hidden"
                  style={{ color: "var(--color-text-tertiary)" }}
                >
                  <span className="relative flex h-1.5 w-1.5 shrink-0">
                    <span className="absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75 motion-safe:animate-ping" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-green-400" />
                  </span>
                  {busy ? label : "Online"}
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
                aria-expanded={!minimized}
                aria-controls="chat-body"
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

          <div id="chat-body" className={`min-h-0 flex-1 flex-col ${minimized ? "hidden" : "flex"}`}>
            <div
              ref={scrollRef}
              onScroll={onConversationScroll}
              role="region"
              aria-label="Conversation"
              // Focusable so keyboard users can scroll back through long replies
              // (axe: scrollable-region-focusable).
              // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
              tabIndex={0}
              className="flex-1 overflow-y-auto px-4 py-3 [@media(max-height:500px)]:py-2"
            >
              {messages.length === 0 && (
                <p className="font-accent text-sm leading-relaxed" style={{ color: "var(--color-text-tertiary)" }}>
                  This is my AI agent — trained on my real experience, skills and projects. Chat with it
                  like you&apos;re chatting with the actual {profile.name}.
                </p>
              )}
              <ol className="space-y-3">
                {messages.map((m) => (
                  <li
                    key={m.id}
                    className={`flex items-end gap-2 ${m.from === "visitor" ? "flex-row-reverse" : ""}`}
                  >
                    {m.from === "visitor" ? <UserAvatar /> : <AgentAvatar />}
                    <div
                      // A reply that is still arriving is marked busy so screen
                      // readers don't read it half-written; the live region
                      // reads the finished reply instead.
                      aria-busy={m.streaming || undefined}
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
                      {m.from === "agent" ? <FormattedMessage text={m.text} /> : <span className="whitespace-pre-wrap">{m.text}</span>}
                      {m.streaming && (
                        <span
                          aria-hidden="true"
                          className="ml-0.5 inline-block h-3.5 w-1.5 translate-y-0.5 rounded-sm motion-safe:animate-pulse"
                          style={{ backgroundColor: "var(--color-text-tertiary)" }}
                        />
                      )}
                      {m.stopped && (
                        <p className="mt-2 text-xs italic" style={{ color: "var(--color-text-tertiary)" }}>
                          {m.text ? "Response stopped." : "Response stopped before any reply arrived."}
                        </p>
                      )}
                    </div>
                  </li>
                ))}
              </ol>
              {status === "waiting" && (
                <div className="mt-3 flex items-end gap-2" aria-hidden="true">
                  <AgentAvatar />
                  <div
                    className="flex w-fit items-center gap-2 rounded-xl px-3 py-2.5"
                    style={{ backgroundColor: "var(--color-bg-sunken)" }}
                  >
                    <span className="flex items-center gap-1">
                      {["-0.3s", "-0.15s", "0s"].map((delay) => (
                        <span
                          key={delay}
                          className="h-1.5 w-1.5 rounded-full motion-safe:animate-bounce"
                          style={{ backgroundColor: "var(--color-text-tertiary)", animationDelay: delay }}
                        />
                      ))}
                    </span>
                    {/* Text, not only the animation, so the state is clear with motion off. */}
                    <span className="text-xs font-medium" style={{ color: "var(--color-text-tertiary)" }}>
                      {label}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Always rendered, so the alert is announced reliably when filled (4.1.3). */}
            <div role="alert" className="px-3">
              {error && (
                <div
                  className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-2 rounded-lg border px-3 py-2 text-sm"
                  style={{
                    borderColor: "var(--color-status-error)",
                    color: "var(--color-text-primary)",
                    backgroundColor: "var(--color-bg-raised)",
                  }}
                >
                  <AlertCircle size={16} aria-hidden="true" style={{ color: "var(--color-status-error)" }} />
                  <p className="min-w-0 flex-1">
                    <span className="font-semibold" style={{ color: "var(--color-status-error)" }}>
                      Error:
                    </span>{" "}
                    {error}
                  </p>
                  <button
                    type="button"
                    onClick={handleRetry}
                    className="js-btn min-h-[2rem] rounded-lg border px-3 text-sm font-semibold"
                    data-variant="outline"
                    style={{ borderColor: "var(--color-border-input)", color: "var(--color-text-primary)" }}
                  >
                    Retry
                  </button>
                </div>
              )}
            </div>

            <form
              onSubmit={handleSubmit}
              className="flex items-end gap-2 border-t p-3 [@media(max-height:500px)]:p-2"
              style={{ borderColor: "var(--color-border-subtle)" }}
            >
              <label htmlFor="chat-input" className="sr-only">
                Message {agentName}
              </label>
              <div className="min-w-0 flex-1">
                <textarea
                  id="chat-input"
                  ref={inputRef}
                  rows={1}
                  value={input}
                  onChange={(e) => {
                    setInput(e.target.value);
                    if (inputHint) setInputHint("");
                  }}
                  onKeyDown={handleInputKeyDown}
                  placeholder="Type a message…"
                  autoComplete="off"
                  enterKeyHint="send"
                  aria-describedby="chat-input-keys chat-input-hint"
                  className="block w-full resize-none rounded-lg border px-3 py-2 text-sm leading-5 placeholder-[var(--color-text-tertiary)]"
                  style={{
                    backgroundColor: "var(--color-bg-sunken)",
                    borderColor: "var(--color-border-input)",
                    color: "var(--color-text-primary)",
                    maxHeight: INPUT_MAX_HEIGHT_PX,
                  }}
                />
                <p id="chat-input-keys" className="sr-only">
                  Enter sends. Shift plus Enter adds a new line.
                </p>
                <p
                  id="chat-input-hint"
                  aria-live="polite"
                  className="text-xs [&:not(:empty)]:mt-1"
                  style={{ color: "var(--color-text-tertiary)" }}
                >
                  {inputHint}
                </p>
              </div>
              {/* One button that switches between Send and Stop, so it keeps
                  its place in the tab order and focus isn't lost mid-reply.
                  Always type="button": if it flipped to "submit" while handling
                  the Stop click, the browser would then submit the form too. */}
              <button
                type="button"
                onClick={busy ? stop : submit}
                aria-label={busy ? "Stop response" : "Send message"}
                className="js-btn flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border transition-colors duration-150"
                data-variant="primary"
                style={{
                  backgroundColor: "var(--color-bg-accent)",
                  color: "var(--color-text-on-accent)",
                  borderColor: "var(--color-bg-accent)",
                }}
              >
                {busy ? (
                  <Square size={13} fill="currentColor" aria-hidden="true" />
                ) : (
                  <Send size={15} aria-hidden="true" />
                )}
              </button>
            </form>
          </div>
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
