"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { techStackGroups } from "@/lib/portfolio-data";
import { useScrollReveal } from "./ui/gsap";
import SectionHeading from "./ui/SectionHeading";

function MarqueeRow({ label, tags }: { label: string; tags: string[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const tweenRef = useRef<gsap.core.Tween | null>(null);

  // useEffect(() => {
  //   const track = trackRef.current;
  //   if (!track) return;
  //   const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  //   if (reduceMotion) return;

  //   tweenRef.current = gsap.to(track, {
  //     xPercent: -50,
  //     duration: 30,
  //     ease: "none",
  //     repeat: -1,
  //   });

  //   return () => {
  //     tweenRef.current?.kill();
  //   };
  // }, []);

  return (
    <div
      className="js-marquee flex flex-col gap-3 border-b py-5 sm:flex-row sm:items-center sm:gap-6"
      style={{ borderColor: "var(--color-border-subtle)" }}
      // onMouseEnter={() => tweenRef.current?.pause()}
      // onMouseLeave={() => tweenRef.current?.play()}
      // onFocus={() => tweenRef.current?.pause()}
      // onBlur={() => tweenRef.current?.play()}
    >
      <p
        className="w-full shrink-0 font-mono-label text-[11px] uppercase tracking-widest sm:w-40"
        style={{ color: "var(--color-text-tertiary)" }}
      >
        {label}
      </p>
      <div className="overflow-hidden">
        <div ref={trackRef} className="flex w-max gap-2">
          {[...tags, ...tags].map((tag, i) => (
            <span
              key={`${tag}-${i}`}
              className="js-tag inline-flex h-9 shrink-0 items-center rounded-full border px-4 font-mono-label text-sm transition-colors"
              style={{ borderColor: "var(--color-border-default)", color: "var(--color-text-secondary)" }}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function TechStack() {
  const containerRef = useScrollReveal<HTMLDivElement>("[data-reveal]", { y: 24 });

  return (
    <section className="px-6 py-24 sm:px-12 lg:px-14" style={{ backgroundColor: "var(--color-bg-surface)" }}>
      <div ref={containerRef} className="mx-auto flex max-w-[1728px] flex-col gap-12">
        <div data-reveal>
          <SectionHeading eyebrow="Stack / Tools" heading="The toolkit" />
        </div>

        <div data-reveal>
          {techStackGroups.map((group) => (
            <MarqueeRow key={group.label} label={group.label} tags={group.tags} />
          ))}
        </div>
      </div>
    </section>
  );
}
