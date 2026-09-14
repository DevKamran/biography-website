from __future__ import annotations

import os

from fastapi import APIRouter, Depends, Header, HTTPException, Query

from . import store
from .models import BlogPost, BlogPostCreate, BlogPostListResponse, BlogPostUpdate, Category

router = APIRouter(prefix="/blog", tags=["blog"])


def _is_admin(x_admin_token: str | None) -> bool:
    expected = os.environ.get("BLOG_ADMIN_TOKEN")
    return bool(expected) and x_admin_token == expected


def _require_admin(x_admin_token: str | None = Header(default=None)) -> None:
    expected = os.environ.get("BLOG_ADMIN_TOKEN")
    if not expected:
        raise HTTPException(status_code=500, detail="BLOG_ADMIN_TOKEN is not configured on the server.")
    if x_admin_token != expected:
        raise HTTPException(status_code=401, detail="Invalid or missing admin token.")


@router.get("/posts", response_model=BlogPostListResponse)
def get_posts(
    category: str | None = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=50),
    status: str | None = Query(
        None, description="Admin only — 'draft' or 'published'. Ignored for non-admin requests."
    ),
    x_admin_token: str | None = Header(default=None),
):
    admin = _is_admin(x_admin_token)
    # Admins with no explicit status filter see every post (draft + published,
    # since store.list_posts treats status=None as "no filter"); everyone else
    # only ever sees published posts.
    effective_status = status if admin else "published"
    posts, total = store.list_posts(category=category, status=effective_status, page=page, page_size=page_size)
    return BlogPostListResponse(posts=posts, total=total, page=page, page_size=page_size)


@router.get("/posts/{slug}", response_model=BlogPost)
def get_post(slug: str, x_admin_token: str | None = Header(default=None)):
    post = store.get_post_by_slug(slug)
    if not post or (post.status != "published" and not _is_admin(x_admin_token)):
        raise HTTPException(status_code=404, detail="Post not found.")
    return post


@router.get("/categories", response_model=list[Category])
def get_categories():
    return store.list_categories(status="published")


@router.post("/posts", response_model=BlogPost, status_code=201, dependencies=[Depends(_require_admin)])
def create_post(data: BlogPostCreate):
    try:
        return store.create_post(data)
    except ValueError as exc:
        raise HTTPException(status_code=409, detail=str(exc)) from exc


@router.put("/posts/{slug}", response_model=BlogPost, dependencies=[Depends(_require_admin)])
def update_post(slug: str, data: BlogPostUpdate):
    try:
        post = store.update_post(slug, data)
    except ValueError as exc:
        raise HTTPException(status_code=409, detail=str(exc)) from exc
    if not post:
        raise HTTPException(status_code=404, detail="Post not found.")
    return post


@router.delete("/posts/{slug}", status_code=204, dependencies=[Depends(_require_admin)])
def delete_post(slug: str):
    if not store.delete_post(slug):
        raise HTTPException(status_code=404, detail="Post not found.")
