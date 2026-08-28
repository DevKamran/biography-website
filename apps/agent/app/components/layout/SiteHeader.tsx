"use client";

import { useEffect, useState } from "react";
import { ArrowUpRight, Heart, Menu, Moon, Sun, X } from "lucide-react";
import { profile, navLinks } from "@/lib/portfolio-data";

function Logo() {
  return (
    <a href="#home" className="inline-flex items-center gap-2.5 sm:gap-3.5">
      <svg viewBox="0 0 56 56" className="block h-9 w-9 sm:h-11 sm:w-11">
        <path
          d="M56,28c0,11.1-2.9,28-28,28S0,39.1,0,28S2.9,0,28,0S56,16.9,56,28z"
          fill="var(--base-opp)"
        />
        <path
          d="M12 32.0928C12.0003 30.8135 13.1857 29.8631 14.4346 30.1406L24.834 32.4521C25.749 32.6555 26.4004 33.4669 26.4004 34.4043V42C26.4004 43.1045 25.5049 44 24.4004 44H14C12.8957 43.9998 12 43.1044 12 42V32.0928ZM42 12C43.1046 12 44 12.8954 44 14V42C43.9999 43.1045 43.1045 44 42 44H31.6006C30.4961 44 29.6007 43.1045 29.6006 42V14C29.6006 12.8954 30.496 12 31.6006 12H42Z"
          fill="var(--base)"
        />
      </svg>
      <span
        className="whitespace-pre font-accent text-base font-medium leading-tight sm:text-lg"
        style={{ color: "var(--t-bright)" }}
      >
        {profile.headerTitle}
      </span>
    </a>
  );
}

export default function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">("dark");

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
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-[101] flex items-center justify-between px-5 py-5 sm:px-10 sm:py-7 lg:px-14 lg:py-9">
        <Logo />

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            role="switch"
            aria-checked={theme === "light"}
            aria-label="light/dark mode"
            onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
            className="flex h-10 w-10 items-center justify-center rounded-full border transition-colors sm:h-12 sm:w-12"
            style={{ borderColor: "var(--st-bright)", color: "var(--t-bright)" }}
          >
            {theme === "dark" ? <Moon size={18} /> : <Sun size={18} />}
          </button>

          <a
            href="#contact"
            className="flex h-10 w-10 items-center justify-center gap-2 rounded-full border font-accent text-sm font-medium backdrop-blur-md transition-colors sm:h-12 sm:w-12 md:w-auto md:px-6 md:text-base"
            style={{ borderColor: "var(--st-bright)", color: "var(--t-bright)" }}
          >
            <span className="hidden md:inline">Say Hello</span>
            <ArrowUpRight size={18} />
          </a>

          <button
            type="button"
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
            className="flex h-10 w-10 items-center justify-center rounded-full sm:h-12 sm:w-12"
            style={{ backgroundColor: "var(--base-opp-tint)", color: "var(--t-opp-bright)" }}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      <div
        className={`fixed inset-0 z-[100] transition-opacity duration-300 ${
          menuOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <div className="absolute inset-0" style={{ backgroundColor: "var(--base-opp)" }} />

        <div className="relative flex h-full w-full flex-col overflow-y-auto px-5 pb-8 pt-24 sm:px-14 sm:pt-28 lg:flex-row lg:items-center lg:px-24">
          <div className="w-full lg:w-1/2">
            <p
              className="mb-8 font-accent text-base leading-tight sm:text-lg"
              style={{ color: "var(--t-opp-medium)" }}
            >
              {profile.name}
              <br />
              {profile.title}
            </p>

            <nav className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="font-accent text-5xl font-semibold leading-[1.15] transition-opacity hover:opacity-60 sm:text-6xl"
                  style={{ color: "var(--t-opp-bright)" }}
                >
                  {link.label}
                </a>
              ))}
            </nav>
          </div>

          <div className="mt-14 w-full lg:mt-0 lg:flex lg:w-1/2 lg:items-end lg:justify-end lg:self-stretch lg:pb-20">
            <p
              className="max-w-sm font-accent text-lg leading-snug sm:text-xl"
              style={{ color: "var(--t-opp-bright)" }}
            >
              👋 Nice to see you!
              <br />
              I&apos;m Kamran, a Senior UI/UX Engineer from Pakistan
            </p>
          </div>

          <div
            className="mt-14 flex w-full flex-col items-center gap-2 border-t pt-6 text-center font-accent text-sm sm:flex-row sm:justify-between lg:absolute lg:bottom-8 lg:left-24 lg:right-24 lg:mt-0 lg:w-auto lg:border-t-0 lg:pt-0"
            style={{ borderColor: "var(--st-opp-bright)", color: "var(--t-opp-medium)" }}
          >
            <p className="inline-flex items-center gap-2">
              <Heart size={14} /> {profile.email}
            </p>
            <p>© {new Date().getFullYear()}</p>
          </div>
        </div>
      </div>
    </>
  );
}
