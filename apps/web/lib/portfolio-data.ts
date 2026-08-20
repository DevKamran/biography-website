// ---------------------------------------------------------------------------
// EDIT THIS FILE with your real information.
// This is the single source of truth for the site's content.
// The agent (apps/agent/data/portfolio.json) mirrors this — keep them in sync,
// or later wire the agent to fetch this via an API route instead of a copy.
// ---------------------------------------------------------------------------

export const profile = {
  name: "Your Name",
  title: "Full Stack Developer", // TODO
  location: "Karachi, Pakistan", // TODO
  bio: "TODO: 2-4 sentences about who you are, what you do, and what you're looking for.",
  email: "you@example.com", // TODO
  links: {
    github: "https://github.com/yourhandle", // TODO
    linkedin: "https://linkedin.com/in/yourhandle", // TODO
    resume: "/resume.pdf", // TODO: drop your resume in /public
  },
};

export const skills: string[] = [
  // TODO: list your real stack
  "TypeScript",
  "React",
  "Next.js",
  "Python",
  "Node.js",
];

export type Project = {
  name: string;
  description: string;
  tech: string[];
  link?: string;
  repo?: string;
};

export const projects: Project[] = [
  // TODO: replace with your real projects
  {
    name: "Project One",
    description: "Short description of what this project does and the problem it solves.",
    tech: ["Next.js", "TypeScript"],
    link: "https://example.com",
    repo: "https://github.com/yourhandle/project-one",
  },
  {
    name: "Project Two",
    description: "Short description of what this project does and the problem it solves.",
    tech: ["Python", "FastAPI"],
    repo: "https://github.com/yourhandle/project-two",
  },
];

export type Experience = {
  role: string;
  company: string;
  dates: string;
  description: string;
};

export const experience: Experience[] = [
  // TODO: replace with your real experience
  {
    role: "Job Title",
    company: "Company Name",
    dates: "2023 — Present",
    description: "Brief description of responsibilities and impact.",
  },
];
