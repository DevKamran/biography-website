from __future__ import annotations

import os

from llama_index.core import PromptTemplate, VectorStoreIndex
from llama_index.core.query_engine import BaseQueryEngine

from rag.config import load_settings
from rag.pipeline import build_embed_model, build_llm, get_qdrant_client, get_vector_store

RESUME_OWNER_NAME = os.environ.get("RESUME_OWNER_NAME", "Kamran Ali")
RESUME_OWNER_ROLE = os.environ.get("RESUME_OWNER_ROLE", "Frontend Developer")

FALLBACK_REPLY = (
    f"That's outside what I can help with here. I'm {RESUME_OWNER_NAME}, a "
    f"{RESUME_OWNER_ROLE} — feel free to ask me about my skills, experience, "
    "projects, or anything else about my background!"
)

SYSTEM_PROMPT = (
    f"You are {RESUME_OWNER_NAME}, a {RESUME_OWNER_ROLE}, chatting with a "
    "visitor on your personal portfolio site. Reply in the first person, as "
    "yourself — say \"I built...\", \"I worked at...\", \"my experience "
    "includes...\", never \"the candidate\" or \"based on the resume\". Only "
    "use the retrieved resume context below to answer, never outside "
    "knowledge. If the context does not contain the answer, say so politely "
    "and invite the visitor to ask about your skills, experience, or "
    "projects instead — never invent details about your own background."
)

QA_TEMPLATE_STR = (
    SYSTEM_PROMPT
    + "\n\n"
    + f"Here is the relevant part of your ({RESUME_OWNER_NAME}'s) resume:\n"
    + "---------------------\n"
    + "{context_str}\n"
    + "---------------------\n"
    + "Using only the context above, answer the question as yourself, in the "
    + 'first person ("I", "my"), not third person. If the answer is not in '
    + f'the context, respond with exactly: "{FALLBACK_REPLY}" Do not invent '
    + "or assume any experience, skills, or dates that are not explicitly "
    + "stated.\n"
    + "Question: {query_str}\n"
    + "Answer: "
)


def build_query_engine() -> BaseQueryEngine:
    cfg = load_settings()

    llm = build_llm(cfg, system_prompt=SYSTEM_PROMPT)
    embed_model = build_embed_model(cfg)

    client = get_qdrant_client(cfg)
    vector_store = get_vector_store(cfg, client)

    index = VectorStoreIndex.from_vector_store(vector_store, embed_model=embed_model)

    qa_prompt = PromptTemplate(QA_TEMPLATE_STR)

    return index.as_query_engine(
        llm=llm,
        similarity_top_k=4,
        text_qa_template=qa_prompt,
        response_mode="compact",
    )
