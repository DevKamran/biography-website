from __future__ import annotations

import os
from html import escape

from rag.portfolio_data import load_portfolio_data

# Email clients ignore <style> blocks and external CSS inconsistently, so the
# template uses table layout with inline styles only.
_ACCENT = "#22b8e8"
_INK = "#0a0a0c"
_MUTED = "#5f6068"
_BORDER = "#e6e6ea"
_PAGE_BG = "#f2f3f5"


def _site_url() -> str:
    return os.environ.get("PORTFOLIO_URL", "https://imkamranaly.vercel.app").rstrip("/")


def _profile() -> dict:
    try:
        return load_portfolio_data()["profile"]
    except Exception:
        return {}


def render_resume_email(owner_name: str, filename: str) -> tuple[str, str]:
    """Returns (plain_text, html) bodies for the resume email."""
    profile = _profile()
    title = profile.get("title", "")
    bio = (
        "I'm a Full Stack & AI Product Engineer with 7+ years building enterprise SaaS "
        "end to end — pixel-perfect React.js / Next.js / TypeScript frontends, backend "
        "APIs in Python FastAPI and PHP Laravel (REST & GraphQL), real-time features "
        "with Socket.io/WebSockets, and AI workflows powered by LLMs and RAG. I also "
        "handle the delivery side with Docker, GitHub Actions, AWS and Vercel."
    )
    current_work = (
        "Right now I'm shipping Goalytics, an AI-powered OKR platform, at Digital Gravity — "
        "owning everything from real-time collaboration and role-based dashboards to the APIs behind them."
    )
    email = profile.get("email", "")
    phone = profile.get("phone", "")
    location = profile.get("location", "")
    links = profile.get("links", {})
    site = _site_url()
    download_url = f"{site}/api/resume-download"
    first_name = owner_name.split()[0]

    text = (
        f"Hi there,\n\n"
        f"Thanks for your interest — as requested, my resume is attached ({filename}).\n\n"
        + f"{bio}\n\n{current_work}\n\n"
        + f"Download my resume (PDF): {download_url}\n"
        + f"Portfolio: {site}\n"
        + (f"LinkedIn: {links['linkedin']}\n" if links.get("linkedin") else "")
        + (f"GitHub: {links['github']}\n" if links.get("github") else "")
        + f"\nI'd be glad to chat — just reply to this email.\n\n"
        f"Best,\n{owner_name}"
        + (f"\n{title}" if title else "")
        + (f"\n{email}" if email else "")
        + (f" · {phone}" if phone else "")
    )

    def button(label: str, href: str, primary: bool = False) -> str:
        style = (
            f"background:{_ACCENT};color:{_INK};border:1px solid {_ACCENT};"
            if primary
            else f"background:#ffffff;color:{_INK};border:1px solid {_BORDER};"
        )
        return (
            f'<a href="{escape(href)}" target="_blank" '
            f'style="{style}display:inline-block;padding:11px 20px;border-radius:999px;'
            f'font-size:14px;font-weight:600;text-decoration:none;margin:0 6px 8px 0;">'
            f"{escape(label)}</a>"
        )

    buttons = button("View portfolio", site)
    if links.get("linkedin"):
        buttons += button("LinkedIn", links["linkedin"])
    if links.get("github"):
        buttons += button("GitHub", links["github"])

    contact_bits = [escape(b) for b in (email, phone, location) if b]
    contact_line = " &nbsp;·&nbsp; ".join(contact_bits)

    html = f"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light">
<title>{escape(owner_name)}'s Resume</title>
</head>
<body style="margin:0;padding:0;background:{_PAGE_BG};">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">My resume is attached — thanks for reaching out.</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:{_PAGE_BG};">
  <tr>
    <td align="center" style="padding:32px 16px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
        style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid {_BORDER};
        font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">

        <!-- Header -->
        <tr>
          <td style="background:{_INK};padding:28px 32px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td width="48" valign="middle">
                  <div style="width:44px;height:44px;border-radius:50%;background:{_ACCENT};color:{_INK};
                    font-size:17px;font-weight:800;line-height:44px;text-align:center;letter-spacing:0.5px;">
                    {escape("".join(w[0] for w in owner_name.split()[:2]).upper())}
                  </div>
                </td>
                <td valign="middle" style="padding-left:14px;">
                  <div style="color:#ffffff;font-size:18px;font-weight:700;line-height:1.2;">{escape(owner_name)}</div>
                  <div style="color:{_ACCENT};font-size:12px;font-weight:600;letter-spacing:1.5px;text-transform:uppercase;padding-top:4px;">{escape(title)}</div>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr><td style="height:4px;background:{_ACCENT};line-height:4px;font-size:0;">&nbsp;</td></tr>

        <!-- Body -->
        <tr>
          <td style="padding:32px 32px 8px;">
            <h1 style="margin:0 0 14px;color:{_INK};font-size:24px;line-height:1.3;font-weight:700;">Here's my resume 👋</h1>
            <p style="margin:0 0 16px;color:{_MUTED};font-size:15px;line-height:1.65;">
              Hi there, thanks for your interest! As requested, I've attached my resume to this email.
            </p>
            <p style="margin:0 0 16px;color:{_MUTED};font-size:15px;line-height:1.65;">{escape(bio)}</p>
            <p style="margin:0 0 24px;color:{_MUTED};font-size:15px;line-height:1.65;">{escape(current_work)}</p>
          </td>
        </tr>

        <!-- Attachment card -->
        <tr>
          <td style="padding:0 32px 24px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
              style="border:1px solid {_BORDER};border-radius:12px;background:#fafafb;">
              <tr>
                <td width="56" valign="middle" style="padding:16px 0 16px 16px;">
                  <div style="width:40px;height:48px;border-radius:6px;background:#ef4444;color:#ffffff;
                    font-size:11px;font-weight:800;line-height:48px;text-align:center;letter-spacing:0.5px;">PDF</div>
                </td>
                <td valign="middle" style="padding:16px 8px 16px 16px;">
                  <a href="{escape(download_url)}" target="_blank" style="color:{_INK};font-size:15px;font-weight:600;text-decoration:none;">{escape(filename)}</a>
                  <div style="color:{_MUTED};font-size:13px;padding-top:3px;">Attached · or download it anytime</div>
                </td>
                <td align="right" valign="middle" style="padding:16px 16px 16px 0;">
                  <a href="{escape(download_url)}" target="_blank"
                    style="background:{_ACCENT};color:{_INK};display:inline-block;padding:10px 16px;border-radius:999px;
                    font-size:13px;font-weight:700;text-decoration:none;white-space:nowrap;">Download PDF</a>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Buttons -->
        <tr>
          <td style="padding:0 32px 20px;">
            <p style="margin:0 0 14px;color:{_INK};font-size:15px;font-weight:600;">Want to see more of my work?</p>
            {buttons}
          </td>
        </tr>

        <!-- Sign-off -->
        <tr>
          <td style="padding:8px 32px 32px;">
            <p style="margin:0 0 4px;color:{_MUTED};font-size:15px;line-height:1.65;">
              I'd be glad to chat about how I can help — just reply to this email.
            </p>
            <p style="margin:16px 0 0;color:{_INK};font-size:15px;line-height:1.5;">
              Best,<br><strong>{escape(first_name)}</strong>
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding:20px 32px;border-top:1px solid {_BORDER};background:#fafafb;">
            <div style="color:{_MUTED};font-size:12px;line-height:1.6;">{contact_line}</div>
            <div style="color:#9a9aa2;font-size:12px;line-height:1.6;padding-top:6px;">
              You received this because you asked for my resume on <a href="{escape(site)}" style="color:#9a9aa2;">my portfolio</a>.
            </div>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
</body>
</html>"""

    return text, html
