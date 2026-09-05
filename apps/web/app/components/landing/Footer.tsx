"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ArrowUp, Sparkle } from "lucide-react";
import { footer, profile } from "@/lib/portfolio-data";
import { ensureGsapRegistered, useScrollReveal } from "./ui/gsap";
import IconButton from "./ui/IconButton";

function Card({
  className = "",
  children,
  ...rest
}: React.HTMLAttributes<HTMLDivElement> & { className?: string; children: React.ReactNode }) {
  return (
    <div className={`rounded-2xl p-8 ${className}`} style={{ backgroundColor: "var(--color-bg-raised)" }} {...rest}>
      {children}
    </div>
  );
}

function ContactRow({ children }: { children: React.ReactNode }) {
  return (
    <Card className="flex flex-1 items-center gap-3 self-stretch">
      <Sparkle size={16} style={{ color: "var(--color-icon-accent)" }} />
      {children}
    </Card>
  );
}

export default function Footer() {
  const containerRef = useScrollReveal<HTMLDivElement>("[data-reveal]", { y: 24, stagger: 0.06 });
  const backToTopRef = useRef<HTMLButtonElement>(null);
  const footerRef = useRef<HTMLElement>(null);
  const nameRef = useRef<HTMLParagraphElement>(null);
  const cardsRowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    ensureGsapRegistered();
    const footerEl = footerRef.current;
    const name = nameRef.current;
    const cardsRow = cardsRowRef.current;
    if (!footerEl || !name || !cardsRow) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return;

    const ctx = gsap.context(() => {
      // Background layer: the giant wordmark drifts slowly across the whole footer.
      gsap.fromTo(
        name,
        { yPercent: 22 },
        {
          yPercent: -22,
          ease: "none",
          scrollTrigger: {
            trigger: footerEl,
            start: "top bottom",
            end: "bottom bottom",
            scrub: true,
          },
        }
      );

      // Foreground layer: the contact/nav cards slide up out of the wordmark,
      // moving faster than it — real scroll-linked parallax, not a one-shot ease.
      gsap.fromTo(
        cardsRow,
        { yPercent: 70 },
        {
          yPercent: 0,
          ease: "none",
          scrollTrigger: {
            trigger: footerEl,
            start: "top bottom",
            end: "top 15%",
            scrub: true,
          },
        }
      );
    }, footerEl);

    return () => ctx.revert();
  }, []);

  return (
    <footer ref={footerRef} className="overflow-hidden px-6 py-16 sm:px-12 lg:px-14" style={{ backgroundColor: "var(--color-bg-surface)" }}>
      <div ref={containerRef} className="mx-auto flex max-w-[1728px] flex-col gap-16">
        <div ref={cardsRowRef} className="relative z-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Card data-reveal className="flex flex-col gap-3">
            {footer.nav.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="js-nav-link inline-flex w-fit items-center gap-2.5 font-accent text-2xl font-semibold transition-opacity hover:opacity-70"
                style={{ color: "var(--color-text-primary)" }}
              >
                {link.label}
                {link.label === "Selected work" && (
                  <span
                    className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 font-mono-label text-[11px]"
                    style={{ backgroundColor: "var(--color-bg-accent)", color: "var(--color-text-on-accent)" }}
                  >
                    <Sparkle size={10} />
                    {footer.workBadge}
                  </span>
                )}
              </a>
            ))}
          </Card>

          <div data-reveal className="flex h-full flex-col gap-4">
            <div className="flex h-full flex-col gap-4">
              <ContactRow>
                <a
                  href={`mailto:${profile.email}`}
                  className="font-sans text-sm transition-opacity hover:opacity-70 sm:text-base"
                  style={{ color: "var(--color-text-secondary)" }}
                >
                  {profile.email}
                </a>
              </ContactRow>
              <ContactRow>
                <a
                  href={`tel:${profile.phone.replace(/\s+/g, "")}`}
                  className="font-sans text-sm transition-opacity hover:opacity-70 sm:text-base"
                  style={{ color: "var(--color-text-secondary)" }}
                >
                  {profile.phone}
                </a>
              </ContactRow>
            </div>
          </div>

          <Card data-reveal className="flex flex-col gap-3">
            <p className="font-accent text-2xl font-semibold" style={{ color: "var(--color-text-primary)" }}>
              Follow me
            </p>
            {footer.social.map((s) => (
              <a
                key={s.label}
                href={s.href}
                className="font-sans text-sm transition-opacity hover:opacity-70 sm:text-base"
                style={{ color: "var(--color-text-secondary)" }}
              >
                {s.label}
              </a>
            ))}

            <div className="mt-6 flex items-end justify-between">
              <p className="font-mono-label text-xs" style={{ color: "var(--color-text-tertiary)" }}>
                {footer.legal}
              </p>
              <IconButton
                ref={backToTopRef}
                aria-label="Back to top"
                size={44}
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              >
                <ArrowUp size={16} />
              </IconButton>
            </div>
          </Card>
        </div>

        <p
          ref={nameRef}
          data-reveal
          className="relative z-0 select-none font-accent text-[15vw] font-extrabold leading-[0.85] tracking-tight text-center sm:text-[11vw] lg:text-[15rem]"
          style={{ color: "var(--color-text-primary)" }}
        >
          {profile.name}
        </p>
      </div>
    </footer>
  );
}
