import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const WCAG_22_AA = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

async function gotoLanding(page: Page, theme: "dark" | "light" = "dark") {
  await page.addInitScript((t) => window.localStorage.setItem("theme", t), theme);
  await page.goto("/");
  // Wait for the preloader to finish so axe sees the real page.
  await expect(page.locator("html.preload-lock")).toHaveCount(0, { timeout: 15_000 });
}

async function expectNoAxeViolations(page: Page, include?: string) {
  let builder = new AxeBuilder({ page }).withTags(WCAG_22_AA);
  if (include) builder = builder.include(include);
  const { violations } = await builder.analyze();
  const summary = violations.map((v) => `${v.id} (${v.impact}): ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`);
  expect(summary).toEqual([]);
}

for (const theme of ["dark", "light"] as const) {
  test(`landing page has no WCAG 2.2 AA axe violations (${theme})`, async ({ page }) => {
    await gotoLanding(page, theme);
    await expectNoAxeViolations(page);
  });

  test(`open chat has no WCAG 2.2 AA axe violations (${theme})`, async ({ page }) => {
    await gotoLanding(page, theme);
    await page.getByRole("button", { name: "Chat with my AI" }).click();
    await expectNoAxeViolations(page, "#chat-panel");
  });
}

test("skip link is the first tab stop and moves focus to main", async ({ page }) => {
  await gotoLanding(page);
  await page.keyboard.press("Tab");
  const skip = page.getByRole("link", { name: "Skip to main content" });
  await expect(skip).toBeFocused();
  await skip.press("Enter");
  await expect(page.locator("#main-content")).toBeFocused();
});

test("closed mobile menu links are not in the tab order", async ({ page }) => {
  await gotoLanding(page);
  await expect(page.locator("#site-nav-overlay")).toHaveJSProperty("inert", true);
  await page.getByRole("button", { name: "Open menu" }).click();
  await expect(page.locator("#site-nav-overlay a").first()).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("button", { name: "Open menu" })).toBeFocused();
});

test.describe("chat widget — screen reader and keyboard", () => {
  test.beforeEach(async ({ page }) => {
    await page.route("**/api/resume-query", async (route) => {
      await new Promise((r) => setTimeout(r, 300));
      await route.fulfill({ json: { answer: "I have **7+ years** of frontend experience." } });
    });
    await gotoLanding(page);
  });

  test("dialog is named, input is labelled, focus moves in and back out", async ({ page }) => {
    const launcher = page.getByRole("button", { name: "Chat with my AI" });
    await launcher.focus();
    await page.keyboard.press("Enter");

    const dialog = page.getByRole("dialog", { name: /AI assistant chat/ });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole("textbox", { name: /Message .*'s AI/ })).toBeFocused();

    await page.keyboard.press("Escape");
    await expect(dialog).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Chat with my AI" })).toBeFocused();
  });

  test("replies are announced through a live region without moving focus", async ({ page }) => {
    await page.getByRole("button", { name: "Chat with my AI" }).click();
    const dialog = page.getByRole("dialog", { name: /AI assistant chat/ });
    const input = dialog.getByRole("textbox", { name: /Message/ });
    const live = dialog.getByRole("status");

    await input.fill("How much experience do you have?");
    await input.press("Enter");

    await expect(live).toContainText(/thinking/i);
    await expect(live).toContainText("said: I have 7+ years of frontend experience.");
    await expect(input).toBeFocused();
    // Each message names its sender for screen readers.
    await expect(dialog.getByRole("listitem").first()).toContainText("You said:");
  });

  test("chat panel reflows at 320px wide (WCAG 1.4.10)", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 640 });
    await page.getByRole("button", { name: "Chat with my AI" }).click();
    const box = await page.locator("#chat-panel").boundingBox();
    expect(box!.x).toBeGreaterThanOrEqual(0);
    expect(box!.x + box!.width).toBeLessThanOrEqual(320);
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(scrollWidth).toBeLessThanOrEqual(320);
  });
});
