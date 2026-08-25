from __future__ import annotations

import re
from pathlib import Path

from llama_index.core import Document
from llama_index.core.node_parser import MarkdownNodeParser
from llama_index.core.schema import TextNode

KNOWN_RESUME_HEADERS = [
    "summary",
    "professional summary",
    "career summary",
    "objective",
    "experience",
    "work experience",
    "professional experience",
    "education",
    "skills",
    "technical skills",
    "core competencies",
    "projects",
    "key projects",
    "certifications",
    "awards",
    "publications",
    "volunteer experience",
    "languages",
]

_KNOWN_HEADER_RE = re.compile(
    r"^(" + "|".join(re.escape(h) for h in KNOWN_RESUME_HEADERS) + r"):?\s*$",
    re.IGNORECASE,
)

_MONTHS = (
    "(?:January|February|March|April|May|June|July|August|September|October|"
    "November|December)"
)
# Matches a job/education entry's trailing date range, e.g. "July 2025 –
# Present", "March 2021 – June 2025", "2020 – 2022". PDF text extraction
# usually collapses the title/company/date into one line per entry with no
# separating whitespace (e.g. "DeveloperApril 2019 – February 2021"), so the
# whole line — title and date together — becomes the entry's H3 header text.
_ENTRY_DATE_RANGE_RE = re.compile(
    rf"(?:{_MONTHS}\s+)?\d{{4}}\s*[–—-]\s*(?:(?:{_MONTHS}\s+)?\d{{4}}|Present)\s*$",
    re.IGNORECASE,
)


def _looks_like_entry_header(line: str) -> bool:
    """Detect a job/education entry line (title + company/dates) so it can
    be promoted to its own H3 sub-heading, tying bullets under it to the
    specific role/degree rather than the whole section."""
    if not line or len(line) > 160:
        return False
    if line.lstrip()[:1] in ("-", "–", "—", "•", "*"):
        return False  # bullet line, not an entry header
    return bool(_ENTRY_DATE_RANGE_RE.search(line))


def pdf_text_to_pseudo_markdown(text: str) -> str:
    """Turn raw PDF-extracted text into pseudo-Markdown so the same
    structural (header-based) chunking logic can be reused for PDFs.

    Prefixes the first non-blank line as the H1 title, any subsequent line
    that matches a known resume section name (or is a short ALL-CAPS line)
    as an H2 header, and any line that looks like a job/education entry
    (ends in a date range) as an H3 sub-header. This is a heuristic —
    real-world resumes vary a lot in formatting, so expect to tune
    KNOWN_RESUME_HEADERS / _looks_like_entry_header for other resumes.
    """
    lines = text.splitlines()
    out: list[str] = []
    title_set = False

    for line in lines:
        stripped = line.strip()
        if not stripped:
            out.append(line)
            continue

        if not title_set:
            out.append(f"# {stripped}")
            title_set = True
            continue

        is_known_header = bool(_KNOWN_HEADER_RE.match(stripped))
        is_allcaps_header = (
            len(stripped) <= 40 and stripped == stripped.upper() and any(c.isalpha() for c in stripped)
        )
        if is_known_header or is_allcaps_header:
            out.append(f"## {stripped}")
        elif _looks_like_entry_header(stripped):
            out.append(f"### {stripped}")
        else:
            out.append(line)

    return "\n".join(out)


def load_document_text(file_path: Path) -> str:
    suffix = file_path.suffix.lower()

    if suffix in (".md", ".markdown"):
        return file_path.read_text(encoding="utf-8")

    if suffix == ".pdf":
        from llama_index.readers.file import PDFReader

        docs = PDFReader(return_full_document=True).load_data(file=file_path)
        raw_text = docs[0].text
        return pdf_text_to_pseudo_markdown(raw_text)

    raise ValueError(f"Unsupported resume file type: {suffix} (expected .md or .pdf)")


def derive_section_role(node: TextNode, separator: str = "/") -> None:
    """Mutate node.metadata in place, deriving flat `section`/`role` fields
    from the ancestor-header path MarkdownNodeParser attaches as
    `header_path`."""
    header_path = node.metadata.get("header_path", "")
    path_parts = [p for p in header_path.split(separator) if p]

    header_match = re.match(r"^#+\s+(.*)", node.text.strip())
    own_header_text = header_match.group(1).strip() if header_match else None

    # header_path holds ANCESTOR headers only (never the node's own header),
    # so path_parts[0] is always the resume's H1 title when present.
    if len(path_parts) >= 2:
        # Node is nested under H1 > H2 (> deeper) — e.g. a specific job
        # entry under "Work Experience". Its own header is the specific
        # entry (role); the section is the first header below the title.
        section = path_parts[1]
        role = own_header_text
    elif len(path_parts) == 1:
        # Node's own header sits directly under H1 with no further
        # nesting — it IS a top-level section (e.g. "Technical Skills"),
        # so use its own header text, not the H1 title in path_parts[0].
        section = own_header_text or path_parts[0]
        role = None
    else:
        # No ancestor headers at all — preamble/contact info before any
        # section header (typically merged with the H1 node itself).
        section = "General"
        role = None

    node.metadata["section"] = section
    node.metadata["role"] = role

    node.excluded_llm_metadata_keys = list(
        set(node.excluded_llm_metadata_keys) | {"header_path"}
    )
    node.excluded_embed_metadata_keys = list(
        set(node.excluded_embed_metadata_keys) | {"header_path"}
    )


def chunk_resume(file_path: Path, document_name: str) -> list[TextNode]:
    text = load_document_text(file_path)
    doc = Document(text=text, metadata={"document": document_name})

    parser = MarkdownNodeParser(header_path_separator="/")
    nodes = parser.get_nodes_from_documents([doc])

    for node in nodes:
        node.metadata["document"] = document_name
        derive_section_role(node)

    return nodes
