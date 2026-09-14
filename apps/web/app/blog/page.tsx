import type { Metadata } from "next";
import Link from "next/link";
import { getCategories, getPosts } from "@/lib/blog-api";
import BlogPostCard from "../components/blog/BlogPostCard";
import CategoryFilter from "../components/blog/CategoryFilter";

export const metadata: Metadata = {
  title: "Blog | Kamran Ali",
  description: "Writing on frontend engineering, AI-powered products, and building SaaS interfaces.",
};

export default async function BlogIndexPage({
  searchParams,
}: {
  searchParams: { category?: string; page?: string };
}) {
  const page = Number(searchParams.page) > 0 ? Number(searchParams.page) : 1;
  const [{ posts, total, page_size }, categories] = await Promise.all([
    getPosts({ category: searchParams.category, page }),
    getCategories(),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / page_size));

  return (
    <div className="flex flex-col gap-10">
      <div className="max-w-2xl">
        <p className="mb-3 font-mono-label text-xs uppercase tracking-[0.2em]" style={{ color: "var(--color-text-accent)" }}>
          Writing
        </p>
        <h1
          className="font-accent text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl"
          style={{ color: "var(--color-text-primary)" }}
        >
          Blog
        </h1>
      </div>

      <CategoryFilter categories={categories} activeCategory={searchParams.category} />

      {posts.length === 0 ? (
        <p className="font-sans text-base" style={{ color: "var(--color-text-secondary)" }}>
          No posts yet — check back soon.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <BlogPostCard key={post.id} post={post} />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4">
          {page > 1 && (
            <Link
              href={`/blog?${new URLSearchParams({ ...(searchParams.category ? { category: searchParams.category } : {}), page: String(page - 1) }).toString()}`}
              className="font-mono-label text-xs uppercase tracking-widest transition-opacity hover:opacity-70"
              style={{ color: "var(--color-text-secondary)" }}
            >
              ← Previous
            </Link>
          )}
          <span className="font-mono-label text-xs" style={{ color: "var(--color-text-tertiary)" }}>
            Page {page} of {totalPages}
          </span>
          {page < totalPages && (
            <Link
              href={`/blog?${new URLSearchParams({ ...(searchParams.category ? { category: searchParams.category } : {}), page: String(page + 1) }).toString()}`}
              className="font-mono-label text-xs uppercase tracking-widest transition-opacity hover:opacity-70"
              style={{ color: "var(--color-text-secondary)" }}
            >
              Next →
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
