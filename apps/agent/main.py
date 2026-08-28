from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

from rag.query_engine import build_query_engine


@asynccontextmanager
async def lifespan(app: FastAPI):
    app.state.query_engine = build_query_engine()
    yield


app = FastAPI(title="Resume RAG API", lifespan=lifespan)


class QueryRequest(BaseModel):
    question: str = Field(..., min_length=1)


class QueryResponse(BaseModel):
    answer: str


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/query", response_model=QueryResponse)
def query(payload: QueryRequest):
    try:
        response = app.state.query_engine.query(payload.question)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc
    return QueryResponse(answer=str(response))
