// Exports the site's content (apps/web/lib/portfolio-data.ts) as JSON for the
// Python agent to read directly, instead of a hand-maintained duplicate.
// Run via `npm run export:portfolio` after editing portfolio-data.ts.
import { writeFileSync } from "fs";
import { resolve } from "path";
import { about, experience, profile, projects, skills } from "../lib/portfolio-data";

const data = { profile, about, skills, experience, projects };

const outPath = resolve(__dirname, "../../agent/data/portfolio.json");
writeFileSync(outPath, JSON.stringify(data, null, 2) + "\n");

console.log(`Wrote ${outPath}`);
