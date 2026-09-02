"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

let registered = false;

/** Registers the ScrollTrigger plugin exactly once, client-side only. */
export function ensureGsapRegistered() {
  if (registered || typeof window === "undefined") return;
  gsap.registerPlugin(ScrollTrigger);
  registered = true;
}

export const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";

/**
 * Fades + slides a set of elements in as they scroll into view, honouring
 * prefers-reduced-motion (renders the end state immediately, no animation).
 */
export function useScrollReveal<T extends HTMLElement>(
  selector: string,
  options: { y?: number; stagger?: number; duration?: number; start?: string } = {}
) {
  const containerRef = useRef<T | null>(null);

  useEffect(() => {
    ensureGsapRegistered();
    const container = containerRef.current;
    if (!container) return;

    const targets = container.querySelectorAll<HTMLElement>(selector);
    if (!targets.length) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const { y = 32, stagger = 0, duration = 0.5, start = "top 80%" } = options;

    if (reduceMotion) {
      gsap.set(targets, { opacity: 1, y: 0, scale: 1 });
      return;
    }

    const ctx = gsap.context(() => {
      gsap.set(targets, { opacity: 0, y, scale: stagger ? 0.98 : 1 });
      gsap.to(targets, {
        opacity: 1,
        y: 0,
        scale: 1,
        duration,
        ease: "power3.out",
        stagger,
        scrollTrigger: {
          trigger: container,
          start,
          once: true,
        },
      });
    }, container);

    return () => ctx.revert();
  }, [selector, options.y, options.stagger, options.duration, options.start]);

  return containerRef;
}

/** Slow, gentle up/down float loop for decorative elements, honouring prefers-reduced-motion. */
export function useFloatAnimation<T extends Element>(
  options: { distance?: number; duration?: number } = {}
) {
  const ref = useRef<T | null>(null);
  const { distance = 14, duration = 4 } = options;

  useEffect(() => {
    ensureGsapRegistered();
    const el = ref.current;
    if (!el) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return;

    const ctx = gsap.context(() => {
      gsap.to(el, {
        y: distance,
        duration,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
      });
    }, el);

    return () => ctx.revert();
  }, [distance, duration]);

  return ref;
}

/** Counts a number up from 0 to its final value once it scrolls into view. */
export function useCountUp<T extends HTMLElement>(finalText: string) {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    ensureGsapRegistered();
    const el = ref.current;
    if (!el) return;

    const match = finalText.match(/[\d.]+/);
    if (!match) return;
    const finalValue = parseFloat(match[0]);
    const prefix = finalText.slice(0, match.index ?? 0);
    const suffix = finalText.slice((match.index ?? 0) + match[0].length);
    const decimals = match[0].includes(".") ? match[0].split(".")[1].length : 0;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) {
      el.textContent = finalText;
      return;
    }

    el.textContent = `${prefix}0${suffix}`;
    const counter = { value: 0 };

    const ctx = gsap.context(() => {
      gsap.to(counter, {
        value: finalValue,
        duration: 1.2,
        ease: "power2.out",
        scrollTrigger: { trigger: el, start: "top 85%", once: true },
        onUpdate: () => {
          el.textContent = `${prefix}${counter.value.toFixed(decimals)}${suffix}`;
        },
        onComplete: () => {
          el.textContent = finalText;
        },
      });
    }, el);

    return () => ctx.revert();
  }, [finalText]);

  return ref;
}
