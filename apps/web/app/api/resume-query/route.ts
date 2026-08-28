import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const question = body?.question;

  if (typeof question !== "string" || !question.trim()) {
    return NextResponse.json({ error: "A non-empty 'question' is required." }, { status: 400 });
  }

  const baseUrl = process.env.RESUME_RAG_API_URL || "http://localhost:8000";

  let res: Response;
  try {
    res = await fetch(`${baseUrl}/query`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question }),
    });
  } catch (err) {
    console.error("Failed to reach agent backend:", err);
    return NextResponse.json(
      { error: `Resume RAG backend is not reachable. Is it running on ${baseUrl}?` },
      { status: 502 }
    );
  }

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    console.error("agent backend returned an error:", res.status, detail);
    return NextResponse.json(
      { error: "Resume RAG backend returned an error." },
      { status: res.status }
    );
  }

  const data = await res.json();
  return NextResponse.json({ answer: data.answer });
}
