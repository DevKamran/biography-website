"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Room, RoomEvent } from "livekit-client";

export type ChatMessage = {
  id: string;
  from: "visitor" | "agent";
  text: string;
  timestamp: number;
};

const CHAT_TOPIC = "chat";

export function useLiveKitChat() {
  const roomRef = useRef<Room | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [status, setStatus] = useState<
    "idle" | "connecting" | "connected" | "error"
  >("idle");
  const [agentPresent, setAgentPresent] = useState(false);

  const connect = useCallback(async () => {
    if (roomRef.current) return;
    setStatus("connecting");

    try {
      const res = await fetch("/api/livekit-token");
      if (!res.ok) throw new Error("Failed to fetch LiveKit token");
      const { token, url } = await res.json();

      const room = new Room();
      roomRef.current = room;

      room.registerTextStreamHandler(CHAT_TOPIC, async (reader, participantInfo) => {
        const text = await reader.readAll();
        setMessages((prev) => [
          ...prev,
          {
            id: `${Date.now()}-${Math.random()}`,
            from: participantInfo.identity.startsWith("visitor") ? "visitor" : "agent",
            text,
            timestamp: Date.now(),
          },
        ]);
      });

      room.on(RoomEvent.ParticipantConnected, (participant) => {
        if (!participant.identity.startsWith("visitor")) {
          setAgentPresent(true);
        }
      });

      room.on(RoomEvent.Disconnected, () => {
        setStatus("idle");
        setAgentPresent(false);
      });

      await room.connect(url, token);
      setStatus("connected");

      // Agent may already be in the room by the time we connect.
      room.remoteParticipants.forEach((p) => {
        if (!p.identity.startsWith("visitor")) setAgentPresent(true);
      });
    } catch (err) {
      console.error(err);
      setStatus("error");
    }
  }, []);

  const sendMessage = useCallback(async (text: string) => {
    const room = roomRef.current;
    if (!room || !text.trim()) return;

    setMessages((prev) => [
      ...prev,
      { id: `${Date.now()}-me`, from: "visitor", text, timestamp: Date.now() },
    ]);

    await room.localParticipant.sendText(text, { topic: CHAT_TOPIC });
  }, []);

  useEffect(() => {
    return () => {
      roomRef.current?.disconnect();
      roomRef.current = null;
    };
  }, []);

  return { connect, sendMessage, messages, status, agentPresent };
}
