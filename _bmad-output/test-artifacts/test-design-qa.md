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

# Test Design for QA: Lawha v1

**Purpose:** Test execution recipe for QA/Dev. Defines what to test, how to test it, and what's needed from architecture before testing can begin.

**Date:** 2026-08-12
**Author:** BMad TEA (Master Test Architect)
**Status:** Draft
**Project:** Lawha v1 — bilingual digital signage

**Related:** See `test-design-architecture.md` for testability concerns and architectural blockers.

---

## Executive Summary

**Scope:** Full v1 product — player runtime/reliability, pairing/status, media, playlists, scheduling, bilingual layer, billing/entitlement, branches, plus tenancy and accessibility cross-cutting concerns. No code exists yet (greenfield); this plan targets the architecture as specified.

**Risk Summary:**

- Total Risks: 14 (7 high-priority score ≥6, 4 medium, 3 low — 1 of the 3 low risks, R-12, is now resolved — plus 1 unscored market risk noted for context)
- Critical Categories: TECH (manifest, recovery ladder) and BUS/OPS (the 14-day test itself) carry the highest-scoring risks

**Coverage Summary:**

- P0 tests: ~22 (player reliability, tenancy isolation, manifest correctness, billing state machine, accessibility)
- P1 tests: ~19 (bilingual polish, scheduling edges, media handling, billing detail)
- P2 tests: ~2 (secondary media/branch flows)
- P3 tests: ~2 (exploratory)
- **Total:** ~45 scenarios (~9–14 weeks for 1 person full-time, test-authoring only — see QA Effort Estimate)

**Note on P0 weight:** ~49% of scenarios are P0. This is deliberately high relative to typical feature work — the product's own primary success criterion is "zero manual intervention for 14 days," so player reliability, manifest correctness, and tenancy isolation carry P0 weight by design, not by default.

---

## Not in Scope

| Item | Reasoning | Mitigation |
|---|---|---|
| **Group H — public website (Arabic half) & public documentation** | Excluded from the epics run; blocked on the PRD's unresolved reason-to-buy item and has no UX pass yet | Revisit once the epics document adds Group H |
| **Real Merchant-of-Record webhook contract testing** | Vendor unselected; only the fake-adapter contract can be tested today | Contract-test against the fake adapter now (G1/G2); re-verify against the real vendor once selected |
| **NFR-11 (Saudi PDPL)** | Explicitly deferred until Gulf market entry | Revisit condition tracked in the architecture's Deferred list |
| **Maintainability thresholds (coverage %, duplication %)** | No threshold defined anywhere in PRD/architecture | Team must decide whether to define these or consciously defer for a solo-operator project |
| **EN 301 549 audit of the Clerk hosted-auth surface** | Open, unscheduled product-owner gate (UX-DR12) | Scheduled separately from this plan; tracked as R-9 |

**Note:** Items listed here have been reviewed and accepted as out-of-scope pending the noted conditions.

---

## Dependencies & Test Blockers

**CRITICAL:** Testing cannot proceed in the affected areas without these items.

### Backend/Architecture Dependencies (Pre-Implementation)

**Source:** See Architecture doc "Quick Guide" for full mitigation plans.

1. **Certified-device lab with remote telemetry** - Dev/Architecture - Before criterion 1 sign-off
   - Needed to run the 14-day burn-in (R-1) without physical inspection per failure
   - Blocks: any claim that criterion 1 has passed

2. **NFR-15 per-device Wake Lock verification procedure, defined** - Architecture - Before Epic 3 gate
   - Needed to certify any device, including the two named certified devices
   - Blocks: device-tier test scenarios (A10)

3. **FR-83 content policy + fixture corpus** - Product owner/Dev - Before Epic 4 gate
   - Needed to regression-test the flash-content heuristic (C2)
   - Blocks: C2 entirely until both exist

~~4. NFR-13/AD-12 offline-threshold reconciled~~ **RESOLVED 2026-08-12** — AD-12 corrected to 300s / 5 missed heartbeats, matching NFR-13 exactly (see Architecture Spine's Divergence from source). P0-009 now has a single, unambiguous target.

### QA Infrastructure Setup (Pre-Implementation)

1. **Test Data Factories** - Dev/QA
   - Workspace/screen/media/playlist factories at the `packages/domain`/`packages/adapters` boundary, bypassing HTTP where possible (no seeding API exists in the architecture — see Architecture doc's Testability Concerns)
   - Auto-cleanup fixtures for parallel safety, leveraging `workspace_id` as a free isolation boundary (AD-15)

2. **Test Environments**
   - Local: dev database branch per the architecture's `local → preview → production → canary → fleet` ladder
   - CI: preview branch, ephemeral per PR, with a rate-limit exemption on `POST /device/register` for parallel workers
   - Hardware lab: standing, continuous, independent of CI — Raspberry Pi + Android kiosk stick for certified-tier tests, ≥1 Tizen/webOS unit for best-effort spot checks

**Example factory pattern** (workspace-scoped, per AD-15's tenancy model):

```typescript
import { test } from '@seontechnologies/playwright-utils/api-request/fixtures';
import { expect } from '@playwright/test';
import { faker } from '@faker-js/faker';

test('workspace entitlement rejects pairing past the plan ceiling @p0', async ({ apiRequest }) => {
  const workspace = {
    id: `ws-${faker.string.uuid()}`,
    screenLimit: 1,
  };

  await apiRequest({ method: 'POST', path: '/api/test/workspaces', body: workspace });

  // First screen pairs successfully, consuming the single entitlement slot
  const firstClaim = await apiRequest({
    method: 'POST',
    path: '/api/screens/claim',
    body: { workspaceId: workspace.id, code: 'ABCDEF' },
  });
  expect(firstClaim.status).toBe(201);

  // Second claim against the same workspace must be rejected as an entitlement ceiling, not a pairing failure
  const secondClaim = await apiRequest({
    method: 'POST',
    path: '/api/screens/claim',
    body: { workspaceId: workspace.id, code: 'GHIJKL' },
  });
  expect(secondClaim.status).toBe(409);
  expect(secondClaim.body.code).toBe('entitlement_ceiling');
});
```

---

## Risk Assessment

**Note:** Full risk details in the Architecture doc. This section maps risks to QA validation.

### High-Priority Risks (Score ≥6)

| Risk ID | Category | Description | Score | QA Test Coverage |
|---|---|---|---|---|
| **R-1** | BUS/OPS | 14-day unattended test has no CI substitute | **9** | A1 (hardware-lab burn-in) |
| **R-2** | TECH | Manifest assembler is a single point of failure | 6 | D1, D2, D3 |
| **R-3** | TECH | Recovery ladder untested against real fault classes | 6 | A2, A3 |
| **R-4** | DATA/SEC | Cross-tenant leak via forgotten workspace scoping | 6 | B6, X1 |
| **R-5** | OPS/DATA | MoR vendor unselected; webhook semantics unverified | 6 | G1, G2, G5 (against fake adapter only, pending vendor) |
| **R-6** | TECH/PLATFORM | Tizen/webOS Wake Lock unverified | 6 | A10 (blocked on hardware acquisition) |
| **R-7** | SEC/COMPLIANCE | Flash-content check is heuristic; false-negative risk | 6 | C2 (blocked on content policy + corpus) |

### Medium/Low-Priority Risks

| Risk ID | Category | Description | Score | QA Test Coverage |
|---|---|---|---|---|
| R-8 | SEC | Entitlement race on concurrent pairing | 4 | B3 |
| R-9 | BUS/COMPLIANCE | Clerk auth surface accessibility audit unscheduled | 4 | Y2 (blocked, unscheduled) |
| R-10 | TECH | RTL/bidi relies on CI lint alone | 4 | F2 |
| R-11 | PERF/OPS | Cache-key bug could silently multiply bandwidth | 4 | C3 |
| ~~R-12~~ | TECH | ~~NFR-13/AD-12 threshold conflict~~ **RESOLVED 2026-08-12** | — | B2 — target is now 300s / 5 missed heartbeats |
| R-13 | DATA | No soft-delete; screen removal irreversible | 2 | Covered by Story 2.3's confirmation-dialog UX, not a separate test |
| R-14 | TECH/SEC | Device tier self-declared at registration; misconfigured device could over-claim "certified" | 2 | Boundary test — console should never contradict its tier claim against observed telemetry |

---

## NFR Test Coverage Plan

| NFR Category | Requirement / Threshold | Planned Validation | Tool / Level | Evidence Artifact | Priority |
|---|---|---|---|---|---|
| Reliability | NFR-1…7: 14-day survival, crash/cold-boot recovery, offline continuity, no OOM, offline detection ≤5min | Hardware-lab burn-in + fixture-harness fault injection | Hardware-lab / Integration | Burn-in dashboard log, heartbeat/quarantine telemetry export | P0 |
| Performance/Cost | NFR-12 (≤2GB/screen/month), NFR-13 (heartbeat/offline timing) | Cache-hit regression test + post-launch bandwidth monitoring | API/Integration | Regression test results; monthly bandwidth report once live | P1 |
| Usability | NFR-8 (15-min setup), NFR-9 (actionable errors) | Moderated usability session (manual, timed) + API contract test for error shape | Manual / API | Session timing sheet; contract-test results | P1 |
| Data protection | NFR-10 (EU/UK region, GDPR DPAs); NFR-11 (Saudi PDPL, deferred) | Infra config audit + subprocessor DPA registry | Manual config check | Region config export; DPA document list | P2 (NFR-11 N/A for v1) |
| Platform | NFR-14 (certified/best-effort matrix), NFR-15 (per-device verification) | Certified-device lab matrix; verification procedure itself TBD | Hardware-lab | Device certification checklist — blocked until procedure is defined | P0 |
| Security | Workspace-scoped tenancy, entitlement locking, secrets never in player bundle | Playwright E2E (leak/race tests) + static bundle secret-scan | API/E2E/Static | Cross-tenant leak test results; bundle scan report | P0 |
| Accessibility | CAP-17: WCAG 2.2 AA, 4 language/theme combos; Clerk surface excluded pending its own audit | Automated axe-core scan in CI + manual EN 301 549 audit (pending) | CI / Manual | CI a11y report; audit report once R-9 is scheduled | P0 |
| Maintainability | Not addressed in PRD/architecture | None defined | N/A | None — defaults to CONCERNS per NFR criteria | N/A |

**Missing thresholds or evidence sources:** NFR-15's verification procedure, AD-11's time-confidence staleness value, and all maintainability thresholds are undefined and need stakeholder clarification before `nfr-assess` can evaluate those categories. (NFR-13/AD-12's offline-threshold conflict was resolved 2026-08-12 — see below.)

---

## Entry Criteria

**Testing cannot begin until ALL of the following are met:**

- [ ] The 4 architectural blockers in the Dependencies section above are resolved (or explicitly descoped)
- [ ] Test environments provisioned (local dev-DB branch, CI preview branch with rate-limit exemption, hardware lab)
- [ ] Workspace/screen/media/playlist factories available at the domain/adapter boundary
- [ ] Certified-device hardware (Raspberry Pi + Android kiosk stick) procured and dedicated to the lab
- [ ] Feature deployed to the relevant preview environment

## Exit Criteria

**Testing phase is complete when ALL of the following are met:**

- [ ] All P0 tests passing (100%)
- [ ] All P1 tests passing, or failures triaged and explicitly accepted (≥95%)
- [ ] R-1 has one fully completed, passing 14-day burn-in run — no partial-run waiver
- [ ] All 7 high-priority risks (≥6) have documented mitigation status before their owning epic's gate closes
- [ ] Domain-layer unit coverage on the manifest assembler and schedule resolution ≥90%
- [ ] No open P0/P1 bugs
- [ ] NFR validation evidence collected for every in-scope category (full PASS/CONCERNS/FAIL deferred to `nfr-assess`)

---

## Test Coverage Plan

**Note:** P0/P1/P2/P3 = priority and risk level, NOT execution timing. See Execution Strategy below for when tests run.

### P0 (Critical)

**Criteria:** Blocks core functionality + high risk (≥6) + no workaround, or is the mechanical basis (manifest, tenancy) 5+ other capability areas depend on.

| Test ID | Requirement | Test Level | Risk Link | Notes |
|---|---|---|---|---|
| P0-001 | 14-day unattended burn-in, zero manual intervention | Hardware-lab E2E | R-1 | No CI substitute exists |
| P0-002 | Recovery ladder escalates correctly through all 4 rungs per fault class | Component/Integration | R-3 | Fixture-harness fault injection |
| P0-003 | Fault counter persists in IndexedDB across reload; repeat failures quarantined and reported | Integration | R-3 | |
| P0-004 | Offline playback continues uninterrupted; sync resumes automatically on reconnect | E2E (network interception) | NFR-4 | |
| P0-005 | Manifest revision activates only once every asset is cached | Integration (domain) | R-2 | |
| P0-006 | Wake lock held for the duration of playback (certified); muted-video fallback on sub-Chromium-84 engines | Hardware-lab E2E | R-6 | Blocked on Tizen/webOS hardware |
| P0-007 | Cold-boot recovery on certified devices resumes with no human input | Hardware-lab E2E | NFR-3 | |
| P0-008 | Pairing code single-use, 15-min expiry, auto-refresh | API | FR-16 | |
| P0-009 | Screen status derived solely from `last_seen` at read time; online window is 300s (5 missed heartbeats) | API/Integration | AD-12 | Threshold resolved 2026-08-12 (formerly R-12) |
| P0-010 | Concurrent claims at entitlement ceiling — exactly one succeeds | API concurrency test | R-8 | |
| P0-011 | Cross-tenant screen-list leak test | API | R-4 | |
| P0-012 | Flash-content check against curated fixture corpus | Integration | R-7 | Blocked on content policy + corpus |
| P0-013 | Manifest assembler produces no new revision for a no-op edit | Unit (domain) | R-2 | |
| P0-014 | Every manifest-affecting write recomputes revision only for touched screens, same transaction | Integration | R-2 | |
| P0-015 | Manifest failing validation is rejected on both write and read sides | Integration | AD-26 | |
| P0-016 | Server collapses all 4 precedence rules into a flat weekly timetable; player holds none | Unit (domain) | AD-14 | |
| P0-017 | CI fails build on physical left/right property or missing/concatenated catalogue key | CI/static | Self-enforcing | |
| P0-018 | Duplicate webhook delivery does not double-apply subscription state | Integration (fake adapter) | R-5 | |
| P0-019 | Webhook events applied by timestamp, not arrival order; stale events ignored | Integration | R-5 | |
| P0-020 | Subscription termination stops playback via manifest flip; device credential never revoked | Integration | AD-18 | |
| P0-021 | Every server route resolves workspace from session only, never request param/path/body | Static/lint + Integration | R-4 | |
| P0-022 | Automated WCAG 2.2 AA checks across console + player, all 4 language/theme combos | Automated a11y scan | CAP-17 | |

**Total P0:** ~22 tests

---

### P1 (High)

**Criteria:** Important features + medium risk (3-5) + common workflows + workaround exists but difficult.

| Test ID | Requirement | Test Level | Risk Link | Notes |
|---|---|---|---|---|
| P1-001 | Memory bounding — 1 item preloaded ahead, 2 DOM media elements, object URLs revoked | Integration/short soak | NFR-6 | |
| P1-002 | Corrupt/partial cache triggers re-fetch, not failure to start | Integration | FR-14 | |
| P1-003 | 403 on signed media URL triggers manifest re-fetch | Integration | AD-7 | |
| P1-004 | Player build-version pinning + canary rollout; rollback within one heartbeat | Integration | AD-8 | |
| P1-005 | Device credential rotates on re-pair, revokes on removal only | API | AD-20 | |
| P1-006 | Device API writes exactly one table (`screen_telemetry`) | Integration | AD-16 | |
| P1-007 | Upload ceilings enforced pre-transfer with specific rejection reasons | API/Component | FR-25, FR-26 | |
| P1-008 | Cache-hit regression — unchanged assets + rotated signed URLs produce zero re-downloads | Integration | R-11 | |
| P1-009 | "Assigned" and "playing" exposed as two distinct, never-collapsed facts | API/E2E | UX-DR2 | |
| P1-010 | Low-confidence fallback when last time-sync exceeds staleness threshold | Integration (clock-mocked) | AD-11 | Threshold value needs definition first |
| P1-011 | Branch-level schedule inheritance with per-screen override | Integration | FR-74 | |
| P1-012 | Visual-regression snapshots across all 4 language/theme combinations | Visual regression | R-10 | |
| P1-013 | Mixed Arabic/Latin runs wrapped in bidi-isolation markup | Component | FR-50 | |
| P1-014 | Bundled Arabic typeface available from offline cache | E2E (offline simulation) | FR-52 | |
| P1-015 | Trial branding removed within one heartbeat cycle of payment confirmation | E2E/Integration | FR-82 | |
| P1-016 | Four-verb payment port fully exercised against fake adapter | Integration | R-5 | |
| P1-017 | Branch bulk-assignment reports affected count, preserves per-screen override | API | UX-DR5 | |
| P1-018 | RLS stays enabled on every table as defence in depth | Integration | AD-4 | |
| P1-019 | EN 301 549 audit of the Clerk hosted-auth surface | Manual audit | R-9 | Blocked, unscheduled |

**Total P1:** ~19 tests

---

### P2 (Medium)

**Criteria:** Secondary features + low risk (1-2) + edge cases.

| Test ID | Requirement | Test Level | Risk Link | Notes |
|---|---|---|---|---|
| P2-001 | Media referenced by a playlist cannot be deleted; owner shown what's using it | API | FR-28 | |
| P2-002 | Screen moves between branches without re-pairing or content rebuild | API | FR-77 | |

**Total P2:** ~2 tests

---

### P3 (Low)

**Criteria:** Nice-to-have + exploratory + benchmarks.

| Test ID | Requirement | Test Level | Notes |
|---|---|---|---|
| P3-001 | Exploratory pass on console theme/language switching under rapid toggling | Manual/exploratory | Not a defined AC, spot-check only |
| P3-002 | Initial console/player load-time benchmark, no defined SLO | Manual benchmark | Baseline only, no NFR threshold exists to gate against |

**Total P3:** ~2 tests

---

## Execution Strategy

**Philosophy:** Run everything in PRs unless there's significant infrastructure overhead. Playwright with parallelization is fast; the hardware lab and hardware-dependent checks are the exception, not the rule.

### Every PR: Playwright + domain/API tests (~10-15 min)

- Domain-layer unit tests (manifest assembler P0-013/014, schedule resolution P0-016, entitlement math)
- Device/console API contract tests (error shape, P0-008, P1-005/006)
- CI static checks (P0-017's RTL/bidi/ICU lint, P0-021's workspace-scope lint)
- Cross-tenant isolation integration test (P0-011)
- Webhook idempotency against the fake adapter (P0-018/019)

**Why run in PRs:** Fast feedback, no expensive infrastructure.

### Nightly: Fixture-harness E2E + visual regression + a11y (~30-60 min)

- Full fixture-harness E2E across console + player states
- Visual-regression snapshots, 4 language/theme combinations (P1-012)
- Automated a11y scan (P0-022)
- Cache-hit-rate regression (P1-008)
- Short (2-4 hour) memory-profiled soak smoke test standing in for P1-001 between full soak runs

**Why defer to nightly:** Longer-running, not needed for every PR's fast feedback.

### Standing hardware lab (continuous, not CI-gated) + one-time gated items

- The 14-day certified-device burn-in (P0-001) runs continuously and independently — a lab, not a pipeline stage. Its clock starts as early as phase 1 allows per PRD §2.
- Best-effort device spot-checks (P0-006's Tizen/webOS half) run weekly once hardware is acquired.
- EN 301 549 Clerk audit (P1-019) and real Merchant-of-Record webhook re-verification run once, when their respective upstream blockers clear — not on a recurring cadence.

**Manual tests** (excluded from automation): moderated usability session (NFR-8), infra config/DPA audit (NFR-10/11), P3's exploratory items.

---

## QA Effort Estimate

**Test-authoring effort only** (no dedicated QA role exists for this solo-operator product per the PRD; assign to Dev owners):

| Priority | Count | Effort Range | Notes |
|---|---|---|---|
| P0 | ~22 | ~180–260 hours | Player reliability core, manifest, tenancy/security, billing state machine, a11y automation, hardware-lab setup |
| P1 | ~19 | ~120–180 hours | Bilingual visual regression, scheduling edges, billing lifecycle detail, branch bulk ops |
| P2 | ~2 | ~50–90 hours | Secondary media/branch flows (range reflects fixture/setup overhead, not per-test cost) |
| P3 | ~2 | ~10–20 hours | Exploratory, benchmarks |
| **Total** | ~45 | **~360–550 hours (~9–14 weeks, 1 person full-time)** | Excludes the 14-day lab's own wall-clock time, which is calendar time, not authoring effort |

**Assumptions:**

- Includes test design, implementation, debugging, CI integration
- Excludes ongoing maintenance (~10% effort) and the hardware lab's own real-time duration
- Assumes the test-data factory layer (see Dependencies) exists before Epic 1 test work begins

---

## Implementation Planning Handoff

| Work Item | Owner | Target Milestone | Dependencies/Notes |
|---|---|---|---|
| Certified-device lab setup + telemetry dashboard | Dev/Architecture | Before Epic 3 gate | Blocks P0-001, P0-006, P0-007 |
| Test-data factory layer (`packages/domain`/`packages/adapters`) | Dev | Before Epic 1 test work | No seeding API exists in the architecture |
| NFR-15 verification procedure defined | Architecture | Before Epic 3 gate | Blocks any device certification |
| FR-83 content policy + fixture corpus | Product owner/Dev | Before Epic 4 gate | Blocks P0-012 |
| ~~NFR-13/AD-12 threshold reconciled~~ | ~~Architecture~~ | ~~Before Epic 2 test work~~ | **Done 2026-08-12** — 300s / 5 missed heartbeats |

---

## Appendix A: Code Examples & Tagging

**Playwright Tags for Selective Execution:**

```typescript
import { test } from '@seontechnologies/playwright-utils/api-request/fixtures';
import { expect } from '@playwright/test';

// P0 critical test — cross-tenant isolation (P0-011)
test('@P0 @API @Security screens from workspace A are invisible to workspace B', async ({ apiRequest }) => {
  const { status: statusA } = await apiRequest({ method: 'POST', path: '/api/test/workspaces', body: { name: 'A' } });
  const { status: statusB } = await apiRequest({ method: 'POST', path: '/api/test/workspaces', body: { name: 'B' } });
  expect(statusA).toBe(201);
  expect(statusB).toBe(201);

  const { body } = await apiRequest({ method: 'GET', path: '/api/screens', headers: { 'x-workspace': 'B' } });
  expect(body.screens.find((s: { workspaceId: string }) => s.workspaceId === 'A')).toBeUndefined();
});

// P1 integration test — manifest revision determinism (P0-013, listed here as an example pattern)
test('@P1 @Integration no-op playlist edit produces no new manifest revision', async ({ apiRequest }) => {
  const before = await apiRequest({ method: 'GET', path: '/api/screens/screen-1/manifest' });

  await apiRequest({ method: 'PATCH', path: '/api/playlists/playlist-1', body: { name: 'Same Name' } });

  const after = await apiRequest({ method: 'GET', path: '/api/screens/screen-1/manifest' });
  expect(after.body.revision).toBe(before.body.revision);
});
```

**Run specific tags:**

```bash
# Run only P0 tests
npx playwright test --grep @P0

# Run P0 + P1 tests
npx playwright test --grep "@P0|@P1"

# Run only security tests
npx playwright test --grep @Security

# Run all Playwright tests in PR (default)
npx playwright test
```

---

## Appendix B: Knowledge Base References

- **Risk Governance**: `risk-governance.md` - Risk scoring methodology
- **Probability-Impact Scale**: `probability-impact.md` - P×I scoring definitions
- **Test Priorities Matrix**: `test-priorities-matrix.md` - P0-P3 criteria
- **Test Levels Framework**: `test-levels-framework.md` - E2E vs API vs Unit selection
- **Test Quality**: `test-quality.md` - Definition of Done (no hard waits, <300 lines, <1.5 min)
- **NFR Criteria**: `nfr-criteria.md` - NFR validation approach by category
- **ADR Quality Readiness Checklist**: `adr-quality-readiness-checklist.md` - 8-category testability framework

---

**Generated by:** BMad TEA Agent
**Workflow:** `bmad-testarch-test-design`
**Version:** 4.0 (BMad v6)
