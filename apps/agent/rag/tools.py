from __future__ import annotations

import os

from llama_index.core.query_engine import BaseQueryEngine
from llama_index.core.tools import FunctionTool, QueryEngineTool

from rag.mailer import send_resume_email

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
    return [resume_qa_tool, send_email_tool, get_pdf_tool]
