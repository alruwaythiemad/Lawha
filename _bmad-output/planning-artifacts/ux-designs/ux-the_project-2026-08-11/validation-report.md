# Validation Report — the_project (Lawha)

- **DESIGN.md:** `_bmad-output/planning-artifacts/ux-designs/ux-the_project-2026-08-11/DESIGN.md`
- **EXPERIENCE.md:** `_bmad-output/planning-artifacts/ux-designs/ux-the_project-2026-08-11/EXPERIENCE.md`
- **Run at:** 2026-08-11
- **Lenses:** rubric walker, accessibility

## Overall verdict

Two lenses ran in parallel. The **rubric walker** returned 43 findings (2 critical, 8 high, 18 medium, 15 low); the **accessibility lens** returned 22 (3 critical, 6 high, 7 medium, 6 low). They converged. The direction is genuinely committed, every `{path.to.token}` reference resolved in both directions, all three load-bearing Chromium 76 capability claims checked out, and the contrast arithmetic was verified honest — seven of nine stated ratios exact to the published decimal, the two misses conservative.

Neither lens found the premise wrong. Both found the same structural weakness from different angles: **every failing combination in this system lives at a boundary the spine never measured, and all of them are boundaries its own zero-gap, full-bleed, solid-fill grammar creates.** The accessibility lens put it sharpest — the product's single most important object, the non-dismissible alarm banner, had no conformant treatment for a link or a focus ring on its red ground, worst case **1.03:1** in dark mode, which is not merely non-conformant but not rendered to the human eye.

**All 5 criticals and all 14 highs have been applied to the spines.** Three items could not be closed in UX and are recorded as Open Items in EXPERIENCE.md with owners and gates.

## Category verdicts

- Flow coverage — **thin** → fixed
- Token completeness — **thin** → fixed
- Component coverage — **thin** → fixed
- State coverage — **adequate** → fixed
- Visual reference coverage — **thin** → fixed
- Bloat & overspecification — **adequate**
- Inheritance discipline — **thin** → fixed
- Shape fit — **adequate** → fixed

Accessibility verdict: **not shippable against WCAG 2.2 AA as written — failures concentrated, not systemic.** Two-thirds were specification gaps rather than design dead-ends: the spine stated accessible outcomes without specifying the mechanism that makes them true.

## Findings by severity

### Critical (5)

**[Accessibility]** — C-1: the alarm banner was the least accessible object in the system (`DESIGN.md § banner-alarm, focus-ring`) — *fixed*
Every treatment failed. Electric link 2.00:1 on red; black link passes contrast but is visually identical to surrounding banner text, failing 1.4.1 by having *no* carrier; focus ring 2.00:1 light and 1.03:1 dark. With `section-gap: 0` and a 2px offset, a ring on any element merely abutting the banner bleeds onto red.
Fix: `on-signal` double ring at zero offset; links on signal fills underlined at 2px; banner declared static-flow, never sticky.

**[Accessibility]** — C-2: the AA claim rested on an unaudited third-party surface, audit deferred past the Arabic launch (`EXPERIENCE.md § Bilingual Behaviour`) — **open, product owner**
Clerk is step 1 of the only validated journey and mandatory for every user. Conformance is not delegable and a WCAG claim covers complete processes. If Clerk does not emit `lang="ar" dir="rtl"`, an Arabic screen-reader user gets Arabic spoken by a Latin voice engine.
Fix: AA claim scoped to the two apps with authentication explicitly unverified; audit recommended as a launch gate, not a phase-3 revisit.

**[Accessibility]** — C-3: owner-uploaded video plays full-screen on a public wall with no flash-safety gate (`EXPERIENCE.md § Media uploader`) — **open, product owner**
2.3.1 is Level A and applies to user-generated content the service delivers. A strobe cut in an uploaded promo reel can trigger a photosensitive seizure in a passer-by who cannot leave the screen's field of view. Physical-harm and product-liability dimension, mentioned nowhere in any artifact.
Fix: recorded as an Open Item needing a v1 scope decision — content policy plus upload acknowledgement at minimum, luminance-flash analysis on ingest ideally.

**[Token completeness]** — the Arabic type ramp was incomplete, so Arabic headings would have rendered in a Latin family (`DESIGN.md § typography`) — *fixed*
`heading-ar` and `body-sm-ar` did not exist while `heading` and `body-sm` hardcoded Inter, which has no Arabic coverage. `nav-item` and both holding cards resolve through `body-sm`. This is the exact host-font fallback success criterion 3 is judged on.
Fix: both tiers added, plus a normative rule that every Latin tier has an `-ar` counterpart and a Latin family never renders Arabic.

**[Token completeness]** — there was no player type scale, and the spines contradicted each other on player sizing (`DESIGN.md § typography`) — *fixed*
EXPERIENCE.md committed to `vmin`; DESIGN.md had zero `vmin` values. A 56px pairing code is 5.2% of viewport height at 1080p and 2.6% at 4K, unreadable across a café. Player holding cards and instructions had no size tokens at all.
Fix: full `player-*` scale in `vmin` with `-ar` counterparts, a separate `code-console` tier, and a normative unit rule.

### High (14)

**[Flow coverage]** — Group E (Scheduling) had no Key Flow, despite carrying the sharpest stated UX problem in the sources — *fixed.* Added Flow 4, climax on the one-sentence collision message.

**[Flow coverage]** — Group G (billing lifecycle) had no Key Flow, though it spans two surfaces and two registers and ends with content vanishing from a public wall — *fixed.* Added Flow 5.

**[Token completeness]** — the focus ring was unusable on the product's loudest component — *fixed.* See C-1.

**[Token completeness]** — the `-dark` suffix carried two incompatible meanings; a naive resolver would have flipped the customer holding card to white on a public wall — *fixed.* `player-neutral-*` introduced as explicit non-theme tokens.

**[Token completeness]** — no component token declared its dark-mode resolution, making "both themes" unverifiable from the artifact — *fixed.* Normative substitution rule with its three theme-invariant exceptions enumerated.

**[Component coverage]** — seven load-bearing components were specified nowhere: skeleton, sheet, modal, notice, radio, upload progress, thumbnail — *fixed.* All added to both spines.

**[Component coverage]** — the trial badge had a visual spec and no behavioural spec, and FR-82 was absent from both spines — *fixed.* Behavioural row added; Flow 5 exercises it.

**[State coverage]** — the architecture's `Provisioning` state was missing, which is the wall during Flow 1's climax — *fixed.* Added *Preparing* (owner register on first cache, customer register with last frame held on re-cache) and *Dark* (`Halted`).

**[State coverage]** — no surface specified console connection-loss behaviour; a dashboard showing "Live" while unable to refresh is exactly what the Truth Contract forbids — *fixed.* All-surfaces console-offline row added.

**[Inheritance discipline]** — the shadcn/Tailwind/Radix stack was asserted as inherited and appears in no source — *fixed.* Stated in both spines as a UX-originated claim and routed to architecture as an Open Item, with the consequence of rejection named.

**[Accessibility]** — H-1: the product had one live region and needed at least seven — *fixed.* Global `role="status"` announcer with `aria-atomic`; `role="alert"` reserved for rollback alone; every state names its channel.

**[Accessibility]** — H-2: "no signal" was indistinguishable from "not yet loaded", on a product whose thesis is that silence means verified-healthy — *fixed.* `aria-busy` plus a loading/loaded announcement pair, and the row's accessible name now asserts health positively.

**[Accessibility]** — H-3: the pairing code is a cognitive-function test with paste forbidden and an unspecified alphabet (3.3.8) — *partly fixed.* Alphabet restricted to an unambiguous set and the code tier split for the console. **Open:** the non-transcription alternative (a QR deep-linking a pre-filled pairing URL) is a scope addition for the product owner.

**[Accessibility]** — H-4: the screen row had no interactive affordance and an accessible name that collided with AD-22's no-concatenation rule — *fixed.* Divider promotes to full-strength border on hover and focus-within; accessible name specified as one ICU entry with four named slots.

**[Accessibility]** — H-5: no bypass mechanism, with two persistent blocks preceding content on every page load (2.4.1, Level A) — *fixed.* Skip link plus landmark map; banner given a named `role="region"`. The lens also cleared the accepted risk: 2.2.4 Interruptions is AAA, so non-dismissibility is not an AA failure.

### Medium (25)

All applied except where noted. Grouped:

- **Structural** — Component Patterns and State Patterns were prose where the reference shape uses tables, which is what let per-surface state coverage go missing and produced an alarm-banner scope ambiguity; per-surface empty/error/at-limit missing for nine of eleven surfaces; *Inspiration & Anti-patterns* was triggered twice over and absent. *All fixed.*
- **Contract integrity** — a load-bearing decision (badge-by-alignment) left hedged inside a file marked final, now committed; five component paddings off the declared 4px scale, now snapped; the same component carrying two names across the pair in three places, now unified; player state names diverging from the architecture's state machine with no mapping, now mapped; "FR-38–FR-44" silently resurrecting withdrawn FR-43, now corrected.
- **Accessibility (M-1 to M-7)** — the 1.40:1 divider as sole boundary between adjacent row links; the `status-tag-live` border invisible at that value, collapsing the three-tag scale for low-vision users; status tags never stated as non-interactive, leaving the 44px claim unverifiable; the 2px focus offset having nowhere to go in a zero-gap system, and banner stickiness never stated (2.4.11); "tab order via DOM order" forbidding a `tabindex` map but not `order`, `row-reverse`, `grid-template-areas`, or explicit grid placement; the trial badge contradicting the translucency absolute at 2.12:1; the customer holding card's only visible object at 1.379:1, reading as a dead television; ICU bidi isolation via Unicode controls injecting them into live-region text. *All fixed.*
- **Sources** — FR-11's item-completion delay read during discovery then dropped from both spines, now stated in the Playlist editor and Flow 3; the dashboard-only alerting risk stated three times at length, now once plus its flow.
- **Also** — Flows 1 and 3 had no failure paths; three components had a token and no visual-spec row; "player states never fail visibly in any circumstance" is false for the best-effort tier and the sources say so twice, now bounded.

### Low (21)

Applied: contrast slips (2.5→2.65, 21→19.8 dark); the label tier's over-broad "and by nothing else"; `{spacing.rule}` defined and referenced nowhere; version pins restated across two files; editorial voice leaking into EXPERIENCE.md in three places; "spines win on conflict" stated four times, now once; the promoted mockup's white-on-red at 3.73:1, now corrected in the file with its four remaining deviations disclosed; "Smart TV" naming a hardware class (and being wrong for Fire TV Silk), now "No auto-restart"; source paths unresolvable from the file's own directory and DESIGN.md carrying no `sources` at all; the `reducedMotion` preference being technically honoured but practically unreachable, now carried in the manifest; the 2.2.2 essential-exception claim for auto-advance, now recorded as a decision; the 1.4.12-vs-Arabic-tracking tension, now noted so nobody "fixes" it by clamping Arabic containers.

Open by decision: Flows 2–5 have no named protagonist, since the sources supply none and inventing one was explicitly forbidden during discovery.

## Mechanical notes

- **All three Chromium 76 capability claims verified correct.** `inset-inline-*` is Chrome 87; `justify-items`/`align-items` flow-relative values are Chrome 57 — and `align-items` being block-axis is *desirable* for a corner badge. `vmin` and compositor-driven opacity transitions available.
- **A fourth instance of the same bug class, caught by the rubric:** logical border *shorthands* (`border-inline-start`, `border-block-end`) shipped in Chrome 87, the same batch as the insets. Longhands are Chrome 69 and safe. Fixed. The spine's precision in banning *flexbox* gap specifically is correct and should not be "simplified" — grid gap is Chrome 66 and the badge grid needs it.
- **The discovery log contained a wrong decision both spines had silently corrected:** that electric `#0F2BFF` cannot serve as AA text on white. It is 7.474:1. A correction entry was appended, because a stale decision record is what gets re-litigated in implementation.
- Both files parse as valid YAML with every frontmatter key their specs name. Zero unresolved token references before or after the fixes.

## Reviewer files

- `review-rubric.md`
- `review-accessibility.md`
