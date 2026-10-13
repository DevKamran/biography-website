export type TocHeading = {
  id: string;
  text: string;
  /** 0 = top level, 1 = nested, 2 = nested twice (relative to the shallowest heading in the post). */
  depth: number;
};

const HEADING_RE = /<h([1-3])((?:\s[^>]*)?)>([\s\S]*?)<\/h\1>/gi;

const ENTITIES: Record<string, string> = {
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#39;": "'",
  "&nbsp;": " ",
};

function htmlToText(html: string): string {
  return html
    .replace(/<[^>]+>/g, "")
    .replace(/&(amp|lt|gt|quot|#39|nbsp);/g, (m) => ENTITIES[m] ?? m)
    .replace(/\s+/g, " ")
    .trim();
}

function slugify(text: string): string {
  return (
    text
      .toLowerCase()
      .replace(/[^\p{L}\p{N}\s-]/gu, "")
      .trim()
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-") || "section"
  );
}

/**
 * Gives every h1–h3 in the post HTML a unique `id` and returns them as a
 * table of contents. Headings that already carry an `id` keep it.
 */
export function buildToc(html: string): { html: string; headings: TocHeading[] } {
  const found: { id: string; text: string; level: number }[] = [];
  const used = new Set<string>();

  const withIds = html.replace(HEADING_RE, (match, level: string, attrs: string, inner: string) => {
    const text = htmlToText(inner);
    if (!text) return match;

    const existing = /\sid=["']([^"']+)["']/i.exec(attrs)?.[1];
    let id = existing ?? slugify(text);
    if (!existing) {
      const base = id;
      for (let n = 2; used.has(id); n++) id = `${base}-${n}`;
    }
    used.add(id);
    found.push({ id, text, level: Number(level) });

    return existing ? match : `<h${level} id="${id}"${attrs}>${inner}</h${level}>`;
  });

  const minLevel = Math.min(...found.map((h) => h.level));
  const headings = found.map(({ id, text, level }) => ({ id, text, depth: level - minLevel }));

  return { html: withIds, headings };
}
