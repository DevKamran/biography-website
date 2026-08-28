"use client";

import { useCallback, useState } from "react";

export type ChatMessage = {
  id: string;
  from: "visitor" | "agent";
  text: string;
  timestamp: number;
};

export function useResumeChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim()) return;

    setMessages((prev) => [
      ...prev,
      { id: `${Date.now()}-me`, from: "visitor", text, timestamp: Date.now() },
    ]);
    setSending(true);
    setError(null);

    try {
      const res = await fetch("/api/resume-query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: text }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Request failed");

      setMessages((prev) => [
        ...prev,
        { id: `${Date.now()}-agent`, from: "agent", text: data.answer, timestamp: Date.now() },
      ]);
    } catch (err) {
      console.error(err);
      const message = err instanceof Error ? err.message : "Something went wrong.";
      setError(message);
      setMessages((prev) => [
        ...prev,
        {
          id: `${Date.now()}-error`,
          from: "agent",
          text: "Sorry, I couldn't reach the assistant right now.",
          timestamp: Date.now(),
        },
      ]);
    } finally {
      setSending(false);
    }
  }, []);

  return { messages, sendMessage, sending, error };
}
