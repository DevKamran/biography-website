"use client";

import { Mail } from "lucide-react";
import { cta, profile } from "@/lib/portfolio-data";
import { useScrollReveal } from "./ui/gsap";
import StatusBadge from "./ui/StatusBadge";

export default function CTA() {
  const containerRef = useScrollReveal<HTMLDivElement>("[data-reveal]", { y: 24, stagger: 0.06 });

  return (
    <section id="cta" className="px-6 py-16 sm:px-12 lg:px-14" style={{ backgroundColor: "url('/img/CTA_Card_background_only.png')" }}>
      <div
        ref={containerRef}
        className="relative mx-auto flex max-w-[1728px] flex-col items-center overflow-hidden rounded-[32px] px-6 py-20 text-center sm:px-12 sm:py-28"
          style={{ background: "url('/img/CTA_Card_background_only.png')" }}
      >
        <div data-reveal>
          <StatusBadge label={cta.badge} />
        </div>

        <h2
          data-reveal
          className="mt-8 max-w-3xl font-accent text-4xl font-bold leading-[1.05] tracking-tight sm:text-6xl"
          style={{ color: "var(--color-text-inverse)" }}
        >
          {cta.heading}
        </h2>

        <p
          data-reveal
          className="mt-6 max-w-xl font-sans text-base sm:text-lg"
          style={{ color: "color-mix(in srgb, var(--color-text-inverse) 65%, transparent)" }}
        >
          {cta.body}
        </p>

        <a
          data-reveal
          href={`mailto:${profile.email}`}
          className="js-btn mt-10 inline-flex h-14 items-center gap-2 rounded-full px-7 font-accent text-lg font-semibold transition-colors duration-150"
          data-variant="primary"
          style={{ backgroundColor: "var(--color-bg-accent)", color: "var(--color-text-on-accent)" }}
        >
          {cta.action}
          <Mail size={18} />
        </a>
      </div>
    </section>
  );
}
