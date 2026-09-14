from __future__ import annotations

import html
import os
import re
import uuid
from datetime import datetime, timezone
from functools import lru_cache

from qdrant_client import QdrantClient, models

from rag.config import load_settings
from rag.pipeline import build_embed_model, get_qdrant_client

from .models import BlogPost, BlogPostCreate, BlogPostSummary, BlogPostUpdate, Category

POSTS_COLLECTION = os.environ.get("QDRANT_COLLECTION_BLOG_POSTS", "blog_posts")

_TAG_RE = re.compile(r"<[^>]+>")
_SLUGIFY_RE = re.compile(r"[^a-z0-9]+")


def _strip_html(value: str) -> str:
    return html.unescape(_TAG_RE.sub(" ", value)).strip()


def _slugify(value: str) -> str:
    return _SLUGIFY_RE.sub("-", value.lower()).strip("-")


@lru_cache(maxsize=1)
def _client() -> QdrantClient:
    return get_qdrant_client(load_settings())


@lru_cache(maxsize=1)
def _embed_model():
    return build_embed_model(load_settings())


_collection_ready = False


def _ensure_collection() -> None:
    global _collection_ready
    if _collection_ready:
        return
    client = _client()
    if not client.collection_exists(POSTS_COLLECTION):
        vector_size = len(_embed_model().get_text_embedding("dimension probe"))
        client.create_collection(
            collection_name=POSTS_COLLECTION,
            vectors_config=models.VectorParams(size=vector_size, distance=models.Distance.COSINE),
        )
        client.create_payload_index(POSTS_COLLECTION, "slug", models.PayloadSchemaType.KEYWORD)
        client.create_payload_index(POSTS_COLLECTION, "status", models.PayloadSchemaType.KEYWORD)
        client.create_payload_index(POSTS_COLLECTION, "category", models.PayloadSchemaType.KEYWORD)
    _collection_ready = True


def _embed_text(title: str, excerpt: str, content: str) -> list[float]:
    text = f"{title}\n\n{excerpt}\n\n{_strip_html(content)}"[:8000]
    return _embed_model().get_text_embedding(text)


def _point_to_post(point) -> BlogPost:
    return BlogPost(id=str(point.id), **point.payload)


def _point_to_summary(point) -> BlogPostSummary:
    payload = point.payload
    return BlogPostSummary(id=str(point.id), **{k: payload[k] for k in BlogPostSummary.model_fields if k != "id"})


def _find_by_slug(slug: str, exclude_id: str | None = None):
    _ensure_collection()
    results, _ = _client().scroll(
        collection_name=POSTS_COLLECTION,
        scroll_filter=models.Filter(
            must=[models.FieldCondition(key="slug", match=models.MatchValue(value=slug))]
        ),
        limit=1 if exclude_id is None else 2,
        with_payload=True,
    )
    for point in results:
        if exclude_id is None or str(point.id) != exclude_id:
            return point
    return None


def _scroll_all(scroll_filter: models.Filter | None, with_payload):
    points = []
    next_offset = None
    while True:
        batch, next_offset = _client().scroll(
            collection_name=POSTS_COLLECTION,
            scroll_filter=scroll_filter,
            limit=200,
            offset=next_offset,
            with_payload=with_payload,
        )
        points.extend(batch)
        if next_offset is None:
            break
    return points


def get_post_by_slug(slug: str) -> BlogPost | None:
    point = _find_by_slug(slug)
    return _point_to_post(point) if point else None


def create_post(data: BlogPostCreate) -> BlogPost:
    _ensure_collection()
    if _find_by_slug(data.slug):
        raise ValueError(f"A post with slug '{data.slug}' already exists.")

    now = datetime.now(timezone.utc).isoformat()
    post_id = str(uuid.uuid4())
    payload = {
        **data.model_dump(),
        "published_at": now if data.status == "published" else None,
        "updated_at": now,
    }
    vector = _embed_text(data.title, data.excerpt, data.content)

    _client().upsert(
        collection_name=POSTS_COLLECTION,
        points=[models.PointStruct(id=post_id, vector=vector, payload=payload)],
    )
    return BlogPost(id=post_id, **payload)


def update_post(slug: str, data: BlogPostUpdate) -> BlogPost | None:
    _ensure_collection()
    point = _find_by_slug(slug)
    if not point:
        return None

    existing = dict(point.payload)
    updates = {k: v for k, v in data.model_dump(exclude_unset=True).items() if v is not None}

    new_slug = updates.get("slug", existing["slug"])
    if new_slug != existing["slug"] and _find_by_slug(new_slug, exclude_id=str(point.id)):
        raise ValueError(f"A post with slug '{new_slug}' already exists.")

    merged = {**existing, **updates}
    now = datetime.now(timezone.utc).isoformat()
    merged["updated_at"] = now
    if merged["status"] == "published" and not existing.get("published_at"):
        merged["published_at"] = now
    elif merged["status"] == "draft":
        merged["published_at"] = None

    vector = _embed_text(merged["title"], merged["excerpt"], merged["content"])

    _client().upsert(
        collection_name=POSTS_COLLECTION,
        points=[models.PointStruct(id=str(point.id), vector=vector, payload=merged)],
    )
    return BlogPost(id=str(point.id), **merged)


def delete_post(slug: str) -> bool:
    _ensure_collection()
    point = _find_by_slug(slug)
    if not point:
        return False
    _client().delete(
        collection_name=POSTS_COLLECTION,
        points_selector=models.PointIdsList(points=[point.id]),
    )
    return True


def list_posts(
    *,
    category: str | None = None,
    status: str | None = "published",
    page: int = 1,
    page_size: int = 10,
) -> tuple[list[BlogPostSummary], int]:
    _ensure_collection()
    must = []
    if category:
        must.append(models.FieldCondition(key="category", match=models.MatchValue(value=category)))
    if status:
        must.append(models.FieldCondition(key="status", match=models.MatchValue(value=status)))
    scroll_filter = models.Filter(must=must) if must else None

    points = _scroll_all(scroll_filter, with_payload=True)
    points.sort(key=lambda p: p.payload.get("published_at") or p.payload.get("updated_at") or "", reverse=True)

    total = len(points)
    start = (page - 1) * page_size
    page_points = points[start : start + page_size]
    return [_point_to_summary(p) for p in page_points], total


def list_categories(status: str | None = "published") -> list[Category]:
    _ensure_collection()
    scroll_filter = (
        models.Filter(must=[models.FieldCondition(key="status", match=models.MatchValue(value=status))])
        if status
        else None
    )
    points = _scroll_all(scroll_filter, with_payload=["category"])

    counts: dict[str, int] = {}
    for point in points:
        name = point.payload.get("category")
        if name:
            counts[name] = counts.get(name, 0) + 1

    return [
        Category(name=name, slug=_slugify(name), post_count=count)
        for name, count in sorted(counts.items())
    ]
