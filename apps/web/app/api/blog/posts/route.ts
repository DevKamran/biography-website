import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/blog-admin-auth";

export const dynamic = "force-dynamic";

const baseUrl = () => (process.env.RESUME_RAG_API_URL || "http://localhost:8000").replace(/\/$/, "");

export async function GET(req: NextRequest) {
  const admin = await isAdminRequest(req);
  const search = req.nextUrl.searchParams.toString();
  let res: Response;
  try {
    res = await fetch(`${baseUrl()}/blog/posts${search ? `?${search}` : ""}`, {
      headers: { "X-Admin-Token": admin ? process.env.BLOG_ADMIN_TOKEN || "" : "" },
      cache: "no-store",
    });
  } catch (err) {
    console.error("Failed to reach agent backend:", err);
    return NextResponse.json({ error: "Blog backend is not reachable." }, { status: 502 });
  }
  const data = await res.json().catch(() => null);
  return NextResponse.json(data, { status: res.status });
}

export async function POST(req: NextRequest) {
  if (!(await isAdminRequest(req))) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const body = await req.text();
  let res: Response;
  try {
    res = await fetch(`${baseUrl()}/blog/posts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Admin-Token": process.env.BLOG_ADMIN_TOKEN || "",
      },
      body,
      cache: "no-store",
    });
  } catch (err) {
    console.error("Failed to reach agent backend:", err);
    return NextResponse.json({ error: "Blog backend is not reachable." }, { status: 502 });
  }
  const data = await res.json().catch(() => null);
  return NextResponse.json(data, { status: res.status });
}
