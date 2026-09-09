from __future__ import annotations

import base64
import os
import re
from pathlib import Path

import httpx

RESUME_PDF_PATH = Path(__file__).resolve().parent.parent / "data" / "KamranAli_Resume.pdf"

_EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
_RESEND_API_URL = "https://api.resend.com/emails"


def is_valid_email(address: str) -> bool:
    return bool(_EMAIL_RE.match(address.strip()))


def send_resume_email(to_email: str) -> None:
    """Emails the resume PDF as an attachment to the given address via Resend.

    Uses Resend's HTTPS API rather than raw SMTP — many PaaS hosts (Railway,
    Render, etc.) block outbound SMTP ports, but HTTPS always works.

    Raises RuntimeError if Resend is not configured or the send fails, and
    ValueError if the address does not look like a valid email.
    """
    to_email = to_email.strip()
    if not is_valid_email(to_email):
        raise ValueError(f"'{to_email}' does not look like a valid email address.")

    api_key = os.environ.get("RESEND_API_KEY")
    mail_from = os.environ.get("RESEND_FROM", "onboarding@resend.dev")
    owner_name = os.environ.get("RESUME_OWNER_NAME", "Kamran Ali")

    if not api_key:
        raise RuntimeError(
            "Email sending is not configured on the server (missing "
            "RESEND_API_KEY in apps/agent/.env)."
        )

    if not RESUME_PDF_PATH.exists():
        raise RuntimeError(f"Resume file not found at {RESUME_PDF_PATH}")

    attachment_b64 = base64.b64encode(RESUME_PDF_PATH.read_bytes()).decode("ascii")

    response = httpx.post(
        _RESEND_API_URL,
        headers={"Authorization": f"Bearer {api_key}"},
        json={
            "from": f"{owner_name} <{mail_from}>",
            "to": [to_email],
            "subject": f"{owner_name}'s Resume",
            "text": f"Hi,\n\nAs requested, here is {owner_name}'s resume.\n\nBest,\n{owner_name}",
            "attachments": [
                {"filename": RESUME_PDF_PATH.name, "content": attachment_b64},
            ],
        },
        timeout=20.0,
    )

    if response.status_code >= 400:
        raise RuntimeError(f"Resend API error ({response.status_code}): {response.text}")
