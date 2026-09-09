"use client";

import { useEffect, useState } from "react";

// Keeps the preloader visible for at least this long so it reads as a
// deliberate branded loading screen rather than a one-frame flash on fast
// connections, while still tracking real page-load progress underneath.
const MIN_DISPLAY_MS = 3000;

export default function Preloader() {
  const [progress, setProgress] = useState(0);
  const [isExiting, setIsExiting] = useState(false);
  const [isMounted, setIsMounted] = useState(true);

  useEffect(() => {
    document.documentElement.classList.add("preload-lock");

    const start = performance.now();
    let raf = 0;
    let pageLoaded = document.readyState === "complete";
    let finished = false;

    const onLoad = () => {
      pageLoaded = true;
    };
    window.addEventListener("load", onLoad);

    const finish = () => {
      if (finished) return;
      finished = true;
      window.setTimeout(() => {
        setIsExiting(true);
        window.setTimeout(() => {
          document.documentElement.classList.remove("preload-lock");
          setIsMounted(false);
        }, 500);
      }, 400);
    };

    const tick = (now: number) => {
      const elapsed = now - start;
      // Time-based (not frame-count-based) so it's unaffected by throttled
      // rAF on backgrounded/inactive tabs — ramps 0 -> 92% over MIN_DISPLAY_MS.
      const rampProgress = Math.min(elapsed / MIN_DISPLAY_MS, 1) * 92;
      const target = pageLoaded && elapsed >= MIN_DISPLAY_MS ? 100 : rampProgress;

      setProgress((prev) => Math.min(100, Math.max(prev, Math.round(target))));

      if (target >= 100) {
        finish();
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("load", onLoad);
      document.documentElement.classList.remove("preload-lock");
    };
  }, []);

  if (!isMounted) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-hidden={isExiting}
      className="fixed inset-0 z-[999] flex items-center justify-center transition-opacity duration-500 ease-out"
      style={{
        backgroundColor: "var(--color-bg-surface)",
        opacity: isExiting ? 0 : 1,
        pointerEvents: isExiting ? "none" : "auto",
      }}
    >
      <div className="flex flex-col items-center gap-4">
        <p
          className="font-accent text-7xl font-bold tabular-nums sm:text-8xl"
          style={{ color: "var(--color-text-primary)" }}
        >
          {progress}%
        </p>

        <div className="h-[3px] w-40 overflow-hidden rounded-full sm:w-56">
          <div
            className="h-full transition-[width] duration-150 ease-out"
            style={{ width: `${progress}%`, backgroundColor: "var(--color-bg-accent)" }}
          />
        </div>
      </div>
    </div>
  );
}
