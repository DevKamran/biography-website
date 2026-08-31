"use client";

import { metrics } from "@/lib/portfolio-data";
import { useCountUp, useScrollReveal } from "./ui/gsap";
import SectionHeading from "./ui/SectionHeading";

function MetricCard({ eyebrow, value, description }: (typeof metrics)[number]) {
  const valueRef = useCountUp<HTMLParagraphElement>(value);

  return (
    <div
      className="js-card flex flex-col gap-3 rounded-2xl border p-6 transition-colors duration-150 sm:p-7"
      style={{ borderColor: "var(--color-border-default)", backgroundColor: "var(--color-bg-surface)" }}
    >
      <p
        className="font-mono-label text-[11px] uppercase tracking-widest"
        style={{ color: "var(--color-text-tertiary)" }}
      >
        {eyebrow}
      </p>
      <p
        ref={valueRef}
        className="font-accent text-5xl font-bold leading-none sm:text-6xl"
        style={{ color: "var(--color-text-accent)" }}
      >
        0{value.replace(/^[\d.]+/, "")}
      </p>
      <p className="font-sans text-sm leading-snug sm:text-base" style={{ color: "var(--color-text-secondary)" }}>
        {description}
      </p>
    </div>
  );
}

export default function Metrics() {
  const containerRef = useScrollReveal<HTMLDivElement>("[data-reveal]", { stagger: 0.08, y: 24 });

  return (
    <section className="px-6 py-24 sm:px-12 lg:px-14" style={{ backgroundColor: "var(--color-bg-surface)" }}>
      <div ref={containerRef} className="mx-auto flex max-w-[1728px] flex-col gap-14">
        <SectionHeading
          eyebrow="Impact / By the numbers"
          heading="Outcomes, not just output"
          subtitle="Every number below is tied to work that shipped to production and stayed there."
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {metrics.map((m) => (
            <div key={m.eyebrow} data-reveal>
              <MetricCard {...m} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
