---
stepsCompleted: ["step-01-validate-prerequisites", "step-02-design-epics", "step-03-create-stories"]
inputDocuments:
  - "_bmad-output/planning-artifacts/prds/prd-the_project-2026-08-11/prd.md"
  - "_bmad-output/planning-artifacts/architecture/architecture-the_project-2026-08-11/ARCHITECTURE-SPINE.md"
  - "_bmad-output/planning-artifacts/ux-designs/ux-the_project-2026-08-11/DESIGN.md"
  - "_bmad-output/planning-artifacts/ux-designs/ux-the_project-2026-08-11/EXPERIENCE.md"
  - "_bmad-output/specs/spec-lawha-frontend/SPEC.md"
scopeNote: >
  Corrected 2026-08-12: no code exists anywhere in this repo yet — neither
  frontend nor backend. spec-lawha-frontend/SPEC.md (CAP-1…CAP-17) is a
  complete, ready-to-build contract for the frontend presentation layer
  (fixture-driven, both apps, both languages, both themes) produced by a
  separate workflow (bmad-spec), not yet implemented. This epics/stories run
  now covers the full v1 product. Epics are organized by feature domain, not
  by frontend/backend layer — each epic delivers that domain's frontend
  (fixture-driven UI, matching the relevant CAP-* capabilities) as its earlier
  stories, then real backend wiring that replaces the fixture source as its
  later stories, per PRD §12.5's frontend-first build order. This avoids
  splitting one feature across two epics by technical layer. Group H (public
  website & docs, FR64–69 / CAP-14, CAP-15) remains excluded — blocked on the
  PRD's unresolved reason-to-buy item and lacking its own UX pass. addendum.md
  remains background only, not a formal input document.
---

# Lawha - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for Lawha v1, decomposing the requirements from the PRD, the UX Design contract, the Architecture Spine, and the `spec-lawha-frontend` build contract into implementable stories. Nothing is built yet. Per PRD §12.5, the frontend presentation layer is built first, on fixtures, ahead of the player's fourteen-day gate — so each epic below is organized by **feature domain**, and within an epic the earlier stories build that domain's console/player UI against fixtures (matching `spec-lawha-frontend`'s CAP-1…CAP-17), while later stories wire real data behind the same UI, replacing the fixture source with no UI changes. Group H (public website & documentation, FR64–69 / CAP-14, CAP-15) is excluded — it is blocked on the PRD's unresolved reason-to-buy item and has no UX pass of its own yet.

## Requirements Inventory

### Functional Requirements

**Group A — Player**

FR1: The player runs as a web application at a unique per-screen URL and requires no installation beyond a browser.
FR2: The player renders fullscreen with no browser chrome, menus, scrollbars, or visible cursor.
FR3: The player caches all assigned media locally and plays from that cache during normal operation, not from the network.
FR4: The player continues playback uninterrupted when the network connection is lost. Offline is the normal operating case, not an error state.
FR5: The player resumes synchronisation automatically when connectivity returns, with no human action.
FR6: The player detects its own failure — unhandled error, no playback progress for 30 seconds, decode failure, or no render-loop tick for 10 seconds — and recovers without human action, beginning within 10 seconds of detection.
FR6a: The dashboard identifies whether each screen is running on a certified or best-effort device.
FR7: The player holds the display awake for as long as it is playing, suppressing screensaver and sleep.
FR8: On certified devices, the player relaunches automatically after a power cycle and resumes playback with no menu, prompt, or input.
FR9: The player emits a heartbeat at a fixed interval carrying its identity, the item currently playing, and its cache state.
FR10: The player bounds its memory use during media decode — preloads at most one item ahead, releases decoded resources for items not playing or next.
FR11: The player applies content and playlist changes without a restart; the current item plays to the end of its duration unless it was itself removed or altered, in which case the player advances immediately.
FR12: When the player has no playable content, it displays a defined holding state — never a browser error page, blank screen, or stack trace.
FR13: The player evaluates its schedule locally from cached rules, so scheduling continues to work while offline.
FR14: The player recovers from a corrupt or partial cache by re-fetching rather than failing to start.

**Group B — Pairing and screens**

FR15: On first launch, an unpaired player displays a six-character pairing code and instructions in the configured language.
FR16: An owner claims a screen by entering that code in the dashboard. Codes are single-use and expire 15 minutes after being displayed; an unclaimed player generates and displays a fresh code on expiry.
FR17: The dashboard lists every screen in the workspace with its name, assigned playlist, and status.
FR18: Screen status derives solely from heartbeat recency. The dashboard never reports playback it has not confirmed.
FR19: Any screen not currently confirmed online displays a last-seen timestamp.
FR20: Content shown for an offline screen is explicitly labelled as last-known rather than current.
FR21: An owner can rename a screen and reassign its playlist.
FR22: An owner can remove a screen, releasing its entitlement slot.
FR23: An owner can re-pair an existing screen record to a new device without losing its name, schedule, or assignment.

**Group I — Branches and multi-location**

FR70: An owner can create, rename, and remove branches within their workspace, each with a name and an optional address.
FR71: Every screen belongs to exactly one branch. A default branch exists and is used implicitly, so a single-location customer is never asked to create one.
FR72: The screen list can be grouped and filtered by branch.
FR73: An owner can assign a playlist to every screen in a branch in one action, without touching screens individually.
FR74: A schedule can be applied at branch level and inherited by that branch's screens, with per-screen override — screen beats branch.
FR75: Each branch carries its own timezone, inherited by its screens by default.
FR76: The dashboard shows a per-branch health summary — screens online, offline, and stopped.
FR77: An owner can move a screen between branches without re-pairing it or rebuilding its content.
FR78: Branch structure does not affect billing, which remains per screen.

**Group C — Media**

FR24: An owner can upload image and video files from the browser.
FR25: Uploads are subject to per-file ceilings of 150 MB for video and 15 MB for images.
FR26: Unsupported formats are rejected at upload with a specific, actionable reason. MP4/H.264 is the guaranteed-playable combination; 4K video is not supported in v1.
FR27: The media library lists items with thumbnail, name, size, and upload date.
FR28: An owner can delete media, and is warned when the item is in use by a playlist.
FR29: The dashboard shows storage consumed against the plan allowance — 10 GB per screen, pooled across the workspace.
FR30: Media is served to players over cacheable URLs suitable for long-lived local caching.
FR83: Uploaded video is checked for flash content before it can reach a wall. The check runs client-side, before transfer; a confident breach of the WCAG 2.3.1 general flash threshold is refused, an uncertain result is a warning the owner must acknowledge, backed by a stated content policy.

**Group D — Playlists**

FR31: An owner can create and name playlists.
FR32: An owner can add media items to a playlist in an explicit order.
FR33: An owner can reorder items.
FR34: Images have a per-item display duration. Videos play their full length by default.
FR35: A playlist can be assigned to one or more screens.
FR36: Playlists loop continuously.
FR37: Playlist changes propagate to assigned screens without a manual push step.

**Group E — Scheduling**

FR38: An owner can schedule a playlist to a day-of-week and time-of-day window.
FR39: A screen supports multiple schedule entries; where windows overlap, precedence resolves by defined rules and the dashboard shows the owner which playlist will actually play at any given time.
FR40: An owner can define the fallback playlist that plays outside all scheduled windows.
FR41: Schedules are evaluated in the screen's local timezone.
FR42: A screen's timezone is configurable and defaults to the workspace timezone.
FR44: The working week is configurable and is not hardcoded to Monday–Friday.

*FR43 (Gregorian/Hijri calendar display) was withdrawn during architecture, 2026-08-11 — retired, not reused.*

**Schedule precedence rules (bind FR39):** (1) screen beats branch, (2) narrower beats wider, (3) later-created beats earlier, (4) fallback plays last. A screen with no schedule and no fallback shows the holding card (FR12).

**Group F — Bilingual layer**

FR45: The admin interface is complete in English and Arabic. No screen, error message, or empty state falls back to the other language, except the hosted authentication surface (FR53), which does not widen.
FR46: Language selection persists per user across sessions and devices.
FR47: Arabic renders in a fully mirrored RTL layout — navigation, directional icons, progress/stepper direction, form/label alignment, table column order, drawer/menu origin all invert. Done is defined mechanically: layout code uses CSS logical properties throughout with no physical `left`/`right` layout property. Non-directional icons do not mirror.
FR48: No text container has a fixed height or width that clips content when strings expand. Layouts reflow.
FR49: Text is UTF-8 end to end, with no exception anywhere in the storage or rendering path.
FR50: Mixed Arabic/Latin runs render per the Unicode Bidirectional Algorithm with explicit isolation around embedded LTR runs.
FR51: Arabic display typefaces are bundled with the player and never resolved from the host device's fonts.
FR52: Bundled fonts are available from the offline cache.
FR53: The hosted authentication surface renders in English in both locales — not translated, not mirrored, not replaced. Checkout is unchanged and still must render in Arabic and mirror correctly, or be replaced.
FR54: Dates, times, and numerals are formatted per the active locale.
FR55: Navigation patterns tolerate label expansion. Horizontal tab rows that clip or wrap under longer strings are not acceptable.

**Group G — Account and billing**

FR56: An owner can register and sign in via hosted authentication using email or a Google account.
FR57: Each account has one workspace in v1. The schema carries workspace boundaries from the first migration to permit multi-workspace later without migration of live data.
FR58: An owner can select a plan and complete checkout through the Merchant of Record.
FR59: Screen entitlement is enforced — an owner cannot pair more screens than their plan allows, and is told clearly why when they hit the ceiling.
FR60: Subscription state is reconciled from Merchant-of-Record webhooks and treated as the source of truth.
FR61: Payment provider access is mediated by an internal abstraction — charge, subscribe, cancel, webhook — so a second provider can be added without touching product code.
FR62: An owner can change plan, cancel, and reach invoices and receipts.
FR63: When a subscription terminates, the screen stops playing and displays a neutral holding card. The trigger is subscription termination, not first failed charge.
FR63a: The owner is warned before a screen stops — by email at first payment failure and at each Merchant-of-Record retry, and by a persistent dashboard banner naming the exact date the screens will stop.
FR63b: The holding card shown on a stopped screen is neutral and non-embarrassing in a public venue — no payment failure, pricing, or account details.
FR63c: Restoring payment restores playback automatically, without re-pairing the screen or rebuilding playlists.
FR79: During an active free trial, the player displays a Lawha badge. On any paid plan the screen carries no vendor branding of any kind.
FR80: The trial badge occupies no more than 2% of screen area, sits wholly within the outer 10% margin of one corner, renders at reduced opacity, and never animates.
FR81: The badge's corner placement mirrors with content direction.
FR82: Branding is removed within one heartbeat cycle of payment being confirmed — no re-pairing, player restart, or manual action required.

**Plan structure:** one plan, no feature gates, billed per screen monthly at $5/screen; entitlement is a screen count; storage allowance scales at 10 GB/screen pooled across the workspace; a 14-day free trial precedes payment.

**Group H — Public website and documentation**

FR64: A public marketing website presents the product, its pricing, and a path to sign up.
FR65: The website is complete in English and Arabic with full RTL mirroring, held to the same standard as Group F.
FR66: Pricing is published openly on the site — no sales call, no quote request, no gated tier.
FR67: Sign-up flows from the website into the dashboard without re-entering information already given.
FR68: Setup documentation is published and public — covers pairing, uploading media, building a playlist, scheduling, and certified-vs-best-effort devices, in both languages.
FR69: Language selection persists between the website and the dashboard.

*Note: The presentational build-out of Groups A–H's console/player surfaces (visual layout, components, copy scaffolding, states) is covered by `spec-lawha-frontend` and excluded from epics below. FRs above remain listed in full for traceability; the coverage map (Step 2) will mark which FRs are addressed by backend/integration epics here versus already satisfied on the frontend.*

### NonFunctional Requirements

**Player reliability (§7 — each is an acceptance-test target for success criterion 1, the fourteen-day test):**

NFR1: The player survives fourteen consecutive days of unattended operation without intervention.
NFR2: The player recovers from process death automatically, with no first-crash-is-permanent path.
NFR3: On certified devices, the player recovers from a device cold boot to playing content with no human input.
NFR4: The player plays indefinitely from local cache with no network.
NFR5: The display never sleeps, dims to blank, or surrenders to a screensaver while playback is active.
NFR6: The player is not terminated by the host under memory pressure during sustained video decode.
NFR7: Silent death is impossible — an unreachable screen is shown as offline in the dashboard within five minutes.

**Setup and usability**

NFR8: An unaided non-technical user completes setup from unboxing to content on screen in under fifteen minutes.
NFR9: Every error message names the condition and the next action, in the owner's language. No message consists solely of an error code, a stack trace, or a generic failure string.

**Data protection**

NFR10: Personal data is stored in a region appropriate to the customer base — EU/UK regions and GDPR/UK-GDPR obligations, with DPAs in place with every subprocessor.
NFR11: The data residency posture is revisited before entering any market with its own residency law (Saudi PDPL parked, live on Gulf entry).

**Cost and operation**

NFR12: Media is fetched once per change, not per loop. Under normal operation, recurring delivery stays at or below 2 GB per screen per month.
NFR13: Heartbeat interval is 60 seconds. A screen is shown offline after 5 consecutive missed heartbeats (~5 minutes).

**Platform**

NFR14: The supported device matrix is two tiers — certified and best-effort. Certified devices are tested against every player requirement; best-effort devices are tested for playback only.
NFR15: Screen Wake Lock support is verified per device before that device enters the certified tier.

### Additional Requirements

*Extracted from ARCHITECTURE-SPINE.md — architecture decisions (AD-1…AD-27), consistency conventions, and stack, scoped to what affects backend/integration epic and story creation. No starter/greenfield template is specified; the monorepo source tree below is the from-scratch scaffold.*

**Rented-service integration (ports and adapters)**
- `packages/domain` imports no vendor SDK; Clerk, Supabase, Merchant of Record, and R2 are reached only through adapters in `packages/adapters` implementing ports defined in `packages/domain` (AD-1).
- The payment port is exactly four verbs — charge, subscribe, cancel, webhook — and may not grow into a general payments framework (AD-1).
- The dependency graph is acyclic and downward-only; CI fails a build that introduces an upward or lateral edge (AD-2).
- Auth: Clerk native third-party auth — Supabase verifies Clerk JWTs via JWKS, RLS reads Clerk session claims; the deprecated JWT-template integration is not used.

**Device API and player server surface**
- The player's entire server surface is three endpoints — `POST /device/register`, `GET /device/manifest`, `POST /device/heartbeat` — plus signed media GETs against object storage; no DB client or Supabase/Clerk credential in the player; the device API is versioned and may not make a breaking change without a version bump (AD-3).
- `POST /device/register` is unauthenticated and rate-limited per IP and globally; pairing-code issuance is bounded; heartbeats are rate-limited per device token.
- The device credential is an opaque long-lived token, hashed at rest, minted at pairing, bound to the screen record; rotates on re-pair (FR23), revoked on screen removal (FR22) and on nothing else; the player bundle carries no secrets (AD-20).

**Manifest system**
- A manifest revision activates only when fully cached; the previous revision continues playing until then; activation happens at an item boundary, never mid-item, unless the current item was itself removed or altered (AD-5).
- The manifest revision is a server-computed content hash of the assembled manifest document; a no-op edit produces no new revision (AD-6).
- The media cache is keyed by content hash, never URL; signed GETs have a 7-day TTL, reissued fresh per manifest revision; a 403 triggers a manifest re-fetch, not a failure (AD-7).
- The manifest names the player build version; the service worker fetches and activates that versioned bundle at an item boundary; rollback is a database update taking effect within one heartbeat; canary screens receive a new build before the fleet (AD-8).
- One manifest assembler in `packages/domain` builds every manifest; no route, job, or query composes one by hand; every write that can affect a manifest declares the screens it touches and recomputes the revision for exactly those screens inside the same transaction as the write (AD-25).
- `packages/manifest-contract` owns a runtime validator used on both sides; a manifest that fails validation is rejected by the player, which keeps its current revision and reports the rejection in its heartbeat (AD-26).
- Subscription state (`active`/`stopped`) and trial-branding state are manifest fields on the same mechanism as content; a change bumps the manifest revision without revoking the device credential (AD-18).

**Player recovery and resource bounds**
- Faults escalate through a fixed ladder: (1) skip the failing item, (2) re-initialise the playback surface without a page load, (3) full page reload with cache intact, (4) stop responding and let the launcher restart the process; the fault counter persists in IndexedDB; a repeatedly-failing item is quarantined, skipped, and reported in the heartbeat, and the dashboard must surface that a screen is skipping an item (AD-9).
- At most one item preloaded ahead; exactly two media elements ever attached to the DOM, double-buffered; object URLs revoked when an item is released; `navigator.storage.estimate()` consulted before caching a revision (AD-10).
- The player takes a server timestamp from every heartbeat response and maintains an offset against a monotonic clock; when the last sync is too old, schedule resolution is low-confidence and the player plays the fallback playlist, reporting low confidence in its heartbeat (AD-11).

**Scheduling and status**
- The server resolves all four precedence rules into a flat weekly timetable of segments carried in the manifest; the player holds no precedence logic; timetables are stored against an IANA timezone identifier and evaluated as local wall time (AD-14).
- Screen status is a read-time function of `last_seen` — online if the last heartbeat is within 180s, computed at query time; no `is_online` column, no counter, no reconciliation job (AD-12).
- No cron, queue, or scheduled background job in v1; derived state is computed at read time or on write (AD-13).

**Data model and tenancy**
- `workspace_id` is the only tenancy key on every domain row and every RLS policy — never `user_id`, never `branch_id` (AD-15).
- `screen` (console-owned configuration) and `screen_telemetry` (device-owned observation) are separate one-to-one records; the device API writes exactly one table, `screen_telemetry` (AD-16).
- The entitlement check and the screen insert are one transaction with the count locked, backed by a database constraint that makes over-provisioning representable only as an error (AD-17).
- Webhooks are idempotent — dedupe on provider event ID — and applied by event timestamp, not arrival order; ignore events older than the state already applied; Merchant-of-Record subscription state is the source of truth, never inferred locally (AD-19).
- Every server-side data access is explicitly workspace-scoped: service-role credentials are confined to a data-access layer whose every function takes a workspace as a required argument, resolved from the authenticated session, never from a request parameter, path segment, or body (AD-27).
- The console may read directly through `supabase-js` under RLS keyed on Clerk session claims; every write and every entitlement-bearing operation goes through a server route handler; RLS stays enabled on every table as defence in depth, never the sole enforcement of a rule that cannot be expressed as a row predicate (AD-4).
- Schema changes are forward-only migrations applied through CI; no manual change against production, ever (AD-24).

**Bilingual/i18n backend-facing rules**
- `dir` is derived once from the active locale at the root; no component branches on locale; FR47's mechanical definition of done is enforced by a CI lint rule that fails the build on physical `left`/`right` layout properties (AD-21).
- All user-visible strings come from ICU message catalogues with named placeholders; bidi isolation applied once at the placeholder boundary; no string concatenation, template interpolation, or sentence assembly in application code (AD-22).
- The player's language comes from the manifest, never the device or browser; Arabic and Latin display faces are self-hosted, subset, and precached by the service worker (AD-23).

**Consistency conventions (binding on all backend work)**
- UUIDv7 primary keys everywhere, generated in `packages/domain`, not by a column default (PostgreSQL 17 lacks native `uuidv7()`); pairing codes are the single exception — six characters, single-use, 15-minute expiry, from an alphabet excluding visually ambiguous glyphs.
- A screen is hard-deleted; nothing counts toward entitlement except live `screen` rows; media referenced by a playlist cannot be deleted — the foreign key restricts and the owner must detach first; no soft-delete columns anywhere in v1.
- UTC `timestamptz` in storage always; wall-clock scheduling only in a stored IANA timezone identifier; ISO 8601 on the wire; never a bare offset or local timestamp in the database.
- Every API error carries a stable machine code and a message key resolved from the ICU catalogue in the owner's language; no bare codes, stack traces, or generic failure strings reach a person.
- Money as minor-unit integers with an explicit currency, never a float.
- Environment variables validated at startup against a schema; the process refuses to boot on a missing or malformed value; no secret ever enters the player bundle.
- Structured logs carry `workspace_id` and, where relevant, `screen_id`; player error reporting is sampled, rate-limited, and piggybacks the heartbeat.
- Every NFR1…NFR7 bound must become an executable acceptance test against the certified tier; schedule resolution and entitlement are unit-tested at the domain layer.

**Stack (informs environment/setup stories)**
- Monorepo: `apps/console` (Next.js 16.3, React 19.2.8), `apps/player` (Preact 10.29.7, Vite 8.0.9), `packages/domain`, `packages/adapters`, `packages/manifest-contract`, `packages/i18n`, `supabase/migrations`.
- PostgreSQL 17 via Supabase (managed, EU region, Pro plan); Clerk (managed auth); Cloudflare R2 (media); Cloudflare Pages (player hosting); Vercel (console hosting); Merchant of Record vendor unselected (blocks phase-2 shipping, not build order — port is ready either way).
- Player browser baseline: Chromium 76 / ES2019.
- Deployment path: local (dev DB branch) → preview (per branch, ephemeral) → production (EU region) → canary (pinned build, 14-day gate lives here) → fleet.

### UX Design Requirements

*Two tiers. CAP-1…CAP-17 are the frontend capability contract, taken directly from `spec-lawha-frontend/SPEC.md` (already fully specified there — restated here only as epic-coverage anchors, not re-derived). UX-DR1…UX-DR12 are additional requirements, extracted from DESIGN.md/EXPERIENCE.md, that only bite once real data is behind the UI — the data contracts each epic's backend stories must satisfy so the already-specified frontend needs no changes when wired.*

**Frontend capabilities (spec-lawha-frontend, CAP-1…CAP-17):**

CAP-1: Shared token layer — one token set (DESIGN.md) drives both apps; every Latin type tier has an `-ar` counterpart; no color/radius/spacing literal in component code.
CAP-2: Bilingual foundation — `lang`/`dir` set once at the root; no component branches on locale; missing catalogue key fails the build; CI fails on physical `left`/`right` or a concatenated user-visible string.
CAP-3: Console shell — persistent rail ≥1024px / focus-trapping sheet <640px; no horizontal tab row; skip-to-content and landmark map; language/theme switch without reload.
CAP-4: Screens home — every screen grouped by branch with truthful, heartbeat-derived status; healthy carries no colour but asserts health positively to assistive tech; offline promotes to the structural border tier and raises a global banner.
CAP-5: Screen detail — rename, reassign playlist, schedule, timezone, re-pair, remove, each with rollback on simulated failure.
CAP-6: Pair a screen — one auto-focused field (never six boxes), case-insensitive, paste-friendly, works at 390px, three distinct failure messages (wrong/expired/entitlement).
CAP-7: Media library and uploader — ceilings enforced pre-transfer, per-file rejection reasons, client-side flash check (FR83), storage meter with absolute figures.
CAP-8: Playlists and playlist editor — keyboard + explicit-control reorder, no Publish button, states per-screen propagation and the FR11 play-out delay.
CAP-9: Schedules — renders the resolved weekly outcome only, never the precedence rules; overrides explained in one sentence at edit time.
CAP-10: Branches — per-branch health (three explicit counts), bulk assignment with undo, branch timezone inheritance.
CAP-11: Billing and entitlement — plan/entitlement/invoices/receipts/cancel; at-limit and payment-failure states name exact numbers and dates.
CAP-12: Settings — interface language, workspace timezone, account.
CAP-13: Player display surface — all eight player states at fixed 16:9, `vmin` type tiers, Chromium 76 target.
CAP-16: Fixture harness — every state in every surface reachable from a switcher with no backend; absent from production builds.
CAP-17: Accessibility and RTL gates — WCAG 2.2 AA within `apps/console` and `apps/player` across all four language/theme combinations, enforced mechanically (tab order, focus, target size, status announcer).

*Excluded: CAP-14 (public marketing site) and CAP-15 (public setup documentation) — Group H, out of this run.*

**Backend/integration data contracts (bite once real data replaces fixtures):**

UX-DR1: Every write endpoint used for renames, reorders, duration edits, and branch moves must return enough data (and errors) to support optimistic UI with assertive rollback on failure — these are workspace facts the console owns and applies immediately (EXPERIENCE.md *Interaction Primitives*).

UX-DR2: The API must expose "assigned" (a workspace fact, saved immediately) and "playing" (heartbeat-confirmed) as two distinct, never-collapsed facts about a playlist-to-screen assignment (FR18, EXPERIENCE.md *Truth Contract* rule 1 and *Interaction Primitives*).

UX-DR3: `screen_telemetry` (or the API surface reading it) must expose device tier (certified/best-effort) per screen so the console can disclose "No auto-restart" while the screen is still healthy (FR6a).

UX-DR4: The manifest must carry a per-screen `reducedMotion` flag, settable only from the console (never inferred from the device), since the player takes no preference from the device it runs on (EXPERIENCE.md *Interaction Primitives — Motion*, AD-23's locale mechanism).

UX-DR5: The branch bulk-assignment endpoint (FR73) must report the affected screen count, name any screen whose per-screen override survives (screen beats branch), and support an undo that restores the previous per-screen assignment (EXPERIENCE.md *Component Patterns — Branch bulk assignment*, Flow 3).

UX-DR6: The schedule-resolution service (AD-14) must expose both the fully resolved weekly timetable and a one-sentence explanation of which window wins at edit time, for a given overlap — the console renders resolved outcomes and explanations only, never the precedence rules themselves (EXPERIENCE.md *Component Patterns — Schedule editor*, Flow 4).

UX-DR7: The flash-safety check (FR83) needs a defined content policy plus stable reason codes distinguishing "confident breach" (refused) from "uncertain/unanalysable" (warn-and-acknowledge), consumable by the uploader's per-file rejection UI (EXPERIENCE.md *Component Patterns — Media uploader*, *Open Items*).

UX-DR8: Storage and entitlement figures must be returned as absolute numbers (bytes used, screens in use vs. plan count), never pre-formatted as bare percentages — the console always pairs a meter with an absolute figure (FR29, EXPERIENCE.md *Component Patterns — storage-meter*).

UX-DR9: Console-facing read APIs must expose an "as of" timestamp per resource so a persistent console-offline notice can state staleness honestly rather than silently going stale (EXPERIENCE.md *State Patterns — All console surfaces*).

UX-DR10: The billing/webhook layer must surface the exact date screens will stop (from Merchant-of-Record dunning state), not a relative "soon" or countdown, for the persistent pre-termination banner (FR63a, EXPERIENCE.md Flow 5 step 2).

UX-DR11: Trial-branding and paid-plan-branding state must be a manifest field flipped within one heartbeat cycle of payment confirmation (FR82), requiring no re-pairing or player restart (AD-18).

UX-DR12: An EN 301 549 accessibility audit (screen reader, `ar` locale, 400% zoom, keyboard-only) of the hosted Clerk authentication surface is an open product-owner gate, separate from the fixture build — it must run before any unqualified product-level WCAG AA claim is published, and its outcome may turn "accept Clerk's UI as-is" into "build a headless auth UI" (EXPERIENCE.md *Open Items*; ARCHITECTURE-SPINE.md *Deferred*).

### FR Coverage Map

FR1: Epic 3 - player web app at a unique per-screen URL
FR2: Epic 3 - fullscreen, no chrome
FR3: Epic 3 - caches media, plays from cache
FR4: Epic 3 - offline is the normal case
FR5: Epic 3 - resumes sync automatically on reconnect
FR6: Epic 3 - self-detects failure and recovers
FR6a: Epic 2 - device tier disclosed in the dashboard
FR7: Epic 3 - wake lock, suppresses sleep
FR8: Epic 3 - relaunch after power cycle (certified devices)
FR9: Epic 3 - heartbeat emission
FR10: Epic 3 - memory bounding during decode
FR11: Epic 3 - applies changes without a restart
FR12: Epic 3 - defined holding state, never a browser error
FR13: Epic 3 - local schedule evaluation while offline
FR14: Epic 3 - corrupt/partial cache recovery
FR15: Epic 2 - unpaired player displays pairing code
FR16: Epic 2 - owner claims screen via code
FR17: Epic 2 - dashboard lists every screen
FR18: Epic 2 - status derives solely from heartbeat recency
FR19: Epic 2 - last-seen timestamp when unconfirmed
FR20: Epic 2 - last-known content label
FR21: Epic 2 - rename screen, reassign playlist
FR22: Epic 2 - remove screen, release entitlement
FR23: Epic 2 - re-pair without losing name/schedule/assignment
FR24: Epic 4 - upload image/video from browser
FR25: Epic 4 - per-file size ceilings
FR26: Epic 4 - format rejection with reason
FR27: Epic 4 - media library listing
FR28: Epic 4 - delete media, warn when in use
FR29: Epic 4 - storage meter against plan allowance
FR30: Epic 4 - cacheable media delivery URLs
FR31: Epic 5 - create and name playlists
FR32: Epic 5 - add items in explicit order
FR33: Epic 5 - reorder items
FR34: Epic 5 - per-item duration for images
FR35: Epic 5 - assign playlist to screens
FR36: Epic 5 - continuous loop
FR37: Epic 5 - propagate changes without manual push
FR38: Epic 6 - schedule playlist to day/time window
FR39: Epic 6 - multiple schedule entries with resolved precedence
FR40: Epic 6 - fallback playlist
FR41: Epic 6 - evaluated in screen's local timezone
FR42: Epic 6 - configurable screen timezone
FR43: Retired — withdrawn during architecture (Hijri calendar display), not applicable
FR44: Epic 6 - configurable working week
FR45: Epic 1 - admin interface complete in English and Arabic (catalogue completeness + CI gate)
FR46: Epic 1 - persist language preference server-side
FR47: Epic 1 - RTL mirroring via CSS logical properties (console shell + token layer)
FR48: Epic 1 - no fixed-size text containers (foundational layout rule)
FR49: Epic 1 - UTF-8 end to end (foundational convention)
FR50: Epic 1 - bidi isolation primitive for mixed Arabic/Latin runs
FR51: Epic 3 - Arabic display typefaces bundled with the player
FR52: Epic 3 - bundled fonts available from the offline cache
FR53: N/A — product decision already resolved (Clerk stays English in both locales); no build story
FR54: Epic 1 - locale-formatted dates, times, numerals
FR55: Epic 1 - navigation tolerates label expansion (console shell)
FR56: Epic 1 - register/sign in via hosted auth
FR57: Epic 1 - one workspace per account, boundaries in schema
FR58: Epic 8 - select plan, checkout via Merchant of Record
FR59: Epic 2 (baseline enforcement mechanism) / Epic 8 (real plan-driven entitlement numbers)
FR60: Epic 8 - webhook reconciliation as source of truth
FR61: Epic 8 - payment provider abstraction
FR62: Epic 8 - change plan, cancel, invoices/receipts
FR63: Epic 8 - termination stops screen, shows holding card
FR63a: Epic 8 - pre-termination warnings (email + banner)
FR63b: Epic 8 - neutral, non-embarrassing holding card
FR63c: Epic 8 - restoring payment restores playback automatically
FR64: N/A — Group H, excluded from this run (blocked upstream — see scope note)
FR65: N/A — Group H, excluded from this run
FR66: N/A — Group H, excluded from this run
FR67: N/A — Group H, excluded from this run
FR68: N/A — Group H, excluded from this run
FR69: N/A — Group H, excluded from this run
FR70: Epic 7 - create/rename/remove branches
FR71: Epic 7 - default branch, screen belongs to exactly one
FR72: Epic 7 - group/filter screens by branch
FR73: Epic 7 - bulk playlist assignment per branch
FR74: Epic 7 - branch-level schedule inheritance, screen override
FR75: Epic 7 - per-branch timezone
FR76: Epic 7 - per-branch health summary
FR77: Epic 7 - move screen between branches
FR78: Epic 7 - branch structure doesn't affect billing
FR79: Epic 8 - trial badge display during active trial
FR80: Epic 8 - trial badge size/placement/opacity constraints
FR81: Epic 8 - badge state (trial flag) mirrors with content direction
FR82: Epic 8 - branding removed within one heartbeat cycle of payment
FR83: Epic 4 - flash-content check before upload completes

**CAP coverage (spec-lawha-frontend, restated as epic-coverage anchors):** CAP-1, CAP-2, CAP-3, CAP-17 (shell-wide slice) → Epic 1. CAP-4, CAP-5, CAP-6 → Epic 2. CAP-13, CAP-16 → Epic 3. CAP-7 → Epic 4. CAP-8 → Epic 5. CAP-9 → Epic 6. CAP-10 → Epic 7. CAP-11, CAP-12 → Epic 8. CAP-14, CAP-15 → excluded (Group H).

**NFR / AD coverage (not FR-numbered, tracked for completeness):** NFR1–6, NFR14, NFR15 → Epic 3. NFR7, NFR13 → Epic 2 (server side) / Epic 3 (emission side). NFR8 → cross-epic outcome of Epics 1–5 together, not owned by one. NFR9 → cross-cutting acceptance criterion on every API story in every epic. NFR10, NFR11 → Epic 1 (environment/region setup). NFR12 → Epic 4 / Epic 5 (delivery caching). AD-1, AD-18, AD-19 → Epic 8. AD-3, AD-12, AD-16, AD-17, AD-20 → Epic 2. AD-4, AD-15, AD-24, AD-27 → Epic 1. AD-5, AD-6, AD-25, AD-26 → Epic 5. AD-7 → Epic 4. AD-8, AD-9, AD-10, AD-11 → Epic 3. AD-14 → Epic 6. AD-21, AD-22 → Epic 1 (CI lint + ICU catalogue infra). AD-23 → Epic 3 (player consumes locale/fonts) and Epic 5 (assembler emits locale into manifest).

## Epic List

### Epic 1: Foundation — Console Shell, Bilingual Infrastructure, Auth & Workspace
Owner signs up via hosted auth, lands in a workspace with a default branch, and can navigate a fully bilingual, RTL-correct console shell — at any viewport, in either language or theme — before any content exists. Earlier stories build the shell on fixtures (CAP-1, CAP-2, CAP-3, the shell-wide slice of CAP-17); later stories wire real registration and workspace creation behind it. First story is also where repository/environment scaffolding happens, since no starter template is named in the architecture — the monorepo source tree in the spine is the from-scratch scaffold.
**FRs covered:** FR45, FR46, FR47, FR48, FR49, FR50, FR54, FR55, FR56, FR57

### Epic 2: Screens, Pairing & Truthful Status
Owner pairs a screen with the six-character code and sees every screen listed with status that is never optimistic — derived solely from confirmed heartbeats. Earlier stories build the Screens home, Screen detail, and Pair-a-screen surfaces on fixtures (CAP-4, CAP-5, CAP-6); later stories wire the device API (register/heartbeat), real screen records, and read-time status derivation behind them.
**FRs covered:** FR6a, FR15, FR16, FR17, FR18, FR19, FR20, FR21, FR22, FR23, FR59 (baseline mechanism)

### Epic 3: Player Display Surface & Runtime Reliability
The player renders all eight states at fixed 16:9 on fixtures first (CAP-13, CAP-16); later stories replace the fixture source with a real, supervised runtime that caches media, plays offline, self-recovers through a fixed escalation ladder, and holds the display awake. This is the epic the fourteen-day test is judged against.
**FRs covered:** FR1, FR2, FR3, FR4, FR5, FR6, FR7, FR8, FR9, FR10, FR11, FR12, FR13, FR14, FR51, FR52

### Epic 4: Media Library
Owner uploads image and video files and sees them in a library with thumbnails, sizes, and a storage meter. Earlier stories build the library and uploader on fixtures (CAP-7); later stories wire real upload, storage, and the client-side flash check to real files and a real pooled allowance.
**FRs covered:** FR24, FR25, FR26, FR27, FR28, FR29, FR30, FR83

### Epic 5: Playlists & Manifest Delivery
Owner builds a playlist and assigns it to a screen. Earlier stories build the playlist editor on fixtures (CAP-8); later stories wire the manifest assembler so an assignment actually reaches the wall — closing the loop Epics 1–4 set up, with the two-step assigned-then-playing confirmation intact.
**FRs covered:** FR31, FR32, FR33, FR34, FR35, FR36, FR37

### Epic 6: Scheduling
Owner schedules playlists to day/time windows and trusts the resolved outcome. Earlier stories build the schedule editor on fixtures (CAP-9); later stories wire server-side precedence resolution into the manifest so the console only ever renders answers, never rules.
**FRs covered:** FR38, FR39, FR40, FR41, FR42, FR44

### Epic 7: Branches & Multi-location
A multi-branch owner manages several locations from one account. Earlier stories build the Branches surface on fixtures (CAP-10); later stories wire real branch records, bulk assignment, and per-branch health.
**FRs covered:** FR70, FR71, FR72, FR73, FR74, FR75, FR76, FR77, FR78

### Epic 8: Billing, Entitlement, Trial Lifecycle & Settings
Owner selects a plan, pays through the Merchant of Record, and sees entitlement enforced with real numbers; trial branding appears and clears correctly; subscription lapse and restore behave exactly per the truth contract; language/timezone/account settings persist. Earlier stories build Billing and Settings on fixtures (CAP-11, CAP-12); later stories wire the payment adapter, webhooks, and entitlement.
**FRs covered:** FR58, FR59 (real entitlement numbers), FR60, FR61, FR62, FR63, FR63a, FR63b, FR63c, FR79, FR80, FR81, FR82

**Excluded from this run:** Group H (FR64–69 / CAP-14, CAP-15, public website & documentation) — blocked on the PRD's unresolved reason-to-buy item and lacking its own bmad-ux pass.

## Epic 1: Foundation — Console Shell, Bilingual Infrastructure, Auth & Workspace

Owner signs up via hosted auth, lands in a workspace with a default branch, and can navigate a fully bilingual, RTL-correct console shell — at any viewport, in either language or theme — before any content exists. Earlier stories build the shell on fixtures (CAP-1, CAP-2, CAP-3, the shell-wide slice of CAP-17); later stories wire real registration and workspace creation behind it. First story is also where repository/environment scaffolding happens, since no starter template is named in the architecture — the monorepo source tree in the spine is the from-scratch scaffold.

### Story 1.1: Shared Design Token Layer

As an owner,
I want the console and the player to draw from one visual language,
So that Lawha reads as one coherent product rather than two apps stitched together.

**Acceptance Criteria:**

**Given** the token set defined in DESIGN.md (colors, typography, spacing, radius, component shapes)
**When** any component in `apps/console` or `apps/player` is built
**Then** it consumes tokens by reference — no colour, radius, or spacing literal appears in component code

**Given** a Latin typography tier exists (display, heading, body, body-sm, label, etc.)
**When** Arabic content is rendered
**Then** its `-ar` counterpart tier is used, and no Latin font family ever renders Arabic text

**Given** the console renders at a fixed pixel scale and the player renders at viewing distance
**When** type sizes are chosen
**Then** console tiers are `px` and player tiers are `vmin`, and neither tier set appears in the other app

**Given** a token value changes in the shared definition
**When** either app is rebuilt
**Then** the change is reflected in both apps from the single source, with no duplicated literal to update separately

### Story 1.2: Bilingual Foundation & RTL Primitives

As an owner using Arabic,
I want every screen, label, and error to render correctly — mirrored, never clipped, never falling back to English,
So that Lawha doesn't feel like a translated afterthought.

**Acceptance Criteria:**

**Given** the application root
**When** locale is set
**Then** `lang` and `dir` are derived once at the root, and no component branches on locale to decide its own layout (AD-21) — a component asking "are we in Arabic?" is treated as a defect

**Given** a user-visible string anywhere in the application
**When** it is rendered
**Then** it comes from an ICU message catalogue entry with named placeholders — no string concatenation, interpolation, or sentence assembly in application code (AD-22), including assembled accessible names

**Given** a catalogue is missing a key referenced by the build
**When** CI runs
**Then** the build fails rather than falling back silently to another language (FR45)

**Given** a layout component is authored
**When** CI lints it
**Then** a physical `left`/`right` layout property fails the build — CSS logical properties are the only permitted form (FR47's mechanical definition of done)

**Given** a text container holds content that may expand
**When** Arabic content (20–30% longer) is rendered
**Then** the container has no fixed width or height and reflows instead of clipping (FR48), using `min-block-size` rather than `block-size`

**Given** text storage and rendering anywhere in the system
**When** any string moves through it
**Then** it is UTF-8 with no exception in the path (FR49)

**Given** a mixed Arabic/Latin run — a price, a phone number, a brand name
**When** it is rendered
**Then** it is wrapped in bidi isolation realised as markup (`<bdi>` or `dir="ltr"`), never Unicode control characters (FR50)

**Given** a date, time, or numeral is displayed
**When** the active locale is Arabic or English
**Then** it is formatted per that locale, with numerals staying Latin-digit and LTR inside isolation (FR54)

### Story 1.3: Console Shell & Navigation

As an owner,
I want to move between every part of the console at any screen size, in either language,
So that the product works whether I'm on my phone or a desktop.

**Acceptance Criteria:**

**Given** a viewport ≥1024px
**When** the console loads
**Then** a persistent navigation rail is shown, its width set by the longer of the two languages' labels

**Given** a viewport <640px
**When** the console loads
**Then** navigation collapses to a focus-trapping sheet that closes on Escape and returns focus to its trigger

**Given** any navigable surface in the console
**When** the owner looks for it
**Then** no horizontal tab row is used anywhere (FR55) — labels are full words in both languages

**Given** the owner switches language or theme
**When** the switch is made
**Then** it applies without a page reload and persists

**Given** any page loads
**When** the owner tabs from the top of the document
**Then** a skip-to-content link is the first focusable element, followed by a landmark map (`banner`, `navigation`, `main`)

### Story 1.4: Accessibility & RTL Enforcement for the Shell

As an owner,
I want the console to work correctly with a screen reader and full keyboard navigation in both languages,
So that the product doesn't silently fail people who rely on assistive technology.

**Acceptance Criteria:**

**Given** any interactive element in the shell
**When** it receives focus
**Then** a visible focus ring is shown and never suppressed or replaced by a background change alone

**Given** the interface direction is RTL
**When** a user tabs through the page
**Then** DOM order matches visual order — enforced by CI rejecting `order`, `row-reverse`/`column-reverse`, `grid-template-areas`, or explicit grid placement in any component with more than one focusable element

**Given** a global status announcer is mounted
**When** any state changes anywhere in the shell
**Then** it is announced via `role="status"` with `aria-atomic="true"`, with `role="alert"` reserved for optimistic-rollback failures only

**Given** a target is interactive
**When** rendered at any breakpoint
**Then** it is at least 44px in its minimum dimension

**Given** the shell is evaluated for WCAG 2.2 AA
**When** tested across English/Arabic and light/dark
**Then** it passes, with the claim explicitly scoped to `apps/console` and `apps/player` — the hosted authentication surface is excluded pending its own audit (UX-DR12)

### Story 1.5: Owner Registration, Sign-in & Workspace Creation

As an owner,
I want to register and sign in with email or Google,
So that I land in a workspace ready to manage screens with no setup step of my own.

**Acceptance Criteria:**

**Given** a new visitor with no account
**When** they complete hosted sign-up with email or Google
**Then** a Clerk-authenticated session exists and exactly one workspace row is created for that account, carrying a non-null `workspace_id`
**And** a default branch row is created automatically for the new workspace, so screens can be paired before any branch is explicitly created (FR71 infra; full branch management arrives in Epic 7)

**Given** an existing owner
**When** they sign in again
**Then** they land in their existing workspace, never a new one

**Given** the workspace/branch schema is applied
**When** any future domain table is added
**Then** it must carry a non-null `workspace_id`, and every RLS policy keys on the workspace claim — never `user_id`, never `branch_id` (AD-15)

**Given** the Supabase and Clerk projects are provisioned for this environment
**When** personal data is stored
**Then** it is held in an EU/UK region with a data-processing agreement per subprocessor, and RLS reads Clerk session claims via JWKS verification, never the deprecated JWT-template integration

**Given** schema changes are needed
**When** they are written
**Then** they are forward-only migrations applied through CI, never a manual change against production (AD-24)

### Story 1.6: API Foundations — Workspace-Scoped Access & Honest Errors

As an owner,
I want every action I take to be scoped to my own workspace and every error to tell me what happened and what to do next,
So that I never see another company's data or a raw failure message.

**Acceptance Criteria:**

**Given** a server route needs to read or write data
**When** it is written
**Then** service-role credentials are confined to a data-access layer whose every function takes a workspace as a required argument, resolved from the authenticated session — never from a request parameter, path segment, or body (AD-27)

**Given** the console reads data directly
**When** it queries via `supabase-js`
**Then** it reads under RLS keyed on Clerk session claims; every write and every entitlement-bearing operation instead goes through a server route handler, with RLS remaining enabled everywhere as defence in depth (AD-4)

**Given** any API route in the system
**When** it fails
**Then** the response carries a stable machine error code and a message key resolved from the ICU catalogue in the caller's language — never a bare code, stack trace, or generic failure string (NFR9), binding on every subsequent story in this document

**Given** the service starts with a missing or malformed required environment variable
**When** boot is attempted
**Then** the process refuses to start rather than running with a partially valid configuration

### Story 1.7: Owner Language Preference Persistence

As an owner,
I want my interface language choice to persist across sessions and devices,
So that I don't have to reselect it every time I sign in.

**Acceptance Criteria:**

**Given** an owner selects a language in settings
**When** they sign in again from a different device
**Then** the same language is applied, sourced from the persisted preference (FR46)

**Given** a first-time visitor with no stored preference
**When** they land on the console
**Then** `Accept-Language` is consulted once, and never again after a preference is explicitly set

**Epic 1 summary:** 7 stories. FRs covered: FR45, FR46, FR47, FR48, FR49, FR50, FR54, FR55, FR56, FR57.

## Epic 2: Screens, Pairing & Truthful Status

Owner pairs a screen with the six-character code and sees every screen listed with status that is never optimistic — derived solely from confirmed heartbeats. Earlier stories build the Screens home, Screen detail, and Pair-a-screen surfaces on fixtures (CAP-4, CAP-5, CAP-6); later stories wire the device API (register/heartbeat), real screen records, and read-time status derivation behind them.

### Story 2.1: Screens Home

As an owner,
I want to see every screen in my workspace grouped by branch with truthful status,
So that I know what's actually happening without guessing.

**Acceptance Criteria:**

**Given** the Screens surface with fixture data covering all three status tags (live, offline, no-auto-restart caveat)
**When** the owner views it
**Then** each row shows name, assigned playlist, last-confirmed time, and a status tag — a healthy screen carries no colour, while its accessible name still asserts health positively ("Live, confirmed just now")

**Given** a screen is not currently confirmed online
**When** its row renders
**Then** it shows an absolute last-confirmed timestamp, never "a while ago," and its playlist value is relabelled "last confirmed at HH:MM" rather than shown as current

**Given** an offline screen exists
**When** the owner is on any console surface
**Then** a full-bleed, non-dismissible alarm banner names the screen and links to its disclosure, and the affected row promotes into the structural border tier and expands in place to a complete sentence

**Given** a screen is on a best-effort device
**When** it is healthy
**Then** its row still carries a "No auto-restart" caveat tag — disclosed before anything goes wrong, not after

**Given** no screens exist yet
**When** the owner opens Screens for the first time
**Then** an instructional empty state reads "No screens yet" and offers pairing as its one action

**Given** screens exist across multiple branches
**When** the list renders
**Then** each branch's screens sit under a group header stating online/offline/stopped counts explicitly, omitting any zero count

### Story 2.2: Pair a Screen

As an owner,
I want to claim a screen by typing the code shown on the TV,
So that the screen joins my workspace without any technical setup.

**Acceptance Criteria:**

**Given** the pairing UI
**When** the owner interacts with the code field
**Then** there is exactly one auto-focused field — never six boxes with auto-advancing focus — it is case-insensitive, accepts a pasted whole code, and never validates per character

**Given** the pairing UI at a 390px viewport
**When** the owner completes the flow
**Then** every step is fully usable at that width — the fifteen-minute test's narrowest real constraint

**Given** a wrong code is submitted (fixture)
**When** the result returns
**Then** the UI names it as a wrong code and invites a retry, with copy distinct from the other two failures

**Given** an expired code is submitted (fixture)
**When** the result returns
**Then** the UI states the player has already displayed a fresh code and directs the owner to look back at the TV, rather than saying "invalid code"

**Given** the workspace is at its entitlement ceiling (fixture)
**When** a valid code is submitted
**Then** the UI states this is not a pairing problem, names the plan's screen limit, and links to Billing

### Story 2.3: Screen Detail

As an owner,
I want to rename a screen, reassign its playlist, re-pair it, or remove it,
So that I can manage a screen's lifecycle without losing its history.

**Acceptance Criteria:**

**Given** an existing screen's detail view
**When** the owner edits its name, playlist assignment, schedule, or timezone
**Then** the field updates optimistically and rolls back with an assertive announcement if the simulated write fails

**Given** the screen detail view
**When** the owner initiates removal
**Then** a confirmation names the specific screen and states its entitlement slot will be released

**Given** the screen detail view
**When** the owner initiates re-pairing
**Then** the confirmation states that name, schedule, and playlist assignment will survive the re-pair

**Given** the screen's device tier
**When** the detail view renders
**Then** the tier is disclosed with its consequence stated in one sentence, not just a label

### Story 2.4: Device Registration & Pairing Code Issuance

As an owner,
I want a newly powered-on screen to show a claimable code immediately,
So that pairing works the moment the stick is plugged in.

**Acceptance Criteria:**

**Given** a player with no stored device credential
**When** it calls `POST /device/register`
**Then** the server issues a single-use six-character pairing code from an alphabet excluding visually ambiguous glyphs (`0 O 1 I L 5 S 2 Z 8 B`), valid for 15 minutes, returned without authentication

**Given** `POST /device/register` is called repeatedly
**When** request volume is measured
**Then** it is rate-limited per IP and globally, with pairing-code issuance bounded so the code space cannot be exhausted

**Given** a displayed code is not claimed within 15 minutes
**When** the expiry elapses
**Then** the player automatically requests and displays a fresh code with no manual intervention

### Story 2.5: Screen Claim, Entitlement & Device Credential

As an owner,
I want submitting a valid code to actually create my screen,
So that pairing is a real action, not just a UI state.

**Acceptance Criteria:**

**Given** a valid, unexpired pairing code entered by the owner
**When** the claim request is submitted
**Then** a screen record is created in the owner's workspace, bound to the workspace's default branch, a one-to-one `screen_telemetry` row is initialised empty, and an opaque device credential is minted, hashed at rest, and returned to the player in the same round trip (AD-16, AD-20)

**Given** the entitlement check and the screen insert
**When** two claims race simultaneously
**Then** they happen inside one transaction with the count locked, so both cannot succeed past the plan's screen limit (AD-17)

**Given** a device declares its tier during registration
**When** the claim completes
**Then** the screen record stores whether it is certified or best-effort (FR6a)

**Given** a code that is already expired or already claimed
**When** the owner submits it
**Then** the claim is rejected with a reason distinguishing "already expired, a fresh code is showing" from "already claimed"

**Given** the owner is at their plan's screen limit
**When** they submit an otherwise-valid code
**Then** the claim is rejected with a machine code identifying it as an entitlement ceiling, distinct from a pairing failure

### Story 2.6: Heartbeat & Read-Time Status Derivation

As an owner,
I want the dashboard's status to come only from confirmed heartbeats,
So that I never see a screen reported as fine when Lawha can't actually confirm it.

**Acceptance Criteria:**

**Given** a paired screen
**When** its player calls `POST /device/heartbeat` with identity, current item, and cache state
**Then** `screen_telemetry` is updated — the only table this endpoint ever writes — and the request is rate-limited per device token

**Given** the screen list is queried
**When** status is computed
**Then** it is derived at read time from `screen_telemetry.last_seen` — online only if the last heartbeat is within 180 seconds — with no stored `is_online` column and no miss counter (AD-12)

**Given** a screen has never sent a heartbeat
**When** queried
**Then** it is treated as offline, never optimistically as online

**Given** a screen's last heartbeat is older than 180 seconds
**When** the owner views it
**Then** the API returns its exact last-seen timestamp and labels any content shown as last-known, not current

### Story 2.7: Screen Management — Rename, Reassign, Remove, Re-pair

As an owner,
I want my edits, removals, and re-pairs to actually persist,
So that Screen Detail (Story 2.3) is wired to something real.

**Acceptance Criteria:**

**Given** an existing screen
**When** the owner renames it or reassigns its playlist via the API
**Then** the change is saved as a workspace fact immediately, with no wait for a heartbeat to confirm the write itself

**Given** an existing screen
**When** the owner removes it via the API
**Then** the screen row is hard-deleted, its entitlement slot is released immediately, and its device credential is revoked — no soft-delete column exists anywhere in this table

**Given** an existing screen and a new physical device
**When** the owner re-pairs it via the API
**Then** the screen keeps its name, schedule, and playlist assignment, and a new device credential is minted, replacing the old one, which is no longer valid

**Epic 2 summary:** 7 stories. FRs covered: FR6a, FR15, FR16, FR17, FR18, FR19, FR20, FR21, FR22, FR23, FR59 (baseline).

## Epic 3: Player Display Surface & Runtime Reliability

The player renders all eight states at fixed 16:9 on fixtures first (CAP-13, CAP-16); later stories replace the fixture source with a real, supervised runtime that caches media, plays offline, self-recovers through a fixed escalation ladder, and holds the display awake. This is the epic the fourteen-day test is judged against.

### Story 3.1: Player State Rendering — All Eight States

As a venue owner standing in front of the TV,
I want the screen to clearly show what it's doing — pairing, preparing, playing, nothing to play, between windows, subscription stopped, recovering, or dark,
So that I always understand the wall's state.

**Acceptance Criteria:**

**Given** the player fixture harness driving each of the eight states
**When** each state is selected
**Then** it renders correctly at fixed 16:9 with no browser chrome, cursor, or scrollbar, using `vmin` type tiers readable at 2–4 metres

**Given** the owner-register states — Pairing, Preparing, Nothing-to-play
**When** rendered
**Then** they use owner-register tokens (white ground, black text, branded, instructional) and say what they're doing in plain language

**Given** the customer-register states — Between-windows, Subscription-stopped
**When** rendered
**Then** they carry no text in any language, using the near-black player-neutral ground and a single visible mark

**Given** the trial badge is shown during Playing
**When** direction is Arabic vs English
**Then** it mirrors by grid alignment, never by inset positioning, staying within the outer 10% margin at ≤2% of screen area, never animating

**Given** a page reload occurs mid-playback (simulated)
**When** it completes
**Then** the last rendered frame is held rather than flashing to white

**Given** the manifest carries a `reducedMotion` flag (fixture)
**When** set
**Then** the player cross-fade degrades to a hard cut

### Story 3.2: Fixture Harness for Player States

As a developer verifying the player,
I want to drive any state from a switcher with no backend,
So that every state is demonstrated rather than described.

**Acceptance Criteria:**

**Given** the fixture harness
**When** any of the eight player states (or console-offline) is selected
**Then** the player renders that state with no network dependency

**Given** a production build
**When** it is produced
**Then** the fixture harness is absent, and its removal breaks nothing else in the bundle

### Story 3.3: Local Media Caching & Offline Playback

As an owner,
I want the screen to keep playing even when the internet drops,
So that a flaky connection never means a dark wall.

**Acceptance Criteria:**

**Given** assigned media
**When** it is fetched
**Then** it is cached locally by content hash (never by URL) and played from that cache during normal operation, not from the network

**Given** the network connection is lost
**When** playback is in progress
**Then** it continues uninterrupted — offline is the normal operating case, not an error state

**Given** connectivity returns after an outage
**When** the player detects it
**Then** synchronisation resumes automatically with no human action

**Given** the local cache is corrupt or partially written
**When** the player starts
**Then** it re-fetches rather than failing to start

**Given** a media URL returns 403 (signed URL expired)
**When** the player encounters it
**Then** it re-fetches the manifest rather than treating it as a failure

### Story 3.4: Fault Detection, Recovery Ladder & Wake Lock

As an owner,
I want the screen to fix itself when something goes wrong,
So that I never have to physically visit it to unstick it.

**Acceptance Criteria:**

**Given** an unhandled error, no playback progress for 30 seconds, a decode failure, or no render-loop tick for 10 seconds
**When** any is detected
**Then** the player begins recovery within 10 seconds, escalating through a fixed ladder: (1) skip the failing item, (2) re-initialise the playback surface without a page load, (3) full page reload with cache intact, (4) stop responding and let the launcher restart the process

**Given** an item fails repeatedly
**When** the ladder escalates
**Then** the fault counter persists in IndexedDB across reloads, the item is quarantined and skipped, and the quarantine is reported in the next heartbeat

**Given** the player is playing
**When** it runs
**Then** the display is held awake for as long as playback continues, suppressing screensaver and sleep

**Given** a certified device loses and regains power
**When** it boots
**Then** the launcher relaunches the browser and the player resumes with no menu, prompt, or input — explicitly not provided on best-effort devices

**Given** the player has no playable content
**When** nothing is assigned
**Then** it displays the defined holding state — never a browser error page, blank screen, or stack trace

**Given** a device is being evaluated for the certified tier
**When** Wake Lock support is checked
**Then** it is verified per device before certification; devices lacking it use the muted-looping-video fallback instead

### Story 3.5: Memory Bounding During Decode

As an owner,
I want the player to never crash from running out of memory,
So that a screen doesn't silently die from playing a video too long.

**Acceptance Criteria:**

**Given** a playlist is playing
**When** items advance
**Then** at most one item is preloaded ahead of the item playing, and decoded resources are released for any item neither playing nor next

**Given** the DOM
**When** media is playing
**Then** exactly two media elements are ever attached, double-buffered for gapless swaps, with object URLs revoked when an item is released

**Given** the device's storage
**When** a new revision is about to be cached
**Then** `navigator.storage.estimate()` is consulted first so the player degrades predictably rather than hitting the quota wall

**Given** sustained video decode under memory pressure
**When** the host would otherwise OOM-kill the process
**Then** the bounding above keeps memory within the ceiling — an explicit acceptance test on certified-tier hardware

### Story 3.6: Content & Playlist Change Application

As an owner,
I want a playlist change to show up on the wall without restarting the screen,
So that updates feel instant and predictable.

**Acceptance Criteria:**

**Given** a playlist or content change is pushed
**When** the currently playing item has not been removed or altered
**Then** the change applies once that item finishes its current duration — no restart, no flash

**Given** the currently playing item is itself removed or altered
**When** the change is pushed
**Then** the player advances immediately rather than waiting out a duration that no longer applies

### Story 3.7: Local Schedule Evaluation & Trusted Time

As an owner,
I want the screen to keep playing the right thing on schedule even while offline,
So that a network gap doesn't mean wrong content on the wall.

**Acceptance Criteria:**

**Given** the resolved weekly timetable cached from the last manifest
**When** the player is offline
**Then** it evaluates the schedule locally from those cached rules, with no dependency on a live connection

**Given** a heartbeat response
**When** received
**Then** the player takes the server timestamp and maintains an offset against its own monotonic clock

**Given** the last successful time sync is older than a defined staleness threshold
**When** schedule resolution runs
**Then** confidence is low and the player plays the fallback playlist rather than guessing a window, reporting low confidence in its heartbeat

### Story 3.8: Player Locale & Font Delivery

As an Arabic-speaking customer looking at the wall,
I want the on-screen text to render in Arabic with the correct typeface even if the network just dropped,
So that the screen never falls back to a broken font.

**Acceptance Criteria:**

**Given** the manifest specifies a locale
**When** the player renders
**Then** it takes language and direction from the manifest only — never from the device or browser locale

**Given** Arabic and Latin display faces
**When** the player's application shell is built
**Then** they are self-hosted, subset, and precached by the service worker as part of the shell — never resolved from host fonts, never loaded as content

**Given** the network is unavailable
**When** Arabic content needs to render
**Then** the bundled Arabic typeface is still available from the offline cache

### Story 3.9: Player Build Versioning & Canary Rollout

As the operator,
I want a bad player build to affect only a few screens before it's caught,
So that one mistake doesn't stop every screen simultaneously.

**Acceptance Criteria:**

**Given** the manifest names the player build version a screen must run
**When** the service worker checks it
**Then** it fetches and activates that versioned bundle at an item boundary, never mid-video

**Given** a build needs to roll back
**When** the operator changes the manifest's named version
**Then** the rollback takes effect within one heartbeat cycle, with no redeploy required

**Given** a new build is released
**When** it is rolled out
**Then** canary screens receive it before the rest of the fleet

**Epic 3 summary:** 9 stories. FRs covered: FR1, FR2, FR3, FR4, FR5, FR6, FR7, FR8, FR9, FR10, FR11, FR12, FR13, FR14, FR51, FR52.

## Epic 4: Media Library

Owner uploads real image and video files, sees them in a real library with thumbnails and sizes, and the storage meter reflects real workspace usage against the pooled allowance. Earlier stories build the library and uploader on fixtures (CAP-7); later stories wire real upload, storage, and the client-side flash check to real files and a real pooled allowance.

### Story 4.1: Media Library & Uploader

As an owner,
I want to upload media and immediately know if something's wrong with it,
So that I don't find out from a customer that a file doesn't work.

**Acceptance Criteria:**

**Given** the uploader UI (fixture-backed)
**When** a file exceeds 150 MB (video) or 15 MB (image)
**Then** the ceiling is enforced before transfer begins, and the rejection names the specific limit

**Given** an unsupported format or codec is selected
**When** upload is attempted
**Then** the rejection names format, size, or codec specifically — never "invalid file" — and states MP4/H.264 as the guaranteed-playable combination

**Given** a video file with flash-content characteristics (fixture: confident breach)
**When** analysed client-side before transfer
**Then** it is refused with a reason in the same shape as format/size rejections

**Given** a video file with an uncertain flash-analysis result (fixture)
**When** analysed
**Then** the owner sees a warning they must explicitly acknowledge before upload proceeds

**Given** multiple files are uploaded in a batch
**When** one fails
**Then** it does not fail the batch, progress is shown per file, and each per-file outcome is announced

**Given** the media library
**When** the owner attempts to delete an item in use
**Then** the confirmation names the specific playlists using it

**Given** the storage meter
**When** rendered
**Then** it shows an absolute figure alongside the meter, never a bare percentage

### Story 4.2: Real Media Upload & Object Storage

As an owner,
I want my uploaded files to actually be stored,
So that they're there when I build a playlist with them.

**Acceptance Criteria:**

**Given** an image or video file from the browser
**When** upload completes
**Then** it is stored in R2 and a media row is created in the owner's workspace with a content hash

**Given** the same ceilings enforced client-side
**When** the server receives an upload
**Then** it re-validates size and format server-side as defence in depth

**Given** a stored media object
**When** the manifest references it
**Then** it carries `{hash, url}` — the player looks up its cache by hash, never by URL

### Story 4.3: Media Library Listing & Deletion

As an owner,
I want to see everything I've uploaded and remove what I no longer need,
So that my library stays manageable.

**Acceptance Criteria:**

**Given** media exists in the workspace
**When** the library is queried
**Then** each item returns thumbnail, name, size, and upload date

**Given** media referenced by a playlist
**When** deletion is attempted
**Then** the foreign key restricts the delete and the API names which playlists use it — the owner must detach first

**Given** media not referenced anywhere
**When** deletion is requested
**Then** it is removed

### Story 4.4: Storage Meter & Pooled Allowance

As an owner,
I want to see how much of my storage allowance I've used,
So that I know when to clean up before I run out.

**Acceptance Criteria:**

**Given** a workspace with a screen count and the 10 GB/screen pooled allowance
**When** storage is queried
**Then** the API returns bytes used and bytes allowed as absolute figures, pooled across the whole workspace rather than per screen

**Given** media shared across multiple screens (same item, three playlists)
**When** storage is calculated
**Then** it is counted once, not once per assignment

### Story 4.5: Client-Side Flash-Content Check — Policy & Wiring

As an owner,
I want a risky video caught before it ever reaches a public wall,
So that I don't unknowingly put a strobe effect in front of my customers.

**Acceptance Criteria:**

**Given** a stated content policy for the WCAG 2.3.1 general flash threshold
**When** a video is analysed client-side before transfer
**Then** a confident breach is refused with a reason in the FR26 shape

**Given** an uncertain or unanalysable result
**When** analysis completes
**Then** the owner sees a warning they must acknowledge before upload proceeds, and the acknowledgement is recorded

**Given** this is a client-side heuristic
**When** conformance is discussed
**Then** it is documented as exposure reduction, not full conformance — server-side analysis on ingest remains a future revisit, not built here

### Story 4.6: Cacheable Media Delivery

As an owner,
I want media I upload once to not be re-downloaded to every screen on every rotation,
So that my bandwidth costs stay predictable.

**Acceptance Criteria:**

**Given** a manifest revision
**When** it references media
**Then** each asset's signed GET URL has a 7-day TTL, reissued fresh in every manifest revision — never expiring on a timer independent of content change

**Given** a screen's content is unchanged
**When** time passes
**Then** no media is re-fetched — only heartbeat traffic occurs

**Given** normal operation (a playlist up to 3 minutes at 1080p, changed weekly)
**When** bandwidth is measured
**Then** recurring delivery per screen stays at or below 2 GB/month

**Epic 4 summary:** 6 stories. FRs covered: FR24, FR25, FR26, FR27, FR28, FR29, FR30, FR83.

## Epic 5: Playlists & Manifest Delivery

Owner builds a playlist and assigns it to a screen. Earlier stories build the playlist editor on fixtures (CAP-8); later stories wire the manifest assembler so an assignment actually reaches the wall — closing the loop Epics 1–4 set up, with the two-step assigned-then-playing confirmation intact.

### Story 5.1: Playlist Editor

As an owner,
I want to build and reorder a playlist without needing a mouse,
So that the editor works for me regardless of how I interact with it.

**Acceptance Criteria:**

**Given** the playlist editor (fixture-backed)
**When** the owner reorders items
**Then** it works by keyboard and by explicit move controls — never drag-only

**Given** an image item and a video item
**When** durations are set
**Then** images take a per-item duration control; videos show their full length with no duration control

**Given** the editor
**When** the owner looks for a way to push changes live
**Then** there is no Publish button — the editor instead states, per assigned screen, when the change has reached it, as a continuously arriving status

**Given** a change is made to the currently-playing item
**When** the editor explains timing
**Then** it states plainly that the item currently on screen plays to the end of its duration before the change takes effect, unless that item was itself removed or altered, in which case it says the screen advances immediately

### Story 5.2: Playlist CRUD & Ordering

As an owner,
I want to create playlists and control what's in them and in what order,
So that I control exactly what plays.

**Acceptance Criteria:**

**Given** the owner names a new playlist
**When** it is created
**Then** it exists as an empty ordered list in the workspace

**Given** media items
**When** added to a playlist
**Then** they are stored in an explicit order the owner controls

**Given** items in a playlist
**When** reordered via the API
**Then** the new order is persisted

**Given** an image item in a playlist
**When** configured
**Then** it carries a per-item display duration; a video item plays its full length by default with no duration override

**Given** a playlist assigned to a screen
**When** the player plays it
**Then** it loops continuously — this needs no explicit "loop" flag in the manifest; the player (Epic 3) always loops whatever it's given

### Story 5.3: Screen Assignment & Two-Step Confirmation

As an owner,
I want to assign a playlist to a screen and know the difference between "saved" and "actually playing,"
So that I never mistake a change I made for a change that's live.

**Acceptance Criteria:**

**Given** a playlist assignment to one or more screens
**When** the owner saves it
**Then** the API returns success immediately as a workspace fact — "assigned"

**Given** that same assignment
**When** the assigned screen's next heartbeat confirms the new content
**Then** only then does the API report it as "playing" — the two facts are never collapsed into one status field

### Story 5.4: Manifest Assembly — Single Path, Auto-Propagation & Revisioning

As an owner,
I want any change I make to a playlist or its assignment to reach the wall automatically,
So that I never have to remember a separate publish step.

**Acceptance Criteria:**

**Given** a manifest needs to be built for any screen
**When** it is assembled
**Then** exactly one assembler in `packages/domain` builds it — no route, job, or query composes a manifest by hand

**Given** a write that can affect a manifest (playlist edit, reorder, assignment change)
**When** it is committed
**Then** the screens it affects are declared, and their manifest revision is recomputed inside the same transaction as the write, with no separate publish step

**Given** the same write produces an identical assembled document
**When** compared to the previous revision
**Then** no new revision is created and nothing is redistributed

**Given** the manifest revision itself
**When** computed
**Then** it is a server-computed content hash of the assembled document

**Given** a manifest is about to be persisted or activated
**When** validated
**Then** `packages/manifest-contract`'s runtime validator checks it on both the assembler (before persisting) and the player (before activating) — a manifest failing validation is rejected without touching the currently active revision

### Story 5.5: Manifest Activation — Fully-Cached-Only & Locale Field

As an owner,
I want a new revision to never half-appear on the wall,
So that a partially loaded update never shows broken content.

**Acceptance Criteria:**

**Given** a newly fetched manifest revision
**When** any asset it references is not yet present in the local cache
**Then** the previous revision continues playing until every asset is cached

**Given** a revision has become fully cached
**When** it activates
**Then** activation happens at an item boundary, never mid-item, unless the currently playing item was itself removed or altered

**Given** a screen's language setting
**When** the manifest is assembled
**Then** it carries a locale field sourced from the owner's console settings, never inferred by the player itself

**Epic 5 summary:** 5 stories. FRs covered: FR31, FR32, FR33, FR34, FR35, FR36, FR37.

## Epic 6: Scheduling

Owner schedules playlists to day/time windows and trusts the resolved outcome. Earlier stories build the schedule editor on fixtures (CAP-9); later stories wire server-side precedence resolution into the manifest so the console only ever renders answers, never rules.

### Story 6.1: Schedule Editor

As an owner,
I want to see what will actually play at any given time without having to understand precedence rules,
So that scheduling doesn't require any special knowledge.

**Acceptance Criteria:**

**Given** the schedule editor (fixture-backed)
**When** rendered
**Then** it shows the resolved weekly outcome as its primary artifact — the four precedence rules are never displayed or explained anywhere in the UI

**Given** a new window would override an existing one
**When** the owner is editing
**Then** the editor states, in one sentence, which window wins and why, at the moment of editing — not after saving

**Given** multiple playlists across the week
**When** displayed
**Then** they are never colour-coded by identity — blocks are distinguished by fill inversion only, since colour is reserved for signal

**Given** hours with no scheduled window and no fallback
**When** rendered
**Then** they are flagged in amber with a plain sentence stating the screen will show a holding card, before it happens

**Given** the working week setting
**When** configured
**Then** it is not hardcoded to Monday–Friday

### Story 6.2: Schedule CRUD & Fallback

As an owner,
I want to bind a playlist to a day-of-week and time window, and define what plays otherwise,
So that my screen always has a plan.

**Acceptance Criteria:**

**Given** a playlist and a day-of-week/time window
**When** the owner creates a schedule entry
**Then** it is stored bound to that playlist, at either branch or screen level

**Given** a screen with no active scheduled window
**When** the fallback playlist is defined
**Then** it plays during any time no scheduled window is active

**Given** a screen's timezone
**When** not explicitly set
**Then** it defaults to the workspace timezone, and can be overridden per screen

### Story 6.3: Precedence Resolution & Resolved Weekly Timetable

As an owner,
I want the system to figure out precedence for me,
So that I never have to reason about overlapping schedules myself.

**Acceptance Criteria:**

**Given** multiple schedule entries at branch and screen level that overlap
**When** the server resolves them
**Then** it applies, in order: screen beats branch, narrower beats wider, later-created beats earlier, fallback plays last — collapsing the result into a flat 168-hour weekly timetable of segments

**Given** the resolved timetable
**When** carried in the manifest
**Then** it is stored against an IANA timezone identifier and evaluated as local wall time — the player (Epic 3) holds no precedence logic of its own

**Given** an overlap is being created or edited
**When** the owner is in the schedule editor
**Then** the server also returns a one-sentence explanation of which window wins, consumed directly by Story 6.1's UI (UX-DR6)

**Given** the working week configuration
**When** schedules are resolved
**Then** day-of-week evaluation respects the configured working week rather than assuming Monday–Friday

**Epic 6 summary:** 3 stories. FRs covered: FR38, FR39, FR40, FR41, FR42, FR44.

## Epic 7: Branches & Multi-location

A multi-branch owner manages several locations from a single account, bulk-assigns content to a whole branch, and sees per-branch health at a glance. Earlier stories build the Branches surface on fixtures (CAP-10); later stories wire real branch records, bulk assignment, and per-branch health.

### Story 7.1: Branches Surface

As a multi-branch owner,
I want to see the health of every location at a glance and push content to a whole branch at once,
So that I can manage several venues without treating them one screen at a time.

**Acceptance Criteria:**

**Given** the Branches surface (fixture-backed)
**When** rendered
**Then** each branch's health summary states online, offline, and stopped counts explicitly — never collapsed into one verdict, and any zero count is omitted rather than shown as "0 offline"

**Given** a bulk playlist assignment to a branch
**When** the owner commits it
**Then** the confirmation states the number of screens affected before committing, names any screen whose per-screen override will survive, and the action is undoable

**Given** branch timezone
**When** set once
**Then** it is described as inherited by every screen in that branch by default

**Given** a single-location owner
**When** they use the product
**Then** the word "branch" never appears in their path — a copy check, not a functional gate, since a default branch already exists silently

### Story 7.2: Branch CRUD & Screen Grouping

As an owner,
I want to create and organize branches for my locations,
So that my screen list reflects how my business is actually structured.

**Acceptance Criteria:**

**Given** the owner names a new branch with an optional address
**When** created
**Then** it exists in the workspace, alongside the implicit default branch from Story 1.5

**Given** a branch
**When** renamed or removed
**Then** the change persists; removing a branch states what happens to its screens (reassignment required, or the removal is blocked — the API decision is explicit in the response)

**Given** every screen
**When** queried
**Then** it belongs to exactly one branch — never zero, never more than one

**Given** the screen list
**When** the owner groups or filters it
**Then** it can be grouped and filtered by branch via URL state, so the view is linkable and survives reload

### Story 7.3: Bulk Playlist Assignment & Undo

As an owner,
I want to push a new playlist to every screen in a branch in one action,
So that I don't have to touch screens one at a time.

**Acceptance Criteria:**

**Given** a branch with multiple screens
**When** the owner assigns a playlist to the whole branch
**Then** every screen in the branch is updated in one action, and the API reports the exact count affected

**Given** screens in the branch with an existing per-screen schedule override
**When** the bulk assignment is applied
**Then** any screen whose override survives (screen beats branch, per Epic 6) is named explicitly in the response

**Given** a bulk assignment was just applied
**When** the owner triggers undo
**Then** the previous per-screen assignment is restored and the restoration is announced

### Story 7.4: Branch-Level Scheduling & Timezone Inheritance

As an owner,
I want to set a schedule and timezone once for a whole branch,
So that I don't have to configure every screen in that location individually.

**Acceptance Criteria:**

**Given** a schedule set at branch level
**When** a screen in that branch has no override of its own
**Then** the branch schedule is inherited by that screen through the Epic 6 precedence resolution (screen beats branch)

**Given** a branch's timezone
**When** set
**Then** every screen in the branch inherits it by default, and a screen can still override it individually

### Story 7.5: Per-Branch Health, Screen Movement & Billing Independence

As an owner,
I want to see which location needs attention and move a screen between branches without any disruption,
So that reorganizing doesn't cost me anything operationally.

**Acceptance Criteria:**

**Given** screens across branches with real heartbeat-derived status (Epic 2)
**When** the Branches surface is queried
**Then** each branch returns its online/offline/stopped counts, computed the same read-time way as the Screens surface — no separate stored health field

**Given** an existing screen
**When** the owner moves it to a different branch
**Then** it keeps its pairing, content, and schedule — no re-pairing, no rebuilding

**Given** branch structure
**When** entitlement or billing is calculated
**Then** it is entirely unaffected — screens are billed per screen regardless of branch, and adding a branch has no billing consequence

**Epic 7 summary:** 5 stories. FRs covered: FR70, FR71, FR72, FR73, FR74, FR75, FR76, FR77, FR78.

## Epic 8: Billing, Entitlement, Trial Lifecycle & Settings

Owner selects a plan, pays through the Merchant of Record, and sees entitlement enforced with real numbers; trial branding appears and clears correctly; subscription lapse and restore behave exactly per the truth contract; language/timezone/account settings persist. Earlier stories build Billing and Settings on fixtures (CAP-11, CAP-12); later stories wire the payment adapter, webhooks, and entitlement.

### Story 8.1: Billing & Entitlement Surface

As an owner,
I want to see exactly what I'm paying for and exactly when something will change,
So that billing never surprises me.

**Acceptance Criteria:**

**Given** the Billing surface (fixture-backed)
**When** rendered
**Then** plan, screen entitlement, invoices, receipts, and cancel are all reachable from one place

**Given** the workspace is at its entitlement ceiling (fixture)
**When** the at-limit state renders
**Then** it names the plan's screen count, the count currently in use, and the path to change plan

**Given** a payment failure (fixture)
**When** the banner renders
**Then** it names the exact date screens will stop — never "soon" or a countdown — and persists through every retry

**Given** a stopped subscription (fixture)
**When** the state renders
**Then** it states that restoring payment restores playback automatically, with no re-pairing and no rebuilding

### Story 8.2: Settings Surface

As an owner,
I want to control my language, timezone, and account details in one place,
So that I don't have to hunt for basic settings.

**Acceptance Criteria:**

**Given** the Settings surface (fixture-backed)
**When** rendered
**Then** interface language, workspace timezone, and account details are all editable there

**Given** a language change
**When** saved
**Then** it persists across sessions (wired to Story 1.7's backend)

**Given** workspace timezone
**When** set
**Then** it is described as the default every screen and branch inherits (Epic 6 / Epic 7 dependency, already wired)

### Story 8.3: Payment Provider Abstraction & Plan Selection

As an owner,
I want to pick a plan and pay,
So that I can actually get screens onto the paid tier.

**Acceptance Criteria:**

**Given** the payment port
**When** implemented
**Then** it exposes exactly four verbs — charge, subscribe, cancel, webhook — and `packages/domain` contains no vendor SDK; the Merchant of Record is reached only through an adapter implementing this port

**Given** an owner selecting a plan
**When** they complete checkout through the Merchant of Record
**Then** the workspace's subscription record reflects the selected screen count

### Story 8.4: Webhook Reconciliation & Subscription State

As an owner,
I want my subscription state to always match what I actually paid for,
So that a delayed or duplicate webhook never corrupts my account.

**Acceptance Criteria:**

**Given** a Merchant-of-Record webhook event
**When** received
**Then** the provider event ID is stored and deduped — a duplicate delivery never double-applies

**Given** webhook events arriving out of order
**When** processed
**Then** they are applied by event timestamp, not arrival order, and an event older than the already-applied state is ignored

**Given** subscription state
**When** reconciled
**Then** Merchant-of-Record state is the source of truth — never inferred from local activity alone

### Story 8.5: Real Entitlement Enforcement & Plan Management

As an owner,
I want my paid screen count to actually govern how many screens I can pair,
So that entitlement isn't just a number on a page.

**Acceptance Criteria:**

**Given** a workspace's real subscription record
**When** a screen pairing is attempted (Epic 2's entitlement mechanism)
**Then** the enforced ceiling comes from the real plan-driven screen count, not a placeholder default

**Given** an owner changing plan, cancelling, or viewing invoices and receipts
**When** they act from Billing
**Then** each action is available and reflects the real subscription state from the Merchant of Record

### Story 8.6: Subscription Termination & Restoration

As an owner,
I want a stopped subscription to behave exactly as promised — screens go neutral, then come back automatically,
So that a billing problem never becomes a re-pairing problem.

**Acceptance Criteria:**

**Given** a subscription reaches termination (not first failed charge)
**When** the state changes
**Then** the screen's manifest field flips to "stopped," bumping its revision — the device credential is never revoked (AD-18)

**Given** a subscription is on the path to termination
**When** a payment first fails and at each Merchant-of-Record retry
**Then** the owner receives an email, and a persistent dashboard banner names the exact date screens will stop

**Given** a screen's manifest field is "stopped"
**When** the player (Epic 3) picks it up
**Then** it shows the neutral, non-embarrassing holding card — no payment failure, pricing, or account details visible to the venue's customers

**Given** payment is restored
**When** the next heartbeat occurs
**Then** the manifest field flips back and playback resumes automatically, with no re-pairing and no rebuilt playlists

### Story 8.7: Trial Branding & Removal

As an owner,
I want the trial badge to appear only during my trial and disappear the moment I pay,
So that my screen looks fully professional to a paying customer's business.

**Acceptance Criteria:**

**Given** an active free trial
**When** the manifest is assembled
**Then** it carries a trial-branding flag the player (Epic 3) renders as the badge; on any paid plan, the flag is absent and the wall carries no vendor branding of any kind

**Given** the badge's size, placement, and opacity
**When** rendered
**Then** it is already constrained by Story 3.1's implementation (≤2% area, outer 10% margin, reduced opacity, no animation) — this story only owns the flag driving it

**Given** payment is confirmed
**When** the next heartbeat cycle completes
**Then** the trial-branding flag clears and branding disappears — no re-pairing, player restart, or manual action required, visible the same day

**Epic 8 summary:** 7 stories. FRs covered: FR58, FR59 (real), FR60, FR61, FR62, FR63, FR63a, FR63b, FR63c, FR79, FR80, FR81, FR82.
