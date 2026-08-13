# Solo-Build Feasibility Review — Lawha

Reviewer: adversarial, single question — can one person build this? Date: 2026-08-11.

## Verdict

**No, not as a single v1.** Not because any requirement is unreasonable, but because eighty-three of them are, in sequence, for one person, with the gating success criterion positioned last in practice and first in principle. The PRD already contains the diagnosis in § 9 ("scope growth — now the most immediate risk, and it was created by this document"). This review's contribution is to say that the warning is not strong enough: the risk has already materialised, and the mitigation offered — pointing at the ordered criteria in § 2 — does not work, because § 4.1 does not sequence toward them.

The document is a good description of the product. It is not yet a plan for building it.

## The missing dimension

**The PRD has no time, capacity, or runway dimension at all.**

The product brief listed as open question 4: *"Hours per week, runway, and budget."* That question was never asked during PRD discovery, never answered, and does not appear in § 11's open items. It was silently dropped.

This matters more than any individual requirement. Every feasibility judgment below is unanchored without it. A PRD that specifies eighty-three requirements for a solo builder and never asks how many hours that builder has is missing the only input that determines whether the scope is sane. **This is the single most important gap in the document.**

## Effort shape

Rough, deliberately coarse, assuming competent full-time work and no learning curve on the chosen stack. Read as relative weight, not as a schedule.

| Group | Requirements | Weight | Notes |
|---|---|---|---|
| A — Player | 14 | **Heaviest** | Offline cache, service worker, wake lock, self-recovery, heartbeat, local schedule evaluation, memory bounds, corrupt-cache recovery. The genuinely hard part, and the part with a prior failure behind it. |
| E — Scheduling | 7 | Heavy | A schedule engine with timezones, plus Hijri calendar support, plus configurable working week, plus precedence rules the PRD has not yet defined. Hijri alone is not a small task. |
| G — Account/billing | 16 | Heavy | Hosted auth, MoR integration, webhook reconciliation, entitlement enforcement, four distinct lapse states, trial-versus-paid branding states. |
| F — Bilingual | 11 | **Multiplier, not additive** | This is not eleven items of work. Full RTL mirroring and complete Arabic translation are a tax applied to every surface in every other group, including the website and both languages of documentation. Treating it as one group of eleven understates it substantially. |
| H — Website + docs | 6 | Heavy | A bilingual marketing site plus setup documentation written twice. Documentation is writing work, not development work, and Arabic technical writing is slow. |
| I — Branches | 9 | Moderate | Individually simple; complicates queries, schedule inheritance, and the dashboard everywhere. Schedule inheritance with per-screen override (FR-74) is the fiddly one. |
| C, D — Media, playlists | 14 | Moderate | Upload, thumbnails, storage accounting, ordering, duration, propagation. Well-understood work. |
| B — Pairing/screens | 9 | Light | Once the heartbeat exists in Group A. |

Plus, outside requirements entirely: device certification on two platforms, and **calendar time for criterion 1**. A fourteen-day unattended test takes fourteen days. It will not pass first time — the prior attempt died in thirty seconds. Three attempts with fixes between them is six to eight weeks of wall-clock time that cannot be compressed by working harder.

## The sequencing failure

§ 2 states: *"Criterion 1 is the gate on everything. Until it passes, no other work counts as progress."*

§ 4.1 then lists a v1 in which the following are required before shipping, and none of which are required to run a TV unattended for fourteen days:

- The entire bilingual layer (Group F)
- The public website (Group H)
- Documentation in two languages (FR-68)
- Multi-branch management (Group I)
- Subscription billing and the provider abstraction (Group G)
- Trial branding states (FR-79–82)

If criterion 1 genuinely gates everything, then the minimum to reach it is: **Group A, a minimal Group B for pairing and heartbeat, and enough of Groups C and D to have content to play.** Roughly thirty requirements. Everything else can follow a passed fourteen-day test rather than precede it.

The PRD asserts a priority and then describes a scope that ignores it. That is the failure, and it is cheap to fix — it requires no decision reversal, only a split of § 4.1 into phases.

## What a defensible sequence looks like

Offered as an illustration of the shape, not as a recommendation to adopt without the product owner's judgment.

**Phase 1 — earn the right to build the rest.** Group A, minimal B, minimal C and D. English only. No billing, no website, no branches. Target: a TV in a real location playing unattended for fourteen days through a power cut and a Wi-Fi outage. Nothing else counts until this passes, exactly as § 2 already says.

**Phase 2 — make it sellable.** Group G billing, Group H website and docs, Group E scheduling in full. This is what turns a working player into a product someone can buy.

**Phase 3 — the differentiating bets.** Group F bilingual and Group I branches. Both are deliberate strategic investments; neither is required to prove the product works or to take a first payment.

The obvious objection: Group F is expensive to retrofit, which is the entire argument the PRD makes for including it in v1, and that argument is sound. The resolution is not to defer the *architecture* — logical CSS properties, direction-aware components, no fixed-dimension text containers, UTF-8 throughout — which costs almost nothing when applied from the first commit. It is to defer the *content*: Arabic translation, bundled display fonts, Hijri scheduling, and the Arabic half of the website and documentation. Those are the expensive parts and they are not the parts that are hard to retrofit.

## Findings

- **critical** No hours-per-week, runway, or budget input anywhere in the PRD. Carried as an open question in the brief and dropped during discovery. Every scope judgment is unanchored without it. *Fix:* answer it, then re-read § 4.1 against the answer.
- **critical** § 4.1 does not sequence toward § 2's gating criterion. *Fix:* split v1 into phases with criterion 1 as the gate between phase 1 and everything else.
- **high** Group F is costed as eleven requirements when it is a multiplier across every surface, including a second language of documentation. The PRD's scope-growth risk in § 9 understates it for this reason. *Fix:* state explicitly that the bilingual layer taxes all other groups, and consider splitting RTL-safe architecture (cheap, do now) from Arabic content (expensive, can follow).
- **high** Criterion 1 requires wall-clock time that no amount of effort compresses, and it will not pass on the first attempt. Nothing in the PRD reserves that time or acknowledges the iteration. *Fix:* state that the fourteen-day test is expected to run multiple times and start as early as possible.
- **medium** Group H requires documentation written twice, which is writing work rather than development work and will not be estimated correctly alongside FRs. *Fix:* treat documentation as its own workstream.
- **medium** Two certified platforms (Raspberry Pi and Android) means two launcher integrations, two test cycles, and two sets of setup documentation. Committing to one for phase 1 halves the reliability surface at the moment reliability is the only thing that matters. *Fix:* consider certifying one device for phase 1 and adding the second after criterion 1 passes.
