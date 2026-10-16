# Chat widget — accessibility (WCAG 2.2 AA)

The AI chat (`app/components/chat/ChatWidget.tsx`, `lib/use-resume-chat.ts`)
is a non-modal dialog with a message list, a text input and a Send button.
Replies stream in from the agent and can be stopped at any point.

## How it works

- **Streaming.** `POST /api/resume-query/stream` proxies the agent's
  `POST /query/stream` (NDJSON events: `tool` → `delta`… → `done` | `error`).
  If the agent has no streaming endpoint (404), the client falls back to the
  one-shot `/api/resume-query`.
- **Stop.** An `AbortController` cancels the browser request. The Next route
  passes the abort upstream, and the agent cancels the LLM run when the client
  disconnects (`handler.cancel_run()`).
- **States.** The hook exposes `idle | waiting | streaming | stopped | error`.
  The UI and the screen-reader announcements are driven from that one value.

## Criteria addressed

| WCAG 2.2 criterion | How it is met | Tested by |
|---|---|---|
| **1.3.1 Info and Relationships** | Messages are an `<ol>` of `<li>`s. Each one starts with visually hidden "You said:" / "Kamran Ali said:", so the speaker doesn't depend on bubble side or colour. Real `<label>` on the textarea, `<h2>` names the dialog, agent bullets render as real `<ul>`s. | axe; Playwright (role/name queries) |
| **1.4.1 Use of Color** | Error state uses an icon and the word "Error:", not only red. Stopped replies carry the text "Response stopped." | Playwright; manual review |
| **1.4.3 Contrast (Minimum)** | All text token pairs ≥ 4.5:1 in both themes (lowest: 4.57:1, accent link on sunken bg, light theme). | `node scripts/check-contrast.mjs`; axe in every chat state, both themes |
| **1.4.4 Resize Text** | Rem/Tailwind sizing; nothing is fixed-height for text. Panel height is capped to the viewport. | Playwright at 320×256 (= 1280×1024 at 400%); manual Ctrl + to 200% / 400% |
| **1.4.10 Reflow** | Panel goes full-width below `sm`, `max-h: 100dvh - 1.5rem`, long words break, the input auto-grows to 128px then scrolls. No horizontal scroll at 320 CSS px. | Playwright (320×640 and 320×256: panel in viewport, `scrollWidth ≤ 320`, input/Send/Close fully visible) |
| **1.4.11 Non-text Contrast** | Input border ≥ 3.25:1, focus ring ≥ 4.57:1, icon buttons ≥ 5.16:1 against adjacent colours, both themes. | `scripts/check-contrast.mjs` |
| **1.4.12 Text Spacing** | No clipped containers. | Playwright injects the 1.4.12 spacing CSS and checks nothing overflows |
| **1.4.13 Content on Hover or Focus** | No hover/focus-only content. | Manual review |
| **2.1.1 Keyboard** | Everything works from the keyboard. Enter sends, Shift+Enter adds a new line (IME composition is respected), Escape stops a reply in progress or closes the chat, and Minimize/Close/Retry are buttons. The conversation region is focusable so long history can be scrolled with arrow keys. | Playwright keyboard-only flow (no clicks) |
| **2.1.2 No Keyboard Trap** | Non-modal dialog: Tab and Shift+Tab move in and out freely. | Playwright tab-order test |
| **2.2.2 Pause, Stop, Hide** | Streaming text can be stopped (Stop button / Escape). Decorative pulses respect reduced motion. | Playwright stop tests |
| **2.3.3 Animation from Interactions** (AAA, done anyway) / motion preference | All chat animations use `motion-safe:`. Auto-scroll is instant instead of smooth when `prefers-reduced-motion: reduce`. "Thinking…" is text, not only animated dots. | Playwright with `reducedMotion: 'reduce'`: zero running animations while waiting or streaming |
| **2.4.3 Focus Order** | Opening moves focus to the input. Closing returns it to whatever opened the chat. Send and Stop are **one** button that changes label, so focus never jumps or drops when a reply starts or ends. Retry moves focus to the input before its button disappears. | Playwright focus assertions after open/close/send/stop/retry |
| **2.4.7 Focus Visible** / **2.4.11 Focus Not Obscured (Minimum)** | Global 2px `:focus-visible` outline in the accent colour with 2px offset. The panel sits above the sticky header (`z-[110]`). | Playwright: every focused control is fully in the viewport and has a non-`none` outline |
| **2.5.3 Label in Name** | Visible text matches accessible names ("Retry", "Chat with my AI"). | axe |
| **2.5.8 Target Size (Minimum)** | All chat controls ≥ 24×24 px (icon buttons 32px, Send/Stop 36px, Retry 32px tall). | Playwright measures every button and the textarea |
| **3.2.2 On Input** | Typing never submits or changes context. Only Enter or the Send button does. | Playwright |
| **3.3.1 Error Identification** | Failures show an inline `role="alert"` box: "Error: …", the cause in plain words (offline / unavailable / interrupted / rate-limited), and a **Retry** button that resends the same question without duplicating it. Empty submit or submitting mid-reply gives an explicit hint linked to the input via `aria-describedby`. | Playwright: 502, network failure, mid-stream cut-off, Retry, empty submit |
| **3.3.2 Labels or Instructions** | Textarea is labelled "Message Kamran Ali's AI" and described by "Enter sends. Shift plus Enter adds a new line." The dialog description explains Escape. | Playwright `toHaveAccessibleDescription` |
| **4.1.2 Name, Role, Value** | `role="dialog"` with `aria-labelledby`/`aria-describedby`; Minimize has `aria-expanded` + `aria-controls`; Send/Stop name reflects its state. | axe; Playwright |
| **4.1.3 Status Messages** | One polite `role="status"` region, which is always mounted, so it is announced reliably. It says: "…is thinking. Press Escape to stop." → the tool being used ("Searching my resume…") → **the complete reply, once** → or "Response stopped." Streaming text is **not** announced piece by piece (that floods the speech queue and gets cut off). Instead the in-progress bubble has `aria-busy="true"`. Errors use a separate, always-mounted `role="alert"`. Focus stays in the input throughout. | Playwright records every live-region change and asserts the exact sequence (no partial-text announcements) |

## How it was tested

**Automated** (`npm run test:a11y` in `apps/web`, 22 Playwright tests, Chromium):

- axe-core with tags `wcag2a, wcag2aa, wcag21a, wcag21aa, wcag22aa`, on the
  landing page and on the open chat in every state (waiting, streaming,
  stopped, error), in dark and light themes.
- Behaviour tests with the agent mocked in the page. `fetch` returns a timed
  `ReadableStream`, so streaming is truly incremental and can be stopped
  partway through. Covered: the keyboard-only flow and tab order, Escape
  stop/close, the Stop button by keyboard, error + Retry, network failure,
  fallback to the non-streaming endpoint, the live-region announcement
  sequence, reflow at 320px and at 400% zoom, text spacing, reduced motion,
  target size, and focus not obscured.
- `node scripts/check-contrast.mjs`: computes ratios for the actual colour
  tokens in `app/globals.css`, both themes, and fails on anything below AA.
- The full suite was run twice back to back with no failures.

**End to end against the real agent** (local FastAPI + Gemini, no mocks):

- A streamed answer arrived through the Next proxy as separate events, and
  the live region announced the full reply once.
- Escape stopped a second reply.
- Disconnecting the client cancelled the agent's run. Confirmed in the agent
  process: `done=False` before cancelling, `done=True` after.

**Manual — still to do by a person** (automation can't hear a screen reader):

| Check | Setup | Result |
|---|---|---|
| Ask a question, listen while it streams, stop one, trigger an error (offline in DevTools), read history with list/item navigation | NVDA + Chrome / Firefox (Windows) | _pending_ |
| Same | VoiceOver + Safari (macOS) | _pending_ |
| Same, plus touch targets | VoiceOver iOS / TalkBack Android | _pending_ |
| Browser zoom 200% and 400%, OS large text | Chrome, Safari | _pending_ |
| OS "Reduce motion" on | macOS / Windows | _pending_ |

## Known limits

- **Streaming on the deployed agent.** The AWS Lambda Function URL must use
  `InvokeMode: RESPONSE_STREAM` (with Lambda Web Adapter in response-stream
  mode) for `/query/stream` to stream. Until then, a 404 falls back to the
  one-shot endpoint automatically. A buffered 200 would still work, just
  without incremental text.
- Screen-reader output differs between products. The announcement strategy
  here (one start notice, one complete reply) is chosen to behave the same
  across them, but it has not yet been verified by ear (see the manual table).
- Windows High Contrast / `forced-colors` is not required for AA and has not
  been tested.
