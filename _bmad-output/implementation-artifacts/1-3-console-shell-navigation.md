---
baseline_commit: NO_VCS
---

# Story 1.3: Console Shell & Navigation

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As an owner,
I want to move between every part of the console at any screen size, in either language,
so that the product works whether I'm on my phone or a desktop.

## Acceptance Criteria

1. **Given** a viewport ≥1024px
   **When** the console loads
   **Then** a persistent navigation rail is shown, its width set by the longer of the two languages' labels.

2. **Given** a viewport <640px
   **When** the console loads
   **Then** navigation collapses to a focus-trapping sheet that closes on Escape and returns focus to its trigger.

3. **Given** any navigable surface in the console
   **When** the owner looks for it
   **Then** no horizontal tab row is used anywhere (FR55) — labels are full words in both languages.

4. **Given** the owner switches language or theme
   **When** the switch is made
   **Then** it applies without a page reload and persists.

5. **Given** any page loads
   **When** the owner tabs from the top of the document
   **Then** a skip-to-content link is the first focusable element, followed by a landmark map (`banner`, `navigation`, `main`).

**Scope boundary (binding, not a numbered AC):** this story builds the shell *chrome* — the rail/sheet, the three structural landmarks, the skip link, and the language/theme switch — plus a thin route for each of the 7 nav destinations so the rail has somewhere to point. It does **not** build any destination's real content (Screens home is Story 2.1, Media is 4.1, Playlists is 5.1, Schedules is 6.1, Branches is 7.1, Billing is 8.1, Settings is 8.2), does **not** build the global status announcer or the DOM-order/visual-order lint gate (Story 1.4, CAP-17), does **not** build real per-user cross-device language persistence (Story 1.7, FR46 — this story's cookie is the complete mechanism for theme but only the browser-level half for language), and does **not** touch `apps/player` (this stack binds `apps/console` only per AD-2). No auth exists yet (Story 1.5 is still backlog) — the shell renders unconditionally; auth-gating it is Story 1.5's job. See Dev Notes → Scope boundaries for exactly what that means file-by-file.

## Tasks / Subtasks

- [x] **Task 1 — Add shadcn/ui on the Radix track to `apps/console`** (AC: 2)
  - [x] Run the shadcn CLI scoped to `apps/console` with `-b radix` explicit: `pnpm dlx shadcn@latest init -b radix`. **This flag is not optional** — shadcn flipped its default base library to Base UI in July 2026; the architecture spine's 2026-08-11 amendment specifically accepts *Radix*, not Base UI, because Radix is load-bearing for FR-47 mirroring and the keyboard/focus floor CAP-17 depends on (see Dev Notes → shadcn/Radix, not Base UI)
  - [x] Add the unified `radix-ui` package (pin exact version `1.6.7`, verified via npm registry 2026-08-12) to the pnpm catalog and reference it in `apps/console/package.json` — **not** individual `@radix-ui/react-*` packages, which shadcn deprecated in favour of this single package in February 2026
  - [x] Generate the shadcn `Sheet` component (built on Radix `Dialog`) into `apps/console` via the CLI — it supplies the nav-sheet's focus trap, Escape-to-close, and focus-return-to-trigger behaviour for free (AC2). Don't hand-build focus-trap logic
  - [x] Confirm `apps/player` is untouched — shadcn/Tailwind/Radix bind `apps/console` only (AD-2's downward-only dependency rule, ARCHITECTURE-SPINE.md → Stack)
  - [x] **Review the CLI's diff before accepting it.** `shadcn init` writes its own CSS custom properties (`--background`, `--foreground`, `--radius`, `--ring`, etc.) into `app/globals.css` and may propose edits to `apps/console/tailwind.config.ts`. This project's colour/radius/spacing already come entirely from `packages/tokens`' generated `var(--color-*)`/`var(--rounded-*)`/`var(--spacing-*)` variables via a `theme` (not `theme.extend`) config — see that file's own comment. Reconcile rather than let the CLI duplicate or shadow the existing token variables; shadcn components should consume the project's existing token-derived variables, not a second parallel set

- [x] **Task 2 — Build the persistent nav rail (≥1024px) and nav sheet (<1024px)** (AC: 1, 2, 3)
  - [x] Create `app/(console)/layout.tsx` as a route group nested under the existing root layout (`app/layout.tsx`, Story 1.2) — this is a normal nested layout, **not** a second root layout, so Next.js's route-groups "full page reload between root layouts" caveat does not apply here
  - [x] Nav items, in this exact order (`surface-inventory.md` IA table, `EXPERIENCE.md` Information Architecture): **Screens, Media, Playlists, Schedules, Branches, Billing, Settings** — 7 items. Do **not** add "Pair a screen" or "Playlist editor": both are reached only from within a flow, never from navigation (`surface-inventory.md` line 27, `EXPERIENCE.md` "Closure")
  - [x] Style with `{components.nav-item}` / `{components.nav-item-active}` (`packages/tokens`, built in Story 1.1) via the established Tailwind-class convention (see Dev Notes → Styling convention) — active state is inversion (`{colors.foreground}` background, `{colors.background}` text, weight 800), determined with `usePathname()` in a small client component. Rail width is the existing `{spacing.nav-rail}` token (192px) — AC1's "width set by the longer of the two languages' labels" is the *design rationale already baked into that fixed value*, not something to compute dynamically at runtime
  - [x] Below 1024px, render `{components.nav-sheet}` instead: full-bleed, `scrimOpacity: 1` (opaque — never a translucent wash, per DESIGN.md → Elevation & Depth), 1px border, opened from a menu-button trigger. **The rail/sheet swap happens at the 1024px boundary, not 640px** — DESIGN.md's breakpoint table grants the persistent rail only at ≥1024px; the 640–1023px row has no rail either (see Dev Notes → Breakpoint model, this is a common misread)
  - [x] Wire the shadcn `Sheet` (Task 1) as the nav-sheet; verify — don't reimplement — that it traps focus, closes on Escape, and returns focus to its trigger
  - [x] Labels are real catalogue strings, full words in both languages, no icon-only items, no horizontal tab row anywhere (FR55)
  - [x] Extend `packages/i18n`'s catalogues (`en.json`/`ar.json`) with the 7 nav labels and this task's other new user-visible strings — every string through `format()`, none hardcoded (AD-22, already CI-enforced by Story 1.2's `no-assembled-user-visible-strings` rule — note its documented gap: it doesn't check JSX attribute values like `aria-label`, so route `aria-label`s through `format()` anyway even though the lint won't catch a violation there)

- [x] **Task 3 — Skip-to-content link and landmark map** (AC: 5)
  - [x] `app/(console)/layout.tsx` renders, in this DOM order: (1) a skip-to-content link as the very first focusable element — visually hidden until focused, pointing to `#main-content`; (2) a `<header>` (implicit `banner` landmark — **must not** be nested inside `<main>` or any sectioning element, or it silently loses the role); (3) `<nav>` (implicit `navigation` landmark) hosting the rail/sheet; (4) `<main id="main-content">` (implicit `main` landmark) wrapping `{children}`
  - [x] Don't put the language/theme switch or any other focusable control before the skip link — it must be the literal first Tab stop (AC5)
  - [x] Don't build the global status announcer (`role="status"`, Story 1.4) or the alarm-banner `region` landmark (Story 2.1) here — this story owns exactly the three structural landmarks above

- [x] **Task 4 — Language and theme switch: write-side and persistence** (AC: 4)
  - [x] No component token exists for a language/theme switch anywhere in DESIGN.md/EXPERIENCE.md/SPEC.md — this is a story-level design decision, flagged per Story 1.1/1.2's precedent. Build both as simple, keyboard-operable controls inside the `banner` landmark, using only existing tokens (`{components.button-secondary}` shape, `{components.focus-ring}`, ≥44px `minBlockSize`) — no new colour, radius, or shadow
  - [x] **Language:** extend `app/locale-cookie.ts` (Story 1.2 — currently read-only; its own comment reads "the switcher UI that writes the cookie is Story 1.3") with a write path. Use a Server Action (`'use server'`, e.g. `app/(console)/actions.ts`) that sets the `lawha-locale` cookie via `cookies().set()` — calling it from a Client Component naturally refreshes the server-rendered tree (root layout's `resolveLocale()` re-runs) with no full page reload, which is exactly AC4
  - [x] **Theme:** add a new `lawha-theme` cookie, read server-side in `app/layout.tsx` alongside `resolveLocale()`, so `<html data-theme={theme}>` is set on the very first server response — no flash of the wrong theme. Same Server Action pattern as language for the write side. This retires `app/token-check/theme-toggle.tsx`'s client-only `useState` toggle as the *real* mechanism — its own comment says "Story 1.3 owns the real theme control." Leave that file alone (it's `/token-check`'s own temporary smoke test), but don't copy its non-persistent pattern; build the cookie-backed one
  - [x] Verify AC4 end to end: switch language, confirm `<html lang dir>` flips and survives a manual reload, with no full-page navigation observed (no document request in DevTools Network — only the Server Action round trip); repeat for theme
  - [x] Out of scope: real per-user, cross-device persistence of language (Story 1.7, FR46, backend-wired) — this story's cookie is the *complete* mechanism for theme (no FR/CAP calls for cross-device theme sync) but only the browser-level half for language

- [x] **Task 5 — Placeholder destination pages for the 7 nav routes** (AC: 1, 2, 3)
  - [x] Create `app/(console)/screens/page.tsx`, `media/page.tsx`, `playlists/page.tsx`, `schedules/page.tsx`, `branches/page.tsx`, `billing/page.tsx`, `settings/page.tsx` — each renders only a single `<h1>` reusing that surface's own nav-label catalogue key (no new copy invented). Real content is later stories' job (2.1, 4.1, 5.1, 6.1, 7.1, 8.1, 8.2 respectively) — don't build any of it here
  - [x] Replace `app/page.tsx`'s current empty `<main />` (Story 1.1's scaffold stub) with a `redirect()` (from `next/navigation`) to `/screens` — Screens is the IA's designated "Home." Don't create `app/(console)/page.tsx` at `/` directly; it would conflict with the existing ungrouped `app/page.tsx` resolving to the same path (Next.js route-groups "conflicting paths" caveat)
  - [x] Leave `/token-check` and `/i18n-check` untouched and unlinked from the shell nav — they stay internal smoke-test routes, not IA surfaces

- [x] **Task 6 — Prove the shell end-to-end** (AC: 1, 2, 3, 4, 5)
  - [x] Manually verify at 1440px and 390px (SPEC.md's two design-review widths) and across the 1024px/640px boundaries, in both `en`/`ar` and both themes: rail-vs-sheet swap, sheet focus trap/Escape/focus-return, skip link as the first Tab stop, landmark map present (`banner`/`navigation`/`main`), language+theme switch with no reload, all 7 destinations reachable and neither "Pair a screen" nor "Playlist editor" present in nav
  - [x] Confirm RTL mirroring of the rail/sheet (nav origin, drawer origin) purely through CSS logical properties — no locale branching in any new component (AD-21), consistent with Story 1.2's established primitives
  - [x] Run the full CI sequence exactly as prior stories did: `pnpm run lint`, `pnpm run typecheck`, `pnpm run test`, `pnpm run build`, `pnpm run verify:tier-isolation`

### Review Findings

- [x] [Review][Patch] NavSheet content isn't scoped by its `lg:hidden` wrapper — Radix `Dialog.Portal` renders `SheetContent` directly into `document.body`, outside that wrapper's DOM subtree, so an open sheet stays visible/interactive on top of the rail if the viewport resizes past 1024px while open; it also never closes on browser back/forward or other non-click route changes, only via `NavList`'s `onNavigate` callback [apps/console/app/(console)/nav-sheet.tsx, apps/console/components/ui/sheet.tsx] — fixed: added a `matchMedia('(min-width: 1024px)')` listener and a `pathname`-keyed effect that both call `setOpen(false)`
- [x] [Review][Patch] Sheet close button's accessible name is the hardcoded English literal `"Close"`, never calling `format()`, even though a `shell.nav.close` catalogue key exists in both `en.json`/`ar.json` for exactly this purpose and is otherwise unused — violates AD-22, breaks the close control's screen-reader label for Arabic users [apps/console/components/ui/sheet.tsx:87] — fixed: `SheetContent` now takes a `closeLabel` prop, `NavSheet` passes `format(locale, 'shell.nav.close')`; also added `aria-hidden="true"` to the close icon
- [x] [Review][Patch] `button.tsx`'s shadcn-generated size variants use physical-direction Tailwind classes (`pr-*`/`pl-*` inside `has-data-[icon=inline-end]:pr-2` / `has-data-[icon=inline-start]:pl-2`) instead of logical `pe-*`/`ps-*`, violating AD-21; this slipped past `lawha/no-physical-direction-properties` because that rule's variant-stripping regex only looks for a colon *before* a bracket, so it never strips a `has-data-[...]:` prefix and never inspects the trailing `pr-2`/`pl-2` token [apps/console/components/ui/button.tsx:24-34] — fixed: `pr-*`/`pl-*` replaced with `pe-*`/`ps-*` in all four size variants
- [x] [Review][Patch] `setTheme`/`setLocale` call `cookieStore.set(name, value)` with no `maxAge`/`expires`, making both cookies session-only — contradicts `theme-cookie.ts`'s own comment calling itself "the complete persistence mechanism" and undercuts AC4's "persists" requirement (survives a reload, but not a browser restart) [apps/console/app/theme-cookie.ts:16-19, apps/console/app/locale-cookie.ts:21-24] — fixed: both now set `{ path: '/', maxAge: 60*60*24*400, sameSite: 'lax' }`
- [x] [Review][Patch] `NavList`'s active-item check (`pathname === item.href`) is strict equality with no nested-route handling — currently unreachable (all 7 nav destinations are flat pages in this story), but the first later story that adds a nested/detail route under any of them (e.g. Screens' detail view) will silently lose that item's active highlight [apps/console/app/(console)/nav-list.tsx:20] — fixed: also matches `pathname.startsWith(item.href + '/')`
- [x] [Review][Patch] `vitest.config.ts`'s `include` only globs `app/**/*.test.{ts,tsx}`, silently excluding `components/**` and `lib/**` — both contain new files (`components/ui/button.tsx`, `components/ui/sheet.tsx`, `lib/utils.ts`) from this story, so a future test placed there would never run without anyone noticing [apps/console/vitest.config.ts:5] — fixed: broadened to `**/*.test.ts`/`**/*.test.tsx`
- [x] [Review][Patch] `LanguageSwitch`/`ThemeSwitch` disable via React `isPending`, but a very fast double-activation (double-click, held Enter) before the pending state commits can fire the Server Action twice, toggling the value back to its original state [apps/console/app/(console)/language-switch.tsx:25, apps/console/app/(console)/theme-switch.tsx:25] — fixed: added a `useRef` re-entrancy guard around both `onClick` handlers
- [x] [Review][Defer] `lawha/no-physical-direction-properties`'s `stripVariantPrefix` helper only searches for a variant-separating colon in the substring *before* the first `[`, so it never strips prefixes like `has-data-[icon=inline-end]:` — the rule silently misses physical-direction classes guarded by any bracket-containing variant, as demonstrated by this story's `button.tsx` finding above [tools/eslint-plugin-lawha/rules/no-physical-direction-properties.js:63-72] — deferred, pre-existing rule from Story 1.1, out of this story's scope to fix

## Dev Notes

### Read `apps/console/AGENTS.md` before writing any Next.js code

That file (present in the working tree, re-generated by `next dev`) states plainly: **"This is NOT the Next.js you know — breaking changes... may all differ from your training data."** This story is Next.js 16.3. Two concrete, verified-current facts to work from (checked against the local `node_modules/next/dist/docs/`, 2026-08-12, since the installed version's docs are the authority over prior training knowledge):

- **Route groups behave as expected** (`(folderName)`, excluded from the URL): a route group's `layout.tsx` is a *normal nested layout* unless it declares its own `<html>`/`<body>` — it does not here, since the existing root `app/layout.tsx` (Story 1.2) already does. The "full page reload between root layouts" caveat therefore does **not** apply to `app/(console)/layout.tsx`. The "conflicting paths" caveat *does* apply — see Task 5's `app/page.tsx` note.
- **`PageProps<'/route'>` / `LayoutProps<'/route'>`** are now globally generated helper types (via `next dev`/`next build`/`next typegen`) — prefer these over hand-writing `params: Promise<{...}>` shapes where a route has params. This story's routes are all static (no dynamic segments), so this mostly doesn't bind, but don't be surprised by the generated types if the editor shows them.

### shadcn/Radix, not Base UI — the one finding most likely to trip up a dev agent here

Verified via web search 2026-08-12: shadcn/ui changed its **default** base library from Radix to **Base UI in July 2026**. Radix is still fully supported, but a plain `shadcn init` today scaffolds Base UI components, silently. ARCHITECTURE-SPINE.md's 2026-08-11 amendment explicitly accepted **Radix**, not Base UI — "Radix is load-bearing rather than convenient: it supplies the RTL behaviour and the keyboard and focus floor that FR-47 and the accessibility target depend on" — so accepting the new default here would quietly contradict that decision and undermine CAP-17's accessibility floor for the very first real UI this repo builds. **Always pass `-b radix` explicitly**: `pnpm dlx shadcn@latest init -b radix` (and per-component adds inherit the project's `components.json` setting once initialised this way). Separately, shadcn also unified all individual `@radix-ui/react-*` packages into one `radix-ui` package in February 2026 (latest `1.6.7`, verified 2026-08-12) — install that single package, not per-primitive ones.

### Breakpoint model — two thresholds, not one

DESIGN.md → Layout & Spacing's breakpoint table has **three rows**, and the persistent rail exists in exactly one of them:

| Range | Navigation |
|---|---|
| < 640px | `{components.nav-sheet}`, content stacks to single column, full-bleed |
| 640–1023px | `{components.nav-sheet}` (implied — no rail row until ≥1024px), content wraps secondary columns to a second line |
| ≥ 1024px | persistent `{components.nav-rail}` |

AC2 only states the <640px case explicitly, but the rail is *only* granted at ≥1024px — so the sheet must also govern the 640–1023px gap, even though no AC sentence says so directly. Missing this produces a broken 640–1023px state (neither rail nor sheet). This is exactly the kind of viewport range EXPERIENCE.md flags elsewhere as "where the tempting implementation breaks invisibly."

### Styling convention already established — follow it, don't invent a new one

`apps/console/tailwind.config.ts` (Story 1.1) sets `theme` directly (not `theme.extend`) from `packages/tokens`' generated CSS-variable references, so every colour/radius/spacing utility class is token-backed or doesn't exist. The existing `app/token-check/theme-toggle.tsx` shows the exact convention in a real component:

```
className="type-label border-border text-foreground ps-control-pad-inline pe-control-pad-inline pt-control-pad-block pb-control-pad-block border"
```

— spacing tokens become classes named after the token itself (`ps-control-pad-inline`, not a pixel value), colours become `border-border`/`text-foreground`. Follow this for the rail/sheet/nav-item: e.g. rail width is `w-nav-rail` (from `{spacing.nav-rail}`), active nav item is `bg-foreground text-background` (inversion, matches `{components.nav-item-active}`). Confirm the exact generated class names in `apps/console/tailwind.config.ts` before assuming one exists — don't add a new token if one doesn't; extend `packages/tokens` only if DESIGN.md actually specifies a value this story needs that Story 1.1 didn't transcribe (unlikely — `nav-item`, `nav-item-active`, `nav-sheet`, `focus-ring`, `focus-ring-on-signal` are all already in `packages/tokens/src/components.ts`).

### What already exists — don't rebuild it

- `app/locale-cookie.ts` (`resolveLocale()`) — read-only today, explicitly deferring the write side to this story (see its own code comment). Extend it; don't replace it.
- `app/layout.tsx` — already derives `lang`/`dir` once at the root (Story 1.2, AD-21). Add `data-theme` here in the same server-side read, don't introduce a second place `lang`/`dir`/`data-theme` gets decided.
- `packages/i18n`'s catalogue/`format()`/bidi/formatter primitives — Story 1.2, framework-agnostic, ready to consume as-is.
- `packages/tokens` — Story 1.1, includes `nav-item`, `nav-item-active`, `nav-sheet`, `focus-ring`, `focus-ring-on-signal`, `spacing.nav-rail` (192px) already transcribed verbatim from DESIGN.md. Don't re-derive these values.
- `app/token-check/*` and `app/i18n-check/*` — temporary, internal-only smoke tests from Stories 1.1/1.2, explicitly *not* real product surfaces. Leave them running and unlinked; this story's shell doesn't touch or replace them.
- `tools/eslint-plugin-lawha`'s `no-physical-direction-properties` and `no-assembled-user-visible-strings` rules already run in `apps/console/eslint.config.mjs` — new shell code is bound by both from the first commit, no new wiring needed.

### IA — the exact nav list, and what's deliberately excluded

`surface-inventory.md`'s Console table and `EXPERIENCE.md`'s Information Architecture table agree: **Screens, Screen detail, Pair a screen, Media, Playlists, Playlist editor, Schedules, Branches, Billing, Settings, Sign up/sign in** — eleven surfaces total, but only **seven** are nav items (Screens, Media, Playlists, Schedules, Branches, Billing, Settings). Screen detail is reached from a Screens row (not nav). Pair a screen and Playlist editor are explicitly "reached only from within a flow, never from navigation... both are tasks, not places" (`surface-inventory.md` line 27). Sign up/sign in is the hosted, unauthenticated entry point, not a nav item once inside the console. Getting this list wrong (e.g. adding "Pair a screen" to the rail because "Add a screen" sounds nav-like) directly contradicts the source.

### Language/theme switch has no design spec — a story-level call, flagged per precedent

SPEC.md's own Assumptions section says the theme-control question ("whether a theme control appears in Settings or the console follows `prefers-color-scheme` alone") was "not settled by any upstream artifact" — but epics AC4 settles it for this story specifically, by requiring an explicit switch that "applies without a page reload and persists." Build real controls, not a `prefers-color-scheme`-only implementation. No component token exists for either control's visual shape in DESIGN.md/EXPERIENCE.md — bound only by the general system rules (zero radius, zero shadow, existing colour tokens, `{components.focus-ring}`, ≥44px targets).

### Testing Standards Summary

- Manual, cross-browser-window verification is this epic's established standard for shell-level work (Stories 1.1, 1.2 both did this, no E2E/Playwright infra) — don't build automated E2E, visual regression, or a11y-scanning infrastructure here. Story 1.4 (CAP-17) and any later TEA-driven setup own that maturity.
- A plain Vitest unit test asserting the nav-items list's order and hrefs (7 items, exact order above, no "Pair a screen"/"Playlist editor") is cheap and catches an easy future regression — add one if the nav items are extracted into a plain data structure (recommended), matching this project's existing preference for unit-testing pure data/logic over UI snapshot tests.
- Catalogue parity (`en.json`/`ar.json` key-set equality) is already CI-enforced (Story 1.2) — new nav/switch strings are covered automatically, no new test needed for that part.

### Project Structure Notes

- New: `app/(console)/layout.tsx`, `app/(console)/actions.ts` (Server Actions), `app/(console)/screens/page.tsx`, `media/page.tsx`, `playlists/page.tsx`, `schedules/page.tsx`, `branches/page.tsx`, `billing/page.tsx`, `settings/page.tsx`, plus small client components for the rail, sheet, nav-item active-state, language switch, and theme switch (kebab-case filenames, PascalCase component names — e.g. `nav-rail.tsx` exporting `NavRail`, matching `bidi-isolate.tsx` → `BidiIsolate`'s existing precedent).
- Modified: `app/page.tsx` (empty stub → redirect to `/screens`), `app/layout.tsx` (add `data-theme` alongside existing `lang`/`dir`), `app/locale-cookie.ts` (add write side), `packages/i18n/src/catalogues/{en,ar}.json` (new nav/switch strings), `apps/console/package.json`/pnpm catalog (`radix-ui`), `apps/console/components.json` (new, from `shadcn init -b radix`).
- No new packages needed. `apps/player` is untouched by this entire story.

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 1.3: Console Shell & Navigation] — story statement and acceptance criteria (verbatim source for AC1–5)
- [Source: _bmad-output/planning-artifacts/epics.md#Epic 1: Foundation — Console Shell, Bilingual Infrastructure, Auth & Workspace] — epic context, cross-story boundaries (1.4 a11y/DOM-order lint + status announcer, 1.5 auth, 1.7 language persistence)
- [Source: _bmad-output/specs/spec-lawha-frontend/SPEC.md#CAP-3 — Console shell] — capability intent/success criteria, matches epics AC
- [Source: _bmad-output/specs/spec-lawha-frontend/SPEC.md#CAP-17 — Accessibility and RTL gates] — shell-wide slice this story is responsible for (skip link, landmarks, focus)
- [Source: _bmad-output/specs/spec-lawha-frontend/SPEC.md#Assumptions] — shadcn/Radix acceptance rationale, theme-control question left open upstream
- [Source: _bmad-output/specs/spec-lawha-frontend/surface-inventory.md#Console] — full nav-vs-flow-only surface list, line 27's explicit Pair-a-screen/Playlist-editor exclusion
- [Source: _bmad-output/planning-artifacts/ux-designs/ux-the_project-2026-08-11/EXPERIENCE.md#Information Architecture] — IA table, "Closure" paragraph
- [Source: _bmad-output/planning-artifacts/ux-designs/ux-the_project-2026-08-11/EXPERIENCE.md#Component Patterns] — `nav-item`/`nav-sheet` behavioural row
- [Source: _bmad-output/planning-artifacts/ux-designs/ux-the_project-2026-08-11/EXPERIENCE.md#Accessibility Floor] — skip-to-content + landmark map requirement, focus visibility
- [Source: _bmad-output/planning-artifacts/ux-designs/ux-the_project-2026-08-11/DESIGN.md#Layout & Spacing] — breakpoints table, `nav-rail`/`nav-sheet` spacing tokens
- [Source: _bmad-output/planning-artifacts/ux-designs/ux-the_project-2026-08-11/DESIGN.md#Components] — `nav-item`/`nav-item-active`/`nav-sheet` component definitions
- [Source: _bmad-output/planning-artifacts/ux-designs/ux-the_project-2026-08-11/DESIGN.md#Elevation & Depth] — zero-shadow, opaque-scrim (`scrimOpacity: 1`) rule
- [Source: _bmad-output/planning-artifacts/architecture/architecture-the_project-2026-08-11/ARCHITECTURE-SPINE.md#Source tree] — `apps/console` scope
- [Source: _bmad-output/planning-artifacts/architecture/architecture-the_project-2026-08-11/ARCHITECTURE-SPINE.md#Stack] — shadcn/ui-on-Radix acceptance paragraph (2026-08-11 amendment), AD-2 downward-only dependency rule
- [Source: _bmad-output/implementation-artifacts/1-1-shared-design-token-layer.md] — `packages/tokens` contents, Tailwind `theme`-not-`extend` decision, existing file layout, `no-literal-design-values` lint precedent
- [Source: _bmad-output/implementation-artifacts/1-2-bilingual-foundation-rtl-primitives.md] — `app/locale-cookie.ts`/`app/layout.tsx` current state and explicit "Story 1.3 owns the real switcher" hooks, lint rule gaps (JSX attributes not checked)
- [Source: apps/console/AGENTS.md] — Next.js 16.3 breaking-changes-from-training-data warning
- [Source: apps/console/node_modules/next/dist/docs/01-app/01-getting-started/03-layouts-and-pages.md] — verified 2026-08-12: nested-layout vs. root-layout behaviour, Route Props Helpers
- [Source: apps/console/node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/route-groups.md] — verified 2026-08-12: route-group conventions and caveats (full-reload only between root layouts, conflicting-paths rule)
- `radix-ui` unified package `1.6.7` — verified via web search 2026-08-12 (npm registry)
- shadcn/ui `-b radix` flag and the July 2026 Base-UI-default change — verified via web search 2026-08-12 (shadcn/ui changelog)

## Dev Agent Record

### Agent Model Used

Claude Sonnet 5 (claude-sonnet-5)

### Debug Log References

- `pnpm dlx shadcn@latest init -b radix` required `-p <preset>` and `-y` to run non-interactively (an interactive preset picker not anticipated by the story text), and required `baseUrl`/`paths` import-alias config added to `apps/console/tsconfig.json` first (`shadcn init` refuses to run without one). Resolved with `-p nova -b radix -y --no-rtl`; `--no-rtl` declines shadcn's own RTL toggle since this project's RTL mechanism is CSS logical properties (AD-21), not a component-level flag.
- The CLI's diff needed more reconciliation than `app/globals.css` alone: it also silently added a Google Fonts (`next/font/google` Geist) import and `font-sans`/`geist.variable` classes to the *root* `app/layout.tsx` (outside `apps/console`'s own scope, and contradicting the project's Inter/Cairo `type-*` typography system) — reverted. `app/globals.css`'s shadcn-authored `:root`/`.dark` colour block, sidebar/chart tokens, and font vars were replaced with a thin `@theme inline` alias layer onto the project's own `generated/tokens.css` variables (see that file's comment); no second colour/radius system exists.
- Discovered a genuine, pre-existing lint-rule gap while building `nav-item`/the switch controls: `{components.nav-item}`'s `minBlockSize: '44px'` / `padding-block: 8px` and `{components.button-secondary}`'s `minBlockSize: '44px'` are literal values inside `packages/tokens/src/components.ts` itself (verbatim DESIGN.md transcription, not named `spacing.*` tokens), so `lawha/no-literal-design-values` has no allowlist for them outside `packages/tokens`. Used scoped, commented `eslint-disable-next-line` on each occurrence rather than inventing a new spacing token DESIGN.md doesn't specify.
- `generated/typography.css`'s `.type-*` classes are unlayered CSS, which in Tailwind v4's cascade-layer model always outranks `@layer utilities` regardless of source order — `{components.nav-item-active}`'s `fontWeight: 800` override (`font-extrabold`) would silently never have applied over `.type-body-sm`'s `font-weight: 500` without scoping that import as `@layer components` in `app/globals.css`.
- No browser/GUI available in this environment; used a locally-cached headless Chromium (via an ephemeral, non-project `playwright-core` scratch install, not added as a dependency) to manually drive the running `next start` server end-to-end per Task 6 and Task 4's verification checklists — confirmed rail/sheet swap at 1440/800/390px, sheet focus-trap + Escape-close + focus-return-to-trigger, skip link as the first Tab stop, `banner`/`navigation`/`main` landmark counts, all 7 nav hrefs with none of "Pair a screen"/"Playlist editor", language/theme switch producing a same-URL POST (Server Action) with zero document navigations and cookie persistence across reload, dark-theme computed colour, and RTL border mirroring (`border-e` renders left, not right, under `dir="rtl"`) with no locale branching in code.

### Completion Notes List

- Task 1: `shadcn@latest init -b radix` scaffolded `apps/console/components.json`, `lib/utils.ts`, `components/ui/{button,sheet}.tsx` on the Radix track (confirmed via `Dialog as SheetPrimitive` from `radix-ui` in the generated Sheet). `radix-ui` pinned to exact `1.6.7` in the pnpm catalog and referenced as `catalog:` in `apps/console/package.json`; the CLI's own `shadcn` CLI package moved to `devDependencies` (build/runtime doesn't need it). Reconciled the CLI's `app/globals.css` diff to alias onto the project's existing `packages/tokens`-generated CSS variables instead of a second colour/radius system, and reverted an out-of-scope Google Fonts addition the CLI made to the root `app/layout.tsx`. `apps/console/components/ui/sheet.tsx` was hand-edited post-generation: overlay is now the opaque `{components.nav-sheet}`/`{components.modal}` scrim (`bg-foreground`, not a translucent wash), `SheetContent` simplified to `top`/`bottom` sides only (full-bleed inline per the nav-sheet token has no start/end edge to slide from) with the physical `left-3`/`right-3` close-button offset replaced by the logical `end-3`, and `SheetTitle`/`SheetDescription` now use the project's `type-*` classes instead of untokenized `text-base`/`text-sm`. `apps/player` untouched (confirmed via `pnpm run build`/`verify:tier-isolation`). Verified via `pnpm run lint`, `typecheck`, and `build` in `apps/console`.
- Task 2/3 (built together — both live in the single new `app/(console)/layout.tsx`): persistent rail (`NavRail`, `hidden lg:block`) and nav sheet (`NavSheet`, `lg:hidden`, wrapping the shadcn Sheet from Task 1) swap at Tailwind's `lg:` breakpoint, which is exactly 1024px — verified in compiled CSS (`@media (min-width: 64rem)`) and confirmed the sheet (not rail) also covers the 640–1023px gap. Nav items extracted into a plain, unit-tested `NAV_ITEMS` array (`app/(console)/nav-items.ts` + `.test.ts`) in the exact 7-item IA order with no "Pair a screen"/"Playlist editor". Active-state styling (`{components.nav-item-active}`, inversion + weight 800) required layering `generated/typography.css` under `@layer components` in `app/globals.css` so Tailwind's `font-extrabold` utility (in `@layer utilities`) can actually win the cascade over `.type-body-sm`'s own `font-weight`. Skip link (`app/(console)/layout.tsx`) is the first element in the fragment, before `<header>`; DOM order is skip-link → `<header>` (banner) → `<nav>` (navigation, hosting both `NavRail` and `NavSheet`) → `<main id="main-content">`. 7 new `shell.nav.*`/`shell.skipToContent` catalogue keys added to both `en.json`/`ar.json` (catalogue-parity test passing). `44px`/`8px` literals in `{components.nav-item}` handled per the Debug Log note above.
- Task 4: `app/locale-cookie.ts` extended with `setLocale()`; new symmetrical `app/theme-cookie.ts` (`lawha-theme` cookie, `resolveTheme()`/`setTheme()`); both write paths exposed as Server Actions in the new `app/(console)/actions.ts` (`'use server'`). `app/layout.tsx` now reads both cookies in one `Promise.all` and sets `data-theme` alongside `lang`/`dir` on `<html>` at the first server response. `LanguageSwitch`/`ThemeSwitch` (new client components in `app/(console)/`) call the actions via `useTransition`; end-to-end browser verification (see Debug Log) confirmed both flip their respective `<html>` attribute with zero document-level network requests (only a same-URL POST) and persist across a full reload. `app/token-check/theme-toggle.tsx` left untouched, per its own comment and the story's explicit instruction.
- Task 5: 7 placeholder pages (`app/(console)/{screens,media,playlists,schedules,branches,billing,settings}/page.tsx`), each a single `<h1>` reusing its own `shell.nav.*` catalogue key. `app/page.tsx` now `redirect()`s to `/screens`. `/token-check` and `/i18n-check` untouched and unlinked from the shell nav.
- Task 6: full manual verification pass (widths, breakpoints, both locales, both themes, focus trap/Escape/return, landmarks, RTL mirroring — see Debug Log) plus the complete CI sequence (`lint`, `typecheck`, `test`, `build`, `verify:tier-isolation`) all green at the workspace root.
- New test infrastructure: `apps/console` had no Vitest setup before this story. Added `vitest.config.ts` + a `test` script (`vitest` pinned via the existing pnpm catalog) and one test file, `app/(console)/nav-items.test.ts`, per the story's own Testing Standards Summary recommendation ("add one if the nav items are extracted into a plain data structure").

### File List

**New:**
- `apps/console/app/(console)/layout.tsx`
- `apps/console/app/(console)/actions.ts`
- `apps/console/app/(console)/nav-items.ts`
- `apps/console/app/(console)/nav-items.test.ts`
- `apps/console/app/(console)/nav-list.tsx`
- `apps/console/app/(console)/nav-rail.tsx`
- `apps/console/app/(console)/nav-sheet.tsx`
- `apps/console/app/(console)/language-switch.tsx`
- `apps/console/app/(console)/theme-switch.tsx`
- `apps/console/app/(console)/screens/page.tsx`
- `apps/console/app/(console)/media/page.tsx`
- `apps/console/app/(console)/playlists/page.tsx`
- `apps/console/app/(console)/schedules/page.tsx`
- `apps/console/app/(console)/branches/page.tsx`
- `apps/console/app/(console)/billing/page.tsx`
- `apps/console/app/(console)/settings/page.tsx`
- `apps/console/app/theme-cookie.ts`
- `apps/console/components.json`
- `apps/console/lib/utils.ts`
- `apps/console/components/ui/button.tsx`
- `apps/console/components/ui/sheet.tsx`
- `apps/console/vitest.config.ts`

**Modified:**
- `apps/console/app/layout.tsx` (data-theme, reverted CLI's stray Geist font addition)
- `apps/console/app/locale-cookie.ts` (write path: `setLocale`)
- `apps/console/app/page.tsx` (empty stub → `redirect('/screens')`)
- `apps/console/app/globals.css` (reconciled shadcn CLI output onto existing tokens; `@layer components` fix for typography)
- `apps/console/package.json` (`radix-ui` → catalog, `shadcn` → devDependencies, new deps from CLI, `test` script, `vitest` devDependency)
- `apps/console/tsconfig.json` (`paths` alias for shadcn's `@/*` imports)
- `pnpm-workspace.yaml` (`radix-ui: 1.6.7` added to catalog)
- `packages/i18n/src/catalogues/en.json` / `ar.json` (`shell.*` nav/skip-link/language/theme keys)
