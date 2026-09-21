# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

A personal portfolio site (Next.js) with an AI chat widget and a blog, both
backed by a Python FastAPI service. It's an npm-workspaces monorepo with two
apps:

- `apps/web` — Next.js 14 (App Router, TypeScript, Tailwind) frontend
- `apps/agent` — Python FastAPI service: a RAG-backed chat agent + the blog's
  data layer, both persisted in Qdrant

Both apps must be running simultaneously in dev for the chat widget and blog
to work: the frontend serves the site and proxies chat/blog requests
server-side; the agent is what actually answers questions and stores posts.

**Note:** `apps/web/lib/use-livekit-chat.ts` and the `livekit-*` /
`@livekit/*` npm dependencies are leftover from an earlier LiveKit-based chat
design and are currently dead code — there is no LiveKit worker process or
token-minting route in this repo. The chat widget (`ChatWidget.tsx`) actually
uses `useResumeChat` (`apps/web/lib/use-resume-chat.ts`), which calls
`POST /api/resume-query`.

## Commands

Frontend, from the repo root (npm workspaces) or from `apps/web` directly:

```bash
npm run dev:web      # next dev, apps/web, http://localhost:3000
npm run build:web    # next build
npm run start:web    # next start (serves a production build)
```

From `apps/web`: `npm run dev`, `npm run build`, `npm run start`, `npm run
lint` (next lint). There is no test suite configured in either app.

Re-export portfolio content for the agent after editing
`apps/web/lib/portfolio-data.ts` (from `apps/web`):

```bash
npm run export:portfolio   # writes apps/agent/data/portfolio.json
```

Agent service (from `apps/agent`, separate Python venv):

```bash
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env       # fill in GEMINI_API_KEY, QDRANT_URL, etc.
uvicorn main:app --reload --port 8000
```

One-off resume ingestion (re-run whenever the resume file changes):

```bash
python ingest.py --file data/KamranAli_Resume.pdf --document "KamranAli_Resume"
```

Env setup for the frontend: `cp apps/web/.env.local.example apps/web/.env.local`
and set `RESUME_RAG_API_URL` to the agent's URL (defaults to
`http://localhost:8000` if unset — check this first when the site fetches
HTML instead of JSON, since that means the agent isn't reachable at the
configured URL). Also fill in `BLOG_ADMIN_TOKEN` (must match the agent's
`.env`), `BLOG_ADMIN_PASSWORD`, and `BLOG_SESSION_SECRET`.

## Architecture: how the chat widget works end to end

1. Visitor opens `ChatWidget` (`apps/web/app/components/chat/ChatWidget.tsx`)
   → `useResumeChat` hook (`apps/web/lib/use-resume-chat.ts`) posts to
   `/api/resume-query` with the question and prior turn history.
2. That route (`apps/web/app/api/resume-query/route.ts`) proxies the request
   server-side to the agent's `POST /query` (`RESUME_RAG_API_URL`), so the
   browser never talks to the agent directly.
3. `apps/agent/main.py` runs a LlamaIndex `FunctionAgent`
   (`rag/agent.py::build_chat_agent`) built from Gemini
   (`rag/pipeline.py` — `GEMINI_LLM_MODEL`/`GEMINI_EMBED_MODEL`) with a
   system prompt instructing it to answer in the first person as the resume
   owner (`RESUME_OWNER_NAME`/`RESUME_OWNER_ROLE` env vars).
4. Its tools (`rag/tools.py` + `blog/agent_tools.py`) are: `get_profile`,
   `get_skills`, `get_projects`, `get_experience` (exact structured facts —
   preferred over free-text search), `resume_qa` (a `QueryEngineTool` that
   retrieves resume chunks from Qdrant for anything the structured tools
   don't cover), `send_resume_email` (emails the resume PDF via Mailjet,
   `rag/mailer.py`), `get_resume_pdf_link`, and `get_blog_posts`.
5. Per-room/session conversation history is passed in on every request
   (`QueryRequest.history`) rather than kept server-side — the agent itself
   is stateless between calls.

## Content sync: portfolio data flows one way, generated

`apps/web/lib/portfolio-data.ts` is the **single source of truth** for
profile/skills/projects/experience. Running `npm run export:portfolio`
(`apps/web/scripts/export-portfolio-data.ts`) serializes it to
`apps/agent/data/portfolio.json`, which `rag/portfolio_data.py` loads for the
`get_profile`/`get_skills`/`get_projects`/`get_experience` tools. **Always
re-run `export:portfolio` after editing `portfolio-data.ts`** — there is no
build-time or runtime hook that does this automatically, and the agent will
raise `FileNotFoundError` if `portfolio.json` doesn't exist yet.

The resume file (`apps/agent/data/KamranAli_Resume.pdf`) is separate — it
only feeds `resume_qa`/`send_resume_email`/`get_resume_pdf_link` and must be
re-ingested with `ingest.py` after changes; it does not go through the
`portfolio.json` export.

## Blog: Qdrant as the datastore, not just a vector index

Blog posts have no separate database — `apps/agent/blog/store.py` stores each
post as a Qdrant point (payload = post fields, vector = an embedding of its
title/excerpt/content) in a `blog_posts` collection, created lazily on first
use. Listing/filtering uses `scroll` + payload filters, not vector search;
the embedding exists only so `resume_qa`-style semantic search over posts is
possible later — `get_blog_posts` currently does exact metadata lookups.

Auth is two-layer and asymmetric:
- **Frontend admin session** (`apps/web/lib/blog-admin-auth.ts`): an
  HMAC-signed cookie (`BLOG_SESSION_SECRET`) set on password login
  (`BLOG_ADMIN_PASSWORD`, checked in `/api/blog-admin/login`), enforced by
  `apps/web/middleware.ts` on `/admin/blog/:path*` (except the login page
  itself). Uses Web Crypto (`crypto.subtle`), not Node's `crypto` module, so
  it works in both the Edge middleware and Node API routes.
- **Frontend → agent**: `apps/web/app/api/blog/*` routes check
  `isAdminRequest` and, only if valid, forward `X-Admin-Token:
  BLOG_ADMIN_TOKEN` to the agent's `blog/router.py`, which is the actual
  enforcement point for writes (`_require_admin` dependency) and for
  showing drafts (`_is_admin` gate on `GET /blog/posts` and
  `GET /blog/posts/{slug}`). `BLOG_ADMIN_TOKEN` must match between
  `apps/web/.env.local` and `apps/agent/.env` — the browser never sees it.

Public blog pages (`apps/web/app/blog/*`) call the agent directly
server-side via `apps/web/lib/blog-api.ts` (no admin token, published-only),
bypassing `/api/blog/*` entirely — that proxy path exists only for the
authenticated admin dashboard (`apps/web/app/admin/blog/*`,
`components/blog-admin/PostEditorForm.tsx`, a Tiptap-based editor).

## Frontend structure

- `app/page.tsx` composes the page from section/landing components (see
  `app/components/landing/`, `app/components/sections/`) plus
  `app/components/layout/SiteHeader.tsx` and
  `app/components/chat/ChatWidget.tsx`.
- `app/blog/` (public, published posts only) and `app/admin/blog/`
  (password-gated dashboard: list, new, edit) are separate route trees.
- Path alias `@/*` maps to `apps/web/*` (see `tsconfig.json`).
- Tailwind content scanning is limited to `app/**/*.{js,ts,jsx,tsx,mdx}`
  (`tailwind.config.ts`); custom font families `sans` (Funnel Sans), `accent`
  (Funnel Display), `mono` (JetBrains Mono); custom breakpoints `xs` (420px),
  `hero` (1200px), `hero-lg` (1600px).

## Deployment

- Frontend: Vercel (or any Next.js host).
- Agent: ships a `Dockerfile` (`apps/agent/Dockerfile`) — deploy to Railway,
  Render, Fly.io, or a VPS as a long-running container (the default `CMD`
  only starts `uvicorn`; ingestion is a separate manual/one-off step, not run
  automatically on deploy).
- Both apps must point at the same Qdrant cluster; set `RESUME_RAG_API_URL`
  on the frontend to the deployed agent's URL.
- Outbound email uses Mailjet's HTTPS API specifically because Railway's
  free/hobby tier blocks outbound SMTP ports — don't switch this to raw SMTP
  without checking the target host's egress rules.
