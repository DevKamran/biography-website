"use client";

import { Fragment, useEffect, useRef } from "react";
import gsap from "gsap";
import { ArrowUp, FileText, Rss, Sparkle } from "lucide-react";
import { footer, profile } from "@/lib/portfolio-data";
import { ensureGsapRegistered, useScrollReveal } from "./ui/gsap";
import IconButton from "./ui/IconButton";

function GithubIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 .5C5.73.5.5 5.73.5 12c0 5.09 3.29 9.4 7.86 10.93.57.1.78-.25.78-.55 0-.27-.01-1.16-.02-2.11-3.2.7-3.88-1.36-3.88-1.36-.53-1.34-1.29-1.7-1.29-1.7-1.05-.72.08-.71.08-.71 1.17.08 1.78 1.2 1.78 1.2 1.03 1.77 2.71 1.26 3.37.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.7 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11 11 0 0 1 2.9-.39c.98 0 1.97.13 2.9.39 2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.84 1.19 3.1 0 4.43-2.69 5.41-5.25 5.69.41.36.78 1.08.78 2.17 0 1.57-.01 2.83-.01 3.22 0 .3.2.66.79.55A10.5 10.5 0 0 0 23.5 12C23.5 5.73 18.27.5 12 .5z" />
    </svg>
  );
}

function LinkedinIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.03-1.85-3.03-1.85 0-2.14 1.45-2.14 2.94v5.66H9.36V9h3.41v1.56h.05c.47-.89 1.63-1.85 3.36-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45z" />
    </svg>
  );
}

function InstagramIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.3" cy="6.7" r="0.6" fill="currentColor" stroke="none" />
    </svg>
  );
}

const socialIcons: Record<string, React.ElementType> = {
  LinkedIn: LinkedinIcon,
  GitHub: GithubIcon,
  Instagram: InstagramIcon,
  Substack: Rss,
  "Résumé (PDF)": FileText,
};

function Card({
  className = "",
  children,
  ...rest
}: React.HTMLAttributes<HTMLDivElement> & { className?: string; children: React.ReactNode }) {
  return (
    <div
      className={`rounded-2xl p-8 ${className}`}
      style={{ backgroundColor: "var(--color-bg-raised)", boxShadow: "var(--shadow-card)" }}
      {...rest}
    >
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
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              {footer.social.map((s, i) => {
                const Icon = socialIcons[s.label];
                return (
                  <Fragment key={s.label}>
                    {i > 0 && (
                      <span aria-hidden style={{ color: "var(--color-border-strong)" }}>
                        |
                      </span>
                    )}
                    <a
                      href={s.href}
                      className="inline-flex items-center gap-2 font-sans text-sm transition-opacity hover:opacity-70 sm:text-base"
                      style={{ color: "var(--color-text-secondary)" }}
                    >
                      {Icon && <Icon size={16} />}
                      {s.label}
                    </a>
                  </Fragment>
                );
              })}
            </div>

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
