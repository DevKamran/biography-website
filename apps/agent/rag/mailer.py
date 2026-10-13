from __future__ import annotations

import base64
import os
import re
import smtplib
from email.message import EmailMessage
from pathlib import Path

import httpx

from rag.email_template import render_resume_email

RESUME_PDF_PATH = Path(__file__).resolve().parent.parent / "data" / "KamranAli_Resume.pdf"

_EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
_RESEND_API_URL = "https://api.resend.com/emails"
_MAILJET_API_URL = "https://api.mailjet.com/v3.1/send"


def is_valid_email(address: str) -> bool:
    return bool(_EMAIL_RE.match(address.strip()))


def send_resume_email(to_email: str) -> None:
    """Emails the resume PDF as an attachment to the given address.

    Tries Resend, then SMTP (e.g. Gmail with an app password), then Mailjet,
    using whichever are configured. Note Railway's free/hobby plan blocks
    outbound SMTP; the HTTPS providers work anywhere.

    Raises RuntimeError if no provider is configured or the send fails, and
    ValueError if the address does not look like a valid email.
    """
    to_email = to_email.strip()
    if not is_valid_email(to_email):
        raise ValueError(f"'{to_email}' does not look like a valid email address.")

    if not RESUME_PDF_PATH.exists():
        raise RuntimeError(f"Resume file not found at {RESUME_PDF_PATH}")

    owner_name = os.environ.get("RESUME_OWNER_NAME", "Kamran Ali")
    subject = f"{owner_name}'s Resume"
    text, html = render_resume_email(owner_name, RESUME_PDF_PATH.name)
    attachment_b64 = base64.b64encode(RESUME_PDF_PATH.read_bytes()).decode("ascii")

    # Try each configured provider in order. Without a verified domain Resend
    # only delivers to the account owner, so the others act as fallbacks.
    senders = []
    if os.environ.get("RESEND_API_KEY"):
        senders.append(_send_via_resend)
    if os.environ.get("SMTP_PASSWORD"):
        senders.append(_send_via_smtp)
    if os.environ.get("MAILJET_API_KEY"):
        senders.append(_send_via_mailjet)
    if not senders:
        raise RuntimeError(
            "Email sending is not configured on the server (set RESEND_API_KEY, "
            "SMTP_USER/SMTP_PASSWORD, or MAILJET_* in apps/agent/.env)."
        )

    errors = []
    for send in senders:
        try:
            send(to_email, owner_name, subject, text, html, attachment_b64)
            return
        except (RuntimeError, OSError, smtplib.SMTPException) as exc:
            errors.append(str(exc))
    raise RuntimeError(" | ".join(errors))


def _send_via_resend(to_email: str, owner_name: str, subject: str, text: str, html: str, attachment_b64: str) -> None:
    # Resend's shared onboarding@resend.dev sender can only deliver to the
    # Resend account owner's own address; set RESEND_FROM to an address on a
    # domain verified in Resend to email anyone else.
    mail_from = os.environ.get("RESEND_FROM", "onboarding@resend.dev")

    response = httpx.post(
        _RESEND_API_URL,
        headers={"Authorization": f"Bearer {os.environ['RESEND_API_KEY']}"},
        json={
            "from": f"{owner_name} <{mail_from}>",
            "to": [to_email],
            "subject": subject,
            "text": text,
            "html": html,
            "attachments": [{"filename": RESUME_PDF_PATH.name, "content": attachment_b64}],
        },
        timeout=20.0,
    )

    if response.status_code >= 400:
        raise RuntimeError(f"Resend API error ({response.status_code}): {response.text}")


def _send_via_smtp(to_email: str, owner_name: str, subject: str, text: str, html: str, attachment_b64: str) -> None:
    smtp_host = os.environ.get("SMTP_HOST", "smtp.gmail.com")
    smtp_port = int(os.environ.get("SMTP_PORT", "587"))
    smtp_user = os.environ.get("SMTP_USER")
    smtp_password = os.environ.get("SMTP_PASSWORD")
    mail_from = os.environ.get("SMTP_FROM", smtp_user)

    if not smtp_user or not smtp_password or not mail_from:
        raise RuntimeError("SMTP is not fully configured (missing SMTP_USER/SMTP_PASSWORD in apps/agent/.env).")

    msg = EmailMessage()
    msg["From"] = f"{owner_name} <{mail_from}>"
    msg["To"] = to_email
    msg["Subject"] = subject
    msg.set_content(text)
    msg.add_alternative(html, subtype="html")
    msg.add_attachment(
        base64.b64decode(attachment_b64),
        maintype="application",
        subtype="pdf",
        filename=RESUME_PDF_PATH.name,
    )

    with smtplib.SMTP(smtp_host, smtp_port, timeout=20) as server:
        server.starttls()
        server.login(smtp_user, smtp_password)
        server.send_message(msg)


def _send_via_mailjet(to_email: str, owner_name: str, subject: str, text: str, html: str, attachment_b64: str) -> None:
    api_key = os.environ.get("MAILJET_API_KEY")
    api_secret = os.environ.get("MAILJET_API_SECRET")
    mail_from = os.environ.get("MAILJET_FROM")

    if not api_key or not api_secret or not mail_from:
        raise RuntimeError(
            "Mailjet is not fully configured (missing "
            "MAILJET_API_KEY/MAILJET_API_SECRET/MAILJET_FROM in apps/agent/.env)."
        )

    response = httpx.post(
        _MAILJET_API_URL,
        auth=(api_key, api_secret),
        json={
            "Messages": [
                {
                    "From": {"Email": mail_from, "Name": owner_name},
                    "To": [{"Email": to_email}],
                    "Subject": subject,
                    "TextPart": text,
                    "HTMLPart": html,
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
