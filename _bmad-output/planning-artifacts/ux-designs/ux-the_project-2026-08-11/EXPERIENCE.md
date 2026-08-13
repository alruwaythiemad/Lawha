---
name: Lawha
status: final
sources:
  - '{planning_artifacts}/prds/prd-the_project-2026-08-11/prd.md'
  - '{planning_artifacts}/prds/prd-the_project-2026-08-11/addendum.md'
  - '{planning_artifacts}/architecture/architecture-the_project-2026-08-11/ARCHITECTURE-SPINE.md'
created: 2026-08-11
updated: 2026-08-11
---

# Lawha — Experience Spine

Owns *how it works* — information architecture, behaviour, states, interactions, accessibility, journeys. [DESIGN.md](DESIGN.md) owns *how it looks*; its tokens are referenced here by name. Conflict rules are stated in DESIGN.md.

## Foundation

**`apps/console`** — responsive web, no form-factor primacy: every task works at every width, designed at both ends. **shadcn/ui on Tailwind**, with Radix primitives supplying the accessibility and RTL behaviour floor; this spine specifies only the behavioural delta from those defaults. Light and dark, English and Arabic — four combinations, all first-class. *This stack is a UX-originated claim on the architecture, not an inheritance — see [Open Items](#open-items).*

**`apps/player`** — Preact on a **Chromium 76 / ES2019** floor. Fixed 16:9 landscape, no input, no cursor, no chrome (FR-2). A supervised state machine over a local cache that reasons about nothing it can get wrong: no schedule precedence, no status derivation, no locale detection. Everything it displays was decided by the console and delivered in a manifest.

Out of scope for this run: the public marketing website (Group H) and public setup documentation (FR-68). Steps 1 and 7 of Yusuf's journey touch the website, so the journey is specified end to end while only its in-scope steps carry surface specs.

**One actor** — the owner (PRD §5). No roles, no permissions, no per-branch access in v1.

## Information Architecture

**Console.**

| Surface | Reached from | Purpose |
|---|---|---|
| **Screens** | Sign-in landing, nav | Home. Every screen, grouped by branch, with confirmed status (FR-17, FR-72) |
| Screen detail | Screens row | Rename, reassign playlist, per-screen schedule, timezone, device tier, re-pair, remove (FR-21–FR-23, FR-42) |
| Pair a screen | "Add a screen", or the Screens empty state | Six-character code entry; the only path a screen enters the workspace (FR-16) |
| Media | Nav | Library with thumbnail, name, size, upload date; upload; storage meter (FR-24–FR-29) |
| Playlists | Nav | Playlists with item count and where each is assigned |
| Playlist editor | Playlists row, or created from Media | Ordered items, per-item durations, screen assignment (FR-31–FR-35) |
| Schedules | Nav, or from a screen / branch | Windows bound to playlists, and the **resolved** outcome for any given time (FR-38–FR-42, FR-44) |
| Branches | Nav | Locations, per-branch health, branch timezone, bulk playlist assignment (FR-70–FR-78) |
| Billing | Nav | Plan, screen entitlement, invoices, receipts, cancel (FR-58–FR-62) |
| Settings | Nav | Interface language, workspace timezone, account |
| Sign up / sign in | Website, or unauthenticated entry | Hosted Clerk — email or Google (FR-56) |

*Rendered reference: [mockups/direction-signal.html](mockups/direction-signal.html) (Screens, light, Arabic mirror, empty state), [mockups/key-screens-dark-narrow.html](mockups/key-screens-dark-narrow.html) (Screens, dark, <640px collapse), [mockups/key-schedules.html](mockups/key-schedules.html) (Schedules resolved outcome), [mockups/key-pair-screen.html](mockups/key-pair-screen.html) (Pair a screen at 390px, three failures).*

**Player** — states, not navigable surfaces. This table **refines the architecture spine's state machine**: its single `Holding` state becomes three register-bearing UX states, because who is looking at the wall changes what may appear on it.

| UX state | Architecture state | Register | Trigger |
|---|---|---|---|
| Pairing | `Unpaired` / `Pairing` | Owner | Unpaired, or code expired and regenerated (FR-15, FR-16) |
| Preparing | `Provisioning` | Owner | Manifest received, revision not yet fully cached (AD-5) |
| Playing | `Playing` | — | Revision cached, window active or fallback assigned |
| Nothing to play | `Holding` | Owner | Paired, no playlist assigned (FR-12) |
| Between windows | `Holding` | Customer | Schedule gap with no fallback (FR-40) |
| Subscription stopped | `Holding` | Customer | Termination confirmed (FR-63, FR-63b) |
| Recovering | `Recovering` / `Reloading` | Invisible | Recovery ladder engaged (FR-6) |
| Dark | `Halted` | None | Process death on a best-effort device — unrecoverable |

*Rendered reference: [mockups/key-player-states.html](mockups/key-player-states.html).*

**Closure.** Every need stated in the sources lands on a surface above, and every surface is reached by a flow in [Key Flows](#key-flows). *Pair a screen* and *Playlist editor* are reached only from within a flow, never from navigation — both are tasks, not places.

## The Truth Contract

*Product-specific section. It governs everything after it.*

A dashboard claiming a screen is playing when it cannot reach that screen is worse than one that says nothing. Four rules follow, and no surface may violate them for a cleaner layout.

1. **Status is heartbeat recency and nothing else** (FR-18). No inference, no optimism. 60s interval, offline after 5 misses, visible within roughly five minutes (NFR-13, NFR-7).
2. **An unconfirmed screen shows when it was last confirmed** (FR-19) — an absolute time, never "a while ago".
3. **Content for an unconfirmed screen is labelled last-known** (FR-20). The value reads *"Lunch Menu — last confirmed at 09:14"*. The label is part of the value, not a tooltip on it.
4. **Device tier is disclosed on the screen it applies to** (FR-6a) — while that screen is *healthy*, because that is when the owner can still act on it.

**Calm until it matters.** A healthy screen carries no colour, no dot, no checkmark. Anything degraded, stale, or expiring escalates to a `{components.banner-alarm}` plus a row promoted into the structural border tier carrying a complete sentence.

**Accepted risk: alerting is dashboard-only.** NFR-7 guarantees only that the *dashboard* shows an offline screen within five minutes, and FR-63a specifies email for payment failure alone. This was raised in discovery and accepted by product-owner decision. Two consequences bind: the in-dashboard escalation is the only channel and is therefore non-dismissible, and [Flow 2](#flow-2--a-screen-goes-dark-and-the-owner-finds-out-assumption) is where out-of-band alerting would attach if it is ever added.

## Voice and Tone

Brand voice lives in [DESIGN.md](DESIGN.md) *Brand & Style*. This is microcopy.

**Every message names the condition and the next action** (NFR-9). No bare error codes, no generic failure strings. If there is no action, say so rather than implying one.

- ✅ *"Offline since 09:14 today. Check power and Wi-Fi at the screen. Playback resumes by itself once it reconnects — nothing to rebuild."*
- ❌ *"Screen unavailable."* / *"Error: heartbeat timeout"* / *"Something went wrong."*

**Say what Lawha knows and what it does not.** *"We stopped hearing from this screen at 09:14, so we can't tell you what's on the wall right now."*

**Plain register, no signage jargon.** *Screen*, *playlist*, *branch*, *schedule* are the only domain terms in the interface. *Manifest*, *heartbeat*, *entitlement*, *revision*, *holding card*, *best-effort device* are internal and never surface; where the glossary and ordinary speech differ, ordinary speech wins in the UI.

**No cheerfulness about problems, no apology theatre.** No exclamation marks, no "Oops", no emoji.

**On the wall, say almost nothing.** Customer-register player states carry no text (FR-63b).

**Mechanically** (AD-22): every string comes from an ICU catalogue with named placeholders. No concatenation, no template interpolation, no sentence assembly in application code — *including assembled accessible names*, which are single catalogue entries with named slots.

## Component Patterns

Behavioural specs. Visual specs are in [DESIGN.md](DESIGN.md) *Components*; component names are identical across both files.

| Component | Used on | Behavioural rules |
|---|---|---|
| `screen-row` | Screens | Four columns ≥1024px. Escalated rows expand **in place** — never a tooltip, hover, or modal, because the disclosure must survive a touch device and a screen reader. The whole row is one link; its accessible name is **one ICU entry with four named slots** (name, playlist, last-confirmed, status) and ends with the state asserted positively — *"Live, confirmed just now"* — so health is an assertion in the accessibility tree even while it is an absence on screen. Not selectable, no checkbox. |
| `status-tag-*` | Screens, Branches, Screen detail | Three states, each carrying a text label as well as a fill: `Live`, `Offline`, `No auto-restart`. **Non-interactive** — never buttons, never filters, never independently focusable, so no target-size criterion applies to them. `No auto-restart` names the disclosure rather than the hardware class (PRD's *best-effort device* is internal, and "Smart TV" is both jargon-free-but-wrong — Fire TV Silk is a stick — and silent about what it means). |
| `banner-alarm` | Every console surface | Page-level and global, not Screens-only: the owner may arrive anywhere. Non-dismissible, static-flow, `role="region"` with an accessible name so a screen-reader user can navigate *to* it deliberately as well as past it. Summarises count, names the specific screen, and links to the disclosure rather than restating it. |
| `notice` | Any surface | Rollback failures, partial-load statements, console-offline warnings. Announced through the status announcer; `role="alert"` **only** for a rollback, since an unrequested reversal of the user's own action is the one genuinely interruption-worthy event in the product. |
| `group-header` | Screens, Branches | Carries the FR-76 health summary. States all three counts explicitly — online, offline, stopped — and never collapses them into a single "healthy/unhealthy" verdict. Zero counts are omitted, never rendered as "0 offline". |
| `nav-item` / `nav-sheet` | All | Rail ≥1024px, sheet below 640px. Sheet traps focus, closes on Escape, returns focus to its trigger. Labels are full words in both languages; no horizontal tab row anywhere in the product (FR-55). |
| `modal` | Destructive confirmations, pairing | Focus trapped, Escape closes, focus returns to the trigger. Confirmations name the specific objects affected, never a count alone. |
| `skeleton` | Any loading surface | Occupies final dimensions; nothing animates. Its region carries `aria-busy="true"` while loading — without it, *loading*, *healthy*, and *partial* are the same silence to a screen reader, which is fatal on a product whose thesis is that silence means verified-healthy. |
| Pairing code input | Pair a screen | Six characters, **one field**, auto-focused, case-insensitive, accepts a paste of the whole code. Never six boxes with auto-advancing focus — Yusuf is reading a code off a TV and looking back down between characters. Never validates per character. Alphabet excludes `0 O 1 I L 5 S 2 Z 8 B` ([DESIGN.md](DESIGN.md) *Typography*). Three distinct failures: **wrong code**; **expired code** — the player has *already* displayed a fresh one (FR-16), so the fix is to look back up at the TV; **entitlement ceiling** (FR-59), which is not a pairing problem and says so, naming the plan limit and linking to Billing. |
| Media uploader | Media | Ceilings enforced client-side before transfer: 150 MB video, 15 MB image (FR-25). Rejection names the specific reason and the fix — format, size, or codec — never "invalid file" (FR-26). MP4/H.264 stated at the point of upload. Progress per file; a failed file does not fail the batch, and each per-file outcome is announced. **Flash safety is an unresolved product gap** — see [Open Items](#open-items). |
| Playlist editor | Playlist editor | Reorder by keyboard and explicit move controls, **never drag-only**. No Publish button — changes propagate without a manual push (FR-37) — so the editor states when the change reached each assigned screen instead, as a continuously arriving status. It also states the FR-11 delay plainly: **the item currently on screen plays to the end of its duration before the change takes effect**, unless that item was itself removed or altered, in which case the screen advances immediately. Without this, an owner watching the wall sees a lag the product never predicted. |
| Schedule editor | Schedules | Presents the **resolved outcome, never the precedence rules**. The owner sees "what plays at 13:00 on Tuesday" as an answer; the four rules are never shown or explained. When a new window would be overridden, the editor says which window wins and why in one sentence, at the moment of editing. Because colour is signal-only, playlists are **never colour-coded** — blocks are distinguished by fill inversion, and `{colors.amber}` marks hours where nothing is scheduled and the wall will fall back to a holding card. |
| Branch bulk assignment | Branches | Assigns to every screen in a branch in one action (FR-73). States the count affected before committing, **names any screen whose per-screen override will survive**, and is undoable. |
| `storage-meter` / `upload-progress` | Media | Consumed against allowance (FR-29) with an absolute figure, never a bare percentage. |
| `trial-badge` | Player | Appears only during an active trial (FR-79). Removed **within one heartbeat cycle of payment confirmation** (FR-82) — automatically, with no re-pairing, player restart, or manual action, and visible to the customer the same day they pay. On any paid plan the wall carries no vendor branding of any kind. |

## State Patterns

Defaults below apply unless a surface overrides them.

**Empty is instructional, never decorative** — one sentence, one action, no illustration. **Loading never shifts layout** and always carries `aria-busy`. **Partial is stated, not hidden** — a surface that could not reach part of its data says which part; it never renders a partial list as complete, which is the same failure class as claiming a screen is playing. **Stale is not an error** — the sentence reflects that and never blames the owner. **Every state names its announcement channel**; there is no state that changes silently in the accessibility tree.

| Surface | Empty | Error / at-limit | Other |
|---|---|---|---|
| Screens | "No screens yet" → pairing (the first thing Yusuf sees) | Entitlement ceiling names plan count, count in use, path to change | Stale per screen (FR-19/20); best-effort disclosure while healthy |
| Screen detail | — | Re-pair failure; remove confirms entitlement release (FR-22) | Stale; device tier |
| Pair a screen | — | Three distinct failures (see Component Patterns) | — |
| Media | "Nothing uploaded yet" → upload | Per-file rejection with reason and fix; storage exhausted blocks upload | Delete warns which playlists use the item (FR-28) |
| Playlists | "No playlists yet" → create from Media | — | Shows where each is assigned |
| Playlist editor | "This playlist is empty" → add from Media | Assignment failure rolls back | Per-screen propagation status; FR-11 delay stated |
| Schedules | "No windows — this screen plays its fallback" | Overlap resolution stated at edit time | **Gap with no fallback is flagged in amber before it happens** |
| Branches | Never empty — a default branch always exists (FR-71) | Remove states what happens to its screens | Per-branch health, all three counts |
| Billing | — | Payment failed; trial expiring | Persistent banner naming **the exact date** screens stop (FR-63a) |
| Settings | — | Save failure rolls back | — |
| **All console surfaces** | — | **Console offline** | A persistent `{components.notice}`: the browser cannot reach the server, so every status is as of the last successful fetch, with that time stated. A dashboard still showing "Live" while unable to refresh is exactly the claim the Truth Contract forbids. |

**Player.** No browser error page, no blank screen, no stack trace **in any circumstance the player is still running** (FR-12). That absolute has one boundary and the sources state it twice: on a best-effort device, process death is unrecoverable and the wall goes dark until someone intervenes (PRD §4.3, `Halted`). That is precisely what `{components.status-tag-caveat}` discloses in the console, before it happens.

- **Preparing** (`Provisioning`, AD-5) — a revision activates only when fully cached, so there is a real, sometimes minutes-long window between paired and playing. This is Flow 1 between steps 6 and 7, with Yusuf standing in front of the TV, so it is **owner register** and says what it is doing. On a *re-cache* mid-life the venue's customers are watching, so the register switches to customer and the last playing frame is held instead. FR-14 lands here: a corrupt or partial cache re-fetches rather than failing to start.
- **Recovering / Reloading** — invisible where it can be. An L3 full page reload is a visible flash on a 1920×1080 wall and a return through Preparing, so the player holds the last rendered frame across the reload rather than flashing to white.

## Interaction Primitives

**Never optimistic about screen state.** A playlist assignment shows as *saved* immediately — a fact about the workspace. It does **not** show as *playing* until a heartbeat confirms it (FR-18). Two confirmations, two moments, never collapsed.

**Optimistic elsewhere.** Renames, reorders, duration edits, branch moves apply immediately with rollback on failure — workspace facts the console owns. A rollback is announced assertively.

**Destructive actions state consequences in the confirmation**, naming specific objects: media deletion names the playlists using it (FR-28); screen removal states the entitlement slot is released (FR-22); branch removal states what happens to its screens.

**Keyboard reaches everything.** No drag-only reorder, no hover-only disclosure, no right-click-only action.

**Focus is always visible** and never suppressed, never replaced by a background change. On signal fills and at region boundaries it uses `{components.focus-ring-on-signal}`.

**Copy affordances where a value gets transcribed.** Screen IDs and player URLs are copyable. The pairing code is not — it is read off a TV, in the other direction.

**Filtering and grouping are URL state**, so a view is linkable and survives reload.

**Motion.** Zero in the console. One exception: the player cross-fade, which degrades to a hard cut under memory pressure and when the manifest carries a **`reducedMotion` flag set per screen from the console** — the player takes no preference from its device, and a Tizen TV's audience of passers-by can set nothing, so the manifest is the only reachable channel (same mechanism as locale, AD-23).

## Bilingual Behaviour

*Behavioural rules; typography is in [DESIGN.md](DESIGN.md).*

**Language is a user property, not a browser guess** — persists per user across sessions and devices (FR-46), carries between website and dashboard (FR-69), inferred from `Accept-Language` only on a first visit.

**The player never detects its locale** (AD-23) — language and direction come from the manifest, because a stick shipped with an arbitrary system locale must not decide what a venue's wall says.

**Completeness is the bar** (FR-45). No screen, error, empty state, notice, or email falls back to the other language. A missing catalogue key is a build failure, not a runtime fallback.

**Mirroring** (FR-47). Navigation origin, directional icons, stepper and progress direction, form and label alignment, table column order, drawer and menu origin all invert. Non-directional icons — a camera, a clock — do not.

**Tab order equals visual order in both directions, enforced mechanically.** Ruling out a hand-maintained `tabindex` map is necessary and nowhere near sufficient: DOM order diverges from visual order under `order`, `row-reverse`, `grid-template-areas`, and explicit grid placement. [DESIGN.md](DESIGN.md) *Layout & Spacing* prohibits all four in any component with more than one focusable element, which is lintable. The 640–1023px column-wrap rule is exactly where the tempting implementation breaks this, invisibly, and doubly so in RTL.

**Numerals, times and prices** stay Latin digits, LTR, bidi-isolated inside Arabic sentences (FR-50), formatted per locale (FR-54). **Isolation is realised as markup** — `<bdi>` or `<span dir="ltr">` — not as Unicode control characters, wherever the string is rendered to the DOM. `U+2066`/`U+2069` landing inside a live region is a known source of dropped announcements and of literal garbage on refreshable braille displays.

**Expansion is designed for, not tested for** (FR-48, FR-55). No text container has a fixed width or height. The reference case is Arabic at +30%.

**The working week is configurable** and never hardcoded to Monday–Friday (FR-44).

## Inspiration & Anti-patterns

**Lifted from the sources' first-hand competitor inspection** (addendum, trial account, 2026-08-10). These are observed defects in the reference product, not hypotheticals, and three of them became rules above:

| Observed | Rule it produced |
|---|---|
| Settings tab row overflows — "Social Connections" wraps, "White Label" clips at the viewport edge, under its own **English** labels | No horizontal tab row anywhere in the product. A row that cannot survive English will not survive Arabic at +30% (FR-55). |
| A promo video card overlaps and obscures primary navigation, hiding "Media Library" — in a paid product | Nothing may occlude navigation. There is no promotional surface inside the console. |
| Trial-expiry banner takes permanent sidebar space with content visibly behind it — degrading the product rather than gating cleanly | Expiry is stated in a full-width `{components.banner-alarm}` naming the exact date, and never by degrading a surface. |
| No documentation, FAQs or video guides; support quality compensating | FR-68 makes public pre-purchase documentation product surface. Out of this run's scope but it is why the empty states carry instructions. |
| Subscription lapse stops the screens; "Playing" names the *assigned* playlist, not a live claim | The whole assigned-versus-confirmed distinction in [Interaction Primitives](#interaction-primitives). The reference product is not lying here — but the label is ambiguous, and rule 3 of the Truth Contract exists to remove the ambiguity. |
| **PosterBooking** — full Arabic UI and RTL alignment, 60 displays at Dubai Mall running Arabic/English/Russian loops. The addendum says *"study this one closely"* | The nearest thing to a direct competitor on the bilingual thesis. Not yet inspected; recorded as an open research task. |

**Rejected directions.** Four visual directions were rendered and three rejected — [.working/directions-index.html](.working/directions-index.html) holds all four side by side.

| Direction | Why it lost |
|---|---|
| A — Wall (editorial, hairline rules, healthy = no colour at all) | Purest reading of the brief and the highest learning cost: a healthy dashboard is a list of names with nothing on it, which reads calm to a designer and broken to a first-time owner. |
| B — Console (dense precision instrument, dot status, 6–8px radius) | Scales best to forty screens and reads as software for someone more technical than a café owner. |
| C — Room (warm paper, soft cards, sage and terracotta) | Most approachable and least "modern-minimal"; the warm palette also narrows later accent choices. |
| **D — Signal** *(chosen)* | Won on a structural argument as much as an aesthetic one: with no shadows, tints, or gradients it needs **no modern CSS**, so it renders identically on the player's Chromium 76 floor and on current Chrome, and dark mode is inversion rather than a re-tune. The other three would each have needed a degraded player variant. |

**Rejected mechanisms.** Uppercase as a hierarchy device (a no-op on Arabic); `letter-spacing` as a substitute for it (breaks Arabic cursive joins); colour-coding entities by identity (colour is reserved for signal); a monospace family (a third bundled face on a device with a tight cache budget, for numerals Inter's tabular figures already handle).

**Emad flagged direction D as reading "very sharp"** and, offered a softer alternative, chose to proceed with it. If that is ever revisited, the levers in order of impact are radius off zero, true black to a soft ink, the full-bleed alarm strip to a contained banner, and the 800-weight uppercase label tier.

## Responsive & Platform

Breakpoints and their structural rules are in [DESIGN.md](DESIGN.md) *Layout & Spacing*. Behavioural deltas only:

- **< 640px** — navigation becomes `{components.nav-sheet}`. Rows become stacked blocks. Columns reflow to a second line; **nothing is dropped**, because a hidden last-confirmed time would break the truth contract. Reflow is by source order, never by grid placement.
- **Pairing must work at 390px** — Yusuf holding a phone next to a TV, reading a code off the wall. It is the narrowest real constraint in the product and the fifteen-minute test runs through it. Content must also reflow at 320px (1.4.10).

**Player.** Fixed 16:9 landscape, 1920×1080 design target, no input, no cursor, no chrome. Viewing distance 2–4 metres, so type uses the `{typography.player-*}` `vmin` tiers. Device tiers per PRD §4.3 are a **console disclosure, never a player behaviour** — the player does not know which tier it is on.

## Accessibility Floor

**Target: WCAG 2.2 AA within `apps/console` and `apps/player`, in both languages and both themes.** The claim is scoped deliberately: **authentication conformance is unverified** because it is Clerk's hosted surface (see [Open Items](#open-items)), and a WCAG claim covers complete processes — so no unqualified product-level AA claim may be published until that is tested.

Contrast is largely settled by the palette — 21:1 light, 19.8:1 dark — and the signal-surface boundaries are handled in [DESIGN.md](DESIGN.md) *Colors*. The real work is here.

**Perceivable**

- **Never colour alone.** Every status tag carries a text label; the alarm banner is a sentence, not an icon; an escalated row is also a bordered row and a labelled row.
- `{colors.amber}` is fill-only. `{colors.electric}` passes at 7.47:1 as text and is permitted, **except on a signal fill** where it is 2.00:1.
- Content reflows at 320px and 400% zoom without two-dimensional scrolling (1.4.10).
- `min-block-size`, never `block-size`, on every text container, so a user stylesheet applying `letter-spacing: 0.12em` cannot clip it (1.4.12). **Note the standing tension:** Arabic is specified at zero tracking because tracking breaks cursive joins, and 1.4.12 grants no Arabic exception — a user stylesheet *will* break Arabic joins and nothing here can prevent it. Nobody should "fix" that by clamping Arabic containers.

**Operable**

- **Skip-to-content link** plus a landmark map — `banner`, `navigation`, `main`, and the alarm banner as a named `region`. Two persistent blocks precede content on every page load (2.4.1, Level A).
- Focus visible at all times, `{components.focus-ring}` or `{components.focus-ring-on-signal}`, in both themes.
- Targets ≥44px on every interactive element at every breakpoint — stricter than 2.5.8's 24px, deliberately, for a phone held next to a TV. Status tags are non-interactive and out of scope for it.
- Tab order equals visual order in both directions, by DOM order, enforced by the structural prohibitions in [Bilingual Behaviour](#bilingual-behaviour).
- Reorder is available by keyboard and explicit controls, never drag-only (2.5.7).
- The alarm banner is static-flow, never sticky, so focus is never obscured by it (2.4.11).
- **Playlist auto-advance has no pause control**, by intent: on unattended signage a pause affordance would require an input device the player does not have and an audience with no standing to use it. This rests on 2.2.2's *essential* exception, and it is recorded here as a decision rather than left as an omission.

**Understandable**

- `lang` and `dir` on the document root, and `lang` on any embedded run of the other language, so screen readers switch voice correctly.
- Every error message is programmatically associated with its control — `aria-describedby` plus `aria-invalid` — and focus moves to the first invalid control on submit (3.3.1, 3.3.3, 4.1.2). The error *copy* is already the strongest part of this spine; this is the wiring it needs.
- **The pairing code is a cognitive-function test with no alternative path** (3.3.8): a six-character code read at 2–4 metres and retyped, deliberately non-pasteable, and the only way a screen enters the workspace. See [Open Items](#open-items).

**Robust**

- **One global status announcer**, `role="status"` with `aria-atomic="true"`, and a documented politeness contract. `role="alert"` is reserved for optimistic-rollback failures alone. Every state in the matrix above names its channel; nothing changes silently (4.1.3).
- `aria-busy` on any region while loading, paired with a polite "Loading screens" / "Screens loaded, N of N reporting". **Health is announced positively** in the row's accessible name — visual health may be an absence, accessible health may not, or *loading*, *healthy* and *partial* collapse into one silence on a product that means silence to be a guarantee.
- Reduced motion disables the player cross-fade, driven by the manifest flag.

EU/UK regions (NFR-10), so the European Accessibility Act is the direction of travel. AA is the floor.

## Key Flows

### Flow 1 — Yusuf sets up his first screen

**Verbatim from PRD §3.1.** The only validated journey in the product and the only one gating a success criterion.

*Yusuf runs a café. He has never used signage software. He has a TV on the wall, a stick in a box, and no intention of reading anything long.*

| # | Step | Budget | Surface | Requirements |
|---|---|---|---|---|
| 1 | Finds the site, reads what it costs without asking anyone, and signs up | 3 min | Website → Clerk *(out of run scope)* | FR-64, FR-66, FR-67, FR-56 |
| 2 | Plugs the stick into the TV and powers it on | 2 min | — *(not Lawha's surface)* | §4.3 |
| 3 | Opens the player and reads a six-character code off the TV | 1 min | Player — Pairing, owner register | FR-1, FR-2, FR-15 |
| 4 | Types the code into the dashboard; the screen is claimed | 1 min | Screens empty state → Pair a screen | FR-16, FR-17 |
| 5 | Uploads a photo of the menu | 3 min | Media | FR-24, FR-25, FR-26 |
| 6 | Puts it in a playlist and assigns it to the screen | 3 min | Playlist editor | FR-31–FR-35 |
| 7 | **Sees it on the wall** | 2 min | Player — Preparing → Playing | FR-37, FR-3 |

**Climax: step 7, and it is a physical beat.** Yusuf looks up from his phone at the wall. The console has already propagated the change with no Publish button (FR-37), and then confirms from the heartbeat that the screen is playing it — the second confirmation, not the first. The interface does not claim the wall changed; it waits until the wall says so.

**Failure paths.** Step 4: wrong code, expired code, entitlement ceiling — three distinct next actions (Component Patterns). Step 5: format, size, or codec rejection, each naming its fix. Step 7: the **Preparing** window is the failure mode nobody plans for — the manifest has arrived and the revision is not yet cached, so the wall is not yet playing and the console must say *preparing*, not *playing*, or it breaks rule 1 at the exact moment the fifteen-minute test is being judged.

Two consequences honoured throughout: **Yusuf never creates a branch** (FR-71 gives him one, and the word never appears in his path), and **he never reads documentation unless something goes wrong**.

### Flow 2 — A screen goes dark and the owner finds out `[ASSUMPTION]`

**Derived from FR-18–FR-20, NFR-7, NFR-13.** No validated protagonist; it exists because the product's thesis rests on it.

1. A screen loses power or network. The player keeps playing from local cache where it can — offline is the normal operating case, not an error (FR-4).
2. Heartbeats stop. After 5 misses — roughly five minutes — derived status flips to offline (NFR-13).
3. The row moves into the structural border tier, its tag becomes `Offline`, its playlist value is relabelled *last confirmed at HH:MM*, and a full-bleed `{components.banner-alarm}` names the screen and the time. The announcer reports it politely.
4. **Climax: a non-event.** Nothing reaches the owner. No email, no push. The escalation sits on a page he may not open for hours, and the calm-when-healthy design has trained him not to open it.
5. Whenever he next opens the console — any surface, any reason — the banner is there and cannot be dismissed. He checks power and Wi-Fi; playback resumes on its own when it reconnects (FR-5), and nothing needs rebuilding.

**Failure path:** the screen is on a best-effort device and the process died rather than the network. Then it is `Halted`, the wall stays dark until someone physically intervenes, and the caveat tag shown while it was healthy is the only warning the owner ever got.

### Flow 3 — Pushing a new menu to every screen in one branch `[ASSUMPTION]`

**Derived from FR-70–FR-78 and Group E.** The multi-branch owner is a first-class v1 case (PRD §3) with no journey in the sources.

1. Owner opens **Branches** and reads the per-branch health summary — online, offline, stopped (FR-76). One branch has an offline screen; he notes it and continues, because the content change is not blocked by it.
2. Opens **Media**, uploads the new menu image; ceilings and format validate before transfer.
3. Swaps the item in the branch's playlist and sets its duration (FR-33, FR-34).
4. From **Branches**, assigns that playlist to every screen in the branch in one action (FR-73). The confirmation states how many screens are affected and **names the screen whose per-screen override will survive** — screen beats branch.
5. **Climax: he does not visit a single screen.** Changes propagate with no manual push (FR-37) and each manifest is recomputed inside the same transaction as the write (AD-25). But the wall does not change instantly: per **FR-11**, the item currently on screen plays to the end of its duration first. The branch summary reports the new playlist only as heartbeats confirm it, one screen at a time.
6. The offline screen shows the new playlist as *assigned*, not *playing*, and picks it up on reconnect (FR-5). **The console never averages those two facts into one status.**

**Failure path:** the bulk assignment partly fails, or he undoes it. The undo restores the previous assignment per screen and is announced; screens that already confirmed the new playlist revert on their next manifest revision, which means the wall can briefly disagree with the console — and the console says so rather than hiding it.

### Flow 4 — Scheduling a lunch window over an all-day window `[ASSUMPTION]`

**Derived from Group E.** The sharpest stated UX problem in the sources — *"the dashboard surfaces the resolved outcome, not the rule"* — had no flow.

1. The branch already runs *Weekend Offers* every day, 10:00–22:00. Owner opens **Schedules** for one screen and adds a window: *Lunch Menu*, 12:00–14:00.
2. The editor detects the overlap and does **not** show the precedence rules.
3. **Climax: it states the answer in one sentence** — *"Between 12:00 and 14:00 this screen shows Lunch Menu instead. The window you set on this screen is the one that plays."* No rule numbers, no hierarchy diagram, no invitation to reason about scope or duration.
4. The resolved timetable updates: the 12:00 row now reads *Lunch Menu*, and the hours around it still read *Weekend Offers*. He can ask "what plays at Tue 13:00" and get a playlist name.
5. Friday has no window and no fallback, so those hours are flagged in `{colors.amber}` with a plain sentence — *this screen will show a holding card all day* — before it happens, not after a customer notices.

**Failure path:** he sets a window with no playlist, or a fallback that references deleted media. Both are refused at edit time, naming the condition and the fix.

*Rendered reference: [mockups/key-schedules.html](mockups/key-schedules.html).*

### Flow 5 — The subscription lapses and the screens stop `[ASSUMPTION]`

**Derived from FR-63, FR-63a–c, FR-79–FR-82.** Spans two surfaces and two registers and ends with content disappearing from a public wall.

1. **Trial.** The wall carries the wordmark badge at ≤2% of screen area in one corner (FR-79, FR-80). The console states the trial's end date in words — the badge never carries that meaning alone.
2. **First failed charge.** Email to the owner, plus a persistent dashboard banner naming **the exact date the screens will stop** (FR-63a) — a date, not "soon", not a countdown. It persists through every Merchant-of-Record retry. The grace period lives upstream in the payment provider's dunning and the console never duplicates or short-circuits it.
3. **Termination confirmed.** Screens stop. The console names which ones and states that restoring payment restores playback automatically.
4. **Climax: the customer-register card appears on the wall.** Near-black, one anonymous mark, no text. A café's customers must never learn from the wall that a card was declined (FR-63b) — and the mark must be visible enough not to read as a broken television, which is why it is 3.61:1 rather than a hairline.
5. **Restore.** Payment succeeds; playback resumes with no re-pairing and no rebuilt playlists (FR-63c). If the plan is now paid, branding is removed within one heartbeat cycle (FR-82) — the customer sees the result the same day.

**Failure path:** payment is restored but the screen is offline. It shows as *entitled* and not *playing*, and resumes on reconnect — the same distinction as Flow 3 step 6.

## Open Items

Four items this spine cannot close alone. Each has an owner and a gate.

| Item | Owner | Gate |
|---|---|---|
| **The shadcn/ui + Tailwind + Radix stack is a UX-originated claim.** `ARCHITECTURE-SPINE.md` names no UI library and no token system. Radix is load-bearing here for FR-47 mirroring and the keyboard/focus floor. | Architecture | Accept or reject before console implementation begins. If rejected, every accessibility-floor item above becomes hand-built work. |
| **Clerk's hosted auth is unaudited on the first screen every user meets.** Arabic strings are community-contributed and RTL is undocumented (FR-53). Conformance is not delegable, and an AA claim covers complete processes. | Product owner | **Move the audit earlier than the architecture spine's "revisit before phase 3".** An EN 301 549 smoke test — screen reader, `ar` locale, 400% zoom, keyboard-only — should run *before* the Arabic phase is scoped, because the result decides whether headless components are a phase-3 task or a phase-1 commitment. Until it passes, the AA claim stays scoped as written above. |
| **Flash safety on owner-uploaded video is unaddressed** (2.3.1, Level A). The uploader validates format, size and codec only. A full-bleed 1920×1080 wall in a public venue, playing a supplier's promo reel with a strobe cut, can affect a passer-by who never chose to look at it and cannot leave its field of view. Not a usability finding — a physical-harm and product-liability one. | Product owner / PM | Needs a v1 scope decision: at minimum a stated content policy plus warning-and-acknowledgement at upload for video; ideally luminance-flash analysis on ingest, with rejection copy in the existing shape. |
| **The pairing code has no non-transcription path** (3.3.8). Recommended resolution: have the player also render a QR that deep-links the console to a pre-filled pairing URL. It removes the cognitive-function test entirely and *shortens* Yusuf's fifteen-minute path — but it is a new player surface and a scope addition. | Product owner / PM | Decide alongside the pairing surface. |

Two research items also stand open: **PosterBooking** has full Arabic UI and RTL and the addendum instructs studying it closely — it has not been inspected. And the sources leave **reason-to-buy and the sharpened product promise** unresolved (PRD §12.1), which does not block this spine but does block the marketing surfaces that were out of this run's scope.
