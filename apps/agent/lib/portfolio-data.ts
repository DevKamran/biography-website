// ---------------------------------------------------------------------------
// Single source of truth for the site's content.
// The agent (apps/agent/data/portfolio.json) mirrors this — keep them in sync,
// or later wire the agent to fetch this via an API route instead of a copy.
// ---------------------------------------------------------------------------

export const profile = {
  name: "Kamran Ali",
  title: "Senior Frontend Engineer",
  headerTitle: "senior frontend\nengineer",
  location: "Karachi, Pakistan",
  bio: "Senior Frontend Engineer with 7+ years building enterprise SaaS, AI-powered products, and pixel-perfect React.js interfaces — currently shipping Goalytics, an AI-powered OKR platform, at Digital Gravity.",
  email: "kamranali06022026@gmail.com",
  phone: "+92-312-2497222",
  links: {
    github: "https://github.com/imkamranaly", // TODO: confirm handle
    linkedin: "https://linkedin.com/in/imkamranaly", // TODO: confirm handle
    resume: "/resume.pdf", // TODO: drop the real resume PDF in /public
  },
};

export const heroStats = [
  { value: "7+", label: "Years of\nexperience" },
  { value: "8+", label: "Products\nshipped" },
];

export const heroTags: string[] = [
  "React.js",
  "Next.js",
  "TypeScript",
  "Socket.io",
  "Claude AI",
  "Figma to Code",
  "Design Systems",
  "WCAG Accessibility",
  "Tailwind CSS",
  "SCSS",
  "Performance",
  "SSR/SSG",
];

export const navLinks = [
  { label: "Home", href: "#home" },
  { label: "About me", href: "#about" },
  { label: "Workfolio", href: "#projects" },
  { label: "Contact", href: "#contact" },
];

export const skills: string[] = [
  "HTML5",
  "CSS3/SCSS",
  "JavaScript (ES6+)",
  "TypeScript",
  "React.js",
  "Next.js",
  "Vue.js",
  "Angular",
  "Tailwind CSS",
  "Bootstrap",
  "Socket.io",
  "WebSockets",
  "Redux Toolkit",
  "Zustand",
  "REST APIs",
  "GraphQL",
  "Figma",
  "Jest",
  "React Testing Library",
  "Webpack",
  "Vite",
  "Docker",
  "AWS",
  "Vercel",
  "GitHub Actions",
  "WCAG Accessibility",
  "Claude API / AI-Assisted Workflows",
];

export type Project = {
  name: string;
  description: string;
  tech: string[];
  link?: string;
  repo?: string;
};

export const projects: Project[] = [
  {
    name: "Goalytics",
    description:
      "AI-powered OKR platform — real-time collaborative Socket.io sessions, Claude-powered AI suggestion workflows for goals/objectives/key results, and role-based dashboards (Admin, Manager, Participant, Viewer).",
    tech: ["Next.js", "TypeScript", "Socket.io", "Claude AI API", "SaaS"],
    link: "https://goalytics.io",
  },
  {
    name: "Vettio",
    description:
      "AI recruitment platform running structured, domain-aware video/voice interviews for every applicant and producing explainable shortlists. Owned the enterprise SaaS design system end-to-end, including real-time LiveKit voice interview UI.",
    tech: ["React.js", "Next.js", "TypeScript", "WebSockets", "LiveKit", "REST API"],
  },
  {
    name: "Savyour",
    description:
      "Pakistan's cashback & deals platform — real-time deal discovery with stacking cashback across 400+ partner brands, an in-app wallet, and a browser extension for checkout savings.",
    tech: ["Next.js", "React.js", "Tailwind CSS"],
    link: "https://savyour.io",
  },
  {
    name: "TaskQue",
    description:
      "Cloud-based task management platform with automatic \"Que\"-based task routing to whichever team member is free, customizable Agile/Waterfall workflows, and Slack/Drive/Dropbox integrations.",
    tech: ["AngularJS", "TypeScript", "Bootstrap", "REST API"],
  },
  {
    name: "Rocky Run",
    description: "Single-page landing site built for event registration.",
    tech: ["HTML5", "CSS3", "JavaScript"],
    link: "https://rockyrun.com",
  },
  {
    name: "DesignUps",
    description: "Single-page landing site for a creative agency.",
    tech: ["HTML5", "CSS3", "JavaScript"],
    link: "https://designups.com",
  },
  {
    name: "AUTOFOCUS Energy",
    description: "Single-page e-commerce landing site for an energy drink brand.",
    tech: ["HTML5", "CSS3", "JavaScript"],
    link: "https://drinkautofocus.com",
  },
  {
    name: "WUNDERWEB Studio",
    description: "Single-page studio portfolio landing site.",
    tech: ["HTML5", "CSS3", "JavaScript"],
    link: "https://www.wunderwebstudio.com",
  },
];

export type Experience = {
  role: string;
  company: string;
  dates: string;
  description: string;
};

export const experience: Experience[] = [
  {
    role: "Frontend Developer — Goalytics (AI OKR Platform)",
    company: "Digital Gravity",
    dates: "July 2025 — Present",
    description:
      "Building Goalytics (goalytics.io) end to end: pixel-perfect React.js UI from Figma, real-time multi-user Socket.io collaboration (live brainstorming, voting, presence), Claude AI-powered suggestion interfaces with user review/accept/reject controls, role-based UI architecture, and REST API integration.",
  },
  {
    role: "Senior Frontend Engineer (Frontend Lead)",
    company: "Disrupt.com (Vettio)",
    dates: "March 2021 — June 2025",
    description:
      "Owned frontend of a production enterprise SaaS platform end to end — Figma wireframes through hand-coded, pixel-perfect React.js/Next.js. Built and maintained a design system that cut delivery time by 40%, shipped WCAG-aligned accessible interfaces, built real-time LiveKit voice interview features, improved Core Web Vitals by 35%, and mentored engineers while maintaining CI/CD via GitHub Actions and Vercel.",
  },
  {
    role: "Front-End Developer",
    company: "Intersys Ltd",
    dates: "April 2019 — February 2021",
    description:
      "Built responsive, accessible web interfaces in React.js, HTML5, CSS3/SCSS, and Bootstrap from Figma/PSD designs; maintained marketing landing pages alongside product UI and migrated a legacy WordPress frontend to a modern React.js component architecture.",
  },
  {
    role: "Front-End Developer",
    company: "Nanosoft",
    dates: "May 2018 — April 2019",
    description:
      "Built responsive, accessible UI components for TaskQue using Angular and TypeScript, integrating REST APIs and real-time data feeds in Agile sprint cycles.",
  },
  {
    role: "UI Developer",
    company: "EFSOL Solution",
    dates: "March 2017 — April 2018",
    description:
      "Designed and developed responsive marketing websites and landing pages using hand-coded HTML5, CSS3, and JavaScript, translating Figma/PSD layouts into pixel-perfect, brand-consistent interfaces.",
  },
];
