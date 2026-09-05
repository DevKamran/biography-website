"use client";

import Image from "next/image";
import { Mail } from "lucide-react";
import { cta, profile } from "@/lib/portfolio-data";
import { useFloatAnimation, useScrollReveal } from "./ui/gsap";
import StatusBadge from "./ui/StatusBadge";

function FloatingIcon({
  src,
  size,
  className = "",
  floatDistance = 20,
  floatDuration = 1.4,
  xDistance = 24,
  xDuration,
}: {
  src: string;
  size: number;
  className?: string;
  floatDistance?: number;
  floatDuration?: number;
  xDistance?: number;
  xDuration?: number;
}) {
  const floatRef = useFloatAnimation<HTMLDivElement>({
    distance: floatDistance,
    duration: floatDuration,
    xDistance,
    xDuration,
  });

  return (
    <div
      ref={floatRef}
      className={`pointer-events-none absolute select-none ${className}`}
      style={{ width: size, height: size }}
    >
      <Image src={src} alt="" width={size} height={size} className="h-full w-full object-contain" />
    </div>
  );
}

export default function CTA() {
  const containerRef = useScrollReveal<HTMLDivElement>("[data-reveal]", { y: 24, stagger: 0.06 });

  return (
    <section id="cta" className="px-6 py-16 sm:px-12 lg:px-14" style={{ backgroundColor: "var(--color-bg-surface)" }}>
      <div
        ref={containerRef}
        className="relative mx-auto flex max-w-[1728px] flex-col items-center overflow-hidden rounded-[32px] border px-6 py-20 text-center sm:px-12 sm:py-28"
        style={{
          backgroundColor: "#fafafa",
          borderColor: "rgba(10, 10, 12, 0.08)",
          boxShadow: "0 30px 80px -30px rgba(0, 0, 0, 0.35), 0 1px 0 rgba(0, 0, 0, 0.04)",
        }}
      >
        <FloatingIcon
          src="/img/contactAnimation/abstract-mail.png"
          size={64}
          className="left-[28%] top-8 hidden md:block"
          floatDistance={20}
          floatDuration={1.4}
          xDistance={24}
          xDuration={1.9}
        />
        <FloatingIcon
          src="/img/contactAnimation/abstract-heart.png"
          size={68}
          className="right-6 top-6 hidden md:block"
          floatDistance={22}
          floatDuration={1.1}
          xDistance={26}
          xDuration={1.5}
        />
        <FloatingIcon
          src="/img/contactAnimation/abstract-knot.png"
          size={220}
          className="bottom-4 left-4 hidden opacity-80 lg:block"
          floatDistance={26}
          floatDuration={1.6}
          xDistance={30}
          xDuration={2.1}
        />
        <FloatingIcon
          src="/img/contactAnimation/abstract-helmet.png"
          size={170}
          className="bottom-4 right-4 hidden opacity-90 lg:block"
          floatDistance={24}
          floatDuration={1.3}
          xDistance={28}
          xDuration={1.8}
        />

        <div data-reveal className="relative z-10">
          <StatusBadge label={cta.badge} />
        </div>

        <h2
          data-reveal
          className="relative z-10 mt-8 max-w-3xl font-accent text-4xl font-bold leading-[1.05] tracking-tight sm:text-6xl"
          style={{ color: "#0a0a0c" }}
        >
          {cta.heading}
        </h2>

        <p
          data-reveal
          className="relative z-10 mt-6 max-w-xl font-sans text-base sm:text-lg"
          style={{ color: "rgba(10, 10, 12, 0.65)" }}
        >
          {cta.body}
        </p>

        <a
          data-reveal
          href={`mailto:${profile.email}`}
          className="js-btn relative z-10 mt-10 inline-flex h-14 items-center gap-2 rounded-full px-7 font-accent text-lg font-semibold transition-colors duration-150"
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
