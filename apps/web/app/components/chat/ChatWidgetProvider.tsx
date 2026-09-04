"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

type ChatWidgetContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

const ChatWidgetContext = createContext<ChatWidgetContextValue | null>(null);

export function ChatWidgetProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return <ChatWidgetContext.Provider value={{ open, setOpen }}>{children}</ChatWidgetContext.Provider>;
}

export function useChatWidget() {
  const ctx = useContext(ChatWidgetContext);
  if (!ctx) throw new Error("useChatWidget must be used within a ChatWidgetProvider");
  return ctx;
}
