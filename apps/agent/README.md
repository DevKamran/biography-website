# Portfolio Agent (Python / LiveKit)

Text-only LiveKit agent worker. It joins the visitor's chat room, reads
messages sent on the `chat` text-stream topic, asks an LLM (with portfolio
tools) for a reply, and sends the reply back on the same topic.

## Setup

```bash
cd apps/agent
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env       # fill in your LiveKit + OpenAI credentials
```

## Run

```bash
python agent.py dev        # local development, hot-reloads on file changes
python agent.py start      # production mode
```

The worker registers itself under `agent_name="portfolio-agent"`. The Next.js
token API route (`apps/web/app/api/livekit-token/route.ts`) explicitly
dispatches an agent with that same name into each visitor's room, so this
process must be running (locally or deployed) whenever the chat widget is
used.

## Editing what the agent knows

Edit `data/portfolio.json`. The four tools in `tools/portfolio_tools.py`
(`get_profile`, `get_skills`, `get_projects`, `get_experience`) read from that
file — the LLM decides when to call them based on the visitor's question.

To add a new tool:
1. Write the function in `tools/portfolio_tools.py`.
2. Add its OpenAI-style schema to `TOOL_SCHEMAS`.
3. Register it in `TOOL_IMPLEMENTATIONS`.

## Deployment

This needs to run as a **long-lived process**, not a serverless function —
options include Render, Fly.io, Railway, or a small VPS. Point its
`LIVEKIT_URL` / `LIVEKIT_API_KEY` / `LIVEKIT_API_SECRET` at the same LiveKit
Cloud project as the Next.js app.
