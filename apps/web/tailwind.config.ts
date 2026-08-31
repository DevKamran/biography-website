import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["\"Funnel Sans\"", "sans-serif"],
        accent: ["\"Funnel Display\"", "sans-serif"],
        mono: ["\"JetBrains Mono\"", "monospace"],
      },
      screens: {
        xs: "420px",
        hero: "1200px",
        "hero-lg": "1600px",
      },
    },
  },
  plugins: [],
};

export default config;
