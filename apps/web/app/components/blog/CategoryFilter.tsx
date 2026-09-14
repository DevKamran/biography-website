import Link from "next/link";
import type { BlogCategory } from "@/lib/blog-api";

export default function CategoryFilter({
  categories,
  activeCategory,
}: {
  categories: BlogCategory[];
  activeCategory?: string;
}) {
  if (!categories.length) return null;

  const pillStyle = (active: boolean): React.CSSProperties =>
    active
      ? { backgroundColor: "var(--color-bg-accent)", color: "var(--color-text-on-accent)", borderColor: "var(--color-bg-accent)" }
      : { backgroundColor: "transparent", color: "var(--color-text-secondary)", borderColor: "var(--color-border-default)" };

  return (
    <div className="flex flex-wrap gap-2">
      <Link
        href="/blog"
        className="inline-flex h-9 items-center rounded-full border px-4 font-mono-label text-xs tracking-wide transition-colors duration-150"
        style={pillStyle(!activeCategory)}
      >
        All
      </Link>
      {categories.map((cat) => (
        <Link
          key={cat.slug}
          href={`/blog?category=${encodeURIComponent(cat.name)}`}
          className="inline-flex h-9 items-center rounded-full border px-4 font-mono-label text-xs tracking-wide transition-colors duration-150"
          style={pillStyle(activeCategory === cat.name)}
        >
          {cat.name} ({cat.post_count})
        </Link>
      ))}
    </div>
  );
}
