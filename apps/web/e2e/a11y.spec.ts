import { test, expect, type Locator, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const WCAG_22_AA = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

async function gotoLanding(page: Page, theme: "dark" | "light" = "dark") {
  await page.addInitScript((t) => window.localStorage.setItem("theme", t), theme);
  await page.goto("/");
  // Wait for the preloader to finish so axe sees the real page.
  await expect(page.locator("html.preload-lock")).toHaveCount(0, { timeout: 15_000 });
  // The saved theme is applied after hydration with a colour transition; let
  // finite CSS transitions/animations settle so axe measures the final colours.
  await page.waitForFunction(() =>
    document.getAnimations().every((a) => a.playState !== "running" || a.effect?.getTiming().iterations === Infinity)
  );
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

// ---------------------------------------------------------------------------
// Chat widget. The agent is mocked in the page: window.fetch is replaced for
// /api/resume-query/stream with a ReadableStream that sends NDJSON events on a
// timer, so the tests see real incremental streaming (route.fulfill can only
// deliver a body all at once) and can stop a reply halfway through.
// ---------------------------------------------------------------------------

type StreamEvent = { type: "tool"; name: string } | { type: "delta"; text: string } | { type: "done"; answer: string };
type MockResponse =
  | { kind: "stream"; events: StreamEvent[]; delayMs?: number }
  | { kind: "status"; status: number }
  | { kind: "network-error" };

const ANSWER = "I have **7+ years** of frontend experience.";
const STREAMED: StreamEvent[] = [
  { type: "tool", name: "resume_qa" },
  { type: "delta", text: "I have **7+ years** " },
  { type: "delta", text: "of frontend " },
  { type: "delta", text: "experience." },
  { type: "done", answer: ANSWER },
];
const OK: MockResponse = { kind: "stream", events: STREAMED, delayMs: 150 };

/** Installs the fetch mock (one response per request, last one repeats) and
 * records every text the chat's live region is given, in order. */
async function mockChat(page: Page, responses: MockResponse[]) {
  await page.addInitScript((responses: MockResponse[]) => {
    const w = window as unknown as { __chatRequests: number; __announcements: string[] };
    w.__chatRequests = 0;
    w.__announcements = [];
    const realFetch = window.fetch.bind(window);

    window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
      if (!url.includes("/api/resume-query/stream")) return realFetch(input, init);
      const res = responses[Math.min(w.__chatRequests++, responses.length - 1)];
      if (res.kind === "network-error") throw new TypeError("Failed to fetch");
      if (res.kind === "status") return new Response('{"error":"x"}', { status: res.status });

      const signal = init?.signal;
      const encoder = new TextEncoder();
      return new Response(
        new ReadableStream({
          async start(controller) {
            signal?.addEventListener("abort", () => {
              try {
                controller.error(new DOMException("Aborted", "AbortError"));
              } catch {}
            });
            for (const event of res.events) {
              await new Promise((r) => setTimeout(r, res.delayMs ?? 150));
              if (signal?.aborted) return;
              controller.enqueue(encoder.encode(JSON.stringify(event) + "\n"));
            }
            controller.close();
          },
        }),
        { headers: { "Content-Type": "application/x-ndjson" } }
      );
    };

    let last = "";
    new MutationObserver(() => {
      const text = document.querySelector("#chat-panel [role=status]")?.textContent ?? "";
      if (text && text !== last) w.__announcements.push(text);
      last = text;
    }).observe(document, { subtree: true, childList: true, characterData: true });
  }, responses);
}

const announcements = (page: Page) => page.evaluate(() => (window as unknown as { __announcements: string[] }).__announcements);

/** Message text also appears in the live region, so look inside the conversation. */
const convo = (dialog: Locator) => dialog.getByRole("region", { name: "Conversation" });

async function openChat(page: Page) {
  await page.getByRole("button", { name: "Chat with my AI" }).focus();
  await page.keyboard.press("Enter");
  const dialog = page.getByRole("dialog", { name: /AI assistant chat/ });
  const input = dialog.getByRole("textbox", { name: /Message .*'s AI/ });
  await expect(input).toBeFocused();
  return { dialog, input };
}

async function ask(page: Page, question = "How much experience do you have?") {
  const { dialog, input } = await openChat(page);
  await page.keyboard.type(question);
  await page.keyboard.press("Enter");
  return { dialog, input };
}

test.describe("chat widget — keyboard and screen reader", () => {
  test("dialog is named, input is labelled, focus moves in and back out", async ({ page }) => {
    await mockChat(page, [OK]);
    await gotoLanding(page);
    const { dialog } = await openChat(page);
    await expect(dialog.getByRole("textbox")).toHaveAccessibleDescription(/Enter sends\. Shift plus Enter adds a new line\./);

    await page.keyboard.press("Escape");
    await expect(dialog).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Chat with my AI" })).toBeFocused();
  });

  test("whole conversation works with the keyboard alone, with no focus trap", async ({ page }) => {
    await mockChat(page, [OK]);
    await gotoLanding(page);
    const { dialog, input } = await openChat(page);

    // Shift+Enter makes a new line instead of sending.
    await page.keyboard.type("Line one");
    await page.keyboard.press("Shift+Enter");
    await page.keyboard.type("Line two");
    await expect(input).toHaveValue("Line one\nLine two");
    await page.keyboard.press("Enter");
    await expect(dialog.getByRole("listitem").filter({ hasText: "You said:" })).toContainText("Line one");
    await expect(convo(dialog).getByText("7+ years")).toBeVisible();

    // Tab reaches every control in order, then leaves the non-modal dialog.
    await expect(input).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(dialog.getByRole("button", { name: "Send message" })).toBeFocused();
    await page.keyboard.press("Shift+Tab");
    await page.keyboard.press("Shift+Tab");
    await expect(dialog.getByRole("region", { name: "Conversation" })).toBeFocused();
    await page.keyboard.press("Shift+Tab");
    await expect(dialog.getByRole("button", { name: "Close chat" })).toBeFocused();
    await page.keyboard.press("Shift+Tab");
    await expect(dialog.getByRole("button", { name: "Minimize chat" })).toBeFocused();

    // Minimize and restore by keyboard; the draft and history survive.
    await page.keyboard.press("Enter");
    await expect(dialog.getByRole("button", { name: "Restore chat" })).toHaveAttribute("aria-expanded", "false");
    await expect(input).toBeHidden();
    await page.keyboard.press("Enter");
    await expect(input).toBeVisible();
    await expect(convo(dialog).getByText("7+ years")).toBeVisible();
  });

  test("streaming reply: announced once when complete, never piece by piece", async ({ page }) => {
    await mockChat(page, [OK]);
    await gotoLanding(page);
    const { dialog, input } = await ask(page);

    // While text arrives the bubble is aria-busy and the button is Stop.
    const bubble = dialog.locator("[aria-busy=true]");
    await expect(bubble).toContainText("7+ years");
    await expect(dialog.getByRole("button", { name: "Stop response" })).toBeVisible();

    await expect(dialog.locator("[aria-busy=true]")).toHaveCount(0);
    await expect(dialog.getByRole("button", { name: "Send message" })).toBeVisible();
    await expect(input).toBeFocused();

    await expect.poll(() => announcements(page)).toEqual([
      "Kamran Ali's AI is thinking. Press Escape to stop.",
      "Searching my resume…",
      "Kamran Ali said: I have 7+ years of frontend experience.",
    ]);
    await expect(dialog.getByRole("listitem").first()).toContainText("You said:");
  });

  test("Escape stops a reply in progress, keeps the partial text, then closes", async ({ page }) => {
    await mockChat(page, [{ kind: "stream", events: STREAMED, delayMs: 600 }]);
    await gotoLanding(page);
    const { dialog, input } = await ask(page);

    await expect(dialog.locator("[aria-busy=true]")).toContainText("7+ years");
    await page.keyboard.press("Escape");

    await expect(dialog).toBeVisible();
    await expect(convo(dialog).getByText("Response stopped.")).toBeVisible();
    await expect(convo(dialog).getByText("7+ years")).toBeVisible();
    await expect(convo(dialog).getByText("experience.")).toHaveCount(0);
    await expect(input).toBeFocused();
    await expect.poll(async () => (await announcements(page)).at(-1)).toBe(
      "Response stopped. The partial reply is kept in the conversation."
    );

    // Nothing in progress now, so Escape closes the chat.
    await page.keyboard.press("Escape");
    await expect(dialog).toHaveCount(0);
  });

  test("Stop button works by keyboard and keeps focus in place", async ({ page }) => {
    await mockChat(page, [{ kind: "stream", events: STREAMED, delayMs: 800 }, OK]);
    await gotoLanding(page);
    const { dialog } = await ask(page);

    await page.keyboard.press("Tab");
    const button = dialog.locator("form button");
    await expect(button).toHaveAccessibleName("Stop response");
    await expect(button).toBeFocused();
    await page.keyboard.press("Enter");

    await expect(button).toHaveAccessibleName("Send message");
    await expect(button).toBeFocused();
    await expect(convo(dialog).getByText(/Response stopped/)).toBeVisible();

    // The conversation carries on normally afterwards.
    await page.keyboard.press("Shift+Tab");
    await page.keyboard.type("And again?");
    await page.keyboard.press("Enter");
    await expect(convo(dialog).getByText("experience.")).toBeVisible();
  });

  test("server error shows an alert with Retry that resends the question", async ({ page }) => {
    await mockChat(page, [{ kind: "status", status: 502 }, OK]);
    await gotoLanding(page);
    const { dialog, input } = await ask(page);

    const alert = dialog.getByRole("alert");
    await expect(alert).toContainText("Error: The assistant is unavailable right now. Try again in a moment.");
    await expect(dialog.getByRole("listitem").filter({ hasText: "You said:" })).toHaveCount(1);
    await expect(input).toBeFocused();

    await alert.getByRole("button", { name: "Retry" }).focus();
    await page.keyboard.press("Enter");
    await expect(input).toBeFocused();
    await expect(alert).toBeEmpty();
    await expect(convo(dialog).getByText("7+ years")).toBeVisible();
    // Retry doesn't duplicate the question.
    await expect(dialog.getByRole("listitem").filter({ hasText: "You said:" })).toHaveCount(1);
  });

  test("network failure explains the problem", async ({ page }) => {
    await mockChat(page, [{ kind: "network-error" }]);
    await gotoLanding(page);
    const { dialog } = await ask(page);
    await expect(dialog.getByRole("alert")).toContainText("Couldn't connect to the assistant. Check your connection and try again.");
  });

  test("falls back to the one-shot endpoint when streaming isn't available", async ({ page }) => {
    await mockChat(page, [{ kind: "status", status: 404 }]);
    await page.route("**/api/resume-query", (route) => route.fulfill({ json: { answer: ANSWER } }));
    await gotoLanding(page);
    const { dialog } = await ask(page);
    await expect(convo(dialog).getByText("7+ years")).toBeVisible();
    await expect.poll(async () => (await announcements(page)).at(-1)).toBe(
      "Kamran Ali said: I have 7+ years of frontend experience."
    );
  });

  test("empty and mid-reply submits explain themselves instead of doing nothing", async ({ page }) => {
    await mockChat(page, [{ kind: "stream", events: STREAMED, delayMs: 800 }]);
    await gotoLanding(page);
    const { dialog, input } = await openChat(page);
    await page.keyboard.press("Enter");
    await expect(input).toHaveAccessibleDescription(/Type a message first\./);

    await page.keyboard.type("Hi");
    await page.keyboard.press("Enter");
    await page.keyboard.type("Second");
    await page.keyboard.press("Enter");
    await expect(input).toHaveValue("Second");
    await expect(input).toHaveAccessibleDescription(/Wait for the reply to finish, or press Escape to stop it\./);
    await expect(dialog.getByRole("listitem").filter({ hasText: "You said:" })).toHaveCount(1);
  });
});

test.describe("chat widget — visual: contrast, reflow, zoom, motion, targets", () => {
  for (const theme of ["dark", "light"] as const) {
    test(`no axe violations while waiting, streaming, stopped and errored (${theme})`, async ({ page }) => {
      await mockChat(page, [{ kind: "stream", events: STREAMED, delayMs: 700 }, { kind: "status", status: 500 }]);
      await gotoLanding(page, theme);
      const { dialog } = await ask(page);

      await expect(convo(dialog).getByText("Thinking…")).toBeVisible();
      await expectNoAxeViolations(page, "#chat-panel");
      await expect(dialog.locator("[aria-busy=true]")).toBeVisible();
      await expectNoAxeViolations(page, "#chat-panel");
      await page.keyboard.press("Escape");
      await expect(convo(dialog).getByText("Response stopped.")).toBeVisible();
      await expectNoAxeViolations(page, "#chat-panel");
      await page.keyboard.type("Again");
      await page.keyboard.press("Enter");
      await expect(dialog.getByRole("alert")).toContainText("Error:");
      await expectNoAxeViolations(page, "#chat-panel");
    });
  }

  // 320 x 256 CSS px is what a 1280 x 1024 window shows at 400% zoom (1.4.10, 1.4.4).
  for (const [label, size] of [["320px wide", { width: 320, height: 640 }], ["400% zoom", { width: 320, height: 256 }]] as const) {
    test(`chat reflows with no horizontal scroll at ${label}`, async ({ page }) => {
      await mockChat(page, [OK]);
      await page.setViewportSize(size);
      await gotoLanding(page);
      const { dialog } = await ask(page, "A long question that needs to wrap onto several lines without scrolling sideways");
      await expect(convo(dialog).getByText("experience.")).toBeVisible();

      const box = (await page.locator("#chat-panel").boundingBox())!;
      expect(box.x).toBeGreaterThanOrEqual(0);
      expect(box.x + box.width).toBeLessThanOrEqual(size.width);
      expect(box.y).toBeGreaterThanOrEqual(0);
      expect(box.y + box.height).toBeLessThanOrEqual(size.height);
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(size.width);
      for (const control of [dialog.getByRole("textbox"), dialog.getByRole("button", { name: "Send message" }), dialog.getByRole("button", { name: "Close chat" })]) {
        await expect(control).toBeInViewport({ ratio: 1 });
      }
    });
  }

  test("text spacing overrides don't clip chat content (1.4.12)", async ({ page }) => {
    await mockChat(page, [OK]);
    await gotoLanding(page);
    await page.addStyleTag({
      content: "* { line-height: 1.5 !important; letter-spacing: 0.12em !important; word-spacing: 0.16em !important; } p { margin-bottom: 2em !important; }",
    });
    const { dialog } = await ask(page);
    await expect(convo(dialog).getByText("experience.")).toBeVisible();
    const clipped = await page.$$eval("#chat-panel button, #chat-panel textarea, #chat-panel li > div", (els) =>
      els.filter((el) => el.scrollWidth > el.clientWidth + 1).map((el) => el.outerHTML.slice(0, 80))
    );
    expect(clipped).toEqual([]);
  });

  test("reduced motion turns off chat animations", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await mockChat(page, [{ kind: "stream", events: STREAMED, delayMs: 700 }]);
    await gotoLanding(page);
    const { dialog } = await ask(page);
    await expect(convo(dialog).getByText("Thinking…")).toBeVisible();
    const animated = await page.$$eval("#chat-panel *", (els) =>
      els.filter((el) => getComputedStyle(el).animationName !== "none").map((el) => el.className)
    );
    expect(animated).toEqual([]);
    await expect(dialog.locator("[aria-busy=true]")).toBeVisible();
    const animatedWhileStreaming = await page.$$eval("#chat-panel *", (els) =>
      els.filter((el) => getComputedStyle(el).animationName !== "none").length
    );
    expect(animatedWhileStreaming).toBe(0);
  });

  test("every chat control is at least 24x24 px (2.5.8) and focus is never hidden (2.4.11)", async ({ page }) => {
    await mockChat(page, [{ kind: "status", status: 500 }]);
    await gotoLanding(page);
    const { dialog } = await ask(page);
    await expect(dialog.getByRole("alert")).toContainText("Error:");

    const small = await page.$$eval("#chat-panel button, #chat-panel textarea", (els) =>
      els.map((el) => el.getBoundingClientRect()).filter((r) => r.width < 24 || r.height < 24)
    );
    expect(small).toEqual([]);

    // Walk focus through the whole panel; each focused control is fully on screen.
    await dialog.getByRole("button", { name: "Minimize chat" }).focus();
    for (let i = 0; i < 6; i++) {
      await expect(page.locator(":focus")).toBeInViewport({ ratio: 1 });
      const outline = await page.evaluate(() => getComputedStyle(document.activeElement!).outlineStyle);
      expect(outline).not.toBe("none");
      await page.keyboard.press("Tab");
      if (!(await page.evaluate(() => !!document.activeElement?.closest("#chat-panel")))) break;
    }
  });
});
