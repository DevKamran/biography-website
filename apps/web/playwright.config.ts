import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  timeout: 60_000,
  // One dev server compiles on demand; more parallel pages than this makes
  // the first page.goto time out rather than test anything.
  workers: 2,
  use: { baseURL: "http://localhost:3100" },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    // Own port so the tests never hit some other app already on :3000.
    command: "npx next dev -p 3100",
    // Chat requests are mocked in the tests. Point server-side fetches (the
    // landing page's blog preview) at a closed port so they fail instantly
    // instead of waiting on whatever remote agent .env.local names.
    env: { RESUME_RAG_API_URL: "http://127.0.0.1:9" },
    url: "http://localhost:3100",
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});
