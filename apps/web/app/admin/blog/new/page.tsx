import Link from "next/link";
import PostEditorForm from "../../../components/blog-admin/PostEditorForm";

export default function NewPostPage() {
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
        New post
      </h1>
      <PostEditorForm />
    </div>
  );
}
