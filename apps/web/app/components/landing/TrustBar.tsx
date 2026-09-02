"use client";

import { trustBar } from "@/lib/portfolio-data";
import { useScrollReveal } from "./ui/gsap";

export default function TrustBar() {
  const containerRef = useScrollReveal<HTMLDivElement>("[data-reveal]", { y: 16, stagger: 0.08, start: "top 90%" });

  return (
    <section
      id="trust"
      className="border-y px-6 py-8 sm:px-12 lg:px-14"
      style={{ borderColor: "var(--color-border-subtle)" }}
    >
      <div ref={containerRef} className="mx-auto flex max-w-[1728px] flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div data-reveal className="flex items-center gap-3">
          <span className="relative flex h-2.5 w-2.5 shrink-0">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-green-500" />
          </span>
          <span
            className="font-mono-label text-xs uppercase tracking-widest"
            style={{ color: "var(--color-text-accent)" }}
          >
            {trustBar.currentlyLabel}
          </span>
          <span className="font-accent text-base font-medium sm:text-lg" style={{ color: "var(--color-text-primary)" }}>
            {trustBar.currently}
          </span>
        </div>

        <div data-reveal className="flex flex-wrap items-baseline gap-x-4 gap-y-2">
          <span
            className="font-mono-label text-xs uppercase tracking-widest"
            style={{ color: "var(--color-text-tertiary)" }}
          >
            {trustBar.previouslyLabel}
          </span>
          {trustBar.previously.map((name) => (
            <span key={name} className="font-accent text-sm sm:text-base" style={{ color: "var(--color-text-secondary)" }}>
              {name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
