# PRD Quality Review — Lawha

Reviewer: quality rubric (seven dimensions). Date: 2026-08-11. Stakes: launch.

## Overall verdict

This is an unusually honest PRD. It names its own weaknesses, records decisions it disagrees with, corrects a factual error in its own analysis, and identifies scope growth it caused itself — the decision-readiness and scope-honesty dimensions are genuinely strong and rare. What is at risk is coherence and executability: the PRD's largest single investment (the bilingual layer) serves nobody in the launch market by the document's own admission, the gating success criterion is not reflected in any sequencing, and roughly a dozen requirements are not testable as written. The document is safe for architecture and unsafe for story creation without a done-ness pass.

## Decision-readiness — strong

Decisions appear as decisions with their costs attached. § 4.3 states plainly what the browser-first architecture cannot deliver and retires the "runs on any TV" claim rather than quietly keeping it. FR-63 records the counter-argument to the choice that was made. § 1.1 leaves the reason-to-buy explicitly undefined instead of manufacturing one, and attributes ownership. § 9 names the PRD's own scope growth as the most immediate risk. A reader pushing back on almost any decision here will find their objection already stated.

### Findings

- **high** No plan or pricing structure exists anywhere in the document (§ 5 Group G) — FR-58 says "select a plan," FR-59 enforces "more screens than their plan allows," FR-29 shows "storage consumed against the plan allowance," and FR-78 says billing is "per screen." Nothing states how many plans exist, what they contain, or what a screen costs. Billing is unbuildable as specified, and § 11.2 defers pricing to "before launch," which is later than the build needs it. *Fix:* specify plan **structure** in the PRD (how many tiers, what varies between them, what the entitlement axis is) and let the actual numbers stay deferred.
- **low** § 1.1's recorded-but-not-adopted wedge candidate is correctly attributed, but a reader could mistake it for the PRD hedging. *Fix:* one clause stating that no wedge is claimed until the owner adopts one.

## Substance over theater — strong

Almost no furniture. Two primary users, both of whom generate requirements; no persona padding. NFRs carry product-specific numbers (fourteen days, fifteen minutes, 150 MB, one heartbeat cycle) rather than "scalable and secure." § 6 maps every reliability requirement to a catalogued real-world failure with the failure named in a column — this is the strongest section in the document. Media ceilings are derived from encoding maths and browser quota behaviour rather than picked.

### Findings

- **medium** NFR-12 ("designed for aggressive local caching so that recurring bandwidth per screen stays viable") is the one NFR with no bound. Bandwidth cost is a named risk in § 9 and a stated constraint on the price. *Fix:* state a target ceiling, e.g. expected GB per screen per month at typical loop size.
- **low** FR-80's "never overlapping the focal area of the content" has no definition of focal area. *Fix:* replace with a geometric bound.

## Strategic coherence — thin

The PRD states three defining properties: bilingual as architecture, truth about screens, grows with the customer. The launch market makes the first worthless — a fact § 1.1 states outright rather than hides. The result is that the largest and most technically demanding differentiating investment in v1 (Group F, eleven requirements plus a tax on every other surface) serves zero launch customers, while the reason a launch customer would buy remains undefined. The document is honest about this; it is still incoherent as a plan.

The second incoherence is sequencing. § 2 says "Criterion 1 is the gate on everything. Until it passes, no other work counts as progress." § 4.1 then specifies a v1 containing a website, bilingual documentation, multi-branch management, and subscription billing — none of which is required to run a TV unattended for fourteen days. The PRD asserts a priority order and then describes a scope that does not follow it.

### Findings

- **critical** Ordered success criteria (§ 2) have no corresponding scope sequencing (§ 4.1). The PRD names criterion 1 as the gate on everything and then presents v1 as an undifferentiated list. *Fix:* split § 4.1 into what is needed to reach criterion 1 and what follows it. This costs nothing and converts a stated priority into an executable one.
- **high** Group F is the largest differentiating investment and, per § 1.1, serves no launch customer. The decision was made deliberately and confirmed, so this is not a request to reverse it — but the PRD does not state what would make it wrong, or when Arabic-market entry needs to happen for the investment to pay back. *Fix:* name the condition under which the bilingual bet is judged.
- **medium** Success metrics (§ 8) measure the product but not the thesis, because the thesis is incomplete. The metrics table cannot validate a reason-to-buy that does not exist yet. *Fix:* revisit once § 1.1 closes.

## Done-ness clarity — thin

This is the weakest dimension and the one story creation will hit first. Many requirements are properly testable — FR-2, FR-25, FR-71, FR-78, FR-82 all have unambiguous pass conditions. A significant cluster is not.

Requirements that cannot currently be tested:

- **FR-6** — "detects its own failure … stalled playback … unresponsive render loop." No detection threshold. How long is stalled?
- **FR-10** — "bounds its memory use." No bound given.
- **FR-11** — "without discarding playback position unnecessarily." Undefined qualifier.
- **FR-16** — "expire after a defined window." The window is never defined.
- **FR-39 / FR-74** — "defined, visible precedence" between overlapping schedules, and between branch and screen schedules. The precedence rules are asserted to exist but are stated nowhere. Two requirements point at a rule the document does not contain.
- **FR-47** — "fully mirrored RTL layout." Enumerates examples but gives no completion condition.
- **NFR-7** — "within a defined threshold," which defers to NFR-13, which defers the values. Circular.
- **NFR-9** — "states what happened and what to do about it" is a good principle without a test.

### Findings

- **critical** FR-39 and FR-74 both depend on schedule precedence rules that appear nowhere in the PRD. Overlapping schedules and branch-versus-screen inheritance are the two places a scheduling implementation will silently diverge from intent. *Fix:* state the precedence rules explicitly — most specific wins, or last-created wins, or explicit priority field.
- **high** Roughly eight requirements use undefined qualifiers ("unnecessarily," "a defined window," "fully mirrored," "bounds"). *Fix:* a done-ness pass converting each into a bound, a threshold, or a named condition before story creation.
- **medium** § 6 promises "each becomes an explicit acceptance test" but no acceptance criteria are written. For a launch PRD whose first success criterion is a fourteen-day physical test, the test definitions are load-bearing. *Fix:* an acceptance section, or explicit hand-off of that duty to the test-design workflow.

## Scope honesty — strong

Among the best-handled dimensions. § 4.2 lists exclusions explicitly rather than by omission. The branches-versus-agency-workspaces distinction is drawn twice, in both places it could be confused. § 4.3 states a capability boundary and retires an over-claim. § 4.2 flags roles as the most likely first customer request while keeping it out. § 9 names the PRD's own scope growth. § 11.2 gives every deferred item an owner and a revisit condition. A correction to an earlier factual error was propagated rather than buried.

### Findings

- **medium** No Assumptions Index. Four inline tags exist across the document with no collected list, so a reader cannot see the full assumption surface in one place. *Fix:* add an index to § 11 listing each tag and its location.

## Downstream usability — thin

The PRD will feed architecture, UX, and story creation, so this dimension carries real weight.

**No glossary.** The document uses a precise domain vocabulary — workspace, branch, screen, player, playlist, schedule, certified, best-effort, holding card, entitlement, heartbeat — and the reader must infer each from use. The workspace → branch → screen hierarchy is defined once inside Group I rather than anywhere a reader would look first.

**Actor drift.** § 3 establishes "venue operator" and "multi-branch operator" as the users. The requirements then say "an owner" seventeen times and "operator" seven times, and NFR-8 says "user." Three nouns for one role.

**ID discontinuity.** IDs run A(1–14), B(15–23), I(70–78), C(24–30), D(31–37), E(38–44), F(45–55), G(56–63c, 79–82), H(64–69). Groups are out of sequence, and FR-6a and FR-63a–c are suffixed rather than numbered. The document explains this and the trade-off is defensible, but any downstream tooling that assumes contiguity will need to be told otherwise.

### Findings

- **high** No glossary. *Fix:* add one; define the workspace/branch/screen hierarchy there rather than only inside Group I.
- **medium** Actor-noun drift between § 3 and § 5. *Fix:* pick one term and apply it everywhere.
- **low** Suffixed IDs (FR-6a, FR-63a–c) and non-sequential group ordering. *Fix:* acceptable as documented; confirm the story workflow tolerates it.

## Shape fit — adequate

A capability-spec shape is right for this product: a single operator role, a mostly CRUD dashboard, and a player whose requirements are engineering constraints rather than experiences. The absence of user journeys is defensible on those grounds and § 6's failure-mapped table is a better fit than journeys would have been.

One exception matters. Criterion 2 — the fifteen-minute test — is a gating success criterion, and it is a journey: unbox, power on, see a code, enter it, upload, see content. The PRD represents it as a single line (NFR-8) with no description of the flow, no statement of the steps, and no indication of where the fifteen minutes is spent. Group H now places the start of that journey on the website, which widens it further. The one place this product genuinely needs a journey is the one place it has none.

### Findings

- **high** The setup journey underlying criterion 2 and NFR-8 is unspecified, despite being a gating criterion and now spanning website, purchase, pairing, and first upload. *Fix:* one journey walking unbox to content-on-screen, with the fifteen minutes allocated across steps. This is also the artefact the UX workflow will most want.

## Mechanical notes

- **Cross-references:** all resolve. § 1.1, § 1.2, § 2, § 4.2, § 4.3, § 6 references verified after the § 9–§ 11 renumbering. No stale pointers.
- **ID continuity:** unique, no duplicates, non-contiguous by design and documented.
- **Glossary:** absent.
- **Assumptions Index:** absent; four inline tags.
- **User journeys:** none; defensible except as noted under Shape fit.
- **Required sections for launch stakes:** present, with pricing structure the notable omission.
