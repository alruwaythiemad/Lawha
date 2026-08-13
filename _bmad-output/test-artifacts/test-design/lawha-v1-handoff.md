---
title: 'TEA Test Design → BMAD Handoff Document'
version: '1.0'
workflowType: 'testarch-test-design-handoff'
inputDocuments:
  - '_bmad-output/test-artifacts/test-design-architecture.md'
  - '_bmad-output/test-artifacts/test-design-qa.md'
  - '_bmad-output/planning-artifacts/epics.md'
sourceWorkflow: 'testarch-test-design'
generatedBy: 'TEA Master Test Architect'
generatedAt: '2026-08-12'
projectName: 'lawha-v1'
---

# TEA → BMAD Integration Handoff

## Purpose

This document bridges TEA's system-level test design outputs for Lawha v1 with BMAD's epic/story decomposition (`bmad-create-epics-and-stories`, already run — see `_bmad-output/planning-artifacts/epics.md`). It maps the risk assessment and coverage plan onto the existing 8-epic structure so quality requirements flow into implementation.

## TEA Artifacts Inventory

| Artifact | Path | BMAD Integration Point |
|---|---|---|
| Test Design — Architecture | `_bmad-output/test-artifacts/test-design-architecture.md` | Epic quality gates, architectural blockers |
| Test Design — QA | `_bmad-output/test-artifacts/test-design-qa.md` | Story acceptance criteria, coverage plan |
| Risk Assessment | Embedded in both documents above (R-1…R-14) | Epic risk classification, story priority |
| Coverage Strategy | Embedded in `test-design-qa.md` (~45 scenarios, P0-001…P3-002) | Story test requirements |
| Progress log | `_bmad-output/test-artifacts/test-design-progress.md` | Full working notes behind both documents |

## Epic-Level Integration Guidance

### Risk References

P0/P1 risks that should appear as epic-level quality gates:

- **Epic 1 (Foundation):** R-4 (cross-tenant leak, score 6 — AD-27 binds from the first commit), R-9 (Clerk accessibility audit, score 4, unscheduled), R-10 (RTL/bidi lint-only coverage, score 4)
- **Epic 2 (Screens, Pairing & Status):** R-8 (entitlement race, score 4), R-14 (self-declared device tier, score 2). R-12 (offline-threshold conflict) was resolved 2026-08-12 — AD-12 now matches NFR-13 at 300s / 5 missed heartbeats.
- **Epic 3 (Player Display & Runtime Reliability):** R-1 (14-day test, score 9 — this epic is what criterion 1 is judged against), R-3 (recovery ladder, score 6), R-6 (best-effort device verification, score 6)
- **Epic 4 (Media Library):** R-7 (flash-check heuristic, score 6 — blocked on content policy + fixture corpus), R-11 (cache-key bandwidth risk, score 4)
- **Epic 5 (Playlists & Manifest Delivery):** R-2 (manifest assembler single point of failure, score 6)
- **Epic 6 (Scheduling):** no score-≥4 risk owns this epic directly, but AD-11's undefined staleness threshold (Testability Concern) blocks a clean P1-010 test
- **Epic 7 (Branches & Multi-location):** no score-≥4 risk; standard P1/P2 coverage only
- **Epic 8 (Billing, Entitlement, Trial Lifecycle):** R-5 (Merchant-of-Record vendor unselected, score 6)

### Quality Gates

Recommended per-epic gate, derived from the risk register:

| Epic | Gate before marking epic done |
|---|---|
| Epic 1 | Cross-tenant leak test (P0-011) green on every route added in this epic |
| Epic 2 | Entitlement race test (P0-010) green; offline threshold now fixed at 300s / 5 missed heartbeats (P0-009) |
| Epic 3 | 14-day burn-in (P0-001) completed and passing — no partial-run waiver; recovery-ladder tests (P0-002/003) green |
| Epic 4 | Flash-check (P0-012) blocked until content policy + fixture corpus exist — do not close the epic on this story without an explicit waiver from product owner |
| Epic 5 | Manifest determinism/recompute/validation tests (P0-013/014/015) green before any dependent epic (6, 7) is trusted |
| Epic 8 | Webhook idempotency/ordering (P0-018/019) green against the fake adapter; flag as CONCERNS until re-verified against the real vendor |

## Story-Level Integration Guidance

### P0/P1 Test Scenarios → Story Acceptance Criteria

Critical scenarios that should become explicit story acceptance criteria (test IDs from `test-design-qa.md`):

- **Story 1.5/1.6 (Foundation — workspace/auth/API):** P0-011 (cross-tenant leak), P0-021 (workspace-scoped data access)
- **Story 2.5/2.6 (Screen claim, entitlement, heartbeat):** P0-010 (entitlement race), P0-009 (read-time status)
- **Story 3.3/3.4 (Player caching, recovery):** P0-002, P0-003, P0-004, P0-005
- **Story 3.9 (Build versioning/canary):** P1-004
- **Story 4.x (Media upload):** P0-012 (flash check — flag as blocked until policy exists)
- **Story 5.x (Playlists/manifest assembler):** P0-013, P0-014, P0-015
- **Story 6.x (Scheduling):** P0-016, P1-010 (flag threshold as undefined)
- **Story 8.x (Billing/webhooks):** P0-018, P0-019, P0-020

### Data-TestId Requirements

No specific `data-testid` convention is defined in the architecture spine. Recommend the console/player component work in Epics 1–3 adopt a consistent `data-testid` scheme early (e.g., `screen-row-{id}`, `status-tag-{id}`) since CAP-16's fixture harness already requires every state to be independently reachable — the same hooks serve both the harness and future E2E coverage.

## Risk-to-Story Mapping

| Risk ID | Category | P×I | Recommended Story/Epic | Test Level |
|---|---|---|---|---|
| R-1 | BUS/OPS | 9 | Epic 3 (Player) | Hardware-lab E2E |
| R-2 | TECH | 6 | Epic 5 (Playlists & Manifest Delivery) | Unit + Integration |
| R-3 | TECH | 6 | Epic 3 (Player) | Component/Integration |
| R-4 | DATA/SEC | 6 | Epic 1 (Foundation) | API/Integration |
| R-5 | OPS/DATA | 6 | Epic 8 (Billing) | Integration (fake adapter, pending vendor) |
| R-6 | TECH/PLATFORM | 6 | Epic 3 (Player) | Hardware-lab E2E |
| R-7 | SEC/COMPLIANCE | 6 | Epic 4 (Media) | Integration (blocked on content policy) |
| R-8 | SEC | 4 | Epic 2 (Screens & Pairing) | API concurrency |
| R-9 | BUS/COMPLIANCE | 4 | Epic 1 (Foundation — auth) | Manual audit |
| R-10 | TECH | 4 | Epic 1 (Bilingual foundation) | Visual regression |
| R-11 | PERF/OPS | 4 | Epic 4/5 (Media/Manifest delivery) | Integration |
| ~~R-12~~ | TECH | ~~2~~ | Epic 2 (Screens & status) | **Resolved 2026-08-12** — AD-12 now 300s / 5 missed heartbeats |
| R-13 | DATA | 2 | Epic 2 (Screen management) | Covered by UX confirmation dialog, no separate test |
| R-14 | TECH/SEC | 2 | Epic 2 (Screens & status) | Boundary test only |

## Recommended BMAD → TEA Workflow Sequence

1. **TEA Test Design** (`test-design`) → this handoff document (complete)
2. **BMAD Create Epics & Stories** → already run (`_bmad-output/planning-artifacts/epics.md`); revisit story ACs per the Story-Level guidance above
3. **TEA ATDD** (`atdd`) → generate acceptance tests per story, starting with Epic 3's P0 scenarios (criterion 1 is judged against this epic)
4. **BMAD Implementation** → developers implement with test-first guidance
5. **TEA Automate** (`automate`) → generate full test suite once the architectural blockers (see `test-design-architecture.md` Quick Guide) are resolved
6. **TEA Trace** (`trace`) → validate coverage completeness and produce the gate decision

## Phase Transition Quality Gates

| From Phase | To Phase | Gate Criteria |
|---|---|---|
| Test Design | Epic/Story Creation | All P0 risks (R-1) have a mitigation strategy — done; epics already exist and should be re-checked against the Story-Level guidance above |
| Epic/Story Creation | ATDD | Stories have acceptance criteria reflecting the P0/P1 test scenarios listed above |
| ATDD | Implementation | Failing acceptance tests exist for all P0/P1 scenarios, especially Epic 3's player-reliability set |
| Implementation | Test Automation | All acceptance tests pass; R-1's 14-day burn-in has at least started |
| Test Automation | Release | Trace matrix shows ≥80% coverage of P0/P1 requirements; R-1 shows one fully completed, passing 14-day run |
