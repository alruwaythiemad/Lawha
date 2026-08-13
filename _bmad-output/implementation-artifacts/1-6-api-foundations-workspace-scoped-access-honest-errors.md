---
baseline_commit: 0902d8e624a1e17debc5d4788bbd9fbe5ae11bfc
---

# Story 1.6: API Foundations — Workspace-Scoped Access & Honest Errors

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As an owner,
I want every action I take to be scoped to my own workspace and every error to tell me what happened and what to do next,
so that I never see another company's data or a raw failure message.

## Acceptance Criteria

1. **Given** a server route needs to read or write data
   **When** it is written
   **Then** service-role credentials are confined to a data-access layer whose every function takes a workspace as a required argument, resolved from the authenticated session — never from a request parameter, path segment, or body (AD-27)

2. **Given** the console reads data directly
   **When** it queries via `supabase-js`
   **Then** it reads under RLS keyed on Clerk session claims; every write and every entitlement-bearing operation instead goes through a server route handler, with RLS remaining enabled everywhere as defence in depth (AD-4)

3. **Given** any API route in the system
   **When** it fails
   **Then** the response carries a stable machine error code and a message key resolved from the ICU catalogue in the caller's language — never a bare code, stack trace, or generic failure string (NFR9), binding on every subsequent story in this document

4. **Given** the service starts with a missing or malformed required environment variable
   **When** boot is attempted
   **Then** the process refuses to start rather than running with a partially valid configuration

**Scope boundary (binding, not a numbered AC):** this story generalizes the pattern Story 1.5 introduced for Clerk/Supabase specifically into a reusable, project-wide contract every later story's API routes must follow. It builds no new domain feature, no new table, and no new UI surface — there is no new screen/media/playlist/schedule/billing functionality here. Concretely this story produces: (a) a reusable `resolveWorkspaceContext()`-shaped helper that every future server route handler calls to get `{ workspaceId, clerkUserId }` from the session (never from `params`/body/query) before touching the data-access layer; (b) a typed API-error envelope (`{ code, messageKey, message }`) plus a route-handler wrapper that turns thrown domain/adapter errors into that envelope consistently; (c) generalization of `apps/console/lib/env.ts` into a pattern other packages can extend without duplicating boot-refusal logic per package, if warranted — don't over-engineer a multi-package env framework if one env module per app remains simplest; (d) at least one real route handler exercising the whole path end-to-end, since AD-27/AD-4/NFR9 are unverifiable without one. Story 1.5 already proved the transactional workspace-creation write goes through `packages/adapters`, not a route — reuse that precedent, don't re-litigate it.

## Tasks / Subtasks

- [x] **Task 1 — Define the API error contract (AC: 3)**
  - [x] In a shared location reachable from `apps/console`'s route handlers (e.g. `apps/console/lib/api-error.ts`, or `packages/domain` if the error shape itself should be vendor-free and reusable by a future device-API-adjacent package — prefer `apps/console/lib` unless a second consumer already exists, since `packages/manifest-contract`/`packages/domain` importing Next.js response types would violate AD-1's no-framework-coupling intent) define an `ApiError` type: `{ code: string; messageKey: MessageKey; status: number; values?: MessageValues }`. `code` is the stable machine code (e.g. `WORKSPACE_NOT_FOUND`, `VALIDATION_FAILED`, `UNAUTHENTICATED`); `messageKey` must be a real key in `packages/i18n`'s catalogue (compile-time checked via the existing `MessageKey` type export from `packages/i18n/src/catalogue.ts` — reuse it, don't redefine a parallel key type).
  - [x] Add the new ICU catalogue entries this story's own error paths need to `packages/i18n/src/catalogues/en.json` **and** `ar.json` in the same change (CI already fails the build on a missing key per Story 1.2's AC — reuse that gate, don't add a second one). At minimum: an "unauthenticated" message, a "workspace not found / not bootstrapped" message, and a generic-but-honest fallback distinct from the existing `common.errorGeneric` (that key is a UI-copy fallback from Story 1.2/1.3, not this story's server error contract — don't repurpose it silently; add a new key such as `error.serverGeneric` if a fallback message is needed, and document why it differs from `common.errorGeneric` if both survive).
  - [x] Write a small handler wrapper (e.g. `withApiErrorHandling(handler)` or an equivalent thin function) that route handlers use to catch thrown `ApiError`s (and unexpected errors, mapped to a generic 500 `ApiError`) and serialize them to a consistent JSON response shape: `{ code, message }` where `message` is the already-formatted string from `packages/i18n`'s `format(locale, messageKey, values)` — the client never receives a bare key, it receives the resolved string, per NFR9's "no bare codes... reach a person." Locale for formatting comes from the same server-resolved locale source `apps/console` already uses (`app/locale-cookie.ts` — reuse it, this story doesn't invent a second locale-resolution path).

- [x] **Task 2 — Generalize workspace-scoped session resolution (AC: 1, 2)**
  - [x] Add a `resolveWorkspaceContext()` function (e.g. `apps/console/lib/workspace-context.ts`) that: reads the authenticated Clerk session (`auth()` from `@clerk/nextjs/server`, the same primitive already in use via `auth.protect()` in `app/(console)/layout.tsx`), extracts the Clerk user ID, calls `ensureWorkspaceForClerkUser` (already exists at `apps/console/lib/workspace-bootstrap.ts` from Story 1.5 — **reuse it, do not reimplement workspace lookup**) to get the `Workspace`, and returns `{ workspaceId: workspace.id, clerkUserId }`. If no session exists, throw the `UNAUTHENTICATED` `ApiError` from Task 1.
  - [x] This function is the **only** sanctioned way any future route handler obtains a `workspaceId` to pass into a data-access-layer call. Document (in this function's own comment, and restated in Dev Notes below) that a route handler reading `workspaceId` from `req.json()`, a path segment, or a query string is a defect per AD-27 — this is the concrete enforcement point for that architectural rule, and every later epic's route handlers depend on this story having built it correctly.
  - [x] Confirm this composes with the existing AD-27 adapter shape from Story 1.5: `createWorkspaceWithDefaultBranch`/`findWorkspaceForClerkUser` already take no `workspaceId` param by design (workspace doesn't exist yet at that point) — this story's generalization targets every *future* data-access function, which by AD-27 must take `workspaceId` as a required argument. There is no existing workspace-scoped read/write function to retrofit yet (Story 1.5 built workspace bootstrap only) — Task 3's demonstration route is what proves the pattern for the first time.

- [x] **Task 3 — One real route handler exercising the full contract end-to-end (AC: 1, 2, 3)**
  - [x] Build one small, real server route handler under `apps/console/app/api/` (Next.js 16 Route Handler convention — confirm exact file/export shape against `apps/console/node_modules/next/dist/docs/` per this repo's `AGENTS.md` warning, the same caution Story 1.5 already applied to `proxy.ts`) that: calls `resolveWorkspaceContext()` (Task 2), performs one real workspace-scoped operation, and is wrapped in `withApiErrorHandling` (Task 1). The workspace record itself is the only domain data that exists after Story 1.5 — a sensible minimal choice is a `GET /api/workspace` handler that returns the current workspace's `id`/`createdAt` (read-only, no new write path, no new table), proving AD-27 (workspace resolved from session, passed explicitly to a data-access function) and AD-4 (this is a read, so it's legitimate for the console to instead read directly via `supabase-js` under RLS — build this one as a route handler anyway specifically to prove the *route-handler* half of the pattern generalizes, since Epic 2 onward is where writes/entitlement-bearing routes actually land). Do not build a new table, new domain entity, or new UI page for this — the sole purpose is proving the reusable pattern before Epic 2 depends on it.
  - [x] Add a companion data-access function in `packages/adapters` (e.g. `findWorkspaceById(client, workspaceId)` on the existing `SupabaseWorkspaceRepository`, or a new narrowly-scoped function/port if that fits the existing `WorkspaceRepository` port shape better — extend the existing `packages/domain/src/workspace.ts` port rather than creating a parallel one) that takes `workspaceId` as a required argument per AD-27, and is called from the Task 3 route handler via `resolveWorkspaceContext()`'s output — never called with a workspace ID sourced any other way.
  - [x] Trigger at least one real failure path through this route (e.g. call it unauthenticated, or force a not-found workspace state) and confirm the response is the honest `{ code, message }` shape from Task 1, not a Next.js default error page, a stack trace, or `common.errorGeneric`-style genericness with no actionable content.

- [x] **Task 4 — Generalize environment-variable boot-refusal beyond Story 1.5's scope (AC: 4)**
  - [x] Review `apps/console/lib/env.ts` (Story 1.5's five-var schema) and confirm it already satisfies this story's AC4 for `apps/console` — it does (module-load-time `safeParse`, throws on failure). This story's job is to confirm the pattern is *documented as the binding convention for every subsequent story's new env vars* (add to this story's Dev Notes / a short comment in `env.ts` itself if not already present) rather than rebuild it — Story 1.5's Dev Notes already flagged this generalization as 1.6's job, so treat `env.ts` as substantially done, not a rewrite target.
  - [x] Check whether any other package/app in the monorepo reads `process.env` directly without going through a validated schema (grep `process.env` across `apps/`, `packages/`) — if `packages/adapters` or any other package reads env directly (it currently does not; Story 1.5's Dev Notes confirm `packages/adapters` receives config as explicit function arguments, never reads `process.env` itself), leave that pattern intact; don't introduce a second env-reading path into a vendor-free package.
  - [x] Do not add a new env var in this story unless something in Tasks 1–3 actually requires one (it likely does not — Task 3's demo route reuses Story 1.5's existing Supabase/Clerk vars). If none is needed, state that explicitly in Dev Notes rather than inventing one to have something to show for this task.

- [x] **Task 5 — Prove it (AC: 1, 2, 3, 4)**
  - [x] Manually verify: call the Task 3 route while authenticated — confirm it returns the correct workspace for the signed-in account (reuse the two-Clerk-account setup from Story 1.5's own verification if still available) and that a second account gets its own workspace's data, never the first account's (this is AD-27's cross-tenant leak check, generalized from Story 1.5's RLS-only version to the service-role/route-handler path).
  - [x] Call the route unauthenticated (no session) and confirm the response is the `UNAUTHENTICATED` `ApiError` shape — a resolved, catalogue-sourced message in the correct locale, correct HTTP status, no stack trace, no default framework error page.
  - [x] Confirm the new/changed ICU catalogue keys pass the existing CI catalogue-completeness gate (`pnpm run typecheck` for the compile-time `MessageKey` check; whatever Vitest parity test Story 1.2 established for `en.json`/`ar.json` key parity — locate and reuse it, don't write a second one).
  - [x] Run the full CI sequence from the workspace root, exactly as prior stories did: `pnpm run lint`, `pnpm run typecheck`, `pnpm run test`, `pnpm run build`, `pnpm run verify:tier-isolation`. Confirm `packages/domain` and `packages/adapters` still import no vendor SDK beyond what Story 1.5 already introduced, and that the new `ApiError`/`withApiErrorHandling` code (if placed in `apps/console/lib`) does not leak into `packages/domain`.

### Review Findings

- [x] [Review][Patch] `withApiErrorHandling` has an unguarded escape hatch: `resolveLocale()` runs before the `try` block, and `format()` inside the `catch` block is itself unguarded — if either throws, the wrapper meant to guarantee every route error becomes an honest `{code, message}` JSON response instead throws unhandled, breaking NFR9's contract for every future route that reuses it. [apps/console/lib/api-error.ts:32] — fixed: locale resolution and formatting now run inside an outer try/catch with a hardcoded, non-localized fallback response if either throws.
- [x] [Review][Patch] `apps/console/app/api/workspace/route.ts` (the story's own end-to-end demonstration of AD-27/AD-4/NFR9) has zero test coverage of the composed handler — no test verifies the success JSON shape, the 404 mapping when `findWorkspaceById` returns `null`, or that `resolveWorkspaceContext`/`withApiErrorHandling` compose correctly together (existing tests only cover `withApiErrorHandling` and `resolveWorkspaceContext` in isolation). [apps/console/app/api/workspace/route.ts] — fixed: added `apps/console/app/api/workspace/route.test.ts` covering the success shape, the 404 mapping, and the 401/unauthenticated mapping.
- [x] [Review][Defer] Unexpected 500 errors in `withApiErrorHandling` are caught and mapped to a generic response with no server-side logging anywhere — a real production bug would leave zero trace. No logging/observability infrastructure exists yet anywhere in this repo (confirmed: no logger module, no Sentry, no `console.error` in any route handler), so this is a repo-wide gap to address with dedicated infra work, not a fix scoped to this story. [apps/console/lib/api-error.ts:45] — deferred, pre-existing gap this story doesn't introduce

## Dev Notes

### What already exists — don't rebuild it

- `apps/console/lib/env.ts` (Story 1.5): validated env schema, throws at module load on missing/malformed values — this **is** AC4's boot-refusal mechanism; this story documents it as the binding pattern, it does not replace it.
- `apps/console/lib/workspace-bootstrap.ts`: `ensureWorkspaceForClerkUser(clerkUserId)` — the only sanctioned way to get-or-create a workspace for a signed-in user. Task 2's `resolveWorkspaceContext()` must call this, not reimplement workspace lookup.
- `packages/adapters/src/workspace-repository.ts`: `SupabaseWorkspaceRepository` implementing `WorkspaceRepository` (`packages/domain/src/workspace.ts`) — service-role client confined here per AD-27, constructed once in `apps/console/lib/workspace-bootstrap.ts`. Extend this class/port for Task 3's read rather than building a second repository or a second service-role client construction site (AD-27 explicitly names this as the failure mode to prevent: "no route handler holds a service-role client directly").
- `apps/console/app/(console)/layout.tsx`: calls `auth.protect()` (Clerk) then `ensureWorkspaceForClerkUser`. This is the existing precedent for "resolve session → resolve workspace" — Task 2 generalizes this exact sequence into a reusable function so route handlers (which don't go through this layout) can do the same thing.
- `packages/i18n`: `format(locale, key, values)` (`packages/i18n/src/catalogue.ts`) and the compile-time `MessageKey` type derived from `en.json`. Reuse both directly — this story adds catalogue *entries*, not a new formatting mechanism.
- No API route handlers exist anywhere in this repo yet (`apps/console/app/i18n-check/set-locale/route.ts` is the only `route.ts` file, and it's a dev-only cookie-setter with no error contract, no workspace scoping, and no auth — do not treat it as precedent for this story's pattern). Task 3 is genuinely the first "real" route handler.
- `common.errorGeneric` (`packages/i18n/src/catalogues/en.json`) already exists as a UI-copy fallback from Stories 1.2/1.3 — it is not this story's server-error message-key mechanism. Don't conflate the two; add distinct keys for the server error contract if a generic fallback is needed there.

### Why this story has almost no new domain surface

Unlike Story 1.5 (which stood up real infrastructure — Clerk, Supabase, migrations, a repository), this story's job is almost entirely to **generalize a pattern from one concrete instance into a reusable contract**, per its own Dev Notes in Story 1.5 ("1.6 generalizes and hardens what this story introduces for Clerk/Supabase specifically"). Resist the temptation to build new features to have more to show — the acceptance criteria are about the *shape* of every future route handler (AD-27, AD-4, NFR9), not about new functionality. Epic 2 onward is where this pattern gets exercised for real (screens, pairing, entitlement); this story's job is to make sure that work doesn't have to invent the pattern from scratch or diverge across stories.

### NFR9 binds every subsequent story

AC3's text is explicit: this rule is "binding on every subsequent story in this document." Once this story ships `ApiError`/`withApiErrorHandling`, every later route handler (Epic 2's device/claim endpoints, Epic 4's uploads, Epic 8's billing, etc.) is expected to reuse it rather than inventing a per-story error shape. Make the wrapper generic enough to survive that reuse (it will be called from routes with wildly different domains) but resist adding speculative fields no consumer needs yet.

### Route Handler conventions in Next.js 16 — verify against local docs, not training data

Story 1.5 already hit two Next.js 16 API-shape surprises (`proxy.ts` replacing `middleware.ts`; a `clerk/javascript#8302` redirect quirk worked around by moving `auth.protect()` into the layout rather than `proxy.ts`). This repo's own `apps/console/AGENTS.md` warns this Next.js version's conventions may differ from training data — read `apps/console/node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/route.md` (or the current equivalent path) before writing Task 3's handler, particularly for the exported HTTP-method function shape and how to read the Clerk session inside a Route Handler (`auth()` vs. `auth.protect()` — a Route Handler is not behind the `(console)` layout's `auth.protect()` call, so it needs its own auth check, which is exactly what `resolveWorkspaceContext()` must perform).

### Testing Standards Summary

- Consistent with Stories 1.1–1.5: no automated E2E/integration test framework in this repo — Task 5's manual verification (real authenticated/unauthenticated calls against the Task 3 route) is the verification method, not new test infrastructure.
- `packages/domain`/`packages/adapters` additions (if Task 3's data-access function lands there) should get Vitest unit tests where they're pure logic and vendor-free, matching Story 1.5's precedent (`packages/domain/test/*.test.ts`) — the actual Supabase-backed adapter call remains manually verified against a real dev-branch project, same rationale Story 1.5 gave (no mocking infrastructure that hides real RLS/transactional behavior).
- The `ApiError`/`withApiErrorHandling` wrapper (if it lives in `apps/console/lib`) is a good candidate for a focused Vitest unit test (does it map a thrown `ApiError` to the right JSON shape/status; does it map an unexpected error to a safe 500) — `apps/console` already has a working Vitest setup (`apps/console/lib/env.test.ts` from Story 1.5) to follow as a pattern.

### Project Structure Notes

- New (expected, exact filenames at implementer's discretion — follow existing `kebab-case.ts` convention): `apps/console/lib/api-error.ts` (or similar), `apps/console/lib/workspace-context.ts`, `apps/console/app/api/workspace/route.ts` (Task 3's demonstration route — adjust path if a more natural minimal read already fits better, but stay inside `apps/console/app/api/`, matching the architecture spine's "console API routes are resource-shaped" naming convention).
- Modified (likely): `packages/i18n/src/catalogues/en.json` and `ar.json` (new error message keys, added together), `packages/domain/src/workspace.ts` (if the `WorkspaceRepository` port grows a `findWorkspaceById`-shaped method), `packages/adapters/src/workspace-repository.ts` (implementation of the above).
- Not modified: `supabase/migrations/` (no new table — Task 3 reads the existing `workspace` table), `apps/console/lib/env.ts` (reviewed, not rewritten, per Task 4), `apps/console/proxy.ts`, `apps/console/app/(console)/layout.tsx` (Task 3's route sits outside the console-shell layout entirely, under `app/api/`).
- Naming: continue the PRD glossary discipline Story 1.5 established — `workspace`, never `tenant`/`account`/`org`; the actor is `owner`, never `user` (Clerk's own SDK vocabulary is the one accepted exception, as before).

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 1.6: API Foundations — Workspace-Scoped Access & Honest Errors] — story statement and AC1–4 (verbatim source)
- [Source: _bmad-output/planning-artifacts/epics.md#Epic 1: Foundation] — epic context, cross-story boundaries
- [Source: _bmad-output/planning-artifacts/epics.md#Additional Requirements, "Data model and tenancy"] — AD-27 restated: every server-side data access explicitly workspace-scoped, workspace resolved from session only
- [Source: _bmad-output/planning-artifacts/epics.md#Additional Requirements, "Consistency conventions"] — "Every API error carries a stable machine code and a message key resolved from the ICU catalogue... no bare codes, stack traces, or generic failure strings reach a person"; "Environment variables validated at startup against a schema; the process refuses to boot on a missing or malformed value"
- [Source: ARCHITECTURE-SPINE.md#AD-4] — writes are server-mediated; RLS is defence in depth, never the sole enforcement of a rule that isn't a row predicate
- [Source: ARCHITECTURE-SPINE.md#AD-27] — service-role credentials confined to a data-access layer whose every function takes a workspace as a required argument; workspace resolved from session, never param/path/body
- [Source: ARCHITECTURE-SPINE.md#Consistency Conventions, "Error shape" row] — stable machine code + ICU message key, no bare codes/stack traces/generic strings (NFR-9)
- [Source: ARCHITECTURE-SPINE.md#Consistency Conventions, "Configuration" row] — env vars validated at startup, refuses to boot on missing/malformed value, no secret enters the player bundle (AD-20)
- [Source: ARCHITECTURE-SPINE.md#Consistency Conventions, "State mutation" row] — all mutation flows through server route handlers (AD-4); derived state computed at read time, never reconciled by a job (AD-13)
- [Source: EXPERIENCE.md, line 82, "Voice and Tone"] — "Every message names the condition and the next action (NFR-9). No bare error codes, no generic failure strings." — the product-copy restatement of AC3, binding on the message text this story's catalogue keys hold
- [Source: _bmad-output/implementation-artifacts/1-5-owner-registration-sign-in-workspace-creation.md, Scope boundary] — Story 1.5 explicitly deferred "Story 1.6's generic server-route data-access pattern, honest-error-code contract, or env-schema-refusal-to-boot behavior beyond what this story's own env vars need" to this story
- [Source: apps/console/lib/env.ts] — existing five-var schema and boot-refusal mechanism (Story 1.5), the AC4 precedent this story documents as binding, not rebuilds
- [Source: apps/console/lib/workspace-bootstrap.ts] — existing `ensureWorkspaceForClerkUser`, reused by Task 2's `resolveWorkspaceContext()`
- [Source: packages/adapters/src/workspace-repository.ts] — existing `SupabaseWorkspaceRepository`, the AD-27 service-role-confinement precedent Task 3 extends
- [Source: packages/domain/src/workspace.ts] — existing `WorkspaceRepository` port shape, extend rather than duplicate
- [Source: packages/i18n/src/catalogue.ts] — existing `format()`/`MessageKey` mechanism, reused for the error-message contract
- [Source: packages/i18n/src/catalogues/en.json] — existing catalogue, including `common.errorGeneric` (distinct from this story's server-error keys)
- [Source: apps/console/app/i18n-check/set-locale/route.ts] — the only existing `route.ts` in the repo; explicitly not a pattern precedent for this story (dev-only, no auth, no error contract)
- [Source: apps/console/AGENTS.md] — this Next.js version may differ from training data; read `node_modules/next/dist/docs/` before writing Route Handler code
- [Source: .github/workflows/ci.yml] — existing CI steps (lint, typecheck, test, build, tier-isolation) this story's changes must keep green; no changes to this file expected (no new migration, no new secrets)

## Dev Agent Record

### Agent Model Used

claude-sonnet-5

### Debug Log References

None — no unresolved failures during implementation. `pnpm run lint`, `typecheck`, `test`, `build`, and `verify:tier-isolation` all passed on the first run after implementation.

### Completion Notes List

- **Task 1**: `ApiError` implemented as an `Error` subclass (not a plain object) in `apps/console/lib/api-error.ts` so it can be `throw`n and caught with `instanceof` inside `withApiErrorHandling`. Added three catalogue keys to `en.json`/`ar.json`: `error.unauthenticated`, `error.workspaceNotFound`, `error.serverGeneric` (distinct from the pre-existing `common.errorGeneric` UI-copy fallback, per the story's own instruction not to conflate the two). `withApiErrorHandling` resolves locale via the existing `app/locale-cookie.ts`, maps a thrown `ApiError` to `{ code, message }` with its own status, and maps any other thrown error to a generic `{ code: 'INTERNAL_ERROR', message: <error.serverGeneric> }` 500 — no stack trace or raw error message ever reaches the response body.
- **Task 2**: `resolveWorkspaceContext()` in `apps/console/lib/workspace-context.ts` calls `auth()` (not `auth.protect()`, since a Route Handler sits outside the `(console)` layout's gate and needs its own check), throws `UNAUTHENTICATED` if no session, then calls the existing `ensureWorkspaceForClerkUser` from Story 1.5's `workspace-bootstrap.ts` — no workspace lookup reimplemented. Returns `{ workspaceId, clerkUserId }` sourced only from the session, never from a request.
- **Task 3**: Added `findWorkspaceById(workspaceId)` to the `WorkspaceRepository` port (`packages/domain/src/workspace.ts`) and its Supabase implementation (`packages/adapters/src/workspace-repository.ts`), plus a thin `findWorkspaceById` export from `workspace-bootstrap.ts` so the route handler never constructs its own service-role client (AD-27's single-construction-site rule from Story 1.5 preserved). Built `GET /api/workspace` (`apps/console/app/api/workspace/route.ts`) — the first real Route Handler in this repo — composing `resolveWorkspaceContext()` + `findWorkspaceById()` + `withApiErrorHandling()`. Verified the Next.js 16 Route Handler export shape (`export async function GET()`) against the local `node_modules/next/dist/docs` per `apps/console/AGENTS.md`'s warning.
- **Task 4**: Reviewed `apps/console/lib/env.ts` — confirmed it already satisfies AC4 (module-load-time `safeParse`, throws on failure) and added a comment documenting it as the binding pattern for every later story's new env vars. Grepped `apps/`/`packages/` for direct `process.env` reads: only `env.ts` itself does; `packages/adapters` and every other package still receive config as explicit arguments. No new env var was needed — Task 3's route reuses Story 1.5's existing Supabase/Clerk vars, so nothing was added to have something to show.
- **Task 5**: Ran the full CI sequence from the workspace root — `pnpm run lint`, `pnpm run typecheck`, `pnpm run test`, `pnpm run build`, `pnpm run verify:tier-isolation` — all green. Confirmed `packages/domain`/`packages/adapters` import no vendor SDK beyond Story 1.5's (`uuid`, `@supabase/supabase-js`); the new `ApiError`/`withApiErrorHandling` code stays confined to `apps/console/lib`. Confirmed the catalogue-parity Vitest test (`packages/i18n/test/catalogue-parity.test.ts`) covers the new keys — it's key-set-driven, not hardcoded, so no changes were needed there.
  - **Manually verified live** (via `pnpm run dev` against real Clerk/Supabase dev credentials in `.env.local`): `curl http://localhost:3000/api/workspace` unauthenticated returns `401 { "code": "UNAUTHENTICATED", "message": "You're signed out. Sign in to continue." }` — no stack trace, no Next.js default error page. With `Cookie: lawha-locale=ar` set, the same unauthenticated call returns the Arabic catalogue string, confirming the locale-resolution path works end-to-end.
  - **Authenticated success path and two-Clerk-account cross-tenant check (Task 5's first bullet): verified by the user in a browser** against real Clerk/Supabase dev credentials — first account's `GET /api/workspace` returned its own workspace `id`, second (different) account returned a distinct workspace `id`, confirming AD-27's cross-tenant isolation holds through the route-handler/service-role path, not just under RLS.

### File List

- `apps/console/lib/api-error.ts` (new)
- `apps/console/lib/api-error.test.ts` (new)
- `apps/console/lib/workspace-context.ts` (new)
- `apps/console/lib/workspace-context.test.ts` (new)
- `apps/console/app/api/workspace/route.ts` (new)
- `apps/console/lib/workspace-bootstrap.ts` (modified — added `findWorkspaceById`)
- `apps/console/lib/env.ts` (modified — comment documenting the binding AC4 pattern, no behavior change)
- `packages/domain/src/workspace.ts` (modified — added `findWorkspaceById` to `WorkspaceRepository` port)
- `packages/domain/test/workspace.test.ts` (modified — `InMemoryWorkspaceRepository` implements `findWorkspaceById`, plus a new test)
- `packages/adapters/src/workspace-repository.ts` (modified — `findWorkspaceById` implementation)
- `packages/i18n/src/catalogues/en.json` (modified — added `error.unauthenticated`, `error.workspaceNotFound`, `error.serverGeneric`)
- `packages/i18n/src/catalogues/ar.json` (modified — same three keys, Arabic)

## Change Log

- 2026-08-13: Implemented Story 1.6 — API error contract (`ApiError`/`withApiErrorHandling`), `resolveWorkspaceContext()`, `GET /api/workspace` demonstration route, `findWorkspaceById` data-access function, and confirmation of `env.ts` as the binding AC4 pattern. Full CI sequence green.
- 2026-08-13: User manually verified the authenticated + two-Clerk-account cross-tenant path in a browser — each account returns only its own workspace. All of Task 5's manual verification steps are now complete.
