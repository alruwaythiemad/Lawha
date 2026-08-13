---
stepsCompleted:
  - step-01-document-discovery
  - step-02-prd-analysis
  - step-03-epic-coverage-validation
  - step-04-ux-alignment
  - step-05-epic-quality-review
  - step-06-final-assessment
documentsInScope:
  prd: _bmad-output/planning-artifacts/prds/prd-the_project-2026-08-11/prd.md
  architecture: _bmad-output/planning-artifacts/architecture/architecture-the_project-2026-08-11/ARCHITECTURE-SPINE.md
  epics: _bmad-output/planning-artifacts/epics.md
  ux:
    experience: _bmad-output/planning-artifacts/ux-designs/ux-the_project-2026-08-11/EXPERIENCE.md
    design: _bmad-output/planning-artifacts/ux-designs/ux-the_project-2026-08-11/DESIGN.md
  brief: _bmad-output/planning-artifacts/briefs/brief-the_project-2026-08-11/brief.md
---

# Implementation Readiness Assessment Report

**Date:** 2026-08-12
**Project:** the_project

## Document Discovery

**PRD:**
- `prds/prd-the_project-2026-08-11/prd.md` (50,932 bytes, modified 2026-08-11 11:17)

**Architecture:**
- `architecture/architecture-the_project-2026-08-11/ARCHITECTURE-SPINE.md` (36,273 bytes, modified 2026-08-11 11:16)

**Epics & Stories:**
- `epics.md` (95,536 bytes, modified 2026-08-12 01:46)

**UX Design:**
- `ux-designs/ux-the_project-2026-08-11/EXPERIENCE.md` (40,849 bytes, modified 2026-08-11 10:41)
- `ux-designs/ux-the_project-2026-08-11/DESIGN.md` (34,823 bytes, modified 2026-08-11 10:38)

**Supporting (not primary assessment inputs):**
- `briefs/brief-the_project-2026-08-11/brief.md` (11,497 bytes, modified 2026-08-11 06:26)

**Duplicates Found:** None — each document type has exactly one whole-document version; no sharded/whole conflicts detected.

**Missing Documents:** None — PRD, Architecture, Epics, and UX are all present.

## PRD Analysis

### Functional Requirements

**Group A — Player**

FR-1: The player runs as a web application at a unique per-screen URL and requires no installation beyond a browser.
FR-2: The player renders fullscreen with no browser chrome, menus, scrollbars, or visible cursor.
FR-3: The player caches all assigned media locally and plays from that cache during normal operation, not from the network.
FR-4: The player continues playback uninterrupted when the network connection is lost. Offline is the normal operating case, not an error state.
FR-5: The player resumes synchronisation automatically when connectivity returns, with no human action.
FR-6: The player detects its own failure and recovers without human action. Failure is defined as any of: an unhandled error, no playback progress for 30 seconds while an item should be playing, a decode failure, or no render-loop tick for 10 seconds. Recovery begins within 10 seconds of detection. In-page recovery handles what it can; process-level death is caught by the certified device's launcher. On best-effort devices, process death is unrecoverable and this is disclosed.
FR-6a: The dashboard identifies whether each screen is running on a certified or best-effort device, so an owner knows which recovery guarantees apply to that screen.
FR-7: The player holds the display awake for as long as it is playing, suppressing screensaver and sleep.
FR-8: On certified devices, the player relaunches automatically after a power cycle and resumes playback with no menu, prompt, or input. The mechanism is the device launcher — a systemd service on Raspberry Pi, boot-start in the kiosk application on Android — because a browser page cannot relaunch itself. On best-effort devices this is explicitly not provided.
FR-9: The player emits a heartbeat at a fixed interval carrying its identity, the item currently playing, and its cache state.
FR-10: The player bounds its memory use during media decode: it preloads at most one item ahead of the item playing, and releases decoded resources for any item that is neither playing nor next. It does not hold the whole playlist decoded.
FR-11: The player applies content and playlist changes without a restart. The item currently on screen plays to the end of its duration before the change takes effect, unless that item was itself removed or altered, in which case the player advances immediately.
FR-12: When the player has no playable content, it displays a defined holding state. It never displays a browser error page, a blank screen, or a stack trace.
FR-13: The player evaluates its schedule locally from cached rules, so scheduling continues to work while offline.
FR-14: The player recovers from a corrupt or partial cache by re-fetching rather than failing to start.

**Group B — Pairing and screens**

FR-15: On first launch, an unpaired player displays a six-character pairing code and instructions in the configured language.
FR-16: An owner claims a screen by entering that code in the dashboard. Codes are single-use and expire 15 minutes after being displayed; an unclaimed player generates and displays a fresh code on expiry rather than stranding the screen.
FR-17: The dashboard lists every screen in the workspace with its name, assigned playlist, and status.
FR-18: Screen status derives solely from heartbeat recency. The dashboard never reports playback it has not confirmed.
FR-19: Any screen not currently confirmed online displays a last-seen timestamp.
FR-20: Content shown for an offline screen is explicitly labelled as last-known rather than current.
FR-21: An owner can rename a screen and reassign its playlist.
FR-22: An owner can remove a screen, releasing its entitlement slot.
FR-23: An owner can re-pair an existing screen record to a new device without losing its name, schedule, or assignment.

**Group I — Branches and multi-location**

FR-70: An owner can create, rename, and remove branches within their workspace, each with a name and an optional address.
FR-71: Every screen belongs to exactly one branch. A default branch exists and is used implicitly, so a single-location customer is never asked to create one.
FR-72: The screen list can be grouped and filtered by branch.
FR-73: An owner can assign a playlist to every screen in a branch in one action, without touching screens individually.
FR-74: A schedule can be applied at branch level and inherited by that branch's screens, with per-screen override where needed. Branch-versus-screen precedence follows the rules stated in Group E: screen beats branch.
FR-75: Each branch carries its own timezone, inherited by its screens by default. A company operating across timezones schedules correctly without per-screen configuration.
FR-76: The dashboard shows a per-branch health summary — screens online, offline, and stopped — so an owner can see which location needs attention without reading a flat list.
FR-77: An owner can move a screen between branches without re-pairing it or rebuilding its content.
FR-78: Branch structure does not affect billing, which remains per screen. Adding a branch is free; adding a screen is not.

**Group C — Media**

FR-24: An owner can upload image and video files from the browser.
FR-25: Uploads are subject to per-file ceilings of 150 MB for video and 15 MB for images.
FR-26: Unsupported formats are rejected at upload with a specific, actionable reason. MP4/H.264 is the guaranteed-playable combination. 4K video is not supported in v1.
FR-27: The media library lists items with thumbnail, name, size, and upload date.
FR-28: An owner can delete media, and is warned when the item is in use by a playlist.
FR-29: The dashboard shows storage consumed against the plan allowance. The allowance is 10 GB per screen, pooled across the workspace.
FR-30: Media is served to players over cacheable URLs suitable for long-lived local caching.
FR-83: Uploaded video is checked for flash content before it can reach a wall. The check runs client-side, before transfer, alongside the FR-25 and FR-26 validations. A confident breach of the WCAG 2.3.1 general flash threshold is refused with a reason in the FR-26 shape; an uncertain or unanalysable result is a warning the owner must acknowledge; a stated content policy backs both.

**Group D — Playlists**

FR-31: An owner can create and name playlists.
FR-32: An owner can add media items to a playlist in an explicit order.
FR-33: An owner can reorder items.
FR-34: Images have a per-item display duration. Videos play their full length by default.
FR-35: A playlist can be assigned to one or more screens.
FR-36: Playlists loop continuously.
FR-37: Playlist changes propagate to assigned screens without a manual push step.

**Group E — Scheduling**

FR-38: An owner can schedule a playlist to a day-of-week and time-of-day window.
FR-39: A screen supports multiple schedule entries. Where windows overlap, precedence resolves by defined rules, and the dashboard shows the owner which playlist will actually play at any given time.
FR-40: An owner can define the fallback playlist that plays outside all scheduled windows.
FR-41: Schedules are evaluated in the screen's local timezone.
FR-42: A screen's timezone is configurable and defaults to the workspace timezone.
FR-44: The working week is configurable and is not hardcoded to Monday–Friday.

*(FR-43 — Gregorian and Hijri calendar display — was withdrawn during architecture on 2026-08-11 by product-owner direction. Its ID is retired, not reused.)*

**Group F — Bilingual layer**

FR-45: The admin interface is complete in English and Arabic. No screen, error message, or empty state falls back to the other language. One exception: the hosted authentication surface (FR-53). It does not widen — no surface Lawha builds may claim it.
FR-46: Language selection persists per user across sessions and devices.
FR-47: Arabic renders in a fully mirrored RTL layout: navigation position, directional icons, progress and stepper direction, form and label alignment, table column order, and drawer and menu origin all invert. Done is defined mechanically: layout code uses CSS logical properties throughout, and contains no physical left/right layout property. Non-directional icons — a camera, a clock — do not mirror.
FR-48: No text container has a fixed height or width that clips content when strings expand. Layouts reflow.
FR-49: Text is UTF-8 end to end, with no exception anywhere in the storage or rendering path.
FR-50: Mixed Arabic/Latin runs — prices, brand names, phone numbers, units — render per the Unicode Bidirectional Algorithm with explicit isolation around embedded LTR runs.
FR-51: Arabic display typefaces are bundled with the player and never resolved from the host device's fonts.
FR-52: Bundled fonts are available from the offline cache. A player that loses its Arabic typeface when the network drops fails the Arabic test.
FR-53: The hosted authentication surface renders in English in both locales: not translated, not mirrored, not replaced. Checkout is unchanged and still must render in Arabic and mirror correctly, or be replaced.
FR-54: Dates, times, and numerals are formatted per the active locale.
FR-55: Navigation patterns tolerate label expansion. Horizontal tab rows that clip or wrap under longer strings are not acceptable.

**Group G — Account and billing**

FR-56: An owner can register and sign in via hosted authentication using email or a Google account.
FR-57: Each account has one workspace in v1. The schema carries workspace boundaries from the first migration to permit multi-workspace later without migration of live data.
FR-58: An owner can select a plan and complete checkout through the Merchant of Record. The price itself is deferred (§12.2) — resolved to $5/screen/month.
FR-59: Screen entitlement is enforced: an owner cannot pair more screens than their plan allows, and is told clearly why when they hit the ceiling.
FR-60: Subscription state is reconciled from Merchant-of-Record webhooks and treated as the source of truth.
FR-61: Payment provider access is mediated by an internal abstraction — charge, subscribe, cancel, webhook — so a second provider can be added without touching product code.
FR-62: An owner can change plan, cancel, and reach invoices and receipts.
FR-63: When a subscription terminates, the screen stops playing and displays a neutral holding card. The trigger is subscription termination, not first failed charge.
FR-63a: The owner is warned before a screen stops: by email at first payment failure and at each Merchant-of-Record retry, and by a persistent dashboard banner naming the exact date the screens will stop.
FR-63b: The holding card shown on a stopped screen is neutral and non-embarrassing in a public venue. It does not display payment failure, pricing, or account details to the venue's customers. Vendor branding is permitted here.
FR-63c: Restoring payment restores playback automatically, without re-pairing the screen or rebuilding playlists.
FR-79: During an active free trial, the player displays a Lawha badge on screen. On any paid plan the screen carries no vendor branding of any kind.
FR-80: The trial badge is constrained by specification: it occupies no more than 2% of screen area, sits wholly within the outer 10% margin of one corner, renders at reduced opacity, and never animates.
FR-81: The badge's corner placement mirrors with content direction, so it does not collide with Arabic content laid out right-to-left.
FR-82: Branding is removed within one heartbeat cycle of payment being confirmed. No re-pairing, player restart, or manual action is required.

**Group H — Public website and documentation**

FR-64: A public marketing website presents the product, its pricing, and a path to sign up.
FR-65: The website is complete in English and Arabic with full RTL mirroring, held to the same standard as Group F. No page, form, or legal text is available in only one language.
FR-66: Pricing is published openly on the site. No sales call, no quote request, no gated tier.
FR-67: Sign-up flows from the website into the dashboard without re-entering information already given.
FR-68: Setup documentation is published and public — readable before purchase, not only after. It covers pairing a screen, uploading media, building a playlist, scheduling, and the difference between certified and best-effort devices, in both languages.
FR-69: Language selection persists between the website and the dashboard, so a visitor who reads Arabic marketing is not dropped into an English product.

**Total FRs: 86** (IDs FR-1 through FR-83, non-contiguous by design; FR-43 withdrawn/retired and excluded from the count)

### Non-Functional Requirements

**§7 — Player reliability requirements**

NFR-1: The player survives fourteen consecutive days of unattended operation without intervention. (Prevents: the thirty-second death.)
NFR-2: The player recovers from process death automatically, with no first-crash-is-permanent path. (Prevents: no watchdog, no auto-restart.)
NFR-3: On certified devices, the player recovers from a device cold boot to playing content with no human input. (Prevents: power cut leaves a dead screen.)
NFR-4: The player plays indefinitely from local cache with no network. (Prevents: offline treated as an error.)
NFR-5: The display never sleeps, dims to blank, or surrenders to a screensaver while playback is active. (Prevents: no wake-lock.)
NFR-6: The player is not terminated by the host under memory pressure during sustained video decode. (Prevents: OOM kill on low-memory hardware.)
NFR-7: Silent death is impossible: an unreachable screen is shown as offline in the dashboard within five minutes, per NFR-13. (Prevents: the worst outcome in this category.)

**§8 — Non-functional requirements**

*Setup and usability*
NFR-8: An unaided non-technical user completes setup from unboxing to content on screen in under fifteen minutes.
NFR-9: Every error message names the condition and the next action, in the owner's language. No message consists solely of an error code, a stack trace, or a generic failure string.

*Data protection*
NFR-10: Personal data is stored in a region appropriate to the customer base. With Western-first launch, EU/UK regions and GDPR/UK-GDPR obligations govern. Data-processing agreements are in place with every subprocessor.
NFR-11: The data residency posture is revisited before entering any market with its own residency law. Saudi PDPL requirements are documented in the addendum and become live on Gulf entry.

*Cost and operation*
NFR-12: Media is fetched once per change, not per loop. Under normal operation — a playlist of up to 3 minutes at 1080p, content changed weekly — recurring delivery stays at or below 2 GB per screen per month. A screen whose content is unchanged consumes only heartbeat traffic.
NFR-13: Heartbeat interval is 60 seconds. A screen is shown offline after 5 consecutive missed heartbeats, so an unreachable screen becomes visible within roughly five minutes. [ASSUMPTION] These are defaults chosen to make NFR-7 testable; architecture may tune them against real device behaviour, but they are constants in the product, not per-screen settings.

*Platform*
NFR-14: The supported device matrix is defined in §4.3 as two tiers, certified and best-effort. Certified devices are tested against every player requirement; best-effort devices are tested for playback only. Claims made anywhere in the product, the website, or the documentation apply to the certified tier unless explicitly stated otherwise.
NFR-15: Screen Wake Lock support is verified per device before that device enters the certified tier. The API is present in all major current browser engines but is unverified on television platforms running older forked engines.

**Total NFRs: 15**

### Additional Requirements

- **Constraints/business rules embedded in prose rather than tagged FR/NFR:** the phased build order (§4.1: Phase 1 gate = criterion 1 fourteen-day test; Phase 2 = billing/scheduling/website English; Phase 3 = Arabic layer + branches); the schedule precedence rules (§6 Group E: screen beats branch, narrower beats wider, later-created beats earlier, fallback plays last); the supported-device tiering (§4.3: certified vs. best-effort, with certified = Android HDMI-stick kiosk app or Raspberry Pi/Chromium+systemd); the marketing-claim constraint ("guaranteed on certified devices, works on most others" — not "runs on any TV").
- **Explicitly out of v1 (§4.2):** native Android player app, screen zones, sequences, proof-of-play reporting, public API, white label, app/overlay library, Canva/social integrations, template/WYSIWYG editor, analytics, mobile admin app, roles and permissions, multi-tenant agency workspaces, Hijri calendar display, every device platform beyond the browser, AI features of any kind. QR pairing explicitly deferred to v2.
- **Blocking open item (§12.1):** the reason-to-buy / sharpened product promise is unresolved, owned by the product owner. It blocks Group H (website copy) and pricing messaging but does not block architecture or UX structurally.
- **Deferred items with revisit conditions (§12.2):** Merchant-of-Record vendor selection (must verify Saudi Arabia payout support) — owned by product owner, before billing implementation. Pricing and storage allowance are marked resolved (2026-08-11).
- **Assumptions index (§12.3), 4 open:** (1) reason-to-buy undefined; (2) product promise ("the screen is never wrong, and they never call anyone") is an unvalidated placeholder; (3) a thin own-brand Android shell recorded as a live alternative, not adopted; (4) NFR-13's heartbeat/offline-threshold constants are defaults architecture may tune.
- **Single-actor model:** every FR is written for one role, the "owner" — no roles/permissions exist in v1 (§3, §4.2).

### PRD Completeness Assessment

The PRD is unusually rigorous for traceability purposes: every requirement carries a stable, non-reused ID; withdrawals (FR-43) and revisions (FR-53, FR-83) are dated and explained rather than silently edited; scope boundaries (§4.2) and phase sequencing (§4.1) are explicit; and a dedicated open-items section (§12) separates blocking items from deferred items from assumptions, each with an owner. This is a strong foundation for downstream epic/story coverage validation.

Two things carry forward as **live risks for this assessment**, not defects in the PRD itself:

1. **One blocking open item remains unresolved** (§12.1, reason-to-buy) and it explicitly blocks Group H copy and pricing messaging — worth checking whether epics/stories for Group H have been scoped around this gap or are blocked on it.
2. **The build-order departure (§12.5)** states the frontend presentation layer for every user-facing surface is built first, on fixtures, ahead of the Phase 1 reliability gate (criterion 1) — the opposite order from §4.1's own phasing. Epic coverage validation should check that the epics/stories reflect this frontend-first departure rather than the original §4.1 phase order, and that Group H is explicitly sequenced last within the frontend phase as stated.

No FR or NFR in this PRD is unnumbered or ambiguous enough to block extraction. FR-43 is correctly excluded from the working requirement set (withdrawn) but its ID and rationale are preserved above for traceability.

## Epic Coverage Validation

The epics document (`epics.md`) carries its own internal "Requirements Inventory" and "FR Coverage Map" (lines 32–395), copied verbatim from the same PRD analyzed in Step 2. Full PRD requirement text is not repeated below — see the PRD Analysis section above for complete wording; this matrix tracks ID and epic/story assignment only.

### Coverage Matrix

| FR Group | FR IDs | Epic Coverage | Status |
|---|---|---|---|
| A — Player | FR1–FR14, FR6a | Epic 3 (FR1–5,7–14); FR6a → Epic 2 | ✓ Covered |
| B — Pairing & screens | FR15–FR23 | Epic 2 (Stories 2.1–2.7) | ✓ Covered |
| I — Branches | FR70–FR78 | Epic 7 (Stories 7.1–7.5) | ✓ Covered |
| C — Media | FR24–FR30, FR83 | Epic 4 (Stories 4.1–4.6) | ✓ Covered |
| D — Playlists | FR31–FR37 | Epic 5 (Stories 5.1–5.3) | ✓ Covered |
| E — Scheduling | FR38–FR42, FR44 | Epic 6 (Stories 6.1–6.3) | ✓ Covered |
| E — Scheduling | FR43 | — | ⚪ Retired (withdrawn 2026-08-11, correctly excluded) |
| F — Bilingual | FR45–FR50, FR54, FR55 | Epic 1 (Stories 1.1–1.4, 1.7) | ✓ Covered |
| F — Bilingual | FR51, FR52 | Epic 3 (Story 3.8) | ✓ Covered |
| F — Bilingual | FR53 | — | ⚪ N/A — product decision already resolved (Clerk stays English in both locales); no build story needed, reason documented |
| G — Account & billing | FR56, FR57 | Epic 1 (Stories 1.5, 1.6) | ✓ Covered |
| G — Account & billing | FR58, FR60–FR63c, FR79–FR82 | Epic 8 (Stories 8.1, 8.3–8.7) | ✓ Covered |
| G — Account & billing | FR59 | Epic 2 (baseline mechanism, Story 2.5) + Epic 8 (real numbers, Story 8.5) | ✓ Covered — intentional split, not a duplication error |
| H — Website & docs | FR64–FR69 | — | ❌ **Excluded from this epics run** — blocked on PRD §12.1's unresolved reason-to-buy item, no UX pass exists for Group H |

### Missing Requirements

**No unaccounted or overlooked FRs found.** Every one of the PRD's 86 active FR IDs (plus the retired FR-43) is explicitly disposed of in `epics.md` — either assigned to a story, marked N/A with a documented reason, or marked excluded with a documented reason. Nothing fell through silently.

**One flagged item — not a coverage gap, but a real go-live gap worth the product owner's attention:**

- **FR64–FR69 (Group H — public website & documentation), 6 requirements, have zero epic/story coverage.** This is not an oversight: `epics.md`'s scope note and the PRD itself (§12.1) both explain the exclusion is deliberate, pending resolution of the reason-to-buy open item. But it means that as of this document, **there is no implementable story for the public marketing site or public setup documentation** — and per the PRD's own success-criteria table, FR68 (public documentation) is what makes criterion 2 (the fifteen-minute test) reachable by a real stranger, and FR64/66/67 are what a real paying customer (criterion 5) would need to find and buy the product at all. §12.5 of the PRD explicitly acknowledges this: *"the fifteen-minute test is not fully walkable end-to-end on fixtures until Group H lands."* This is appropriately sequenced as a known blocker rather than a planning failure, but it should not be mistaken for "fully covered" when judging overall implementation readiness for a real launch.

**Secondary observation (bonus check beyond FR scope):** the epics document also carries a self-declared NFR/AD coverage map (line 395) accounting for all of NFR1–NFR15 and the referenced architecture decisions (AD-1 through AD-27) against specific epics. Spot-checking this against the NFR list extracted in Step 2 found no NFR left unassigned.

### Coverage Statistics

- Total PRD active FRs (excluding retired FR-43): **86**
- FRs with direct epic/story build coverage: **79** (91.9%)
- FRs resolved without a build story, reason documented (FR53): **1** (1.2%)
- FRs explicitly excluded from this run, reason documented (Group H, FR64–69): **6** (7.0%)
- FRs unaccounted for / silently missing: **0** (0%)
- **Coverage (build-ready path exists): 79/86 = 91.9%.** The remaining 8.1% is not silently dropped — it is named, explained, and traceable to a specific upstream blocker (§12.1) — but it is real scope with no story yet, and stays open until that blocker clears.

## UX Alignment Assessment

### UX Document Status

**Found.** Both halves of the UX pair exist and were fully read: `EXPERIENCE.md` (behaviour, IA, states, flows, accessibility — 40.8 KB) and `DESIGN.md` (visual tokens, components — 34.8 KB). Both declare the PRD and the Architecture Spine as sources and are dated the same day as those documents (2026-08-11). The Architecture Spine was also read in full to check the UX↔Architecture direction of this validation.

### Alignment Issues

**1. Numeric contradiction — offline-detection threshold (PRD/UX say 5 missed heartbeats, Architecture/Epics say 3).**

- PRD §8, **NFR-13**: *"Heartbeat interval is 60 seconds. A screen is shown offline after 5 consecutive missed heartbeats, so an unreachable screen becomes visible within roughly five minutes."*
- `EXPERIENCE.md`, Truth Contract rule 1: *"60s interval, offline after 5 misses, visible within roughly five minutes (NFR-13, NFR-7)"* — UX correctly copied the PRD's number.
- `ARCHITECTURE-SPINE.md`, **AD-12**: *"the heartbeat interval is 60 s ± 10 s of jitter. A screen is online if its last heartbeat is within 180 s"* — 180s at a 60s interval is **3** missed heartbeats, not 5.
- `epics.md`, **Story 2.6** acceptance criteria inherits the architecture figure directly: *"online only if the last heartbeat is within 180 seconds... (AD-12)"*.

180s does not violate NFR-7's "within five minutes" outer bound (it's tighter, so the promise is still kept), but it is a direct, unreconciled contradiction of the PRD's explicit "5 consecutive missed heartbeats" requirement text, and the story that will actually get built targets 180s, not 300s. NFR-13 is tagged `[ASSUMPTION]` and explicitly licenses architecture to tune it — but every other numeric revision in this document set (FR-43, FR-53, FR-81, the border-shorthand CSS bug) is logged in the Architecture Spine's **"Divergence from source"** section with a dated note. This one is not. It reads as an untracked silent divergence rather than a deliberate, recorded tuning decision — worth a one-line confirmation from the architect (and a matching PRD/UX update) before Story 2.6 is built, so nobody later "fixes" the 180s back to 300s believing it's a bug.

**2. Documentation currency — `EXPERIENCE.md`'s Open Items table is stale relative to same-day PRD/Architecture resolutions.**

`EXPERIENCE.md` § Open Items (line ~329) lists four items. Cross-checking each against the PRD and Architecture Spine (both dated the same 2026-08-11):

| EXPERIENCE.md's open item | Actual status elsewhere | 
|---|---|
| "The shadcn/ui + Tailwind + Radix stack is a UX-originated claim... Accept or reject before console implementation begins" | **Resolved.** Architecture Spine, Stack section: *"accepted 2026-08-11... Radix is load-bearing rather than convenient."* |
| "Flash safety on owner-uploaded video is unaddressed... Needs a v1 scope decision" | **Resolved.** PRD FR-83 (added 2026-08-11) and Architecture Spine (*"answered in the client (2026-08-11)"*); built as Epic 4 Story 4.5. |
| "The pairing code has no non-transcription path... Decide alongside the pairing surface" | **Resolved.** PRD §4.2: *"QR pairing is deferred to v2 (added 2026-08-11)... Deferred by product-owner decision."* |
| "Clerk's hosted auth is unaudited... Move the audit earlier" | **Still genuinely open** — consistently tracked as open in `epics.md` (UX-DR12) and the Architecture Spine's Deferred section. Not a misalignment. |

Three of the four resolutions happened correctly and propagated downstream into `epics.md` and its stories (Story 4.5, PRD FR-83, the Clerk decision in FR-53) — so **this is not an implementation risk**, but `EXPERIENCE.md` itself was never updated to close these three items out. A reader consulting `EXPERIENCE.md` alone — the canonical behavioural spine — would wrongly believe all four are still open product decisions. Low-cost fix: strike the three resolved rows or point them at where each was actually decided.

### Positive alignment finding (worth preserving, not just flagging problems)

The UX↔Architecture feedback loop demonstrably worked as intended at least once: `DESIGN.md` documents a Chromium-76-floor CSS restriction list (`clamp()`, `inset-inline-*`, logical border shorthands, etc.), and the Architecture Spine's **"Divergence from source"** section explicitly credits this: *"A fourth instance of the same bug class was caught during UX validation and binds here: the logical border shorthands... shipped in the same Chrome 87 batch as the logical insets and are therefore also unavailable at the player floor."* This is exactly the cross-check this validation step exists to encourage, and it visibly happened during the planning phase rather than being caught later in a code review.

The CAP-1…CAP-17 frontend capability contract also maps cleanly one-to-one onto epics (documented in `epics.md`'s own CAP coverage line), and the UI-library decision (shadcn/ui + Radix) that `EXPERIENCE.md`/`DESIGN.md` originated as a "UX-originated claim" was explicitly adjudicated and accepted by architecture with a stated rationale (RTL behaviour + keyboard/focus floor are load-bearing, not decorative) — a genuine architecture decision, not a rubber stamp.

### Warnings

None beyond the two Alignment Issues above — UX documentation exists, is not missing, and is not thin. No UI-implied-but-undocumented gap was found.

## Epic Quality Review

Reviewed all 8 epics and 49 stories against create-epics-and-stories standards: user-value framing, epic independence, forward-dependency freedom, story sizing, AC quality (Given/When/Then, testability, error coverage), database-creation timing, and greenfield setup indicators.

**Overall, this is an unusually rigorous epics document** — Given/When/Then structure is used consistently, error paths and edge cases are extensively covered (not just happy paths), FR traceability is stated on every epic, and backward-reference discipline is strong (later stories cite earlier story numbers by ID rather than vaguely assuming prior work — e.g., Story 8.7 explicitly says the badge visual spec "is already constrained by Story 3.1's implementation"). Two concrete gaps and a few minor concerns follow.

### 🔴 Critical Violations

**None found.** No epic is a disguised technical milestone with no user value; no epic requires a later epic to function; no story is epic-sized or unbuildable.

### 🟠 Major Issues

**1. No story builds `GET /device/manifest` — one of exactly three endpoints the architecture defines as the player's entire server surface.**

`ARCHITECTURE-SPINE.md` AD-3 states: *"the player's entire server surface is three endpoints — `POST /device/register`, `GET /device/manifest`, `POST /device/heartbeat`."* The first has a dedicated story (**2.4**, Device Registration & Pairing Code Issuance) and the third has a dedicated story (**2.6**, Heartbeat & Read-Time Status Derivation). The second — the endpoint the player actually calls to receive the manifest it plays — has no story anywhere. Story 5.4 (Manifest Assembly) builds the *server-side assembler* that produces the manifest document; Story 5.5 (Manifest Activation) builds the *player-side* logic for what happens once a manifest has been fetched; neither one's acceptance criteria mention the HTTP endpoint that connects them. Story 3.3 (Local Media Caching) comes closest but only covers media fetching, not the manifest fetch itself.

*Recommendation:* Add an explicit story — most naturally alongside 5.4/5.5 in Epic 5, since it's the delivery counterpart to manifest assembly — with ACs covering the endpoint's auth model (the device credential minted in Story 2.5), response shape (validated by `packages/manifest-contract`, per AD-26), and its relationship to the device API versioning rule in AD-3.

**2. No story covers initial monorepo scaffolding or CI/CD pipeline setup, despite the epic's own text promising it.**

The document's frontmatter scope note and Epic 1's introduction both state plainly that this is a from-scratch build with no starter template: *"First story is also where repository/environment scaffolding happens, since no starter template is named in the architecture — the monorepo source tree in the spine is the from-scratch scaffold."* But Story 1.1 — the actual first story — is "Shared Design Token Layer," and its four Acceptance Criteria are entirely about token consumption rules (no color/radius/spacing literal in component code, `-ar` typography counterparts, single-source token propagation). None of them mention creating the `apps/console` / `apps/player` / `packages/*` monorepo structure, installing dependencies, or standing up CI. Yet later stories presuppose CI already exists and is enforcing rules — Story 1.2 requires "CI lints it... fails the build," Story 1.5 requires migrations be "applied through CI," and the architecture's AD-2 requires CI to fail builds that introduce upward dependency edges. Nothing in the document has acceptance criteria for standing that CI up in the first place.

*Recommendation:* Either fold explicit scaffolding/CI-setup ACs into Story 1.1, or add a genuine Story 1.0 for it — matching what the epic's own introduction already promises.

### 🟡 Minor Concerns

**1. Epic 1's title leans technical.** "Foundation — Console Shell, Bilingual Infrastructure, Auth & Workspace" uses exactly the kind of language the create-epics-and-stories checklist flags as a red flag category ("Infrastructure Setup"). The epic's goal statement redeems it with clear user-outcome framing ("Owner signs up... and can navigate a fully bilingual, RTL-correct console shell"), and a foundation epic is close to unavoidable in a from-scratch bilingual product — this is cosmetic, not structural.

**2. Story 1.1 ("Shared Design Token Layer") is the one story in the document whose acceptance criteria describe pure code architecture with no directly observable owner behavior** — none of its four ACs describe anything an owner does or sees; they're entirely about how components reference design tokens internally. This is a common and defensible pattern for a design-system foundation story, but it's worth naming since it matches the checklist's own "technical milestone dressed as a user story" red flag almost exactly.

**3. Story 2.5's entitlement AC could be misread as already using real billing numbers.** The FR coverage map correctly documents FR-59 as split — "Epic 2 (baseline enforcement mechanism) / Epic 8 (real plan-driven entitlement numbers)" — and Story 8.5 later confirms this explicitly ("the enforced ceiling comes from the real plan-driven screen count, not a placeholder default"). But Story 2.5 itself never uses "placeholder" or "baseline" language — it just says "the owner is at their plan's screen limit," which reads as if real billing already exists. Low-cost fix: mirror Story 8.5's explicit callback language back into 2.5.

### Best Practices Compliance Checklist (per epic)

| Epic | User value | Independent | Story sizing | No forward deps | Tables created when needed | Clear ACs | FR traceability |
|---|---|---|---|---|---|---|---|
| 1 — Foundation | ✓ (title cosmetic issue) | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| 2 — Screens & Pairing | ✓ | ✓ | ✓ | ✓ (see Minor #3) | ✓ | ✓ | ✓ |
| 3 — Player Runtime | ✓ | ✓ | ✓ | ✓ | n/a (no DB) | ✓ | ✓ |
| 4 — Media Library | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| 5 — Playlists & Manifest | ✓ | ✓ | ✓ (missing endpoint story, Major #1) | ✓ | ✓ | ✓ | ✓ |
| 6 — Scheduling | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| 7 — Branches | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| 8 — Billing & Trial | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |

**Dependency direction, verified:** every cross-epic reference found runs backward (a later epic citing an earlier epic's story by number — e.g., Epic 8 Story 8.6/8.7 citing Epic 3 Story 3.1's holding-card and badge implementations; Epic 7 Story 7.4 citing Epic 6's precedence resolution). No instance was found of an earlier epic requiring a later epic's output to function. Epic 1 Story 1.5's implicit default-branch creation (serving FR-71, nominally an Epic 7 requirement) is a deliberate, correctly-scoped forward provision — Epic 2's screen-claim story (2.5) needs a default branch to bind new screens to, and Epic 1 supplies exactly that minimal piece without requiring Epic 7's full branch-management epic to exist first.

## Summary and Recommendations

### Overall Readiness Status

**NEEDS WORK** — but close, and for the right reasons. This is an unusually disciplined document set: every one of the PRD's 86 active FRs is traceable to a story or an explicitly-documented exclusion, acceptance criteria are consistently Given/When/Then and testable, error paths are covered as thoroughly as happy paths, and there is direct, verifiable evidence that the UX and Architecture documents were actually cross-checked against each other during planning (the Chromium-76 CSS bug caught during "UX validation" and logged in the Architecture Spine's own Divergence section). The issues found are specific, few, and each fixable in under an hour of discussion — not signs of a plan that needs to be re-thought.

### Critical Issues Requiring Immediate Action

None rise to blocking-a-build-start severity, but three should be resolved **before the stories they touch are picked up**, in priority order:

1. **Heartbeat/offline-detection threshold contradiction** (Step 4). PRD NFR-13 and `EXPERIENCE.md` both say a screen goes offline after **5** missed heartbeats (~5 min); Architecture Spine AD-12 and Epic 2 Story 2.6's acceptance criteria say **180 seconds** (3 missed heartbeats). This is the one discrepancy in the whole document set that isn't logged in the Architecture Spine's own "Divergence from source" tracking, unlike every other numeric revision (FR-43, FR-53, FR-81). Get a one-line confirmation from whoever owns the architecture spine on which number is correct, and update the other three documents to match, before Story 2.6 is built.
2. **`GET /device/manifest` has no story** (Step 5). It's one of exactly three endpoints the architecture defines as the player's entire server surface; its two siblings (`register`, `heartbeat`) each got a dedicated story. Add one — Epic 5 is the natural home, alongside Stories 5.4/5.5.
3. **No story covers initial monorepo/CI scaffolding** (Step 5), despite Epic 1's own introduction promising "First story is also where repository/environment scaffolding happens." Story 1.1 turns out to be entirely about the design token layer. Fold scaffolding/CI ACs into Story 1.1 or add a Story 1.0.

### Recommended Next Steps

1. **Resolve the heartbeat-threshold contradiction** (5 misses vs. 180s/3 misses) with the architect and product owner, and propagate whichever number wins back into the PRD, `EXPERIENCE.md`, and Story 2.6 — this is the highest-value fix since it's a genuine build-target ambiguity, not just a documentation gap.
2. **Add the missing `GET /device/manifest` story** to Epic 5, and **add scaffolding/CI acceptance criteria** to Story 1.1 (or a new Story 1.0) — both are Major findings from Step 5 and are cheap to close before implementation starts.
3. **Refresh `EXPERIENCE.md`'s Open Items table** to strike the three items already resolved elsewhere (shadcn/ui stack acceptance, FR-83 flash-safety, QR-pairing deferral to v2) — low effort, prevents a future reader from re-litigating decisions already made.
4. **Keep Group H's exclusion visible to the product owner as a launch-blocker, not just a scoping note.** It's correctly and deliberately excluded from this epics run pending the reason-to-buy resolution (PRD §12.1), but FR64/66/67/68 are exactly what criteria 2 and 5 (a stranger sets up unaided; someone pays) depend on per the PRD's own text. Nothing to fix in the epics document itself — this is a reminder to resolve §12.1 before treating the product as launch-ready even once Epics 1–8 are fully built.
5. Optional polish, no urgency: mirror Story 8.5's "not a placeholder default" language back into Story 2.5's entitlement AC for symmetry, and consider whether Epic 1's title and Story 1.1's framing should read more like user outcomes (cosmetic only).

### Final Note

This assessment identified **8 issues** across **3 categories** (Epic Coverage Validation, UX Alignment, Epic Quality Review) — 3 Major, 4 Minor, and 1 known-and-already-flagged scope exclusion (Group H) that is a genuine launch consideration rather than a planning defect. Zero FRs were found silently uncovered, and zero critical/structural epic violations (technical-milestone epics, forward dependencies, unbuildable stories) were found. Address the three items under "Critical Issues Requiring Immediate Action" before their respective stories are picked up; the rest can be folded in opportunistically. These findings can be used to improve the artifacts, or the team may choose to proceed as-is and resolve them inline during implementation.
