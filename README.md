# Portfolio Monorepo

Interactive portfolio site (Next.js) with a text chat widget backed by a
LiveKit agent (Python) that can answer questions about you using tool calls.

```
portfolio-monorepo/
├── apps/
│   ├── web/                          # Next.js frontend (TypeScript)
│   │   ├── app/
│   │   │   ├── api/livekit-token/    # mints LiveKit tokens + dispatches the agent
│   │   │   ├── components/
│   │   │   │   ├── sections/         # Hero, Skills, Projects, Experience, Contact
│   │   │   │   └── chat/ChatWidget.tsx
│   │   │   ├── page.tsx
│   │   │   └── layout.tsx
│   │   ├── lib/
│   │   │   ├── portfolio-data.ts     # <-- EDIT THIS with your real info
│   │   │   └── use-livekit-chat.ts   # LiveKit connection + chat hook
│   │   └── .env.local.example
│   │
│   └── agent/                        # LiveKit agent worker (Python)
│       ├── agent.py                  # entrypoint: joins room, runs LLM + tools
│       ├── tools/portfolio_tools.py  # tool functions + schemas
│       ├── data/portfolio.json       # <-- EDIT THIS with your real info
│       └── .env.example
│
├── package.json                      # npm workspaces root
└── README.md
```

## How it fits together

1. Visitor opens the chat widget → frontend calls `GET /api/livekit-token`.
2. That route mints a LiveKit token, creates a per-visitor room, and
   **dispatches** the Python agent into it.
3. The agent joins, listens for messages on the `chat` text-stream topic,
   asks an LLM (with tools reading `data/portfolio.json`) for a reply, and
   sends it back on the same topic.
4. The frontend renders both sides of the conversation.

## Prerequisites

- Node.js ≥ 18.18
- Python ≥ 3.9
- A free [LiveKit Cloud](https://cloud.livekit.io) project (API key, secret, WS URL)
- An OpenAI API key (or swap the agent to another provider)

## Setup

### 1. Frontend

```bash
cd apps/web
cp .env.local.example .env.local   # fill in LiveKit credentials
npm install
npm run dev
```

Runs at http://localhost:3000.

### 2. Agent worker

```bash
cd apps/agent
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env               # fill in LiveKit + OpenAI credentials
python agent.py dev
```

Both apps must be running for the chat widget to work — the frontend serves
the site and mints tokens, the agent is the thing actually replying.

## Filling in your content

Two files currently hold placeholder data — update both (or later refactor
the agent to fetch from the same source as the frontend via an API route):

- `apps/web/lib/portfolio-data.ts` — powers the visible page sections
- `apps/agent/data/portfolio.json` — powers what the chat agent knows

## Deployment

- **Frontend**: Vercel (or any Next.js host).
- **Agent**: needs a long-lived process — Render, Fly.io, Railway, or a small
  VPS. It is *not* deployable as a serverless function.
- Point both at the same LiveKit Cloud project's credentials.
