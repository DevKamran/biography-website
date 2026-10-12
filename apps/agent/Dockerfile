FROM python:3.11-slim

# AWS Lambda Web Adapter: lets Lambda invoke the unchanged FastAPI/uvicorn
# server over HTTP. It's a Lambda extension, so it is inert when the same
# image runs elsewhere (Railway, local docker run).
COPY --from=public.ecr.aws/awsguru/aws-lambda-adapter:0.9.1 /lambda-adapter /opt/extensions/lambda-adapter

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Lambda's filesystem is read-only except /tmp, so point library caches there.
ENV PORT=8000 \
    AWS_LWA_READINESS_CHECK_PATH=/health \
    LLAMA_INDEX_CACHE_DIR=/tmp/llama_index \
    TIKTOKEN_CACHE_DIR=/tmp/tiktoken \
    NLTK_DATA=/tmp/nltk_data \
    HOME=/tmp

EXPOSE 8000

# Ingestion is a one-off step (run once per resume update, not on every
# query) — run it manually before/after deploying, e.g.:
#   docker run --rm --env-file .env agent python ingest.py --file data/sample_resume.md
CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}"]
