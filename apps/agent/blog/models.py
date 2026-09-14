from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, Field

Status = Literal["draft", "published"]

_SLUG_PATTERN = r"^[a-z0-9]+(?:-[a-z0-9]+)*$"


class Category(BaseModel):
    name: str
    slug: str
    post_count: int = 0


class BlogPostBase(BaseModel):
    title: str = Field(..., min_length=1)
    slug: str = Field(..., min_length=1, pattern=_SLUG_PATTERN)
    excerpt: str = ""
    content: str = Field(..., min_length=1)
    category: str = Field(..., min_length=1)
    cover_image: str | None = None
    status: Status = "draft"


class BlogPostCreate(BlogPostBase):
    pass


class BlogPostUpdate(BaseModel):
    title: str | None = None
    slug: str | None = Field(default=None, pattern=_SLUG_PATTERN)
    excerpt: str | None = None
    content: str | None = None
    category: str | None = None
    cover_image: str | None = None
    status: Status | None = None


class BlogPost(BlogPostBase):
    id: str
    published_at: str | None = None
    updated_at: str


class BlogPostSummary(BaseModel):
    id: str
    title: str
    slug: str
    excerpt: str
    category: str
    cover_image: str | None = None
    status: Status
    published_at: str | None = None
    updated_at: str


class BlogPostListResponse(BaseModel):
    posts: list[BlogPostSummary]
    total: int
    page: int
    page_size: int
