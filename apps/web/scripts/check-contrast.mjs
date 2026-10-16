// Computes WCAG contrast ratios for the colour-token pairs the chat widget
// uses, in both themes. Run: node scripts/check-contrast.mjs
import { readFileSync } from "node:fs";

const css = readFileSync(new URL("../app/globals.css", import.meta.url), "utf8");
function tokens(selector) {
  const start = css.indexOf(selector);
  const block = css.slice(start, css.indexOf("}", start));
  return Object.fromEntries([...block.matchAll(/--([\w-]+):\s*(#[0-9a-f]{6})/gi)].map((m) => [m[1], m[2]]));
}
const lum = (hex) => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };

// [foreground, background, minimum, what]
const PAIRS = [
  ["color-text-primary", "color-bg-raised", 4.5, "message/header text"],
  ["color-text-primary", "color-bg-sunken", 4.5, "agent bubble + input text"],
  ["color-text-on-accent", "color-bg-accent", 4.5, "visitor bubble, Send button"],
  ["color-text-secondary", "color-bg-raised", 4.5, "intro / status text"],
  ["color-text-secondary", "color-bg-sunken", 4.5, "stopped note, placeholder"],
  ["color-text-tertiary", "color-bg-raised", 4.5, "empty-state intro, status line"],
  ["color-text-tertiary", "color-bg-sunken", 4.5, "placeholder, progress label"],
  ["color-text-tertiary", "color-bg-raised", 3, "minimize/close icons (1.4.11)"],
  ["color-status-error", "color-bg-raised", 4.5, "error text"],
  ["color-border-input", "color-bg-sunken", 3, "input border (1.4.11)"],
  ["color-border-input", "color-bg-raised", 3, "input border vs panel (1.4.11)"],
  ["color-text-accent", "color-bg-raised", 3, "focus ring (1.4.11 / 2.4.13)"],
  ["color-text-accent", "color-bg-sunken", 3, "focus ring on sunken"],
  ["color-text-primary", "color-bg-raised", 3, "icon buttons (1.4.11)"],
];

let failed = 0;
for (const [name, selector] of [["dark", ":root"], ["light", ':root[data-theme="light"]']]) {
  const t = { ...tokens(":root"), ...(name === "light" ? tokens(selector) : {}) };
  console.log(`\n${name} theme`);
  for (const [fg, bg, min, what] of PAIRS) {
    const r = ratio(t[fg], t[bg]);
    const ok = r >= min;
    if (!ok) failed++;
    console.log(`  ${ok ? "PASS" : "FAIL"} ${r.toFixed(2).padStart(5)}:1 (min ${min}) ${fg} on ${bg} — ${what}`);
  }
}
process.exit(failed ? 1 : 0);
