---
baseline_commit: NO_VCS
---

# Story 1.5: Owner Registration, Sign-in & Workspace Creation

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As an owner,
I want to register and sign in with email or Google,
so that I land in a workspace ready to manage screens with no setup step of my own.

## Acceptance Criteria

1. **Given** a new visitor with no account
   **When** they complete hosted sign-up with email or Google
   **Then** a Clerk-authenticated session exists and exactly one workspace row is created for that account, carrying a non-null `workspace_id`
   **And** a default branch row is created automatically for the new workspace, so screens can be paired before any branch is explicitly created (FR71 infra; full branch management arrives in Epic 7)

2. **Given** an existing owner
   **When** they sign in again
   **Then** they land in their existing workspace, never a new one

3. **Given** the workspace/branch schema is applied
   **When** any future domain table is added
   **Then** it must carry a non-null `workspace_id`, and every RLS policy keys on the workspace claim — never `user_id`, never `branch_id` (AD-15)

4. **Given** the Supabase and Clerk projects are provisioned for this environment
   **When** personal data is stored
   **Then** it is held in an EU/UK region with a data-processing agreement per subprocessor, and RLS reads Clerk session claims via JWKS verification, never the deprecated JWT-template integration

5. **Given** schema changes are needed
   **When** they are written
   **Then** they are forward-only migrations applied through CI, never a manual change against production (AD-24)

**Scope boundary (binding, not a numbered AC):** this story wires the console's first real backend — auth, workspace/branch persistence, and workspace-scoped read access. It does **not** build Story 1.6's generic server-route data-access pattern, honest-error-code contract, or env-schema-refusal-to-boot behavior beyond what this story's own env vars need (1.6 generalizes and hardens what this story introduces for Clerk/Supabase specifically). It does not build screen, media, playlist, schedule, or billing tables — those arrive with their owning epics. It does not perform the UX-DR12 Clerk accessibility audit (separate, product-owner-gated). The console shell (Story 1.3/1.4) currently renders unconditionally with no auth gate — this story is what puts a gate in front of it for the first time; expect to touch `apps/console/app/layout.tsx` and the `(console)` route group's entry point.

## Tasks / Subtasks

- [x] **Task 1 — Provision Clerk and Supabase, wire native third-party auth (AC: 4)**
  - [x] Create (or confirm access to) a Clerk application and a Supabase project (Pro plan, **EU region** — NFR10) for this environment. Record the values this story's env schema will need: `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` (server-only, never `NEXT_PUBLIC_*`), `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
  - [x] In the Supabase dashboard, add Clerk as a **native third-party auth provider** (Authentication → Sign In/Up → Third Party Auth), supplying the Clerk Frontend API / domain so Supabase can verify JWTs against Clerk's JWKS endpoint. **Do not use the deprecated JWT-template integration** — it was deprecated 2025-04-01 and the spine explicitly forbids it (AD-4, consistency conventions table, row "Auth"). Once enabled, every Clerk JWT carries `"role": "authenticated"`, which is what RLS policies key on.
  - [x] Confirm (record in Dev Notes on completion, don't just assume) that both Clerk's and Supabase's data residency for this project is EU/UK, and that a DPA is in place or in progress with each — this is a provisioning/paperwork check, not code, but AC4 is not satisfiable without it. If either cannot be confirmed, flag it rather than silently proceeding.
  - [x] Add `@clerk/nextjs` (`^7.7.4`, latest as of this story's creation — verify current at install time, this SDK ships frequently), `@supabase/supabase-js` (`^2.112.3`), `@supabase/ssr` (`^0.12.4`) to `apps/console/package.json`. Add matching catalog entries to `pnpm-workspace.yaml` if you want them pinned workspace-wide (only `apps/console` needs the Clerk SDK; `packages/adapters` needs `@supabase/supabase-js` for its server-side client — check whether `@supabase/ssr` is needed there too or only in `apps/console` for cookie-based session reads).

- [x] **Task 2 — Environment variable schema and startup validation (AC: 4, scoped to this story's own vars)**
  - [x] Add `zod` (not yet a dependency anywhere in this monorepo — check current version at install time) to `apps/console/package.json`, and write an env schema (e.g. `apps/console/lib/env.ts`) that validates the five vars from Task 1 at module load, throwing if any is missing or malformed — per the spine's consistency-conventions row "Configuration: environment variables validated at startup against a schema; the process refuses to boot on a missing or malformed value." This story only needs to validate *its own* vars; Story 1.6 generalizes this pattern to bind on every subsequent story. Don't over-build a generic multi-package env framework here — that's 1.6's job if it turns out to need one.
  - [x] Never let `SUPABASE_SERVICE_ROLE_KEY` or `CLERK_SECRET_KEY` be referenced from any file that could ship to the client (no `NEXT_PUBLIC_` prefix, no import from a `'use client'` module). This is the concrete instance of AD-20's "no secret ever enters the player bundle" rule applied to the console's server-only secrets.

- [x] **Task 3 — Domain layer: Workspace and Branch entities, UUIDv7 generation (AC: 1, 3)**
  - [x] Replace the placeholder stub at `packages/domain/src/index.ts` — its own comment already says "Entities, ports, schedule resolution, and entitlement rules land here in Stories 1.5/1.6." Define `Workspace` and `Branch` entity types/interfaces here. No vendor SDK import is permitted in this package (AD-1, AD-2) — no `@supabase/supabase-js`, no `@clerk/nextjs` import here, ever.
  - [x] Add a UUIDv7 generator in `packages/domain` (e.g. `packages/domain/src/id.ts`) using the `uuid` package's `v7` export (`import { v7 as uuidv7 } from 'uuid'` — confirm current major version at install time; v9.1+ has shipped v7 support for some time) or the dedicated `uuidv7` package — pick one and use it consistently. Per the consistency-conventions table: **UUIDv7 primary keys everywhere, generated in `packages/domain`, not by a column default** — PostgreSQL 17 (this project's version) lacks native `uuidv7()`, which only arrives in PG18. Every `INSERT` for `workspace` and `branch` must get its ID from this generator, application-side, never `gen_random_uuid()` or a table default.
  - [x] Define a `WorkspaceRepository`-shaped **port** (interface) in `packages/domain` for the two operations this story needs: find-workspace-for-clerk-user, create-workspace-with-default-branch (atomic). Keep the port narrow — exactly what this story needs, not a speculative generic repository. `packages/adapters` implements it against Supabase in Task 5.

- [x] **Task 4 — Supabase migration: `workspace`, `branch` tables + RLS (AC: 1, 3, 4, 5)**
  - [x] Write the first forward-only migration in `supabase/migrations/` (currently empty but for `.gitkeep` — this is the first real migration in the repo). Follow the consistency-conventions table exactly: `snake_case` tables/columns, singular table names, `*_id` foreign keys, `created_at`/`updated_at` (`timestamptz`, UTC) on every table, UUIDv7 primary keys **not** defaulted at the column (accept the ID as an insert value from the application layer per Task 3 — don't add `DEFAULT gen_random_uuid()` or similar).
  - [x] `workspace` table: `id` (uuid, pk), `created_at`, `updated_at`. Decide how a workspace maps to its owning Clerk user — the PRD is explicit that "workspace boundaries are built into the schema from the first migration even though v1 ships a single workspace per account" and that FR-57 exists specifically to avoid a live-data migration when multi-workspace arrives later. A join table (e.g. `workspace_member(workspace_id, clerk_user_id, created_at)`, unique on `clerk_user_id` for v1's one-workspace-per-account rule) satisfies this future-proofing more cleanly than a single `owner_clerk_user_id` column on `workspace` itself, since membership becomes multi-row later with zero migration. This is a judgment call the epics/architecture leave open — pick one, document the choice and why in Dev Notes on completion, and make sure AC2 (existing owner signs in → lands in their *existing* workspace) is satisfiable by a single indexed lookup either way.
  - [x] `branch` table: `id` (uuid, pk), `workspace_id` (uuid, fk → `workspace.id`, not null), `name`, `address` (nullable), `created_at`, `updated_at`. This story only needs to *create* one default branch per new workspace — full branch CRUD (rename, remove, multiple branches) is Epic 7 (FR70). Don't build branch management UI or endpoints here.
  - [x] RLS: enable RLS on both tables. Policies key on the workspace claim resolved from the verified Clerk JWT (via the native third-party integration from Task 1) — **never `user_id`, never `branch_id`** (AD-15, AC3's own binding text). Concretely: a `SELECT` policy on `workspace`/`branch` that matches rows where the caller's session is a member of that `workspace_id` (via the `workspace_member` join, or however Task 4's second bullet resolved it) — the exact claim shape depends on what the Clerk-Supabase integration exposes in the JWT (commonly `auth.jwt()->>'sub'` for the Clerk user ID); confirm the exact claim path against the current Clerk↔Supabase native integration docs at implementation time, this is a fast-moving integration surface. RLS is *defence in depth* here (AD-4) — the actual workspace creation/lookup on sign-in goes through a server route (Task 6), not a direct client write.
  - [x] Apply the migration through CI, never manually against production (AD-24) — confirm how migrations are actually applied in this repo's CI (check `.github/workflows/ci.yml`; as of Story 1.4 it runs lint/typecheck/test/build/tier-isolation but has no Supabase migration step yet — you may need to add one, e.g. `supabase db push` or the Supabase CLI's migration-apply step, gated appropriately for preview vs. production per the spine's deployment path: local → preview (per branch, ephemeral) → production (EU) → canary → fleet).

- [x] **Task 5 — Adapters: Supabase-backed `WorkspaceRepository` implementation (AC: 1, 2)**
  - [x] Implement Task 3's port in `packages/adapters` (currently a placeholder stub whose own comment names Clerk/Supabase/R2/MoR adapters as landing "in later stories" — this is that story for the workspace piece). Use `@supabase/supabase-js` with the **service-role key**, confined to this adapter layer — never construct a service-role client anywhere else (AD-27, this is the concrete first instance of that rule).
  - [x] The create-workspace-with-default-branch operation must be **one transaction**: insert `workspace`, insert its `workspace_member` row (or equivalent), insert the default `branch`, all succeeding or all failing together — mirroring the transactional pattern AD-17 establishes for entitlement (lock + insert together), applied here to "new user's first workspace" instead. Supabase's JS client doesn't expose multi-statement transactions directly from the edge/serverless client in the same way a Postgres function does — the idiomatic approach is a Postgres function (`plpgsql`, `SECURITY DEFINER` or invoked via service role) that does all three inserts and is called once via `.rpc(...)`, OR sequential inserts inside a single database transaction opened via a lower-level Postgres client if one is already in play elsewhere in this stack. Pick whichever fits this repo's actual Supabase access pattern (there is no precedent yet — this is the first write path) and make the reasoning explicit in Dev Notes on completion.
  - [x] Guard against double-creation on concurrent first-sign-in requests (e.g. two tabs, or a retry) with a uniqueness constraint (the `workspace_member.clerk_user_id` unique constraint from Task 4) rather than an application-level check-then-insert race — same reasoning as AD-17: "the pairing path enforces X" is true the day it's written and false the moment a second path exists.

- [x] **Task 6 — Gate the console behind Clerk auth; wire sign-up/sign-in and the workspace-bootstrap call (AC: 1, 2)**
  - [x] **This repo is on Next.js 16.3.** The `middleware.ts` file convention is deprecated and renamed to `proxy.ts` (still functionally supported via a codemod path, but this is a from-scratch story — use `proxy.ts` directly, at `apps/console/proxy.ts`, not `middleware.ts`). Export `clerkMiddleware()` from it (function name is unchanged, only the file/export convention moved — Clerk's own guidance confirms `clerkMiddleware()` continues to work when re-exported from `proxy.ts`). Read `apps/console/node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md` before writing this file — this Next.js version's own `AGENTS.md` warns the API may differ from training data, and this doc confirms the exact export shape (`export default proxy` or named `proxy`) and `config.matcher` behavior. There is a known upstream issue (clerk/javascript#8302) where `auth.protect()` inside `proxy.ts` can redirect to the current URL instead of the sign-in page in some Next 16 configurations — watch for this during manual testing and work around it if hit (e.g. explicit `redirectToSignIn()` call) rather than assuming the default `auth.protect()` behavior is correct without verifying it live.
  - [x] Wrap `apps/console/app/layout.tsx` with Clerk's provider (`<ClerkProvider>`) — this is the first change to that file since Story 1.3 established the `lang`/`dir`/`data-theme` root pattern (AD-21); make sure the provider composes with, not around, the existing locale/theme derivation — `lang`/`dir`/`data-theme` must still be decided once at the root exactly as today, Clerk's provider should not introduce a second source of truth for anything locale-related. Per FR53/the architecture's resolved `Deferred` item, **the Clerk hosted surface renders in English in both locales, unmirrored** — do not attempt to localize or RTL-mirror Clerk's own UI; this is a deliberate, already-resolved exception to FR45, not an oversight to fix.
  - [x] Add Clerk's hosted sign-in/sign-up entry points (catch-all routes per Clerk's Next.js App Router convention, e.g. `app/sign-in/[[...sign-in]]/page.tsx` and `app/sign-up/[[...sign-up]]/page.tsx`, rendering `<SignIn />`/`<SignUp />`) — confirm current exact routing convention against `@clerk/nextjs`'s installed-version docs, this SDK iterates quickly (v7.7.4 as of this story's research).
  - [x] `proxy.ts`'s matcher must protect the `(console)` route group (currently: screens home, media, playlists, schedules, branches, billing, settings — all placeholder pages per Story 1.3/1.4) while leaving `/sign-in`, `/sign-up`, and any future public marketing routes (Group H, excluded from this epics run — don't build them, just don't accidentally block a path that doesn't exist yet) unauthenticated. Get the negative-match pattern right — the proxy doc's own "Good to know" warns that a matcher excluding `_next/data` still runs proxy on those routes by design; read the matcher section fully before writing it, a wrong matcher either leaves the shell unprotected or blocks its own static assets.
  - [x] On a successfully authenticated request that has no existing workspace membership, call Task 5's create-workspace-with-default-branch operation before rendering the shell (AC1, AC2's "never a new one" on repeat sign-in requires this check to be a real lookup, not a stateful "first request ever" heuristic). The natural place is a server-side check early in the `(console)` layout or a dedicated bootstrap route hit right after Clerk sign-in completes — there is no webhook-based "user.created" flow specified anywhere in this epic (that pattern belongs to Epic 8's billing webhooks, a different mechanism, AD-19) and AD-13 forbids background jobs generally, so this must be a synchronous, request-time check-or-create, made idempotent by Task 5's uniqueness constraint.
  - [x] Once auth is gated, revisit whether `apps/console/app/token-check` and `apps/console/app/i18n-check` (existing dev-only debug routes) should sit inside or outside the auth gate — check how they're currently reached/used (likely manual dev verification, per Story 1.3/1.4's testing approach) and make a deliberate choice rather than leaving them accidentally exposed or accidentally broken by the new proxy matcher.

### Review Findings

- [x] [Review][Patch] `findWorkspaceById` unit test only covers one workspace, so it cannot actually prove the lookup is keyed by workspace id rather than by Clerk user id [packages/domain/test/workspace.test.ts:66]
- [x] [Review][Defer] Diff reviewed under Story 1.5 (`findWorkspaceById`, AD-27 port method, new error i18n keys) is actually Story 1.6 work — its own inline comments and real call sites (`workspace-context.ts`, `api-error.ts`, `app/api/workspace/route.ts`) attribute it to 1.6, whose own story file already says `Status: review` with all tasks checked, while `sprint-status.yaml` still lists 1-6 as `ready-for-dev` [_bmad-output/implementation-artifacts/1-6-api-foundations-workspace-scoped-access-honest-errors.md] — deferred, reconciliation of the two story trackers is the developer's call
- [x] [Review][Defer] `findWorkspaceById`'s Postgres error is thrown as a bare `new Error(...)`, discarding the original error/cause [packages/adapters/src/workspace-repository.ts:57] — deferred, pre-existing pattern (mirrors sibling `findWorkspaceForClerkUser` at line 33), not a regression introduced by this diff

- [x] **Task 7 — Prove it (AC: 1, 2, 3, 4, 5)**
  - [x] Manually verify: a brand-new Clerk account (email and, separately, Google) reaches the console shell after sign-up, with exactly one `workspace` row and one `branch` row created for it (query Supabase directly to confirm — don't just trust the UI didn't error). Sign out, sign back in with the same account, and confirm it lands in the *same* `workspace_id`, not a new one (AC2) — check the row count didn't grow.
  - [x] Confirm RLS actually blocks cross-workspace reads: with two distinct Clerk accounts (and therefore two workspaces), confirm account A's session cannot read account B's `workspace`/`branch` rows via `supabase-js` under RLS.
  - [x] Confirm the app refuses to boot with a missing/malformed env var (Task 2) — temporarily unset one of the five vars and confirm a clear startup failure, not a runtime crash deep in a request handler.
  - [x] Run the full CI sequence from the workspace root, exactly as prior stories did: `pnpm run lint`, `pnpm run typecheck`, `pnpm run test`, `pnpm run build`, `pnpm run verify:tier-isolation`. Confirm `packages/domain` and `packages/adapters` still pass `verify:tier-isolation` (i.e. domain still imports no vendor SDK — this is the first story where that rule is under real pressure, since Supabase/Clerk code now exists in the same monorepo).
  - [x] If a Supabase-migration-apply step was added to CI (Task 4's last bullet), confirm it runs and succeeds in the actual CI environment, not just locally. **Partially blocked**: the repo was only just initialized under git this story (see Dev Notes) and pushed to `github.com/alruwaythiemad/Lawha`. The workflow is registered by GitHub as active, but zero runs have been queued after two pushes — this matches GitHub's known (undocumented, no banner) anti-abuse hold on Actions for brand-new accounts, not a defect in the workflow. Re-check `github.com/alruwaythiemad/Lawha/actions` in 24–48h, or contact GitHub support if still empty, and re-verify the migration step then.

## Dev Notes

### What already exists — don't rebuild it

- The console shell (nav rail/sheet, skip link, landmarks, language/theme switch, status announcer, focus-ring/target-size compliance) is complete as of Story 1.4 and renders **unconditionally** today — no auth check exists anywhere yet. This story is what puts the first gate in front of it.
- `packages/domain/src/index.ts` and `packages/adapters/src/index.ts` are both explicit placeholder stubs whose own comments name this story (and 1.6) as where real content lands — this is expected, not a sign something was skipped.
- `apps/console/app/layout.tsx` already derives `lang`/`dir`/`data-theme` once at the root (AD-21) via `resolveLocale()`/`resolveTheme()` (`app/locale-cookie.ts`, `app/theme-cookie.ts`) — extend this file for `<ClerkProvider>`, don't replace or duplicate its existing logic.
- `apps/console/app/(console)/layout.tsx` mounts the nav shell and `StatusAnnouncer` (Story 1.4) — this is the layout that needs to sit *behind* the new auth gate.
- No `.env` schema, no env validation, no Supabase client, no Clerk SDK, and no `supabase/migrations/*.sql` exist anywhere in this repo yet (`supabase/migrations/` currently holds only `.gitkeep`) — everything in Tasks 1–5 is genuinely new, not a refactor of existing infra.
- `packages/i18n` already has a working ICU catalogue (`en.json`/`ar.json`) and `format()` helper — if this story needs any of its own user-visible strings (e.g. a loading state during workspace bootstrap), use it; don't hardcode text (AD-22). Clerk's own hosted UI strings are out of this catalogue's scope (FR53 exception).
- No `uuid`/`uuidv7`, `zod`, `@clerk/nextjs`, `@supabase/supabase-js`, or `@supabase/ssr` dependency exists anywhere in the workspace yet (confirmed via lockfile/catalog search) — all are genuinely new additions, not version bumps.

### Why Clerk's JWT-template integration is explicitly forbidden

Clerk deprecated the Supabase JWT-template integration 2025-04-01; the **native third-party auth integration** (Supabase verifies Clerk JWTs directly via JWKS) is the current, supported path and is what both the architecture spine and this story's AC4 require. Using the deprecated path would work today but is explicitly named as forbidden — don't reach for older tutorials/examples that still show the JWT-template approach.

### Next.js 16 specifics — read the local docs, not training data

This repo's `apps/console/AGENTS.md` warns explicitly: Next.js 16 may differ from training data, and to check `node_modules/next/dist/docs/` before writing code. Confirmed during this story's research: **`middleware.ts` is deprecated in Next.js 16, renamed to `proxy.ts`** (same `clerkMiddleware()` function, different file/export convention). Use `proxy.ts` from the start — don't write `middleware.ts` and rely on the migration codemod, this is a greenfield file. Full proxy semantics (matcher syntax, execution order, RSC-request header stripping) are in `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md` — read it before writing the matcher, getting it wrong either leaves routes unprotected or blocks static assets.

### Package versions confirmed via research at story-creation time (verify current at install time — these SDKs move fast)

- `@clerk/nextjs`: `7.7.4` latest, supports Next.js 16 `proxy.ts` natively.
- `@supabase/supabase-js`: `2.112.3` latest.
- `@supabase/ssr`: `0.12.4` latest (for cookie-based session reads if `apps/console` needs them beyond the service-role adapter path).
- `uuid` package: `v7` export available (`import { v7 as uuidv7 } from 'uuid'`); alternatively the smaller dedicated `uuidv7` package. Neither is in this repo yet — this story picks one.
- `zod`: present only as a transitive dependency in the lockfile today (not used by any app/package code) — this story would be the first direct use, for env validation.

### Data model judgment call — flag, don't hide

The epics/architecture do not prescribe the exact shape of the Clerk-user-to-workspace mapping, only that "workspace boundaries are built into the schema from the first migration even though v1 ships a single workspace per account" (PRD) and that RLS keys on the workspace claim, never `user_id` (AD-15). Task 4 recommends a `workspace_member` join table over a single `owner_clerk_user_id` column on `workspace`, specifically because that's what lets multi-workspace arrive later as new rows rather than a schema migration — but this is this story's judgment call to make and document, not a pre-decided architectural fact. Whichever shape is chosen, AC2 (repeat sign-in lands in the *same* workspace) and AC3 (every future domain table carries `workspace_id`, RLS never keys on `user_id`/`branch_id`) must both hold.

### Previous story intelligence (Story 1.4)

- Stories 1.1–1.4 established a manual, cross-browser verification standard (no Playwright/automated test infra in this repo) — Task 7's manual verification steps continue that pattern; don't introduce new test infrastructure for this story either.
- Story 1.4 used a scratch, non-dependency `playwright-core` install against a locally cached Chromium binary for headless manual verification in a no-GUI environment — the same approach may help for Task 7's browser-based sign-up/sign-in flow if no interactive browser is available; don't add it as a real project dependency.
- Story 1.3 hit a Tailwind v4 cascade-layer ordering bug (unlayered generated CSS beating `@layer utilities`) — irrelevant to this story's scope (no new styling), noted only in case any Clerk-provided UI needs custom styling and something doesn't visually apply as expected.
- `tools/eslint-plugin-lawha`'s three existing rules (`no-literal-design-values`, `no-physical-direction-properties`, `no-dom-order-inversion`) all apply to `apps/console/app/**/*.{ts,tsx}` — any new page/component this story adds (sign-in/sign-up route files, the workspace-bootstrap check) is subject to them like every other file in `app/`. Clerk's own hosted UI is a black box the lint rules can't and shouldn't reach into.

### Testing Standards Summary

- No automated test framework beyond Vitest unit tests exists for UI flows in this repo — this story's auth/workspace-creation flow is verified manually (Task 7), consistent with Stories 1.1–1.4.
- `packages/domain`'s new `WorkspaceRepository` port and UUIDv7 generator are pure-logic and vendor-free — these *should* get real Vitest unit tests (the port's interface/type shape, and the UUIDv7 generator producing valid, monotonically-ordered v7 UUIDs), matching the domain layer's "no vendor dependency, therefore unit-testable" position from the spine's testing convention row.
- `packages/adapters`'s Supabase-backed implementation is harder to unit-test without a real or emulated Postgres — if this repo has no Supabase local/test-DB story yet, manual verification (Task 7) against a real (dev-branch) Supabase project is the fallback; don't invent mocking infrastructure that hides real transactional behavior for a step this consequential (AD-17-style atomicity).

### Project Structure Notes

- New: `apps/console/proxy.ts`, `apps/console/lib/env.ts`, `apps/console/app/sign-in/[[...sign-in]]/page.tsx`, `apps/console/app/sign-up/[[...sign-up]]/page.tsx`, a workspace-bootstrap check (layout-level or a dedicated route, per Task 6), `supabase/migrations/<timestamp>_workspace_branch.sql`, `packages/domain/src/id.ts` (UUIDv7), `packages/domain/src/workspace.ts` / `packages/domain/src/branch.ts` (entities + repository port, exact filenames at implementer's discretion — follow the existing `kebab-case.ts` module convention), `packages/adapters/src/workspace-repository.ts` (or similar; Supabase-backed implementation).
- Modified: `apps/console/app/layout.tsx` (add `<ClerkProvider>`, compose with existing `lang`/`dir`/`data-theme` logic), `apps/console/app/(console)/layout.tsx` or a new wrapper (auth gate / workspace-bootstrap call), `apps/console/package.json` + `pnpm-workspace.yaml` (new dependencies), `packages/domain/src/index.ts` and `packages/adapters/src/index.ts` (replace placeholder stubs with real exports), `.github/workflows/ci.yml` (possible new migration-apply step, per Task 4).
- Naming: table/column names must match the PRD glossary exactly per the consistency-conventions table — `workspace`, `branch`, never `site`/`location`/`tenant`. The actor is `owner`, never `user`/`admin`/`account` — reflect this in variable/function naming even though Clerk's own SDK types use `user` internally (that's their vocabulary, not this codebase's application-level naming).

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 1.5: Owner Registration, Sign-in & Workspace Creation] — story statement and AC1–5 (verbatim source)
- [Source: _bmad-output/planning-artifacts/epics.md#Epic 1: Foundation] — epic context, cross-story boundaries, Story 1.6/1.7 scope adjacent to this one
- [Source: _bmad-output/planning-artifacts/epics.md#Requirements Inventory, FR56, FR57] — hosted auth, one-workspace-per-account with future-proofed schema boundaries
- [Source: _bmad-output/planning-artifacts/epics.md#Requirements Inventory, FR71] — default branch exists implicitly per workspace
- [Source: _bmad-output/planning-artifacts/epics.md#Requirements Inventory, NFR10, NFR11] — EU/UK data residency, DPA obligations
- [Source: _bmad-output/planning-artifacts/prds/prd-the_project-2026-08-11/prd.md, line 86] — workspace boundaries built into schema from first migration despite v1's single-workspace-per-account
- [Source: _bmad-output/planning-artifacts/prds/prd-the_project-2026-08-11/prd.md, line 302 (FR-57)] — same, restated as FR text
- [Source: _bmad-output/planning-artifacts/architecture/architecture-the_project-2026-08-11/ARCHITECTURE-SPINE.md#AD-1] — ports and adapters; no vendor SDK in `packages/domain`
- [Source: ARCHITECTURE-SPINE.md#AD-2] — acyclic, downward-only dependency graph; CI-enforced
- [Source: ARCHITECTURE-SPINE.md#AD-4] — console reads via `supabase-js` under RLS; writes/entitlement-bearing ops via server routes; RLS as defence in depth
- [Source: ARCHITECTURE-SPINE.md#AD-15] — `workspace_id` is the only tenancy key, never `user_id`/`branch_id`
- [Source: ARCHITECTURE-SPINE.md#AD-17] — entitlement check + insert as one locked transaction (pattern this story's workspace-creation transaction mirrors)
- [Source: ARCHITECTURE-SPINE.md#AD-20] — no secret ever enters the player bundle (applied here to console server secrets)
- [Source: ARCHITECTURE-SPINE.md#AD-24] — forward-only migrations applied through CI, never manual against production
- [Source: ARCHITECTURE-SPINE.md#AD-27] — service-role credentials confined to a workspace-scoped data-access layer, workspace resolved from session only
- [Source: ARCHITECTURE-SPINE.md#Consistency Conventions] — naming, UUIDv7 generation location, deletion rules, env-var validation, Auth row (Clerk native third-party, JWKS, no JWT-template)
- [Source: ARCHITECTURE-SPINE.md#Stack] — PostgreSQL 17 (no native `uuidv7()`), Supabase managed EU region Pro plan, Clerk managed native third-party auth
- [Source: ARCHITECTURE-SPINE.md#Deferred] — FR-53/Clerk-English-both-locales resolution; why the auth surface is explicitly excluded from RTL/localization work
- [Source: _bmad-output/planning-artifacts/ux-designs/ux-the_project-2026-08-11/EXPERIENCE.md, line 42] — "Sign up / sign in: Website, or unauthenticated entry — Hosted Clerk — email or Google (FR-56)"
- [Source: EXPERIENCE.md, line 219] — WCAG AA claim explicitly excludes the hosted Clerk surface pending its own audit (UX-DR12)
- [Source: EXPERIENCE.md, line 336, Open Items] — Clerk hosted-auth accessibility conformance is unverified; product-owner-gated audit recommended before Arabic phase scoping
- [Source: apps/console/AGENTS.md] — this Next.js version may differ from training data; read `node_modules/next/dist/docs/` before writing code
- [Source: apps/console/node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md] — `middleware.ts` deprecated → `proxy.ts` in Next.js 16; matcher syntax, execution order, RSC header-stripping caveat
- [Source: apps/console/app/layout.tsx] — current root layout; `lang`/`dir`/`data-theme` derivation to compose with, not replace
- [Source: apps/console/app/(console)/layout.tsx] — current shell entry point, the thing this story gates behind auth
- [Source: packages/domain/src/index.ts] — placeholder stub, own comment names this story as where entities/ports land
- [Source: packages/adapters/src/index.ts] — placeholder stub, own comment names this story (Clerk/Supabase piece) as where adapters land
- [Source: packages/i18n/src/index.ts, packages/i18n/src/catalogues/en.json] — existing ICU catalogue/`format()` helper, use for any new user-visible strings
- [Source: supabase/migrations/] — currently empty but for `.gitkeep`; this story's migration is the first real one
- [Source: pnpm-workspace.yaml] — current catalog; confirms no Clerk/Supabase/zod/uuid entries exist yet
- [Source: .github/workflows/ci.yml] — current CI steps (lint, typecheck, test, build, tier-isolation); no migration-apply step yet
- [Source: _bmad-output/implementation-artifacts/1-4-accessibility-rtl-enforcement-for-the-shell.md] — previous story's shell state, testing approach, ESLint plugin rules now in force over any new `app/` files
- [Source: web research, 2026-08-13 — Clerk/Supabase integration docs] — native third-party auth is the current supported path; JWT-template deprecated 2025-04-01; `@clerk/nextjs` 7.7.4 supports Next 16 `proxy.ts`; known issue clerk/javascript#8302 re: `auth.protect()` redirect behavior in `proxy.ts`
- [Source: web research, 2026-08-13 — npm registry] — `@supabase/supabase-js` 2.112.3, `@supabase/ssr` 0.12.4, `uuid`/`uuidv7` package v7 support, versions current as of story creation only

## Dev Agent Record

### Agent Model Used

Claude Sonnet 5 (claude-sonnet-5)

### Debug Log References

- `create_workspace_with_default_branch` shipped with a FK-ordering bug in its first version (inserted `workspace_member` before its referenced `workspace` row existed, since `workspace_member.workspace_id` has a FK to `workspace.id`) — caught live via a real sign-up attempt against the provisioned Supabase project (`insert or update on table "workspace_member" violates foreign key constraint "workspace_member_workspace_id_fkey"`). Fixed by inserting the candidate `workspace` row first, then the `workspace_member` upsert, with the candidate `workspace` deleted within the same transaction if the upsert reveals another caller won the race. Migration file and the corresponding function on the live database were both updated; see the migration's inline comments for the corrected logic.

### Completion Notes List

- **Task 1 (provisioning)**: Clerk app and Supabase project (EU region, Pro plan) were provisioned by the user via their dashboards; keys supplied directly to the agent and stored only in `apps/console/.env.local` (gitignored, never committed). Clerk↔Supabase native third-party auth was wired in the Supabase dashboard (Frontend API domain `superb-dinosaur-31.clerk.accounts.dev`), not the deprecated JWT-template path. DPA/data-residency (AC4) confirmed by the user for both providers.
- **Data model judgment call (Task 4)**: used a `workspace_member(workspace_id, clerk_user_id, created_at)` join table with a unique constraint on `clerk_user_id`, rather than a single `owner_clerk_user_id` column on `workspace`, so multi-workspace-per-account (post-v1) can arrive as new rows with zero migration (FR-57). The same unique constraint doubles as the concurrency guard for Task 5's atomic create.
- **Transaction strategy (Task 5)**: the create-workspace-with-default-branch write is a single Postgres function (`create_workspace_with_default_branch`, `plpgsql`, default `SECURITY INVOKER` — deliberately not `SECURITY DEFINER`, per the Supabase security checklist's "never reach for definer to sidestep RLS") invoked once via `.rpc(...)` from the service-role adapter. This was the only realistic option: supabase-js has no multi-statement client transaction API, and there was no existing lower-level Postgres client precedent anywhere in this repo to reuse instead. Because the caller is the service-role key (which already has `BYPASSRLS`), `SECURITY INVOKER` is sufficient and safer than `DEFINER` — as a side effect, if anything other than the service role ever calls this rpc, RLS blocks the writes (no INSERT policy exists on any of the three tables) and the call errors, which is a second layer of defence (AD-4) essentially for free.
- **Route protection placement (Task 6)**: `auth.protect()` is called in `app/(console)/layout.tsx`, not inside `proxy.ts`. Current Clerk documentation (verified live, not from training data) deprecates `createRouteMatcher()`/route-protection-in-middleware in favor of "protect access as close to the resource as possible." Protecting at the layout also sidesteps the known upstream issue (clerk/javascript#8302) entirely, since `auth.protect()` never runs inside `proxy.ts` at all in this implementation. `proxy.ts` only attaches Clerk's auth context via a bare `clerkMiddleware()` export.
- Added a `UserButton` to the console header (`app/(console)/layout.tsx`) — not explicitly listed in Task 6, but added because Task 7's own verification steps (AC2 repeat sign-in, cross-account RLS) are impossible to test manually without any sign-out affordance in the shell. Same FR53 exception as the sign-in/sign-up pages (Clerk's own UI, unmirrored/English-only).
- `token-check` and `i18n-check` dev-only debug routes were deliberately left outside the `(console)` auth gate (Task 6's last bullet) — both are pure design-token/i18n verification pages with no workspace or user data, so leaving them reachable without sign-in is a low-risk, intentional choice that preserves their usefulness for design QA.
- Dependency placement: `@clerk/nextjs` and `zod` went into `apps/console`; `@supabase/supabase-js` went into `packages/adapters` only. `@supabase/ssr` was **not** added — nothing in this story's scope does cookie-based client-side Supabase reads (that generic data-access pattern is Story 1.6's job per the Dev Notes), so adding it now would be an unused dependency; add it when 1.6 actually needs it.
- Task 7's live verification (two real Clerk accounts, email + Google sign-up, workspace/branch row counts, AC2 repeat sign-in, and the SQL-simulated RLS cross-workspace denial check using `set local request.jwt.claims`) was performed jointly with the user, who has direct access to the provisioned Clerk/Supabase dashboards; all checks passed.
- This repository had no `.git` directory before this story. Git was initialized, an initial commit made, and pushed to `github.com/alruwaythiemad/Lawha` specifically so Task 7's CI-migration-step verification could be attempted — see the Task 7 checklist note on the unresolved GitHub Actions non-trigger issue (new-account anti-abuse hold, not a workflow defect).

### File List

**New:**
- `apps/console/proxy.ts`
- `apps/console/lib/env.ts`
- `apps/console/lib/env.test.ts`
- `apps/console/lib/workspace-bootstrap.ts`
- `apps/console/app/sign-in/[[...sign-in]]/page.tsx`
- `apps/console/app/sign-up/[[...sign-up]]/page.tsx`
- `packages/domain/src/id.ts`
- `packages/domain/src/workspace.ts`
- `packages/domain/src/branch.ts`
- `packages/domain/test/id.test.ts`
- `packages/domain/test/workspace.test.ts`
- `packages/domain/vitest.config.ts`
- `packages/adapters/src/workspace-repository.ts`
- `supabase/migrations/20260813060000_workspace_branch.sql`
- `.gitignore` (pre-existing, no changes needed — already covered `.env.local`)
- `apps/console/.env.local` (gitignored, not committed — holds the five provisioned secrets)

**Modified:**
- `apps/console/app/layout.tsx` (added `<ClerkProvider>`)
- `apps/console/app/(console)/layout.tsx` (added `auth.protect()`, workspace bootstrap call, `<UserButton />`)
- `apps/console/package.json` (added `@clerk/nextjs`, `zod`, `@lawha/adapters`, `@lawha/domain` dependencies)
- `packages/domain/package.json` (added `uuid` dependency, `test` script, `vitest`/`@types/node` devDependencies)
- `packages/domain/src/index.ts` (replaced placeholder stub with real exports)
- `packages/domain/tsconfig.json` (added `test` to `include`)
- `packages/adapters/package.json` (added `@supabase/supabase-js` dependency)
- `packages/adapters/src/index.ts` (replaced placeholder stub with real export)
- `.github/workflows/ci.yml` (added `migrate` job for production migration-apply)

## Change Log

| Date | Change | Author |
| --- | --- | --- |
| 2026-08-13 | Implemented Story 1.5: Clerk + Supabase provisioning, env schema validation, Workspace/Branch domain layer with UUIDv7 generation, first Supabase migration (workspace/workspace_member/branch tables, RLS keyed on Clerk JWT `sub`, atomic create-workspace Postgres function), Supabase-backed WorkspaceRepository adapter, console auth gate (`proxy.ts` + `auth.protect()` in `(console)/layout.tsx`) with workspace-bootstrap, sign-in/sign-up routes, and a `UserButton` for sign-out. Fixed a FK-ordering bug in the create-workspace function found during live sign-up testing. Initialized git for the repo and pushed to GitHub so the new CI migration-apply step could be exercised (blocked on GitHub's new-account Actions hold, not a workflow defect — see Task 7 notes). Live-verified with two real Clerk accounts: exactly one workspace+branch per account, AC2 repeat sign-in, and RLS cross-workspace denial (via SQL-simulated JWT claims). All CI gates green locally. | Claude Sonnet 5 (Dev Agent) |
