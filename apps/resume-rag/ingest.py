"""Standalone ingestion script — run manually once per resume update.

Usage:
    python ingest.py --file data/sample_resume.md --document "Jordan_Rivera_Resume"
"""
from __future__ import annotations

import argparse
from collections import Counter
from pathlib import Path

from llama_index.core import StorageContext, VectorStoreIndex
from qdrant_client import models

from rag.chunking import chunk_resume
from rag.config import load_settings
from rag.pipeline import build_embed_model, get_qdrant_client, get_vector_store


def delete_existing_document_chunks(client, collection_name: str, document_name: str) -> None:
    try:
        client.delete(
            collection_name=collection_name,
            points_selector=models.FilterSelector(
                filter=models.Filter(
                    must=[
                        models.FieldCondition(
                            key="document",
                            match=models.MatchValue(value=document_name),
                        )
                    ]
                )
            ),
        )
    except Exception:
        # Collection doesn't exist yet on first run — nothing to delete.
        pass


def main() -> None:
    parser = argparse.ArgumentParser(description="Ingest a resume into the Qdrant vector store.")
    parser.add_argument("--file", default="data/sample_resume.md", help="Path to the resume file (.md or .pdf)")
    parser.add_argument("--document", default=None, help="Document name used to tag chunks (default: file stem)")
    parser.add_argument("--collection", default=None, help="Override QDRANT_COLLECTION_NAME")
    args = parser.parse_args()

    file_path = Path(args.file)
    if not file_path.exists():
        raise SystemExit(f"File not found: {file_path}")

    document_name = args.document or file_path.stem

    cfg = load_settings(collection_override=args.collection)

    print(f"Chunking {file_path} as document '{document_name}'...")
    nodes = chunk_resume(file_path, document_name)
    if not nodes:
        raise SystemExit("No chunks were produced — check the resume's structure/headers.")

    client = get_qdrant_client(cfg)

    print(f"Removing any existing chunks for document '{document_name}' from '{cfg.qdrant_collection}'...")
    delete_existing_document_chunks(client, cfg.qdrant_collection, document_name)

    vector_store = get_vector_store(cfg, client)
    storage_context = StorageContext.from_defaults(vector_store=vector_store)
    embed_model = build_embed_model(cfg)

    print(f"Embedding and upserting {len(nodes)} chunk(s)...")
    VectorStoreIndex(nodes, storage_context=storage_context, embed_model=embed_model)

    sections = Counter(n.metadata.get("section", "General") for n in nodes)
    print(f"Done. Collection: '{cfg.qdrant_collection}'. Chunks: {len(nodes)}.")
    print("Sections found:")
    for section, count in sections.items():
        print(f"  - {section}: {count} chunk(s)")


if __name__ == "__main__":
    main()
