import Link from "next/link";
import { notFound } from "next/navigation";
import type { BlogPost } from "@/lib/blog-api";
import PostEditorForm from "../../../../components/blog-admin/PostEditorForm";

// middleware.ts already gates every /admin/blog/* route behind a valid admin
// session, so this Server Component can safely use the server-held
// BLOG_ADMIN_TOKEN to fetch the post directly — including drafts.
async function getPostForAdmin(slug: string): Promise<BlogPost | null> {
  const baseUrl = (process.env.RESUME_RAG_API_URL || "http://localhost:8000").replace(/\/$/, "");
  const res = await fetch(`${baseUrl}/blog/posts/${encodeURIComponent(slug)}`, {
    headers: { "X-Admin-Token": process.env.BLOG_ADMIN_TOKEN || "" },
    cache: "no-store",
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Failed to load post (${res.status})`);
  return res.json();
}

export default async function EditPostPage({ params }: { params: { slug: string } }) {
  const post = await getPostForAdmin(params.slug);
  if (!post) notFound();

  return (
    <div className="mx-auto max-w-3xl px-5 py-12 sm:px-10" style={{ minHeight: "100vh", backgroundColor: "var(--color-bg-surface)" }}>
      <Link
        href="/admin/blog"
        className="mb-6 inline-block font-mono-label text-xs uppercase tracking-widest"
        style={{ color: "var(--color-text-secondary)" }}
      >
        ← All posts
      </Link>
      <h1 className="mb-8 font-accent text-3xl font-bold" style={{ color: "var(--color-text-primary)" }}>
        Edit post
      </h1>
      <PostEditorForm initialPost={post} />
    </div>
  );
}
