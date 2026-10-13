"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { roleMarquee } from "@/lib/portfolio-data";
import { ensureGsapRegistered } from "./ui/gsap";

function MarqueeGroup({ ariaHidden = false }: { ariaHidden?: boolean }) {
  return (
    <div className="flex shrink-0 items-center" aria-hidden={ariaHidden}>
      {roleMarquee.map((role, i) => (
        <span key={i} className="flex shrink-0 items-center whitespace-nowrap pr-8 sm:pr-12">
          <span
            className="font-accent text-5xl font-semibold capitalize opacity-50 tracking-tight sm:text-7xl lg:text-[9rem]"
            style={{ color: "var(--color-text-primary)", opacity: 0.6 }}
          >
            {role}
          </span>
          <span
            aria-hidden
            className="pl-8 font-accent text-5xl font-semibold sm:pl-12 sm:text-7xl lg:text-8xl"
            style={{ color: "var(--color-text-accent)" ,opacity: 0.6 }}
          >
            +
          </span>
        </span>
      ))}
    </div>
  );
}

export default function RoleMarquee() {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    ensureGsapRegistered();
    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // Endless loop (two identical groups, so -50% → 0 wraps seamlessly).
    // Scrolling speeds it up in the scroll direction, then it eases back.
    const loop = gsap.fromTo(track, { xPercent: -50 }, { xPercent: 0, duration: 60, ease: "none", repeat: -1 });
    // Start deep into the repeat cycle so scrolling up (negative timeScale)
    // never runs back into the tween's start and stalls.
    loop.totalTime(loop.duration() * 1000);
    let direction = 1;
    let hovered = false;

    const trigger = ScrollTrigger.create({
      trigger: section,
      start: "top bottom",
      end: "bottom top",
      onUpdate: (self) => {
        if (hovered) return;
        direction = self.direction;
        const boost = 1 + Math.min(Math.abs(self.getVelocity()) / 600, 3);
        gsap.timeline()
          .to(loop, { timeScale: direction * boost, duration: 0.2, ease: "power1.out", overwrite: true })
          .to(loop, { timeScale: direction, duration: 1, ease: "power1.out" });
      },
    });

    const pause = () => {
      hovered = true;
      gsap.to(loop, { timeScale: 0, duration: 0.4, overwrite: true });
    };
    const resume = () => {
      hovered = false;
      gsap.to(loop, { timeScale: direction, duration: 0.4, overwrite: true });
    };
    section.addEventListener("mouseenter", pause);
    section.addEventListener("mouseleave", resume);

    return () => {
      section.removeEventListener("mouseenter", pause);
      section.removeEventListener("mouseleave", resume);
      trigger.kill();
      loop.kill();
      gsap.set(track, { clearProps: "transform" });
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="overflow-hidden py-10 sm:py-14"
      style={{ borderColor: "var(--color-border-subtle)", backgroundColor: "var(--color-bg-surface)" }}
    >
      <div ref={trackRef} className="flex w-max">
        <MarqueeGroup />
        <MarqueeGroup ariaHidden />
      </div>
    </section>
  );
}
