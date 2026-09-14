// Server-side helpers for reading blog content from the agent's FastAPI
// backend (apps/agent/blog). Used by Server Components (app/blog/*) — they
// call the backend directly since there's no CORS/token-exposure concern
// server-side. Client-side code (the admin dashboard) goes through
// app/api/blog/* instead, so the browser never talks to the backend or
// needs BLOG_ADMIN_TOKEN directly.

export type BlogPostSummary = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  cover_image: string | null;
  status: "draft" | "published";
  published_at: string | null;
  updated_at: string;
};

export type BlogPost = BlogPostSummary & {
  content: string;
};

export type BlogCategory = {
  name: string;
  slug: string;
  post_count: number;
};

export type BlogPostListResponse = {
  posts: BlogPostSummary[];
  total: number;
  page: number;
  page_size: number;
};

const BASE_URL = (process.env.RESUME_RAG_API_URL || "http://localhost:8000").replace(/\/$/, "");

// Blog content changes only through the admin dashboard, so a short
// revalidation window keeps pages fast without ever serving very stale data.
const REVALIDATE_SECONDS = 60;

export async function getPosts(
  params: { category?: string; page?: number; page_size?: number } = {}
): Promise<BlogPostListResponse> {
  const search = new URLSearchParams();
  if (params.category) search.set("category", params.category);
  if (params.page) search.set("page", String(params.page));
  if (params.page_size) search.set("page_size", String(params.page_size));

  const res = await fetch(`${BASE_URL}/blog/posts?${search.toString()}`, {
    next: { revalidate: REVALIDATE_SECONDS },
  });
  if (!res.ok) throw new Error(`Failed to load blog posts (${res.status})`);
  return res.json();
}

export async function getPost(slug: string): Promise<BlogPost | null> {
  const res = await fetch(`${BASE_URL}/blog/posts/${encodeURIComponent(slug)}`, {
    next: { revalidate: REVALIDATE_SECONDS },
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Failed to load blog post (${res.status})`);
  return res.json();
}

export async function getCategories(): Promise<BlogCategory[]> {
  const res = await fetch(`${BASE_URL}/blog/categories`, {
    next: { revalidate: REVALIDATE_SECONDS },
  });
  if (!res.ok) throw new Error(`Failed to load blog categories (${res.status})`);
  return res.json();
}
