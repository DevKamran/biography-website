// Signed session cookie for the blog admin dashboard. Written to run in the
// Edge runtime (middleware) as well as Node (API routes) — uses Web Crypto
// (crypto.subtle) instead of Node's `crypto` module, and btoa instead of
// Buffer, so it works in both.
import type { NextRequest } from "next/server";

export const SESSION_COOKIE_NAME = "blog_admin_session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

function getSecret(): string {
  const secret = process.env.BLOG_SESSION_SECRET;
  if (!secret) {
    throw new Error("BLOG_SESSION_SECRET is not configured (see .env.local.example).");
  }
  return secret;
}

function toBase64Url(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function hmac(data: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(getSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(data));
  return toBase64Url(signature);
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return mismatch === 0;
}

export async function createSessionToken(): Promise<string> {
  const expires = Math.floor(Date.now() / 1000) + SESSION_MAX_AGE;
  const signature = await hmac(String(expires));
  return `${expires}.${signature}`;
}

export async function isValidSessionToken(token: string | undefined | null): Promise<boolean> {
  if (!token) return false;
  const [expiresStr, signature] = token.split(".");
  if (!expiresStr || !signature) return false;

  const expires = Number(expiresStr);
  if (!Number.isFinite(expires) || expires < Math.floor(Date.now() / 1000)) return false;

  const expected = await hmac(expiresStr);
  return timingSafeEqual(signature, expected);
}

export async function isAdminRequest(req: NextRequest): Promise<boolean> {
  return isValidSessionToken(req.cookies.get(SESSION_COOKIE_NAME)?.value);
}
