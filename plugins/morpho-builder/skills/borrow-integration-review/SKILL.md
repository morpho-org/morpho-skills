---
name: borrow-integration-review
description: Orchestrated compliance review of a Morpho borrow integration — variable rate (Blue), fixed rate (Midnight), or both — against Morpho's integrator playbook — spawns one compliance agent per playbook foundation, aggregates verdicts into the rubric checklist, then checks flow red flags. Use whenever a user asks to review, audit, QA, or pre-launch-check a Morpho borrow/loan/leverage/term-loan integration, its screens, or its copy — even if they just say "check my borrow flow".
---

# Borrow Integration Review (Blue & Midnight)

An orchestrated review of a borrow integration against the Morpho Integrator UX Playbook. You are the **orchestrator**: the per-foundation compliance agents do the check-level work — each agent carries its own checks and fail signals — and report back; you aggregate their verdicts into the rubric checklist, judge red flags, and deliver one report.

**Baseline checklist:** [docs/rubrics.md](../../docs/rubrics.md) — read it first. For borrow, the applicable rows are the **Shared** table plus the **Variable Rate Borrow** and/or **Fixed Rate Borrow** tables, depending on which rate types the integration offers. Every applicable row appears in the final report, cited by its criterion (e.g. "fails Origination fee shown as your fee, separate").

## Procedure

1. **Scope the review.** Identify what's being reviewed: a codebase (find the UI components, copy, quoting and transaction logic), screenshots, or a written flow description. Determine which rate types the integration offers — variable (Blue), fixed (Midnight), or both — and collect the concrete artifact paths; the agents need both.
2. **Spawn all seven compliance agents in one message** so they run in parallel. Each gets: the artifact paths/context, the rate type(s) — "variable-rate borrow (Blue)", "fixed-rate borrow (Midnight)", or both — and the instruction to run its checks and report verdicts.
   - `morpho-builder:vocabulary-compliance` — product vocabulary
   - `morpho-builder:attribution-compliance` — Powered by Morpho badge
   - `morpho-builder:disclosure-compliance` — disclosure gate
   - `morpho-builder:rate-transparency-compliance` — rate labelling and fixed/variable distinction, fee separation, orderbook quoting
   - `morpho-builder:conversion-compliance` — bundled borrow, live preview, input affordances, manage flows
   - `morpho-builder:clarity-safety-compliance` — recap order, tooltips, warnings, live health/LTV/liquidation, market transparency, safe default LTV, maturity display and obligation, required collateral
   - `morpho-builder:discoverability-compliance` — value prop, nudges, integrated position
3. **While agents run, do the red-flag pass yourself** — holistic judgments that need the whole flow in view, not a single row. Flag the flow as weak if any of these are true:
   - More than one signature for a single borrow.
   - The headline rate is below the fold or smaller than secondary details.
   - No live preview of the outcome or health as the user types.
   - Risk (LTV, liquidation, low liquidity, maturity) surfaced only after confirmation.
   - A rate whose fixed-vs-variable nature is ambiguous on any screen.
   - A fixed-rate quote that doesn't move when the borrow amount changes, or isn't refreshed before signing.
   - Protocol jargon (LLTV, shares, IRM, orderbook mechanics, oracle scaling) in the primary flow instead of behind a tooltip or advanced reveal.
   - An eligible-asset prompt that doesn't lead to a CTA.
   - More than a tap or two to learn what market the user is borrowing from.
4. **Aggregate.** Match each agent's named checks to the rubric rows in [docs/rubrics.md](../../docs/rubrics.md) — the names correspond one-to-one. Every applicable row must land a verdict; a row no agent could assess is UNVERIFIED, never guessed. If an agent contradicts your own observation, re-check the evidence — every verdict must be traceable to a file, screenshot, or quoted flow step.
5. **Report** in this exact structure — every Shared row plus the Variable and/or Fixed rows for the rate types offered appears once, split into the playbook's three goals using the rubric's Goal column (Compliance → **Compliant**; Conversion → **Converts, grows TVL**; Clarity and Discoverability → **Smooth & discoverable**), keeping rubric order within each group:

```
# Borrow Integration Review

## Verdict
<one paragraph: overall state; rate types covered; count of Critical / Recommended / Nice-to-have failures>

## Compliant
| Criterion | Priority | Verdict | Evidence / Fix |
| --- | --- | --- | --- |
| Approved vocabulary | Critical | PASS / FAIL / UNVERIFIED / N-A | <evidence for the verdict; for FAIL, the shortest fix> |
| ... every Compliance-goal row ... | | | |

## Converts, grows TVL
| Criterion | Priority | Verdict | Evidence / Fix |
| --- | --- | --- | --- |
| ... every Conversion-goal row ... | | | |

## Smooth & discoverable
| Criterion | Priority | Verdict | Evidence / Fix |
| --- | --- | --- | --- |
| ... every Clarity- and Discoverability-goal row ... | | | |

## Red flags
<any triggered flow red flags, with evidence>

## Launch self-review
<the checklist below, checked off from the findings>
```

Rules: every verdict needs evidence (full file path, screen, or quoted description); a single Critical failure means the integration is not launch-ready — say so plainly in the Verdict paragraph.

6. **Launch self-review**, checked off from the findings (skip lines for a rate type the integration doesn't offer):
   - [ ] Is the language aligned (no staking / investment / guaranteed / risk-free)?
   - [ ] Is "Powered by Morpho" visible wherever users interact with Morpho functionality?
   - [ ] Is there a distinct moment where users acknowledge Morpho's disclaimer?
   - [ ] Is every rate clearly labelled **variable** or **fixed**, and are the two products distinguishable?
   - [ ] Is the rate transparent about its components, with the integrator's fee separated?
   - [ ] Can a user name the market they're using without leaving the flow?
   - [ ] Are health, LTV, and liquidation shown live and before confirmation?
   - [ ] Fixed: is the maturity and its consequence unmistakable?
   - [ ] Fixed: is the quote requoted on input change and re-simulated before signature?
   - [ ] Fixed: is the required collateral computed and shown from the borrow amount?
   - [ ] Does borrow complete in a single signature where the protocol allows?
   - [ ] Do eligible-asset prompts actually lead somewhere?
