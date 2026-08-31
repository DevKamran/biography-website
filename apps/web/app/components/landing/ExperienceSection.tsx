"use client";

import { experience } from "@/lib/portfolio-data";
import { useScrollReveal } from "./ui/gsap";
import SectionHeading from "./ui/SectionHeading";

export default function ExperienceSection() {
  const containerRef = useScrollReveal<HTMLDivElement>("[data-reveal]", { stagger: 0.06, y: 24 });

  return (
    <section className="px-6 py-24 sm:px-12 lg:px-14" style={{ backgroundColor: "var(--color-bg-surface)" }}>
      <div ref={containerRef} className="mx-auto flex max-w-[1728px] flex-col gap-14">
        <SectionHeading eyebrow="Experience / 2017 — present" heading="Where I have been" />

        <div className="flex flex-col">
          {experience.map((role, i) => (
            <div
              key={`${role.company}-${role.dates}`}
              data-reveal
              className="grid grid-cols-1 gap-3 border-t py-8 first:border-t-0 sm:grid-cols-[200px_1fr] sm:gap-8"
              style={{ borderColor: i === 0 ? "transparent" : "var(--color-border-subtle)" }}
            >
              <div>
                <p className="font-mono-label text-xs uppercase tracking-widest" style={{ color: "var(--color-text-accent)" }}>
                  {role.dates}
                </p>
                <p className="mt-1 font-mono-label text-xs" style={{ color: "var(--color-text-tertiary)" }}>
                  {role.location}
                </p>
              </div>

              <div>
                <h3 className="font-accent text-2xl font-semibold sm:text-3xl" style={{ color: "var(--color-text-primary)" }}>
                  {role.role}
                </h3>
                <p className="mt-1 font-accent text-base" style={{ color: "var(--color-text-accent)" }}>
                  {role.company}
                </p>
                <ul className="mt-4 flex flex-col gap-2">
                  {role.bullets.map((bullet) => (
                    <li
                      key={bullet}
                      className="flex gap-3 font-sans text-sm leading-relaxed sm:text-base"
                      style={{ color: "var(--color-text-secondary)" }}
                    >
                      <span aria-hidden style={{ color: "var(--color-text-tertiary)" }}>
                        —
                      </span>
                      {bullet}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
