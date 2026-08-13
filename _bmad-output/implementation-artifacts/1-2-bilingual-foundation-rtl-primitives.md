---
baseline_commit: NO_VCS
---

# Story 1.2: Bilingual Foundation & RTL Primitives

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As an owner using Arabic,
I want every screen, label, and error to render correctly — mirrored, never clipped, never falling back to English,
so that Lawha doesn't feel like a translated afterthought.

## Acceptance Criteria

1. **Given** the application root
   **When** locale is set
   **Then** `lang` and `dir` are derived once at the root, and no component branches on locale to decide its own layout (AD-21) — a component asking "are we in Arabic?" is treated as a defect.

2. **Given** a user-visible string anywhere in the application
   **When** it is rendered
   **Then** it comes from an ICU message catalogue entry with named placeholders — no string concatenation, interpolation, or sentence assembly in application code (AD-22), including assembled accessible names.

3. **Given** a catalogue is missing a key referenced by the build
   **When** CI runs
   **Then** the build fails rather than falling back silently to another language (FR45).

4. **Given** a layout component is authored
   **When** CI lints it
   **Then** a physical `left`/`right` layout property fails the build — CSS logical properties are the only permitted form (FR47's mechanical definition of done).

5. **Given** a text container holds content that may expand
   **When** Arabic content (20–30% longer) is rendered
   **Then** the container has no fixed width or height and reflows instead of clipping (FR48), using `min-block-size` rather than `block-size`.

6. **Given** text storage and rendering anywhere in the system
   **When** any string moves through it
   **Then** it is UTF-8 with no exception in the path (FR49).

7. **Given** a mixed Arabic/Latin run — a price, a phone number, a brand name
   **When** it is rendered
   **Then** it is wrapped in bidi isolation realised as markup (`<bdi>` or `dir="ltr"`), never Unicode control characters (FR50).

8. **Given** a date, time, or numeral is displayed
   **When** the active locale is Arabic or English
   **Then** it is formatted per that locale, with numerals staying Latin-digit and LTR inside isolation (FR54).

**Scope boundary (binding, not a numbered AC):** this story builds the *primitives* — the catalogue system, the root direction/locale derivation, the CI lint gates, the bidi/formatting helpers. It does **not** build a language switcher UI (Story 1.3, CAP-3), does **not** persist a user's language choice (Story 1.7, FR46), and does **not** wire `apps/player`'s locale (that comes from the manifest per AD-23, built in Epic 3 Story 3.8 — the manifest doesn't exist yet). See Dev Notes → Scope boundaries for exactly what that means file-by-file.

## Tasks / Subtasks

- [x] **Task 1 — Build `packages/i18n`: catalogue system and locale/direction primitives** (AC: 1, 2, 3, 6, 8)
  - [x] Add `intl-messageformat` (pin `11.2.13`) and `@formatjs/icu-messageformat-parser` (pin `3.5.11`) to the pnpm catalog in `pnpm-workspace.yaml`, then reference them as real `dependencies` (not `devDependencies`) in `packages/i18n/package.json` — unlike `packages/tokens`, which ships zero runtime deps, this package has a genuine runtime dependency on the formatting engine. See Dev Notes → Library choice for why this pair and not `react-intl`
  - [x] Define `Locale = 'en' | 'ar'` and a pure function `directionForLocale(locale: Locale): 'ltr' | 'rtl'` — the single source AD-21's root derivation calls
  - [x] Create `en.json` and `ar.json` ICU message catalogues (flat `key: ICU-message-string` maps) seeded with a small real set of strings this story needs to prove the mechanism (e.g. a couple of labels, an error message, one message with a named placeholder) — do not invent product copy beyond what's needed to demonstrate the pattern; later stories add their own real strings to these same files
  - [x] Build a typed catalogue accessor: derive a `MessageKey` union type from the **English catalogue's keys** (source of truth), so referencing a nonexistent key is a TypeScript error at `pnpm run typecheck` — this is half of AC3's build-failure mechanism
  - [x] Build a `format(locale, key, values?)` function wrapping `intl-messageformat` that throws if the resolved catalogue lacks `key` (defends AC3 at runtime for any path the type system can't reach, e.g. a key composed from a non-literal — which AD-22 forbids anyway)
  - [x] Write a Vitest parity test asserting `Object.keys(en)` and `Object.keys(ar)` are exactly equal (same set, no extra, no missing) — this is the other half of AC3's build-failure mechanism, since `pnpm run test` runs in CI; a missing Arabic (or English) key fails this test
  - [x] Build locale-aware date/time/numeral formatters wrapping `Intl.DateTimeFormat` / `Intl.NumberFormat` directly (no library needed — both are baseline-available well before the Chromium 76 floor per Dev Notes → Latest technical findings) — numerals must stay Latin-digit per FR50/FR54, never switch to Arabic-Indic digits
  - [x] Build a bidi-isolation helper/component: wraps a mixed Arabic/Latin run in `<bdi>` (or `dir="ltr"` where semantics demand LTR rather than auto) — markup only, never `U+2066`/`U+2069` control characters (FR50 explicitly rules these out — EXPERIENCE.md notes they corrupt live regions and braille output)
  - [x] Export everything as plain, framework-agnostic TS (no React, no Preact) from `packages/i18n/src/index.ts` — both `apps/console` (React) and, eventually, `apps/player` (Preact) must be able to consume it without pulling in the other's framework

- [x] **Task 2 — Wire `apps/console`'s root to derive `lang`/`dir` once** (AC: 1)
  - [x] Replace the hardcoded `lang="en" dir="ltr"` in `apps/console/app/layout.tsx` with values derived from `packages/i18n`'s `directionForLocale` and a locale resolved server-side — for this story, resolve locale from a `lawha-locale` cookie (read via `next/headers`' `cookies()`) with an `'en'` default. **Don't call it `NEXT_LOCALE`** — that name is `next-intl`'s conventional cookie, and this project isn't using `next-intl` (see Dev Notes → Library choice); a same-named cookie invites a future reader to assume an integration that doesn't exist. Do **not** build the cookie-writing UI (that's Story 1.7's persistence and Story 1.3's switcher) — only the read side needs to exist so this story's root derivation has something real to key off of
  - [x] Confirm no other component in the smoke-test surfaces (`app/token-check/*`) branches on locale — none should exist yet, but this is the invariant AC1 protects, so verify rather than assume

- [x] **Task 3 — CI lint gate: no physical `left`/`right` layout property** (AC: 4)
  - [x] Add a new rule to `tools/eslint-plugin-lawha` (e.g. `no-physical-direction-properties`), following the existing `no-literal-design-values` rule's shape (see Dev Notes → Existing lint rule pattern)
  - [x] Flag physical Tailwind utility classes: `left-*`, `right-*`, `ml-*`/`mr-*`, `pl-*`/`pr-*`, `border-l-*`/`border-r-*`, `rounded-l-*`/`rounded-r-*`, `text-left`/`text-right` — and their logical equivalents that must be used instead (`inset-inline-start`/`-end`, `ms-*`/`me-*`, `ps-*`/`pe-*`, `border-s-*`/`border-e-*`, `text-start`/`text-end`) so the error message tells the developer the fix, not just the violation
  - [x] Flag physical CSS properties in inline styles / style objects: `left`, `right`, `marginLeft`, `marginRight`, `paddingLeft`, `paddingRight`, `borderLeftWidth`, `borderRightWidth`, etc. — reuse the `STYLE_PROPERTY_RE` + `Property` visitor pattern already in `no-literal-design-values.js`
  - [x] Add fixture tests: a physical property/class must fail, its logical equivalent must pass — mirror the existing rule's `RuleTester` test file
  - [x] Wire the rule into `apps/console/eslint.config.mjs` and `apps/player/eslint.config.mjs` alongside the existing `lawha/no-literal-design-values` rule, scoped the same way (component code only, not `packages/tokens`'s generated output)
  - [x] Note for later stories: this rule catches *physical direction* (`left`/`right`). It does **not** cover DOM-order-vs-visual-order concerns (`order`, `row-reverse`, `grid-template-areas`, explicit grid placement) — that lint gate belongs to Story 1.4 per epics.md's AC split. Don't conflate the two or duplicate work.

- [x] **Task 4 — CI lint gate: no concatenated/assembled user-visible strings** (AC: 2)
  - [x] Add a second new rule to `tools/eslint-plugin-lawha` (e.g. `no-assembled-user-visible-strings`) catching the common cases: `+` concatenation of string literals inside JSX text children or inside an argument passed to the catalogue's `format()` call; a template literal with more than one expression used as JSX text or passed to `format()`; `.join(...)` calls used to build JSX text
  - [x] This is necessarily heuristic — like `no-literal-design-values` in Story 1.1, it will have real gaps (arbitrary string-building indirected through a helper function can't be caught statically). Document known gaps in a comment in the rule file rather than silently pretending the rule is complete; this matches the precedent set in Story 1.1's review findings
  - [x] Add fixture tests: concatenation/template-literal-with-expressions/`.join()` as JSX text or `format()` arg must fail; a plain literal JSX text node or a `format(locale, 'catalogue.key', {namedValue})` call must pass
  - [x] Wire into both apps' `eslint.config.mjs`, same scoping as Task 3

- [x] **Task 5 — Prove the mechanism end-to-end with a temporary smoke-test route** (AC: 1, 2, 3, 4, 5, 6, 7, 8)
  - [x] Add a temporary `/i18n-check` route in `apps/console` (same pattern as Story 1.1's `/token-check` — internal only, not a real product surface; Console Shell in Story 1.3 owns real UI) that: renders at least one catalogue string, one string with a named placeholder, one mixed Arabic/Latin run wrapped in bidi isolation, one locale-formatted date and one locale-formatted number
  - [x] Prove the route renders correctly under both `lang`/`dir` states by driving the `lawha-locale` cookie manually (no switcher UI — set the cookie directly, e.g. via a `?locale=ar` query param read once at the root for this smoke test only, clearly commented as temporary)
  - [x] Verify a text container in this route uses `min-block-size` (not `block-size`) and has no fixed width, and that Arabic content visibly reflows without clipping
  - [x] Manually delete one key from `ar.json` only, confirm `pnpm run test` fails (AC3), then restore it — do not leave the catalogues out of parity

### Review Findings

- [x] [Review][Patch] No mechanism exists to select Arabic (`-ar`) typography tiers without component-level locale branching — `apps/console/app/i18n-check/page.tsx` renders all Arabic text under `type-body` (Inter/Latin), never `type-body-ar` (Cairo), violating DESIGN.md's binding "Don't render Arabic in a Latin family, ever." Resolution (per review decision): pick the `-ar` class locally in this temporary demo page based on locale — an acceptable narrow exception since it's disposable scaffolding, not real product UI bound by AD-21's no-locale-branching rule. Story 1.3 (Console Shell) owns designing the real, permanent tier-selection mechanism for actual components [apps/console/app/i18n-check/page.tsx]
- [x] [Review][Defer] `apps/console/app/layout.tsx`'s `cookies()` call in the root layout forces the entire `apps/console` app into fully dynamic rendering (no static generation possible from any route) — deferred, no static-gen requirement yet for apps/console; revisit if that changes [apps/console/app/layout.tsx:17]
- [x] [Review][Patch] AC8 violation: `formatDate`/`formatNumber` output is not wrapped in bidi isolation in the smoke-test page — Latin-digit dates/numbers render bare inside Arabic prose, contradicting AC8's explicit "LTR inside isolation" requirement [apps/console/app/i18n-check/page.tsx:39-40]
- [x] [Review][Patch] `catalogue-parity.test.ts` checks key-set equality but not placeholder-name equality across locales — a translator renaming `{name}` to `{otherName}` in `ar.json` passes CI and throws at runtime for Arabic only, exactly the silent-failure mode AC3/FR45 is meant to prevent [packages/i18n/test/catalogue-parity.test.ts:7-16]
- [x] [Review][Patch] AC2 violation: `<html>` page title is hardcoded to the English string `'Lawha'` via a static `metadata` export, never resolves through the catalogue despite `common.appName` already having an Arabic translation [apps/console/app/layout.tsx:6-8]
- [x] [Review][Patch] `packages/i18n/tsconfig.json`'s `include` is `["src"]` only (unlike `packages/tokens`'s `["src", "test"]` precedent), so `pnpm run typecheck` never type-checks `packages/i18n/test/` — including the `@ts-expect-error` assertion that's supposed to be AC3's compile-time guarantee [packages/i18n/tsconfig.json:5]
- [x] [Review][Patch] `no-assembled-user-visible-strings` doesn't check JSX attribute values (e.g. `aria-label={'Delete ' + name}`), undercutting its own doc comment's claim to cover "accessible names assembled from several parts" [tools/eslint-plugin-lawha/rules/no-assembled-user-visible-strings.js:23-26]
- [x] [Review][Patch] `no-physical-direction-properties` doesn't catch Tailwind arbitrary-property bracket syntax (`[left:10px]`, `[margin-left:4px]`), letting physical values through the new AC4/FR47 lint gate [tools/eslint-plugin-lawha/rules/no-physical-direction-properties.js:14-27,48-56]
- [x] [Review][Patch] `no-physical-direction-properties` covers granular border-`*Width`/`*Color`/`*Style` inline-style keys but not the `borderLeft`/`borderRight` shorthand form [tools/eslint-plugin-lawha/rules/no-physical-direction-properties.js:29-46]
- [x] [Review][Patch] `no-assembled-user-visible-strings` keys off the literal identifier name `format`; an aliased import (`import { format as t }`) silently defeats every check in the rule [tools/eslint-plugin-lawha/rules/no-assembled-user-visible-strings.js:16-21]
- [x] [Review][Patch] `LATIN_DIGIT_RE` in the formatters test only excludes the Arabic-Indic digit block (U+0660–0669), not Extended Arabic-Indic/Persian digits (U+06F0–06F9), weakening the regression guard [packages/i18n/test/formatters.test.ts:4]
- [x] [Review][Patch] `format()`'s return is force-cast `as string`, silently discarding `IntlMessageFormat`'s possible array return for rich-text/tag ICU syntax — a future catalogue entry using tag syntax would type-check but misbehave at render time with no compiler signal [packages/i18n/src/catalogue.ts:28]
- [x] [Review][Patch] `/i18n-check` uses a raw arbitrary-value Tailwind bracket class (`[min-block-size:6rem]`) that bypasses `no-literal-design-values`'s design-token lint gate [apps/console/app/i18n-check/page.tsx:43]
- [x] [Review][Patch] Hardcoded "EN"/"AR" nav link text in `/i18n-check`, not sourced from the catalogue — a literal (if minor, on a temporary page) AC2 violation [apps/console/app/i18n-check/page.tsx:24]

## Dev Notes

### Scope boundaries — read before touching `apps/player`

- **`apps/player`'s `index.html` (`lang="en" dir="ltr"`) is NOT touched by this story.** AD-23 is explicit: "the player's language comes from the manifest, never the device or browser." There is no manifest yet (Epic 5 builds the assembler; Story 3.8 wires the player to consume it). Wiring the player's root direction now would mean re-wiring it again in Story 3.8 against a real data source — don't do premature work here.
- **`packages/i18n` must still be framework-agnostic** (no React, no Preact import) specifically so Story 3.8 can consume the same catalogue/formatting/bidi primitives this story builds, without a rewrite. This is the one place player-readiness matters in this story: build the package so it's reachable later, but do not reach into the player app yourself.
- No language switcher UI (Story 1.3 / CAP-3) and no persistence (Story 1.7 / FR46, Settings surface in Epic 8). This story's console root reads a cookie; nothing in this story writes one from a UI.

### Library choice — `intl-messageformat`, not `react-intl`

Neither PRD, ARCHITECTURE-SPINE.md, DESIGN.md/EXPERIENCE.md, nor SPEC.md name an ICU library — this is a story-level implementation decision, flagged so it can be overridden later without surprise, same as Story 1.1 flagged pnpm/Vitest.

- **`react-intl`** (the common default for ICU MessageFormat in a React app) is ruled out: it's React-only, and `packages/i18n` must also eventually serve `apps/player` (Preact, Chromium 76/ES2019 floor, per AD-2's downward-only dependency rule — `apps/player` may import only `manifest-contract` and `i18n`). Pulling React into a shared package both apps import would violate that boundary the moment `apps/player` imports it.
- **`intl-messageformat`** (pin `11.2.13`) + **`@formatjs/icu-messageformat-parser`** (pin `3.5.11`) is the underlying engine `react-intl` itself uses — framework-agnostic, no React/Preact dependency, verified current via web search 2026-08-12. Use these directly in `packages/i18n`.
- `eslint-plugin-formatjs` (the FormatJS team's own lint rules for catalogue completeness / string literals) is **not** a fit here either — its rules key off `react-intl`'s API shape (`defineMessages`, `<FormattedMessage>`, `intl.formatMessage`), which this project isn't using. Build the two new rules in `tools/eslint-plugin-lawha` instead (Tasks 3–4), following the existing `no-literal-design-values` rule's pattern rather than adopting an incompatible off-the-shelf plugin.

### Latest technical findings (verified 2026-08-12, feed Task 1)

- `intl-messageformat` latest is `11.2.13`; `@formatjs/icu-messageformat-parser` latest is `3.5.11`. Pin exactly, don't take a caret range — matches this project's existing pattern of pinning exact versions in the pnpm catalog.
- `Intl.DateTimeFormat` and `Intl.NumberFormat` are both Baseline-widely-available since well before Chromium 76 (DateTimeFormat since 2017) — safe to use directly with no polyfill in both apps.
- **Caution:** `Intl.DateTimeFormat`'s `dateStyle`/`timeStyle` convenience options shipped in Chrome 76 specifically — i.e., landed exactly at the player's floor version, with no margin below it (the same knife-edge pattern ARCHITECTURE-SPINE.md already flags for `inset-inline-*` at Chrome 87). Prefer explicit format options (`{ year: 'numeric', month: 'long', day: 'numeric' }` etc.) over `dateStyle`/`timeStyle` shorthands in any code shared with or destined for the player, to stay safely inside the floor rather than exactly on its edge.

### AC6 (UTF-8 end to end) — no separate task, verify rather than build

Next.js, Vite, Node, and JSON are UTF-8 by default throughout this stack, so AC6 doesn't need new engineering in this story — it needs verifying that nothing in Task 1's catalogue files or Task 2's cookie/route handling introduces an exception (e.g., an explicit non-UTF-8 encoding on a file read/write, or a `Content-Type` header without `charset=utf-8` on a response carrying user-visible text). Confirm `en.json`/`ar.json` are saved as UTF-8 (not UTF-8-BOM) and Arabic text round-trips correctly through the `format()` function in the Task 5 smoke test — that's the concrete evidence for this AC, not a new subsystem.

### AD-21 / AD-22 — what "the root" and "no assembly" mean mechanically

- AD-21: `dir` is derived **once**, at the application root, from the active locale. No component anywhere calls something like `useLocale() === 'ar'` to decide its own layout — that pattern is explicitly called a defect in both the epics AC and the architecture spine. Components should just use CSS logical properties (`margin-inline-start`, not `margin-left`); the browser mirrors them automatically based on the ancestor `dir`, so no component-level branching is ever needed for layout.
- AD-22: every user-visible string — including assembled accessible names — is a single catalogue entry with named placeholders, e.g. `screenRow.accessibleName: "{name}, {playlist}, last confirmed {time}, {status}"` formatted with one `format()` call, never four strings joined with template literals or `+`. This binds now even though the actual `screen-row` component doesn't exist until Epic 2 — Task 1's catalogue/format function must support named placeholders for exactly this reason.

### Existing lint rule pattern to follow (Tasks 3–4)

`tools/eslint-plugin-lawha/rules/no-literal-design-values.js` (from Story 1.1) is the template: an ESLint rule module exporting `meta` + `create`, visiting `Literal`, `TemplateElement`/`TemplateLiteral`, and `Property` nodes, with a `RuleTester`-based fixture test file (`*.test.js`) proving both a violation and a clean pass. Register new rules in `tools/eslint-plugin-lawha/index.js`'s `rules` map, then reference them by `lawha/<rule-name>` in both apps' `eslint.config.mjs`, scoped to `files: ['app/**/*.{ts,tsx}']` (console) / `files: ['src/**/*.{ts,tsx}']` (player) — exactly how `no-literal-design-values` is already wired. **Known gap in the existing rule, don't repeat it:** Story 1.1's review found `tools/eslint-plugin-lawha` itself has no `lint` script, so `pnpm run lint` silently skips linting the plugin's own source — that defect is still open (not this story's job to fix, but don't assume the plugin's own code is being linted).

### What already exists — don't rebuild it

- `packages/tokens` (Story 1.1) is done: colors, typography (with the `-ar` Arabic ramp already verified per-tier), rounded, spacing, components, all consumed by both apps via CSS custom properties / Tailwind theme. This story does **not** touch typography tiers or the Arabic font ramp — that's already correct. This story is about *strings and direction*, not *type or color*.
- `apps/console/app/layout.tsx` currently hardcodes `<html lang="en" dir="ltr">` — this is the exact line AC1 requires you to change (Task 2).
- `apps/player/index.html` also hardcodes `lang="en" dir="ltr"` — **leave it alone** (see Scope boundaries above).
- The pnpm catalog (`pnpm-workspace.yaml`) already pins exact versions for the existing stack; add `intl-messageformat` and `@formatjs/icu-messageformat-parser` to it the same way, don't hand-pin per-package.
- `packages/i18n` currently exists only as a placeholder stub (`export {};`) with `package.json`/`tsconfig.json`/`eslint.config.mjs` already scaffolded by Story 1.1 — Task 1 fills it in, doesn't create it from scratch.

### Testing Standards Summary

- Vitest parity test: `en.json` and `ar.json` key sets are exactly equal (Task 1) — this is the AC3 CI gate's runtime half.
- TypeScript: a `MessageKey` union derived from `en.json` makes referencing an unknown key a typecheck failure — this is AC3's other half.
- ESLint `RuleTester` fixture tests for both new rules (Tasks 3, 4): one fixture that must fail, one that must pass, minimum, per rule — matches Story 1.1's precedent exactly.
- Don't build E2E, visual regression, or a11y-scanning infrastructure here — CAP-17 / Story 1.4 owns broader accessibility test maturity. This story's scope is the bilingual *primitives* and their CI gates only.

### Project Structure Notes

- No new packages needed — `packages/i18n` already exists as a stub (Story 1.1 scaffolded it); this story is the one that fills it in, per Epic 1's description ("later stories wire real ... behind it").
- Naming conventions already established and binding: `kebab-case` directories/modules, `PascalCase` components (ARCHITECTURE-SPINE.md → Consistency Conventions).
- New lint rules live in `tools/eslint-plugin-lawha/rules/`, alongside the existing one — not a new package.

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 1.2: Bilingual Foundation & RTL Primitives] — story statement and acceptance criteria (verbatim source for AC1–8)
- [Source: _bmad-output/planning-artifacts/epics.md#Epic 1: Foundation — Console Shell, Bilingual Infrastructure, Auth & Workspace] — epic context, cross-story boundaries (1.3 shell/switcher, 1.4 a11y/DOM-order lint, 1.7 persistence)
- [Source: _bmad-output/planning-artifacts/architecture/architecture-the_project-2026-08-11/ARCHITECTURE-SPINE.md#AD-21, AD-22, AD-23] — direction-derivation rule, no-string-assembly rule, player locale-from-manifest rule
- [Source: _bmad-output/planning-artifacts/architecture/architecture-the_project-2026-08-11/ARCHITECTURE-SPINE.md#Stack] — Chromium 76/ES2019 floor for `apps/player`
- [Source: _bmad-output/planning-artifacts/ux-designs/ux-the_project-2026-08-11/EXPERIENCE.md#Bilingual Behaviour] — bidi isolation as markup not control characters, numerals stay Latin-digit, expansion designed for not tested for
- [Source: _bmad-output/specs/spec-lawha-frontend/SPEC.md#CAP-2 — Bilingual foundation] — capability intent/success criteria, matches epics AC exactly
- [Source: _bmad-output/implementation-artifacts/1-1-shared-design-token-layer.md] — previous story: established pnpm/Vitest/ESLint-custom-plugin conventions, `packages/tokens` is done and out of this story's scope, exact file layout of `apps/console`/`apps/player` as they exist today
- `intl-messageformat` 11.2.13, `@formatjs/icu-messageformat-parser` 3.5.11 — verified via web search 2026-08-12 (npm registry)
- `Intl.DateTimeFormat`/`Intl.NumberFormat` Baseline availability and the Chrome-76 `dateStyle`/`timeStyle` edge — verified via web search 2026-08-12 (MDN, V8 blog)

## Dev Agent Record

### Agent Model Used

claude-sonnet-5

### Debug Log References

- Initial internal relative imports in `packages/i18n/src/*.ts` (`./locale.js`, `./catalogue.js`, etc.) used explicit `.js` extensions. `tsc --noEmit` accepted this (TS 5+ allows `.js`-suffixed specifiers resolving to `.ts` files under `moduleResolution: "Bundler"`), but Next.js/Turbopack's `transpilePackages` handling of this untranspiled workspace package could not resolve them (`Module not found: Can't resolve './bidi.js'`), producing a 500 on both `/` and `/i18n-check` in `apps/console` dev server. Fixed by switching to extensionless relative imports, matching the existing convention already used throughout `packages/tokens` (e.g. `import { colors } from './colors'`). Re-verified via `curl` against the dev server after the fix: both `en` (default) and `ar` (via the `/i18n-check/set-locale` cookie route) render correctly.

### Completion Notes List

- Built `packages/i18n` (previously a stub) as a framework-agnostic package: `locale.ts` (`Locale`, `directionForLocale`), `catalogues/en.json` + `catalogues/ar.json` (flat ICU message maps, 4 keys: a plain string, one with a named placeholder, and an error message), `catalogue.ts` (`MessageKey` type derived from `en.json`'s keys, `format(locale, key, values?)` wrapping `intl-messageformat` and throwing on a missing runtime key), `formatters.ts` (`formatDate`/`formatNumber` wrapping `Intl.DateTimeFormat`/`Intl.NumberFormat` with explicit fields only — no `dateStyle`/`timeStyle` — and `numberingSystem: 'latn'` forced on both locales so Arabic numerals stay Latin-digit per FR50/FR54), `bidi.ts` (pure `bidiIsolationSpec(mode)` returning a `{ tag, dir? }` spec — no React/Preact import, so `apps/console` and eventually `apps/player` each wrap it in their own one-line component). 11 Vitest tests pass, including an ICU-syntax parse check for every catalogue entry using `@formatjs/icu-messageformat-parser` directly (the second pinned dependency).
- Wired `apps/console/app/layout.tsx`: `lang`/`dir` now derive once, server-side, from a `lawha-locale` cookie (default `'en'`) via a shared `resolveLocale()` helper in `app/locale-cookie.ts` and `packages/i18n`'s `directionForLocale`. Confirmed `app/token-check/*` (Story 1.1's smoke test) has no locale branching. Added `@lawha/i18n` to `apps/console`'s `transpilePackages` alongside `@lawha/tokens`.
- Added two new ESLint rules to `tools/eslint-plugin-lawha`, following `no-literal-design-values`'s `RuleTester`-fixture-test pattern: `no-physical-direction-properties` (flags `left-*`/`right-*`/`ml-*`/`mr-*`/`pl-*`/`pr-*`/`border-l-*`/`border-r-*`/`rounded-l-*`/`rounded-r-*`/`text-left`/`text-right` Tailwind classes and their `left`/`right`/`marginLeft`/…/`borderBottomRightRadius` inline-style equivalents, message names the logical fix) and `no-assembled-user-visible-strings` (flags `+` concatenation with at least one string operand, template literals with 2+ interpolations, and `.join()` calls — only when in JSX-child position or a `format()` call argument/values-object value; documented known heuristic gaps in the rule file per Story 1.1's precedent). 19 + 7 fixture tests pass; both rules wired into `apps/console/eslint.config.mjs` and `apps/player/eslint.config.mjs` alongside the existing rule, same file scoping.
- Built the temporary `/i18n-check` smoke-test route (`apps/console/app/i18n-check/`): renders a plain catalogue string, a named-placeholder greeting, a phone number wrapped in `<BidiIsolate>` (thin React wrapper around `bidiIsolationSpec`) next to the Arabic app name, a locale-formatted date and number, and a reflow container using the Tailwind arbitrary-property class `[min-block-size:6rem]` (no fixed width/height). A temporary `/i18n-check/set-locale` route handler drives the `lawha-locale` cookie from a `?locale=` query param and redirects back — a manual test aid, not the Story 1.3 switcher; both are commented as temporary/deletable.
- Manually verified end to end against the running dev server: `GET /i18n-check` with no cookie renders `<html lang="en" dir="ltr">` with English strings; after `GET /i18n-check/set-locale?locale=ar` sets the cookie, `GET /i18n-check` renders `<html lang="ar" dir="rtl">` with Arabic catalogue strings (`لوحة`, `مرحبًا يا Nadia!`, the Arabic error message), the phone number correctly wrapped in `<bdi>+966 50 123 4567</bdi>`, the date formatted as `12 أغسطس 2026`, and the number as `12,345.6` — Latin digits preserved in the Arabic locale as required. Also manually deleted `common.greeting` from `ar.json` only and confirmed `pnpm run test` fails (both the parity test and the `format()` runtime-throw test), then restored it and confirmed tests pass again (AC3's CI gate, both compile-time and runtime halves).
- Ran the full CI sequence from the repo root exactly as `.github/workflows/ci.yml` does: `pnpm run lint`, `pnpm run typecheck`, `pnpm run test`, `pnpm run build`, `pnpm run verify:tier-isolation` — all pass, including a real production build of both `apps/console` (which now lists `/i18n-check` and `/i18n-check/set-locale` as routes) and `apps/player` (confirmed untouched — no `packages/i18n` import in `apps/player`, `index.html` still hardcodes `lang="en" dir="ltr"` per Dev Notes → Scope boundaries).
- Not done, correctly out of scope per Dev Notes: no language switcher UI (Story 1.3), no cookie-writing UI or persistence (Story 1.7), no `apps/player` locale wiring (Story 3.8, needs the manifest), no DOM-order/visual-order lint gate (Story 1.4).

### File List

**Modified**
- `pnpm-workspace.yaml` — added `intl-messageformat`/`@formatjs/icu-messageformat-parser` to the pnpm catalog
- `pnpm-lock.yaml`
- `packages/i18n/package.json` — added runtime deps, `test` script
- `packages/i18n/src/index.ts` — filled in from stub
- `apps/console/package.json` — added `@lawha/i18n` workspace dependency
- `apps/console/next.config.ts` — added `@lawha/i18n` to `transpilePackages`
- `apps/console/app/layout.tsx` — derives `lang`/`dir` from cookie instead of hardcoded `en`/`ltr`
- `tools/eslint-plugin-lawha/index.js` — registered the two new rules
- `apps/console/eslint.config.mjs` — wired the two new rules
- `apps/player/eslint.config.mjs` — wired the two new rules

**`packages/i18n`**
- `src/locale.ts`, `src/catalogue.ts`, `src/formatters.ts`, `src/bidi.ts`
- `src/catalogues/en.json`, `src/catalogues/ar.json`
- `vitest.config.ts`
- `test/locale.test.ts`, `test/catalogue.test.ts`, `test/catalogue-parity.test.ts`, `test/formatters.test.ts`, `test/bidi.test.ts`

**`tools/eslint-plugin-lawha`**
- `rules/no-physical-direction-properties.js`, `rules/no-physical-direction-properties.test.js`
- `rules/no-assembled-user-visible-strings.js`, `rules/no-assembled-user-visible-strings.test.js`

**`apps/console`**
- `app/locale-cookie.ts`
- `app/i18n-check/page.tsx`, `app/i18n-check/bidi-isolate.tsx`, `app/i18n-check/set-locale/route.ts`

### Change Log

| Date | Change |
| --- | --- |
| 2026-08-12 | Story implemented: `packages/i18n` built out (ICU catalogues, typed `format()`, locale-aware date/number formatters with forced Latin digits, framework-agnostic bidi-isolation spec), `apps/console` root now derives `lang`/`dir` from a `lawha-locale` cookie, two new ESLint CI gates added (`no-physical-direction-properties`, `no-assembled-user-visible-strings`) with fixture tests, temporary `/i18n-check` smoke-test route proves the mechanism end to end under both `en`/`ar` states. Full CI sequence (lint/typecheck/test/build/tier-isolation) verified clean. Status set to review.
