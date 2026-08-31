"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { about, profile } from "@/lib/portfolio-data";
import { useScrollReveal } from "./ui/gsap";
import Button from "./ui/Button";

/** Typed/deleted headline cycling through `about.typedRoles` — see Handoff
 * Notes > Hero, header & About build notes > Typed headline. */
function TypedRole() {
  const [text, setText] = useState(about.typedRoles[0]);
  const [typing, setTyping] = useState(true);
  const indexRef = useRef(0);

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) {
      setText(about.typedRoles[0]);
      setTyping(false);
      return;
    }

    const state = { chars: 0 };
    const tl = gsap.timeline({ repeat: -1 });

    about.typedRoles.forEach((word) => {
      tl.to(state, {
        chars: word.length,
        duration: word.length * 0.06,
        ease: "none",
        onUpdate: () => {
          setTyping(true);
          setText(word.slice(0, Math.round(state.chars)));
        },
      });
      tl.to({}, { duration: 1.8 }); // hold
      tl.to(state, {
        chars: 0,
        duration: word.length * 0.035,
        ease: "none",
        onUpdate: () => {
          setTyping(true);
          setText(word.slice(0, Math.round(state.chars)));
        },
        onComplete: () => setTyping(false),
      });
      tl.to({}, { duration: 0.4 }); // pause before next
    });

    return () => {
      tl.kill();
    };
  }, []);

  return (
    <h2 className="font-accent text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl md:text-6xl">
      <span aria-hidden="true" style={{ color: "var(--color-text-primary)" }}>
        {text}
        <span
          className="js-caret ml-1 inline-block h-[0.85em] w-[3px] translate-y-[0.08em] align-middle"
          data-typing={typing}
          style={{ backgroundColor: "var(--color-text-accent)" }}
        />
      </span>
      <span className="sr-only">{about.typedRoles[0]}</span>
    </h2>
  );
}

export default function About() {
  const containerRef = useScrollReveal<HTMLDivElement>("[data-reveal]", { y: 24, stagger: 0.05 });

  return (
    <section id="about" className="px-6 py-24 sm:px-12 lg:px-14" style={{ backgroundColor: "var(--color-bg-surface)" }}>
      <div ref={containerRef} className="mx-auto flex max-w-[1728px] flex-col gap-14 lg:flex-row lg:items-start lg:gap-20">
        <div className="lg:w-1/2">
          <p
            data-reveal
            className="mb-3 font-mono-label text-xs uppercase tracking-[0.2em]"
            style={{ color: "var(--color-text-accent)" }}
          >
            {about.eyebrow}
          </p>
          <div data-reveal aria-live="off">
            <TypedRole />
          </div>

          <div data-reveal className="mt-8 flex flex-col gap-4 max-w-xl">
            {about.paragraphs.map((p) => (
              <p key={p} className="font-sans text-base leading-relaxed sm:text-lg" style={{ color: "var(--color-text-secondary)" }}>
                {p}
              </p>
            ))}
          </div>

          <div data-reveal className="mt-8 flex flex-wrap gap-4">
            <Button href="#work" variant="primary">
              More about me
            </Button>
            <Button href={profile.links.resume} variant="outline" icon={false}>
              Download résumé
            </Button>
          </div>
        </div>

        <div data-reveal className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:w-1/2">
          <div>
            <p className="font-mono-label text-xs uppercase tracking-widest" style={{ color: "var(--color-text-tertiary)" }}>
              Education
            </p>
            <ul className="mt-4 flex flex-col gap-5">
              {about.education.map((e) => (
                <li key={e.degree}>
                  <p className="font-accent text-lg font-semibold" style={{ color: "var(--color-text-primary)" }}>
                    {e.degree}
                  </p>
                  <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
                    {e.school}
                  </p>
                  <p className="font-mono-label text-xs" style={{ color: "var(--color-text-tertiary)" }}>
                    {e.dates}
                  </p>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="font-mono-label text-xs uppercase tracking-widest" style={{ color: "var(--color-text-tertiary)" }}>
              Certifications
            </p>
            <ul className="mt-4 flex flex-col gap-5">
              {about.certifications.map((c) => (
                <li key={c.name}>
                  <p className="font-accent text-lg font-semibold" style={{ color: "var(--color-text-primary)" }}>
                    {c.name}
                  </p>
                  <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
                    {c.detail}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
