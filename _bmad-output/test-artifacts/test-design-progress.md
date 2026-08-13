---
workflowStatus: 'completed'
totalSteps: 5
stepsCompleted: ['step-01-detect-mode', 'step-02-load-context', 'step-03-risk-and-testability', 'step-04-coverage-plan', 'step-05-generate-output']
lastStep: 'step-05-generate-output'
nextStep: ''
lastSaved: '2026-08-12'
inputDocuments:
  - '_bmad-output/planning-artifacts/prds/prd-the_project-2026-08-11/prd.md'
  - '_bmad-output/planning-artifacts/architecture/architecture-the_project-2026-08-11/ARCHITECTURE-SPINE.md'
  - '_bmad-output/planning-artifacts/epics.md'
  - '.claude/skills/bmad-testarch-test-design/resources/knowledge/adr-quality-readiness-checklist.md'
  - '.claude/skills/bmad-testarch-test-design/resources/knowledge/nfr-criteria.md'
  - '.claude/skills/bmad-testarch-test-design/resources/knowledge/test-levels-framework.md'
  - '.claude/skills/bmad-testarch-test-design/resources/knowledge/risk-governance.md'
  - '.claude/skills/bmad-testarch-test-design/resources/knowledge/probability-impact.md'
  - '.claude/skills/bmad-testarch-test-design/resources/knowledge/test-quality.md'
---

# Test Design Progress

## Step 1: Detect Mode & Prerequisites

**Mode:** System-Level Test Design

**Rationale:** Project has both PRD/ADR/Architecture and epics.md available. Per user selection (both present, System-Level preferred and chosen explicitly), running System-Level mode: PRD + ADR/Architecture → Architecture + QA docs.

**Prerequisites confirmed:**
- PRD: `_bmad-output/planning-artifacts/prds/prd-the_project-2026-08-11/prd.md` (462 lines)
- Architecture: `_bmad-output/planning-artifacts/architecture/architecture-the_project-2026-08-11/ARCHITECTURE-SPINE.md` (438 lines)

## Step 2: Load Context & Knowledge Base

**Config:** tea_use_playwright_utils=true, tea_use_pactjs_utils=false, tea_pact_mcp=none, tea_browser_automation=auto, test_stack_type=auto (unset → inferred)

**Stack detection:** No code exists anywhere in the repo yet (pure planning-stage project — confirmed via `find` for package.json/playwright/cypress/pyproject/go.mod etc., all absent). Architecture spine names the intended stack once built: `apps/console` (Next.js 16.3, React 19.2.8, shadcn/ui+Tailwind+Radix), `apps/player` (Preact 10.29.7, Vite 8.0.9), `packages/domain|adapters|manifest-contract|i18n`, Supabase Postgres 17 (EU region), Clerk auth, Cloudflare R2/Pages, Vercel. Detected stack classification: **fullstack** (once built). No browser exploration performed — no deployed target exists.

**Artifacts loaded:** PRD (62 FRs across groups A–I, NFR-1…NFR-15, success criteria, risk register), Architecture Spine (27 ADs, consistency conventions, stack, entity model, deferred items), Epics document (FR coverage map + 8-epic list, frontend-first build order per PRD §12.5, Group H excluded).

**Knowledge fragments loaded (System-Level core set):** adr-quality-readiness-checklist.md, nfr-criteria.md, test-levels-framework.md, risk-governance.md, probability-impact.md, test-quality.md. Playwright Utils automation fragments deliberately deferred to the automate/atdd workflows — not needed for architecture-level risk/testability assessment.

## Step 3: Testability & Risk Assessment

### 🚨 Testability Concerns (actionable, ordered by severity)

1. **Criterion 1 (the fourteen-day test) is not CI-testable at all.** No mock, no fast-forward, no simulation substitutes for fourteen real days on real certified hardware. The PRD itself states the first attempt will fail and each attempt costs fourteen days of wall-clock time "no effort compresses." This is the single largest testability gap in the whole system and the one everything else is judged against. **ACTIONABLE.**
2. **A minor numeric inconsistency exists between NFR-13 and AD-12 on the offline threshold.** NFR-13 (PRD) defines offline as "5 consecutive missed heartbeats" (~300s at a 60s interval). AD-12 (architecture) defines online as "last heartbeat within 180s" (~3 missed beats). Both satisfy NFR-7's "within roughly five minutes" bound, so this is not a functional defect, but it leaves the acceptance test with two candidate thresholds to assert against. **ACTIONABLE** — pick one number (180s, the tighter architecture value, is already implemented in AD-12's rule) and have the PRD's NFR-13 either match it or be explicitly reconciled before Story 2.6 is tested.
3. **No test-data seeding API is named anywhere in the architecture.** All console-side state control goes through the same server route handlers a real owner would use — there is no `/api/test-data` or equivalent fast-seed path. For a solo-operator product this is a reasonable trade against building throwaway infrastructure, but it means integration/E2E setup (multi-branch fixtures, entitlement-ceiling states, stale-heartbeat states) must go through full API round-trips rather than direct seeding, which is slower and couples test setup to the same code paths under test. **ACTIONABLE** — recommend at minimum a workspace-scoped factory layer at the `packages/domain`/`packages/adapters` boundary usable directly in integration tests (bypassing HTTP), even without a dedicated seeding endpoint.
4. **Time-dependent assertions are pervasive and none of them have a stated test-environment override.** AD-12 (180s online window), AD-11 (time-confidence staleness threshold, value undefined), FR-16 (15-minute pairing code expiry), FR-63a (dunning retry schedule) all require either waiting out real wall-clock time in tests or a documented way to fast-forward/mock the server clock and the player's monotonic-offset logic. **ACTIONABLE.**
5. **Best-effort device behavior (Tizen/webOS Wake Lock, muted-video fallback) is explicitly unverified** per the architecture's own Deferred section, and NFR-15 requires per-device verification before a device enters the certified tier — but the verification *procedure* itself (who runs it, what evidence counts as pass) is not defined anywhere in the loaded documents. **ACTIONABLE.**
6. **The flash-content check (FR-83) has no defined test corpus.** It needs a stated content policy plus a curated set of video fixtures with known ground truth (confirmed flash, borderline/uncertain, clean) to regression-test the client-side heuristic against — none of this exists yet, and the PRD explicitly calls the content policy still-to-be-authored. **ACTIONABLE.**
7. **Merchant-of-Record vendor is unselected**, so the exact webhook payload shape, ordering guarantees, and retry/dunning timing that AD-19 and FR-63a depend on cannot be contract-tested yet — only the internal four-verb port (AD-1) can be tested against a fake adapter today. **ACTIONABLE**, but correctly sequenced behind a product-owner decision already tracked in the architecture's Deferred list.
8. **RTL/bidi correctness relies almost entirely on CI-time static enforcement** (AD-21's lint against physical `left`/`right`, AD-22's ICU-catalogue-only rule, Story 1.4's DOM-order lint) rather than runtime assertions. This is a genuine strength for catching regressions cheaply, but it also means anything the lint doesn't cover (e.g., a component that satisfies the letter of "no physical property" while still rendering visually wrong) has no automated backstop short of the visual/manual Arabic-speaker review in success criterion 3. **ACTIONABLE** — recommend supplementing the lint with visual-regression snapshots per CAP-17's four language/theme combinations on the highest-traffic surfaces.
9. **Rate limiting on `POST /device/register`** (unauthenticated, per-IP and global) and bounded pairing-code issuance could throttle parallel CI workers that all pair fixture screens against the same test environment. No test-environment carve-out is specified. **ACTIONABLE.**

### ✅ Testability Assessment Summary (already strong)

- **`workspace_id` as the sole tenancy key (AD-15)** makes test isolation close to free: every test can spin up its own workspace and get a hard guarantee of zero cross-test data bleed, with no `user_id`/`branch_id` special-casing to trip over.
- **No scheduled background work anywhere in v1 (AD-13).** All derived state is computed at read or write time. This eliminates an entire class of flaky "wait for the job queue to catch up" tests that plague systems with cron/queue-driven state.
- **Screen status as a pure read-time function of `last_seen` (AD-12)**, not a stored/reconciled column, means status tests reduce to "seed a `screen_telemetry.last_seen` timestamp, query, assert" — no need to simulate a miss-counter reconciliation job.
- **The device's entire server surface is three narrow, versioned endpoints (AD-3)** with no DB client and no vendor credential in the player. This is about as headless-testable as a physical-device integration point gets — the player/server contract can be fully exercised via HTTP without a browser.
- **The manifest is a single server-computed content hash (AD-6) assembled in exactly one place (AD-25)** and validated on both sides by one shared schema (AD-26). This gives a strong, deterministic assertion surface: "this write should/shouldn't bump the revision" is a fact, not a guess.
- **Hard-delete only, no soft-delete columns anywhere in v1.** Test teardown is a real `DELETE`, not a flag toggle to remember — simpler and less error-prone cleanup.
- **Forward-only migrations applied exclusively through CI (AD-24)** and a `local → preview → production → canary → fleet` environment ladder give a natural place to run the automated suite (preview) before anything reaches even canary screens.
- **Every API error carries a stable machine code plus an ICU message key (NFR-9, Story 1.6)** — this is mechanically assertable (`expect(error.code).toBe(...)`) rather than requiring fragile string-matching on translated copy.
- **The fixture harness (CAP-16) drives all eight player states and all console surface states with no backend**, which is exactly the controllability primitive Playwright/CI testing of the presentation layer needs, and it's explicitly required to be absent from production builds (testable itself).

### Architecturally Significant Requirements (ASRs)

| ASR | Binds | Status | Note |
|---|---|---|---|
| Criterion 1 — 14-day unattended test | NFR-1…NFR-7 | **ACTIONABLE** | No CI substitute exists; needs a dedicated real-hardware lab, started as early as possible per PRD §2 |
| AD-3 — 3-endpoint device API, no DB access | Group A, B | **ACTIONABLE** (contract tests) / FYI (design itself is sound) | Version-bump discipline needs an explicit breaking-change test |
| AD-5, AD-6, AD-25, AD-26 — manifest assembly/activation/validation | Groups C, D, E, G, I | **ACTIONABLE** | Single point of failure for 5 of 9 FR groups; needs exhaustive domain-layer + contract coverage |
| AD-9 — fixed recovery ladder | Group A, NFR-1, NFR-2 | **ACTIONABLE** | Requires fault-injection harness on real/emulated Chromium 76 engine |
| AD-11 — trusted time / low-confidence fallback | Group E, Group A | **ACTIONABLE** | Needs clock-mocking; staleness threshold value not yet specified anywhere |
| AD-12 — read-time online status | Group B, NFR-7, NFR-13 | **ACTIONABLE** | Conflicts numerically with NFR-13 (see Testability Concern #2) |
| AD-17 — entitlement transaction lock | Group B, G | **ACTIONABLE** | Needs a concurrency (race-condition) test, not just sequential coverage |
| AD-19 — webhook idempotency/ordering | Group G | **ACTIONABLE**, blocked on MoR vendor selection | Cannot be contract-tested against a real vendor shape yet |
| AD-21, AD-22 — RTL/bidi mechanical enforcement | Group F, H | **FYI** | Already self-enforcing via CI lint; strong existing testability |
| AD-27 — mandatory workspace-scoped data access | all | **ACTIONABLE** | Exactly the class of bug ("forgot the `where workspace_id=`") that needs an explicit cross-tenant-leak test on every read/write route |
| NFR-15 — per-device Wake Lock certification | Platform | **ACTIONABLE** | Verification procedure itself undefined; Tizen/webOS unverified today |
| FR-83 — client-side flash check | Group C | **ACTIONABLE** | No fixture corpus or finalized content policy yet |

### Risk Assessment Matrix

Scoring: Probability (1–3) × Impact (1–3) = Score (1–9). ≥6 = MITIGATE (CONCERNS at gate), 9 = BLOCK (auto-FAIL), 4–5 = MONITOR, 1–3 = DOCUMENT.

| ID | Category | Risk | Prob | Impact | Score | Action | Mitigation | Owner |
|---|---|---|---|---|---|---|---|---|
| R-1 | BUS/OPS | The 14-day unattended test cannot be validated in CI; PRD states the first attempt will fail and each attempt costs 14 real days | 3 | 3 | **9** | **BLOCK** | Dedicated always-on certified-device lab (Raspberry Pi + Android stick) with heartbeat/quarantine telemetry dashboard; start the clock as early as phase 1 allows; run several devices in parallel to amortize cost; instrument so failures are diagnosable remotely, not by physical inspection | Dev/Architecture |
| R-2 | TECH | Manifest assembler (AD-5/6/25/26) is a single point of failure touching 5 of 9 FR groups | 2 | 3 | 6 | MITIGATE | Exhaustive domain-layer unit tests (schedule precedence, hash determinism, no-op → no revision) + contract tests on `manifest-contract` validated on both write and read sides | Dev |
| R-3 | TECH | Recovery ladder (AD-9) untested against real Chromium-76-era fault classes (decode failure, OOM, corrupt cache) — simulated faults may not represent real engine behavior | 2 | 3 | 6 | MITIGATE | Certified-device burn-in lab with fault injection (process kill, IndexedDB corruption, network throttling) plus soak tests instrumented via heartbeat/quarantine reporting | Dev |
| R-4 | DATA/SEC | Cross-tenant data leak via a server route using service-role credentials that forgets `workspace_id` scoping — named explicitly as the risk AD-27 exists to prevent | 2 | 3 | 6 | MITIGATE | Automated test creating two workspaces, asserting zero cross-visibility on every list/read/write route; type-level enforcement that data-access functions require a workspace argument | Dev |
| R-5 | OPS/DATA | Merchant-of-Record vendor unselected; webhook idempotency/ordering (AD-19) and Saudi payout support unverified against a real vendor shape | 2 | 3 | 6 | MITIGATE | Contract-test the internal 4-verb payment port against a fake adapter now; re-verify against the real vendor's webhook shape the moment it's selected; verify Saudi payout support before committing | Product owner / Dev |
| R-6 | TECH/PLATFORM | Best-effort device Wake Lock (Tizen/webOS) explicitly unverified; muted-video fallback unconfirmed | 3 | 2 | 6 | MITIGATE | Acquire ≥1 representative Tizen/webOS unit before best-effort claims are published in docs or marketing; validate the fallback directly | Dev |
| R-7 | SEC/COMPLIANCE | Client-side flash-content check (FR-83) is heuristic; a false negative lets harmful strobe content reach a public-venue wall — physical-harm/liability dimension named explicitly in the PRD | 2 | 3 | 6 | MITIGATE | Curated positive/negative video fixture corpus with known flash-rate ground truth, regression-tested against the analyzer; finalize and version the referenced content policy before FR-83 ships | Dev / Product owner |
| R-8 | SEC | Entitlement race condition on concurrent screen pairing (AD-17) could allow over-provisioning past the plan's screen limit | 2 | 2 | 4 | MONITOR | Concurrency test firing simultaneous claim requests at a workspace already at its ceiling; assert the DB constraint rejects the (N+1)th | Dev |
| R-9 | BUS/COMPLIANCE | Clerk hosted-auth surface is the one place an Arabic user meets English (FR-53); its EN 301 549 accessibility audit (UX-DR12) is an open, unscheduled gate that could force a rebuild to a headless auth UI | 2 | 2 | 4 | MONITOR | Schedule the EN 301 549 audit (screen reader, `ar` locale, 400% zoom, keyboard-only) before any unqualified product-level WCAG-AA claim is published | Product owner |
| R-10 | TECH | RTL/bidi correctness relies almost entirely on CI-time lint (AD-21/22) rather than runtime assertions; a lint gap could ship a silently-broken mirror | 2 | 2 | 4 | MONITOR | Add visual-regression snapshots across all 4 language/theme combinations (CAP-17) on the highest-traffic surfaces to complement the lint | Dev |
| R-11 | PERF/OPS | NFR-12's 2GB/screen/month budget depends on content-hash caching (AD-7) across signed-URL rotation; a cache-keyed-by-URL bug would silently multiply bandwidth cost, surfacing only as an unexpected invoice | 2 | 2 | 4 | MONITOR | Explicit regression test asserting a manifest revision with an unchanged asset set + rotated signed URLs produces zero re-downloads | Dev |
| R-12 | TECH | Two numeric thresholds for "offline" exist in the source documents — NFR-13 says 5 missed heartbeats (~300s), AD-12 says within 180s. Both satisfy NFR-7 but leave test-writers with an ambiguous target | 2 | 1 | 2 | DOCUMENT | Reconcile the two documents on a single number (recommend keeping AD-12's 180s, the tighter/already-implemented value) before Story 2.6 tests are written | Architecture |
| R-13 | DATA | No soft-delete anywhere in v1 — screen removal is immediate, hard, and irreversible; an owner mis-click has no undo | 1 | 2 | 2 | DOCUMENT | Deliberate, accepted design choice; mitigate only via a strong confirmation-dialog UX (already an AC in Story 2.3), no test-plan action beyond confirming that dialog exists | Dev |
| R-14 | TECH/SEC | Device tier (certified/best-effort) is self-declared by the device at registration (AD-16); a misconfigured device could claim "certified" and receive guarantees the console then advertises as reliable | 1 | 2 | 2 | DOCUMENT | Low near-term risk in a single-actor v1 product with no adversarial third-party integrators; boundary test only — console should never contradict its tier claim against observed telemetry | Dev |

**Context note (not scored — outside test design's remit):** the PRD's own §10 names *distribution* ("no identified customer, no channel") as the most likely way this product fails. That is a market risk no test plan mitigates; it's recorded here only so the risk register isn't read as claiming technical risk is the dominant threat.

### NFR Planning Assessment

| Category | Requirement(s) | Threshold | Status | Planned evidence source |
|---|---|---|---|---|
| Reliability | NFR-1 (14-day survival) | 14 consecutive days, zero intervention | Defined | Certified-device lab burn-in, heartbeat/quarantine telemetry log (see R-1) |
| Reliability | NFR-2 (process-death recovery) | No first-crash-is-permanent path | Defined (qualitative) | Recovery-ladder fault-injection tests (AD-9) |
| Reliability | NFR-3 (cold-boot recovery, certified) | No human input required | Defined (qualitative) | Power-cycle test on Raspberry Pi + Android certified kiosk |
| Reliability | NFR-4 (indefinite offline playback) | No network, plays from cache | Defined | Extended offline soak test |
| Reliability | NFR-5 (no sleep/screensaver during playback) | Continuous wake-lock | Defined | Automated display-state monitoring during soak |
| Reliability | NFR-6 (no OOM kill under decode) | Bounded via AD-10's 1-ahead-preload / 2-DOM-element rule | Defined (implementation-level) | Memory-profiled soak test on low-memory certified hardware |
| Reliability | NFR-7 (offline within 5 min) | ~5 min, but see R-12 (conflicts with AD-12's 180s) | **CONCERNS — conflicting thresholds** | Heartbeat-miss timing test once threshold is reconciled |
| Usability | NFR-8 (15-min unaided setup) | Per-step budget in PRD §3.1 journey table | Defined | Moderated usability test, non-technical participant, timed |
| Usability | NFR-9 (actionable error messages) | Machine code + ICU key, never bare code/stack trace | Defined, mechanically checkable | Contract test asserting every API error matches the defined shape; manual copy-quality review (not machine-checkable) |
| Data protection | NFR-10 (EU/UK region, GDPR, DPAs) | Region + DPA per subprocessor | Defined | Infra config check (Supabase project region) + subprocessor DPA audit (compliance doc check, not a test) |
| Data protection | NFR-11 (Saudi PDPL on Gulf entry) | Deferred until Gulf market entry | **N/A for v1** — future trigger only | Revisit condition tracked in architecture Deferred list |
| Cost/Performance | NFR-12 (≤2GB/screen/month) | Quantitative | Defined | Cache-hit-rate regression test (R-11) + real-world bandwidth monitoring once live |
| Cost/Performance | NFR-13 (60s heartbeat, offline threshold) | See R-12 conflict | **CONCERNS** | Reconcile with AD-12 first |
| Platform | NFR-14 (certified vs. best-effort matrix) | Structural, defined | Defined | Certified-device lab (full requirement suite) + ≥1 best-effort unit (playback-only suite) |
| Platform | NFR-15 (per-device Wake Lock verification) | Verification required before certified-tier entry | **UNKNOWN — procedure undefined** | No verification procedure specified in loaded docs; convert to action item before Story 3.4 is marked done |
| Security | AuthN/AuthZ, tenancy isolation | Workspace-scoped RLS + server-mediated writes (AD-4, AD-15, AD-27) | Defined | Cross-tenant-leak test (R-4), entitlement-race test (R-8) |
| Security | Encryption at rest/in transit | Not explicitly stated as a tested criterion — relies on Supabase/Cloudflare platform defaults | **UNKNOWN — no explicit acceptance criterion** | Low residual risk (managed platform), but no test currently asserts it; recommend one static check confirming TLS-only endpoints |
| Security | Secrets handling | No secret in player bundle (AD-20); env validated at boot (Story 1.6) | Defined, mechanically checkable | Static bundle scan for secret patterns + boot-refusal test on missing/malformed env var |
| Accessibility | WCAG 2.2 AA, 4 language/theme combos (CAP-17) | Defined precisely (focus ring, DOM order, 44px targets, status announcer) | Defined | Automated a11y test suite per Story 1.4's AC; Clerk surface excluded pending its own audit |
| Accessibility | Clerk hosted-auth surface (UX-DR12) | EN 301 549 audit | **UNKNOWN — unscheduled** | Open product-owner gate (R-9); no unqualified WCAG-AA claim until this runs |
| Maintainability | Not addressed in PRD/architecture beyond general engineering discipline | No coverage %, duplication %, or CI quality gate stated | **UNKNOWN — default to CONCERNS per nfr-criteria.md** | Recommend the team explicitly decide whether to define these for a solo-operator project, or consciously defer |

### Risk Findings Summary

**Highest priority (score ≥ 6, 7 risks — all MITIGATE except R-1 which is BLOCK):**

1. **R-1 (score 9, BLOCK)** — the 14-day test has no CI substitute and gates the entire product. This is not a risk testing "mitigates" in the usual sense; it is a risk testing can only make *diagnosable and parallelizable* (real-hardware lab, telemetry-first design, multiple concurrent attempts).
2. **R-2, R-3 (score 6)** — the manifest assembler and the recovery ladder are the two structural cores everything else depends on; both need exhaustive domain/contract-level coverage before any feature epic is trusted.
3. **R-4 (score 6)** — cross-tenant leaks are the one security failure mode the architecture calls out by name (AD-27); needs an explicit, repeatable two-workspace leak test on every route.
4. **R-5, R-6, R-7 (score 6)** — three risks correctly sequenced behind open product-owner/vendor decisions already tracked in the architecture's own Deferred list (MoR vendor, Tizen/webOS hardware acquisition, flash-check content policy). Testing can prepare contract/fixture scaffolding now but cannot close these until the upstream decision lands.

**Mitigation priority order for Phase 4 (coverage plan):** R-1's lab setup and R-2/R-3's domain-layer coverage should be first in the test plan, since Epic 3 (Player) is explicitly the epic criterion 1 is judged against. R-4's cross-tenant test belongs in Epic 1 (Foundation) since AD-27 binds all server-side data access from the first commit. R-5/R-6/R-7 become active work items only once their respective upstream blockers clear.

## Step 4: Coverage Plan & Execution Strategy

### Coverage Matrix (by capability area, per Architecture Spine's Capability → Architecture Map)

**A — Player runtime, offline, recovery** (Epic 3; NFR-1…6; AD-3/5/8/9/10/11/23/26)

| # | Scenario | Level | Priority | Linked risk/req |
|---|---|---|---|---|
| A1 | 14-day unattended burn-in on certified hardware (Raspberry Pi + Android stick), zero manual intervention | Hardware-lab E2E | P0 | R-1, NFR-1 |
| A2 | Recovery ladder escalates correctly through all 4 rungs (skip item → reset surface → reload with cache intact → launcher restart) for each fault class | Component/Integration (fixture harness) | P0 | R-3, AD-9 |
| A3 | Fault counter persists in IndexedDB across reload; repeatedly-failing item is quarantined, skipped, and reported in the next heartbeat | Integration | P0 | R-3 |
| A4 | Offline playback continues uninterrupted through a simulated network drop; sync resumes automatically on reconnect | E2E (network interception) | P0 | NFR-4 |
| A5 | A manifest revision activates only once every referenced asset is cached; the previous revision keeps playing until then | Integration (domain) | P0 | R-2, AD-5 |
| A6 | Memory bounding — at most one item preloaded ahead, exactly two DOM media elements, object URLs revoked on release | Integration / short soak | P1 | NFR-6 |
| A7 | Corrupt/partial local cache triggers re-fetch, not failure to start | Integration | P1 | FR-14 |
| A8 | A `403` on a signed media URL triggers a manifest re-fetch, not a playback failure | Integration | P1 | AD-7 |
| A9 | Player build-version pinning and canary rollout; rollback takes effect within one heartbeat with no redeploy | Integration | P1 | AD-8 |
| A10 | Wake lock held for the duration of playback on certified devices; muted-looping-video fallback engaged on engines below Chromium 84 | Hardware-lab E2E (certified + ≥1 best-effort unit) | P0 | R-6, NFR-5 |
| A11 | Cold-boot recovery on certified devices (power cycle) resumes playback with no human input | Hardware-lab E2E | P0 | NFR-3 |

**B — Pairing, screens, honest status** (Epic 2; NFR-7, NFR-13; AD-3/12/16/17/20)

| # | Scenario | Level | Priority | Linked risk/req |
|---|---|---|---|---|
| B1 | Pairing code issuance is single-use, expires in 15 minutes, and auto-refreshes on expiry with no manual step | API | P0 | FR-16 |
| B2 | Screen status is derived solely from `last_seen` at read time; a screen that has never heartbeated is never shown as online | API/Integration | P0 | R-12, AD-12 |
| B3 | Concurrent claim requests against a workspace already at its entitlement ceiling — exactly one succeeds | API concurrency test | P0 | R-8, AD-17 |
| B4 | Device credential rotates on re-pair and is revoked on screen removal, and on nothing else | API | P1 | AD-20 |
| B5 | The device API writes exactly one table (`screen_telemetry`); console-owned configuration is never touched by a heartbeat | Integration | P1 | AD-16 |
| B6 | Cross-tenant screen-list leak test — two workspaces, assert zero visibility across the boundary | API | P0 | R-4 |

**C — Media** (Epic 4; NFR-12; AD-7)

| # | Scenario | Level | Priority | Linked risk/req |
|---|---|---|---|---|
| C1 | Upload ceilings (150MB video / 15MB image) enforced pre-transfer with specific, actionable rejection reasons | API/Component | P1 | FR-25, FR-26 |
| C2 | Flash-content check against a curated fixture corpus — confident breach refused, uncertain warns-and-acknowledges | Integration | P0 | R-7 (blocked on content policy + fixture corpus) |
| C3 | Cache-hit regression — an unchanged asset set with rotated signed URLs produces zero re-downloads | Integration | P1 | R-11, NFR-12 |
| C4 | Media referenced by a playlist cannot be deleted; the owner is shown what's using it | API | P2 | FR-28 |

**D — Playlists & manifest delivery** (Epic 5; AD-5/6/25/26)

| # | Scenario | Level | Priority | Linked risk/req |
|---|---|---|---|---|
| D1 | The manifest assembler produces no new revision for a no-op edit (hash determinism) | Unit (domain) | P0 | R-2 |
| D2 | Every write that can affect a manifest recomputes the revision only for the screens it touches, inside the same transaction as the write | Integration | P0 | R-2 |
| D3 | A manifest failing validation is rejected on both the write (assembler) and read (player) sides; the player keeps its current revision | Integration | P0 | AD-26 |
| D4 | "Assigned" (workspace fact) and "playing" (heartbeat-confirmed) are exposed as two distinct, never-collapsed facts | API/E2E | P1 | UX-DR2 |

**E — Scheduling** (Epic 6; AD-11/14)

| # | Scenario | Level | Priority | Linked risk/req |
|---|---|---|---|---|
| E1 | The server collapses all four precedence rules into a flat weekly timetable; the player holds no precedence logic | Unit (domain) | P0 | AD-14 |
| E2 | Schedule resolution falls back to low-confidence when the last time-sync exceeds the staleness threshold | Integration (clock-mocked) | P1 | Testability Concern #4 |
| E3 | Branch-level schedule inheritance with per-screen override — screen beats branch | Integration | P1 | FR-74 |

**F — Bilingual layer** (Epic 1; AD-21/22/23)

| # | Scenario | Level | Priority | Linked risk/req |
|---|---|---|---|---|
| F1 | CI fails the build on a physical `left`/`right` layout property or a missing/concatenated catalogue key | CI/static | P0 | Self-enforcing (AD-21/22) |
| F2 | Visual-regression snapshots across all four language/theme combinations on the highest-traffic surfaces | Visual regression | P1 | R-10 |
| F3 | Mixed Arabic/Latin runs are wrapped in bidi-isolation markup (`<bdi>`/`dir="ltr"`), never Unicode control characters | Component | P1 | FR-50 |
| F4 | The bundled Arabic typeface remains available from the offline cache when the network drops | E2E (offline simulation) | P1 | FR-52 |

**G — Account, billing, entitlement** (Epic 8; AD-1/17/18/19)

| # | Scenario | Level | Priority | Linked risk/req |
|---|---|---|---|---|
| G1 | Duplicate webhook delivery does not double-apply subscription state (dedupe on provider event ID) | Integration (fake adapter) | P0 | R-5, AD-19 |
| G2 | Webhook events are applied by event timestamp, not arrival order; events older than applied state are ignored | Integration | P0 | R-5 |
| G3 | Subscription termination stops playback via a manifest field flip; the device credential is never revoked | Integration | P0 | AD-18 |
| G4 | Trial branding is removed within one heartbeat cycle of payment confirmation, with no re-pairing or restart | E2E/Integration | P1 | FR-82 |
| G5 | The four-verb payment port (charge/subscribe/cancel/webhook) is fully exercised against a fake adapter, ready to swap for the real vendor | Integration | P1 | AD-1 |

**H — Branches & multi-location** (Epic 7; AD-14/15/16)

| # | Scenario | Level | Priority | Linked risk/req |
|---|---|---|---|---|
| H1 | Branch bulk-assignment reports the affected screen count and preserves any per-screen override that survives | API | P1 | UX-DR5, FR-73 |
| H2 | A screen moves between branches without re-pairing or a content rebuild | API | P2 | FR-77 |

**Cross-cutting — Tenancy & security** (all groups; AD-4/15/27)

| # | Scenario | Level | Priority | Linked risk/req |
|---|---|---|---|---|
| X1 | Every server route resolves its workspace from the authenticated session only — never a request parameter, path segment, or body | Static/lint + Integration | P0 | R-4, AD-27 |
| X2 | RLS stays enabled on every table as defence in depth, independent of server-route enforcement | Integration | P1 | AD-4 |

**Cross-cutting — Accessibility**

| # | Scenario | Level | Priority | Linked risk/req |
|---|---|---|---|---|
| Y1 | Automated WCAG 2.2 AA checks (focus ring, DOM order, 44px targets, status announcer) across `apps/console` and `apps/player`, all four language/theme combinations | Automated a11y scan | P0 | CAP-17 |
| Y2 | EN 301 549 audit of the hosted Clerk authentication surface | Manual audit | P1 | R-9 (blocked, unscheduled) |

**Duplicate-coverage check:** unit level owns pure domain logic (manifest hash determinism, schedule precedence, entitlement math); integration owns component/service boundaries (device API, webhooks, RLS, manifest activation); E2E/hardware-lab is reserved for what only real devices or full browser+network stacks can prove (the 14-day test, wake lock, cold boot, offline continuity). No scenario above is duplicated across levels.

### NFR Coverage and Evidence Plan

| NFR category | Validation level/tool | Evidence artifact for later `nfr-assess` |
|---|---|---|
| Reliability (NFR-1…7) | Hardware-lab burn-in + fixture-harness fault injection (Playwright/CDP) | Burn-in dashboard log, heartbeat/quarantine telemetry export, soak-test report |
| Cost/Performance (NFR-12, 13) | Cache-hit regression test (API/integration) + post-launch bandwidth monitoring | Regression test results; monthly per-screen bandwidth report once live |
| Usability (NFR-8, 9) | Moderated usability session (manual, timed) + API contract test for error shape | Session recording/timing sheet; contract-test results |
| Data protection (NFR-10, 11) | Infra config audit (Supabase region setting) + subprocessor DPA registry | Region config export; DPA document list. NFR-11 is N/A for v1 — tracked as a future trigger, not tested now |
| Platform (NFR-14, 15) | Certified-device lab matrix + per-device verification (procedure undefined — blocker) | Device certification checklist per unit — cannot be produced until the verification procedure itself is defined |
| Security | Playwright E2E (authz/tenancy) + static secret-scan of the player bundle + env-boot-refusal test | Cross-tenant leak test results; bundle secret-scan report |
| Accessibility | Automated axe-core (or equivalent) scan in CI + manual EN 301 549 audit (Clerk, pending) | CI a11y report; audit report once R-9 is scheduled |
| Maintainability | **UNKNOWN — no coverage %, duplication %, or CI quality gate defined anywhere in the loaded documents** | None yet; defaults to CONCERNS per `nfr-criteria.md` until the team defines thresholds or consciously defers them |

### Execution Strategy

- **PR (<15 min):** domain-layer unit tests (manifest assembler D1/D2, schedule resolution E1, entitlement math), device/console API contract tests (error shape, B1/B4/B5), CI static checks (F1's RTL/bidi/ICU lint, X1's workspace-scope lint), cross-tenant isolation integration test (B6), webhook idempotency against the fake adapter (G1/G2).
- **Nightly:** full fixture-harness E2E across console + player states, visual-regression snapshots (F2, four combinations), automated a11y scan (Y1), cache-hit-rate regression (C3), a short (2–4 hour) memory-profiled soak smoke test standing in for A6 between full soak runs.
- **Standing hardware lab (not CI-gated, runs continuously):** the 14-day certified-device burn-in (A1) — this is a lab, not a pipeline stage, and its clock should start as early as phase 1 allows per PRD §2. Best-effort device spot-checks (A10's Tizen/webOS half) run weekly once hardware is acquired.
- **One-time, blocker-gated (not recurring):** EN 301 549 Clerk audit (Y2) and real Merchant-of-Record webhook re-verification (G1/G2 against the real vendor) run once, when their respective upstream product-owner/vendor decisions land — not on a cadence.

### Resource Estimates

*Ranges, not false precision — whole-product, greenfield, system-level scope across all 8 in-scope epics. Excludes the 14-day lab's own wall-clock time, which is calendar time, not authoring effort.*

- **P0:** ~180–260 hours (player reliability core, manifest assembler, tenancy/security isolation, billing state machine, accessibility automation, hardware-lab setup and instrumentation)
- **P1:** ~120–180 hours (bilingual visual regression, scheduling edge cases, billing lifecycle detail, branch bulk operations)
- **P2:** ~50–90 hours (secondary flows, media management edges, branch move)
- **P3:** ~10–20 hours (cosmetic/exploratory)
- **Total:** ~360–550 hours of test-authoring effort, spread across the full build calendar in parallel with each epic rather than front-loaded — the hardware lab's 14-day clock runs independently and should start as early as possible per PRD §2's explicit instruction.

### Quality Gates

- P0 pass rate = 100%; P1 pass rate ≥ 95%
- **R-1 (the 14-day test) requires one fully completed, passing burn-in run before criterion 1 is declared met — no partial-run waiver, consistent with the PRD's own statement that this test "will not pass on the first attempt."**
- R-2 through R-7 (all score-6 MITIGATE risks) require documented mitigation status, owner, and evidence before their owning epic's gate closes
- Domain-layer unit coverage (manifest assembler, schedule resolution, entitlement) ≥ 90%, per the P0 standard in `test-priorities-matrix.md`
- NFR validation evidence identified for every in-scope category (table above); full PASS/CONCERNS/FAIL status is explicitly deferred to `nfr-assess` once implementation evidence exists — not decided here
- Two UNKNOWN items — NFR-15's per-device verification procedure and the maintainability thresholds — currently cannot gate anything because neither is defined; resolving them into a concrete procedure/threshold is itself a precondition for future gate decisions in those categories

## Step 5: Generate Outputs & Validate

**Execution mode:** Sequential (single-worker) — the full risk/coverage analysis was already complete in this session's context, so parallel agent-team/subagent generation offered no benefit and risked reconciliation drift between the two documents.

**Outputs generated:**

- `_bmad-output/test-artifacts/test-design-architecture.md` — Architecture-facing document (268 lines): Quick Guide (4 blockers, 4 high-priority items, 3 info-only), full risk matrix (14 risks), NFR testability requirements, testability concerns/gaps, mitigation plans for the 3 highest-scoring risks, assumptions & dependencies.
- `_bmad-output/test-artifacts/test-design-qa.md` — QA-facing execution recipe (425 lines): Not in Scope, Dependencies & Test Blockers (with playwright-utils factory example), risk-to-QA-coverage mapping, NFR Test Coverage Plan, Entry/Exit Criteria, full P0–P3 coverage plan (~45 test scenarios, IDs P0-001…P3-002), execution strategy (PR/Nightly/standing-lab), effort estimate (~360–550h / ~9–14 weeks), implementation planning handoff, appendices.
- `_bmad-output/test-artifacts/test-design/lawha-v1-handoff.md` — BMAD handoff document: maps all 14 risks and P0/P1 scenarios onto the existing 8-epic structure in `epics.md`, per-epic quality gates, story-level AC recommendations, recommended TEA→BMAD workflow sequence.

**Validation against `checklist.md`:** All required sections present in both documents; risk IDs (R-1…R-14) and priority levels consistent across all three artifacts; no test implementation code in the architecture doc; execution strategy kept to the simple PR/Nightly/lab structure rather than a redundant tier breakdown; estimates given as ranges throughout, no false precision. Architecture doc runs longer than the suggested 150–200 line target (268 lines) — justified by whole-product system-level scope (14 risks across 9 capability areas) rather than a single feature.

**Key risks and gate thresholds:** R-1 (score 9, the 14-day unattended test) is the hard gate — no CI substitute exists, and one fully completed, passing burn-in run is required with no partial-run waiver. Six further risks score 6 (MITIGATE): manifest assembler correctness (R-2), recovery-ladder fault tolerance (R-3), cross-tenant data isolation (R-4), Merchant-of-Record vendor gap (R-5), best-effort device verification (R-6), and the flash-content-check heuristic (R-7).

**Open assumptions carried into the handoff:** certified-device hardware is procurable for a standing lab; the eventual MoR vendor's webhooks match AD-19's idempotency/ordering assumptions; the architecture's stated stack holds through implementation since no code exists yet to verify against.

## Post-Completion Update (2026-08-12)

**R-12 resolved by product-owner direction:** the NFR-13/AD-12 offline-threshold conflict (flagged as Testability Concern #2 and Blocker #2 in the Quick Guide) is closed. AD-12 in `ARCHITECTURE-SPINE.md` is corrected from "within 180s" to "within 300s (5 missed heartbeats)," matching NFR-13 exactly, with a note added under the spine's "Divergence from source" section. `test-design-architecture.md`, `test-design-qa.md`, and `lawha-v1-handoff.md` were all updated to strike R-12 and reflect the resolved value (P0-009's target is now unambiguous). This also surfaced and fixed a separate pre-existing gap: R-14 (self-declared device tier, score 2, DOCUMENT) had been dropped from the two generated documents and the handoff during Step 5 despite being present in this progress log's risk register — it is now included in all three output documents, bringing the total tracked risks back to a consistent 14 (7 high, 4 medium, 3 low — 1 of the 3 low risks, R-12, now resolved) everywhere.
