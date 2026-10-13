"use client";

import { useEffect, useState } from "react";
import type { TocHeading } from "@/lib/blog-toc";

/** A heading counts as "current" once its top passes this line (px from viewport top, below the fixed header). */
const ACTIVE_OFFSET = 140;

export default function TableOfContents({ headings }: { headings: TocHeading[] }) {
  const [activeId, setActiveId] = useState(headings[0]?.id);

  useEffect(() => {
    const elements = headings
      .map((h) => document.getElementById(h.id))
      .filter((el): el is HTMLElement => el !== null);
    if (elements.length === 0) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      let current = elements[0].id;
      for (const el of elements) {
        if (el.getBoundingClientRect().top - ACTIVE_OFFSET <= 0) current = el.id;
        else break;
      }
      // At the very bottom, the last short sections can never reach the line.
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2) {
        current = elements[elements.length - 1].id;
      }
      setActiveId(current);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [headings]);

  const onClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    e.preventDefault();
    el.scrollIntoView({ behavior: "smooth", block: "start" });
    history.replaceState(null, "", `#${id}`);
    setActiveId(id);
  };

  return (
    <nav aria-label="On this page" className="flex flex-col gap-3">
      <p
        className="font-mono-label text-[11px] font-semibold uppercase tracking-widest"
        style={{ color: "var(--color-text-accent)" }}
      >
        On this page
      </p>
      <ul
        className="flex max-h-[calc(100vh-14rem)] flex-col overflow-y-auto border-l"
        style={{ borderColor: "var(--color-border-default)" }}
      >
        {headings.map((h) => {
          const active = h.id === activeId;
          return (
            <li key={h.id}>
              <a
                href={`#${h.id}`}
                onClick={(e) => onClick(e, h.id)}
                aria-current={active ? "location" : undefined}
                className="-ml-px block border-l-2 py-1 pr-2 text-[13px] leading-snug transition-colors hover:!text-[var(--color-text-primary)]"
                style={{
                  paddingLeft: `${0.75 + h.depth * 0.75}rem`,
                  borderColor: active ? "var(--color-border-accent)" : "transparent",
                  color: active ? "var(--color-text-primary)" : "var(--color-text-tertiary)",
                }}
              >
                {h.text}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
