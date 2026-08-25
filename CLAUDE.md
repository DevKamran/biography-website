# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

A portfolio/biography website: a Next.js frontend paired with a Python LiveKit
agent that powers an in-page AI chat widget answering visitor questions about
the site owner. It's an npm-workspaces monorepo with two apps:

- `apps/web` — Next.js 14 (App Router, TypeScript, Tailwind) frontend
- `apps/agent` — Python LiveKit worker that runs the chat LLM loop

Both apps must be running simultaneously for the chat widget to work end to
end: the frontend serves the site and mints LiveKit tokens; the agent is the
long-lived process that actually replies to chat messages.

## Commands

Run from the repo root (npm workspaces):

```bash
npm run dev:web      # next dev, apps/web, http://localhost:3000
npm run build:web    # next build
npm run start:web    # next start (serves a production build)
```

Or from `apps/web` directly: `npm run dev`, `npm run build`, `npm run start`,
`npm run lint` (next lint). There is no test suite configured in either app.

Agent worker (from `apps/agent`, separate Python venv):

```bash
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env       # fill in LiveKit + OpenAI credentials
python agent.py dev        # local dev, hot-reloads on file changes
python agent.py start      # production mode
```

Env setup for the frontend: `cp apps/web/.env.local.example apps/web/.env.local`
and fill in LiveKit credentials (`LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET`,
`NEXT_PUBLIC_LIVEKIT_URL`). The agent needs its own `.env` in `apps/agent`
with the same LiveKit project's credentials plus `OPENAI_API_KEY`.

## Architecture: how the chat widget works end to end

1. Visitor opens `ChatWidget` (`apps/web/app/components/chat/ChatWidget.tsx`)
   → `useLiveKitChat` hook (`apps/web/lib/use-livekit-chat.ts`) calls
   `GET /api/livekit-token`.
2. That route (`apps/web/app/api/livekit-token/route.ts`) mints a LiveKit
   access token, creates a per-visitor room (`portfolio-chat-<identity>`),
   and explicitly **dispatches** the Python agent into that room by name
   (`AGENT_NAME = "portfolio-agent"` — this constant must match
   `AGENT_NAME` in `apps/agent/agent.py`).
3. The frontend connects to the room and both sides communicate over a
   LiveKit **text-stream topic** named `"chat"` (not LiveKit's chat
   protocol) — see `registerTextStreamHandler`/`sendText` in
   `use-livekit-chat.ts` and `register_text_stream_handler`/`send_text` in
   `agent.py`. Participant identity prefix (`"visitor-..."` vs anything
   else) is how each side tells visitor messages from agent replies apart.
4. The agent keeps an in-memory, per-room conversation history and runs a
   tool-calling loop against `gpt-4o-mini` (`run_conversation` in
   `agent.py`), using tools defined in `apps/agent/tools/portfolio_tools.py`
   (`get_profile`, `get_skills`, `get_projects`, `get_experience`), all
   backed by `apps/agent/data/portfolio.json`.

## Content is duplicated, not shared

Site content exists in **two places that must be kept in sync manually**:

- `apps/web/lib/portfolio-data.ts` — feeds the visible page sections
  (profile, hero stats/tags, nav links, skills, projects, experience)
- `apps/agent/data/portfolio.json` — feeds what the chat agent can answer
  via its tools

There is currently no shared source of truth or API route bridging them;
editing one without the other will make the chat agent's answers drift from
the visible page content.

## Frontend structure

- `app/page.tsx` composes the page from section components in
  `app/components/sections/` (Hero, Skills, Projects, Experience, Contact)
  plus `app/components/layout/SiteHeader.tsx` and
  `app/components/chat/ChatWidget.tsx`.
- Path alias `@/*` maps to `apps/web/*` (see `tsconfig.json`).
- Tailwind content scanning is limited to `app/**/*.{js,ts,jsx,tsx,mdx}`
  (`tailwind.config.ts`); custom font families `sans` (Funnel Sans) and
  `accent` (Funnel Display), and custom breakpoints `xs` (420px), `hero`
  (1200px), `hero-lg` (1600px).

## Deployment

- Frontend: Vercel or any Next.js host.
- Agent: must run as a long-lived process (Render, Fly.io, Railway, a VPS)
  — it is **not** deployable as a serverless function, since it holds a
  persistent LiveKit worker connection and per-room conversation state.
- Both apps must point at the same LiveKit Cloud project's credentials.
