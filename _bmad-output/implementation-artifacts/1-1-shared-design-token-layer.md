---
baseline_commit: NO_VCS
---

# Story 1.1: Shared Design Token Layer

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As an owner,
I want the console and the player to draw from one visual language,
so that Lawha reads as one coherent product rather than two apps stitched together.

## Acceptance Criteria

1. **Given** the token set defined in DESIGN.md (colors, typography, spacing, radius, component shapes)
   **When** any component in `apps/console` or `apps/player` is built
   **Then** it consumes tokens by reference — no colour, radius, or spacing literal appears in component code (CI-enforced).

2. **Given** a Latin typography tier exists (display, heading, body, body-sm, label, etc.)
   **When** Arabic content is rendered
   **Then** its `-ar` counterpart tier is used, and no Latin font family ever renders Arabic text.

3. **Given** the console renders at a fixed pixel scale and the player renders at viewing distance
   **When** type sizes are chosen
   **Then** console tiers are `px` and player tiers are `vmin`, and neither tier set appears in the other app.

4. **Given** a token value changes in the shared definition
   **When** either app is rebuilt
   **Then** the change is reflected in both apps from the single source, with no duplicated literal to update separately.

**Scope note (not a numbered AC, but binding):** this is the first story in the project — no code exists anywhere in the repo yet. Per Epic 1's description, this story also carries repository/environment scaffolding, since no starter template is named anywhere upstream; the monorepo source tree in ARCHITECTURE-SPINE.md is the from-scratch scaffold. See Dev Notes.

## Tasks / Subtasks

- [x] **Task 1 — Scaffold the monorepo from scratch** (prerequisite to all ACs; see Dev Notes → Project scaffolding)
  - [x] Initialize a pnpm workspace at the repo root: `pnpm-workspace.yaml`, root `package.json`, `.gitignore`, `.nvmrc`/`.node-version` pinned to a current Node LTS satisfying Next.js 16.3's `>=20.9.0` floor
  - [x] Add a pnpm catalog pinning the exact versions from ARCHITECTURE-SPINE.md's Stack table (see Dev Notes)
  - [x] Create `apps/console` — Next.js 16.3 + React 19.2.8 + TypeScript 6.x, empty app shell only
  - [x] Create `apps/player` — Preact 10.29.7 + Vite 8.0.9 + TypeScript 6.x, targeting the Chromium 76 / ES2019 floor, empty app shell only
  - [x] Create `packages/domain`, `packages/adapters`, `packages/manifest-contract`, `packages/i18n` as empty stub packages (package.json + tsconfig + placeholder index only) — **no logic in this story**, later stories (1.2, 1.5, 1.6, Epic 5) fill them in
  - [x] Create `supabase/migrations/` as an empty placeholder directory — no schema, no migrations (that's Story 1.5+)
  - [x] Add a shared base `tsconfig.json` referenced by every app/package
  - [x] Add a minimal CI workflow running lint + typecheck + build across the workspace — just enough to host the AC1 lint gate from Task 5; do not build out the full quality-gate pipeline here

- [x] **Task 2 — Build the token package** (AC: 1, 2, 3, 4)
  - [x] Create `packages/tokens` (see Dev Notes → Token package location for why this package isn't in the architecture spine's source tree and how it's justified)
  - [x] Transcribe DESIGN.md's `colors` block verbatim: light + dark pairs, the three theme-invariant signal colors (`alarm`, `amber`, `on-signal`/`-companion`), and the `player-neutral-*` tokens kept structurally separate (they are not theme tokens)
  - [x] Transcribe DESIGN.md's `typography` block verbatim, keeping console tiers (`px`) and player tiers (`vmin`) as separate, non-overlapping exports; every Latin tier ships its `-ar` counterpart (Cairo, `letterSpacing: '0'`, raised line-height)
  - [x] Transcribe `rounded`, `spacing`, and `components` blocks verbatim, including `rounded.full` being reserved solely for `{components.radio}`
  - [x] Export everything as plain, framework-agnostic TS objects (no vendor/CSS-in-JS dependency in `packages/tokens` itself) consumable by both a Tailwind config and a CSS-custom-property generator
  - [x] Unit test: every Latin typography tier has a corresponding `-ar` tier (fails loudly if a future tier addition forgets its counterpart)

- [x] **Task 3 — Wire `apps/console` to the token package** (AC: 1, 3, 4)
  - [x] `tailwind.config.ts` derives colors, spacing, and radius entirely from `packages/tokens` — no hardcoded literals in config or components
  - [x] Implement the `[data-theme="dark"]` CSS-variable substitution rule: every `{colors.X}` resolves to `{colors.X-dark}` except `alarm`, `amber`, `on-signal` and their `-foreground`/`-companion` pairs, which stay theme-invariant
  - [x] Wire console (`px`) typography tiers as consumable utilities/classes; do not wire the Arabic switch logic itself (that's Story 1.2) — tiers just need to exist and be selectable
  - [x] Add one minimal smoke-test component/route proving end-to-end token consumption, so AC1 is concretely verifiable — temporary/internal only, not a real product surface (Console Shell is Story 1.3)

- [x] **Task 4 — Wire `apps/player` to the token package** (AC: 1, 3, 4)
  - [x] Generate CSS custom properties (or an equivalent ES2019-safe mechanism) from `packages/tokens` at build time
  - [x] Wire player (`vmin`) typography tiers only — confirm no console (`px`) tier or Tailwind artifact ships in the player bundle
  - [x] Verify the generated token CSS uses none of the forbidden Chromium 76 features: `clamp()`, `min()`, `max()`, flexbox `gap` (grid `gap` is fine), `aspect-ratio`, `:has()`, container queries, `oklch`, `color-mix`, `inset-inline-*`, or the logical border shorthands
  - [x] Add one minimal smoke-test component proving end-to-end token consumption in the player bundle

- [x] **Task 5 — CI gate: no literal colour/radius/spacing in component code** (AC: 1)
  - [x] Add a lint rule (stylelint and/or a custom ESLint rule, scoped to `apps/console` and `apps/player` component code) that fails the build on a raw hex/rgb colour, a non-zero `border-radius` literal outside `{components.radio}`, or an arbitrary spacing value
  - [x] Allowlist `packages/tokens` itself and its generated CSS-variable output — that's the one place literals legitimately live
  - [x] Add fixture tests for the rule itself: a literal must fail, a token reference must pass — test the gate, don't just assume it works
  - [x] Wire the rule into the Task 1 CI workflow

### Review Findings

- [x] [Review][Patch] `tailwind.config.ts` replaces Tailwind's default color/radius/spacing scale instead of extending it (resolved: keep the full lockdown deliberately — added a code comment in `tailwind.config.ts` plus a Dev Notes line stating this is intentional) [apps/console/tailwind.config.ts:9]
- [x] [Review][Patch] `resolveTokenRef` can't resolve most real `components.ts` entries; the `components` token table is unconsumed and untested [packages/tokens/src/resolve.ts:17]
- [x] [Review][Patch] AC1's literal-value lint gate has several detection gaps (typography/sizing properties, named CSS colors, modern CSS color functions, arbitrary-bracket units, template-literal interpolation) [tools/eslint-plugin-lawha/rules/no-literal-design-values.js:7]
- [x] [Review][Patch] CI runs `typecheck` before `build`, but `apps/console/next-env.d.ts` imports `.next/types/*.d.ts` files only `next build`/`next dev` generate — will fail on a fresh CI checkout [.github/workflows/ci.yml:25]
- [x] [Review][Patch] `tailwindColorTheme` doesn't exclude `PLAYER_NEUTRAL_COLOR_NAMES`, so player-only colors become real Tailwind utilities in `apps/console` [packages/tokens/src/tailwind-theme.ts:15]
- [x] [Review][Patch] `verify-tier-isolation.ts` reports "verified" even if the build directory exists but contains zero scannable files (false-positive pass on the AC3 gate) [scripts/verify-tier-isolation.ts:53]
- [x] [Review][Patch] Player build ships an unused `[data-theme="dark"]` CSS block despite the player having no theme [apps/player/scripts/generate-tokens-css.ts:7]
- [x] [Review][Patch] `buildColorVariables()` silently drops an orphan `-dark` color key instead of erroring, unlike the symmetric case; zero unit tests on this function [packages/tokens/src/css-variables.ts:28]
- [x] [Review][Patch] Most workspace packages and `tools/eslint-plugin-lawha` have no `lint` script, so `pnpm run lint` silently skips them (including the custom rule's own source) [tools/eslint-plugin-lawha/package.json:1]
- [x] [Review][Patch] `engines.node` floor (`>=20.9.0`) is looser than what `import.meta.dirname` in this diff actually requires (`>=20.11.0`) [package.json:7]
- [x] [Review][Patch] Typography test suite only checks every Latin tier has an `-ar` counterpart, never the reverse (non-`-ar` tiers stay Latin) [packages/tokens/test/typography.test.ts:1]
- [x] [Review][Defer] `rounded.full` ("reserved solely for radio") and `allTypographyTiers` ("tooling only") boundaries are enforced only by code comments, not runtime/lint checks — deferred, no violation exists today, hardening task for later [packages/tokens/src/rounded.ts:1]

## Dev Notes

### Project scaffolding (this story is the first commit)

- Confirmed: the repository currently contains no application code at all — only planning artifacts (`_bmad`, `_bmad-output`, `docs`). This story creates the monorepo from nothing.
- Source tree, verbatim from ARCHITECTURE-SPINE.md → Structural Seed:
  ```
  lawha/
    apps/
      console/            # Next.js — marketing site + dashboard + all server routes
      player/             # Preact + Vite — static bundle, service worker, no SSR
    packages/
      domain/             # entities, ports, schedule resolution, entitlement rules; no vendor imports
      adapters/            # Clerk, Supabase, R2, Merchant-of-Record adapters implementing domain ports
      manifest-contract/  # the manifest schema and its types — the console/player contract
      i18n/                # ICU message catalogues, locale + direction resolution
    supabase/
      migrations/         # forward-only, applied by CI
  ```
  This story only *creates* `apps/console`, `apps/player`, stubs the four packages, and adds the empty `supabase/migrations/` directory. **Do not implement domain/adapters/manifest-contract/i18n logic here** — that belongs to Stories 1.2, 1.5, 1.6 and Epic 5. Building real logic into these stubs now is scope creep and will collide with those stories' own designs.
- Naming conventions bind from the first file created: `kebab-case` directories, `kebab-case.ts` modules, `PascalCase` components (ARCHITECTURE-SPINE.md → Consistency Conventions).

### Token package location — a deliberate, spine-consistent addition

`packages/tokens` is **not** named in ARCHITECTURE-SPINE.md's source tree or dependency graph, yet CAP-1 explicitly requires "one token set... drives both apps," and the architecture's own dependency diagram shows `apps/player` importing only `manifest-contract` and `i18n`. Resolution for this story: add `packages/tokens` as a new downward-only leaf package — same shape as `packages/domain` (no vendor imports, no outgoing edges) — imported by both `apps/console` and `apps/player`. AD-2 forbids upward or lateral edges, not new downward ones, so this is additive, not a violation. This is a judgment call made to unblock this story; it should be folded into ARCHITECTURE-SPINE.md's diagram in a future architecture pass, but don't block this story on that.

### The token values themselves — transcribe exactly, don't approximate

Full source of truth: `_bmad-output/planning-artifacts/ux-designs/ux-the_project-2026-08-11/DESIGN.md` (frontmatter block: `colors`, `typography`, `rounded`, `spacing`, `components`). Normative rules baked into those tokens that the package must preserve exactly:

- **Theme substitution rule:** every `{colors.X}` resolves to `{colors.X-dark}` under `[data-theme="dark"]`, with three theme-invariant exceptions — `alarm`, `amber`, `on-signal` (and their `-foreground`/`-companion` pairs). `player-neutral-*` tokens are **not** theme tokens at all — a naive `X → X-dark` resolver must never reach them.
- **Arabic ramp rule:** every Latin typography tier has an `-ar` counterpart; Inter (Latin) never renders Arabic; Cairo covers Arabic tiers, `letterSpacing: '0'` without exception, raised line-height.
- **Unit rule:** console tiers are `px`, player tiers are `vmin` — `clamp()` doesn't exist at the Chromium 76 floor and `vmin` scales correctly across 720p/1080p/4K. Neither tier set may appear in the other app. `code-console` (console pairing-code input) and `player-code` (cross-room legibility) are deliberately separate tiers — don't conflate them.
- `rounded.DEFAULT`/`sm`/`md`/`lg`/`xl` are all `0px`; `rounded.full` (`9999px`) is reserved solely for `{components.radio}` — any other use is a bug, not a style choice.
- `spacing.section-gap` is `0px` intentionally (full-bleed, edge-to-edge regions separated by a rule) — do not "fix" this as if it were an oversight.

### Chromium 76 / ES2019 floor (binds `apps/player` and any token→CSS output it consumes)

Never emit or rely on, in player or shared code: `clamp()`, `min()`, `max()`, flexbox `gap` (grid `gap` is fine, Chrome 66), `aspect-ratio`, `:has()`, container queries, `oklch`, `color-mix`, `inset-inline-*`, and the logical border *shorthands* (`border-inline-start`, `border-block-end` — shipped Chrome 87, same batch as the insets). Use logical **longhands** only (`margin-inline-start`, `padding-inline-end`, `border-block-end-width`, `min-block-size`). This binds the token-generation step in Task 4 even though this story doesn't build the components that will ultimately consume it.

No physical `left`/`right` layout property anywhere (FR-47's mechanical definition of done, CI-enforced eventually in Story 1.4) — the token layer itself must not bake in any physical-direction value, even though full layout components arrive in Story 1.3+.

### Stack versions — exact, do not substitute nearby versions

From ARCHITECTURE-SPINE.md → Stack:

| Package | Version |
| --- | --- |
| Next.js (`apps/console`) | 16.3 |
| React | 19.2.8 |
| Preact (`apps/player`) | 10.29.7 |
| Vite (`apps/player`) | 8.0.9 |
| TypeScript | 6.x — **hold** |

TypeScript 7.0 reached GA on 2026-07-08 with a native Go compiler but ships without a stable programmatic API, so `typescript-eslint` can't yet follow — stay on 6.x. shadcn/ui on Tailwind over Radix primitives is accepted for `apps/console` only (accepted 2026-08-11); `apps/player` shares only the token layer from that stack and nothing else — pulling in shadcn/Radix/Tailwind runtime code into the player would break the Chromium 76 floor.

### Decisions made at this story's level (not specified by any upstream artifact)

Neither the PRD, ARCHITECTURE-SPINE.md, DESIGN.md/EXPERIENCE.md, nor SPEC.md name a package manager, monorepo build tool, or test framework. These are story-level implementation defaults, not requirements handed down — flagged so the product owner/architect can override later without it being a surprise:

- **Package manager: pnpm workspaces** (`pnpm-workspace.yaml`), with a **pnpm catalog** pinning the exact stack versions above in one place. This is the standard 2026 fit for a Next.js + Vite polyglot monorepo and avoids version drift across apps/packages. Turborepo/Nx are **not** added in this story — don't introduce build-orchestration tooling beyond what's needed to prove the token layer; add it later only if build times demand it.
- **Node.js:** Next.js 16.3 requires `>=20.9.0` (verified via Next.js docs, 2026-08-12). Pin a current Node LTS meeting that floor via `engines` in `package.json` and `.nvmrc`.
- **Test framework: Vitest**, for unit tests in `packages/tokens` and both apps — fast, ESM-native, works identically across the Next.js and Vite/Preact halves of the monorepo.
- **`apps/console/tailwind.config.ts` replaces Tailwind's default color/radius/spacing scale rather than extending it** (resolved during code review, 2026-08-12): `theme` is set directly, not `theme.extend`, so a default Tailwind utility with no token backing it (`gap-4`, `w-8`, `p-2`, etc.) generates no CSS — silently, with no lint or type error. This is deliberate, not an oversight: it forces every color/radius/spacing usage through the token set, per AC1. Documented here and as a comment in the config file itself so Story 1.3 (the first story to build real console UI) isn't surprised by it.

### Explicitly out of scope for this story

- No Supabase, Clerk, R2, or Merchant-of-Record provisioning — zero vendor accounts, zero database, zero auth. `supabase/migrations/` is an empty placeholder only.
- No real console or player surfaces beyond the minimal smoke-test needed to prove AC1/AC3 — Console Shell (Story 1.3), Bilingual Foundation (Story 1.2), and the Player Display Surface (Epic 3) own the real UI.
- No RTL/bidi/ICU-catalogue mechanics (AD-21, AD-22) — those are Story 1.2. This story only needs the *tokens* to exist and be theme/direction-agnostic; it does not wire locale switching.
- No full CI/quality-gate pipeline — only enough CI to host the Task 5 literal-value lint gate. Full accessibility/RTL gate maturity (CAP-17) is Story 1.4's scope.

### Project Structure Notes

- Greenfield repository — there is no existing structure to reconcile against; this story *establishes* the structure. Follow the source tree above exactly; the only sanctioned deviation is the addition of `packages/tokens`, justified above.
- Every package/app must be declared in the pnpm workspace glob (`apps/*`, `packages/*`).

### Testing Standards Summary

- Required automated coverage for this story specifically:
  - Unit test: every Latin typography tier in `packages/tokens` has a corresponding `-ar` tier.
  - Fixture test for the Task 5 lint rule itself: a literal colour/radius/spacing value fails, a token reference passes.
  - A build-time/CI check confirming `apps/player`'s bundle contains no console (`px`) typography tier and `apps/console`'s bundle contains no player (`vmin`) tier (AC3).
- Don't build out broader test infrastructure (E2E, visual regression, a11y scanning) here — those belong to later stories, particularly Story 1.4 (CAP-17) and any TEA-driven setup.

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 1.1: Shared Design Token Layer] — story statement and acceptance criteria
- [Source: _bmad-output/planning-artifacts/epics.md#Epic 1: Foundation — Console Shell, Bilingual Infrastructure, Auth & Workspace] — first-story scaffolding responsibility
- [Source: _bmad-output/planning-artifacts/ux-designs/ux-the_project-2026-08-11/DESIGN.md] — full token set (colors, typography, rounded, spacing, components) and its normative rules
- [Source: _bmad-output/planning-artifacts/architecture/architecture-the_project-2026-08-11/ARCHITECTURE-SPINE.md#Structural Seed] — source tree, dependency graph, AD-1, AD-2
- [Source: _bmad-output/planning-artifacts/architecture/architecture-the_project-2026-08-11/ARCHITECTURE-SPINE.md#Stack] — exact package versions, TypeScript 6.x hold rationale
- [Source: _bmad-output/specs/spec-lawha-frontend/SPEC.md#CAP-1 — Shared token layer] — capability intent and success criteria
- [Source: _bmad-output/specs/spec-lawha-frontend/SPEC.md#Constraints] — Chromium 76 / ES2019 floor prohibitions
- [Source: _bmad-output/planning-artifacts/prds/prd-the_project-2026-08-11/prd.md#12.5 Build-order departure] — why the frontend is built first, ahead of the fourteen-day gate
- Next.js 16.3 requires Node.js `>=20.9.0` — verified via web search 2026-08-12: [Next.js Installation docs](https://nextjs.org/docs/app/getting-started/installation), [Next.js 16.3 release notes](https://nextjs.org/blog/next-16-3)

## Dev Agent Record

### Agent Model Used

claude-sonnet-5

### Debug Log References

- `pnpm install` initially hung/timed out repeatedly against a flaky network (`ECONNRESET` / `ERR_SOCKET_TIMEOUT` retries against registry.npmjs.org). Resolved by adding `.npmrc` (`network-concurrency=4`, higher `fetch-retries`/timeouts); install then completed in ~14.5 min. Unrelated to the story's code.
- `next.config.ts` initially set `eslint.ignoreDuringBuilds` — Next.js 16.3 removed the built-in ESLint integration entirely (no `eslint` key on `NextConfig` any more), so this failed `tsc --noEmit`. Removed the block; lint is a separate CI/workspace step regardless.
- ESLint custom rule (`no-literal-design-values`) initially double-reported: a hex-in-bracket match (`bg-[#0F2BFF]`) fired both the generic hex check and the arbitrary-value check on the same text, and a style-object literal (`{ background: '#FFFFFF' }`) fired both the generic `Literal` visitor and the `Property` visitor. Fixed by masking matched bracket segments before the generic hex/colour-function check, and by skipping the generic `Literal` visitor when the literal is a style-object property value (the `Property` visitor already reports it with a more precise message).
- `apps/player/tsconfig.json` was missing `"node"` in `compilerOptions.types`, so `scripts/generate-tokens-css.ts`'s `node:fs`/`node:url` imports failed typecheck despite `@types/node` being installed. Added `"node"` alongside `"vite/client"`.

### Completion Notes List

- Scaffolded the pnpm workspace from nothing: root config, `apps/console` (Next.js 16.3 + React 19.2.8), `apps/player` (Preact 10.29.7 + Vite 8.0.9, ES2019/Chromium 76 build target), four empty stub packages (`domain`, `adapters`, `manifest-contract`, `i18n`), an empty `supabase/migrations/` placeholder, and a minimal CI workflow (lint, typecheck, test, build, plus the AC3 tier-isolation check).
- Built `packages/tokens` as a new downward-only leaf package (per Dev Notes' justification) transcribing DESIGN.md's `colors`, `typography`, `rounded`, `spacing`, and `components` blocks verbatim. Colour theme-invariance (`alarm`/`amber`/`on-signal` + pairs) and the player-neutral exclusion are both derived/asserted programmatically in `css-variables.ts` rather than hardcoded twice, so the data and the rule can't drift apart silently. `components.ts` keeps the `{table.name}` reference syntax (resolved via `resolve.ts`) instead of pre-resolved literals, so the dark-theme substitution stays driven from one source.
- Wired `apps/console`: `tailwind.config.ts` theme values are `var(--color-X)` / `var(--rounded-X)` / `var(--spacing-X)` references (not raw hex) generated from `packages/tokens`, which is what makes the `[data-theme="dark"]` CSS-variable override reach Tailwind-generated utility classes without a second component table. Verified in the built CSS: `bg-electric` compiles to `background-color:var(--color-electric)`. Added a temporary `/token-check` route (with a theme toggle) as the AC1/AC4 smoke test.
- Wired `apps/player`: a build-time script (`generate-tokens-css.ts`, run via `tsx`) emits the same `:root`/`[data-theme="dark"]` custom-property sheet plus a player-only `.type-*` typography stylesheet (vmin tiers), loaded via plain `<link>` tags — no Tailwind/CSS-in-JS in the player bundle. Manually confirmed the built CSS contains none of the forbidden Chromium 76 features (`clamp()`, `min()`, `max()`, `aspect-ratio`, `:has()`, `oklch`, `color-mix`, `inset-inline-*`, etc.).
- Built a custom ESLint flat-config plugin (`tools/eslint-plugin-lawha`, kept outside `packages/` since it's dev tooling, not a runtime layer) with a `no-literal-design-values` rule catching raw hex/rgb colours, Tailwind arbitrary-value colour/length brackets, and inline-style colour/radius/spacing literals. 14 `RuleTester` fixture tests pass; also live-verified in `apps/console` by injecting a real violation (`style={{ background: '#123456' }}` + `className="rounded-[4px]"`) and confirming both are flagged, then reverting.
- AC3 (tier isolation) is verified twice: statically, `consoleTypography`/`playerTypography` are separate, non-overlapping exports (`packages/tokens/src/typography.ts` throws at import time if they ever overlap); at build time, `scripts/verify-tier-isolation.ts` greps each app's real build output (`apps/console/.next`, `apps/player/dist`) for the other app's `.type-{tier}` class names and fails if found. Ran clean against real builds.
- Full workspace `lint`, `typecheck`, `test`, and `build` all pass from the repo root, matching what the CI workflow runs.
- Not done, correctly out of scope per Dev Notes: no Supabase/Clerk/R2/Merchant-of-Record provisioning, no RTL/bidi/ICU wiring (Story 1.2), no real console/player product surfaces beyond the temporary smoke tests, no broader quality-gate pipeline (E2E/visual/a11y).

### File List

**Root**
- `package.json`
- `pnpm-workspace.yaml`
- `pnpm-lock.yaml`
- `tsconfig.base.json`
- `.gitignore`
- `.nvmrc`
- `.npmrc`
- `.github/workflows/ci.yml`
- `scripts/verify-tier-isolation.ts`

**`packages/tokens`**
- `package.json`, `tsconfig.json`, `vitest.config.ts`
- `src/colors.ts`, `src/typography.ts`, `src/rounded.ts`, `src/spacing.ts`, `src/components.ts`, `src/resolve.ts`, `src/css-variables.ts`, `src/tailwind-theme.ts`, `src/typography-css.ts`, `src/index.ts`
- `test/typography.test.ts`

**`packages/domain`, `packages/adapters`, `packages/manifest-contract`, `packages/i18n`**
- `package.json`, `tsconfig.json`, `src/index.ts` (each)

**`supabase/migrations/`**
- `.gitkeep`

**`tools/eslint-plugin-lawha`**
- `package.json`, `index.js`
- `rules/no-literal-design-values.js`, `rules/no-literal-design-values.test.js`

**`apps/console`**
- `package.json`, `tsconfig.json`, `next.config.ts`, `next-env.d.ts`, `postcss.config.mjs`, `tailwind.config.ts`, `eslint.config.mjs`
- `scripts/generate-tokens-css.ts`
- `app/globals.css`, `app/layout.tsx`, `app/page.tsx`, `app/token-check/page.tsx`, `app/token-check/theme-toggle.tsx`
- `app/generated/tokens.css`, `app/generated/typography.css` (generated at build/dev time, gitignored)

**`apps/player`**
- `package.json`, `tsconfig.json`, `vite.config.ts`, `eslint.config.mjs`, `index.html`
- `scripts/generate-tokens-css.ts`
- `src/main.tsx`, `src/app.tsx`
- `src/generated/tokens.css`, `src/generated/typography.css` (generated at build/dev time, gitignored)

### Change Log

| Date | Change |
| --- | --- |
| 2026-08-12 | Story implemented: monorepo scaffolded from scratch, `packages/tokens` built and wired into both apps, dark-theme CSS-variable substitution verified end to end, AC1 literal-value lint gate added with fixture tests, AC3 tier-isolation verified against real build output. Status set to review. |
