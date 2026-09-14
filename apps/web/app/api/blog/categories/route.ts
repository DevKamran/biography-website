import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const baseUrl = () => (process.env.RESUME_RAG_API_URL || "http://localhost:8000").replace(/\/$/, "");

export async function GET() {
  let res: Response;
  try {
    res = await fetch(`${baseUrl()}/blog/categories`, { cache: "no-store" });
  } catch (err) {
    console.error("Failed to reach agent backend:", err);
    return NextResponse.json({ error: "Blog backend is not reachable." }, { status: 502 });
  }
  const data = await res.json().catch(() => null);
  return NextResponse.json(data, { status: res.status });
}
