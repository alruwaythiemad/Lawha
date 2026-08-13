# Deferred Work

## Deferred from: code review of 1-1-shared-design-token-layer (2026-08-12)

- `rounded.full` ("reserved solely for `{components.radio}`") and `allTypographyTiers` ("tooling only, apps must import consoleTypography/playerTypography directly") are both invariants enforced only by code comments — no runtime assertion (unlike the console/player typography overlap guard, which throws at import time) and no lint rule catches a future violation. Nothing in the current diff violates either rule. `packages/tokens/src/rounded.ts`, `packages/tokens/src/components.ts`, `packages/tokens/src/typography.ts`.

## Deferred from: code review of 1-2-bilingual-foundation-rtl-primitives (2026-08-12)

- `apps/console/app/layout.tsx`'s `cookies()` call in the root layout forces the entire `apps/console` app into fully dynamic rendering — no route can be statically generated or ISR'd from here on unless a future story re-architects locale resolution (e.g. middleware + locale-prefixed static routes). Deferred: no static-generation/ISR requirement exists yet for apps/console; revisit if that changes. `apps/console/app/layout.tsx:17`.

## Deferred from: code review of 1-3-console-shell-navigation (2026-08-13)

- `lawha/no-physical-direction-properties`'s `stripVariantPrefix` helper only searches for a variant-separating colon in the substring *before* the first `[`, so it never strips prefixes like `has-data-[icon=inline-end]:` — the rule silently misses physical-direction classes guarded by any bracket-containing variant. Confirmed reachable: Story 1.3's shadcn-generated `apps/console/components/ui/button.tsx` contains exactly this pattern (`has-data-[icon=inline-end]:pr-2`) undetected by lint. Pre-existing rule from Story 1.1, out of Story 1.3's scope to fix. `tools/eslint-plugin-lawha/rules/no-physical-direction-properties.js:63-72`.

## Deferred from: code review of 1-4-accessibility-rtl-enforcement-for-the-shell (2026-08-13)

- Skip link's "first focusable element in the document" claim (AC5) depends on Story 1.2's root `app/layout.tsx`, which is outside Story 1.4's file list and wasn't reviewed here — the assertion in Story 1.4's own code comment is unverified against that file. Pre-existing constraint from a prior story, out of this review's reach. `apps/console/app/(console)/layout.tsx:18-24` (comment asserting the claim).

## Deferred from: code review of 1-6-api-foundations-workspace-scoped-access-honest-errors (2026-08-13)

- Unexpected 500 errors in `withApiErrorHandling` are caught and mapped to a generic response with no server-side logging anywhere — a real production bug would leave zero trace. No logging/observability infrastructure exists yet anywhere in this repo (no logger module, no Sentry, no `console.error` in any route handler), so this is a repo-wide gap to address with dedicated infra work, not a fix scoped to this story. `apps/console/lib/api-error.ts:45`.

## Deferred from: code review of 1-5-owner-registration-sign-in-workspace-creation (2026-08-13)

- Diff reviewed under Story 1.5's uncommitted changes (`findWorkspaceById`, its AD-27 port method, and new `error.*` i18n keys) is actually Story 1.6 work — confirmed by inline comments and real call sites in `apps/console/lib/workspace-context.ts`, `apps/console/lib/api-error.ts`, and `apps/console/app/api/workspace/route.ts`, plus Story 1.6's own file already declaring `Status: review` with every task checked. `sprint-status.yaml` still lists `1-6-...` as `ready-for-dev`, so the sprint tracker and the story file disagree. Deferred at the developer's request — reconciling which story owns this work and syncing `sprint-status.yaml` is left to the developer. `_bmad-output/implementation-artifacts/1-6-api-foundations-workspace-scoped-access-honest-errors.md`, `_bmad-output/implementation-artifacts/sprint-status.yaml`.
- `findWorkspaceById`'s Postgres error is thrown as a bare `new Error(...)`, discarding the original error/cause. Pre-existing pattern already present in the sibling method `findWorkspaceForClerkUser` two lines above — not a regression introduced by this diff, worth a repo-wide fix later. `packages/adapters/src/workspace-repository.ts:33,57`.

## Deferred from: code review of 1-7-owner-language-preference-persistence (2026-08-13)

- `setLocaleAction`'s persistence-path failures are swallowed by a bare `catch {}` with no logging, making production failures undiagnosable. Same repo-wide "no logging infrastructure exists" gap already deferred from Story 1.6's review of `api-error.ts` — not a fix scoped to this story. `apps/console/app/(console)/actions.ts:31`.
- `pickLocaleFromAcceptLanguage`'s `q=` parameter matching is case-sensitive (misses `Q=`), silently defaulting weight to 1 instead of parsing it. Minor robustness gap, pre-existing function style, not blocking. `apps/console/app/locale-cookie.ts:16-27`.
- `Locale` type is duplicated between `packages/domain` and `packages/i18n`, synced only by a code comment with no compiler/CI enforcement. Architecturally justified deviation (domain package must stay a dependency sink) — drift risk only if a third locale is ever added. `packages/domain/src/workspace.ts:1-8`.
- The rollback write's own `persisted` result is discarded in `language-switch.tsx` — if the revert-to-previous-locale write also fails, no distinct feedback is shown (same generic `saveFailed` message as the original failure). Rare double-failure edge case. `apps/console/app/(console)/language-switch.tsx:45-46`.
- A stale/deleted `workspaceId` makes `updateWorkspaceLanguage`'s `.single()` error generically, surfaced as a 500 `error.serverGeneric` instead of a distinguishable not-found response. Low-likelihood edge case (workspace deletion mid-session). `packages/adapters/src/workspace-repository.ts` (`updateWorkspaceLanguage`).
- The migration combines `NOT NULL DEFAULT` and a `CHECK` constraint in one `ALTER TABLE` with no note on lock/scan cost at scale. Negligible at current table size; revisit before the `workspace` table grows large. `supabase/migrations/20260813070000_workspace_language.sql`.
