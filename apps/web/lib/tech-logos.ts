// Maps a tag/skill label to its Simple Icons slug (https://simpleicons.org) so
// pills can render the tool/language's real logo. Tags with no widely
// recognised single-brand mark (e.g. "Mobile-first", "Systems Design") are
// intentionally left out and render as plain text.
export const techLogoSlugs: Record<string, string> = {
  JavaScript: "javascript",
  "HTML5": "html5",
  "Semantic HTML": "html5",
  "CSS3/SCSS": "css3",
  "Flexible CSS architecture": "css3",
  Tailwind: "tailwindcss",
  "Tailwind CSS": "tailwindcss",
  Bootstrap: "bootstrap",
  "React.js": "react",
  "Next.js": "nextdotjs",
  "Vue.js": "vuedotjs",
  TypeScript: "typescript",
  Angular: "angular",
  "Python FastAPI": "fastapi",
  PHP: "php",
  Laravel: "laravel",
  "Socket.io": "socketdotio",
  "Claude API workflows": "claude",
  "Claude API": "claude",
  Claude: "claude",
  Figma: "figma",
  "ShadCN UI": "shadcnui",
  GraphQL: "graphql",
  "Redux Toolkit": "redux",
  "Lighthouse audits": "lighthouse",
  Webpack: "webpack",
  Vite: "vite",
  Git: "git",
  "GitHub Actions": "githubactions",
  Docker: "docker",
  Vercel: "vercel",
  Netlify: "netlify",
  Jest: "jest",
  "React Testing Library": "testinglibrary",
  "GitHub Copilot": "githubcopilot",
  Cursor: "cursor",
  LiveKit: "livekit",
};

// Simple Icons ships these as solid-black SVGs, so they need the
// `.js-tag-icon-mono` invert-on-dark-theme treatment to stay visible.
export const monoLogoSlugs = new Set([
  "nextdotjs",
  "vercel",
  "githubcopilot",
  "cursor",
  "socketdotio",
  "shadcnui",
]);
