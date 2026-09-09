import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const baseUrl = process.env.RESUME_RAG_API_URL || "http://localhost:8000";

  let res: Response;
  try {
    res = await fetch(`${baseUrl}/resume`, { cache: "no-store" });
  } catch (err) {
    console.error("Failed to reach agent backend for resume download:", err);
    return NextResponse.json(
      { error: `Resume RAG backend is not reachable. Is it running on ${baseUrl}?` },
      { status: 502 }
    );
  }

  if (!res.ok || !res.body) {
    return NextResponse.json({ error: "Resume file is not available." }, { status: res.status || 502 });
  }

  return new NextResponse(res.body, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'attachment; filename="KamranAli_Resume.pdf"',
    },
  });
}
