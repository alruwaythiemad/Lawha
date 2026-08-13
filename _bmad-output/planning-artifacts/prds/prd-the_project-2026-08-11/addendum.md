---
title: "Addendum — Lawha PRD"
status: final
created: 2026-08-11
updated: 2026-08-11
---

# Addendum

Depth that belongs downstream (architecture, solution design, UX spec) rather than in the PRD's requirement narrative. Carried forward from the product brief addendum plus decisions made during PRD discovery.

## Platform and service decisions (PRD discovery, 2026-08-11)

**Posture: buy over build.** Solo build; every service that can be rented instead of owned should be. Named selections:

| Concern | Service | Notes for architecture |
|---|---|---|
| Authentication / registration | Clerk | Verify Arabic/RTL support in hosted UI components — if the sign-in surface is English-only or LTR-locked, it contradicts the product's core position. |
| Database | Supabase | Postgres. Multi-workspace boundaries belong in the schema from the first migration even while v1 ships single-workspace (carried from brief addendum). Row-level security is the natural fit for workspace isolation. Realtime channels are a candidate transport for screen heartbeat / content-change push — mechanism decision deferred to architecture. |
| Payments / subscription billing | Merchant of Record (vendor TBD), behind a provider abstraction | Stripe is unavailable to a Saudi-resident seller — verified 2026-08-11 against stripe.com/global; the UAE is Stripe's only Middle East country. An MoR sidesteps this without forming a foreign entity. See "Money rail" below. |
| Personal data residency | Follows the customer, not the builder | With Western customers, GDPR/UK-GDPR govern rather than Saudi PDPL — so EU/UK region selection in Supabase and Clerk, and a DPA with each. The parked PDPL notes below become live only on entering the Gulf. |
| Media storage / delivery | Undecided | Supabase Storage is the path of least resistance given the database choice; object storage + CDN is the alternative. Cost model matters — video bandwidth against a ~$5/screen price is a named risk in the brief. |

### Money rail — RESOLVED (2026-08-11)

**Decision: Merchant of Record now, revisit a US entity when revenue justifies the admin.**

Context that produced it: the builder is resident in Medina, Saudi Arabia, but sells first to Western/English-speaking customers online. That combination breaks Stripe from the *seller* side rather than the buyer side — Stripe requires a business in a supported country, and KSA is not one. The two escape routes are a foreign entity or a Merchant of Record.

| Route | Setup | Ongoing burden | Fees |
|---|---|---|---|
| **Merchant of Record** (chosen) | Sign up, ship | None — the MoR is the legal seller and files EU VAT and US sales tax itself | ~5% + fixed |
| US LLC via Stripe Atlas | ~$500 formation + registered agent | US federal and state filings annually, forever; builder personally owns EU VAT registration and US economic-nexus tracking | ~2.9% + 30¢ |

MoR candidates: Paddle, Polar, Lemon Squeezy, Dodo Payments. **Vendor not yet selected — verify Saudi Arabia payout support before committing**, as coverage varies by provider (Lemon Squeezy banks to roughly 79 countries; others differ).

Consequences:

- **In-app billing scope shrinks.** The MoR owns subscription lifecycle, dunning, retries, invoicing and tax. What remains in the product: plan selection, entitlement and screen-count enforcement, and webhook reconciliation against the MoR's subscription state.
- **The provider abstraction is now load-bearing, not speculative.** Three rails are genuinely in play across the roadmap — MoR today, Stripe if a US entity is formed, Moyasar if the Gulf market is entered. The earlier concern about building an abstraction before revenue is withdrawn.

### Clerk Arabic/RTL status (researched 2026-08-11)

- `@clerk/localizations` ships predefined translations for 30+ languages **including Arabic** — but Clerk officially maintains only `en-US`; every other locale is community-contributed. Arabic translation quality is therefore not guaranteed and needs review by a native speaker before it fronts the product.
- **RTL layout support is not documented.** Localization is described as experimental and scoped to strings, not layout direction. Mirroring Clerk's components likely requires custom CSS and `dir="rtl"` handling on top of the package.
- **Assessment:** Clerk is usable but not free here. The sign-in screen is the first Arabic surface a user meets; shipping a community-translated, LTR-laid-out auth form in front of a product whose entire position is "Arabic done properly" is a self-inflicted wound. Budget the customization work or evaluate alternatives.

**Player platform sequencing (changed from brief).** V1 player is browser-based; a native Android app for screens is a later phase. This reverses the brief's `[ASSUMPTION]` that v1 targets an Android HDMI stick with the browser used only for testing.

Consequences to work through in architecture:

- A browser player still has to satisfy every non-negotiable player behaviour (never stays dead, survives network loss, survives power loss, holds the screen, reports in) — the delivery vehicle changed, the reliability bar did not.
- Browser-side mechanisms available: Service Worker + Cache Storage for offline media, Wake Lock API for display hold, `visibilitychange` / reload-on-error for self-recovery, IndexedDB for playlist state. Each has gaps versus a native app — Wake Lock support on TV browsers is uneven, and nothing in a browser survives a device cold boot without OS-level autostart.
- The cold-boot problem is the one a browser cannot solve alone: something outside the page must launch the browser and navigate to the player URL after power returns. Kiosk-mode browser configuration, a TV's built-in autostart, or a small launcher shim are the candidate answers. This is the single largest technical open question created by the browser-first decision.

## Media ceilings — derivation (set 2026-08-11)

Limits set on delegated authority rather than guessed. Three constraints converge:

**1. What signage content actually is.** Industry practice puts promotional clips at 15–30 seconds, 60 seconds as a practical maximum, and a full loop at 2–4 minutes. 1080p signage encodes at 8–12 Mbps (15 Mbps ceiling), H.264 in an MP4 container being the universally supported combination.

- 30 s @ 12 Mbps ≈ **45 MB**
- 60 s @ 12 Mbps ≈ **90 MB**
- 60 s @ 8 Mbps ≈ **60 MB**

**2. Browser storage quota on cheap hardware.** The browser player caches media in Cache Storage / IndexedDB, which is quota-governed rather than unlimited. Chrome allows an origin up to ~60% of free disk; Firefox the lesser of 10% of disk or 10 GiB; Safari starts near 1 GB and prompts for more. On a cheap HDMI stick with 8 GB total and perhaps 2–4 GB free, a realistic per-origin budget is roughly 1–2 GB. A 2–4 minute 1080p loop lands at 150–350 MB, which fits comfortably — but only if individual files stay modest.

**3. Bandwidth cost against a low flat per-screen price.** Named in the brief as a live risk. Every megabyte of ceiling is a megabyte that can be re-fetched on every cache miss across every screen.

**Resulting limits:**

| Limit | Value | Reasoning |
|---|---|---|
| Video, per file | **150 MB** | Covers 60 s of high-quality 1080p (~90 MB) with real headroom. Far below the ~1 GB point where comparable products are reported to break. |
| Image, per file | **15 MB** | Generous for any 1080p or 4K still; a well-prepared signage image is a fraction of it. |
| Guaranteed format | **MP4 / H.264** | The one combination that plays everywhere. Others may be accepted but are not guaranteed. |
| Per-screen cache budget | **~1 GB target** | The player should query `navigator.storage.estimate()` and degrade predictably rather than assume space exists. |

**Deliberately excluded: 4K video.** 60 s of 4K at 25 Mbps is ~190 MB, over the ceiling — and cheap sticks decode 4K unreliably, which collides directly with the memory-pressure requirement. Restricting to 1080p is a reliability decision, not only a cost one. Revisit when the device matrix is defined.

## Competitive landscape (researched 2026-08-11, carried from brief addendum)

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

### Juuno observed first-hand (trial account, screenshots 2026-08-10)

Direct evidence from running the competitor, not review-derived. More reliable than the Capterra summary above, and a legitimate source of requirements.

**1. Subscription lapse stops the screens.** On `/screens/all`, both screens (`labtup`, `Phone`) show red offline indicators while listing "Playing GymClub." Confirmed by the account holder: **the trial had expired, so the screens were shut off.** The "Playing" label names the *assigned* playlist, not a live-playback claim — the dashboard is behaving correctly, not lying.

*An earlier reading of this screenshot as a state-reporting defect was wrong and has been withdrawn from the PRD.*

What it does establish is category precedent for an open product decision: **Juuno's answer to subscription lapse is that the screens stop playing.** Directly relevant to FR-63, where Lawha's own lapse behaviour is still undecided. Worth weighing carefully — a café whose menu board goes black over a failed card payment experiences that as the product breaking, and the resulting support contact lands on a solo founder.

**2. Sidebar layout breaks.** The "Juuno quick start guide" promo video card overlaps and obscures navigation items — "Media Library" is partially hidden behind it, and at least one item above it is clipped. A promo widget occluding primary navigation in a paid product.

**3. Settings tab row overflows.** On `/settings/workspaces`, the tab row (Profile · Company · Workspaces · Team · Billing · Social Connections · Integrations · White Label) breaks down: "Social Connections" wraps to two lines and "White Label" is clipped at the viewport edge. Relevant beyond cosmetics — a nav row that cannot survive its own English labels will certainly not survive Arabic labels running 20–30% longer. Evidence that horizontal tab rows are the wrong pattern for a bilingual product.

**4. Juuno does not support Arabic — confirmed by the account holder.** A language selector exists (`EN ˅`) but Arabic is not among its options, and the Arabic workspace name (`لا يوجد`) renders inside an unmirrored LTR layout. The bilingual capability is therefore a genuine *absence* in the reference competitor, not merely a depth advantage over a shallow translation. This is the strongest surviving support for the brief's original wedge — though it applies to Arabic-market buyers, who are explicitly not the first customers.

**5. Trial expiry degrades the product rather than gating cleanly.** The "Your trial period has ended / Upgrade Now" banner occupies permanent sidebar space, and Analytics sits visibly behind it. Worth a deliberate decision about how Lawha handles expiry — particularly since a signage product's expiry question is *"does the screen keep playing?"*, which is a much sharper question than a normal SaaS paywall.

**6. Confirmed as real, not marketing:** screen allocation is a purchased quantity (Total 20 / Allocated 5 / In Use 2, with "Buy Screens"), workspaces exist as a first-class concept, and White Label is a settings tab in the shipping product.

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

## RTL and Arabic — engineering notes

Feed directly into architecture. These are the details that separate real bilingual support from a locale file.

- **UTF-8 throughout**, no exceptions in the storage or rendering path.
- **Bidirectional rendering.** Mixed Arabic/Latin runs — prices, brand names, phone numbers, units — must place correctly. This is where cheap tools visibly fail. Unicode Bidi Algorithm, with explicit isolate marks around embedded LTR runs.
- **Text expansion of 20–30%.** Arabic renders longer than equivalent English. Layouts must reflow, not clip. Fixed-height text boxes are a bug.
- **Font bundling.** Arabic display typefaces must ship with the player, not be resolved from the host OS — a cheap Android stick's fallback font is what makes signage look broken. Vertical metrics and diacritic clearance differ from Latin fonts; test at viewing distance, not at desk distance. *Browser-first note: this becomes web-font delivery that must also work from the offline cache — a player that loses its Arabic font when the network drops fails the Arabic test in exactly the way the product exists to prevent.*
- **RTL admin UI.** Full layout mirroring — navigation, icons, progress direction, form alignment — not just text alignment. *Includes third-party embedded surfaces: Clerk's auth components and Stripe's checkout must not break the mirror.*
- **Local working week** for scheduling. The Gulf working week is not Monday–Friday. *Hijri calendar display was withdrawn from v1 during architecture (2026-08-11) — see the note under PRD Group E. It remains a candidate for a Gulf motion, where architecture makes it a presentation change rather than a scheduling one.*

## Player failure modes — the thirty-second crash

Catalogued from the prior attempt (July 2026) so they become test cases:

- Android WebView / kiosk app killed by the OS lifecycle on losing foreground
- No wake-lock → device sleeps or screensaver takes the display
- Chromecast receiver session timeout on idle
- OOM-killer on low-memory sticks
- No watchdog and no auto-restart → the first crash is permanent

**Design response:** watchdog + supervised restart, boot-launch, wake-lock, foreground service, memory ceiling on media decode, and a heartbeat so silent death is visible in the dashboard. Every item on this list becomes an explicit acceptance test. *Browser-first note: several of these responses assumed a native process. The browser equivalents — and the gaps with no browser equivalent — are worked in the platform section above.*

## Deferred — why each still matters

Why each is out of v1 now lives in PRD § 4.2 and § 11; only the forward-looking half is kept here, because that reasoning exists nowhere else.

| Deferred | Why it still matters |
|---|---|
| Native Android player app | The only way to close the cold-boot and OS-lifecycle gaps properly; the natural second platform |
| Roles and permissions | The first thing a real multi-branch customer will ask for |
| Multi-tenant agency workspaces | Proven revenue tier — **build workspace boundaries into the schema now even while shipping single-workspace** |
| White-label reseller tier | Juuno's is $100/mo flat with 40–80% partner margins; a natural second act |
| App/overlay library | Cannot win on count — pick a handful that matter to the target vertical |
| Template / WYSIWYG editor | An eventual differentiator, especially with real Arabic typography |
| Proof-of-play, API | Juuno gates these at $9 — the obvious paid-tier shape later |

## Parked — the Gulf market

None of this binds v1, which sells to Western, English-speaking customers. It is retained in full because the Gulf remains on the roadmap and every finding here becomes live the moment that changes. Two caveats keep it closer than "someday": the builder operates from inside Saudi Arabia, and the bilingual capability shipping in v1 is aimed squarely at this market. **Re-read this section before the first Gulf customer, not after.**

### The MENA / Arabic opening

**The gap in one line:** the $3.50–10 self-serve tier is English-first; the vendors that serve Arabic properly are $18–30+ or project-based.

- PosterBooking offers full Arabic UI and RTL alignment — the nearest thing to a direct competitor on this thesis. Deployed across 60 displays at Dubai Mall's Hospitality Hub running Arabic/English/Russian loops. **Study this one closely.**
- NoviSign has Arabic interface support at $18/screen.
- Scala powers 1,200+ signage nodes across UAE/KSA, ~15% of GCC enterprise CMS deployments — e.g. Dr. Sulaiman Al-Habib Medical Group via COMM-IT.
- Regional systems integrators (FAMA Technologies, COMM-IT, Spectrawave, Dream & Reality) sell projects and installation, not self-serve SaaS.
- Bilingual Arabic/English is a **default expectation** in Saudi deployments and carries local media-regulation implications worth checking before selling into KSA.

### Gulf payment rail — parked, not discarded

The research below was produced while launch geography was briefly set to Saudi Arabia. It does **not** bind v1, because v1 sells to Western customers. It is retained because selling into the Gulf remains on the roadmap, and every finding here becomes live again the moment that happens.

Findings:

- **Stripe does not operate in Saudi Arabia.** Verified against Stripe's own availability page: 44 supported countries, the UAE the only Middle Eastern one. India and Indonesia are the sole "preview" entries; there is no KSA preview or invite programme listed.
- **mada is the card network that matters in KSA.** The national debit scheme carries the majority of domestic card transactions. A Saudi small-business owner paying ~19 SAR/month is overwhelmingly likely to present a mada card. Stripe does not acquire mada regardless of merchant entity — so even routing through a foreign entity does not solve the acceptance problem, only the incorporation one.
- **Local gateways with direct mada connectivity and SAMA licences:** Moyasar (Saudi-native, publicly listed mada pricing around 2.5%, T+1 mada settlement, developer-oriented API and docs — the closest analogue to Stripe's self-serve DX), Tap Payments (strongest for cross-border/multi-market operations), HyperPay (enterprise SDKs, T+1–T+2 settlement), PayTabs. Vendor-published figures; verify current rates directly.
- **Consequence for the product:** subscription lifecycle (trials, proration, dunning, retries, invoicing) is something Stripe Billing provides and local gateways largely do not to the same depth. Choosing a local rail likely means owning more subscription logic than the buy-over-build posture wants. This is the real cost of the KSA choice, and it should be priced deliberately rather than discovered mid-build.

### Saudi regulatory surface (researched 2026-08-11)

**Not binding on v1** now that the sales motion is Western-first. Two caveats keep it relevant rather than archived: the builder operates from within the Kingdom, and the Gulf is a roadmap market. Re-read this section before the first Saudi customer, not after.

- **PDPL (Personal Data Protection Law), enforced since 14 Sept 2024.** Personal data of Saudi residents must remain in the Kingdom by default; cross-border transfer requires a specific "equivalent protection" mechanism. SDAIA enforcement is live — 48 violation decisions issued across 2025–26, covering processing without valid legal basis, unauthorised disclosure, inadequate technical safeguards, and marketing without consent. Fines reach SAR 5,000,000 per violation. The law is extraterritorial: a foreign SaaS processing a Saudi resident's personal data is bound by it.
  - **Direct hit on the stack.** Both Supabase (account and screen data) and Clerk (identity data) store personal data. Region selection and a data-processing agreement stop being architecture preferences and become compliance requirements. Clerk's data residency options in particular need verifying — if it cannot keep Saudi identity data in-Kingdom, it is not a viable auth choice for this market as-is.
- **ZATCA / Fatoora e-invoicing.** Phase 2 integration obligations apply to resident VAT-registered taxpayers; **non-resident taxpayers are exempt.** Wave 24 requires VAT-registered businesses above SAR 375,000 turnover to integrate with the Fatoora portal by 30 June 2026. Practical read: exempt while operating as a non-resident entity, in scope once a Saudi entity is established and crosses the threshold. The entity-structure decision determines this, not the product.
- **VAT is 15%** in KSA — relevant to how a ~$5/screen price is displayed (inclusive vs exclusive) to a market that expects inclusive pricing.
- **GCAM / media-content regulation** for public-facing display content was flagged in the brief and remains unverified. Worth checking before selling into venues that display third-party advertising rather than the venue's own content.
- **Working week:** Sunday–Thursday, weekend Friday–Saturday. Scheduling defaults must reflect this, not Monday–Friday.

## Open questions

Superseded. The authoritative list is § 12 of the PRD, which carries an owner and a revisit condition for each item. This section is deliberately not duplicated here — a second copy drifts, and by the time it drifts it is misinformation.
