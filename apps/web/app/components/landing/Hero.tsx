"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { ArrowDown } from "lucide-react";
import { heroStats, heroTags, profile } from "@/lib/portfolio-data";
import { ensureGsapRegistered } from "./ui/gsap";
import gsap from "gsap";

function FloatingMetric({
  value,
  label,
  className = "",
}: {
  value: string;
  label: string;
  className?: string;
}) {
  return (
    <div
      className={`flex items-center gap-2.5 rounded-2xl border px-3.5 py-2.5 backdrop-blur-md sm:px-4 sm:py-3 ${className}`}
      style={{
        backgroundColor: "color-mix(in srgb, var(--color-bg-raised) 85%, transparent)",
        borderColor: "var(--color-border-default)",
      }}
    >
      <p
        className="font-accent text-2xl font-bold leading-none sm:text-3xl"
        style={{ color: "var(--color-text-primary)" }}
      >
        {value}
      </p>
      <p
        className="w-16 whitespace-pre-line font-mono-label text-[9px] uppercase leading-snug tracking-wide sm:w-20 sm:text-[10px]"
        style={{ color: "var(--color-text-tertiary)" }}
      >
        {label}
      </p>
    </div>
  );
}

/** Portrait cutout + the two floating metric chips clustered around it,
 * overlapping the tail end of the "Kamran Ali" wordmark — see Handoff
 * Notes > Hero, header & About build notes > Hero portrait. */
function PortraitCluster({ className = "" }: { className?: string }) {
  return (
    <div className={`relative aspect-square w-full ${className}`}>
      <div
        className="absolute inset-[4%] rounded-full blur-xl"
        style={{ backgroundColor: "var(--color-bg-accent)", opacity: 0.4 }}
      />
      <Image
        src="/img/profile.jpeg"
        alt={`${profile.name} — ${profile.title}`}
        fill
        priority
        fetchPriority="high"
        sizes="(min-width: 1600px) 320px, (min-width: 1200px) 260px, 220px"
        className="relative rounded-full border object-cover"
        style={{ borderColor: "var(--color-border-default)" }}
      />

      <FloatingMetric
        value={heroStats[0].value}
        label={heroStats[0].label}
        className="absolute -left-10 -top-6 sm:-left-14 sm:-top-8"
      />
      <FloatingMetric
        value={heroStats[1].value}
        label={heroStats[1].label}
        className="absolute -right-16 top-1/2 -translate-y-1/2 sm:-right-20"
      />
    </div>
  );
}

export default function Hero() {
  const rootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    ensureGsapRegistered();
    const root = rootRef.current;
    if (!root) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const lines = root.querySelectorAll<HTMLElement>("[data-hero-line]");
    if (reduceMotion || !lines.length) return;

    const ctx = gsap.context(() => {
      gsap.set(lines, { opacity: 0, y: 24 });
      gsap.to(lines, {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: "power3.out",
        stagger: 0.06,
        delay: 0.15,
      });
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={rootRef}
      id="home"
      className="relative w-full overflow-hidden pt-32 pb-16 sm:pt-40 hero:min-h-[90vh] hero:pb-24 hero:pt-48"
      style={{ backgroundColor: "var(--color-bg-surface)" }}
    >
      <div className="mx-auto flex w-full max-w-[1728px] flex-col px-6 sm:px-12 hero:px-14">
        <p
          data-hero-line
          className="mb-8 max-w-[560px] font-accent text-lg font-medium leading-tight sm:text-2xl"
          style={{ color: "var(--color-text-secondary)" }}
        >
          {profile.heroIntro}
        </p>

        {/* name + overlapping portrait cluster (hero breakpoint and up) */}
        <div data-hero-line className="relative">
          <h1
            className="relative z-50 select-none whitespace-nowrap font-accent text-[3rem] font-extrabold leading-[0.9] tracking-tight xs:text-[3.6rem] sm:text-[6rem] md:text-[7.5rem] hero:text-[8rem] hero-lg:text-[17rem]"
            style={{ color: "var(--color-text-primary)" }}
          >
            {profile.name}
          </h1>

          <PortraitCluster className="z-[2] mt-8 hidden w-[220px] hero:absolute hero:right-[6%] hero:top-1/2 hero:mt-0 hero:block hero:w-[260px] hero:-translate-y-[58%] hero-lg:w-[320px]" />
        </div>

        {/* mobile/tablet portrait — static, below the name */}
        <div data-hero-line className="mx-auto mt-10 w-full max-w-[280px] hero:hidden">
          <PortraitCluster />
        </div>

        <div data-hero-line className="mt-14 flex max-w-[800px] flex-wrap gap-2 hero:mt-8">
          {heroTags.map((tag) => (
            <span
              key={tag}
              className="js-tag inline-flex h-8 items-center rounded-full border px-4 font-mono-label text-xs transition-colors sm:h-9 sm:text-sm"
              style={{ borderColor: "var(--color-border-default)", color: "var(--color-text-secondary)" }}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      <a
        href="#trust"
        className="absolute bottom-10 right-8 z-[3] hidden items-center gap-2 font-mono-label text-sm transition-opacity hover:opacity-70 hero:inline-flex"
        style={{ color: "white" }}
      >
        Scroll for more
        <ArrowDown color="#22b8e8" size={20} />
      </a>
    </section>
  );
}
