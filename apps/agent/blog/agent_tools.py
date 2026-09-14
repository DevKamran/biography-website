from __future__ import annotations

import json

from llama_index.core.tools import FunctionTool

from . import store

# Relative to the frontend origin — the chat widget renders this as a link
# the visitor can click, same as the resume PDF link.
BLOG_BASE_PATH = "/blog"


def _get_blog_posts_tool() -> str:
    """Return title, category, excerpt, and link for every published blog post.

    Use this for any question about blog posts, articles, or writing —
    including "how many posts have you written" or "what have you written
    about X" — instead of guessing, since it returns the exact, current list.
    """
    posts, total = store.list_posts(status="published", page=1, page_size=50)
    if not posts:
        return "No blog posts are published yet."

    items = [
        {
            "title": p.title,
            "category": p.category,
            "excerpt": p.excerpt,
            "published_at": p.published_at,
            "url": f"{BLOG_BASE_PATH}/{p.slug}",
        }
        for p in posts
    ]
    return json.dumps({"total": total, "posts": items}, indent=2)


def build_blog_tools() -> list:
    return [
        FunctionTool.from_defaults(
            fn=_get_blog_posts_tool,
            name="get_blog_posts",
            description=(
                "Get the exact, current list of published blog posts (title, "
                "category, excerpt, and link). Use this for any question about "
                "blog posts, articles, or writing on the site — including "
                "'how many posts have you written' or 'what have you written "
                "about X'. Never invent blog post titles or topics."
            ),
        )
    ]
