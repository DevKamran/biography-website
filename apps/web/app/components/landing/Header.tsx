"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ArrowUpRight, Menu, Moon, Sun, X } from "lucide-react";
import gsap from "gsap";
import { profile, navLinks } from "@/lib/portfolio-data";
import { ensureGsapRegistered } from "./ui/gsap";
import IconButton from "./ui/IconButton";

function Logo() {
  return (
    <a href="/#home" className="inline-flex items-center gap-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl sm:h-10 sm:w-10">
        <Image src="/img/logo.png" alt="" width={40} height={40} className="h-full w-full object-contain" priority />
      </span>
      <span className="flex flex-col leading-tight">
        <span className="font-accent text-base font-semibold sm:text-lg" style={{ color: "var(--color-text-primary)" }}>
          {profile.name}
        </span>
        <span
          className="font-mono-label text-[10px] uppercase tracking-widest sm:text-[11px]"
          style={{ color: "var(--color-text-tertiary)" }}
        >
          {profile.title}
        </span>
      </span>
    </a>
  );
}

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const wasMenuOpenRef = useRef(false);

  useEffect(() => {
    const stored = window.localStorage.getItem("theme");
    if (stored === "light" || stored === "dark") setTheme(stored);
  }, []);

  useEffect(() => {
    ensureGsapRegistered();
    const header = headerRef.current;
    if (!header) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const items = header.querySelectorAll<HTMLElement>("[data-header-in]");
    if (reduceMotion || !items.length) return;

    const ctx = gsap.context(() => {
      gsap.set(items, { opacity: 0, y: -16 });
      gsap.to(items, {
        opacity: 1,
        y: 0,
        duration: 0.5,
        ease: "power3.out",
        stagger: 0.06,
      });
    }, header);

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    const overlay = overlayRef.current;
    // The closed overlay is only faded out, so `inert` keeps its links out of
    // the tab order and the accessibility tree (WCAG 2.4.3 / 1.3.2).
    if (overlay) overlay.inert = !menuOpen;
    // While open it covers the page, so the page behind it is inert too.
    const background = document.querySelectorAll<HTMLElement>("main, footer, [data-chat-widget]");
    background.forEach((el) => (el.inert = menuOpen));

    document.body.style.overflow = menuOpen ? "hidden" : "";
    if (menuOpen) {
      const firstLink = overlay?.querySelector<HTMLElement>("a");
      firstLink?.focus();
    } else if (wasMenuOpenRef.current) {
      // Only hand focus back after a real close — not on first render.
      menuButtonRef.current?.focus();
    }
    wasMenuOpenRef.current = menuOpen;
    return () => {
      document.body.style.overflow = "";
      background.forEach((el) => (el.inert = false));
    };
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMenuOpen(false);
        return;
      }
      if (e.key !== "Tab") return;
      // Keep Tab cycling between the menu button and the menu links.
      const focusables = [
        menuButtonRef.current,
        ...Array.from(overlayRef.current?.querySelectorAll<HTMLElement>("a") ?? []),
      ].filter((el): el is HTMLElement => !!el);
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [menuOpen]);

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:rounded-full focus:px-5 focus:py-3 focus:font-accent focus:text-sm focus:font-semibold"
        style={{ backgroundColor: "var(--color-bg-accent)", color: "var(--color-text-on-accent)" }}
      >
        Skip to main content
      </a>
      <header
        ref={headerRef}
        className="fixed inset-x-0 top-0 z-[101] flex h-20 items-center justify-between border-b px-5 backdrop-blur-md sm:h-24 sm:px-10 lg:px-14"
        style={{
          backgroundColor: "color-mix(in srgb, var(--color-bg-surface) 82%, transparent)",
          borderColor: "var(--color-border-subtle)",
        }}
      >
        <div data-header-in>
          <Logo />
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <IconButton
            data-header-in
            role="switch"
            aria-checked={theme === "light"}
            aria-label="Light theme"
            onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
          >
            {theme === "dark" ? <Moon size={16} aria-hidden="true" /> : <Sun size={16} aria-hidden="true" />}
          </IconButton>

          <a
            data-header-in
            href="/#cta"
            className="js-btn hidden h-11 items-center gap-2 rounded-full border px-5 font-accent text-sm font-semibold transition-colors duration-150 sm:inline-flex"
            data-variant="primary"
            style={{
              backgroundColor: "var(--color-bg-accent)",
              color: "var(--color-text-on-accent)",
              borderColor: "var(--color-bg-accent)",
            }}
          >
            Let&apos;s talk
            <ArrowUpRight size={16} aria-hidden="true" />
          </a>

          <IconButton
            data-header-in
            ref={menuButtonRef}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            aria-controls="site-nav-overlay"
            onClick={() => setMenuOpen((v) => !v)}
          >
            {menuOpen ? <X size={18} aria-hidden="true" /> : <Menu size={18} aria-hidden="true" />}
          </IconButton>
        </div>
      </header>

      <div
        id="site-nav-overlay"
        ref={overlayRef}
        className={`fixed inset-0 z-[100] transition-opacity duration-300 ${
          menuOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
        style={{ backgroundColor: "var(--color-bg-overlay)" }}
      >
        <nav aria-label="Site" className="flex h-full w-full flex-col items-start justify-center gap-2 px-8 sm:px-16 lg:px-24">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="js-nav-link font-accent text-4xl font-semibold leading-[1.3] transition-opacity hover:opacity-70 sm:text-6xl"
              style={{ color: "var(--color-text-primary)" }}
            >
              {link.label}
            </a>
          ))}

          <p
            className="mt-10 font-mono-label text-sm"
            style={{ color: "var(--color-text-tertiary)" }}
          >
            {profile.email}
          </p>
        </nav>
      </div>
    </>
  );
}
