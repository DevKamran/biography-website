from __future__ import annotations

import os
from dataclasses import dataclass

from dotenv import load_dotenv

load_dotenv()


@dataclass
class Settings:
    gemini_api_key: str
    gemini_llm_model: str
    gemini_embed_model: str
    qdrant_url: str
    qdrant_api_key: str
    qdrant_collection: str


def load_settings(collection_override: str | None = None) -> Settings:
    gemini_api_key = os.environ.get("GEMINI_API_KEY")
    qdrant_url = os.environ.get("QDRANT_URL")

    missing = [
        name
        for name, value in [("GEMINI_API_KEY", gemini_api_key), ("QDRANT_URL", qdrant_url)]
        if not value
    ]
    if missing:
        raise RuntimeError(
            f"Missing required env var(s): {', '.join(missing)}. "
            "Copy .env.example to .env and fill them in."
        )

    return Settings(
        gemini_api_key=gemini_api_key,
        gemini_llm_model=os.environ.get("GEMINI_LLM_MODEL", "gemini-3.7-flash"),
        gemini_embed_model=os.environ.get("GEMINI_EMBED_MODEL", "gemini-embedding-2-preview"),
        qdrant_url=qdrant_url,
        qdrant_api_key=os.environ.get("QDRANT_API_KEY", ""),
        qdrant_collection=collection_override
        or os.environ.get("QDRANT_COLLECTION_NAME", "resume_chunks"),
    )
