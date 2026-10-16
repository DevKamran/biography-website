import json
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse, StreamingResponse
from llama_index.core.agent.workflow import AgentStream, ToolCall
from llama_index.core.llms import ChatMessage, MessageRole
from pydantic import BaseModel, Field

from blog.router import router as blog_router
from rag.agent import build_chat_agent
from rag.mailer import RESUME_PDF_PATH


@asynccontextmanager
async def lifespan(app: FastAPI):
    app.state.agent = build_chat_agent()
    yield


app = FastAPI(title="Resume RAG API", lifespan=lifespan)
app.include_router(blog_router)

_ROLE_MAP = {"user": MessageRole.USER, "assistant": MessageRole.ASSISTANT}


class HistoryMessage(BaseModel):
    role: str = Field(..., pattern="^(user|assistant)$")
    content: str


class QueryRequest(BaseModel):
    question: str = Field(..., min_length=1)
    history: list[HistoryMessage] = Field(default_factory=list)


class QueryResponse(BaseModel):
    answer: str


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/resume")
def resume():
    if not RESUME_PDF_PATH.exists():
        raise HTTPException(status_code=404, detail="Resume file not found.")
    return FileResponse(
        RESUME_PDF_PATH,
        media_type="application/pdf",
        filename=RESUME_PDF_PATH.name,
    )


logger = logging.getLogger(__name__)


def _chat_history(payload: QueryRequest) -> list[ChatMessage]:
    return [ChatMessage(role=_ROLE_MAP[msg.role], content=msg.content) for msg in payload.history]


@app.post("/query", response_model=QueryResponse)
async def query(payload: QueryRequest):
    chat_history = _chat_history(payload)
    try:
        response = await app.state.agent.run(
            user_msg=payload.question,
            chat_history=chat_history,
        )
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc
    return QueryResponse(answer=str(response))


@app.post("/query/stream")
async def query_stream(payload: QueryRequest):
    """Same as /query, streamed as newline-delimited JSON events:
    {"type": "tool", "name": ...} when the agent calls a tool,
    {"type": "delta", "text": ...} for each piece of the reply,
    then one {"type": "done", "answer": ...} or {"type": "error", "message": ...}.

    The final "done" carries the whole answer, so a client can replace the
    streamed text with it (text from intermediate LLM turns is not final).
    If the client disconnects (e.g. the visitor pressed Stop), the run is cancelled.
    """
    handler = app.state.agent.run(user_msg=payload.question, chat_history=_chat_history(payload))

    def line(event: dict) -> str:
        return json.dumps(event) + "\n"

    async def events():
        try:
            async for ev in handler.stream_events():
                if isinstance(ev, ToolCall):
                    yield line({"type": "tool", "name": ev.tool_name})
                elif isinstance(ev, AgentStream) and ev.delta:
                    yield line({"type": "delta", "text": ev.delta})
            yield line({"type": "done", "answer": str(await handler)})
        except Exception as exc:
            logger.exception("Streaming query failed")
            yield line({"type": "error", "message": str(exc)})
        finally:
            if not handler.done():
                await handler.cancel_run()

    return StreamingResponse(
        events(),
        media_type="application/x-ndjson",
        headers={"Cache-Control": "no-store", "X-Accel-Buffering": "no"},
    )
