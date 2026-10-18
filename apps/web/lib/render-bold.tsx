import { Fragment, type ReactNode } from "react";

const LINK_RE = /\[([^\]]+)\]\(([^)]+)\)/;
const TOKEN_RE = /(\*\*.*?\*\*|\[[^\]]+\]\([^)]+\))/g;

export function renderBold(text: string): ReactNode[] {
  return text.split(TOKEN_RE).map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    const link = part.match(LINK_RE);
    if (link) {
      const [, label, href] = link;
      return (
        <a
          key={i}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="rich-link"
          style={{ color: "var(--color-text-accent)" }}
        >
          {label}
          <span className="sr-only"> (opens in a new tab)</span>
        </a>
      );
    }
    return <Fragment key={i}>{part}</Fragment>;
  });
}
