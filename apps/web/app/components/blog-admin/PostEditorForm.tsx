"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import LinkExtension from "@tiptap/extension-link";
import ImageExtension from "@tiptap/extension-image";
import type { BlogPost, BlogCategory } from "@/lib/blog-api";
import EditorToolbar from "./EditorToolbar";

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function PostEditorForm({ initialPost }: { initialPost?: BlogPost }) {
  const router = useRouter();
  const isEdit = Boolean(initialPost);

  const [title, setTitle] = useState(initialPost?.title ?? "");
  const [slug, setSlug] = useState(initialPost?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(isEdit);
  const [excerpt, setExcerpt] = useState(initialPost?.excerpt ?? "");
  const [category, setCategory] = useState(initialPost?.category ?? "");
  const [coverImage, setCoverImage] = useState(initialPost?.cover_image ?? "");
  const [status, setStatus] = useState<"draft" | "published">(initialPost?.status ?? "draft");
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const editor = useEditor({
    extensions: [StarterKit, LinkExtension, ImageExtension],
    content: initialPost?.content ?? "",
    immediatelyRender: false,
  });

  useEffect(() => {
    fetch("/api/blog/categories")
      .then((res) => (res.ok ? res.json() : []))
      .then(setCategories)
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!slugTouched) setSlug(slugify(title));
  }, [title, slugTouched]);

  async function handleSubmit(e: React.FormEvent, publishNow?: boolean) {
    e.preventDefault();
    setError(null);

    if (!title.trim() || !slug.trim() || !category.trim() || !editor) {
      setError("Title, slug, and category are required.");
      return;
    }

    const payload = {
      title: title.trim(),
      slug: slug.trim(),
      excerpt: excerpt.trim(),
      content: editor.getHTML(),
      category: category.trim(),
      cover_image: coverImage.trim() || null,
      status: publishNow ? "published" : status,
    };

    setSaving(true);
    const res = await fetch(isEdit ? `/api/blog/posts/${encodeURIComponent(initialPost!.slug)}` : "/api/blog/posts", {
      method: isEdit ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setSaving(false);

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setError(data?.detail || data?.error || "Failed to save post.");
      return;
    }

    router.push("/admin/blog");
    router.refresh();
  }

  const inputStyle: React.CSSProperties = {
    borderColor: "var(--color-border-default)",
    backgroundColor: "var(--color-bg-surface)",
    color: "var(--color-text-primary)",
  };

  return (
    <form onSubmit={(e) => handleSubmit(e)} className="flex flex-col gap-6">
      <div>
        <label className="mb-2 block font-mono-label text-xs uppercase tracking-widest" style={{ color: "var(--color-text-tertiary)" }}>
          Title
        </label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Post title"
          className="w-full rounded-lg border px-4 py-3 font-accent text-lg outline-none"
          style={inputStyle}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label className="mb-2 block font-mono-label text-xs uppercase tracking-widest" style={{ color: "var(--color-text-tertiary)" }}>
            Slug
          </label>
          <input
            value={slug}
            onChange={(e) => {
              setSlugTouched(true);
              setSlug(slugify(e.target.value));
            }}
            placeholder="post-slug"
            className="w-full rounded-lg border px-4 py-3 font-sans text-sm outline-none"
            style={inputStyle}
          />
        </div>
        <div>
          <label className="mb-2 block font-mono-label text-xs uppercase tracking-widest" style={{ color: "var(--color-text-tertiary)" }}>
            Category
          </label>
          <input
            list="category-suggestions"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="e.g. Engineering"
            className="w-full rounded-lg border px-4 py-3 font-sans text-sm outline-none"
            style={inputStyle}
          />
          <datalist id="category-suggestions">
            {categories.map((c) => (
              <option key={c.slug} value={c.name} />
            ))}
          </datalist>
        </div>
      </div>

      <div>
        <label className="mb-2 block font-mono-label text-xs uppercase tracking-widest" style={{ color: "var(--color-text-tertiary)" }}>
          Cover image URL (optional)
        </label>
        <input
          value={coverImage}
          onChange={(e) => setCoverImage(e.target.value)}
          placeholder="https://…"
          className="w-full rounded-lg border px-4 py-3 font-sans text-sm outline-none"
          style={inputStyle}
        />
        {coverImage && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={coverImage} alt="Cover preview" className="mt-3 h-40 w-full rounded-lg object-cover" />
        )}
      </div>

      <div>
        <label className="mb-2 block font-mono-label text-xs uppercase tracking-widest" style={{ color: "var(--color-text-tertiary)" }}>
          Excerpt
        </label>
        <textarea
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          rows={2}
          placeholder="Short summary shown on the blog index"
          className="w-full rounded-lg border px-4 py-3 font-sans text-sm outline-none"
          style={inputStyle}
        />
      </div>

      <div>
        <label className="mb-2 block font-mono-label text-xs uppercase tracking-widest" style={{ color: "var(--color-text-tertiary)" }}>
          Content
        </label>
        <EditorToolbar editor={editor} />
        <div
          className="rounded-b-xl border px-4 py-3"
          style={{ borderColor: "var(--color-border-default)", backgroundColor: "var(--color-bg-surface)", minHeight: 320 }}
        >
          <EditorContent editor={editor} className="blog-content prose-editor" />
        </div>
      </div>

      {error && (
        <p className="font-sans text-sm" style={{ color: "var(--color-status-error)" }}>
          {error}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={saving}
          className="rounded-full border px-5 py-3 font-accent text-sm font-semibold disabled:opacity-60"
          style={{ borderColor: "var(--color-border-default)", color: "var(--color-text-primary)" }}
        >
          {saving ? "Saving…" : "Save draft"}
        </button>
        <button
          type="button"
          disabled={saving}
          onClick={(e) => handleSubmit(e, true)}
          className="rounded-full px-5 py-3 font-accent text-sm font-semibold disabled:opacity-60"
          style={{ backgroundColor: "var(--color-bg-accent)", color: "var(--color-text-on-accent)" }}
        >
          {saving ? "Publishing…" : "Publish"}
        </button>
      </div>
    </form>
  );
}
