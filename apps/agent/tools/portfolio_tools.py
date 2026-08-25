"""
Tool functions the LLM can call to answer questions about the portfolio owner.
Backed by data/portfolio.json — edit that file (or point this at a database /
API) to keep the chat agent's knowledge in sync with the site.
"""

import json
from pathlib import Path

DATA_PATH = Path(__file__).resolve().parent.parent / "data" / "portfolio.json"


def _load_data() -> dict:
    with open(DATA_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


def get_profile() -> dict:
    """Return basic profile info: name, title, location, bio, contact links."""
    return _load_data()["profile"]


def get_skills() -> list:
    """Return the list of skills / technologies."""
    return _load_data()["skills"]


def get_projects(name: str | None = None) -> list:
    """
    Return project details. If `name` is given, filter to projects whose
    name contains it (case-insensitive); otherwise return all projects.
    """
    projects = _load_data()["projects"]
    if not name:
        return projects
    needle = name.lower()
    return [p for p in projects if needle in p["name"].lower()]


def get_experience() -> list:
    """Return work experience history."""
    return _load_data()["experience"]


def get_education() -> dict:
    """Return education history and certifications."""
    data = _load_data()
    return {"education": data.get("education", []), "certifications": data.get("certifications", [])}


# ---------------------------------------------------------------------------
# OpenAI-style tool schema, one entry per function above.
# Add a new entry here whenever you add a new tool function.
# ---------------------------------------------------------------------------

TOOL_SCHEMAS = [
    {
        "type": "function",
        "function": {
            "name": "get_profile",
            "description": "Get the portfolio owner's name, title, location, bio, and contact links (email, GitHub, LinkedIn).",
            "parameters": {"type": "object", "properties": {}},
        },
    },
    {
        "type": "function",
        "function": {
            "name": "get_skills",
            "description": "Get the portfolio owner's list of skills and technologies.",
            "parameters": {"type": "object", "properties": {}},
        },
    },
    {
        "type": "function",
        "function": {
            "name": "get_projects",
            "description": "Get details about the portfolio owner's projects. Optionally filter by project name.",
            "parameters": {
                "type": "object",
                "properties": {
                    "name": {
                        "type": "string",
                        "description": "Optional project name (or partial name) to filter by.",
                    }
                },
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "get_experience",
            "description": "Get the portfolio owner's work experience history.",
            "parameters": {"type": "object", "properties": {}},
        },
    },
    {
        "type": "function",
        "function": {
            "name": "get_education",
            "description": "Get the portfolio owner's education history and certifications.",
            "parameters": {"type": "object", "properties": {}},
        },
    },
]

TOOL_IMPLEMENTATIONS = {
    "get_profile": get_profile,
    "get_skills": get_skills,
    "get_projects": get_projects,
    "get_experience": get_experience,
    "get_education": get_education,
}
