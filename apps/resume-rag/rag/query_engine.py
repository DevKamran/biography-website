from __future__ import annotations

from llama_index.core import PromptTemplate, VectorStoreIndex
from llama_index.core.query_engine import BaseQueryEngine

from rag.config import load_settings
from rag.pipeline import build_embed_model, build_llm, get_qdrant_client, get_vector_store

SYSTEM_PROMPT = (
    "You are an AI assistant answering questions about this candidate's resume. "
    "Only use the retrieved context to answer. If the context does not contain "
    "the answer, say you don't know."
)

QA_TEMPLATE_STR = (
    SYSTEM_PROMPT
    + "\n\n"
    + "Context from the candidate's resume is below.\n"
    + "---------------------\n"
    + "{context_str}\n"
    + "---------------------\n"
    + "Given the context above and no other knowledge, answer the question. "
    + "If the answer is not contained in the context, respond with "
    + '"I don\'t know based on this resume." Do not invent or assume any '
    + "experience, skills, or dates that are not explicitly stated.\n"
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
