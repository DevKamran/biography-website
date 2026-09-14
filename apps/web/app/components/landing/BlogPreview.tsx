"use client";

import Link from "next/link";
import type { BlogPostSummary } from "@/lib/blog-api";
import BlogPostCard from "../blog/BlogPostCard";
import { useScrollReveal } from "./ui/gsap";
import Button from "./ui/Button";
import SectionHeading from "./ui/SectionHeading";

export default function BlogPreview({ posts }: { posts: BlogPostSummary[] }) {
  const containerRef = useScrollReveal<HTMLDivElement>("[data-reveal]", { stagger: 0.08, y: 32 });

  if (!posts.length) return null;

  return (
    <section id="blog" className="px-6 py-24 sm:px-12 lg:px-14" style={{ backgroundColor: "var(--color-bg-surface)" }}>
      <div ref={containerRef} className="mx-auto flex max-w-[1728px] flex-col gap-14">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading
            eyebrow="Blog / Writing"
            heading="From the blog"
            subtitle="Notes on frontend engineering, AI-powered products, and building interfaces that hold up in production."
          />
          <div data-reveal className="hidden sm:block">
            <Button href="/blog" variant="outline">
              View all posts
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {posts.map((post) => (
            <div key={post.id} data-reveal>
              <BlogPostCard post={post} />
            </div>
          ))}
        </div>

        <div data-reveal className="sm:hidden">
          <Link
            href="/blog"
            className="font-mono-label text-sm uppercase tracking-widest"
            style={{ color: "var(--color-text-accent)" }}
          >
            View all posts →
          </Link>
        </div>
      </div>
    </section>
  );
}
