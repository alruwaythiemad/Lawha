---
title: "Product Brief: Lawha — bilingual digital signage"
status: draft
created: 2026-08-11
updated: 2026-08-11
---

# Product Brief: Lawha (لوحة)

> **Working title.** _Lawha_ = "board / panel / sign" in Arabic. Reads cleanly in both scripts and both markets. Swap it freely.

## Executive Summary

Lawha is digital signage software that turns any TV into a managed screen: plug a cheap stick into the HDMI port, pair it with a six-character code, and control what plays from a browser. It follows the model Juuno proved — one flat per-screen price, no feature gates, no proprietary hardware, no sales call — and adds the one thing that tier does not have: **it speaks Arabic as a first language, not as a translation.**

The cheap self-serve signage tier is English-first. Juuno ($5/screen), Yodeck ($8), Xibo ($3.50) and OptiSigns ($10) are built for LTR text and Western scheduling. The vendors that serve Arabic markets properly — Scala, NoviSign, and the regional systems integrators — sell $18–30+/screen enterprise contracts or custom projects. A café owner in an Arabic-speaking market who wants one screen and a menu has to choose between software that mangles their language and software that requires a procurement process. Lawha targets the empty quadrant: **cheap, self-serve, and genuinely bilingual.**

This is a personal build, undertaken solo, for its own sake. It is not chasing a funding round. It is judged by whether a real TV runs it unattended for two weeks — and whether that is a thing worth having built.

## Why This Exists

Two honest reasons, stated plainly so that later decisions can be checked against them:

1. **The business model is attractive.** Flat per-screen recurring revenue, low support burden, no seat-counting. That is the stated draw, and there is nothing wrong with it.
2. **There is an unfinished attempt behind it.** A one-shot build in July 2026, written without a spec, produced a player that died after thirty seconds. The code is gone by choice. That failure is the reason this document exists and the reason the player gets its own section below.

Nothing here is driven by personal pain with signage. That is a real weakness in the foundation and it is named in the risks rather than papered over.

## The Problem

**For the screen owner.** A small business with a TV on the wall has three bad options: a USB stick someone walks over and swaps by hand, a laptop shoved behind the screen, or a signage platform priced and shaped for a chain. Content goes stale because updating it is a chore.

**For the Arabic-speaking screen owner, add a fourth problem.** Bilingual Arabic/English display is the default expectation across the Gulf, not a preference — and the affordable tools handle it badly or not at all. Broken bidirectional text where a price or a Latin brand name lands on the wrong side of a sentence. Arabic set in a fallback font that looks like a system error. Text that overflows its box because Arabic runs 20–30% longer than the English it was laid out for. An admin dashboard that is English-only, so the person actually managing the screen cannot use it. These are not edge cases; they are the daily experience of the market.

**Category-wide, the incumbents share known complaints** — several of which Juuno itself names publicly: pricing hidden behind sales calls at seven of twenty vendors, bundled features nobody asked for, hardware lock-in, and AI shipped as a tier bump rather than a capability.

## The Solution

A screen player and a browser dashboard, and very little else.

**The owner's experience:** plug a stick into the TV, see a pairing code, type it into the dashboard, drag in an image or a video, and it is on the wall. Under fifteen minutes from box to screen — the benchmark Juuno's users actually rave about. Then it keeps running: through power cuts, Wi-Fi drops, and months without anyone touching it.

**The bilingual layer, which is the product's real position:** the admin UI is fully Arabic and fully English with a true RTL layout, not a mirrored afterthought. Text rendering on-screen handles bidi correctly, ships with Arabic typefaces chosen for display legibility at distance, and reflows for Arabic's length rather than clipping it. Scheduling understands the Hijri calendar and the local working week.

## The Player

**This section exists because this is where the product lives or dies, and where the last attempt died.**

The dashboard is a CRUD app — uploads, playlists, scheduling, a screen list. Any competent build reaches it. The player is the hard part: unattended software on cheap hardware, mounted behind a TV nobody can reach, expected to recover from every failure by itself, forever. Every "how is it so easy" review of a signage product is really a review of its player.

Non-negotiable player behaviours for v1:

- **Never stays dead.** A watchdog restarts the process; the app relaunches on boot and on crash. The thirty-second failure must be structurally impossible, not merely fixed.
- **Survives the network.** Content is cached locally and keeps playing when the connection drops. Offline is the normal case, not the error case.
- **Survives power.** Cold boot returns to playback with no human intervention and no menu to dismiss.
- **Holds the screen.** Wake-lock on, screensaver and sleep suppressed, no OS lifecycle event allowed to background it.
- **Reports in.** A heartbeat so the dashboard can show online / offline / last-seen. An unreachable screen that silently stopped is the worst outcome in this category.

`[ASSUMPTION]` V1 targets **one** device — an Android-based HDMI stick (Amazon Signage Stick class hardware) — plus a plain browser player for testing. Every other platform is deferred.

## What Makes This Different

**Bilingual as architecture, not a locale file.** RTL, bidi, Arabic typography, text expansion, and Hijri scheduling designed in from the first commit. A competitor can add an Arabic translation in a week; retrofitting a correct RTL product is a rebuild they have no reason to prioritise.

**Juuno's pricing discipline, kept honestly.** One flat per-screen price, no feature gates, unlimited users and playlists, no minimum. This is a copied strategy, not an invention — and it is copyable in turn.

**No hardware lock-in.** Runs on the TVs and sticks already in the room.

**Where the honesty belongs:** there is no technical moat here. Juuno's advantage is price discipline, taste, and support responsiveness — all execution. The same is true of this. The only structurally defensible thing on the list is the Arabic depth, and only for as long as it stays deeper than a translation layer.

## Who This Serves

**Primary — the single-screen owner.** A café, gym, clinic, salon, small showroom, or mosque with one to five screens. Non-technical. Wants a menu, offers, or announcements on the wall and wants to stop thinking about it. Success for them is that the screen is never wrong and they never call anyone.

**Secondary — the small agency or reseller.** Manages screens on behalf of several clients, wants one dashboard and their own margin on top. Juuno's white-label tier ($100/mo flat, 20 screens, 40–80% reseller margins in their published examples) shows this segment pays. Deliberately out of v1 scope; noted because it shapes the data model — build multi-workspace boundaries in from the start even while shipping single-workspace.

`[ASSUMPTION]` No first customer is identified and no launch geography is fixed. The product is being built to be bilingual EN/AR; which market it is sold into first is an open decision.

## Scope

**In, for v1 — and nothing else:**

- Player on one device class, meeting every behaviour in *The Player* above
- Pairing by short code
- Image and video upload, with a sane file-size ceiling
- Playlists, ordered, with per-item duration
- Basic scheduling: day and time-of-day
- Screen list with online / offline / last-seen status
- Bilingual admin UI, EN + AR, full RTL
- Correct Arabic rendering on-screen: bidi, bundled display fonts, expansion-tolerant layout
- Single workspace, email auth

**Explicitly out of v1** — every one of these is a real Juuno feature and every one of them is a trap for a solo build:

Screen zones · sequences · proof-of-play reporting · public API · white label · the 25-app overlay library · Canva and social integrations · a template or WYSIWYG editor · analytics · a mobile admin app · roles and permissions · multi-tenant agency workspaces · every device platform beyond the one chosen · AI anything

Feature parity with Juuno is not the v1 goal and pursuing it is the documented way this build collapses.

## Success Criteria

Ordered. Each one gates the next.

1. **The fourteen-day test.** A real TV, not a dev machine, plays content unattended for fourteen consecutive days — surviving at least one deliberate power cut and one Wi-Fi outage — with zero manual intervention. This is the direct answer to the thirty-second failure, and until it passes, nothing else counts.
2. **The fifteen-minute test.** Someone who is not the builder goes from unboxing a stick to content on screen in under fifteen minutes, without being talked through it.
3. **The Arabic test.** A native Arabic speaker looks at a mixed Arabic/English menu on the screen and finds nothing wrong with it. No broken bidi, no fallback font, no clipped text.
4. **One screen that isn't yours.** A real business runs it in a real location.
5. **One paid screen.** Someone chooses to pay. `[ASSUMPTION]` around $5/screen/month, matching the tier this competes in.

Criteria 1–3 are entirely within the builder's control. Criterion 4 is where the real risk lives.

## How This Dies

Named in advance so they can be watched for.

**Distribution — the most likely.** There is no identified customer, no segment, and no channel. The plausible outcome is a working product that no one ever sees. Every comparable company solved this deliberately: Juuno bought its first users with a $19 AppSumo lifetime deal; Yodeck gives away Raspberry Pi hardware. *Mitigation: none currently. This is the open hole in the plan and it stays open by explicit decision.*

**Scope collapse.** Building toward Juuno's feature list instead of the fourteen-day test. *Mitigation: the "out of v1" list above is a contract with yourself.*

**Motivation.** The stated driver is the business model, not a problem personally felt. Model-driven projects lose to boredom when the build gets tedious — and player reliability work is tedious. *Mitigation: success criteria 1–3 are deliberately achievable solo and produce a visible, satisfying result.*

**Cost.** Video storage and bandwidth at $5/screen. *Mitigation: aggressive local caching, which the player needs anyway; a file-size ceiling in v1.*

## Vision

If it works: the default signage platform for Arabic-speaking small businesses — the one whose Arabic looks right, that costs less than lunch per screen per month, and that a café owner sets up alone. From there the same product widens outward through the reseller tier, where a small agency runs fifty client screens under their own brand.

That is two to three years away and it depends entirely on getting one real screen running in one real business. Everything above criterion 4 is speculation.

---

**Open decisions:** product name · launch geography · target device for v1 · first customer and channel.
