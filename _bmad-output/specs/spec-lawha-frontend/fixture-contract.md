# Fixture Contract — Lawha v1 Frontend

The seam between the presentation layer and the backend that does not exist yet. This file defines it so that wiring later is a substitution rather than a redesign.

Read alongside [SPEC.md](SPEC.md) and [surface-inventory.md](surface-inventory.md).

## The rule

**Every surface reads through one seam, and fixtures sit behind it.** No component fetches, imports a fixture file, or knows that its data is fake. Wiring replaces what backs the seam; it does not touch a component.

This is what makes the frontend-first bet safe. If a component reaches around the seam once, the wiring phase becomes a rewrite of that component, and the argument for building this layer first evaporates.

## Typing

Fixtures are typed by the contracts the real system will use — not by hand-written shapes that will need reconciling later.

- **Player-facing fixtures** are typed by `packages/manifest-contract` and validated by its runtime validator before a fixture is accepted. The player validates what it receives in a fixture build exactly as it will in production; an invalid fixture is rejected the same way an invalid manifest is.
- **Console-facing fixtures** are typed by `packages/domain` entity types: workspace, branch, screen, screen telemetry, media, playlist, playlist item, schedule, subscription.

Consequence worth stating: **`packages/manifest-contract` and the `packages/domain` entity types must be written as part of this work.** They are not backend. They are the vocabulary this layer renders, and writing them here is what forces the schema decisions to be honest rather than deferred.

## Configuration vs telemetry stays split

The architecture separates `screen` (console-owned configuration — name, branch, assigned playlist, timezone, device tier) from `screen_telemetry` (device-owned observation — last seen, current item, cache state, quarantined items, time confidence). **Fixtures keep the split.**

Collapsing them into one convenient object is the single easiest way to lose the truth contract, because it makes *assigned* and *playing* the same field. They are two facts from two writers and the fixture shape must say so.

## Time

Nothing in a fixture build heartbeats, so "last confirmed at 09:14" cannot come from a clock ticking. Fixtures carry **absolute timestamps relative to a fixed reference instant** that the harness pins, so a screenshot taken today and one taken next month show the same thing and the fourteen-day-old stale screen stays fourteen days old.

Storage is UTC; wall-clock scheduling carries an IANA timezone identifier; the wire is ISO 8601. Never a bare offset, never a local timestamp.

## The fixture set

One workspace, rich enough that every state in `surface-inventory.md` is reachable without inventing data mid-demo.

**Workspace** — one company, one subscription, a screen entitlement with headroom in the default fixture and a variant at its ceiling.

**Branches** — at least three, so grouping, per-branch health summaries, bulk assignment, and cross-timezone scheduling are all demonstrable. One is the implicit default branch, which must be invisible to a single-location view.

**Screens** — enough to cover, simultaneously:

- healthy and confirmed, on a certified device — carries no colour at all
- healthy and confirmed, on a best-effort device — carries the caveat tag while healthy
- unconfirmed for minutes — stale, with an absolute last-confirmed time and last-known content labelling
- unconfirmed for days — the same rules, far enough back that a relative string would obviously fail
- stopped by subscription termination
- assigned a playlist it has not yet confirmed playing — the two-confirmations case, and the one most likely to be rendered wrongly
- skipping a quarantined item — the console must surface this, and it is the one telemetry field with no other route to the interface

**Media** — images and video across the size range; one item at the 150 MB ceiling; one item in use by two playlists, so deletion can name them; a library large enough that the storage meter reads meaningfully against the **10 GB per screen, pooled** allowance — including a variant near the ceiling, for the at-limit state.

**Playlists** — one short, one at the 2–4 minute loop the product is designed around, one assigned to several screens across branches, one unassigned.

**Schedules** — overlapping windows that exercise all four precedence rules, so the resolved-outcome view has something non-trivial to resolve; a branch schedule with a per-screen override; a gap with no fallback, which is the customer-register holding card's trigger.

**Content in both scripts.** Playlist names, screen names, branch names and media filenames exist in Arabic, in English, and mixed — because mixed Arabic/Latin runs with prices and Latin brand names are precisely where cheap tools visibly fail, and a fixture set that is English-only cannot show it.

## Failure fixtures

Error states are not reachable by hoping something breaks. The seam exposes deliberate failure modes, at minimum:

- a read that fails entirely — the error state
- a read where one region resolves and another does not — the **partial** state, which is the one most often skipped and the one that shares a failure class with claiming a screen is playing
- a write that fails after an optimistic update — the rollback path for renames, reorders, duration edits, and branch moves
- an upload rejected for format, for size, and for codec — three distinct messages, never "invalid file"
- a pairing code that is wrong, one that is expired, and one that hits the entitlement ceiling — three distinct messages, each naming its next action

## What the harness does not do

It does not simulate the passage of time, does not simulate a heartbeat arriving, and does not model connectivity. Those belong to the player runtime, which is a non-goal here. The harness switches between fixed states; it does not animate between them.

The one thing it must do that a static fixture cannot: **let a person who is not the builder reach every state without editing a file.** That is how the success signal is judged.
