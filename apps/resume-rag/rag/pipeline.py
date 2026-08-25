from __future__ import annotations

from llama_index.embeddings.google_genai import GoogleGenAIEmbedding
from llama_index.llms.google_genai import GoogleGenAI
from llama_index.vector_stores.qdrant import QdrantVectorStore
from qdrant_client import QdrantClient

from rag.config import Settings


def build_embed_model(cfg: Settings) -> GoogleGenAIEmbedding:
    return GoogleGenAIEmbedding(model_name=cfg.gemini_embed_model, api_key=cfg.gemini_api_key)


def build_llm(cfg: Settings, system_prompt: str | None = None) -> GoogleGenAI:
    return GoogleGenAI(
        model=cfg.gemini_llm_model,
        api_key=cfg.gemini_api_key,
        system_prompt=system_prompt,
    )


def get_qdrant_client(cfg: Settings) -> QdrantClient:
    return QdrantClient(url=cfg.qdrant_url, api_key=cfg.qdrant_api_key or None)


def get_vector_store(cfg: Settings, client: QdrantClient) -> QdrantVectorStore:
    return QdrantVectorStore(client=client, collection_name=cfg.qdrant_collection)
