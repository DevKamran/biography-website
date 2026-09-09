from __future__ import annotations

import base64
import os
import re
from pathlib import Path

import httpx

RESUME_PDF_PATH = Path(__file__).resolve().parent.parent / "data" / "KamranAli_Resume.pdf"

_EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
_MAILJET_API_URL = "https://api.mailjet.com/v3.1/send"


def is_valid_email(address: str) -> bool:
    return bool(_EMAIL_RE.match(address.strip()))


def send_resume_email(to_email: str) -> None:
    """Emails the resume PDF as an attachment to the given address via Mailjet.

    Uses Mailjet's HTTPS API rather than raw SMTP — Railway's free/hobby
    plan blocks outbound SMTP ports, but HTTPS always works. Mailjet only
    requires verifying a single sender email address (no domain/DNS
    needed), and its free tier (200 emails/day) needs no credit card.

    Raises RuntimeError if Mailjet is not configured or the send fails, and
    ValueError if the address does not look like a valid email.
    """
    to_email = to_email.strip()
    if not is_valid_email(to_email):
        raise ValueError(f"'{to_email}' does not look like a valid email address.")

    api_key = os.environ.get("MAILJET_API_KEY")
    api_secret = os.environ.get("MAILJET_API_SECRET")
    mail_from = os.environ.get("MAILJET_FROM")
    owner_name = os.environ.get("RESUME_OWNER_NAME", "Kamran Ali")

    if not api_key or not api_secret or not mail_from:
        raise RuntimeError(
            "Email sending is not configured on the server (missing "
            "MAILJET_API_KEY/MAILJET_API_SECRET/MAILJET_FROM in apps/agent/.env)."
        )

    if not RESUME_PDF_PATH.exists():
        raise RuntimeError(f"Resume file not found at {RESUME_PDF_PATH}")

    attachment_b64 = base64.b64encode(RESUME_PDF_PATH.read_bytes()).decode("ascii")

    response = httpx.post(
        _MAILJET_API_URL,
        auth=(api_key, api_secret),
        json={
            "Messages": [
                {
                    "From": {"Email": mail_from, "Name": owner_name},
                    "To": [{"Email": to_email}],
                    "Subject": f"{owner_name}'s Resume",
                    "TextPart": f"Hi,\n\nAs requested, here is {owner_name}'s resume.\n\nBest,\n{owner_name}",
                    "Attachments": [
                        {
                            "ContentType": "application/pdf",
                            "Filename": RESUME_PDF_PATH.name,
                            "Base64Content": attachment_b64,
                        }
                    ],
                }
            ]
        },
        timeout=20.0,
    )

    if response.status_code >= 400:
        raise RuntimeError(f"Mailjet API error ({response.status_code}): {response.text}")
