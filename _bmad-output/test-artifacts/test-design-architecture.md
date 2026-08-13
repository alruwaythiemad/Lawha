---
workflowStatus: 'completed'
totalSteps: 5
stepsCompleted: ['step-01-detect-mode', 'step-02-load-context', 'step-03-risk-and-testability', 'step-04-coverage-plan', 'step-05-generate-output']
lastStep: 'step-05-generate-output'
nextStep: ''
lastSaved: '2026-08-12'
workflowType: 'testarch-test-design'
inputDocuments:
  - '_bmad-output/planning-artifacts/prds/prd-the_project-2026-08-11/prd.md'
  - '_bmad-output/planning-artifacts/architecture/architecture-the_project-2026-08-11/ARCHITECTURE-SPINE.md'
  - '_bmad-output/planning-artifacts/epics.md'
---

# Test Design for Architecture: Lawha v1

**Purpose:** Architectural concerns, testability gaps, and NFR requirements for review by Architecture/Dev teams. Serves as a contract between QA and Engineering on what must be addressed before test development begins.

**Date:** 2026-08-12
**Author:** BMad TEA (Master Test Architect)
**Status:** Architecture Review Pending
**Project:** Lawha v1 — bilingual digital signage
**PRD Reference:** `_bmad-output/planning-artifacts/prds/prd-the_project-2026-08-11/prd.md`
**ADR Reference:** `_bmad-output/planning-artifacts/architecture/architecture-the_project-2026-08-11/ARCHITECTURE-SPINE.md` (AD-1…AD-27)

---

## Executive Summary

**Scope:** Full v1 product — browser player, dashboard, public website (English-only slice), media, playlists, scheduling, bilingual layer, billing, branches. Group H's Arabic half and public docs excluded from epic scope but still bound by this architecture.

**Business Context** (from PRD):

- **Problem:** Signage software that tells the truth about screen status and is bilingual (English/Arabic) from the first commit, sold self-serve to non-technical venue owners.
- **Success gate:** Success criterion 1 — a real TV plays unattended for 14 consecutive days, surviving a power cut and a Wi-Fi outage, zero manual intervention. Nothing else counts as progress until this passes.
- **GA Launch:** No date fixed; phase 1 (player + auth + media + playlists) must clear criterion 1 before phase 2 (billing, scheduling, website) begins.

**Architecture** (from Architecture Spine, 27 architecture decisions):

- **Key Decision 1:** Ports and adapters — `packages/domain` imports no vendor SDK; Clerk, Supabase, Merchant of Record, R2 sit behind adapters (AD-1).
- **Key Decision 2:** The player is a supervised state machine over a local cache — one manifest revision, fixed recovery ladder, no DB access, 3-endpoint server surface (AD-3, AD-5, AD-9).
- **Key Decision 3:** Stack: Next.js 16.3/React 19 console, Preact 10/Vite player (Chromium 76 floor), Supabase Postgres 17 (EU), Clerk, Cloudflare R2/Pages, Vercel. No code exists yet — this is a greenfield build.

**Expected Scale:** Solo-operator, self-serve product; no stated RPS/volume targets. Screen count is the only billed unit and is unbounded by plan tier.

**Risk Summary:**

- **Total risks:** 14
- **High-priority (≥6):** 7 risks (1 BLOCK, 6 MITIGATE) requiring action before their owning epic's gate closes
- **Test effort:** ~40 scenarios across 9 capability areas (see companion QA doc), ~360–550 hours of authoring effort excluding the 14-day lab's own wall-clock time

---

## Quick Guide

### 🚨 BLOCKERS - Team Must Decide (Can't Proceed Without)

1. **R-1: No CI substitute for the 14-day unattended test** — Architecture must support remote diagnosis (heartbeat/quarantine telemetry) so a dedicated hardware lab can run continuously without physical inspection per failure (recommended owner: Dev/Architecture).
2. **NFR-15's per-device Wake Lock verification procedure is undefined** — who runs it and what counts as pass is not specified anywhere in the source documents; blocks certifying any device, including the two named certified devices (recommended owner: Architecture/Dev).
3. **R-7: FR-83's flash-content check has no content policy or fixture corpus yet** — the PRD names the content policy as still-to-be-authored; blocks any regression test of the client-side heuristic (recommended owner: Product owner/Dev).

**What we need from team:** Resolve these 2 items pre-implementation of the affected epics (1: Epic 2/3; 2: Epic 4), or test development in those areas is blocked. ~~R-12 (NFR-13/AD-12 offline-threshold conflict)~~ **RESOLVED 2026-08-12** — AD-12 corrected to 300 s / 5 missed heartbeats to match NFR-13 exactly (see Architecture Spine's Divergence from source).

---

### ⚠️ HIGH PRIORITY - Team Should Validate (We Provide Recommendation, You Approve)

1. **R-2/R-3: Manifest assembler and recovery ladder are the two structural cores** the rest of the system depends on — recommend exhaustive domain-layer unit + integration coverage before any dependent epic (5, 6, 7) is trusted (implementation phase).
2. **R-5: Merchant-of-Record vendor is unselected** — recommend contract-testing the internal 4-verb payment port against a fake adapter now, re-verifying against the real vendor's webhook shape once selected (implementation phase).
3. **R-6: Tizen/webOS Wake Lock and muted-video fallback are unverified** — recommend acquiring ≥1 representative unit before any best-effort claim is published in docs or marketing (implementation phase).
4. **R-9: Clerk hosted-auth surface's EN 301 549 accessibility audit is an open, unscheduled gate** — recommend scheduling it before any unqualified product-level WCAG-AA claim is published (implementation phase).

**What we need from team:** Review recommendations and approve (or suggest changes).

---

### 📋 INFO ONLY - Solutions Provided (Review, No Decisions Needed)

1. **Test strategy:** unit for pure domain logic (manifest hash, schedule precedence, entitlement), integration for service/API boundaries, E2E/hardware-lab reserved for what only real devices prove (see companion QA doc for the full breakdown).
2. **Coverage:** ~40 scenarios prioritized P0–P3 across 9 capability areas plus tenancy and accessibility cross-cutting concerns.
3. **NFR planning:** every in-scope NFR category has a planned evidence source identified (see below); two categories (NFR-15 procedure, maintainability thresholds) are currently UNKNOWN and cannot be evidenced until defined.

**What we need from team:** Review and acknowledge.

---

## For Architects and Devs - Open Topics 👷

### Risk Assessment

**Total risks identified:** 14 (7 high-priority score ≥6, 4 medium, 3 low — 1 of the 3 low risks, R-12, is now resolved)

#### High-Priority Risks (Score ≥6) - IMMEDIATE ATTENTION

| Risk ID | Category | Description | Probability | Impact | Score | Mitigation | Owner | Timeline |
|---|---|---|---|---|---|---|---|---|
| **R-1** | **BUS/OPS** | 14-day unattended test has no CI substitute; PRD states first attempt will fail | 3 | 3 | **9** | Dedicated always-on certified-device lab with heartbeat/quarantine telemetry; start the clock as early as phase 1 allows; run devices in parallel | Dev/Architecture | Before criterion 1 sign-off |
| **R-2** | **TECH** | Manifest assembler (AD-5/6/25/26) is a single point of failure touching 5 of 9 FR groups | 2 | 3 | 6 | Exhaustive domain-layer unit tests + contract tests on `manifest-contract`, both write and read sides | Dev | Before Epic 5 gate |
| **R-3** | **TECH** | Recovery ladder (AD-9) untested against real Chromium-76-era fault classes | 2 | 3 | 6 | Certified-device burn-in lab with fault injection (process kill, IndexedDB corruption, network throttling) | Dev | Before Epic 3 gate |
| **R-4** | **DATA/SEC** | Cross-tenant leak via a route forgetting `workspace_id` scoping — the exact risk AD-27 names | 2 | 3 | 6 | Two-workspace leak test on every route; type-level enforcement of required workspace argument | Dev | Before Epic 1 gate |
| **R-5** | **OPS/DATA** | Merchant-of-Record vendor unselected; webhook idempotency/ordering unverified against a real vendor | 2 | 3 | 6 | Contract-test the 4-verb port against a fake adapter now; re-verify once vendor is selected | Product owner/Dev | Before phase-2 shipping |
| **R-6** | **TECH/PLATFORM** | Best-effort device Wake Lock (Tizen/webOS) unverified | 3 | 2 | 6 | Acquire ≥1 representative unit; validate muted-video fallback | Dev | Before Epic 3 gate |
| **R-7** | **SEC/COMPLIANCE** | Client-side flash check (FR-83) is heuristic; false negative = physical-harm exposure on a public wall | 2 | 3 | 6 | Curated fixture corpus with known ground truth; finalize content policy before ship | Dev/Product owner | Before Epic 4 gate |

#### Medium-Priority Risks (Score 3-5)

| Risk ID | Category | Description | Probability | Impact | Score | Mitigation | Owner |
|---|---|---|---|---|---|---|---|
| R-8 | SEC | Entitlement race on concurrent pairing (AD-17) could over-provision screens | 2 | 2 | 4 | Concurrency test at entitlement ceiling; assert DB constraint rejects the (N+1)th | Dev |
| R-9 | BUS/COMPLIANCE | Clerk auth surface's EN 301 549 audit is open and unscheduled | 2 | 2 | 4 | Schedule before any unqualified WCAG-AA claim | Product owner |
| R-10 | TECH | RTL/bidi relies almost entirely on CI lint (AD-21/22), not runtime assertions | 2 | 2 | 4 | Add visual-regression snapshots across 4 language/theme combos (CAP-17) | Dev |
| R-11 | PERF/OPS | Cache-key bug (URL vs. hash) would silently multiply bandwidth, surfacing only as an invoice | 2 | 2 | 4 | Regression test asserting zero re-download on signed-URL rotation with unchanged assets | Dev |

#### Low-Priority Risks (Score 1-2)

| Risk ID | Category | Description | Probability | Impact | Score | Action |
|---|---|---|---|---|---|---|
| ~~R-12~~ | TECH | ~~NFR-13 vs. AD-12 offline-threshold conflict~~ **RESOLVED 2026-08-12** — AD-12 corrected to 300s / 5 missed heartbeats, matching NFR-13 exactly | — | — | — | Closed — no further action |
| R-13 | DATA | No soft-delete anywhere in v1; screen removal is immediate and irreversible | 1 | 2 | 2 | Monitor — mitigated by confirmation-dialog UX already in Story 2.3 |
| R-14 | TECH/SEC | Device tier (certified/best-effort) is self-declared at registration (AD-16); a misconfigured device could claim "certified" and receive guarantees the console then advertises as reliable | 1 | 2 | 2 | Monitor — low near-term risk in a single-actor v1 product with no adversarial third-party integrators |

#### Risk Category Legend

- **TECH**: Technical/Architecture — **SEC**: Security — **PERF**: Performance — **DATA**: Data Integrity — **BUS**: Business Impact — **OPS**: Operations

---

### NFR Testability Requirements

| NFR Category | Threshold / Requirement | Current Design Support | Gap / Decision Needed | Planned Evidence |
|---|---|---|---|---|
| Reliability | NFR-1…7: 14-day survival, crash/cold-boot recovery, offline playback, no OOM, offline detection ≤5min | Supported by design (AD-3/5/8/9/10/11/23); no CI substitute exists | R-1 blocker; offline-detection threshold now fixed at 300s (R-12 resolved 2026-08-12) | Hardware-lab burn-in log, fault-injection test results |
| Security | Workspace-scoped tenancy (AD-4/15/27), entitlement locking (AD-17), no secrets in player bundle (AD-20) | Strongly supported by design | R-4, R-8 need explicit adversarial tests, not just happy-path | Cross-tenant leak test, concurrency test, bundle secret-scan |
| Performance/Cost | NFR-12: ≤2GB/screen/month via content-hash caching (AD-7) | Supported by design | R-11 — no existing test asserts the cache-hit invariant | Cache-hit regression test; post-launch bandwidth report |
| Platform | NFR-14/15: certified vs. best-effort matrix, per-device Wake Lock verification | Structurally defined | Verification procedure itself undefined (blocker); Tizen/webOS unverified (R-6) | Device certification checklist (cannot be produced until procedure is defined) |
| Accessibility | CAP-17: WCAG 2.2 AA, 4 language/theme combos; Clerk surface excluded pending its own audit | Precisely defined (Story 1.4 ACs) | R-9 — Clerk's EN 301 549 audit unscheduled | Automated a11y CI report; audit report once scheduled |
| Maintainability | Not addressed anywhere in PRD/architecture beyond general discipline | Not designed | No coverage %, duplication %, or CI quality gate defined | None — defaults to CONCERNS per NFR criteria until team decides |

**Unknown thresholds:** NFR-15's verification procedure (who runs it, what evidence counts as pass) and all maintainability thresholds (coverage %, duplication %) are UNKNOWN — converted to blockers/risks above, not guessed.

**Assessment boundary:** Final PASS/CONCERNS/FAIL status belongs in `nfr-assess` after implementation evidence exists.

---

### Testability Concerns and Architectural Gaps

**🚨 ACTIONABLE CONCERNS - Architecture Team Must Address**

#### 1. Blockers to Fast Feedback

| Concern | Impact | What Architecture Must Provide | Owner | Timeline |
|---|---|---|---|---|
| No test-data seeding API anywhere in the architecture | Integration/E2E setup must go through full API round-trips, slower and coupled to code under test | At minimum, a workspace-scoped factory layer at the `packages/domain`/`packages/adapters` boundary usable directly in integration tests, bypassing HTTP | Dev | Before Epic 1 test infra work |
| Time-dependent assertions (AD-12's 300s window, AD-11's undefined staleness threshold, FR-16's 15-min expiry, FR-63a's dunning schedule) have no test-environment override | Tests either wait out real wall-clock time or need a documented clock-mock path | A documented way to fast-forward/mock the server clock and the player's monotonic-offset logic in test builds | Dev | Before Epic 2/6 test work |
| `POST /device/register` rate limiting (per-IP + global) has no test-environment carve-out | Parallel CI workers pairing fixture screens against the same environment risk throttling into flakiness | A test-environment rate-limit exemption or generously raised limit | Dev | Before Epic 2 CI setup |

#### 2. Architectural Improvements Needed

1. **AD-11's time-confidence staleness threshold is unspecified**
   - **Current problem:** The rule ("when the last sync is too old, resolution is low-confidence") has no numeric value anywhere in the loaded documents.
   - **Required change:** Architecture must state the threshold explicitly.
   - **Impact if not fixed:** E2 (schedule-fallback scenario) cannot be written as a deterministic test.
   - **Owner:** Architecture
   - **Timeline:** Before Epic 6 test work

---

### Testability Assessment Summary

**📊 CURRENT STATE - FYI**

#### What Works Well

- ✅ `workspace_id` as the sole tenancy key (AD-15) makes test isolation nearly free — no `user_id`/`branch_id` special-casing to trip over.
- ✅ No scheduled background work anywhere in v1 (AD-13) eliminates an entire class of flaky "wait for the job queue" tests.
- ✅ Screen status as a pure read-time function of `last_seen` (AD-12), not a stored/reconciled column, reduces status tests to seed-query-assert.
- ✅ The device's entire server surface is three narrow, versioned, DB-free endpoints (AD-3) — fully exercisable via HTTP with no browser.
- ✅ The manifest is a single server-computed content hash (AD-6), assembled in exactly one place (AD-25), validated by one shared schema on both sides (AD-26) — a strong, deterministic assertion surface.
- ✅ Hard-delete only, no soft-delete columns — teardown is a real `DELETE`, not a flag to remember.
- ✅ Every API error carries a stable machine code plus an ICU key (NFR-9) — mechanically assertable, not string-matched against translated copy.
- ✅ The fixture harness (CAP-16) drives all eight player states and all console states with no backend, and is required to be absent from production builds — testable itself.

#### Accepted Trade-offs (No Action Required)

- **No soft-delete / no undo on screen removal (R-13)** — deliberate, mitigated by a confirmation dialog already specified in Story 2.3.
- **Device declares its own tier at registration (AD-16)** — acceptable for a single-actor v1 product with no adversarial third-party integrators; revisit if the trust model changes.

---

### Risk Mitigation Plans (High-Priority Risks ≥6)

#### R-1: 14-day unattended test has no CI substitute (Score: 9) - BLOCKER

**Mitigation Strategy:**

1. Stand up a certified-device lab (Raspberry Pi + Android kiosk stick) that runs continuously, independent of the CI pipeline.
2. Instrument every device with the heartbeat/quarantine telemetry the player already reports (AD-9), so failures are diagnosable remotely.
3. Start the 14-day clock as early as phase 1 allows, per PRD §2's explicit instruction, and run multiple devices in parallel to amortize the 14-day cost across iterations.

**Owner:** Dev/Architecture
**Timeline:** Before criterion 1 sign-off
**Status:** Planned
**Verification:** One fully completed, passing 14-day run with zero manual intervention — no partial-run waiver.

#### R-2: Manifest assembler is a single point of failure (Score: 6) - HIGH

**Mitigation Strategy:**

1. Exhaustive domain-layer unit tests for hash determinism (no-op edit → no new revision).
2. Integration tests confirming every write recomputes the revision only for the screens it touches, inside the same transaction.
3. Contract tests validating `manifest-contract`'s schema on both write and read sides.

**Owner:** Dev
**Timeline:** Before Epic 5 gate
**Status:** Planned
**Verification:** Domain-layer coverage ≥90% on the assembler module; contract tests green in CI.

#### R-4: Cross-tenant leak via forgotten workspace scoping (Score: 6) - HIGH

**Mitigation Strategy:**

1. Type-level enforcement that every data-access function requires a workspace argument, resolved from session only.
2. Automated test creating two workspaces and asserting zero cross-visibility on every list/read/write route.

**Owner:** Dev
**Timeline:** Before Epic 1 gate (AD-27 binds all server-side access from the first commit)
**Status:** Planned
**Verification:** Leak test suite green against every route added in Epic 1 onward, run in PR.

---

### Assumptions and Dependencies

#### Assumptions

1. The architecture's stated stack (Next.js 16.3, Preact 10, Supabase 17, Clerk, Cloudflare R2/Pages, Vercel) holds through implementation — no code exists yet to verify against.
2. Certified-device hardware (Raspberry Pi, Android kiosk stick) is procurable and can be dedicated to a standing lab, not shared with other work.
3. The Merchant-of-Record vendor, once selected, exposes webhooks compatible with AD-19's idempotency/ordering assumptions (dedupe by event ID, apply by event timestamp).

#### Dependencies

1. **Merchant-of-Record vendor selection** — required before R-5 can be closed and before phase-2 shipping (architecture's own Deferred list).
2. **≥1 representative Tizen/webOS device** — required before R-6 can be closed and before any best-effort Wake Lock claim is published.
3. **FR-83 content policy, finalized and versioned** — required before R-7's fixture corpus can be built.
4. **NFR-15's per-device verification procedure, defined** — required before any device (certified or best-effort) can be formally certified.

#### Risks to Plan

- **Risk:** The 14-day lab's real-time nature means schedule slip compounds — a failed run costs 14 more days with no way to accelerate.
  - **Impact:** Delays every downstream phase, since criterion 1 gates phase 2.
  - **Contingency:** Run multiple devices in parallel from the start (per R-1's mitigation) so one failure doesn't serialize the whole timeline.

---

**End of Architecture Document**

**Next Steps for Architecture Team:**

1. Review Quick Guide (🚨/⚠️/📋) and prioritize the 4 blockers.
2. Assign owners and timelines for the 7 high-priority risks (≥6).
3. Validate assumptions and dependencies, especially the 3 external unknowns (MoR vendor, Tizen/webOS hardware, flash-check content policy).
4. Provide feedback to QA on testability gaps (test-data factory layer, clock-mock path, rate-limit exemption).

**Next Steps for QA Team:**

1. Wait for the 4 pre-implementation blockers to be resolved.
2. Refer to the companion QA doc (`test-design-qa.md`) for the full test scenario coverage plan.
3. Begin test infrastructure setup (factories, fixtures, environments) per the Dependencies section there.
