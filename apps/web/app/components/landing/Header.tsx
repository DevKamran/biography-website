"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ArrowUpRight, Menu, Moon, Sun, X } from "lucide-react";
import { profile, navLinks } from "@/lib/portfolio-data";
import IconButton from "./ui/IconButton";

function Logo() {
  return (
    <a href="#home" className="inline-flex items-center gap-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl sm:h-10 sm:w-10">
        <Image src="/img/logo.png" alt={`${profile.name} logo`} width={40} height={40} className="h-full w-full object-contain" priority />
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

  useEffect(() => {
    const stored = window.localStorage.getItem("theme");
    if (stored === "light" || stored === "dark") setTheme(stored);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    if (menuOpen) {
      const firstLink = overlayRef.current?.querySelector<HTMLElement>("a");
      firstLink?.focus();
    } else {
      menuButtonRef.current?.focus();
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [menuOpen]);

  return (
    <>
      <header
        className="fixed inset-x-0 top-0 z-[101] flex h-20 items-center justify-between border-b px-5 backdrop-blur-md sm:h-24 sm:px-10 lg:px-14"
        style={{
          backgroundColor: "color-mix(in srgb, var(--color-bg-surface) 82%, transparent)",
          borderColor: "var(--color-border-subtle)",
        }}
      >
        <Logo />

        <div className="flex items-center gap-2 sm:gap-3">
          <IconButton
            role="switch"
            aria-checked={theme === "light"}
            aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
            onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
          >
            {theme === "dark" ? <Moon size={16} /> : <Sun size={16} />}
          </IconButton>

          <a
            href="#cta"
            className="js-btn hidden h-11 items-center gap-2 rounded-full border px-5 font-accent text-sm font-semibold transition-colors duration-150 sm:inline-flex"
            data-variant="primary"
            style={{
              backgroundColor: "var(--color-bg-accent)",
              color: "var(--color-text-on-accent)",
              borderColor: "var(--color-bg-accent)",
            }}
          >
            Let&apos;s talk
            <ArrowUpRight size={16} />
          </a>

          <IconButton
            ref={menuButtonRef}
            aria-label="Open menu"
            aria-expanded={menuOpen}
            aria-controls="site-nav-overlay"
            onClick={() => setMenuOpen((v) => !v)}
          >
            {menuOpen ? <X size={18} /> : <Menu size={18} />}
          </IconButton>
        </div>
      </header>

      <div
        id="site-nav-overlay"
        ref={overlayRef}
        role="dialog"
        aria-modal="true"
        aria-label="Site navigation"
        className={`fixed inset-0 z-[100] transition-opacity duration-300 ${
          menuOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
        style={{ backgroundColor: "var(--color-bg-overlay)" }}
      >
        <nav className="flex h-full w-full flex-col items-start justify-center gap-2 px-8 sm:px-16 lg:px-24">
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
