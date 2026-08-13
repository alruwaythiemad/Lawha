---
title: "Addendum — Lawha product brief"
status: draft
created: 2026-08-11
updated: 2026-08-11
---

# Addendum

Depth that earned a place but does not belong in a two-page brief. Feed this to the PRD and architecture workflows.

## Competitive landscape (researched 2026-08-11)

### Juuno — the reference product

| Plan | Price | Contents |
|---|---|---|
| Business | $5/screen/mo | Unlimited users, playlists, scheduling, zones, overlays, white-label player |
| Growth | $9/screen/mo | + sequences, proof-of-play, advanced roles, API, priority support, remote device management |
| White Label | $100/mo flat | 20 screens included, +$5/screen after; custom domain, full de-branding, feature toggles |

- **Team:** same crew that built frill.co. Repeat SaaS operators.
- **Distribution history:** AppSumo lifetime deal at ~$19 seeded the early base. Now closed.
- **Devices:** Amazon Signage Stick, Fire TV Stick, Chromecast, Raspberry Pi, Android app, browser (standard + TV-optimised), any smart TV with a browser.
- **Apps (~25):** Canva, Instagram, Facebook, YouTube, Google Reviews, Drive/Sheets/Slides/Docs, MS Office, X, NYT, The Guardian, Bible Verses, AI Quiz, PDF, slideshows, announcements.
- **Ratings:** Capterra 5.0/5 (40 reviews; 39 five-star), Trustpilot 4.6/5.
- **Reviewer base:** 100% small business — marketing/advertising 24%, education 12%, computer security 8%.
- **Named logos:** YMCA, Target, Leica Biosystems, Victoria University of Wellington, Social Soup, Futuretheory, Bondi Gym.
- **Reseller economics (Juuno's published examples):** Hexx Design 75% margin at $20/screen flat; Cossin Media 67–80% on $15/$20/$25 tiers — ~$400/mo margin on 20 screens.

**Documented weaknesses, from Juuno's own reviewers:** limited template and animation customisation; no layout flexibility; video files over 1GB cause problems; **no documentation, FAQs, or video guides** (support quality is compensating for this); no tablet/mobile admin app; white-label tier considered expensive; requests for fuller white-label and more widgets.

### The field

| Tier | Platform | $/screen/mo | Position |
|---|---|---|---|
| Budget | Xibo | 3.50 | Open source, self-host |
| Budget | **Juuno** | **5** | Simplicity, flat pricing, SMB + reseller |
| Budget | QuickESign | 6 | Cost-conscious, streaming sticks |
| Budget | Yodeck | 8 (free 1 screen) | Free Raspberry Pi on annual; hobbyist/Pi |
| Mid | TelemetryTV | 8+ | Kiosk mode, dashboards |
| Mid | OptiSigns | 10 | 160+ apps, 4,000+ templates, AI content |
| Mid | Rise Vision | 11 | K-12, free for qualifying schools |
| Mid | Look | 13.50 | Figma-level design control |
| Mid | NoviSign | 18 | **Arabic interface support**, template-heavy |
| Mid | OnSign TV | 19.99 | Native Tizen / webOS fleets |
| Enterprise | ScreenCloud | 20 | Salesforce/Workday dashboards |
| Enterprise | Viewneo | 21 | EU, GDPR-first |
| Enterprise | truDigital | 29 + $150 setup | Hospitality/franchise, rep support |
| Enterprise | Scala, Spectrio, Userful, SkyKit, Fugo | custom / $20–30+ | Managed service, video walls, BI dashboards |

**Category complaints (from Juuno's own 20-tool comparison):** 7 of 20 vendors hide pricing behind a sales call; buyers pay for unused bundles; hardware lock-in; unnecessary complexity when "94% of businesses lead with static images"; "AI in signage is mostly an upsell: a tier bump, an add-on, or a meter."

**Market size:** signage software ~$14.13B (2024) → ~$40.96B (2032) at ~15.7% CAGR; alternate estimate $22.76B by 2030 at 12.3%. Overall signage market (hardware inclusive) ~$30B in 2026 at ~8% CAGR. The software segment grows roughly twice as fast as the hardware-inclusive market. *Use with caution — vendor-published figures, wide variance between sources.*

## The MENA / Arabic opening

**The gap in one line:** the $3.50–10 self-serve tier is English-first; the vendors that serve Arabic properly are $18–30+ or project-based.

- PosterBooking offers full Arabic UI and RTL alignment — the nearest thing to a direct competitor on this thesis. Deployed across 60 displays at Dubai Mall's Hospitality Hub running Arabic/English/Russian loops. **Study this one closely.**
- NoviSign has Arabic interface support at $18/screen.
- Scala powers 1,200+ signage nodes across UAE/KSA, ~15% of GCC enterprise CMS deployments — e.g. Dr. Sulaiman Al-Habib Medical Group via COMM-IT.
- Regional systems integrators (FAMA Technologies, COMM-IT, Spectrawave, Dream & Reality) sell projects and installation, not self-serve SaaS.
- Bilingual Arabic/English is a **default expectation** in Saudi deployments and carries local media-regulation implications worth checking before selling into KSA.

## RTL and Arabic — engineering notes

Feed directly into architecture. These are the details that separate real bilingual support from a locale file.

- **UTF-8 throughout**, no exceptions in the storage or rendering path.
- **Bidirectional rendering.** Mixed Arabic/Latin runs — prices, brand names, phone numbers, units — must place correctly. This is where cheap tools visibly fail. Unicode Bidi Algorithm, with explicit isolate marks around embedded LTR runs.
- **Text expansion of 20–30%.** Arabic renders longer than equivalent English. Layouts must reflow, not clip. Fixed-height text boxes are a bug.
- **Font bundling.** Arabic display typefaces must ship with the player, not be resolved from the host OS — a cheap Android stick's fallback font is what makes signage look broken. Vertical metrics and diacritic clearance differ from Latin fonts; test at viewing distance, not at desk distance.
- **RTL admin UI.** Full layout mirroring — navigation, icons, progress direction, form alignment — not just text alignment.
- **Hijri calendar and local working week** for scheduling. The Gulf working week is not Monday–Friday.

## Player failure modes — the thirty-second crash

Catalogued from the prior attempt (July 2026) so they become test cases:

- Android WebView / kiosk app killed by the OS lifecycle on losing foreground
- No wake-lock → device sleeps or screensaver takes the display
- Chromecast receiver session timeout on idle
- OOM-killer on low-memory sticks
- No watchdog and no auto-restart → the first crash is permanent

**Design response:** watchdog + supervised restart, boot-launch, wake-lock, foreground service, memory ceiling on media decode, and a heartbeat so silent death is visible in the dashboard. Every item on this list becomes an explicit acceptance test.

## Deferred, with rationale

| Deferred | Why it is out of v1 | Why it still matters |
|---|---|---|
| Multi-tenant agency workspaces | Doubles auth and data-model complexity before a single customer exists | Proven revenue tier — **build workspace boundaries into the schema now even while shipping single-workspace** |
| White-label reseller tier | Requires custom domains, de-branded player builds, billing | Juuno's is $100/mo flat with 40–80% partner margins; a natural second act |
| App/overlay library | 25 integrations is a multi-month surface; OptiSigns has 160+ | Cannot win on count — pick a handful that matter to the target vertical |
| Template / WYSIWYG editor | Deep design surface, and Juuno's weakest area | An eventual differentiator, especially with real Arabic typography |
| Proof-of-play, API, roles | Juuno gates these at $9 — they are upsell, not entry | The obvious paid-tier shape later |
| Multi-device support | Each platform is its own reliability problem | Expand only after one platform passes the fourteen-day test |
| Documentation | — | Juuno's clearest weakness. Cheap to beat and it reduces support load from day one |

## Open questions

Unanswered by explicit decision; resolve before or during PRD.

1. Launch geography — which market first.
2. First customer and channel. *The load-bearing unknown.*
3. Target device for v1 (assumed: Android HDMI stick).
4. Hours per week, runway, and budget.
5. Pricing — $5/screen assumed by analogy, not validated for the target market.
6. Product name.
