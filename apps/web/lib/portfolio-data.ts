// ---------------------------------------------------------------------------
// Single source of truth for the site's content.
// The agent (apps/agent/data/portfolio.json) mirrors this — keep them in sync,
// or later wire the agent to fetch this via an API route instead of a copy.
// ---------------------------------------------------------------------------

export const profile = {
  name: "Kamran Ali",
  title: "Full Stack Engineer",
  headerTitle: "Senior Frontend Engineer",
  location: "Karachi, Pakistan",
  heroIntro:
    "AI Product Engineer & Full-Stack-Focused Frontend Developer — I understand the problem before I write the code. I design systems, build AI-driven workflows, and ship real-time SaaS interfaces that are accessible and pixel-accurate.",
  bio: "Senior Frontend Engineer with 7+ years building enterprise SaaS, AI-powered products, and pixel-perfect React.js interfaces — currently shipping Goalytics, an AI-powered OKR platform, at Digital Gravity.",
  email: "kamranali06022026@gmail.com",
  phone: "+92 312 2497222",
  links: {
    github: "https://github.com/imkamranaly", // TODO: confirm handle
    linkedin: "https://linkedin.com/in/imkamranaly", // TODO: confirm handle
    resume: "/resume.pdf", // TODO: drop the real resume PDF in /public
  },
};

export const heroStats = [
  { value: "7+", label: "Years of\nexperience" },
  { value: "5", label: "Companies\nshipped for" },
];

export const heroTags: string[] = [
  "JavaScript",
  "Tailwind",
  "React.js",
  "Next.js",
  "TypeScript",
  "Vue.js",
  "Angular",
  "Collaborative UI",
  "RAG Workflows",
  "Python FastAPI",
  "DevOps",
  "Systems Design",
  "Accessibility",
  "Performance",
  "Scalability",
  "Design Systems",
  "Component Libraries",
];

export const navLinks = [
  { label: "Home", href: "#home" },
  { label: "About", href: "#about" },
  { label: "Selected work", href: "#work" },
  { label: "Contact", href: "#cta" },
];

// ---------------------------------------------------------------------------
// Trust bar — currently / previously
// ---------------------------------------------------------------------------

export const trustBar = {
  currentlyLabel: "Currently",
  currently: "Lead Frontend Developer — Digital Gravity, Karachi",
  previouslyLabel: "Previously",
  previously: ["Disrupt.com (Vettio)", "Intersys Ltd", "Nanosoft", "EFSOL Solution"],
};

// ---------------------------------------------------------------------------
// Metrics — "Outcomes, not just output"
// ---------------------------------------------------------------------------

export type Metric = {
  eyebrow: string;
  value: string;
  description: string;
};

export const metrics: Metric[] = [
  {
    eyebrow: "Experience",
    value: "07+",
    description: "years shipping production frontend across SaaS, AI and high-traffic web.",
  },
  {
    eyebrow: "Delivery",
    value: "90%",
    description: "faster delivery after building a shared design system and component library.",
  },
  {
    eyebrow: "Performance",
    value: "80%",
    description: "improvement in Lighthouse and Core Web Vitals via SSR, code splitting and CDN.",
  },
  {
    eyebrow: "Reliability",
    value: "90%",
    description: "better deployment reliability through GitHub Actions and Vercel CI/CD.",
  },
];

// ---------------------------------------------------------------------------
// Selected work — 4 case studies
// ---------------------------------------------------------------------------

export type SelectedWorkItem = {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  tags: string[];
  stats: [string, string];
  gradient: [string, string];
  image: string;
};

export const selectedWork: SelectedWorkItem[] = [
  {
    slug: "goalytics",
    name: "Goalytics",
    tagline: "AI OKR Platform",
    description:
      "Real-time collaborative OKR sessions with live presence and simultaneous editing, plus Claude-powered suggestion interfaces where participants review, accept or reject every AI output before it lands.",
    tags: ["React.js", "Socket.io", "Claude API"],
    stats: ["4 role-based UI layers", "100% hand-coded from Figma"],
    gradient: ["#1fb6e8", "#0a0e14"],
    image: "/img/companies/goalytics_banner.png",
   
  },
  {
    slug: "vettio",
    name: "Vettio",
    tagline: "Enterprise SaaS Platform",
    description:
      "Owned the frontend end to end — Figma wireframes through pixel-perfect React and Next.js — and built the shared component library that kept product and marketing surfaces consistent.",
    tags: ["Next.js", "TypeScript", "LiveKit"],
    stats: ["40% faster delivery", "35% Core Web Vitals gain"],
    gradient: ["#f5a623", "#F99E1C"],
    image: "/img/companies/vettio_banner.png",
  },
  {
    slug: "savyour",
    name: "Savyour",
    tagline: "High-Traffic Web Platform",
    description:
      "Owned both product UI and marketing landing pages on a high-traffic consumer platform, with SSR-based performance and brand-consistent UI across every surface.",
    tags: ["Next.js", "Vue.js", "SCSS"],
    stats: ["SSR performance-first rendering", "2 surfaces owned solo"],
    gradient: ["#22c55e", "#E61C22"],
    image: "/img/companies/savyour.jpeg",
  },
  {
    slug: "taskque",
    name: "TaskQue",
    tagline: "Accessible Enterprise SPA",
    description:
      "Accessible, cross-browser enterprise SPA with clean semantic markup, real-time API integration and role-based UI architecture built to W3C standards.",
    tags: ["Angular", "TypeScript", "REST API"],
    stats: ["WCAG aligned throughout", "4 permission-scoped views"],
    gradient: ["#8a8f98", "#ed7d3d"],
    image: "/img/companies/taskque.png",
  },
];

// ---------------------------------------------------------------------------
// Capabilities — "What I actually do"
// ---------------------------------------------------------------------------

export type Capability = {
  icon: "code" | "bolt" | "sparkle" | "layers" | "check-circle" | "arrow-upward";
  title: string;
  description: string;
};

export const capabilities: Capability[] = [
  {
    icon: "code",
    title: "Hand-coded, standards-first markup",
    description:
      "HTML5, CSS3/SCSS and React written by hand to W3C standards — not assembled from third-party component libraries.",
  },
  {
    icon: "bolt",
    title: "Real-time & collaborative UI",
    description:
      "Socket.io multi-user sessions with live presence, simultaneous editing and conflict-free state sync.",
  },
  {
    icon: "sparkle",
    title: "AI-integrated interfaces",
    description:
      "Claude API workflows with review, accept and reject surfaces — so a person stays accountable for every AI output.",
  },
  {
    icon: "layers",
    title: "Design systems & component libraries",
    description:
      "Reusable components, tokens and cross-surface standards that keep product and marketing UI in step.",
  },
  {
    icon: "check-circle",
    title: "Accessibility as a default",
    description:
      "WCAG-aligned semantics, keyboard navigation, focus management and colour contrast — built in, not retrofitted.",
  },
  {
    icon: "arrow-upward",
    title: "Performance & Core Web Vitals",
    description:
      "SSR/SSG, lazy loading, code splitting and CDN delivery, measured with Lighthouse rather than guessed at.",
  },
];

// ---------------------------------------------------------------------------
// Tech stack — "The toolkit"
// ---------------------------------------------------------------------------

export const techStackGroups: { label: string; tags: string[] }[] = [
  { label: "Core frontend", tags: ["HTML5", "CSS3 / SCSS", "JavaScript", "Bootstrap"] },
  { label: "Frameworks", tags: ["React.js", "Next.js", "Vue.js", "Angular"] },
  { label: "Backend", tags: ["Python FastAPI", "PHP", "Laravel"] },
  { label: "Real-time", tags: ["Socket.io", "WebSockets", "LiveKit"] },
  { label: "State", tags: ["Redux Toolkit", "Zustand", "Context API"] },
  { label: "Design systems", tags: ["Figma", "Tailwind CSS", "ShadCN UI", "Component libraries"] },
  { label: "API", tags: ["REST", "GraphQL", "Socket.io"] },
  {
    label: "Build & devops",
    tags: ["Webpack", "Vite", "Git", "GitHub Actions", "Docker", "Vercel", "AWS", "Netlify"],
  },
  { label: "Testing", tags: ["Jest", "React Testing Library", "TDD"] },
  { label: "AI workflow", tags: ["Claude", "GitHub Copilot", "Cursor", "Bolt"] },
];

// ---------------------------------------------------------------------------
// Experience — "Where I have been"
// ---------------------------------------------------------------------------

export type Experience = {
  role: string;
  company: string;
  dates: string;
  location: string;
  bullets: string[];
};

export const experience: Experience[] = [
  {
    role: "Lead Frontend Developer",
    company: "Digital Gravity — Goalytics (AI OKR Platform)",
    dates: "Jul 2025 — Present",
    location: "Karachi, PK",
    bullets: [
      "Building **Goalytics** (goalytics.io), an AI-powered OKR platform — designing and implementing pixel-perfect UI from Figma specifications in React.js, shipping hand-coded **HTML5/CSS3/SCSS** to W3C standards.",
      "Implemented **real-time multi-user collaborative sessions** using Socket.io — live goal brainstorming, simultaneous editing, voting, commenting, and live presence indicators across all session participants simultaneously.",
      "Integrated **Claude AI API workflows** for AI-powered goal generation, objective structuring, key result proposals, weightage balancing recommendations, and dashboard insights — adapting an AI-first development workflow throughout.",
      "Built **AI-assisted suggestion interfaces**: surfaces Claude-generated OKR suggestions in real time during sessions, with UI for participants to review, accept, modify, or reject AI-generated content — embodying strong AI output validation and user accountability principles.",
      "Developed **role-based UI architecture** (Admin, Manager, Participant, Viewer) with precisely scoped permission states, session control flows, and collaborative workspace interfaces.",
      "Built **multi-step onboarding flows**, live session dashboards, goal-tracking interfaces, snapshot comparison views, and PDF export functionality — all responsive and cross-browser compatible.",
      "Integrated REST APIs across **authentication, data submission, session management**, and progress tracking workflows; collaborated closely with backend engineers on API contracts.",
    ],
  },
  {
    role: "Senior Frontend Engineer — Frontend Lead",
    company: "Disrupt.com (Vettio)",
    dates: "Mar 2021 — Jun 2025",
    location: "Karachi, PK",
    bullets: [
      "**Owned the Frontend of a production enterprise SaaS platform** end to end — from Figma wireframes and design system standards through to hand-coded, pixel-perfect React.js implementation — keeping experience consistent across all product touchpoints.",
      "**Hand-coded pixel-perfect HTML5/CSS3/SCSS** and shipped it in React.js and Next.js, maintaining clean, W3C-standard, accessible markup without over-relying on third-party component libraries.",
      "**Turned requirements from product, engineering, and design stakeholders** into wireframes, mockups, and prototypes in Figma, then implemented them with full fidelity in production.",
      "**Built and maintained a design system and shared component library**, ensuring UI consistency across SaaS product surfaces and marketing-adjacent landing pages — reducing delivery time by 40%.",
      "Implemented **WCAG-aligned accessibility practices** — semantic HTML, keyboard navigation, focus management, and colour contrast — ensuring inclusive, standards-compliant interfaces.",
      "Built real-time WebSocket-driven features via LiveKit for live AI voice interview sessions, managing concurrent data streams and complex async UI states.",
      "**Optimised frontend performance** achieving a 35% improvement in Lighthouse/Core Web Vitals scores via SSR/SSG, lazy loading, code splitting, and CDN integration.",
      "**Used AI-assisted tools daily** (Claude, GitHub Copilot, Cursor) to accelerate workflows — with rigorous output validation, logic review, and full ownership of final deliverables.",
      "**Led code reviews**, established frontend engineering standards, and mentored junior developers in Agile/Scrum sprints across product, engineering, and backend stakeholders.",
      "**Maintained CI/CD pipelines** via GitHub Actions and Vercel; improved deployment reliability by 50% across staging and production environments.",
    ],
  },
  {
    role: "Front-End Developer",
    company: "Intersys Ltd",
    dates: "Apr 2019 — Feb 2021",
    location: "Karachi, PK",
    bullets: [
      "Developed dynamic, visually rich web applications using React.js, HTML5, CSS3/SCSS, and Bootstrap — with a strong focus on fluid responsive layouts and smooth interactive experiences.",
      "Implemented CSS animations, hover interactions, and scroll-triggered visual transitions to bring designer mockups to life with high fidelity, including a Pinterest-style visual media platform.",
      "Applied image optimisation, lazy loading, and code splitting to ensure heavy visual assets loaded performantly without degrading animation smoothness or page speed.",
      "Translated Figma and PSD designs into pixel-perfect, responsive interfaces and migrated legacy WordPress frontend to a modern React.js component architecture.",
      "Customised and built WordPress themes from scratch, adapting Figma designs into fully responsive, brand-accurate theme builds.",
    ],
  },
  {
    role: "Front-End Developer",
    company: "Nanosoft",
    dates: "May 2018 — Apr 2019",
    location: "Karachi, PK",
    bullets: [
      "Built responsive, interactive UI components for TaskQue using Angular and TypeScript, with real-time activity updates and animated state transitions for collaborative task tracking.",
      "Integrated REST APIs and real-time notifications, managing dynamic UI state changes and animated feedback patterns using modern JavaScript async patterns.",
      "Customised and built WordPress themes, adapting design mockups into responsive, production-ready theme builds.",
    ],
  },
  {
    role: "UI Developer",
    company: "EFSOL Solution",
    dates: "Mar 2017 — Apr 2018",
    location: "Karachi, PK",
    bullets: [
      "Designed and built responsive marketing websites and landing pages using HTML5, CSS3, JavaScript, and jQuery — with hover effects, scroll animations, and JavaScript-driven UI interactions.",
      "Translated PSD design layouts into pixel-perfect, animated interfaces in close collaboration with designers, ensuring brand precision and motion quality.",
    ],
  },
];

// ---------------------------------------------------------------------------
// About
// ---------------------------------------------------------------------------

export const about = {
  eyebrow: "About me",
  typedRoles: ["Frontend Engineer", "React Developer", "Design Systems", "Real-time UI", "AI Interfaces"],
  paragraphs: [
    "👋 I am Kamran — a senior frontend engineer in Karachi, 07 years into building interfaces for enterprise SaaS, AI products and high-traffic web. I hand-code HTML5, CSS3/SCSS and React rather than leaning on component libraries, which keeps the markup semantic and the build pixel-accurate to the Figma file.",
    "I lead frontend at Digital Gravity on Goalytics, an AI-powered OKR platform — real-time Socket.io sessions, Claude-powered suggestion flows and role-based dashboards. I use AI tools every day, and I review every line they produce before it ships.",
  ],
  education: [
    { degree: "MS Computer Science", school: "Muhammad Ali Jinnah University", dates: "2020 – 2022" },
    { degree: "BS Computer Science", school: "Muhammad Ali Jinnah University", dates: "2013 – 2017" },
  ],
  certifications: [
    { name: "Microsoft MCSA", detail: "Windows Server 2012" },
    { name: "Franklin Covey Academy", detail: "Leadership Certified" },
  ],
};

// ---------------------------------------------------------------------------
// CTA — "Need a frontend that ships?"
// ---------------------------------------------------------------------------

export const cta = {
  badge: "Available for work",
  heading: "Need a frontend that ships?",
  body: "Whether you're launching a small SaaS project, a startup, or a service, I'm here to help. Share your vision with me, and I'll provide an honest assessment of how I can contribute to your frontend development needs.",
  action: "Start a conversation",
};

// ---------------------------------------------------------------------------
// Footer
// ---------------------------------------------------------------------------

export const footer = {
  nav: navLinks,
  workBadge: `+0${selectedWork.length}`,
  social: [
    { label: "LinkedIn", href: profile.links.linkedin },
    { label: "GitHub", href: profile.links.github },
    { label: "Résumé (PDF)", href: profile.links.resume },
  ],
  legal: `Kamran Ali | Senior Frontend Engineer © ${new Date().getFullYear()}`,
};

// ---------------------------------------------------------------------------
// Legacy aliases kept for the LiveKit chat agent tools / API routes that may
// still reference the old flat shape.
// ---------------------------------------------------------------------------

export const skills: string[] = techStackGroups.flatMap((g) => g.tags);

export type Project = {
  name: string;
  description: string;
  tech: string[];
  link?: string;
};

export const projects: Project[] = selectedWork.map((w) => ({
  name: w.name,
  description: w.description,
  tech: w.tags,
}));
