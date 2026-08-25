# resume-rag

A Retrieval-Augmented Generation (RAG) API for querying a resume, built with
LlamaIndex, Qdrant (vector database), Google Gemini (LLM + embeddings), and
FastAPI. Resumes are chunked by structural sections (Experience, Education,
Skills, ...) rather than raw token count, and every chunk carries
`document`/`section`/`role` metadata so a retrieved bullet point stays tied
to the job it came from. The query prompt is strict: if the answer isn't in
the resume, the assistant says it doesn't know instead of inventing details.

## Setup

Requires Python >= 3.9.

```bash
cd apps/resume-rag
python -m venv venv
source venv/bin/activate      # on Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
```

Fill in `.env`:
- `GEMINI_API_KEY` — free key from https://aistudio.google.com/apikey
- `QDRANT_URL` / `QDRANT_API_KEY` — free cluster from https://cloud.qdrant.io

## Ingest a resume

Ingestion is a manual, run-once-per-update step — it is not part of the API
request path. It embeds the resume's chunks and upserts them into Qdrant
(auto-creating the collection on first run).

```bash
python ingest.py --file data/KamranAli_Resume.pdf --document "KamranAli_Resume"
```

- `--file` accepts `.md` or `.pdf`.
- `--document` tags every chunk so re-ingesting the same document replaces
  its old chunks instead of duplicating them.

To update the resume, replace `data/KamranAli_Resume.pdf` and re-run the
command above.

## Run the API locally

```bash
uvicorn main:app --reload --port 8000
```

## Example requests

```bash
curl -s -X POST http://localhost:8000/query \
  -H "Content-Type: application/json" \
  -d '{"question": "What UI/UX engineering experience does the candidate have?"}'
```

Guardrail check — this should get an "I don't know" style answer, not an
invented one:

```bash
curl -s -X POST http://localhost:8000/query \
  -H "Content-Type: application/json" \
  -d '{"question": "What is the candidate'\''s expected salary?"}'
```

## Deployment (Railway / Render)

1. Push this repo to GitHub.
2. Create a new service pointing at `apps/resume-rag` (build context/root
   directory), building from the included `Dockerfile`.
3. Set env vars in the platform dashboard: `GEMINI_API_KEY`,
   `GEMINI_LLM_MODEL`, `GEMINI_EMBED_MODEL`, `QDRANT_URL`, `QDRANT_API_KEY`,
   `QDRANT_COLLECTION_NAME`.
4. Run `python ingest.py --file <your-resume> --document "<name>"` once
   (locally against the same Qdrant cluster, or as a one-off job on the
   platform) — the container's default `CMD` only starts the API server, it
   does not ingest automatically.

## Updating the resume

Re-run `ingest.py` with the same `--document` value used before. Ingestion
deletes existing Qdrant points for that document name before inserting the
new chunks, so old and new content won't mix.
