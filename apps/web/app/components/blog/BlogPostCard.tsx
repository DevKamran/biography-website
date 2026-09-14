import Link from "next/link";
import type { BlogPostSummary } from "@/lib/blog-api";

export function formatPostDate(value: string | null): string {
  if (!value) return "Draft";
  return new Date(value).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

export default function BlogPostCard({ post }: { post: BlogPostSummary }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border transition-colors duration-150"
      style={{ borderColor: "var(--color-border-subtle)", backgroundColor: "var(--color-bg-raised)" }}
    >
      {post.cover_image && (
        <div className="aspect-[16/9] w-full overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element -- cover images are arbitrary admin-entered URLs, not part of next/image's allow-listed domains */}
          <img
            src={post.cover_image}
            alt={post.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        </div>
      )}
      <div className="flex flex-1 flex-col gap-3 p-6">
        <span
          className="w-fit rounded-full border px-3 py-1 font-mono-label text-[11px] uppercase tracking-widest"
          style={{ borderColor: "var(--color-border-default)", color: "var(--color-text-accent)" }}
        >
          {post.category}
        </span>
        <h3
          className="font-accent text-xl font-semibold leading-snug transition-opacity group-hover:opacity-80"
          style={{ color: "var(--color-text-primary)" }}
        >
          {post.title}
        </h3>
        {post.excerpt && (
          <p className="line-clamp-3 font-sans text-sm" style={{ color: "var(--color-text-secondary)" }}>
            {post.excerpt}
          </p>
        )}
        <p className="mt-auto font-mono-label text-xs" style={{ color: "var(--color-text-tertiary)" }}>
          {formatPostDate(post.published_at)}
        </p>
      </div>
    </Link>
  );
}
