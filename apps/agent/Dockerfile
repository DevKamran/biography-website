FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

# Ingestion is a one-off step (run once per resume update, not on every
# query) — run it manually before/after deploying, e.g.:
#   docker run --rm --env-file .env agent python ingest.py --file data/sample_resume.md
CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}"] 
