from __future__ import annotations

from google.genai import types

from llama_index.embeddings.google_genai import GoogleGenAIEmbedding
from llama_index.llms.google_genai import GoogleGenAI
from llama_index.vector_stores.qdrant import QdrantVectorStore
from qdrant_client import QdrantClient

from rag.config import Settings


def build_embed_model(cfg: Settings) -> GoogleGenAIEmbedding:
    return GoogleGenAIEmbedding(model_name=cfg.gemini_embed_model, api_key=cfg.gemini_api_key)


def build_llm(cfg: Settings, system_prompt: str | None = None) -> GoogleGenAI:
    # google-genai never retries by default, so a brief Gemini overload (503
    # "high demand") would fail the visitor's question. 429 (quota) is not
    # retried: Google asks for a ~1 min wait, and each retry spends quota.
    retry = types.HttpRetryOptions(attempts=3, initial_delay=1.0, max_delay=4.0, http_status_codes=[500, 503])
    return GoogleGenAI(
        model=cfg.gemini_llm_model,
        api_key=cfg.gemini_api_key,
        system_prompt=system_prompt,
        http_options=types.HttpOptions(retry_options=retry),
    )


def get_qdrant_client(cfg: Settings) -> QdrantClient:
    return QdrantClient(url=cfg.qdrant_url, api_key=cfg.qdrant_api_key or None)


def get_vector_store(cfg: Settings, client: QdrantClient) -> QdrantVectorStore:
    return QdrantVectorStore(client=client, collection_name=cfg.qdrant_collection)
