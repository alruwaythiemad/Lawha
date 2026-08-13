---
baseline_commit: NO_VCS
---

# Story 1.4: Accessibility & RTL Enforcement for the Shell

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As an owner,
I want the console to work correctly with a screen reader and full keyboard navigation in both languages,
so that the product doesn't silently fail people who rely on assistive technology.

## Acceptance Criteria

1. **Given** any interactive element in the shell
   **When** it receives focus
   **Then** a visible focus ring is shown and never suppressed or replaced by a background change alone.

2. **Given** the interface direction is RTL
   **When** a user tabs through the page
   **Then** DOM order matches visual order — enforced by CI rejecting `order`, `row-reverse`/`column-reverse`, `grid-template-areas`, or explicit grid placement in any component with more than one focusable element.

3. **Given** a global status announcer is mounted
   **When** any state changes anywhere in the shell
   **Then** it is announced via `role="status"` with `aria-atomic="true"`, with `role="alert"` reserved for optimistic-rollback failures only.

4. **Given** a target is interactive
   **When** rendered at any breakpoint
   **Then** it is at least 44px in its minimum dimension.

5. **Given** the shell is evaluated for WCAG 2.2 AA
   **When** tested across English/Arabic and light/dark
   **Then** it passes, with the claim explicitly scoped to `apps/console` and `apps/player` — the hosted authentication surface is excluded pending its own audit (UX-DR12).

**Scope boundary (binding, not a numbered AC):** this story hardens the shell chrome built in Story 1.3 (nav rail/sheet, skip link, three landmarks, language/theme switch) plus the 7 placeholder destination pages — it does not build any destination's real content, and it does not perform the UX-DR12 Clerk accessibility audit (a separate, product-owner-gated item). `apps/player` currently has no real UI (see Dev Notes → apps/player status) — this story's AC5 claim over `apps/player` is limited to wiring the new lint rule into its config for when Epic 3 lands; there is nothing to manually audit there yet. Auth still doesn't exist (Story 1.5 backlog) — the shell still renders unconditionally.

## Tasks / Subtasks

- [x] **Task 1 — Focus-ring audit and regression guard (AC: 1)**
  - [x] Confirm every interactive element already built in Story 1.3's shell carries a visible, never-suppressed focus ring. As of this story's creation, all of them already use `focus-visible:outline-2 focus-visible:outline-electric focus-visible:outline-offset-2` (`{components.focus-ring}`, `packages/tokens/src/components.ts:43-47`) inline in their class strings: skip link (`app/(console)/layout.tsx:21`), nav sheet trigger (`nav-sheet.tsx`), both nav-item states (`nav-list.tsx:30,32`), language switch, theme switch. This task is a **verification + audit** pass, not new styling — walk each of the six files above and confirm none suppresses `outline` with `outline-none`/`focus:outline-none` anywhere, and none relies on a background-colour change alone to indicate focus (a background-only change fails AC1 even where a ring exists elsewhere).
  - [x] Any element found on or adjacent to a signal fill (none currently exist in the shell, but check `NavList`'s active-state inversion, `bg-foreground`) must use `{components.focus-ring-on-signal}` (`packages/tokens/src/components.ts:48-54`, double ring) instead of the plain ring — re-read that token's own `note` field before deciding either way.
  - [x] Do not add a new ESLint rule for this AC — it's a design-token compliance check, already partially covered by `lawha/no-literal-design-values` for colour/radius. Verify by manual keyboard tab-through (Task 5) rather than inventing lint tooling redundant with AC2's rule (Task 2).

- [x] **Task 2 — New ESLint rule: DOM order matches visual order (AC: 2)**
  - [x] Add `tools/eslint-plugin-lawha/rules/no-dom-order-inversion.js`, following the exact module shape of `no-physical-direction-properties.js` (default-exports `{ meta: { type: 'problem', docs: { description }, schema: [], messages: { <id>: '<text with {{placeholders}}>' } }, create(context) { return { <visitor>(node) {...} } } }`, reporting via `context.report({ node, messageId, data })`). `no-physical-direction-properties.js:9-12`'s own header comment names this exact gap as "Story 1.4's lint gate" — read that file first for the established pattern (Tailwind-class-string scanning) before writing the new one.
  - [x] The rule must flag, in any JSX element with more than one focusable descendant: (a) the CSS/Tailwind `order` property or `order-*` class, (b) `flex-row-reverse`/`flex-col-reverse` (or bare `row-reverse`/`column-reverse` in inline styles), (c) `grid-template-areas` (class or inline style), (d) explicit grid line placement (`grid-column`/`grid-row`/`col-start-*`/`row-start-*`-family classes or inline styles). DESIGN.md's mechanical spec (line 484, quoted below) is the binding source — this is deliberately more surface area than `no-physical-direction-properties` covers, since `order`/`row-reverse` are direction-adjacent but not literal `left`/`right` properties, hence the separate rule.
  - [x] "More than one focusable descendant" is a heuristic, not a full accessibility-tree computation — detect via JSX descendant elements that are natively focusable (`a[href]`, `button`, `input`, `select`, `textarea`, elements with a `tabIndex` prop) or carry `role="button"`/similar interactive ARIA roles. If a reliable static count isn't feasible for a given JSX shape, prefer flagging the disallowed property unconditionally within any component file rather than silently under-enforcing — false positives here are cheap (an occasional disable comment), false negatives defeat the AC.
  - [x] Register the rule in `tools/eslint-plugin-lawha/index.js` (add the import + one `rules` map entry, same pattern as the three existing rules) and add `'lawha/no-dom-order-inversion': 'error'` to the `rules` block in **both** `apps/console/eslint.config.mjs` (`files: ['app/**/*.{ts,tsx}']`) and `apps/player/eslint.config.mjs` (`files: ['src/**/*.{ts,tsx}']`) — both files already exist and already list the other three `lawha/*` rules in the identical pattern; just add the fourth line to each.
  - [x] Write a `no-dom-order-inversion.test.js` beside the rule, following `no-physical-direction-properties.test.js`'s exact Vitest + ESLint `RuleTester` pattern (`RuleTester.describe/it = describe/it`, one `ruleTester.run(...)` call, `languageOptions: { ecmaVersion: 2022, sourceType: 'module', parserOptions: { ecmaFeatures: { jsx: true } } }`). Cover all four disallowed forms in `invalid`, plus valid cases using source-order/logical-property reflow only.
  - [x] Audit the current shell (`nav-rail.tsx`, `nav-sheet.tsx`, `nav-list.tsx`, `layout.tsx`, both switches) against the new rule once wired — as of Story 1.3's completion none of these use `order`, `row-reverse`, `grid-template-areas`, or explicit grid placement (confirmed during this story's research), so the rule should pass clean with zero disable comments needed. If it doesn't, fix the violation rather than suppressing it.

- [x] **Task 3 — Global status announcer (AC: 3)**
  - [x] Build a new client component, e.g. `apps/console/app/(console)/status-announcer.tsx` exporting `StatusAnnouncer`, mounted exactly once in `app/(console)/layout.tsx` — no shell status-announcement mechanism exists yet (confirmed: none of the six existing shell files use `role="status"`/`aria-live`/`role="alert"` anywhere). Mount it as a sibling of `<header>`/the `<div className="flex">` block, before `<main>` in source order, consistent with how `lang`/`dir`/`data-theme` are decided once at the root (AD-21's pattern, applied here to status).
  - [x] Implementation contract, per EXPERIENCE.md's Accessibility Floor (quoted verbatim below): one global region, `role="status"` + `aria-atomic="true"` for ordinary state changes; a documented politeness contract (i.e. `aria-live="polite"` is `role="status"`'s implicit value — don't override it to `assertive` for the default path). `role="alert"` (implicitly `aria-live="assertive"`) is reserved **only** for optimistic-rollback failures — EXPERIENCE.md's Truth Contract section defines a rollback as: the UI applied a change optimistically, the server rejected it, and the UI reverted. Model this as two distinct announcement entry points (e.g. `announce(message)` for `status` and `announceAlert(message)` for the rollback case), likely via a small context/hook so any future component (this story's own scope is limited to what exists in the shell today, but the mechanism must be reusable by later stories) can call it without re-deriving the pattern.
  - [x] This story's own shell has no optimistic-UI flows yet (those arrive with real data in later epics per UX-DR1) — so there is nothing in-scope today to wire *into* `announceAlert`. Build the mechanism and its two entry points; do not fabricate a call site. If a demonstrable call site is needed to prove the mechanism works, the language/theme switch's Server Action round-trip (Story 1.3, `app/(console)/actions.ts`) is a reasonable, real, already-existing state change to wire into `announce()` — confirm this is in scope by checking whether it materially changes Story 1.3's file list before doing so; if uncertain, build the announcer as a standalone, tested primitive and note the absence of a current call site rather than inventing one.
  - [x] EXPERIENCE.md also names an `aria-busy` requirement (line 249 area) for in-flight states — check that passage in full before implementing announce timing, since a naive "announce on every render" approach will spam the announcer.
  - [x] Extend `packages/i18n`'s catalogues if the announcer needs any of its own user-visible copy (e.g. a generic "content updated" fallback) — through `format()`, per AD-22, no hardcoded strings, matching every other shell string in this codebase.

- [x] **Task 4 — Target-size audit at every breakpoint (AC: 4)**
  - [x] Confirm every interactive element in the shell is ≥44px in its minimum dimension at 1440px, 800px (mid-range), and 390px — Story 1.3's Task 6 already verified this at those same three widths for a *different* purpose (rail/sheet swap); re-verify specifically for target size here. Elements to check: skip link (only visible on focus, but must still meet size when focused), header's language/theme switches, nav-rail items, nav-sheet trigger and its items.
  - [x] `{components.nav-item}` (`44px`/`8px` literal, `nav-list.tsx:41`), `{components.button-secondary}`-shaped switches, and the nav-sheet trigger (`nav-sheet.tsx`) already carry `minBlockSize: '44px'` inline styles with the established `eslint-disable-next-line lawha/no-literal-design-values` comment pattern (see `nav-list.tsx:40` for the exact comment wording to match) — this task is confirming these are correct and complete, not introducing new sizing. No `packages/tokens` value exists for "≥44px target size" as a named token (only per-component literals: `button-primary`/`button-secondary`/`input`/`radio`/`nav-item` at `44px`, `screen-row`/`skeleton` at `48px`) — don't invent one; DESIGN.md doesn't specify a shared token for this, matching Story 1.3's own precedent of leaving these as documented literals.
  - [x] Note EXPERIENCE.md's own carve-out (quoted below): status tags (non-interactive) are explicitly out of scope for the 44px rule — don't apply it to purely decorative or informational elements that happen to render at small sizes.

- [x] **Task 5 — WCAG 2.2 AA verification pass (AC: 5)**
  - [x] Manually verify the shell (rail/sheet, skip link, landmarks, language/theme switch, status announcer, all 7 placeholder pages) against WCAG 2.2 AA across all four combinations: English/light, English/dark, Arabic/light, Arabic/dark. This continues Story 1.3's established manual-verification standard (no Playwright/automated a11y-scanning infra exists in this repo yet) — use a screen reader (VoiceOver/NVDA, whichever is available in the dev environment) plus keyboard-only navigation, not just visual inspection.
  - [x] Explicitly scope the claim to `apps/console` and `apps/player` per AC5's own text — the hosted Clerk authentication surface is excluded pending UX-DR12's separate, product-owner-gated EN 301 549 audit (screen reader, `ar` locale, 400% zoom, keyboard-only). Do not claim or imply Clerk passes as part of this story; do not attempt UX-DR12's audit here — it is out of scope.
  - [x] `apps/player` currently ships only `apps/player/src/app.tsx`, an explicitly temporary token-smoke-test stub with no real UI (its own comment states this — Epic 3 owns the real player surface). There is nothing to manually WCAG-audit in `apps/player` yet; satisfy AC5's `apps/player` half for this story by ensuring the new `no-dom-order-inversion` lint rule (Task 2) is wired into `apps/player/eslint.config.mjs` now, so the gate is live before Epic 3's first real component lands. Don't fabricate a player audit against the stub.
  - [x] Confirm the focus ring (Task 1), DOM order (Task 2, via lint + manual tab-through), status announcer (Task 3, via screen reader), and target sizes (Task 4) all hold simultaneously across the four locale/theme combinations — a regression in one dimension (e.g. RTL breaking tab order) is exactly the kind of interaction Story 1.3's Dev Notes flagged as breaking invisibly at the boundaries.

- [x] **Task 6 — Prove it (AC: 1, 2, 3, 4, 5)**
  - [x] Run the full CI sequence exactly as prior stories did, from the workspace root: `pnpm run lint` (must pass with the new `no-dom-order-inversion` rule active in both `apps/console` and `apps/player` configs), `pnpm run typecheck`, `pnpm run test` (must include the new rule's `RuleTester` suite passing), `pnpm run build`, `pnpm run verify:tier-isolation`.
  - [x] These are fan-out scripts (`pnpm -r --if-present run <script>`, root `package.json:8-14`) — a workspace package missing a given script is silently skipped, so confirm `tools/eslint-plugin-lawha`'s own `test` script (`vitest run`, already present per Story 1.3-era wiring) actually picks up the new test file.

### Review Findings

- [x] [Review][Dismissed] `no-dom-order-inversion` aggregates focusable-count/violations at whole-file scope, not per-JSX-subtree — decided to keep as shipped: file-wide scoping matches the dev's "false positives are cheap" rationale and needs no rework. [tools/eslint-plugin-lawha/rules/no-dom-order-inversion.js:112-169]
- [x] [Review][Patch] `isStylePropertyValue()` blanket-skips class-token scanning for any string that is *any* object-literal property's value, not just recognized style keys — so Tailwind classes sitting inside a `cva`/`clsx` variant-map object (e.g. `{ variant: "order-2 flex-row-reverse" }`) are never scanned for order/reverse/grid violations. Combined with `Property()` matching bare key names (`order`, `gridColumn`, etc.) anywhere in the file regardless of whether the object is a JSX `style` prop, this creates both false negatives (real violations hidden inside object literals) and false positives (unrelated business objects like a sort config `{ order: 2 }` get flagged). Fixed: both `Property()` and the `Literal` skip now require the object literal to actually be nested inside a JSX `style` attribute (`isInsideStyleAttribute`), and the skip only applies to the specific recognized style keys (`isHandledStylePropertyValue`). [tools/eslint-plugin-lawha/rules/no-dom-order-inversion.js:116-160]
- [x] [Review][Patch] Tailwind arbitrary-property bracket syntax (`[order:2]`, `[grid-column:1/3]`, `[flex-direction:row-reverse]`) is not recognized — `GRID_PLACEMENT_CLASS_RE` only matches invented literal prefixes (`col-[`, `grid-column-[`) that aren't real Tailwind syntax; the sibling rule (`no-physical-direction-properties.js:74-81`) parses the real bracket form correctly but this rule has no equivalent path. Real escape hatch letting DOM-order/grid inversions pass the CI gate undetected. Fixed: added `classifyArbitraryPropertyToken()`, parsing `[property:value]` for `order`, `flex-direction`, `grid-template-areas`, and the grid-placement property names. [tools/eslint-plugin-lawha/rules/no-dom-order-inversion.js:19-20]
- [x] [Review][Patch] Skip link target has no `tabIndex={-1}` — activating the skip link scrolls the viewport to `<main>` but does not move DOM/keyboard focus there, so the next Tab press continues from wherever focus was before activation instead of from within main content, defeating the skip link's purpose for keyboard/AT users. Fixed: added `tabIndex={-1}` to `<main id="main-content">`. [apps/console/app/(console)/layout.tsx:57]
- [x] [Review][Patch] `isFocusableOpeningElement()`'s `<a>` branch returns early on the `href` check and never falls through to the `tabIndex`/`role` checks, so `<a role="button" tabIndex={0}>` (a valid pattern the rule's own `INTERACTIVE_ROLE_RE` is designed to catch) is silently not counted as focusable. Fixed: `<a>` without `href` now falls through to the `tabIndex`/`role` checks like any other element. [tools/eslint-plugin-lawha/rules/no-dom-order-inversion.js:64-83]
- [x] [Review][Patch] `ORDER_CLASS_RE = /^-?order-/` is an unanchored prefix match, so any class token merely starting with `order-` (e.g. `order-confirmation`, `order-history`, `order-details`) is misclassified as the CSS `order` utility and flagged, in any file that also has ≥2 focusable elements or a custom component. Not anchored to Tailwind's actual order-value suffixes (`order-\d+`, `order-first`, `order-last`, `order-none`). Fixed: anchored to `/^-?order-(\d+|first|last|none)$/`. [tools/eslint-plugin-lawha/rules/no-dom-order-inversion.js:17,41]
- [x] [Review][Patch] `announce()`/`announceAlert()` in the module-level singleton store have no runtime guard against invocation during SSR — the file has no `'use client'` boundary of its own (unlike `status-announcer.tsx`), so if a future Server Component/Server Action calls these functions, mutated state would leak between concurrent users' requests in the shared Node process. Not currently reachable (no call site wired yet per this story), but worth a cheap guard before any future call site is added. Fixed: both functions now no-op when `typeof window === 'undefined'`. [apps/console/app/(console)/status-announcer-store.ts]
- [x] [Review][Patch] No unit tests exist for `status-announcer-store.ts`/`status-announcer.tsx` (subscribe/unsubscribe correctness, snapshot equality across renders, repeated-message zero-width-space dedup behavior) — new global a11y infrastructure backing AC3 has zero coverage, unlike the thorough `RuleTester` suite written for the ESLint rule in the same story. Added `status-announcer-store.test.ts` covering subscribe/unsubscribe, the SSR no-op guard, and the zero-width-space repeat-message behavior for both `announce()`/`announceAlert()`. A render-level test for `status-announcer.tsx` was attempted but dropped: this workspace's Vitest has no JSX/esbuild transform configured (only Next.js's own build pipeline parses `.tsx` JSX), so it isn't currently testable without a build-tooling change out of this patch's scope — consistent with the story's own Testing Standards Summary preference for pure-logic tests over UI rendering tests.
- [x] [Review][Patch] A `role` attribute expressed as a non-literal (e.g. `role={cond ? 'button' : 'presentation'}`) is silently treated as not-focusable, inconsistent with the custom-component case which conservatively falls back to unconditional flagging when a count can't be trusted — a plausible false negative for dynamic roles. Fixed: a non-literal `role` value is now conservatively treated as focusable. [tools/eslint-plugin-lawha/rules/no-dom-order-inversion.js:78-81]
- [x] [Review][Defer] Skip link's "first focusable element in the document" claim (AC5) depends on Story 1.2's root `app/layout.tsx`, which is outside this story's file list and wasn't reviewed here — deferred, pre-existing constraint from a prior story, unverified in this review.

## Dev Notes

### What already exists — don't rebuild it

- Every interactive element in the Story 1.3 shell already carries a focus ring (`focus-visible:outline-2 focus-visible:outline-electric focus-visible:outline-offset-2`) — this story audits and hardens that, it does not add focus styling from scratch. See Task 1's exact file list.
- `{components.focus-ring}` and `{components.focus-ring-on-signal}` are already fully defined in `packages/tokens/src/components.ts:43-54` — don't add new focus-ring tokens.
- `tools/eslint-plugin-lawha`'s two existing rules (`no-literal-design-values`, `no-physical-direction-properties`) already run in `apps/console/eslint.config.mjs`. `no-physical-direction-properties.js`'s own header comment (lines 9-12) explicitly names this story's DOM-order rule as the deliberate gap it left open — read that file before writing the new one, it's the closest precedent for module shape, Tailwind-class scanning, and test structure.
- No status announcer, `role="status"`, `aria-live`, or `role="alert"` exists anywhere in the codebase yet — Task 3 is net-new.
- No shared "≥44px target size" token exists in `packages/tokens` — it's a repeated per-component literal (`button-primary`, `button-secondary`, `input`, `radio`, `nav-item` at `44px`; `screen-row`, `skeleton` at `48px`), each already carrying the established `eslint-disable-next-line lawha/no-literal-design-values` comment where needed. Don't invent a new spacing token DESIGN.md doesn't specify — this repeats Story 1.3's own precedent (see that story's Debug Log).

### DOM-order rule — exact mechanical spec (binding source, DESIGN.md)

> "Reflow is achieved by source order and auto-placement only. No `order`, no `row-reverse` / `column-reverse`, no `grid-template-areas`, and no explicit grid-line placement in any component containing more than one focusable element. This is the mechanical form of 'tab order equals visual order', it is lintable, and the 640–1023px column-wrap rule is exactly where the tempting implementation would break it — invisibly, and doubly so in RTL." (DESIGN.md, restated as a Don't elsewhere in the same document)

This is the exact same "breaks invisibly at a boundary" failure mode Story 1.3's Dev Notes flagged for the 640–1023px rail/sheet gap — treat any breakpoint-conditional layout in the shell as a place this rule specifically needs to hold, not just the common case.

### Status announcer — exact contract (binding source, EXPERIENCE.md → Accessibility Floor)

> "One global status announcer, `role="status"` with `aria-atomic="true"`, and a documented politeness contract. `role="alert"` is reserved for optimistic-rollback failures alone."

And from the Component Patterns table (the `notice` component row): "Announced through the status announcer; `role="alert"` only for a rollback." A rollback, per EXPERIENCE.md's Truth Contract section, is specifically: the UI applied a change optimistically, the server rejected it, and the UI reverted — not any generic error. Don't use `role="alert"` for ordinary state changes, validation messages, or non-rollback errors; those go through `role="status"`.

Target size passage, same section: "Targets ≥44px on every interactive element at every breakpoint — stricter than 2.5.8's 24px... Status tags are non-interactive and out of scope for it."

### apps/player status — confirm before claiming AC5 coverage there

`apps/player/src/app.tsx` is an explicitly temporary token-smoke-test stub (its own comment states it is not a real product surface — Epic 3 owns the real player UI). There is currently nothing to manually WCAG-audit there. This story's obligation on the `apps/player` side of AC5 is limited to getting the new lint gate (Task 2) live in `apps/player/eslint.config.mjs` before real components land, not performing an audit against a stub. Don't invent player UI to audit.

### ESLint plugin conventions — follow exactly, this is the third rule added to this plugin

- Rule module: default export, `{ meta: { type: 'problem', docs: { description }, schema: [], messages: {...} }, create(context) { return { <ESTree-visitor>(node) {...} } } }`, `context.report({ node, messageId, data })`.
- Registration: one import + one `rules` map entry in `tools/eslint-plugin-lawha/index.js` (currently 3 entries, becomes 4).
- Config wiring: `apps/console/eslint.config.mjs` (`files: ['app/**/*.{ts,tsx}']`) and `apps/player/eslint.config.mjs` (`files: ['src/**/*.{ts,tsx}']`) both already exist and already list the other three `lawha/*` rules identically — add the fourth line to each `rules` block, nothing else changes.
- Tests: Vitest + ESLint's `RuleTester`, `RuleTester.describe/it = describe/it`, one `ruleTester.run('rule-name', rule, { valid: [...], invalid: [...] })` block, `languageOptions: { ecmaVersion: 2022, sourceType: 'module', parserOptions: { ecmaFeatures: { jsx: true } } }` — copy `no-physical-direction-properties.test.js`'s structure.

### Previous story intelligence (Story 1.3)

- Story 1.3 explicitly deferred this story's two gates: the DOM-order/visual-order lint rule and the global status announcer are both called out by name in Story 1.3's own scope-boundary paragraph and in `no-physical-direction-properties.js`'s header comment — this story is the payoff of those deferrals, not new discovery.
- Tailwind v4's cascade-layer model matters here too: Story 1.3 hit a bug where unlayered `generated/typography.css` always outranked `@layer utilities` regardless of source order, requiring an explicit `@layer components` wrap. If the status announcer or any focus-ring adjustment needs a utility class to win over a generated typography class, check `app/globals.css`'s existing layering before assuming a class will apply.
- Story 1.3 used a locally-cached headless Chromium (`playwright-core`, ephemeral, not a project dependency) for manual end-to-end verification in an environment with no GUI browser. The same approach applies here for Task 5's screen-reader/keyboard verification if no interactive browser is available — check what's available in the current environment first; don't add `playwright-core` as a real dependency, it was explicitly a scratch install last time.
- Story 1.3's `44px`/`8px` inline-style-with-`eslint-disable-next-line` pattern (`nav-list.tsx:40-41`) is the exact precedent for Task 4 — match its comment wording style when auditing/confirming the other elements.

### Testing Standards Summary

- Manual, cross-browser/screen-reader verification remains this epic's established standard (Stories 1.1–1.3) — no Playwright/automated-a11y-scanning infrastructure exists; don't build it here. A future TEA-driven setup owns that maturity, not this story.
- The new ESLint rule gets a real `RuleTester` unit-test suite (Task 2) — this is the same kind of pure-logic unit test Story 1.3's Testing Standards Summary already recommends over UI snapshot tests, and matches the existing two rules' own test coverage.
- Catalogue parity (`en.json`/`ar.json` key-set equality) is already CI-enforced (Story 1.2) — any new announcer copy is covered automatically.

### Project Structure Notes

- New: `tools/eslint-plugin-lawha/rules/no-dom-order-inversion.js`, `tools/eslint-plugin-lawha/rules/no-dom-order-inversion.test.js`, `apps/console/app/(console)/status-announcer.tsx` (plus a small hook/context module if the announce mechanism needs one — kebab-case filename, PascalCase export, matching `nav-rail.tsx` → `NavRail`'s precedent).
- Modified: `tools/eslint-plugin-lawha/index.js` (new rule registration), `apps/console/eslint.config.mjs` (new rule wired), `apps/player/eslint.config.mjs` (new rule wired — file already exists with the other three rules), `apps/console/app/(console)/layout.tsx` (mount `StatusAnnouncer`), possibly `packages/i18n/src/catalogues/{en,ar}.json` (announcer fallback copy, if needed).
- No new npm packages needed — the ESLint rule follows the existing plugin's zero-dependency pattern (plain ESTree visitors, no new AST library).

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 1.4: Accessibility & RTL Enforcement for the Shell] — story statement and acceptance criteria (verbatim source for AC1–5)
- [Source: _bmad-output/planning-artifacts/epics.md#Epic 1: Foundation — Console Shell, Bilingual Infrastructure, Auth & Workspace] — epic context, cross-story boundaries
- [Source: _bmad-output/planning-artifacts/epics.md#UX Design Requirements, CAP-17] — "Accessibility and RTL gates — WCAG 2.2 AA within `apps/console` and `apps/player` across all four language/theme combinations, enforced mechanically (tab order, focus, target size, status announcer)"
- [Source: _bmad-output/planning-artifacts/epics.md#UX Design Requirements, UX-DR12] — Clerk audit is a separate, product-owner-gated item, out of this story's scope
- [Source: _bmad-output/specs/spec-lawha-frontend/SPEC.md#CAP-17] — mechanical detail beyond epics.md's summary; Chromium-76-floor CSS constraints relevant to any player-side lint wiring
- [Source: _bmad-output/planning-artifacts/ux-designs/ux-the_project-2026-08-11/DESIGN.md#Layout & Spacing, line 484] — DOM-order/visual-order mechanical spec, quoted verbatim above
- [Source: _bmad-output/planning-artifacts/ux-designs/ux-the_project-2026-08-11/DESIGN.md, line 522] — focus ring "never suppressed and never replaced by a background change" rule
- [Source: _bmad-output/planning-artifacts/ux-designs/ux-the_project-2026-08-11/EXPERIENCE.md#Accessibility Floor] — status announcer contract, target-size rule, Clerk AA exclusion, `aria-busy` note, quoted verbatim above
- [Source: _bmad-output/planning-artifacts/ux-designs/ux-the_project-2026-08-11/EXPERIENCE.md#Component Patterns] — `notice` component's status-announcer/`role="alert"` row
- [Source: _bmad-output/planning-artifacts/ux-designs/ux-the_project-2026-08-11/EXPERIENCE.md#Truth Contract, Interaction Primitives] — definition of an optimistic-rollback failure (the only `role="alert"` trigger)
- [Source: _bmad-output/planning-artifacts/architecture/architecture-the_project-2026-08-11/ARCHITECTURE-SPINE.md#AD-21] — direction derived once at the root, CI lint enforcement pattern this story's new rule follows
- [Source: packages/tokens/src/components.ts:43-54] — `{components.focus-ring}`, `{components.focus-ring-on-signal}` exact values
- [Source: packages/tokens/src/components.ts] — `minBlockSize: '44px'`/`'48px'` literals across `button-primary`, `button-secondary`, `input`, `radio`, `nav-item`, `screen-row`, `skeleton`
- [Source: tools/eslint-plugin-lawha/index.js] — plugin registration pattern
- [Source: tools/eslint-plugin-lawha/rules/no-physical-direction-properties.js, lines 1-12] — module shape precedent; header comment naming this story's DOM-order gate explicitly
- [Source: tools/eslint-plugin-lawha/rules/no-physical-direction-properties.test.js] — RuleTester + Vitest test pattern precedent
- [Source: apps/console/eslint.config.mjs] — current `lawha/*` rule wiring and file scoping
- [Source: apps/console/app/(console)/layout.tsx] — current shell DOM structure, landmark order, mount point for the status announcer
- [Source: apps/console/app/(console)/nav-list.tsx, lines 30-41] — existing focus-ring class pattern and `44px`/`8px` literal + eslint-disable-comment precedent
- [Source: apps/player/src/app.tsx] — confirms this is a temporary token-smoke-test stub, not a real surface, per its own comment
- [Source: .github/workflows/ci.yml] — CI job steps (`lint`, `typecheck`, `test`, `build`, `verify:tier-isolation`) referenced by Task 6
- [Source: package.json:8-14] — root fan-out scripts (`pnpm -r --if-present run <script>`)
- [Source: _bmad-output/implementation-artifacts/1-3-console-shell-navigation.md] — previous story's shell structure, deferred items, Tailwind cascade-layer gotcha, `playwright-core` scratch-install precedent, `44px`/`8px` literal pattern

## Dev Agent Record

### Agent Model Used

Claude Sonnet 5 (claude-sonnet-5)

### Debug Log References

- `pnpm run lint` / `pnpm run typecheck` / `pnpm run test` / `pnpm run build` / `pnpm run verify:tier-isolation` — all green from workspace root (Task 6).
- Manual WCAG pass (Task 5) used a scratch `playwright-core` install driving the already-cached `chromium-1228` binary under `~/.cache/ms-playwright` (not a project dependency, matching Story 1.3's precedent) against the repo's own already-running `next dev` server on `localhost:3000`. Script set `lawha-locale`/`lawha-theme` cookies directly per combo and drove keyboard-only Tab traversal + `getComputedStyle`/`getBoundingClientRect` reads (a headless-environment stand-in for a screen reader + visual inspection, per Story 1.3's own precedent — no GUI browser or screen reader is available in this environment).

### Completion Notes List

- **Task 1 (AC1):** Verification-only, as scoped — walked all six shell files (`layout.tsx` skip link, `nav-sheet.tsx`, `nav-list.tsx` both states, `language-switch.tsx`, `theme-switch.tsx`); none suppress `outline`, none rely on a background-only change. `NavList`'s active-state inversion uses `bg-foreground` (a neutral, not a signal colour per `colors.ts`'s `THEME_INVARIANT_COLOR_NAMES` — only `alarm`/`amber` are signal fills), so the plain `{components.focus-ring}` is correct there; `{components.focus-ring-on-signal}` is not needed anywhere in the current shell. No code changes.
- **Task 2 (AC2):** Added `no-dom-order-inversion` ESLint rule. Scope is file-level, not per-JSX-element: native focusable elements (`button`/`select`/`textarea`/`a[href]`/`input`/`tabIndex`/interactive `role`) are counted across the whole component file; if the file also contains any custom JSX component (e.g. `<Link>`), the count is treated as unreliable and the rule falls back to flagging unconditionally, per the story's own guidance that false positives are cheap and false negatives defeat the AC. 20-case `RuleTester` suite added. Wired into both `apps/console/eslint.config.mjs` and `apps/player/eslint.config.mjs`; audited the existing shell against it — clean, zero disable comments needed.
- **Task 3 (AC3):** Built as a plain external store (`status-announcer-store.ts`, `useSyncExternalStore`) rather than React context — `StatusAnnouncer` is mounted as a source-order sibling of `<header>`/the nav+main wrapper (per the story's explicit DOM-placement instruction), which is incompatible with a context *provider* wrapping `<header>` from below it in the tree. `announce()`/`announceAlert()` are stable module-level functions any component can import directly, satisfying the "reusable without re-deriving the pattern" requirement without the provider-nesting conflict. Repeated identical messages are disambiguated with a trailing zero-width space so a screen reader doesn't swallow the second announcement. No call site wired per the story's own "if uncertain, build standalone" guidance — the language/theme switch Server Action round-trip was evaluated as a candidate but left unwired to avoid touching Story 1.3's file list on a judgment call; noting the absence of a current call site rather than inventing one, as instructed.
- **Task 4 (AC4):** Confirmed nav items, nav-sheet trigger, and both header switches already carry the correct `44px` literal + disable-comment pattern from Story 1.3. Found and fixed a real gap: the skip link's `focus:not-sr-only` state (10px `type-label` line-height + 12px/12px `control-pad-block` padding ≈ 34px) fell short of the 44px floor. Added `focus:min-h-[44px] focus:box-border focus:flex focus:items-center` (Tailwind arbitrary-value class, matching the codebase's existing `eslint-disable-next-line lawha/no-literal-design-values` precedent) — confirmed via the headless-browser pass that the focused skip link now measures exactly 44px. Not breakpoint-conditional, so holds at all three widths by construction; independently re-confirmed at 1440/800/390px via the same script.
- **Task 5 (AC5):** Ran the headless-browser verification across all four EN/AR × light/dark combinations at 1440px (desktop rail) plus 390px/800px (nav-sheet). Confirmed for every combo: all three landmarks present, both status-announcer regions present, skip link is the first Tab stop and measures 44px when focused, every Tab stop shows a 2px solid visible outline, nav items measure 44px, and DOM/tab order visibly mirrors under `dir="rtl"` (rail items shift from `x≈0` to `x≈1089` at 1440px; sheet items shift from `x=0` to `x=285`/`695` at the narrower widths) — confirming AC2's lint gate matches real rendered behaviour. Verified the real Server Action round-trip (language switch click) updates `lang`/`dir` live. `apps/player` has no real UI to audit (per Dev Notes); its AC5 obligation is satisfied by the `no-dom-order-inversion` lint gate being live in `apps/player/eslint.config.mjs` (Task 2). Clerk/hosted-auth surface explicitly out of scope (UX-DR12).
- **Task 6:** Full CI sequence green from the workspace root: `lint`, `typecheck`, `test` (including the new rule's 20-test `RuleTester` suite, confirmed picked up by `tools/eslint-plugin-lawha`'s fan-out `test` script), `build`, `verify:tier-isolation`.

### File List

- `tools/eslint-plugin-lawha/rules/no-dom-order-inversion.js` (new)
- `tools/eslint-plugin-lawha/rules/no-dom-order-inversion.test.js` (new)
- `tools/eslint-plugin-lawha/index.js` (modified — registered new rule)
- `tools/eslint-plugin-lawha/rules/no-physical-direction-properties.js` (modified — updated header comment now that the DOM-order gap it named is filled)
- `apps/console/eslint.config.mjs` (modified — wired `lawha/no-dom-order-inversion`)
- `apps/player/eslint.config.mjs` (modified — wired `lawha/no-dom-order-inversion`)
- `apps/console/app/(console)/status-announcer-store.ts` (new)
- `apps/console/app/(console)/status-announcer.tsx` (new)
- `apps/console/app/(console)/layout.tsx` (modified — mounted `StatusAnnouncer`; fixed skip-link 44px target-size gap)

## Change Log

| Date | Change | Author |
| --- | --- | --- |
| 2026-08-13 | Implemented Story 1.4: DOM-order lint gate, global status announcer, focus-ring/target-size audit (found and fixed a skip-link sizing gap), WCAG 2.2 AA manual verification across EN/AR × light/dark. All CI gates green. | Amelia (Dev Agent) |
