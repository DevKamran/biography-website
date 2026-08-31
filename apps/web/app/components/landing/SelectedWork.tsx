"use client";

import { selectedWork } from "@/lib/portfolio-data";
import { useScrollReveal } from "./ui/gsap";
import SectionHeading from "./ui/SectionHeading";

function ProjectCard({ item }: { item: (typeof selectedWork)[number] }) {
  return (
    <article data-reveal className="js-card group rounded-2xl border p-3 transition-colors duration-150 sm:p-4" style={{ borderColor: "var(--color-border-default)" }}>
      <div
        className="relative flex aspect-[4/3] w-full flex-col justify-between overflow-hidden rounded-xl p-5 sm:aspect-[16/10]"
        style={{ background: `linear-gradient(135deg, ${item.gradient[0]}, ${item.gradient[1]})` }}
      >
        <p className="font-mono-label text-[11px] uppercase tracking-widest text-white/80">{item.slug}</p>
        <div className="flex flex-wrap gap-2">
          {item.tags.map((t) => (
            <span
              key={t}
              className="rounded-full bg-black/25 px-3 py-1 font-mono-label text-[11px] text-white backdrop-blur-sm"
            >
              {t}
            </span>
          ))}
        </div>
      </div>

      <div className="px-2 pb-2 pt-5 sm:px-3">
        <h3 className="font-accent text-xl font-semibold sm:text-2xl" style={{ color: "var(--color-text-primary)" }}>
          {item.name}{" "}
          <span style={{ color: "var(--color-text-tertiary)" }} className="font-medium">
            — {item.tagline}
          </span>
        </h3>
        <p className="mt-2 max-w-lg font-sans text-sm sm:text-base" style={{ color: "var(--color-text-secondary)" }}>
          {item.description}
        </p>
        <div className="mt-4 flex flex-wrap gap-x-6 gap-y-1 font-mono-label text-xs sm:text-sm">
          {item.stats.map((stat) => (
            <span key={stat} style={{ color: "var(--color-text-accent)" }}>
              {stat}
            </span>
          ))}
        </div>
      </div>
    </article>
  );
}

export default function SelectedWork() {
  const containerRef = useScrollReveal<HTMLDivElement>("[data-reveal]", { stagger: 0.08, y: 40 });

  return (
    <section id="work" className="px-6 py-24 sm:px-12 lg:px-14" style={{ backgroundColor: "var(--color-bg-surface)" }}>
      <div ref={containerRef} className="mx-auto flex max-w-[1728px] flex-col gap-14">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeading
            eyebrow={`Selected work / 0${selectedWork.length}`}
            heading="Things I have shipped"
            subtitle="Four products where I owned the frontend end to end — from the Figma file to the deploy pipeline."
          />
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {selectedWork.map((item) => (
            <ProjectCard key={item.slug} item={item} />
          ))}
        </div>
      </div>
    </section>
  );
}
