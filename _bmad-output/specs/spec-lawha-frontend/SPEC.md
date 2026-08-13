---
id: SPEC-lawha-frontend
companions:
  - surface-inventory.md
  - fixture-contract.md
  - ../../planning-artifacts/ux-designs/ux-the_project-2026-08-11/DESIGN.md
  - ../../planning-artifacts/ux-designs/ux-the_project-2026-08-11/EXPERIENCE.md
  - ../../planning-artifacts/architecture/architecture-the_project-2026-08-11/ARCHITECTURE-SPINE.md
sources:
  - ../../planning-artifacts/prds/prd-the_project-2026-08-11/prd.md
  - ../../planning-artifacts/prds/prd-the_project-2026-08-11/addendum.md
  - ../../planning-artifacts/briefs/brief-the_project-2026-08-11/brief.md
  - ../../planning-artifacts/briefs/brief-the_project-2026-08-11/addendum.md
---

> **Canonical contract.** This SPEC and the files in `companions:` are the complete, preservation-validated contract for what to build, test, and validate. Source documents listed in frontmatter are for traceability only — consult them only if you need narrative rationale or prose color this contract intentionally omits.

# Lawha v1 — Frontend

## Why

Lawha has four settled planning artifacts and no code. This spec builds the layer where every decided shape becomes checkable: the truth contract, the bilingual-as-architecture bet, the flat-signal visual system, and the resolved-timetable model all exist today only as prose. Three of the five success criteria — the fifteen-minute test, the Arabic test, and a stranger paying — are judged by what a person sees, and a fixture-driven presentation layer reaches all three without a database, a vendor, or a TV.

The force is de-risking a solo build at its cheapest point. Two of the architecture's rules — direction derived once at the root (AD-21) and no user-visible string ever concatenated (AD-22) — cost almost nothing on the first commit and force a rebuild if applied later, and both live entirely in this layer. Building every surface first, in both languages and both themes, means a spine defect surfaces before four rented services are wired to it rather than after.

This departs from PRD §4.1, which sequences phase 1 around the player's fourteen-day gate. The departure is deliberate and by product-owner direction, and is now recorded upstream as PRD §12.5. The gate is unchanged, only later. Nothing in this spec can pass it.

## Capabilities

- **CAP-1 — Shared token layer**
  - **intent:** Both apps draw colour, type, spacing, and component shape from one token set, so the console and the player are visibly the same product.
  - **success:** Every token in DESIGN.md frontmatter is expressed once and consumed by both apps; every Latin type tier has its `-ar` counterpart and no Latin family ever renders Arabic; console tiers are `px` and player tiers are `vmin`; a token changed in one place changes both apps; no colour, radius, or spacing literal appears in component code.

- **CAP-2 — Bilingual foundation**
  - **intent:** Locale and direction are properties of the application root, and every user-visible string comes from a catalogue, so Arabic correctness is structural rather than per-component.
  - **success:** `lang` and `dir` are set once at the root and no component branches on locale; a missing catalogue key fails the build rather than falling back; assembled accessible names are single catalogue entries with named slots, not joined fragments; bidi isolation is realised as markup rather than Unicode control characters; CI fails on a physical `left`/`right` layout property or a concatenated user-visible string.

- **CAP-3 — Console shell**
  - **intent:** The owner moves between every console surface at any viewport width, in either language, in either theme.
  - **success:** A persistent rail at ≥1024px and a focus-trapping sheet below 640px, its width set by the longer of the two languages' labels; no horizontal tab row anywhere; a skip-to-content link and a landmark map on every page; the same task completes at 390px and 1440px, with content still reflowing at 320px and 400% zoom; language and theme switch without a reload and persist.

- **CAP-4 — Screens home**
  - **intent:** The owner sees every screen in the workspace grouped by branch, and learns the truth about each one — including that Lawha cannot currently confirm it.
  - **success:** A healthy screen carries no colour, while its accessible name still asserts health positively; an unconfirmed screen shows an absolute last-confirmed time and its content labelled last-known; a `No auto-restart` screen carries its caveat while healthy; an offline screen promotes its row into the structural border tier, expands in place to a full sentence, and raises a non-dismissible banner that is global rather than Screens-only; the group header states online, offline, and stopped separately and never collapses them into one verdict.

- **CAP-5 — Screen detail**
  - **intent:** The owner renames a screen, reassigns its playlist, sets its schedule and timezone, re-pairs it, or removes it.
  - **success:** Every field edits and rolls back on simulated failure, with the rollback announced assertively; removal states that the entitlement slot is released; re-pair states that name, schedule, and assignment survive; device tier is disclosed with its consequence in a sentence.

- **CAP-6 — Pair a screen**
  - **intent:** The owner claims a screen by typing a six-character code read off a TV across the room.
  - **success:** One auto-focused field, not six boxes; case-insensitive; accepts a pasted whole code; never validates per-character; works at 390px; distinguishes wrong code, expired code, and entitlement ceiling reached, each naming its next action and the last of them stating that it is not a pairing problem.

- **CAP-7 — Media library and uploader**
  - **intent:** The owner adds images and video, sees what is stored, and learns immediately when a file will not work — including when it is unsafe to put on a public wall.
  - **success:** Ceilings (150 MB video, 15 MB image) are enforced before transfer begins; a rejection names format, size, or codec and states MP4/H.264 as the guaranteed combination at the point of upload; **video is analysed client-side for flash content before transfer, a confident breach of the WCAG 2.3.1 general flash threshold is refused, and an uncertain or unanalysable result is a warning the owner must acknowledge**; progress is per file, each per-file outcome is announced, and a failed file does not fail the batch; deletion names the playlists using the item; the storage meter shows workspace usage against a **10 GB per screen** pooled allowance as an absolute figure beside the bar.

- **CAP-8 — Playlists and playlist editor**
  - **intent:** The owner orders media into a playlist, sets durations, and assigns it to screens.
  - **success:** Reorder works by keyboard and by explicit move controls with no drag-only path; images take a per-item duration and video takes its full length; there is no Publish button — the editor states instead when the change reached each assigned screen, and states plainly that the item currently on screen plays out its duration first unless it was itself removed or altered; assignment shows as saved immediately and as playing only on confirmation.

- **CAP-9 — Schedules**
  - **intent:** The owner sees what plays at a given time, and never has to reason about precedence to know it.
  - **success:** The surface renders the resolved weekly outcome as its primary artifact; the four precedence rules are never displayed or explained; an overridden window is answered in one sentence at the moment of editing; playlists are never colour-coded, and amber marks only the hours where nothing is scheduled and the wall will fall back to a holding card — stated before it happens; the working week is configurable.

- **CAP-10 — Branches**
  - **intent:** A multi-location owner sees which location needs attention and pushes content to a whole branch without touching screens one at a time.
  - **success:** A per-branch health summary states all three counts, omitting zeroes rather than rendering "0 offline"; bulk assignment states the affected screen count before committing, names any screen whose per-screen override survives, and is undoable; branch timezone is set once and inherited; a single-location owner never encounters the word "branch".

- **CAP-11 — Billing and entitlement**
  - **intent:** The owner sees what they pay for, what they are using, and exactly when screens will stop.
  - **success:** Plan, screen entitlement, invoices, receipts, and cancel are all reachable; the at-limit state names the plan count, the count in use, and the path to change it; the payment-failure banner names an exact date rather than "soon" or a countdown and persists through every retry; the stopped state says restoring payment restores playback with no re-pairing and no rebuilding.

- **CAP-12 — Settings**
  - **intent:** The owner sets interface language, workspace timezone, and account details.
  - **success:** Language selection persists across sessions; workspace timezone is the default every screen and branch inherits; `Accept-Language` is consulted on a first visit and never after.

- **CAP-13 — Player display surface**
  - **intent:** A television shows the right thing in every state, at viewing distance, without input.
  - **success:** All eight states render — Pairing, **Preparing**, Playing, Nothing to play, Between windows, Subscription stopped, Recovering, and **Dark** — at fixed 16:9 with no chrome, cursor, or scrollbar; type uses the `vmin` player tiers and the pairing code is readable at four metres; owner-register and customer-register cards are visually distinct and the customer register carries no text; Preparing says what it is doing in owner register on a first cache and holds the last frame in customer register on a mid-life re-cache; a page reload holds the last rendered frame rather than flashing to white; the trial badge sits within the outer 10% margin at ≤2% of screen area and mirrors by flow. The bundle runs on a Chromium 76 engine.

- **CAP-14 — Public marketing site** *(built last within this scope — see Constraints)*
  - **intent:** A stranger finds Lawha, learns what it does and what it costs without asking anyone, and starts signing up.
  - **success:** $5 per screen per month is on the page with no quote request and no gated tier; the signup path reaches the authentication handoff carrying what the visitor already entered; language selection persists from the site into the console; every page exists in both languages with full mirroring.

- **CAP-15 — Public setup documentation** *(built last within this scope — see Constraints)*
  - **intent:** A buyer reads how Lawha is set up before purchasing, and an owner finds the answer when something goes wrong.
  - **success:** Pairing, media upload, playlist building, scheduling, and the certified-versus-best-effort distinction are each covered and publicly readable without an account, in both languages.

- **CAP-16 — Fixture harness**
  - **intent:** Anyone can drive any surface into any specified state without a backend, so states are demonstrated rather than described.
  - **success:** Every state in `surface-inventory.md` is reachable from the switcher, console-offline and the eight player states included; the fixture set covers several branches, screens across all three status tags, a playlist mid-schedule, an at-limit entitlement, and a stopped subscription; switching state mutates no component code; the harness is absent from a production build and its removal breaks nothing.

- **CAP-17 — Accessibility and RTL gates**
  - **intent:** Correctness in both languages and both themes is enforced by the build, not by review.
  - **success:** WCAG 2.2 AA passes **within `apps/console` and `apps/player`** across all four language/theme combinations; one global status announcer carries every state change, with `role="alert"` reserved for optimistic-rollback failures alone and `aria-busy` on every loading region; every status carries a text label as well as a fill; focus is visible everywhere and uses the on-signal ring against signal fills; targets are ≥44px, status tags being non-interactive and out of scope; tab order equals visual order in RTL through DOM order, enforced by the ban on `order`, reversed flex directions, `grid-template-areas`, and explicit grid placement in any component with more than one focusable element; every error is programmatically associated with its control and focus moves to the first invalid one.

## Constraints

- No database client, no auth SDK, no payment SDK, no server route handler, and no manifest assembly in this scope. Every surface reads through the single seam defined in `fixture-contract.md`.
- `apps/player` and every shared package hold to a Chromium 76 / ES2019 floor. Never in player or shared code: `clamp()`, `min()`, `max()`, flexbox `gap` (grid `gap` is fine), `aspect-ratio`, `:has()`, container queries, `oklch`, `color-mix`, `inset-inline-*`, **and the logical border shorthands** — which shipped in the same batch as the logical insets. Mirrored placement in the player is achieved by flow and alignment, never by insets.
- No physical `left`/`right` layout property anywhere in either app. This is FR-47's mechanical definition of done and CI is the judge.
- No `order`, `row-reverse`, `column-reverse`, `grid-template-areas`, or explicit grid-line placement in any component with more than one focusable element. This is what makes "tab order equals visual order" lintable rather than aspirational, and the 640–1023px column wrap is exactly where it breaks invisibly.
- Every user-visible string comes from an ICU catalogue with named placeholders — including assembled accessible names. Bidi isolation is applied once at the placeholder boundary and realised as markup (`<bdi>`, `dir="ltr"`), never as Unicode control characters, which corrupt live regions and braille output.
- No `box-shadow`, gradient, blur, or translucency outside the one enumerated trial-badge exception, and no non-zero `border-radius` outside the radio control. Depth is expressed by inversion and by promoting a divider to a border.
- `min-block-size`, never `block-size`, on every text container, so a user stylesheet cannot clip it. No text container carries a fixed width or height.
- Zero motion in the console. The player cross-fade is the single exception product-wide, and reduced motion is driven by a **per-screen manifest flag set from the console**, never by a device preference the wall's audience cannot set.
- Status is never optimistic. *Assigned* and *playing* are two distinct confirmations and no surface collapses them, including in a fixture build where nothing heartbeats.
- Every surface ships every state in the matrix, including **console-offline** — a dashboard still showing *Live* while unable to refresh is exactly what the truth contract forbids. Loading occupies final dimensions, never shifts layout, and always carries `aria-busy`; there is no shimmer.
- Health is the absence of *visual* signal, never the absence of an accessible one. A healthy row asserts its state positively in the accessibility tree.
- The hosted authentication surface renders in **English in both locales**, by product-owner direction. Not mirrored, not translated, not restyled. This overrides FR-53 and takes a narrow non-widening carve-out from FR-45.
- **No unqualified product-level AA claim may be published** while the authentication surface is unaudited. The claim is scoped to the two apps.
- The published price is **$5 per screen per month**, one plan, no feature gates, billed per screen, preceded by a 14-day trial. Branches, playlists, media items, and schedules are free. Storage is a **10 GB per screen** allowance, pooled across the workspace rather than siloed per screen.
- **Group H (CAP-14, CAP-15) is built last**, after every other surface in this spec, by product-owner direction. It has no behavioural spine of its own — the UX run scoped it out — and that gap is deliberately deferred rather than closed now: a `bmad-ux` pass scoped to Group H happens once the rest of the product exists to describe, then Group H is built against it. Consequence: the fixture walkthrough in the Success signal below cannot fully rehearse Yusuf's journey end to end (§3.1 opens and closes on the website) until Group H lands — the console and player halves are rehearsable independently before then.
- `manifest`, `heartbeat`, `entitlement`, `revision`, `holding card`, and `best-effort device` are internal vocabulary and never appear in the interface. In code, the PRD glossary is exact: never `site`, `location`, `device`, `display`, or `tenant`.
- The dependency graph is downward-only. `apps/player` imports only `manifest-contract` and `i18n`.
- The fixture harness does not exist in a production build.
- DESIGN.md and EXPERIENCE.md win over any mock, wireframe, or import. Where they and this SPEC disagree, the disagreement is a defect to raise, not a choice to make.

## Non-goals

- No backend of any kind: no schema, no migrations, no RLS, no route handlers, no webhook handling, no manifest assembly, no entitlement enforcement.
- No player runtime engine: no service worker caching, no recovery ladder, no heartbeat emission, no memory bounding, no local schedule evaluation, no versioned bundle activation. This spec builds what the player *shows*, not what keeps it alive.
- No real media transfer, storage, or transcoding, and **no server-side flash analysis on ingest** — the client-side check in CAP-7 is what this scope can carry, and it reduces exposure rather than conforming.
- **No QR pairing.** Deferred to v2 by direction, with its cost visible: it would remove the 3.3.8 cognitive-function test entirely *and* shorten Yusuf's fifteen-minute path. The code stays a transcription task in v1.
- No Merchant-of-Record selection, integration, or checkout surface.
- No reason-to-buy copy. The distinguishing claim is still undefined upstream; the site is built around the placeholder promise instead.
- No styling, translation, or mirroring of the hosted authentication surface, and no accessibility audit of it — that audit is a product-owner gate, not this spec's work.
- No documentation *content*. CAP-15 builds the surface; the words are authored separately, after it exists.
- No playlist pause control on the player, by intent, resting on WCAG 2.2.2's *essential* exception.
- No out-of-band alerting. Dashboard-only escalation is an accepted product risk and this spec does not quietly repair it.
- Nothing on the v1 exclusion list: zones, sequences, proof-of-play, public API, white label, app/overlay library, template editor, analytics, mobile admin app, roles and permissions, agency workspaces, Hijri display, native player, AI.
- Not the fourteen-day gate. No amount of frontend work moves it.

## Success signal

A person who is not the builder walks every surface of Lawha — console, player, marketing site, docs — on a preview build, in English and Arabic, light and dark, at 390px and at 1440px, driving each specified state from the fixture switcher, and finds nothing broken: no clipped Arabic, no unmirrored layout, no fallback font, no state that only exists in prose. A native Arabic speaker reviews the same walkthrough and finds nothing wrong with it, and a screen-reader pass over the console hears every state change the screen shows. At that point the Arabic test is answerable before a single vendor is wired, and the console's shapes are settled enough that wiring becomes substitution rather than redesign.

## Assumptions

- Building the frontend before the player runtime is deliberate product-owner direction, recorded upstream as PRD §12.5. Criterion 1 remains the gate on shipping; it simply comes after this work, which pushes the fourteen-day clock later.
- The marketing site and documentation are routes inside `apps/console`, per the architecture source tree, rather than a separate application.
- Fixtures are typed by `packages/manifest-contract` for player-facing data and by `packages/domain` entity types for console-facing data, so the wiring phase replaces the fixture source and leaves components untouched.
- Both themes are built because DESIGN.md specifies a full dark palette; whether a theme control appears in Settings or the console follows `prefers-color-scheme` alone is not settled by any upstream artifact.
- Every surface is built bilingual from the first commit, even though PRD §4.1 places Arabic strings in phase 3. The mechanical half is phase 1 by the PRD's own reasoning, and building the strings alongside it costs less than a second pass.
- **The English-only authentication surface is an accepted divergence**, overriding FR-45 and FR-53 by direction, and closing the architecture spine's Clerk deferral. Both upstream documents have been amended to match. It resolves the *language* question only — the accessibility audit of that surface remains open below.
- **shadcn/ui on Tailwind with Radix primitives is accepted** as the console UI layer, closing the UX-originated stack claim that EXPERIENCE.md routed to architecture. Radix is load-bearing for FR-47 mirroring and the keyboard and focus floor, which keeps CAP-17 a delta over Radix defaults rather than hand-built work. The architecture spine has been amended.
- **Flash safety is answered client-side**, in the uploader, before transfer — extending the pattern that already enforces ceilings there and needing no ingest pipeline, which the architecture spine rules out for v1. A stated content policy backs the check. Browser-side frame sampling is heuristic; this is exposure reduction, not conformance.
- The product promise remains the brief's placeholder — *"The screen is never wrong, and they never call anyone"* — and the reason-to-buy remains undefined, by direction.
- **The authentication accessibility audit is a scheduled gate, not a resolved finding.** Checked 2026-08-11: Clerk publishes no WCAG conformance statement, no screen-reader or keyboard claim, for its hosted `SignIn`/`SignUp` components — consistent with EXPERIENCE.md's prior finding that RTL is undocumented and Arabic is community-contributed. Owner is the product owner; the trigger is the first point Clerk is wired into `apps/console`, which is outside this spec's scope. Until an EN 301 549 smoke test (screen reader, `ar` locale, 400% zoom, keyboard-only) passes, no unqualified product-level AA claim may be published — already stated as a constraint above.

## Open Questions

None outstanding. All four prior questions are closed — three by direction (Group H's sequencing, storage, PosterBooking dropped) and one converted into a defined gate rather than answered outright (the authentication accessibility audit — see Assumptions).
