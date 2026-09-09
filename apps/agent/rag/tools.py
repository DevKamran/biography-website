from __future__ import annotations

import json
import os

from llama_index.core.query_engine import BaseQueryEngine
from llama_index.core.tools import FunctionTool, QueryEngineTool

from rag.mailer import send_resume_email
from rag.portfolio_data import load_portfolio_data

RESUME_OWNER_NAME = os.environ.get("RESUME_OWNER_NAME", "Kamran Ali")

# Relative to the frontend origin — proxied through the Next.js app so the
# visitor's browser never talks to this backend directly.
RESUME_DOWNLOAD_PATH = "/api/resume-download"


def _send_resume_email_tool(email: str) -> str:
    """Email the resume as a PDF attachment to the given address.

    Only call this once you have an explicit, confirmed email address from
    the visitor — never guess or reuse an address from earlier in the
    conversation without confirmation.
    """
    try:
        send_resume_email(email)
    except ValueError as exc:
        return f"Couldn't send it: {exc} Please ask the visitor for a valid email address."
    except RuntimeError as exc:
        return f"Couldn't send the email right now: {exc}"
    return f"Success — the resume PDF was emailed to {email}."


def _get_resume_pdf_link_tool() -> str:
    """Return a direct download link for the resume PDF.

    Call this whenever the visitor asks to see, download, or be given the
    resume/CV itself (e.g. as a PDF), as opposed to asking questions about
    its contents.
    """
    return f"[Download {RESUME_OWNER_NAME}'s resume (PDF)]({RESUME_DOWNLOAD_PATH})"


def _get_profile_tool() -> str:
    """Return exact profile facts: name, title, location, bio, and contact/social links.

    Prefer this over resume_qa for identity/contact questions (e.g. "what's
    your email", "where are you based", "what's your GitHub") — it returns
    the exact values the site displays instead of a paraphrase.
    """
    return json.dumps(load_portfolio_data()["profile"], indent=2)


def _get_skills_tool() -> str:
    """Return the exact list of technical skills from the site's tech stack.

    Prefer this over resume_qa when the visitor asks what skills/technologies
    are used — it returns the exact, current list instead of a paraphrase.
    """
    return ", ".join(load_portfolio_data()["skills"])


def _get_projects_tool() -> str:
    """Return exact project details (name, description, tech stack) for the
    portfolio's featured projects.

    Prefer this over resume_qa when the visitor asks about specific projects
    or wants a list of projects — it returns the exact, current details.
    """
    return json.dumps(load_portfolio_data()["projects"], indent=2)


def _get_experience_tool() -> str:
    """Return the exact work experience history (role, company, dates,
    location, and highlights for each position).

    Prefer this over resume_qa when the visitor asks about work history,
    employers, or dates — it returns the exact, current details.
    """
    return json.dumps(load_portfolio_data()["experience"], indent=2)


def build_tools(query_engine: BaseQueryEngine) -> list:
    resume_qa_tool = QueryEngineTool.from_defaults(
        query_engine=query_engine,
        name="resume_qa",
        description=(
            f"Answer questions about {RESUME_OWNER_NAME}'s background, skills, "
            "experience, and projects by searching the resume. Use this for any "
            "question about who they are or what they've done."
        ),
    )
    send_email_tool = FunctionTool.from_defaults(
        fn=_send_resume_email_tool,
        name="send_resume_email",
        description=(
            "Email the resume PDF to a recipient's email address. Requires a "
            "specific, confirmed email address as input — if the visitor hasn't "
            "given one yet (e.g. they just said 'send my resume to my email' or "
            "'send it to my recruiter'), ask them for the email address first "
            "instead of calling this tool."
        ),
    )
    get_pdf_tool = FunctionTool.from_defaults(
        fn=_get_resume_pdf_link_tool,
        name="get_resume_pdf_link",
        description=(
            "Get a direct download link for the resume PDF, for when the "
            "visitor wants the resume/CV itself rather than an answer about "
            "its contents (e.g. 'give me the resume as a PDF', 'can I download "
            "your CV')."
        ),
    )
    profile_tool = FunctionTool.from_defaults(
        fn=_get_profile_tool,
        name="get_profile",
        description=(
            f"Get {RESUME_OWNER_NAME}'s exact profile facts — name, title, "
            "location, bio, and contact/social links (email, GitHub, "
            "LinkedIn, etc). Prefer this over resume_qa for identity or "
            "contact questions."
        ),
    )
    skills_tool = FunctionTool.from_defaults(
        fn=_get_skills_tool,
        name="get_skills",
        description=(
            f"Get {RESUME_OWNER_NAME}'s exact, current list of technical "
            "skills. Prefer this over resume_qa when asked what skills or "
            "technologies they use."
        ),
    )
    projects_tool = FunctionTool.from_defaults(
        fn=_get_projects_tool,
        name="get_projects",
        description=(
            f"Get {RESUME_OWNER_NAME}'s exact, current featured projects "
            "(name, description, tech stack). Prefer this over resume_qa "
            "when asked about specific projects or for a project list."
        ),
    )
    experience_tool = FunctionTool.from_defaults(
        fn=_get_experience_tool,
        name="get_experience",
        description=(
            f"Get {RESUME_OWNER_NAME}'s exact, current work experience "
            "history (role, company, dates, location, highlights). Prefer "
            "this over resume_qa when asked about work history or employers."
        ),
    )
    return [
        resume_qa_tool,
        send_email_tool,
        get_pdf_tool,
        profile_tool,
        skills_tool,
        projects_tool,
        experience_tool,
    ]
