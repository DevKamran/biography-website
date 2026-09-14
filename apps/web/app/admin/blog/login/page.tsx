"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch("/api/blog-admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setError(data?.error || "Login failed.");
      setLoading(false);
      return;
    }

    router.replace(searchParams.get("from") || "/admin/blog");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-5" style={{ backgroundColor: "var(--color-bg-surface)" }}>
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-2xl border p-8"
        style={{ borderColor: "var(--color-border-subtle)", backgroundColor: "var(--color-bg-raised)" }}
      >
        <h1 className="font-accent text-2xl font-bold" style={{ color: "var(--color-text-primary)" }}>
          Blog admin
        </h1>
        <p className="mb-6 mt-1 font-sans text-sm" style={{ color: "var(--color-text-secondary)" }}>
          Sign in to manage posts.
        </p>

        <label className="mb-2 block font-mono-label text-xs uppercase tracking-widest" style={{ color: "var(--color-text-tertiary)" }}>
          Password
        </label>
        <input
          type="password"
          autoFocus
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mb-4 w-full rounded-lg border px-4 py-3 font-sans text-sm outline-none"
          style={{ borderColor: "var(--color-border-default)", backgroundColor: "var(--color-bg-surface)", color: "var(--color-text-primary)" }}
        />

        {error && (
          <p className="mb-4 font-sans text-sm" style={{ color: "var(--color-status-error)" }}>
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading || !password}
          className="w-full rounded-full py-3 font-accent text-sm font-semibold transition-opacity disabled:opacity-60"
          style={{ backgroundColor: "var(--color-bg-accent)", color: "var(--color-text-on-accent)" }}
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
