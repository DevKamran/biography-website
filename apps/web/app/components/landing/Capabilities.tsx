"use client";

import { ArrowUp, CheckCircle2, Code2, Layers, type LucideIcon, Sparkles, Zap } from "lucide-react";
import { capabilities, type Capability } from "@/lib/portfolio-data";
import { useScrollReveal } from "./ui/gsap";
import SectionHeading from "./ui/SectionHeading";

const icons: Record<Capability["icon"], LucideIcon> = {
  code: Code2,
  bolt: Zap,
  sparkle: Sparkles,
  layers: Layers,
  "check-circle": CheckCircle2,
  "arrow-upward": ArrowUp,
};

export default function Capabilities() {
  const containerRef = useScrollReveal<HTMLDivElement>("[data-reveal]", { stagger: 0.06, y: 32 });

  return (
    <section className="px-6 py-24 sm:px-12 lg:px-14" style={{ backgroundColor: "var(--color-bg-surface)" }}>
      <div ref={containerRef} className="mx-auto flex max-w-[1728px] flex-col gap-14">
        <SectionHeading
          eyebrow="Capabilities / What I own"
          heading="What I actually do"
          subtitle="Six things I take full ownership of on a frontend team — from the first token in the design system to the Lighthouse score on the deploy."
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {capabilities.map((c) => {
            const Icon = icons[c.icon];
            return (
              <div
                key={c.title}
                data-reveal
                className="js-card flex flex-col gap-4 rounded-2xl border p-6 transition-colors duration-150"
                style={{ borderColor: "var(--color-border-default)" }}
              >
                <span
                  className="flex h-10 w-10 items-center justify-center rounded-xl"
                  style={{ backgroundColor: "var(--color-bg-accent-subtle)", color: "var(--color-text-accent)" }}
                >
                  <Icon size={18} />
                </span>
                <h3 className="font-accent text-lg font-semibold sm:text-xl" style={{ color: "var(--color-text-primary)" }}>
                  {c.title}
                </h3>
                <p className="font-sans text-sm leading-relaxed sm:text-base" style={{ color: "var(--color-text-secondary)" }}>
                  {c.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
