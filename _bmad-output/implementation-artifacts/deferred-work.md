# Deferred Work

## Deferred from: code review of 1-1-shared-design-token-layer (2026-08-12)

- `rounded.full` ("reserved solely for `{components.radio}`") and `allTypographyTiers` ("tooling only, apps must import consoleTypography/playerTypography directly") are both invariants enforced only by code comments — no runtime assertion (unlike the console/player typography overlap guard, which throws at import time) and no lint rule catches a future violation. Nothing in the current diff violates either rule. `packages/tokens/src/rounded.ts`, `packages/tokens/src/components.ts`, `packages/tokens/src/typography.ts`.

## Deferred from: code review of 1-2-bilingual-foundation-rtl-primitives (2026-08-12)

- `apps/console/app/layout.tsx`'s `cookies()` call in the root layout forces the entire `apps/console` app into fully dynamic rendering — no route can be statically generated or ISR'd from here on unless a future story re-architects locale resolution (e.g. middleware + locale-prefixed static routes). Deferred: no static-generation/ISR requirement exists yet for apps/console; revisit if that changes. `apps/console/app/layout.tsx:17`.

## Deferred from: code review of 1-3-console-shell-navigation (2026-08-13)

- `lawha/no-physical-direction-properties`'s `stripVariantPrefix` helper only searches for a variant-separating colon in the substring *before* the first `[`, so it never strips prefixes like `has-data-[icon=inline-end]:` — the rule silently misses physical-direction classes guarded by any bracket-containing variant. Confirmed reachable: Story 1.3's shadcn-generated `apps/console/components/ui/button.tsx` contains exactly this pattern (`has-data-[icon=inline-end]:pr-2`) undetected by lint. Pre-existing rule from Story 1.1, out of Story 1.3's scope to fix. `tools/eslint-plugin-lawha/rules/no-physical-direction-properties.js:63-72`.

## Deferred from: code review of 1-4-accessibility-rtl-enforcement-for-the-shell (2026-08-13)

- Skip link's "first focusable element in the document" claim (AC5) depends on Story 1.2's root `app/layout.tsx`, which is outside Story 1.4's file list and wasn't reviewed here — the assertion in Story 1.4's own code comment is unverified against that file. Pre-existing constraint from a prior story, out of this review's reach. `apps/console/app/(console)/layout.tsx:18-24` (comment asserting the claim).
