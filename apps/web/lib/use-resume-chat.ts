"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type ChatMessage = {
  id: string;
  from: "visitor" | "agent";
  text: string;
  timestamp: number;
  /** True while the reply is still arriving. */
  streaming?: boolean;
  /** True when the visitor stopped the reply before it finished. */
  stopped?: boolean;
};

/**
 * idle      nothing in flight (also the state after a reply finished)
 * waiting   request sent, no reply text yet
 * streaming reply text is arriving
 * stopped   the visitor stopped the last reply
 * error     the last request failed; `error` says why, `retry()` resends it
 */
export type ChatStatus = "idle" | "waiting" | "streaming" | "stopped" | "error";

type StreamEvent =
  | { type: "tool"; name: string }
  | { type: "delta"; text: string }
  | { type: "done"; answer: string }
  | { type: "error"; message: string };

type History = { role: "user" | "assistant"; content: string }[];

class ChatRequestError extends Error {}

function toHistory(messages: ChatMessage[]): History {
  return messages
    .filter((m) => m.text.trim())
    .map((m) => ({ role: m.from === "visitor" ? "user" : "assistant", content: m.text }));
}

function errorMessageForStatus(status: number) {
  if (status === 400) return "That message couldn't be sent. Try rephrasing it.";
  if (status === 429) return "Too many messages at once. Wait a moment, then try again.";
  return "The assistant is unavailable right now. Try again in a moment.";
}

let idCounter = 0;
const nextId = (suffix: string) => `${Date.now()}-${++idCounter}-${suffix}`;

export function useResumeChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [status, setStatus] = useState<ChatStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  /** The agent tool currently running, if the stream reported one. */
  const [activeTool, setActiveTool] = useState<string | null>(null);

  const messagesRef = useRef(messages);
  messagesRef.current = messages;
  const controllerRef = useRef<AbortController | null>(null);
  const failedQuestionRef = useRef<string | null>(null);

  useEffect(() => () => controllerRef.current?.abort(), []);

  const run = useCallback(async (question: string, history: History) => {
    const controller = new AbortController();
    controllerRef.current = controller;
    const agentId = nextId("agent");
    let agentAdded = false;

    // Decide append-vs-update from `prev`, not from a closure flag: React may
    // run this updater later (or twice in Strict Mode), after the flag changed.
    const writeAgent = (text: string, extra: Partial<ChatMessage> = {}) => {
      agentAdded = true;
      setMessages((prev) =>
        prev.some((m) => m.id === agentId)
          ? prev.map((m) => (m.id === agentId ? { ...m, text, ...extra } : m))
          : [...prev, { id: agentId, from: "agent", text, timestamp: Date.now(), ...extra }]
      );
    };

    setStatus("waiting");
    setError(null);
    setActiveTool(null);
    failedQuestionRef.current = null;

    let streamedText = "";
    try {
      const init: RequestInit = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, history }),
        signal: controller.signal,
      };

      let res = await fetch("/api/resume-query/stream", init);

      // An agent without /query/stream: fall back to the one-shot endpoint.
      if (res.status === 404) {
        res = await fetch("/api/resume-query", init);
        if (!res.ok) throw new ChatRequestError(errorMessageForStatus(res.status));
        const data = await res.json();
        writeAgent(String(data.answer ?? ""), { streaming: false });
        setStatus("idle");
        return;
      }
      if (!res.ok || !res.body) throw new ChatRequestError(errorMessageForStatus(res.status));

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let finished = false;

      while (!finished) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.trim()) continue;
          const event = JSON.parse(line) as StreamEvent;
          if (event.type === "tool") {
            setActiveTool(event.name);
          } else if (event.type === "delta") {
            streamedText += event.text;
            writeAgent(streamedText, { streaming: true });
            setStatus("streaming");
          } else if (event.type === "done") {
            // The final answer replaces the streamed text: text streamed
            // during intermediate (tool-calling) turns isn't part of it.
            writeAgent(event.answer, { streaming: false });
            finished = true;
          } else if (event.type === "error") {
            throw new ChatRequestError("The reply was interrupted. Try again.");
          }
        }
      }

      if (!finished) throw new ChatRequestError("The reply was cut off. Try again.");
      setStatus("idle");
    } catch (err) {
      if (controller.signal.aborted) {
        // The visitor pressed Stop: keep whatever arrived, marked as stopped.
        // With nothing yet, an empty stopped message still shows it happened
        // (toHistory skips it, so the agent never sees an empty turn).
        writeAgent(streamedText, { streaming: false, stopped: true });
        setStatus("stopped");
        return;
      }
      console.error(err);
      // Drop a half-streamed reply; the error and Retry replace it.
      if (agentAdded) setMessages((prev) => prev.filter((m) => m.id !== agentId));
      failedQuestionRef.current = question;
      setError(
        err instanceof ChatRequestError
          ? err.message
          : "Couldn't connect to the assistant. Check your connection and try again."
      );
      setStatus("error");
    } finally {
      if (controllerRef.current === controller) controllerRef.current = null;
      setActiveTool(null);
    }
  }, []);

  const sendMessage = useCallback(
    (text: string) => {
      if (!text.trim() || controllerRef.current) return false;
      const history = toHistory(messagesRef.current);
      setMessages((prev) => [...prev, { id: nextId("me"), from: "visitor", text, timestamp: Date.now() }]);
      void run(text, history);
      return true;
    },
    [run]
  );

  const stop = useCallback(() => {
    controllerRef.current?.abort();
  }, []);

  /** Resends the question that failed. Its message is already in the list. */
  const retry = useCallback(() => {
    const question = failedQuestionRef.current;
    if (!question || controllerRef.current) return;
    const all = messagesRef.current;
    const lastVisitor = all.map((m) => m.from).lastIndexOf("visitor");
    void run(question, toHistory(all.slice(0, lastVisitor)));
  }, [run]);

  const busy = status === "waiting" || status === "streaming";

  return { messages, sendMessage, stop, retry, status, busy, error, activeTool };
}
