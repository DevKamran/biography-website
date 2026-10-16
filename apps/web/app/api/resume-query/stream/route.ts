import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type HistoryMessage = { role: "user" | "assistant"; content: string };

// Streaming twin of /api/resume-query: forwards the agent's NDJSON event
// stream from POST /query/stream to the browser unchanged. Aborting the
// browser request (the chat's Stop button) aborts the upstream fetch too, so
// the agent stops generating.
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const question = body?.question;
  const rawHistory = Array.isArray(body?.history) ? body.history : [];

  if (typeof question !== "string" || !question.trim()) {
    return NextResponse.json({ error: "A non-empty 'question' is required." }, { status: 400 });
  }

  const history: HistoryMessage[] = rawHistory.filter(
    (m: unknown): m is HistoryMessage =>
      typeof m === "object" &&
      m !== null &&
      ["user", "assistant"].includes((m as HistoryMessage).role) &&
      typeof (m as HistoryMessage).content === "string"
  );

  const baseUrl = (process.env.RESUME_RAG_API_URL || "http://localhost:8000").replace(/\/$/, "");

  let res: Response;
  try {
    res = await fetch(`${baseUrl}/query/stream`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question, history }),
      cache: "no-store",
      signal: req.signal,
    });
  } catch (err) {
    console.error("Failed to reach agent backend:", err);
    return NextResponse.json({ error: "The assistant is offline right now." }, { status: 502 });
  }

  if (!res.ok || !res.body) {
    // 404 means an agent without the streaming endpoint; the client falls
    // back to the one-shot /api/resume-query in that case.
    return NextResponse.json({ error: "The assistant returned an error." }, { status: res.status === 404 ? 404 : 502 });
  }

  return new Response(res.body, {
    headers: { "Content-Type": "application/x-ndjson", "Cache-Control": "no-store" },
  });
}
