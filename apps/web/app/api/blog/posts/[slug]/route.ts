import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/blog-admin-auth";

export const dynamic = "force-dynamic";

const baseUrl = () => (process.env.RESUME_RAG_API_URL || "http://localhost:8000").replace(/\/$/, "");

async function proxy(slug: string, method: string, admin: boolean, body?: string) {
  let res: Response;
  try {
    res = await fetch(`${baseUrl()}/blog/posts/${encodeURIComponent(slug)}`, {
      method,
      headers: {
        ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
        "X-Admin-Token": admin ? process.env.BLOG_ADMIN_TOKEN || "" : "",
      },
      body,
      cache: "no-store",
    });
  } catch (err) {
    console.error("Failed to reach agent backend:", err);
    return NextResponse.json({ error: "Blog backend is not reachable." }, { status: 502 });
  }

  if (res.status === 204) return new NextResponse(null, { status: 204 });
  const data = await res.json().catch(() => null);
  return NextResponse.json(data, { status: res.status });
}

export async function GET(req: NextRequest, { params }: { params: { slug: string } }) {
  return proxy(params.slug, "GET", await isAdminRequest(req));
}

export async function PUT(req: NextRequest, { params }: { params: { slug: string } }) {
  if (!(await isAdminRequest(req))) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  return proxy(params.slug, "PUT", true, await req.text());
}

export async function DELETE(req: NextRequest, { params }: { params: { slug: string } }) {
  if (!(await isAdminRequest(req))) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  return proxy(params.slug, "DELETE", true);
}
