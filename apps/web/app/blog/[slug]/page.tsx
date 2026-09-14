import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getPost } from "@/lib/blog-api";
import { formatPostDate } from "../../components/blog/BlogPostCard";

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post = await getPost(params.slug);
  if (!post) return { title: "Post not found | Kamran Ali" };
  return {
    title: `${post.title} | Kamran Ali`,
    description: post.excerpt || undefined,
    openGraph: post.cover_image ? { images: [{ url: post.cover_image }] } : undefined,
  };
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = await getPost(params.slug);
  if (!post) notFound();

  return (
    <article className="flex flex-col gap-8">
      <Link
        href="/blog"
        className="w-fit font-mono-label text-xs uppercase tracking-widest transition-opacity hover:opacity-70"
        style={{ color: "var(--color-text-secondary)" }}
      >
        ← All posts
      </Link>

      <div className="flex flex-col gap-4">
        <span
          className="w-fit rounded-full border px-3 py-1 font-mono-label text-[11px] uppercase tracking-widest"
          style={{ borderColor: "var(--color-border-default)", color: "var(--color-text-accent)" }}
        >
          {post.category}
        </span>
        <h1
          className="font-accent text-3xl font-bold leading-[1.1] tracking-tight sm:text-5xl"
          style={{ color: "var(--color-text-primary)" }}
        >
          {post.title}
        </h1>
        <p className="font-mono-label text-xs" style={{ color: "var(--color-text-tertiary)" }}>
          {formatPostDate(post.published_at)}
        </p>
      </div>

      {post.cover_image && (
        // eslint-disable-next-line @next/next/no-img-element -- arbitrary admin-entered URL, not part of next/image's allow-listed domains
        <img
          src={post.cover_image}
          alt={post.title}
          className="aspect-[16/9] w-full rounded-2xl object-cover"
        />
      )}

      <div
        className="blog-content font-sans text-base leading-relaxed"
        style={{ color: "var(--color-text-secondary)" }}
        dangerouslySetInnerHTML={{ __html: post.content }}
      />
    </article>
  );
}
