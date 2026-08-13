---
title: "PRD: Lawha — bilingual digital signage"
status: final
created: 2026-08-11
updated: 2026-08-11
---

# PRD: Lawha (لوحة)

## 1. Overview

Lawha is digital signage software that turns any TV into a managed screen. A browser-based player runs on the screen; the owner controls what plays from a web dashboard. Pairing is a six-character code, setup is under fifteen minutes, and there is no proprietary hardware and no sales call.

Three properties define the product:

**It is bilingual as architecture.** The admin interface is complete in English and Arabic with true RTL layout mirroring, and on-screen rendering handles bidirectional text, Arabic display typography, and Arabic's 20–30% text expansion correctly. This is designed in from the first commit rather than added as a locale file, on the reasoning that a translation is a week's work while a correct RTL product is a rebuild.

**It tells the truth about screens.** A signage dashboard that claims a screen is playing when it cannot reach that screen is worse than one that says nothing. Screen state in Lawha derives solely from confirmed heartbeats.

**It grows with the customer.** One screen in one café and forty screens across nine branches are the same product at the same per-screen price, managed from the same account. There is no tier the customer has to graduate into to manage their second location.

### 1.1 Positioning

**Who it is for — deliberately horizontal.** Any venue that puts information on a screen. Cafés and restaurants, gyms, clinics and salons, retail floors and showrooms, schools, mosques and community spaces, and the many venue types that resemble them. Lawha is not built for a vertical and does not narrow to one. The common shape is a non-technical owner who wants correct content on a wall and then wants to stop thinking about it.

**Scale is open.** The product does not assume a small customer. One screen must feel as natural as sixty. A company with several branches manages all of them from a single account, and multi-location is treated as an ordinary case rather than an upgrade path. Screen count is limited only by the plan the customer chooses, never by the product's shape.

**What it is measured against.** The self-serve tier of the signage market — products a buyer can sign up for, pay for, and deploy without speaking to anyone. Not the enterprise or systems-integrator tier, which sells projects and installation.

**Where it is sold first.** Western, English-speaking customers, online. These buyers already understand the digital-signage category, so the sale carries no market-education cost. The Arabic capability ships in v1 regardless of this, and Arabic-speaking markets are a later motion — the leading comparable product does not support Arabic at all, confirmed by direct inspection of a live account, so the absence of Arabic in that tier remains a genuine market gap, held in reserve rather than spent.

`[NOTE FOR PM]` **One element of this section is still open: the reason-to-buy.** The above establishes who Lawha is for and what it competes against. It does not yet state why a buyer picks Lawha over an equivalently priced incumbent. Downstream work should treat that specific claim as undefined rather than assume one. Website copy (Group H) and pricing both depend on it.

One candidate is recorded and not adopted: the leading comparable places multi-organisation workspaces in a flat $100/month tier and gates advanced roles and remote device management above its entry price, so offering multi-branch management at the entry price is a concrete and checkable difference aimed at precisely the customer described above. Adopting it is the product owner's decision.

### 1.2 Product promise

`[ASSUMPTION]` Carried forward from the product brief as a placeholder: **"The screen is never wrong, and they never call anyone."**

Consistent with everything in § 1.1 and not contradicted by anything known, but not yet validated with a customer and not yet sharpened into a claim that distinguishes Lawha from an incumbent making the same implicit promise.

## 2. Goals and success criteria

Ordered. Each gates the next; criteria 1–3 are entirely within the builder's control.

| # | Criterion | Definition of met |
|---|---|---|
| 1 | **The fourteen-day test** | A real TV — not a development machine — plays content unattended for fourteen consecutive days, surviving at least one deliberate power cut and one Wi-Fi outage, with zero manual intervention. |
| 2 | **The fifteen-minute test** | Someone who is not the builder goes from unboxing to content on screen in under fifteen minutes, unaided and untalked-through. |
| 3 | **The Arabic test** | A native Arabic speaker examines a mixed Arabic/English layout on screen and finds nothing wrong: no broken bidi, no fallback font, no clipped text. |
| 4 | **One screen that isn't yours** | A real business runs Lawha in a real location. |
| 5 | **One paid screen** | Someone chooses to pay. |

Criterion 1 is the gate on everything. Until it passes, no other work counts as progress — and § 4.1 sequences the build so that reaching it does not wait on anything that does not serve it.

**Criterion 1 will not pass on the first attempt.** The prior build attempt died in thirty seconds. Each attempt costs fourteen days of wall-clock time that no amount of effort compresses, so the test should begin as early as phase 1 allows and is expected to run several times with fixes between. Plan calendar time for it rather than treating it as a final check.

## 3. Users

Lawha has one actor. Every functional requirement is written for the **owner** (§ 5), who appears below in two situations.

**Primary — the single-location owner.** Runs screens in a café, restaurant, gym, clinic, salon, showroom, school, mosque, or any comparable space. Non-technical. Wants a menu, offers, or announcements on the wall. Success for this person is that the screen is never wrong and they never have to call anyone. Screen count is not a defining characteristic: this person may have one screen or several dozen.

**Primary — the multi-branch owner.** The same person, running several locations for one company. Manages every branch from a single account, needs to see at a glance which branches are healthy, and needs to push content to a whole location without touching screens one at a time. This is a first-class v1 case, not an upgrade path. It assumes **one owner managing all branches** — per-branch access for branch managers is roles and permissions, which remains out of v1 (§ 4.2).

### 3.1 The setup journey

Success criterion 2 — fifteen minutes, unaided — is a journey, and it is the only journey in this PRD because it is the only one that gates a success criterion. It now begins on the website rather than in the dashboard, so it is specified end to end with the fifteen minutes allocated.

**Yusuf runs a café. He has never used signage software. He has a TV on the wall, a stick in a box, and no intention of reading anything long.**

| # | Step | Budget | Requirements |
|---|---|---|---|
| 1 | Finds the site, reads what it costs without asking anyone, and signs up | 3 min | FR-64, FR-66, FR-67, FR-56 |
| 2 | Plugs the stick into the TV and powers it on | 2 min | § 4.3 |
| 3 | Opens the player and reads a six-character code off the TV | 1 min | FR-1, FR-2, FR-15 |
| 4 | Types the code into the dashboard; the screen is claimed | 1 min | FR-16, FR-17 |
| 5 | Uploads a photo of the menu | 3 min | FR-24, FR-25, FR-26 |
| 6 | Puts it in a playlist and assigns it to the screen | 3 min | FR-31, FR-32, FR-34, FR-35 |
| 7 | Sees it on the wall | 2 min | FR-37, FR-3 |

**Fifteen minutes total, and step 2 is the one Lawha does not control.** Everything else is product surface. Two consequences the requirements must honour: Yusuf never creates a branch (FR-71 gives him one), and he never reads documentation unless something goes wrong (FR-68 exists for when it does).

The journey ends where the product's real promise begins — Yusuf stops thinking about the screen. Nothing after step 7 is a step.

**Secondary — the small agency or reseller.** Manages screens for several *client companies* under their own brand and margin. **Out of v1 scope**, and distinct from multi-branch: branches belong to one company, whereas an agency spans many. Recorded because it constrains the data model — workspace boundaries are built into the schema from the first migration even though v1 ships a single workspace per account.

## 4. Scope

### 4.1 In scope for v1, in build order

Everything below ships in v1. The phases are **build order, not scope reduction** — nothing here is deferred out of the release. The phasing makes § 2's stated priority executable: criterion 1 is a hard gate, and the work is sequenced so that reaching it does not wait on anything that does not serve it.

**Phase 1 — earn the right to build the rest.**

Group A in full, Group B in full, hosted authentication and the workspace record (FR-56, FR-57), media upload and library (FR-24–FR-28, FR-30), and playlists (FR-31–FR-37). English strings only.

Two requirements from the bilingual layer belong here despite Arabic being a later phase, because they are architecture rather than content: they cost almost nothing if applied from the first commit, and force a rebuild if applied later. **FR-48** (no fixed-dimension text containers) and **FR-49** (UTF-8 end to end), together with FR-47's mechanical half — layout written with CSS logical properties and no physical `left`/`right`.

*Gate: criterion 1. A real TV, fourteen days unattended, through a deliberate power cut and a Wi-Fi outage.* Nothing in phase 2 begins until this passes.

**Phase 2 — make it sellable.**

Scheduling in full (Group E), billing and entitlement (FR-58–FR-63c, FR-79–FR-82), the storage meter (FR-29), and the public website and documentation in English (Group H, excluding its Arabic half).

*Unlocks: criteria 2, 4 and 5 become reachable — a stranger can set it up, in a real venue, and pay.*

**Phase 3 — the differentiating bets.**

The Arabic layer in full (FR-45–FR-47, FR-50–FR-55), branches and multi-location (Group I), and the Arabic half of the website and documentation (FR-65, FR-68, FR-69).

*Unlocks: criterion 3, the Arabic test, judged by a native speaker.*

Both bets in phase 3 are deliberate strategic investments confirmed earlier in this document, and neither is required to prove the product works or to take a first payment. Placing them last reflects when they pay back, not how much they matter.

### 4.2 Explicitly out of v1

Native Android player app · screen zones · sequences · proof-of-play reporting · public API · white label · app and overlay library · Canva and social integrations · template or WYSIWYG editor · analytics · mobile admin app · roles and permissions · multi-tenant agency workspaces · Hijri calendar display · every device platform beyond the browser · AI features of any kind.

**Roles and permissions deserve a specific note now that branches are in scope.** Multi-branch companies commonly want a branch manager who can see and change only their own location. That is roles, and it stays out of v1: the product assumes one owner managing every branch. This is the most likely thing a real multi-branch customer will ask for, and it is the first candidate for the release after v1.

**QR pairing is deferred to v2** (added 2026-08-11). The UX accessibility review found the six-character code to be a WCAG 3.3.8 cognitive-function test with no alternative path, and recommended the player also render a QR that deep-links the dashboard to a pre-filled pairing URL. Deferred by product-owner decision. The cost is recorded rather than buried: it would remove the cognitive-function test entirely *and* shorten the fifteen-minute setup path that criterion 2 is judged on, so this defers a benefit as well as a scope addition. FR-16's transcription flow stands for v1.

**Branches are not agency workspaces.** Branches are locations inside one company. Agency workspaces span separate client companies with separate billing and branding. The first is in v1; the second is not.

Feature parity with incumbents is not a v1 goal. Pursuing it is the documented way this build collapses.

### 4.3 Supported devices

A web page cannot restart itself after a crash or relaunch itself after a power cut. FR-6 and FR-8 therefore require a launcher outside the browser, and device support divides accordingly. This is a capability boundary, not a preference.

**Certified — every player requirement guaranteed.** The fourteen-day test runs on certified devices, setup documentation is written for them, and marketing claims apply only to them.

- An Android device (HDMI stick class) running a kiosk browser application that provides boot-start, crash-restart, and wake-lock.
- A Raspberry Pi running Chromium in kiosk mode under a systemd service, which supplies autostart at boot and automatic restart on crash at the operating-system level.

**Best-effort — plays content, recovery not promised.** Smart TV built-in browsers (Tizen, webOS) and Fire TV's Silk browser. These have no launcher control, so a crash or a power cut leaves the screen dark until someone intervenes. Screen Wake Lock support on these engines is unverified. The product must state this plainly in the dashboard and in documentation rather than let an owner discover it from a customer.

The marketing claim is therefore *"guaranteed on certified devices, works on most others"* — not *"runs on any TV."* The browser-first architecture cannot support the stronger claim, and making it would set up exactly the silent failure this product exists to prevent.

`[NOTE FOR PM]` The Android certified path asks the customer to install a third-party kiosk browser. An app install is therefore in the setup flow regardless of the browser-first decision. A thin own-brand Android shell wrapping the same web player would be comparable work and would put boot-receiver, watchdog, wake-lock and memory ceiling — every item in the prior failure catalogue — under direct control rather than a third party's. Recorded as a live alternative, not adopted.

## 5. Glossary

Domain terms are used with these meanings throughout. Where a requirement uses one of these words, it means exactly this.

| Term | Meaning |
|---|---|
| **Owner** | The account holder acting in the product. The single actor in every functional requirement — Lawha has no other roles in v1. |
| **Workspace** | One company. The top of the hierarchy and the boundary of all data. One per account in v1. |
| **Branch** | One location belonging to a workspace. A workspace always has at least one, created implicitly. |
| **Screen** | One paired device displaying content. Belongs to exactly one branch. The unit of billing. |
| **Player** | The software running on a screen. A web application at a per-screen URL. |
| **Certified device** | A device where Lawha controls the launcher, so every player requirement is guaranteed. See § 4.3. |
| **Best-effort device** | A device that plays content but cannot recover from crash or power loss, because Lawha does not control its launcher. See § 4.3. |
| **Playlist** | An ordered set of media items with per-item durations, looping continuously. |
| **Schedule** | A rule binding a playlist to a day-of-week and time-of-day window, at branch or screen level. |
| **Fallback playlist** | What plays when no schedule window is active. |
| **Heartbeat** | The player's periodic report of identity, current item, and cache state. The only source of screen status. |
| **Last-seen** | The timestamp of the most recent heartbeat, shown whenever a screen is not currently confirmed online. |
| **Holding card** | A defined full-screen state shown instead of content — when there is nothing to play, or when a subscription has terminated. |
| **Entitlement** | The number of screens a subscription permits. Enforced at pairing. |
| **Trial badge** | The Lawha mark shown on screen during a free trial only, removed on any paid plan. |

The hierarchy in one line: **workspace (company) → branch (location) → screen (device) → player (software).**

## 6. Functional requirements

Requirement IDs are stable and assigned in creation order. They are never renumbered when sections are reordered, so they are non-contiguous within a group. Every ID is unique. Groups are organisational only.

### Group A — Player

The player is where this product lives or dies. A prior attempt failed after thirty seconds; these requirements exist to make that structurally impossible rather than merely fixed.

| ID | Requirement |
|---|---|
| FR-1 | The player runs as a web application at a unique per-screen URL and requires no installation beyond a browser. |
| FR-2 | The player renders fullscreen with no browser chrome, menus, scrollbars, or visible cursor. |
| FR-3 | The player caches all assigned media locally and plays from that cache during normal operation, not from the network. |
| FR-4 | The player continues playback uninterrupted when the network connection is lost. Offline is the normal operating case, not an error state. |
| FR-5 | The player resumes synchronisation automatically when connectivity returns, with no human action. |
| FR-6 | The player detects its own failure and recovers without human action. Failure is defined as any of: an unhandled error, no playback progress for **30 seconds** while an item should be playing, a decode failure, or no render-loop tick for **10 seconds**. Recovery begins within **10 seconds** of detection. In-page recovery handles what it can; process-level death is caught by the certified device's launcher. On best-effort devices, process death is unrecoverable and this is disclosed. |
| FR-6a | The dashboard identifies whether each screen is running on a certified or best-effort device, so an owner knows which recovery guarantees apply to that screen. |
| FR-7 | The player holds the display awake for as long as it is playing, suppressing screensaver and sleep. |
| FR-8 | On certified devices, the player relaunches automatically after a power cycle and resumes playback with no menu, prompt, or input. The mechanism is the device launcher — a systemd service on Raspberry Pi, boot-start in the kiosk application on Android — because a browser page cannot relaunch itself. On best-effort devices this is explicitly not provided. See § 4.3. |
| FR-9 | The player emits a heartbeat at a fixed interval carrying its identity, the item currently playing, and its cache state. |
| FR-10 | The player bounds its memory use during media decode: it preloads **at most one item ahead** of the item playing, and releases decoded resources for any item that is neither playing nor next. It does not hold the whole playlist decoded. |
| FR-11 | The player applies content and playlist changes without a restart. The item currently on screen plays to the end of its duration before the change takes effect, unless that item was itself removed or altered, in which case the player advances immediately. |
| FR-12 | When the player has no playable content, it displays a defined holding state. It never displays a browser error page, a blank screen, or a stack trace. |
| FR-13 | The player evaluates its schedule locally from cached rules, so scheduling continues to work while offline. |
| FR-14 | The player recovers from a corrupt or partial cache by re-fetching rather than failing to start. |

### Group B — Pairing and screens

| ID | Requirement |
|---|---|
| FR-15 | On first launch, an unpaired player displays a six-character pairing code and instructions in the configured language. |
| FR-16 | An owner claims a screen by entering that code in the dashboard. Codes are single-use and expire **15 minutes** after being displayed; an unclaimed player generates and displays a fresh code on expiry rather than stranding the screen. |
| FR-17 | The dashboard lists every screen in the workspace with its name, assigned playlist, and status. |
| FR-18 | **Screen status derives solely from heartbeat recency.** The dashboard never reports playback it has not confirmed. |
| FR-19 | Any screen not currently confirmed online displays a last-seen timestamp. |
| FR-20 | Content shown for an offline screen is explicitly labelled as last-known rather than current. |
| FR-21 | An owner can rename a screen and reassign its playlist. |
| FR-22 | An owner can remove a screen, releasing its entitlement slot. |
| FR-23 | An owner can re-pair an existing screen record to a new device without losing its name, schedule, or assignment. |

FR-18 through FR-20 exist because a silently stopped screen that the owner believes is fine is the worst outcome in this category. The requirement is not that competitors get it wrong — it is that the cost of getting it wrong is borne entirely by the owner, who finds out from a customer rather than from the dashboard.

### Group I — Branches and multi-location

One company, several locations, one account. The organising model is **workspace (company) → branch (location) → screen (device)**. A single-location customer must never be made to think about branches.

| ID | Requirement |
|---|---|
| FR-70 | An owner can create, rename, and remove branches within their workspace, each with a name and an optional address. |
| FR-71 | Every screen belongs to exactly one branch. A default branch exists and is used implicitly, so a single-location customer is never asked to create one. |
| FR-72 | The screen list can be grouped and filtered by branch. |
| FR-73 | An owner can assign a playlist to every screen in a branch in one action, without touching screens individually. |
| FR-74 | A schedule can be applied at branch level and inherited by that branch's screens, with per-screen override where needed. Branch-versus-screen precedence follows the rules stated in Group E: screen beats branch. |
| FR-75 | Each branch carries its own timezone, inherited by its screens by default. A company operating across timezones schedules correctly without per-screen configuration. |
| FR-76 | The dashboard shows a per-branch health summary — screens online, offline, and stopped — so an owner can see which location needs attention without reading a flat list. |
| FR-77 | An owner can move a screen between branches without re-pairing it or rebuilding its content. |
| FR-78 | Branch structure does not affect billing, which remains per screen. Adding a branch is free; adding a screen is not. |

### Group C — Media

| ID | Requirement |
|---|---|
| FR-24 | An owner can upload image and video files from the browser. |
| FR-25 | Uploads are subject to per-file ceilings of **150 MB for video** and **15 MB for images**. Derivation in the addendum: 60 seconds of high-quality 1080p is roughly 90 MB, so the ceiling carries real headroom while keeping per-screen caches inside realistic browser storage quotas on cheap hardware. |
| FR-26 | Unsupported formats are rejected at upload with a specific, actionable reason. **MP4/H.264 is the guaranteed-playable combination.** 4K video is not supported in v1 — a reliability decision as much as a cost one, since cheap devices decode it unreliably. |
| FR-27 | The media library lists items with thumbnail, name, size, and upload date. |
| FR-28 | An owner can delete media, and is warned when the item is in use by a playlist. |
| FR-29 | The dashboard shows storage consumed against the plan allowance. **The allowance is 10 GB per screen, pooled across the workspace** (set 2026-08-11 — see Group G, *Plan structure*, for derivation). |
| FR-30 | Media is served to players over cacheable URLs suitable for long-lived local caching. |
| FR-83 | **Uploaded video is checked for flash content before it can reach a wall** (added 2026-08-11). The check runs client-side, before transfer, alongside the FR-25 and FR-26 validations. A confident breach of the WCAG 2.3.1 general flash threshold is refused with a reason in the FR-26 shape; an uncertain or unanalysable result is a warning the owner must acknowledge; a stated content policy backs both. |

### Group D — Playlists

| ID | Requirement |
|---|---|
| FR-31 | An owner can create and name playlists. |
| FR-32 | An owner can add media items to a playlist in an explicit order. |
| FR-33 | An owner can reorder items. |
| FR-34 | Images have a per-item display duration. Videos play their full length by default. |
| FR-35 | A playlist can be assigned to one or more screens. |
| FR-36 | Playlists loop continuously. |
| FR-37 | Playlist changes propagate to assigned screens without a manual push step. |

### Group E — Scheduling

| ID | Requirement |
|---|---|
| FR-38 | An owner can schedule a playlist to a day-of-week and time-of-day window. |
| FR-39 | A screen supports multiple schedule entries. Where windows overlap, precedence resolves by the rules below, and the dashboard shows the owner which playlist will actually play at any given time. |
| FR-40 | An owner can define the fallback playlist that plays outside all scheduled windows. |
| FR-41 | Schedules are evaluated in the screen's local timezone. |
| FR-42 | A screen's timezone is configurable and defaults to the workspace timezone. |
| FR-44 | The working week is configurable and is not hardcoded to Monday–Friday. |

**FR-43 (Gregorian and Hijri calendar display) was withdrawn during architecture, 2026-08-11**, by product-owner direction. The architecture resolves schedules as a repeating day-of-week timetable, so calendar system is a display concern that never enters scheduling semantics — the requirement costs nothing to drop and nothing to restore later. Its ID is retired, not reused. FR-44 is retained: the configurable working week is a separate concern, is cheap, and is the part that matters for a later Gulf motion.

**Schedule precedence — the resolution rules.** Applied in order, top wins:

1. **Screen beats branch.** A schedule set on a screen overrides any branch schedule covering the same time.
2. **Narrower beats wider.** Among schedules at the same level, the one covering the shorter total duration wins. A two-hour lunch window beats an all-day window.
3. **Later-created beats earlier.** Among schedules of identical scope and duration, the most recently created wins.
4. **Fallback plays last.** The fallback playlist plays only when no schedule window is active.

A screen with no schedule and no fallback shows the holding card (FR-12) rather than nothing. The dashboard surfaces the resolved outcome, not the rule — an owner should never have to reason about precedence to know what is on their wall.


### Group F — Bilingual layer

The differentiating capability. Every requirement here applies to the admin dashboard and, where relevant, to on-screen rendering.

| ID | Requirement |
|---|---|
| FR-45 | The admin interface is complete in English and Arabic. No screen, error message, or empty state falls back to the other language. **One exception, added 2026-08-11: the hosted authentication surface (FR-53).** It does not widen — no surface Lawha builds may claim it. |
| FR-46 | Language selection persists per user across sessions and devices. |
| FR-47 | Arabic renders in a fully mirrored RTL layout: navigation position, directional icons, progress and stepper direction, form and label alignment, table column order, and drawer and menu origin all invert. **Done is defined mechanically: layout code uses CSS logical properties throughout, and contains no physical `left`/`right` layout property.** Non-directional icons — a camera, a clock — do not mirror.|
| FR-48 | No text container has a fixed height or width that clips content when strings expand. Layouts reflow. |
| FR-49 | Text is UTF-8 end to end, with no exception anywhere in the storage or rendering path. |
| FR-50 | Mixed Arabic/Latin runs — prices, brand names, phone numbers, units — render per the Unicode Bidirectional Algorithm with explicit isolation around embedded LTR runs. |
| FR-51 | Arabic display typefaces are bundled with the player and never resolved from the host device's fonts. |
| FR-52 | Bundled fonts are available from the offline cache. A player that loses its Arabic typeface when the network drops fails the Arabic test. |
| FR-53 | **Revised 2026-08-11.** The hosted authentication surface renders in **English in both locales**: not translated, not mirrored, not replaced. Checkout is unchanged and still must render in Arabic and mirror correctly, or be replaced. |
| FR-54 | Dates, times, and numerals are formatted per the active locale. |
| FR-55 | Navigation patterns tolerate label expansion. Horizontal tab rows that clip or wrap under longer strings are not acceptable. |

FR-55 is a direct lesson from the comparable product, whose settings tab row already wraps and clips under its own English labels.

**FR-83 was added on 2026-08-11**, raised by the UX accessibility review as a WCAG 2.3.1 Level A gap and confirmed as a v1 requirement. The uploader previously validated format, size and codec only, which meant a full-bleed 1920×1080 wall in a public venue could play a supplier's promo reel containing a strobe cut. The exposure is not usability but physical harm and product liability: a passer-by never chose to look at the wall and cannot leave its field of view. The client-side answer was chosen because it needs no ingest pipeline — which § 4.2 and the architecture spine both rule out for v1 — and because the uploader is already the stage where ceilings are enforced before transfer. It reduces exposure rather than conforming; server-side analysis on ingest is the revisit.

**FR-53 was revised on 2026-08-11** by product-owner direction, during the frontend spec run. The original required every embedded third-party surface to render in Arabic and mirror correctly or be replaced; the authentication surface now stays English in both locales instead. This is a deliberate trade against the product's stated position — the sign-in screen is the first Arabic surface a user meets — taken to avoid the customization cost the addendum documents, and it closes the architecture spine's `Deferred` item on Clerk. **It is the only place in the product where a user in Arabic meets English, and the exception is written to not widen.** Revisit if Arabic-speaking markets become the sales motion, where this surface stops being a cost saving and starts being the first impression.

### Group G — Account and billing

| ID | Requirement |
|---|---|
| FR-56 | An owner can register and sign in via hosted authentication using **email or a Google account**. |
| FR-57 | Each account has one workspace in v1. The schema carries workspace boundaries from the first migration to permit multi-workspace later without migration of live data. |
| FR-58 | An owner can select a plan and complete checkout through the Merchant of Record. Plan structure is defined below; the price itself is deferred (§ 12.2). |
| FR-59 | Screen entitlement is enforced: an owner cannot pair more screens than their plan allows, and is told clearly why when they hit the ceiling. |
| FR-60 | Subscription state is reconciled from Merchant-of-Record webhooks and treated as the source of truth. |
| FR-61 | Payment provider access is mediated by an internal abstraction — charge, subscribe, cancel, webhook — so a second provider can be added without touching product code. |
| FR-62 | An owner can change plan, cancel, and reach invoices and receipts. |
| FR-63 | When a subscription terminates, the screen stops playing and displays a neutral holding card. The trigger is **subscription termination, not first failed charge** — the Merchant of Record retries failed payments over several days before terminating, so the dunning grace exists upstream and must not be duplicated or short-circuited with a same-day cutoff. |
| FR-63a | The owner is warned before a screen stops: by email at first payment failure and at each Merchant-of-Record retry, and by a persistent dashboard banner naming the exact date the screens will stop. A screen going dark must never be the first the owner hears of it. |
| FR-63b | The holding card shown on a stopped screen is neutral and non-embarrassing in a public venue. It does not display payment failure, pricing, or account details to the venue's customers. Vendor branding is permitted here, since the screen has already stopped serving the venue's content. |
| FR-63c | Restoring payment restores playback automatically, without re-pairing the screen or rebuilding playlists. |
| FR-79 | During an active free trial, the player displays a Lawha badge on screen. On any paid plan the screen carries **no vendor branding of any kind** — no badge, watermark, logo, or interstitial. |
| FR-80 | The trial badge is constrained by specification, not left to implementation: it occupies **no more than 2% of screen area**, sits wholly within the **outer 10% margin** of one corner, renders at reduced opacity, and never animates. It is a signature, not a placement. |
| FR-81 | The badge's corner placement mirrors with content direction, so it does not collide with Arabic content laid out right-to-left. |
| FR-82 | Branding is removed within one heartbeat cycle of payment being confirmed. No re-pairing, player restart, or manual action is required, and the customer sees the result the same day they pay. |

**Plan structure.** Carried directly from the product brief's pricing discipline and stated here because six requirements depend on it:

- **One plan, not a tier ladder.** There are no feature gates. Every capability in this document is available to every paying customer. A customer never upgrades to unlock a feature.
- **Billed per screen, monthly, at $5 per screen** — set 2026-08-11, matching the comparable product's entry tier. See § 12.2.
- The screen is the only unit that costs money. Branches, playlists, media items, and schedules are unlimited and free.
- **Entitlement is a screen count.** The owner chooses how many screens they are paying for; FR-59 enforces it at pairing.
- **Storage allowance scales with the screen count, set 2026-08-11 at 10 GB per screen, pooled across the workspace** — a five-screen plan gets a 50 GB pool any screen can draw from, rather than five siloed 10 GB buckets. Object storage cost is trivial against the price (roughly 15 cents per screen per month at R2 rates), so the allowance is set generously: a working media set of several videos near the FR-25 ceiling plus a couple dozen images lands around 1–2 GB, giving 5–10x headroom before an owner has to delete anything. Pooling matches how media is actually reused — the same menu image assigned to three screens is not charged three times.
- **A free trial precedes payment**, running **14 days**, during which the trial badge (FR-79) is shown.

**The price is set at $5 per screen per month, and the storage allowance at 10 GB per screen pooled across the workspace (both 2026-08-11).** FR-29's meter now has a denominator.

The trial badge is the one moment Lawha appears on a customer's wall, and it appears while that customer is deciding whether the product looks professional there. FR-80 exists to keep that decision from being answered badly. Full white label — custom domain, de-branded dashboard, reseller-owned branding — remains out of v1 (§ 4.2) and is a separate concern from this.

### Group H — Public website and documentation

The website is the sales channel. With an online-first motion selling to buyers who will never speak to anyone, the fifteen-minute test begins here rather than at the dashboard.

| ID | Requirement |
|---|---|
| FR-64 | A public marketing website presents the product, its pricing, and a path to sign up. |
| FR-65 | The website is complete in English and Arabic with full RTL mirroring, held to the same standard as Group F. No page, form, or legal text is available in only one language. |
| FR-66 | Pricing is published openly on the site. No sales call, no quote request, no gated tier. Hidden pricing is a named category complaint and publishing it is a deliberate stance. |
| FR-67 | Sign-up flows from the website into the dashboard without re-entering information already given. |
| FR-68 | Setup documentation is published and public — readable before purchase, not only after. It covers pairing a screen, uploading media, building a playlist, scheduling, and the difference between certified and best-effort devices, in both languages. |
| FR-69 | Language selection persists between the website and the dashboard, so a visitor who reads Arabic marketing is not dropped into an English product. |

FR-68 deliberately overrides the product brief, which deferred documentation. Documentation is the setup experience for a self-serve customer who cannot call anyone; criterion 2 now begins at the website rather than the dashboard; and support contacts per screen is a counter-metric that a solo operator cannot absorb. This was raised as an addition and confirmed.

## 7. Player reliability requirements

These are not aspirations. Each corresponds to a catalogued failure from the prior build attempt and each must become an explicit acceptance test. **This PRD states the requirement and its bound; it does not write the tests.** Authoring them belongs to test design, and NFR-1 through NFR-7 are the intended input to that workflow — criterion 1 is judged by them.

| ID | Requirement | Failure it prevents |
|---|---|---|
| NFR-1 | The player survives fourteen consecutive days of unattended operation without intervention. | The thirty-second death. |
| NFR-2 | The player recovers from process death automatically, with no first-crash-is-permanent path. | No watchdog, no auto-restart. |
| NFR-3 | On certified devices, the player recovers from a device cold boot to playing content with no human input. | Power cut leaves a dead screen. |
| NFR-4 | The player plays indefinitely from local cache with no network. | Offline treated as an error. |
| NFR-5 | The display never sleeps, dims to blank, or surrenders to a screensaver while playback is active. | No wake-lock. |
| NFR-6 | The player is not terminated by the host under memory pressure during sustained video decode. | OOM kill on low-memory hardware. |
| NFR-7 | Silent death is impossible: an unreachable screen is shown as offline in the dashboard within **five minutes**, per NFR-13. | The worst outcome in this category. |

## 8. Non-functional requirements

**Setup and usability**
- NFR-8 — An unaided non-technical user completes setup from unboxing to content on screen in under fifteen minutes.
- NFR-9 — Every error message names the condition and the next action, in the owner's language. No message consists solely of an error code, a stack trace, or a generic failure string.

**Data protection**
- NFR-10 — Personal data is stored in a region appropriate to the customer base. With Western-first launch, EU/UK regions and GDPR/UK-GDPR obligations govern. Data-processing agreements are in place with every subprocessor.
- NFR-11 — The data residency posture is revisited before entering any market with its own residency law. Saudi PDPL requirements are documented in the addendum and become live on Gulf entry.

**Cost and operation**
- NFR-12 — Media is fetched once per change, not per loop. Under normal operation — a playlist of up to 3 minutes at 1080p, content changed weekly — recurring delivery stays at or below **2 GB per screen per month**. A screen whose content is unchanged consumes only heartbeat traffic.
- NFR-13 — Heartbeat interval is **60 seconds**. A screen is shown offline after **5 consecutive missed heartbeats**, so an unreachable screen becomes visible within roughly five minutes. `[ASSUMPTION]` These are defaults chosen to make NFR-7 testable; architecture may tune them against real device behaviour, but they are constants in the product, not per-screen settings.

**Platform**
- NFR-14 — The supported device matrix is defined in § 4.3 as two tiers, certified and best-effort. Certified devices are tested against every player requirement; best-effort devices are tested for playback only. Claims made anywhere in the product, the website, or the documentation apply to the certified tier unless explicitly stated otherwise.
- NFR-15 — Screen Wake Lock support is verified per device before that device enters the certified tier. The API is present in all major current browser engines but is unverified on television platforms running older forked engines.

## 9. Success metrics and counter-metrics

| Metric | Counter-metric |
|---|---|
| Screens surviving fourteen days unattended | Screens requiring any manual intervention, and what for |
| Median unbox-to-playing time | Setup attempts abandoned before content appears |
| Screen-hours playing correct content | Screen-hours where the dashboard state disagreed with the wall |
| Paid screens | Support contacts per screen per month — the number that decides whether this scales solo |

The last pairing matters most. A product whose owners never call is the whole thesis; a product that grows revenue while growing support load per screen has failed at its own premise.

## 10. Risks

Carried from the product brief's "How This Dies" and updated for decisions made since. Named in advance so they can be watched for.

**Scope growth — created by this document, now partially mitigated.** The brief's v1 list was deliberately minimal. This PRD added multi-branch management, a bilingual public website, public documentation, subscription billing with a provider abstraction, device tiering, and trial branding. Each addition was justified individually and confirmed deliberately; collectively they grew v1 by roughly a third before a line of code existed. The brief's own second-most-likely death was *"building toward a competitor's feature list instead of the fourteen-day test."*

**Mitigation: § 4.1 is now phased with criterion 1 as a hard gate**, so the added scope cannot delay the test that decides whether the product works. This converts the risk from *scope that displaces the gate* to *scope that follows it* — real mitigation, but not elimination. The residual risk is phase 3: the bilingual layer and branches are the two largest investments and the two furthest from proven demand.

Capacity is full-time, which makes the total scope defensible. It does not make it small.

**Distribution — still the most likely way this ends.** There is no identified customer, no segment narrower than "venues with screens," and no channel. The plausible outcome remains a working product nobody sees. Two partial mitigations now exist that did not before: trial-period player branding turns deployed screens into a discovery surface, and public pre-purchase documentation makes the product findable and evaluable without contact. Neither is a channel. *This remains the open hole in the plan, and it stays open by explicit decision.*

**The local deployment that isn't being used.** The product owner is in Medina and is surrounded by exactly the venue types § 1.1 targets, while the sales motion points at customers on another continent. Success criterion 4 — *one screen that isn't yours* — is the criterion the brief identifies as carrying the real risk, and it is the one most cheaply satisfied close to home. These are not competing motions and the PRD assumes both remain available.

**Third-party dependency.** The buy-over-build posture concentrates risk in vendors. Three specific exposures: hosted authentication ships Arabic as a community contribution with no documented RTL layout support, which sits directly across the product's core capability; Merchant-of-Record payout coverage for Saudi Arabia varies by vendor and is unverified; and the certified Android path depends on a third-party kiosk browser the product does not control. Each is recorded in the addendum with its consequence.

**Cost at scale.** Video storage and bandwidth against a low flat per-screen price. Mitigated by the caching behaviour bounded in NFR-12, which the player requires anyway, and by the media ceilings in FR-25.

**Motivation.** The stated driver is the business model rather than a personally felt problem, and player reliability work is tedious. Mitigated by success criteria 1–3 being achievable alone and producing a visible result.

## 11. After v1

Not commitments. Recorded so that v1 decisions do not foreclose them, and so the deferred list in § 4.2 has somewhere to point.

**Immediately adjacent, in likely order of demand:** roles and permissions, which multi-branch customers will ask for first (§ 4.2); a native Android player shell, which would bring boot, watchdog, wake-lock and memory control in-house (§ 4.3); and Arabic-speaking markets, where the bilingual capability becomes a buying reason rather than a latent one, and where the parked regulatory and payment-rail research in the addendum becomes live.

**Further out:** the agency and reseller tier, with multi-tenant workspaces and white label — the segment the data model already accommodates through workspace boundaries carried in the schema from the first migration.

## 12. Open items

### 12.1 Blocking — resolve before UX and website work

1. **Reason-to-buy** (§ 1.1, final note) and the sharpened product promise (§ 1.2). Owner: product owner. Who Lawha serves and what it competes against are now settled; what remains is the single claim that distinguishes it from an equivalently priced incumbent. Blocks website copy (Group H) and pricing. Does not block architecture, and no longer blocks UX structurally — only the words on the marketing surfaces.

### 12.2 Deferred, with owner and revisit condition

| Item | Owner | Revisit when |
|---|---|---|
| Heartbeat defaults (NFR-13) | Architecture | During architecture, tuned against real device behaviour and bandwidth cost |
| Media storage and delivery mechanism | Architecture | During architecture, decided against measured per-screen bandwidth cost |
| Merchant-of-Record vendor selection | Product owner | Before billing implementation. Must verify Saudi Arabia payout support with the specific provider |
| ~~Pricing~~ | ~~Product owner~~ | **RESOLVED 2026-08-11 — $5 per screen per month**, adopted from the comparable product's entry tier. It remains unvalidated for the Western self-serve market and is a price to test, not a price that is proven |
| ~~Storage allowance per screen~~ | ~~Product owner~~ | **RESOLVED 2026-08-11 — 10 GB per screen, pooled across the workspace.** The comparable product publishes no storage figure, so this is derived independently from object storage cost and a working media set, not matched. See Group G, *Plan structure* |
| First customer and channel | Product owner | Alongside § 1.1. Open by explicit decision since the brief, which named it the load-bearing unknown with no mitigation |

### 12.3 Assumptions index

Every `[ASSUMPTION]` and `[NOTE FOR PM]` in this document, collected. Four remain.

| Location | Tag | What is assumed or noted |
|---|---|---|
| § 1.1 | `[NOTE FOR PM]` | The reason-to-buy is undefined. Who Lawha serves and what it competes against are settled; the distinguishing claim is not. |
| § 1.2 | `[ASSUMPTION]` | The product promise is a placeholder carried from the brief, unvalidated with any customer. |
| § 4.3 | `[NOTE FOR PM]` | A thin own-brand Android shell is recorded as a live alternative to the third-party kiosk browser, not adopted. |
| NFR-13 | `[ASSUMPTION]` | Heartbeat interval of 60 s and a 5-missed-beat offline threshold are defaults chosen to make NFR-7 testable; architecture may tune them. |

### 12.4 Resolved since the brief

Product name (Lawha) · player platform and sequencing (browser first, native Android later) · third-party service posture (Clerk, Supabase, Merchant of Record behind an abstraction) · money rail · media ceilings and supported formats · authentication methods · whether the bilingual layer ships in v1 (it does) · whether the leading comparable supports Arabic (it does not).

**Added 2026-08-11, during the frontend spec run:** price ($5 per screen per month) · storage allowance (10 GB per screen, pooled) · the language of the hosted authentication surface (English in both locales, FR-53) · build order (the frontend presentation layer is built first, ahead of the phase 1 player gate — see below) · Group H sequencing (built last within the frontend phase, after every other surface — see below).

### 12.5 Build-order departure (2026-08-11)

§ 4.1 sequences phase 1 around criterion 1, the fourteen-day test, and states that nothing in phase 2 begins until it passes. By product-owner direction, the **frontend presentation layer for every user-facing surface is built first**, on fixtures, ahead of that gate. See [spec-lawha-frontend](../../../specs/spec-lawha-frontend/SPEC.md).

The gate is unmoved, not weakened: criterion 1 still gates shipping, and no frontend work counts against it. The reasoning for going first is that two architecture rules binding this layer — direction derived once at the root and no user-visible string ever concatenated — cost almost nothing on the first commit and force a rebuild if applied later, and that three of the five success criteria are judged by what a person sees.

**The risk this creates is the one § 10 already names.** Phase ordering was § 4.1's mitigation for scope growth, and building every surface before the gate spends calendar time on work the gate does not need. § 2 is explicit that criterion 1 will not pass on the first attempt and that each attempt costs fourteen days of wall-clock time no effort compresses. That clock now starts later.

**Within the frontend phase, Group H is built last** — after the console and player display surfaces, by product-owner direction. The website and documentation have no behavioural spine of their own (the UX run scoped Group H out of its run; see the UX spine's *Open Items*), and that gap is deliberately left for the end rather than closed now: a `bmad-ux` pass scoped to Group H, followed by its build, happens once the rest of the product exists to describe. Consequence worth naming: § 3.1's setup journey opens on the website (step 1) and closes on it (step 7's context), so the fifteen-minute test is not fully walkable end-to-end on fixtures until Group H lands — the console and player halves of that journey can be rehearsed independently before then.

---

*Technical selections, competitive research, regulatory findings, and rejected alternatives live in [addendum.md](addendum.md). Decision history is in `.memlog.md`.*
