from __future__ import annotations

import os
import re
import smtplib
from email.message import EmailMessage
from pathlib import Path

RESUME_PDF_PATH = Path(__file__).resolve().parent.parent / "data" / "KamranAli_Resume.pdf"

_EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


def is_valid_email(address: str) -> bool:
    return bool(_EMAIL_RE.match(address.strip()))


def send_resume_email(to_email: str) -> None:
    """Emails the resume PDF as an attachment to the given address.

    Raises RuntimeError if SMTP is not configured or the send fails, and
    ValueError if the address does not look like a valid email.
    """
    to_email = to_email.strip()
    if not is_valid_email(to_email):
        raise ValueError(f"'{to_email}' does not look like a valid email address.")

    smtp_host = os.environ.get("SMTP_HOST")
    smtp_port = int(os.environ.get("SMTP_PORT", "587"))
    smtp_user = os.environ.get("SMTP_USER")
    smtp_password = os.environ.get("SMTP_PASSWORD")
    mail_from = os.environ.get("SMTP_FROM", smtp_user)
    owner_name = os.environ.get("RESUME_OWNER_NAME", "Kamran Ali")

    if not all([smtp_host, smtp_user, smtp_password, mail_from]):
        raise RuntimeError(
            "Email sending is not configured on the server (missing "
            "SMTP_HOST/SMTP_USER/SMTP_PASSWORD/SMTP_FROM in apps/agent/.env)."
        )

    if not RESUME_PDF_PATH.exists():
        raise RuntimeError(f"Resume file not found at {RESUME_PDF_PATH}")

    msg = EmailMessage()
    msg["Subject"] = f"{owner_name}'s Resume"
    msg["From"] = mail_from
    msg["To"] = to_email
    msg.set_content(f"Hi,\n\nAs requested, here is {owner_name}'s resume.\n\nBest,\n{owner_name}")
    msg.add_attachment(
        RESUME_PDF_PATH.read_bytes(),
        maintype="application",
        subtype="pdf",
        filename=RESUME_PDF_PATH.name,
    )

    with smtplib.SMTP(smtp_host, smtp_port) as server:
        server.starttls()
        server.login(smtp_user, smtp_password)
        server.send_message(msg)
