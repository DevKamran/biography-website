from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
from llama_index.core.llms import ChatMessage, MessageRole
from pydantic import BaseModel, Field

from rag.agent import build_chat_agent
from rag.mailer import RESUME_PDF_PATH


@asynccontextmanager
async def lifespan(app: FastAPI):
    app.state.agent = build_chat_agent()
    yield


app = FastAPI(title="Resume RAG API", lifespan=lifespan)

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


@app.post("/query", response_model=QueryResponse)
async def query(payload: QueryRequest):
    chat_history = [
        ChatMessage(role=_ROLE_MAP[msg.role], content=msg.content) for msg in payload.history
    ]
    try:
        response = await app.state.agent.run(
            user_msg=payload.question,
            chat_history=chat_history,
        )
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc
    return QueryResponse(answer=str(response))
