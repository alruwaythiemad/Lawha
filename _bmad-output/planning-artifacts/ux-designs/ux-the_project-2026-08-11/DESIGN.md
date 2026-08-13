---
name: Lawha
description: Flat high-contrast minimalism for bilingual digital signage — zero radius, zero elevation, colour only as signal.
status: final
created: 2026-08-11
updated: 2026-08-11
sources:
  - '{planning_artifacts}/prds/prd-the_project-2026-08-11/prd.md'
  - '{planning_artifacts}/prds/prd-the_project-2026-08-11/addendum.md'
  - '{planning_artifacts}/architecture/architecture-the_project-2026-08-11/ARCHITECTURE-SPINE.md'
colors:
  # Overrides shadcn's semantic tokens. Unlisted shadcn tokens do NOT inherit —
  # Lawha overrides the full surface, because shadcn's defaults are built on
  # tinted greys and soft borders that this system rejects on principle.
  background: '#FFFFFF'
  foreground: '#000000'
  muted-foreground: '#666666'
  # Two border tiers. `border` is structural and always full-strength ink;
  # `divider` separates rows inside an already-bounded region.
  border: '#000000'
  divider: '#DADADA'
  input: '#000000'
  # Signal colours. Never tints, never backgrounds for text regions, never
  # decorative. A colour on screen means the product is telling you something.
  electric: '#0F2BFF'
  electric-foreground: '#FFFFFF'
  alarm: '#FF2D00'
  alarm-foreground: '#000000'
  amber: '#FFB800'
  amber-foreground: '#000000'
  # Focus and links ON a signal fill. electric is 2.00:1 on alarm and
  # electric-dark is 1.03:1 — not rendered to the human eye. Theme-invariant,
  # because the fills they sit on are. See Colors § "Signal surfaces".
  on-signal: '#000000'
  on-signal-companion: '#FFFFFF'
  background-dark: '#0A0A0A'
  foreground-dark: '#FFFFFF'
  muted-foreground-dark: '#999999'
  border-dark: '#FFFFFF'
  divider-dark: '#2A2A2A'
  input-dark: '#FFFFFF'
  electric-dark: '#5C7CFF'
  electric-foreground-dark: '#000000'
  # THEME SUBSTITUTION RULE — normative, not a note.
  # Every {colors.X} reference in components.* resolves to {colors.X-dark}
  # under [data-theme="dark"], with THREE theme-invariant exceptions: alarm,
  # amber, and on-signal (with their -foreground / -companion pairs).
  #
  # PLAYER NEUTRALS — not theme tokens. The player has no theme; these are
  # literal values for the customer-register holding card, kept separate so a
  # naive X -> X-dark resolver cannot invert them to white on a public wall.
  player-neutral-ground: '#0A0A0A'
  player-neutral-mark: '#555555'
typography:
  # ARABIC RAMP RULE — normative. Every Latin tier has an `-ar` counterpart.
  # A Latin family NEVER renders Arabic: Inter has no Arabic coverage, so a
  # missing counterpart falls back to a host font, which is the exact failure
  # FR-51/FR-52 and AD-23 exist to prevent and success criterion 3 is judged on.
  # Arabic counterparts are Cairo, letterSpacing always '0', line-height raised.
  #
  # UNIT RULE — normative. Console tiers are px. Player tiers are vmin, because
  # clamp() does not exist at the Chromium 76 floor and vmin scales correctly
  # across 720p, 1080p and 4K panels. Console tiers never appear in the player.
  display:
    fontFamily: 'Inter'
    fontSize: 24px
    fontWeight: '800'
    lineHeight: '1.05'
    letterSpacing: -0.035em
  display-ar:
    fontFamily: 'Cairo'
    fontSize: 24px
    fontWeight: '800'
    lineHeight: '1.4'
    letterSpacing: '0'
  heading:
    fontFamily: 'Inter'
    fontSize: 18px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  heading-ar:
    fontFamily: 'Cairo'
    fontSize: 18px
    fontWeight: '700'
    lineHeight: '1.55'
    letterSpacing: '0'
  body:
    fontFamily: 'Inter'
    fontSize: 14px
    fontWeight: '500'
    lineHeight: '1.5'
    letterSpacing: '0'
  body-ar:
    fontFamily: 'Cairo'
    fontSize: 15px
    fontWeight: '500'
    lineHeight: '1.7'
    letterSpacing: '0'
  body-sm:
    fontFamily: 'Inter'
    fontSize: 13px
    fontWeight: '500'
    lineHeight: '1.45'
    letterSpacing: '0'
  body-sm-ar:
    fontFamily: 'Cairo'
    fontSize: 14px
    fontWeight: '500'
    lineHeight: '1.65'
    letterSpacing: '0'
  # The label tier. Weight and size carry it — NOT case, NOT tracking.
  label:
    fontFamily: 'Inter'
    fontSize: 10px
    fontWeight: '800'
    lineHeight: '1'
    letterSpacing: 0.16em
  label-ar:
    fontFamily: 'Cairo'
    fontSize: 11px
    fontWeight: '800'
    lineHeight: '1.35'
    letterSpacing: '0'
  # Numerals always render in Inter with tabular figures, in BOTH locales,
  # inside bidi isolation. There is no monospace family in this system.
  numeric:
    fontFamily: 'Inter'
    fontSize: 13px
    fontWeight: '500'
    lineHeight: '1'
    letterSpacing: '0'
  # Console pairing-code input. Six glyphs of {typography.player-code} would
  # overflow a 320px viewport, so the console has its own tier.
  code-console:
    fontFamily: 'Inter'
    fontSize: 32px
    fontWeight: '800'
    lineHeight: '1'
    letterSpacing: 0.14em
  # ── Player tiers, vmin. Never used in the console. ──
  player-code:
    fontFamily: 'Inter'
    fontSize: 5.2vmin
    fontWeight: '800'
    lineHeight: '1'
    letterSpacing: 0.1em
  player-headline:
    fontFamily: 'Inter'
    fontSize: 2.4vmin
    fontWeight: '800'
    lineHeight: '1.1'
    letterSpacing: -0.03em
  player-headline-ar:
    fontFamily: 'Cairo'
    fontSize: 2.4vmin
    fontWeight: '800'
    lineHeight: '1.45'
    letterSpacing: '0'
  player-body:
    fontFamily: 'Inter'
    fontSize: 1.4vmin
    fontWeight: '500'
    lineHeight: '1.5'
    letterSpacing: '0'
  player-body-ar:
    fontFamily: 'Cairo'
    fontSize: 1.5vmin
    fontWeight: '500'
    lineHeight: '1.7'
    letterSpacing: '0'
  player-label:
    fontFamily: 'Inter'
    fontSize: 1.0vmin
    fontWeight: '800'
    lineHeight: '1'
    letterSpacing: 0.18em
  player-label-ar:
    fontFamily: 'Cairo'
    fontSize: 1.1vmin
    fontWeight: '800'
    lineHeight: '1.35'
    letterSpacing: '0'
rounded:
  DEFAULT: 0px
  sm: 0px
  md: 0px
  lg: 0px
  xl: 0px
  # Reserved solely for the radio control, where a square reads as a checkbox
  # and therefore changes the control's meaning. Nothing else may use it.
  full: 9999px
spacing:
  # 4px base, shadcn/Tailwind numeric scale inherited unchanged. Every named
  # token below is a multiple of 4 and every component padding resolves to one
  # of them — nothing in this system is an arbitrary value.
  page-margin: 20px
  page-margin-narrow: 16px
  gutter: 16px
  row-pad-block: 16px
  row-pad-inline: 20px
  control-pad-block: 12px
  control-pad-inline: 16px
  tag-pad-block: 4px
  tag-pad-inline: 8px
  section-gap: 0px
  rule: 1px
  nav-rail: 192px
components:
  button-primary:
    background: '{colors.electric}'
    foreground: '{colors.electric-foreground}'
    radius: '{rounded.DEFAULT}'
    typography: '{typography.label}'
    padding: '{spacing.control-pad-block} {spacing.control-pad-inline}'
    border: 'none'
    minBlockSize: '44px'
  button-secondary:
    background: 'transparent'
    foreground: '{colors.foreground}'
    borderWidth: '{spacing.rule}'
    borderColor: '{colors.border}'
    radius: '{rounded.DEFAULT}'
    typography: '{typography.label}'
    padding: '{spacing.control-pad-block} {spacing.control-pad-inline}'
    minBlockSize: '44px'
  input:
    background: '{colors.background}'
    foreground: '{colors.foreground}'
    borderWidth: '{spacing.rule}'
    borderColor: '{colors.input}'
    radius: '{rounded.DEFAULT}'
    typography: '{typography.body}'
    padding: '{spacing.control-pad-block} {spacing.control-pad-inline}'
    minBlockSize: '44px'
  radio:
    radius: '{rounded.full}'
    borderWidth: '{spacing.rule}'
    borderColor: '{colors.input}'
    selectedFill: '{colors.foreground}'
    minBlockSize: '44px'
  focus-ring:
    outline: '2px solid {colors.electric}'
    outlineOffset: '2px'
    radius: '{rounded.DEFAULT}'
  focus-ring-on-signal:
    outline: '2px solid {colors.on-signal}'
    companion: '2px solid {colors.on-signal-companion}'
    outlineOffset: '0'
    radius: '{rounded.DEFAULT}'
    note: 'Double ring. Required on or adjacent to any signal fill, and wherever an element is flush to a region boundary.'
  screen-row:
    borderBlockEndWidth: '{spacing.rule}'
    borderBlockEndColor: '{colors.divider}'
    padding: '{spacing.row-pad-block} {spacing.row-pad-inline}'
    typography: '{typography.body}'
    minBlockSize: '48px'
    hoverBorderColor: '{colors.border}'
  screen-row-alarm:
    borderBlockStartWidth: '{spacing.rule}'
    borderBlockStartColor: '{colors.border}'
    borderBlockEndWidth: '{spacing.rule}'
    borderBlockEndColor: '{colors.border}'
    background: '{colors.background}'
  status-tag-live:
    background: 'transparent'
    foreground: '{colors.foreground}'
    borderWidth: '{spacing.rule}'
    borderColor: '{colors.muted-foreground}'
    typography: '{typography.label}'
    padding: '{spacing.tag-pad-block} {spacing.tag-pad-inline}'
    radius: '{rounded.DEFAULT}'
  status-tag-offline:
    background: '{colors.alarm}'
    foreground: '{colors.alarm-foreground}'
    border: 'none'
    typography: '{typography.label}'
    padding: '{spacing.tag-pad-block} {spacing.tag-pad-inline}'
    radius: '{rounded.DEFAULT}'
  status-tag-caveat:
    background: '{colors.amber}'
    foreground: '{colors.amber-foreground}'
    border: 'none'
    typography: '{typography.label}'
    padding: '{spacing.tag-pad-block} {spacing.tag-pad-inline}'
    radius: '{rounded.DEFAULT}'
  banner-alarm:
    background: '{colors.alarm}'
    foreground: '{colors.alarm-foreground}'
    linkForeground: '{colors.on-signal}'
    linkDecoration: 'underline 2px'
    focus: '{components.focus-ring-on-signal}'
    padding: '{spacing.control-pad-block} {spacing.row-pad-inline}'
    radius: '{rounded.DEFAULT}'
    typography: '{typography.body-sm}'
    inlineSize: 'full-bleed'
    position: 'static flow — never sticky'
  notice:
    background: '{colors.background}'
    foreground: '{colors.foreground}'
    borderWidth: '{spacing.rule}'
    borderColor: '{colors.border}'
    padding: '{spacing.control-pad-block} {spacing.row-pad-inline}'
    radius: '{rounded.DEFAULT}'
    typography: '{typography.body-sm}'
  group-header:
    borderBlockEndWidth: '{spacing.rule}'
    borderBlockEndColor: '{colors.border}'
    typography: '{typography.label}'
    foreground: '{colors.foreground}'
    padding: '8px {spacing.row-pad-inline}'
  nav-item:
    background: 'transparent'
    foreground: '{colors.foreground}'
    typography: '{typography.body-sm}'
    padding: '8px {spacing.control-pad-inline}'
    radius: '{rounded.DEFAULT}'
    minBlockSize: '44px'
  nav-item-active:
    background: '{colors.foreground}'
    foreground: '{colors.background}'
    fontWeight: '800'
  nav-sheet:
    background: '{colors.background}'
    borderWidth: '{spacing.rule}'
    borderColor: '{colors.border}'
    radius: '{rounded.DEFAULT}'
    inlineSize: 'full-bleed'
    scrim: '{colors.foreground}'
    scrimOpacity: '1'
  modal:
    background: '{colors.background}'
    borderWidth: '{spacing.rule}'
    borderColor: '{colors.border}'
    radius: '{rounded.DEFAULT}'
    padding: '{spacing.row-pad-inline}'
    scrim: '{colors.foreground}'
    scrimOpacity: '1'
  skeleton:
    background: 'transparent'
    borderBlockEndWidth: '{spacing.rule}'
    borderBlockEndColor: '{colors.divider}'
    minBlockSize: '48px'
    animation: 'none'
  storage-meter:
    trackBorderWidth: '{spacing.rule}'
    trackBorderColor: '{colors.border}'
    fill: '{colors.foreground}'
    blockSize: '8px'
    radius: '{rounded.DEFAULT}'
  upload-progress:
    trackBorderWidth: '{spacing.rule}'
    trackBorderColor: '{colors.border}'
    fill: '{colors.foreground}'
    blockSize: '4px'
    radius: '{rounded.DEFAULT}'
  media-thumbnail:
    inlineSize: '64px'
    blockSize: '64px'
    fit: 'cover, square-cropped'
    borderWidth: '{spacing.rule}'
    borderColor: '{colors.divider}'
    radius: '{rounded.DEFAULT}'
  holding-card-owner:
    background: '{colors.background}'
    foreground: '{colors.foreground}'
    borderWidth: '{spacing.rule}'
    borderColor: '{colors.border}'
    typography: '{typography.player-headline}'
    bodyTypography: '{typography.player-body}'
  holding-card-customer:
    background: '{colors.player-neutral-ground}'
    mark: '{colors.player-neutral-mark}'
    markSize: '2vmin'
    border: 'none'
    text: 'none — this card carries no text in any language'
  trial-badge:
    content: 'wordmark only — never plan, trial, or account wording'
    foreground: '#FFFFFF'
    typography: '{typography.player-label}'
    opacity: '0.3'
    maxAreaRatio: '0.02'
    marginZone: 'outer 10% of one corner'
    motion: 'none'
    mirrors: 'by grid alignment, never by insets'
---

# Lawha — Design Spine

Visual identity for Lawha. Owns *how it looks*; [EXPERIENCE.md](EXPERIENCE.md) owns *how it works* and references the tokens above by name. **Both spines win on conflict with any mock, wireframe, or import in this workspace** — stated once, here.

Two consumers, one token set:

- **`apps/console`** — Next.js + React, shadcn/ui on Tailwind. Modern CSS, no restrictions.
- **`apps/player`** — Preact, pinned to a **Chromium 76 / ES2019** floor (Tizen 6.0 televisions).

Every token above is expressible on both. That is why this system has no shadows, no gradients, no tints, and no fluid type. The Chromium 76 prohibitions are enumerated once, in *Do's and Don'ts*.

**`{typography}` and `{spacing}` inherit shadcn/Tailwind's scales; the component layer is a brand delta.** That stack is a **UX-originated claim**, not an inheritance: `ARCHITECTURE-SPINE.md` names no UI library, no Tailwind, and no token system. shadcn/Radix was chosen here because Radix supplies the RTL-aware primitive behaviour FR-47 needs and the keyboard/focus floor a consumer product needs, neither of which is worth hand-building solo. **Architecture owns the decision to accept or reject it** — see [EXPERIENCE.md § Open Items](EXPERIENCE.md#open-items).

## Brand & Style

Lawha looks like a printed sign, not like software pretending to be paper. Flat, square, high-contrast, structural. Rules and solid blocks do the work that cards, shadows, and rounded corners do elsewhere.

The posture comes from what the product is for. A signage tool's job is to tell an owner the truth about a wall he cannot see, so the visual system is built so that truth is the only thing on the page carrying colour. Everything working looks like nothing at all: black text, white ground, hairline dividers. Something wrong looks like a solid red block. There is no middle register — no soft warning wash, no amber gradient of concern.

This is a deliberate trade, and it has a cost the system pays elsewhere: a dashboard where health is invisible reads calm to a competent user and *blank* to a new one, so the escalation must be violent enough to compensate, and the quiet states must announce themselves to assistive technology even while staying silent visually ([EXPERIENCE.md § Accessibility Floor](EXPERIENCE.md#accessibility-floor)).

Restraint here means *fewer elements*, not *tighter composition*. Nothing is sized to fit a string, because Arabic runs 20–30% longer and both languages are first-class. Layouts reflow; they are never balanced by hand.

**Rendered reference:** [mockups/direction-signal.html](mockups/direction-signal.html) — the console Screens hero in light mode, its Arabic RTL mirror, the empty state, and both player registers. *Palette and layout reference only: it predates this spine's typography and signal-surface rules and deviates from them in five documented ways ([EXPERIENCE.md § Inspiration & Anti-patterns](EXPERIENCE.md#inspiration--anti-patterns)).*

## Colors

**`{colors.background}` / `{colors.foreground}`** — pure white and true black, 21:1. In dark mode the pair is `{colors.background-dark}` `#0A0A0A` and `{colors.foreground-dark}`, **19.8:1** — `#0A0A0A` rather than `#000000` so that a true-black holding card on a television still reads as a distinct surface.

**`{colors.muted-foreground}`** `#666666` — 5.74:1 on white. The only grey. If a value needs to be quieter than this, it does not belong on the surface.

**`{colors.border}`** — full-strength ink at `{spacing.rule}`. Structure is *visible* here, the inverse of most minimal systems. **`{colors.divider}`** `#DADADA` is 1.40:1 and is **decorative only** — it separates rows inside an already-bounded table and is never the only thing distinguishing two interactive targets. Where rows are themselves links, `{components.screen-row}` promotes its divider to `{colors.border}` on hover and focus-within, which is the inversion-consistent affordance this system has instead of shadow or radius.

**`{colors.electric}`** `#0F2BFF` — the only interactive colour. At 7.47:1 on white it doubles as text, which lets a link be a link without an underline **except on signal fills**. In dark mode it must become `{colors.electric-dark}` `#5C7CFF`: `#0F2BFF` on near-black is **2.65:1** and unreadable.

**`{colors.alarm}`** `#FF2D00` — offline, stopping, rejected. Always a solid fill, never a tint. **Text on it is black**: white on `#FF2D00` is 3.73:1 and fails AA; black is 5.63:1 and passes. Black ink on a red block is also more honest to this system.

**`{colors.amber}`** `#FFB800` — a caveat that is not a fault, reserved almost entirely for the best-effort device disclosure. Black text, 12.11:1. Note the asymmetry, which is by design: the amber *fill* is only 1.73:1 against white, so the caveat tag reads quieter than the alarm tag. Its black label carries the meaning; the fill carries the category.

### Signal surfaces are their own contrast world

The rule that `{colors.alarm}` and `{colors.amber}` never change between themes is right — a signal that shifts hue is a signal the owner must learn twice — but it collides with `{colors.electric}` being the one token that *must* shift. The collision lands on the loudest object in the product:

| Combination | Ratio | Consequence |
|---|---|---|
| `{colors.electric}` on `{colors.alarm}` | **2.00:1** | A link inside the alarm banner is unreadable |
| `{colors.electric-dark}` on `{colors.alarm}` | **1.03:1** | A dark-mode focus ring on the banner is *not rendered to the eye* |
| `{colors.electric-dark}` on `{colors.amber}` | **2.09:1** | Same failure adjacent to any caveat fill |

Hence **`{colors.on-signal}`** and **`{colors.on-signal-companion}`**, and `{components.focus-ring-on-signal}`: a double ring, black outer and white inner, at `outline-offset: 0`. Black is 5.63:1 on alarm and 12.11:1 on amber; white is 3.73:1 and 1.73:1 — so the *pair* always clears 3:1 against any ground, which neither colour does alone.

**Links on signal fills are underlined at 2px.** This is the one place the system accepts an underline, because it has spent every other differentiator: on a red fill there is no colour left to signify interactivity, and black-on-red link text is otherwise identical to black-on-red body text — a *worse* failure than the one 1.4.1 was written for.

## Typography

**Inter** (variable 100–900) for Latin, **Cairo** (variable 200–1000) for Arabic. Both self-hosted, subset, and precached as part of the application shell per AD-23 — never resolved from host fonts, never loaded as content. A player that loses its Arabic face when the network drops fails the Arabic test.

Cairo is chosen for one reason: this system's hierarchy is built from weight contrast, 800 against 500, and Cairo has the widest weight range available in Arabic. A family capping at 700 would compress the ramp and make Arabic read as a different product.

**Every tier has an `-ar` counterpart, and a Latin family never renders Arabic.** Inter has no Arabic coverage, so a missing counterpart is not a degradation — it is a host-font fallback, which is precisely the failure success criterion 3 is judged on. Arabic counterparts are Cairo, `letterSpacing: '0'` without exception, and a raised line-height, because Cairo's ascenders and descenders need the room and Arabic diacritics sit above the baseline.

**Console tiers are px; player tiers are `vmin`.** `clamp()` does not exist at the Chromium 76 floor, and `vmin` scales correctly across 720p, 1080p and 4K panels — a fixed 56px pairing code is 5.2% of viewport height at 1080p and 2.6% at 4K, where it is unreadable across a café. `{typography.player-*}` never appears in the console and `{typography.code-console}` never appears in the player.

**There is no monospace family.** Numerals render in `{typography.numeric}` — Inter with tabular figures — in *both* locales, wrapped in bidi isolation. Timestamps, screen counts, storage figures, and prices are Latin digits in an Arabic sentence and stay upright and LTR.

**The pairing code's alphabet is part of its specification.** `{typography.player-code}` is Inter 800 at 0.1em tracking, read at 2–4 metres and retyped on a phone — so the code alphabet **excludes `0 O 1 I L 5 S 2 Z 8 B`**. Tracking and size were chosen for cross-room legibility; the character set is what actually determines ambiguity, and Inter's zero is undotted by default.

**The label tier survives translation.** The small-caps furniture that carries much of this system's character is defined by **weight 800 at 10–11px**, in `{colors.muted-foreground}` unless the component names its own foreground. Two rules follow, and they are not stylistic:

1. **`text-transform: uppercase` is decorative and English-only.** Arabic has no case, so uppercase is a no-op on Arabic text and may not carry hierarchy.
2. **`letter-spacing` is `0` for Arabic at every tier.** Arabic is cursive; tracking breaks the joins between letters. `{typography.label}` carries 0.16em, `{typography.label-ar}` carries `0` and takes 1px of size and a taller line-height instead.

`{typography.body.fontWeight}` is 500, not 400 — slightly heavier than convention, which is part of the flat-poster register and what keeps 14px legible against 1px black rules.

## Layout & Spacing

4px base. Every named `{spacing}` token is a multiple of 4 and **every component padding resolves to one of them** — there are no arbitrary values in the component layer, so the inherited-scale claim is true rather than decorative.

`{spacing.section-gap}` is **0px**, and it is the most consequential value in this file. Sections do not float apart; they abut and are separated by a `{spacing.rule}` rule. Regions are edge-to-edge and full-bleed. This is what makes the system read as printed rather than assembled, and it is why the alarm banner can span the full content width without looking like a component that escaped its container.

It also creates the system's main hazard: a focus ring drawn 2px *outside* its element has nowhere to go. Where an element is flush to a region boundary, a signal fill, or the viewport edge, it uses `{components.focus-ring-on-signal}` at `outline-offset: 0` instead. **The indicator never depends on space this system does not have.**

**Direction.** Layout uses CSS logical properties and contains **no physical `left`/`right` layout property**, per FR-47's mechanical definition. Use the logical **longhands** (`margin-inline-start`, `padding-inline-end`, `border-block-end-width`, `min-block-size`) — the logical *border shorthands* (`border-inline-start`, `border-block-end`) shipped in Chrome 87, the same batch as the inset properties, and are silently dropped at the player's floor.

**Mirrored placement in the player is achieved by flow and alignment, never by insets.** `inset-inline-*` shipped in Chrome 87 and does not exist at Chromium 76. The FR-81 trial badge sits in a grid cell with `justify-items: end` and `align-items: end` — box-alignment values that have been flow-relative since Chrome 57. `align-items` is block-axis and therefore *not* direction-sensitive, which is exactly right for a corner badge: bottom stays bottom, the inline edge mirrors. FR-47 is satisfied literally, with no physical property and no `[dir]`-scoped exemption. **This is committed, not proposed.**

**Breakpoints** — genuinely responsive, no primacy.

| Range | Margin | Structure |
|---|---|---|
| < 640px | `{spacing.page-margin-narrow}` | Single column. Navigation collapses to `{components.nav-sheet}`. Rows become stacked blocks, full-bleed to the viewport edge with no inline margin. |
| 640–1023px | `{spacing.page-margin}` | Single column; secondary columns wrap to a second line within the row. |
| ≥ 1024px | `{spacing.page-margin}` | Persistent `{spacing.nav-rail}` navigation rail, full row grid. |

Zero radius is what makes the narrow breakpoint work: a squared block runs to the viewport edge and still looks intentional, where a rounded card must be inset. Below 640px the system gets *more* edge-to-edge, not less.

**Reflow is achieved by source order and auto-placement only.** No `order`, no `row-reverse` / `column-reverse`, no `grid-template-areas`, and no explicit grid-line placement in any component containing more than one focusable element. This is the mechanical form of "tab order equals visual order", it is lintable, and the 640–1023px column-wrap rule is exactly where the tempting implementation would break it — invisibly, and doubly so in RTL.

## Elevation & Depth

**There is none.** No `box-shadow`, no `filter: drop-shadow`, no gradient, no blur, no tonal layering.

**One documented translucency exception exists in the entire system:** `{components.trial-badge}` at `opacity: 0.3`, mandated by FR-80 as a reduced-opacity signature. It is enumerated here rather than left as a contradiction. Nothing else in either app may be translucent — scrims included, which is why `{components.modal}` and `{components.nav-sheet}` specify `scrimOpacity: 1`.

Depth, where genuinely needed, is expressed by **inversion**: an active nav item is `{colors.foreground}` ground with `{colors.background}` text. A modal is a full-bleed white region with a 1px black border over an opaque `{colors.foreground}` scrim — not a 50% wash.

This is what makes the same visual language render identically on Chromium 76 and current Chrome, and why dark mode required no palette re-tuning.

## Shapes

`{rounded.DEFAULT}` is **0px** and every scale step is 0px. Buttons, inputs, tags, banners, modals, images, thumbnails, avatars, meters: square.

`{rounded.full}` exists for exactly one control — `{components.radio}`, where a square reads as a checkbox and therefore changes the control's meaning. Any other use is a bug.

`{components.media-thumbnail}` is square-cropped rather than rounded or letterboxed.

## Components

| Component | Anatomy and visual rules |
|---|---|
| `{components.screen-row}` | The console's primary unit. 48px min, four columns at ≥1024px: name (`{typography.body}` at 700), playlist (`{colors.muted-foreground}`), last-confirmed time (`{typography.numeric}`), status tag. Divider promotes to `{colors.border}` on hover and focus-within — the row is a link and needs a non-colour affordance in a system with no motion or radius. |
| `{components.screen-row-alarm}` | Background does **not** tint. The row gains full-strength `{colors.border}` rules above and below, promoting out of the divider tier into the structural one, and expands to carry a full sentence. Weight comes from structure, not a wash. |
| `{components.status-tag-live}` | Outlined at `{colors.muted-foreground}` (5.74:1, not the 1.40:1 divider — at that value the outline vanishes for a low-vision user and the three-tag scale collapses to two blocks and a run of text). Colourless by design. |
| `{components.status-tag-offline}` / `{components.status-tag-caveat}` | Solid `{colors.alarm}` / `{colors.amber}` blocks with black labels. A healthy screen's tag carries no colour, which is what makes these two impossible to overlook. |
| `{components.banner-alarm}` | Full-bleed, solid `{colors.alarm}`, black text, no icon, no dismiss control, **static flow — never sticky** (a sticky banner would obscure focus on anything scrolled beneath it). Its link is `{colors.on-signal}` with a 2px underline and `{components.focus-ring-on-signal}`. The loudest object the system can produce. |
| `{components.notice}` | The quiet counterpart: 1px black border, no fill. Carries rollback messages, partial-load statements, and console-offline warnings — anything that must be seen without being an alarm. |
| `{components.group-header}` | Branch name in the label tier over a 1px black rule, with the FR-76 health summary inline-end. |
| `{components.nav-item}` / `{components.nav-item-active}` | Rail items ≥1024px. Active state is inversion — `{colors.foreground}` ground, `{colors.background}` text, weight 800. Rail width is `{spacing.nav-rail}`, set by the longer of the two languages. |
| `{components.nav-sheet}` | Below 640px. Full-bleed, 1px black border, opaque `{colors.foreground}` scrim. |
| `{components.modal}` | Destructive confirmations and the pairing flow. Full-bleed white region, 1px black border, opaque scrim. Square. |
| `{components.skeleton}` | Occupies final dimensions so layout never shifts. A divider-separated block of the correct height. `animation: none` — there is no shimmer, because the system has no gradients. |
| `{components.button-primary}` / `{components.button-secondary}` | Solid `{colors.electric}` with white label-tier text, or transparent with a 1px black border. Both 44px min. There is no ghost button, no link-styled button, and no icon-only button carrying a primary action. |
| `{components.input}` | 1px `{colors.input}` border at full strength — inputs are UI components and their boundary is load-bearing, so the divider tier is never used here. `{typography.body}`, 44px min, square. |
| `{components.radio}` | The single `{rounded.full}` control. Selected state is a solid `{colors.foreground}` fill, not a tint. |
| `{components.focus-ring}` | 2px solid `{colors.electric}` at 2px offset, square. On a system with no shadows, radius, or transitions this is the only visual affordance that moves, so it is never suppressed and never replaced by a background change. |
| `{components.focus-ring-on-signal}` | Double ring, `{colors.on-signal}` outer and `{colors.on-signal-companion}` inner, `outline-offset: 0`. Required on or adjacent to any signal fill and wherever an element is flush to a boundary. |
| `{components.storage-meter}` / `{components.upload-progress}` | 1px-bordered rectangles with solid fills, never pills. Always accompanied by an absolute figure, never a bare percentage. |
| `{components.media-thumbnail}` | 64px square, cover-cropped, `{colors.divider}` border. |
| `{components.holding-card-owner}` | Pairing and nothing-to-play. White ground, black text, branded, instructional, `{typography.player-*}` tiers. Audience: the owner standing in front of the TV. |
| `{components.holding-card-customer}` | Subscription stopped and between-windows. `{colors.player-neutral-ground}` with a single `{colors.player-neutral-mark}` mark at `2vmin` — **3.61:1, not the 1.38:1 divider**, because on a real TV with ambient light an invisible mark reads as a dead television, which is the exact embarrassment the two-register decision exists to avoid. No text, in any language. These are **player neutrals, not theme tokens**: the player has no theme and a naive `X → X-dark` substitution must not reach them. |
| `{components.trial-badge}` | **The wordmark only** — never plan, trial, or account wording. White at 0.3 opacity, `{typography.player-label}`, ≤2% of screen area, wholly inside the outer 10% margin of one corner, mirrored by grid alignment, never animated. As a logotype it carries no state, so its contrast is not a content question; trial status is communicated in the console in words, never by the badge's presence alone. |
| Player item transition | The one motion in the product: a ~200ms opacity cross-fade between playlist items, on two already-decoded elements, inside FR-10's one-item-ahead allowance. Degrades to a hard cut on video-to-video, under memory pressure (NFR-6 outranks it), and when the manifest carries a reduced-motion flag. Compositor-driven and safe at the Chromium 76 floor. |

## Do's and Don'ts

**Do**

- Put black text on every coloured fill. `{colors.electric}` is the sole fill that takes white.
- Use `{components.focus-ring-on-signal}` on or adjacent to any signal fill, and wherever an element is flush to a region boundary.
- Underline links on signal fills at 2px.
- Separate regions with a `{spacing.rule}` `{colors.border}` rule and `{spacing.section-gap}` of 0.
- Let regions run full-bleed to the viewport edge below 640px.
- Render numerals in `{typography.numeric}` inside bidi isolation, in both locales.
- Pair every Latin type tier with its `-ar` counterpart; use `vmin` tiers in the player and px tiers in the console.
- Define every new hierarchy level by weight and size, so it survives translation into Arabic.
- Express state change by inversion, or by promoting a divider to a border.
- Resolve every `{colors.X}` in a component to `{colors.X-dark}` in dark mode — except `alarm`, `amber`, `on-signal` and their pairs, which are theme-invariant, and the `player-neutral-*` tokens, which are not theme tokens at all.

**Don't**

- Don't add a `box-shadow`, gradient, blur, or translucency. The single exception is `{components.trial-badge}`, enumerated in *Elevation & Depth*.
- Don't set a non-zero `border-radius` on anything but `{components.radio}`.
- Don't tint a background to indicate state. Tints are how this system's escalation gets missed.
- Don't use `text-transform: uppercase` or `letter-spacing` to carry meaning — Arabic has no case, and tracking breaks its cursive joins.
- Don't use `{colors.amber}` as a text colour; it is 1.73:1 on white.
- Don't let `{colors.divider}` be the only boundary between two interactive targets.
- Don't introduce a second grey.
- Don't render Arabic in a Latin family, ever.
- Don't make `{components.banner-alarm}` sticky or dismissible.
- Don't use `order`, `row-reverse`, `column-reverse`, `grid-template-areas`, or explicit grid-line placement in any component with more than one focusable element.
- Don't give a text container a fixed width or height (FR-48). Use `min-block-size`, never `block-size`, so a user stylesheet applying `letter-spacing: 0.12em` cannot clip it.
- Don't put a green dot, a checkmark, or any affirmative colour on a healthy screen. Health is the absence of *visual* signal — never the absence of an accessible one.
- **Chromium 76 floor — never in the player or in shared code:** `clamp()`, `min()`, `max()`, flexbox `gap` (grid `gap` is fine, Chrome 66), `aspect-ratio`, `:has()`, container queries, `oklch`, `color-mix`, `inset-inline-*`, and the logical border *shorthands*.
