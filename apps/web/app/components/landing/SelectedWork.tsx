"use client";

import { useEffect, useRef, useState } from "react";
import { selectedWork } from "@/lib/portfolio-data";
import { useScrollReveal } from "./ui/gsap";
import SectionHeading from "./ui/SectionHeading";

function ProjectCard({ item, fill = false }: { item: (typeof selectedWork)[number]; fill?: boolean }) {
  const imageUrl = typeof item.image === "string" && item.image.trim() ? item.image : "";

  return (
    <article
      className={`js-card group rounded-2xl border p-3 transition-colors duration-150 sm:p-4 ${fill ? "flex h-full flex-col" : ""}`}
      style={{ borderColor: "var(--color-border-default)" }}
    >
      <div
        className={`relative flex w-full flex-col justify-between overflow-hidden rounded-xl p-5 ${
          fill ? "flex-1 min-h-0" : "aspect-[4/3] sm:aspect-[16/10]"
        }`}
        style={{
          backgroundImage: imageUrl ? `url("${imageUrl}")` : "none",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundColor: "var(--color-bg-muted)",
        }}
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

      <div className="shrink-0 px-2 pb-2 pt-5 sm:px-3">
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

/** Desktop-only pinned scroll experience: the heading stays fixed on screen
 * while scroll (wheel, touchpad, keyboard arrows/Page keys) advances through
 * one project at a time on the right — see the mobile fallback below for
 * small screens, where pinning a 100vh-per-item section doesn't work well. */
function PinnedShowcase() {
  const sectionRef = useRef<HTMLElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const activeIndexRef = useRef(0);

  useEffect(() => {
    activeIndexRef.current = activeIndex;
  }, [activeIndex]);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const handleScroll = () => {
      const rect = section.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      if (total <= 0) return;
      const progress = Math.min(Math.max(-rect.top / total, 0), 1);
      const index = Math.min(selectedWork.length - 1, Math.floor(progress * selectedWork.length));
      setActiveIndex(index);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const scrollToIndex = (index: number) => {
      const section = sectionRef.current;
      if (!section) return;
      const total = section.offsetHeight - window.innerHeight;
      const denom = selectedWork.length - 1 || 1;
      const top = section.offsetTop + (total * index) / denom;
      window.scrollTo({ top, behavior: "smooth" });
    };

    const onKeyDown = (e: KeyboardEvent) => {
      const section = sectionRef.current;
      if (!section) return;
      const rect = section.getBoundingClientRect();
      const mid = window.innerHeight / 2;
      const inView = rect.top < mid && rect.bottom > mid;
      if (!inView) return;

      if (e.key === "ArrowDown" || e.key === "PageDown") {
        if (activeIndexRef.current >= selectedWork.length - 1) return; // let the page scroll on to the next section
        e.preventDefault();
        scrollToIndex(activeIndexRef.current + 1);
      } else if (e.key === "ArrowUp" || e.key === "PageUp") {
        if (activeIndexRef.current <= 0) return; // let the page scroll back to the section above
        e.preventDefault();
        scrollToIndex(activeIndexRef.current - 1);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative hidden lg:block"
      style={{ height: `${selectedWork.length * 100}vh` }}
    >
      <div className="sticky top-0 flex h-screen items-center px-6 lg:px-14" style={{ backgroundColor: "var(--color-bg-surface)" }}>
        <div className="mx-auto grid w-full max-w-[1728px] grid-cols-2 items-center gap-16">
          <div className="flex flex-col gap-8">
            <SectionHeading
              eyebrow={`Selected work / 0${selectedWork.length}`}
              heading="Things I have shipped"
              subtitle="Four products where I owned the frontend end to end — from the Figma file to the deploy pipeline."
            />
            <div className="flex items-center gap-2">
              {selectedWork.map((item, i) => (
                <button
                  key={item.slug}
                  aria-label={`Show ${item.name}`}
                  onClick={() => {
                    const section = sectionRef.current;
                    if (!section) return;
                    const total = section.offsetHeight - window.innerHeight;
                    const denom = selectedWork.length - 1 || 1;
                    window.scrollTo({ top: section.offsetTop + (total * i) / denom, behavior: "smooth" });
                  }}
                  className="h-1.5 cursor-pointer rounded-full transition-all duration-300"
                  style={{
                    width: i === activeIndex ? "2rem" : "0.6rem",
                    backgroundColor: i === activeIndex ? "var(--color-text-accent)" : "var(--color-border-default)",
                  }}
                />
              ))}
            </div>
          </div>

          <div className="relative h-[72vh]">
            {selectedWork.map((item, i) => (
              <div
                key={item.slug}
                aria-hidden={i !== activeIndex}
                className="absolute inset-0 transition-all duration-500 ease-out"
                style={{
                  opacity: i === activeIndex ? 1 : 0,
                  transform: i === activeIndex ? "translateY(0px)" : `translateY(${i < activeIndex ? -28 : 28}px)`,
                  pointerEvents: i === activeIndex ? "auto" : "none",
                }}
              >
                <ProjectCard item={item} fill />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/** Mobile/tablet fallback — plain stacked list, no scroll-pinning. */
function StackedList() {
  const containerRef = useScrollReveal<HTMLDivElement>("[data-reveal]", { stagger: 0.08, y: 40 });

  return (
    <section className="px-6 py-24 sm:px-12 lg:hidden" style={{ backgroundColor: "var(--color-bg-surface)" }}>
      <div ref={containerRef} className="mx-auto flex max-w-[1728px] flex-col gap-14">
        <SectionHeading
          eyebrow={`Selected work / 0${selectedWork.length}`}
          heading="Things I have shipped"
          subtitle="Four products where I owned the frontend end to end — from the Figma file to the deploy pipeline."
        />
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {selectedWork.map((item) => (
            <div key={item.slug} data-reveal>
              <ProjectCard item={item} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function SelectedWork() {
  return (
    <div id="work">
      <PinnedShowcase />
      <StackedList />
    </div>
  );
}
