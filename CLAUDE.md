# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

A portfolio/biography site with a chat widget powered by an AI agent that uses
RAG (retrieval-augmented generation). The agent answers visitor questions as
the site owner, in the first person. The site also has a blog with an admin
dashboard. npm-workspaces monorepo with two apps:

- `apps/web` — Next.js 14 (App Router, TypeScript, Tailwind, GSAP, Tiptap)
- `apps/agent` — the AI agent that uses RAG, served as a Python FastAPI
  service. It is a LlamaIndex tool-calling agent: it retrieves resume chunks
  from Qdrant (vector DB) by embedding similarity, then has Gemini
  (LLM + embeddings) answer only from what it retrieved and from exact
  portfolio data. If the answer isn't there, it says so instead of making
  details up.

The frontend never lets the browser talk to the agent directly: every call
goes through a Next.js route handler or Server Component using
`RESUME_RAG_API_URL` (default `http://localhost:8000`). Both apps must be
running for chat and blog pages to work. If the agent is unreachable, the
landing page still renders and just drops the blog preview.

## Commands

From the repo root:

```bash
npm run dev:web      # next dev, http://localhost:3000
npm run build:web    # next build
npm run start:web    # serve the production build
```

From `apps/web`: `npm run lint` (next lint), and
`npm run export:portfolio` (see "Content sync" below).

Agent (from `apps/agent`, separate venv, Python ≥ 3.9):

```bash
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env    # GEMINI_API_KEY, QDRANT_URL, QDRANT_API_KEY, BLOG_ADMIN_TOKEN, MAILJET_*
python ingest.py --file data/KamranAli_Resume.pdf --document "KamranAli_Resume"
uvicorn main:app --reload --port 8000
```

`ingest.py` is a one-off step, so re-run it whenever the resume changes. It is
not part of the request path, and the Docker `CMD` does not run it.
Re-ingesting with the same `--document` replaces that document's chunks.

The agent has no tests. To smoke-test it, run
`curl -X POST localhost:8000/query -H 'Content-Type: application/json' -d '{"question":"..."}'`
(or `/query/stream` with `curl -N` to see the streamed events).

The web app has a Playwright + axe accessibility suite: `npm run test:a11y`
in `apps/web` (`e2e/a11y.spec.ts`). It starts its own `next dev` on :3100,
with the chat agent mocked in the page, so no agent needs to be running.
`node scripts/check-contrast.mjs` checks the colour tokens. What the chat
does for WCAG 2.2 AA, and how it's tested, is in `apps/web/ACCESSIBILITY.md`.

Env: `cp apps/web/.env.local.example apps/web/.env.local` and fill in
`RESUME_RAG_API_URL`, `BLOG_ADMIN_TOKEN` (must equal the agent's),
`BLOG_ADMIN_PASSWORD`, `BLOG_SESSION_SECRET`.

## Architecture

### Chat

`ChatWidget` → `useResumeChat` (`apps/web/lib/use-resume-chat.ts`) →
`POST /api/resume-query/stream`, which pipes the agent's
`POST /query/stream` (NDJSON events: `tool`, `delta`, then `done` or `error`)
to the browser. If that returns 404, the hook falls back to the one-shot
`POST /api/resume-query` → `/query`. The Stop button aborts the fetch; the
abort reaches the agent, which cancels the run. The client keeps the
conversation history and sends it on each request; the agent is stateless.
The widget's screen-reader announcements are deliberate (one "thinking"
notice, then the whole reply once it's complete, never piece by piece), so
see `apps/web/ACCESSIBILITY.md` before changing them.

The agent (`apps/agent/rag/agent.py`) is a LlamaIndex `FunctionAgent`, built
once in FastAPI's lifespan. Its system prompt lists every tool with usage
rules, so when you add or rename a tool, update `AGENT_SYSTEM_PROMPT` too.
Tools:

- `get_profile` / `get_skills` / `get_projects` / `get_experience`
  (`rag/tools.py`): return exact data from `apps/agent/data/portfolio.json`.
  The prompt tells the agent to prefer these.
- `resume_qa`: RAG over resume chunks in Qdrant (`rag/query_engine.py`,
  `rag/pipeline.py`). Chunks are split by resume section, not by token
  count (`rag/chunking.py`).
- `send_resume_email` (`rag/mailer.py`) sends through Mailjet's HTTPS API
  instead of SMTP, because Railway blocks outbound SMTP.
- `get_resume_pdf_link` returns `/api/resume-download`, which proxies the
  agent's `GET /resume`.
- `get_blog_posts` (`blog/agent_tools.py`).

The persona comes from `RESUME_OWNER_NAME` / `RESUME_OWNER_ROLE`.

### Vector DB (Qdrant)

One Qdrant Cloud cluster (`QDRANT_URL`, `QDRANT_API_KEY`) holds two
collections. Both are embedded with the same Gemini model
(`GEMINI_EMBED_MODEL`).

- **Resume chunks** (`QDRANT_COLLECTION_NAME`, default `resume_chunks`):
  `ingest.py` fills it through LlamaIndex's `QdrantVectorStore`
  (`rag/pipeline.py`). Each chunk carries `document`/`section`/`role`
  metadata (`rag/chunking.py`), so a bullet point stays tied to its job.
  Re-ingesting replaces chunks with the same `document` tag. `resume_qa`
  retrieves the top 4 chunks by similarity (`rag/query_engine.py`).
- **Blog posts** (`QDRANT_COLLECTION_BLOG_POSTS`, default `blog_posts`):
  used as the blog's database through the raw `qdrant_client`
  (`blog/store.py`), not through LlamaIndex. It is created automatically on
  first use with cosine distance and payload indexes on
  `slug`/`status`/`category`. The vector size is detected from the embedding
  model.

If you change `GEMINI_EMBED_MODEL`, the vector dimensions may no longer
match: recreate the collections and re-run `ingest.py`.

### Blog

- Posts are stored in the Qdrant `blog_posts` collection (see above).
  Categories are derived from the posts.
- `apps/agent/blog/router.py` exposes `/blog/posts`, `/blog/posts/{slug}`
  and `/blog/categories`. Writes require the `X-Admin-Token` header. Reads
  without the token only see `published` posts.
- Public pages (`app/blog/*`, landing `BlogPreview`) are Server Components
  that call the agent directly through `lib/blog-api.ts`, with 60s ISR
  revalidation.
- The admin dashboard (`app/admin/blog/*`, Tiptap editor in
  `components/blog-admin/`) is a client UI that goes through
  `app/api/blog/*` proxies. Those routes attach `BLOG_ADMIN_TOKEN` on the
  server only when the request carries a valid admin session.
- Admin auth: `/api/blog-admin/login` checks `BLOG_ADMIN_PASSWORD` and sets
  an HMAC-signed cookie (`lib/blog-admin-auth.ts`). `middleware.ts` guards
  `/admin/blog/*`. The auth lib uses Web Crypto rather than Node `crypto`,
  because it must also run in the Edge middleware runtime.

## Content sync

`apps/web/lib/portfolio-data.ts` is the single source of truth for the
profile, skills, projects, and experience. The agent reads a generated copy,
`apps/agent/data/portfolio.json`. After editing `portfolio-data.ts`, run
`npm run export:portfolio` in `apps/web`, or the chat answers will drift from
the page. The agent caches that file with `lru_cache`, so restart it after
regenerating. The resume PDF is a separate source: re-run `ingest.py` when it
changes.

## Frontend notes

- `app/page.tsx` renders `components/landing/PortfolioLanding.tsx` (landing
  sections plus GSAP helpers in `components/landing/ui/`), wrapped in
  `ChatWidgetProvider`.
- Path alias `@/*` → `apps/web/*`.
- Tailwind only scans `app/**/*`, so classes used only in `lib/` files are
  not generated. Custom fonts: `sans` (Funnel Sans), `accent` (Funnel
  Display), `mono` (JetBrains Mono). Custom breakpoints: `xs` 420px, `hero`
  1200px, `hero-lg` 1600px.

## Deployment

- Frontend: Vercel. Set `RESUME_RAG_API_URL` to the deployed agent URL.
- Agent: Docker container (`apps/agent/Dockerfile`) on Railway; it listens on
  `$PORT`. Run `ingest.py` against the same Qdrant cluster separately.
- Vector DB: Qdrant Cloud, which holds both the resume chunks and the blog
  posts.
