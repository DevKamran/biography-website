"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { BlogPostSummary } from "@/lib/blog-api";

export default function AdminBlogDashboard() {
  const router = useRouter();
  const [posts, setPosts] = useState<BlogPostSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busySlug, setBusySlug] = useState<string | null>(null);

  async function load() {
    setError(null);
    const res = await fetch("/api/blog/posts?page_size=50");
    if (!res.ok) {
      setError("Failed to load posts.");
      return;
    }
    const data = await res.json();
    setPosts(data.posts);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleDelete(slug: string) {
    if (!window.confirm(`Delete "${slug}"? This can't be undone.`)) return;
    setBusySlug(slug);
    const res = await fetch(`/api/blog/posts/${encodeURIComponent(slug)}`, { method: "DELETE" });
    setBusySlug(null);
    if (!res.ok && res.status !== 204) {
      setError("Failed to delete post.");
      return;
    }
    setPosts((prev) => prev?.filter((p) => p.slug !== slug) ?? null);
  }

  async function handleToggleStatus(post: BlogPostSummary) {
    const nextStatus = post.status === "published" ? "draft" : "published";
    setBusySlug(post.slug);
    const res = await fetch(`/api/blog/posts/${encodeURIComponent(post.slug)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: nextStatus }),
    });
    setBusySlug(null);
    if (!res.ok) {
      setError("Failed to update status.");
      return;
    }
    const updated = await res.json();
    setPosts((prev) => prev?.map((p) => (p.slug === post.slug ? updated : p)) ?? null);
  }

  async function handleLogout() {
    await fetch("/api/blog-admin/logout", { method: "POST" });
    router.replace("/admin/blog/login");
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-5xl px-5 py-12 sm:px-10" style={{ minHeight: "100vh", backgroundColor: "var(--color-bg-surface)" }}>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-accent text-3xl font-bold" style={{ color: "var(--color-text-primary)" }}>
          Posts
        </h1>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/blog/new"
            className="rounded-full px-5 py-2.5 font-accent text-sm font-semibold"
            style={{ backgroundColor: "var(--color-bg-accent)", color: "var(--color-text-on-accent)" }}
          >
            + Add New
          </Link>
          <button
            onClick={handleLogout}
            className="rounded-full border px-4 py-2.5 font-accent text-sm font-semibold"
            style={{ borderColor: "var(--color-border-default)", color: "var(--color-text-secondary)" }}
          >
            Log out
          </button>
        </div>
      </div>

      {error && (
        <p className="mb-4 font-sans text-sm" style={{ color: "var(--color-status-error)" }}>
          {error}
        </p>
      )}

      {!posts ? (
        <p className="font-sans text-sm" style={{ color: "var(--color-text-secondary)" }}>
          Loading…
        </p>
      ) : posts.length === 0 ? (
        <p className="font-sans text-sm" style={{ color: "var(--color-text-secondary)" }}>
          No posts yet.{" "}
          <Link href="/admin/blog/new" style={{ color: "var(--color-text-accent)" }}>
            Write your first one
          </Link>
          .
        </p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border" style={{ borderColor: "var(--color-border-subtle)" }}>
          <table className="w-full border-collapse font-sans text-sm">
            <thead>
              <tr style={{ backgroundColor: "var(--color-bg-raised)" }}>
                {["Title", "Category", "Status", "Updated", ""].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left font-mono-label text-xs uppercase tracking-widest"
                    style={{ color: "var(--color-text-tertiary)" }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => (
                <tr key={post.id} className="border-t" style={{ borderColor: "var(--color-border-subtle)" }}>
                  <td className="px-4 py-3" style={{ color: "var(--color-text-primary)" }}>
                    {post.title}
                  </td>
                  <td className="px-4 py-3" style={{ color: "var(--color-text-secondary)" }}>
                    {post.category}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleToggleStatus(post)}
                      disabled={busySlug === post.slug}
                      className="rounded-full border px-3 py-1 font-mono-label text-[11px] uppercase tracking-widest disabled:opacity-60"
                      style={
                        post.status === "published"
                          ? { borderColor: "var(--color-status-success)", color: "var(--color-status-success)" }
                          : { borderColor: "var(--color-border-default)", color: "var(--color-text-tertiary)" }
                      }
                    >
                      {post.status}
                    </button>
                  </td>
                  <td className="px-4 py-3" style={{ color: "var(--color-text-tertiary)" }}>
                    {new Date(post.updated_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-4">
                      <Link href={`/admin/blog/${post.slug}/edit`} style={{ color: "var(--color-text-accent)" }}>
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(post.slug)}
                        disabled={busySlug === post.slug}
                        style={{ color: "var(--color-status-error)" }}
                        className="disabled:opacity-60"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
