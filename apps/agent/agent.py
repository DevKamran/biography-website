"""
Portfolio chat agent — text-only.

Joins a LiveKit room (dispatched by the Next.js token API route), listens for
visitor chat messages on the "chat" text stream topic, asks an LLM (with
portfolio tools) for a reply, and sends the reply back on the same topic.

Run locally:
    python agent.py dev

Deploy:
    python agent.py start
"""

import asyncio
import json
import logging
import os

from dotenv import load_dotenv
from openai import OpenAI

from livekit import agents, rtc
from livekit.agents import JobContext, WorkerOptions, cli

from tools.portfolio_tools import TOOL_IMPLEMENTATIONS, TOOL_SCHEMAS, get_profile

load_dotenv()

logger = logging.getLogger("portfolio-agent")
logger.setLevel(logging.INFO)

CHAT_TOPIC = "chat"
AGENT_NAME = "portfolio-agent"  # must match AGENT_NAME in apps/web token route

openai_client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))


def build_system_prompt() -> str:
    profile = get_profile()
    return (
        "You are a friendly assistant embedded in a personal portfolio website, "
        f"speaking on behalf of {profile['name']} ({profile['title']}) to site visitors. "
        "Use the available tools to look up accurate details about skills, projects, "
        "and experience rather than guessing. Keep replies concise and conversational, "
        "suitable for a chat widget. If asked something unrelated to the portfolio, "
        "answer briefly and steer back to what you can help with."
    )


async def run_conversation(history: list[dict]) -> str:
    """Run one turn of the tool-calling loop and return the assistant's reply text."""
    messages = history

    while True:
        response = await asyncio.to_thread(
            openai_client.chat.completions.create,
            model="gpt-4o-mini",
            messages=messages,
            tools=TOOL_SCHEMAS,
        )
        choice = response.choices[0]
        message = choice.message

        if message.tool_calls:
            # Record the assistant's tool-call turn, then execute each tool
            # and feed the results back before asking the model to continue.
            messages.append(message.model_dump(exclude_none=True))
            for call in message.tool_calls:
                fn_name = call.function.name
                args = json.loads(call.function.arguments or "{}")
                impl = TOOL_IMPLEMENTATIONS.get(fn_name)
                result = impl(**args) if impl else {"error": f"Unknown tool {fn_name}"}
                messages.append(
                    {
                        "role": "tool",
                        "tool_call_id": call.id,
                        "content": json.dumps(result),
                    }
                )
            continue  # ask the model again with tool results in context

        return message.content or ""


async def entrypoint(ctx: JobContext):
    await ctx.connect()
    logger.info(f"Agent joined room: {ctx.room.name}")

    # Per-room conversation history, seeded with the system prompt.
    history: list[dict] = [{"role": "system", "content": build_system_prompt()}]

    async def handle_text_stream(reader: rtc.TextStreamReader, participant_identity: str):
        text = await reader.read_all()
        if not text.strip():
            return

        logger.info(f"Visitor ({participant_identity}): {text}")
        history.append({"role": "user", "content": text})

        try:
            reply = await run_conversation(history)
        except Exception:
            logger.exception("Error generating reply")
            reply = "Sorry, something went wrong on my end — please try again."

        history.append({"role": "assistant", "content": reply})

        await ctx.room.local_participant.send_text(reply, topic=CHAT_TOPIC)
        logger.info(f"Agent reply: {reply}")

    ctx.room.register_text_stream_handler(CHAT_TOPIC, handle_text_stream)

    # Keep the job alive until the room closes / visitor disconnects.
    await asyncio.Future()


if __name__ == "__main__":
    cli.run_app(
        WorkerOptions(
            entrypoint_fnc=entrypoint,
            agent_name=AGENT_NAME,
        )
    )
