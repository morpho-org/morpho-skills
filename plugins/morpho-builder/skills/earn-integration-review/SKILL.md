---
name: earn-integration-review
description: Orchestrated compliance review of an Earn (Morpho Vaults) integration against Morpho's integrator playbook — spawns one compliance agent per playbook foundation, aggregates verdicts into the rubric checklist, then checks flow red flags. Use whenever a user asks to review, audit, QA, or pre-launch-check a Morpho vault/earn/yield integration, its screens, or its copy — even if they just say "check my earn flow".
---

# Earn Integration Review (Vaults)

An orchestrated review of an Earn integration against the Morpho Integrator UX Playbook. You are the **orchestrator**: the per-foundation compliance agents do the check-level work — each agent carries its own checks and fail signals — and report back; you aggregate their verdicts into the rubric checklist, judge red flags, and deliver one report.

**Baseline checklist:** [docs/rubrics.md](../../docs/rubrics.md) — read it first. For Earn, the applicable rows are the **Shared** table plus the **Earn** table. Every applicable row appears in the final report, cited by its criterion (e.g. "fails Curator named").

## Procedure

1. **Scope the review.** Identify what's being reviewed: a codebase (find the UI components, copy, and transaction logic), screenshots, or a written flow description. Collect the concrete artifact paths — the agents need them.
2. **Spawn all seven compliance agents in one message** so they run in parallel. Each gets: the artifact paths/context, the product ("Earn on Morpho Vaults"), and the instruction to run its checks and report verdicts.
   - `morpho-builder:vocabulary-compliance` — product vocabulary
   - `morpho-builder:attribution-compliance` — Powered by Morpho badge
   - `morpho-builder:disclosure-compliance` — disclosure gate
   - `morpho-builder:rate-transparency-compliance` — rate labelling, APY split, fee separation
   - `morpho-builder:conversion-compliance` — one-signature deposit, live preview, input affordances, benefits messaging
   - `morpho-builder:clarity-safety-compliance` — recap order, tooltips, warnings, vault transparency (name, curator, collateral, TVL/liquidity)
   - `morpho-builder:discoverability-compliance` — value prop, nudges, integrated position
3. **While agents run, do the red-flag pass yourself** — holistic judgments that need the whole flow in view, not a single row. Flag the flow as weak if any of these are true:
   - More than one signature for a single deposit.
   - The headline rate is below the fold or smaller than secondary details.
   - No live preview of the outcome as the user types.
   - Risk (low liquidity, withdrawal caps) surfaced only after confirmation.
   - A rate whose fixed-vs-variable nature is ambiguous on any screen.
   - Protocol jargon (shares, IRM, oracle scaling) in the primary flow instead of behind a tooltip or advanced reveal.
   - An idle-balance or eligible-asset prompt that doesn't lead to a CTA.
   - More than a tap or two to learn what a vault is exposed to, or who curates it.
4. **Aggregate.** Match each agent's named checks to the rubric rows in [docs/rubrics.md](../../docs/rubrics.md) — the names correspond one-to-one. Every applicable row must land a verdict; a row no agent could assess is UNVERIFIED, never guessed. If an agent contradicts your own observation, re-check the evidence — every verdict must be traceable to a file, screenshot, or quoted flow step.
5. **Report** in this exact structure — every Shared and Earn row appears once, split into the playbook's three goals using the rubric's Goal column (Compliance → **Compliant**; Conversion → **Converts, grows TVL**; Clarity and Discoverability → **Smooth & discoverable**), keeping rubric order within each group:

```
# Earn Integration Review

## Verdict
<one paragraph: overall state; count of Critical / Recommended / Nice-to-have failures>

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

6. **Launch self-review**, checked off from the findings:
   - [ ] Is the language aligned (no staking / investment / guaranteed / risk-free)?
   - [ ] Is "Powered by Morpho" visible wherever users interact with Morpho functionality?
   - [ ] Is there a distinct moment where users acknowledge Morpho's disclaimer?
   - [ ] Is every rate clearly labelled **variable**?
   - [ ] Is the APY transparent about its components and the token each part pays in?
   - [ ] Can a user name the vault they're depositing into without leaving the flow?
   - [ ] Is the curator named somewhere a user will actually look?
   - [ ] Are the headline benefits (no lock-ups, autocompounding, non-custodial) visible on product detail?
   - [ ] Is there a path to learn more about Morpho from the product-detail screen?
   - [ ] Does deposit complete in a single signature where the protocol allows?
   - [ ] Do idle-balance prompts actually lead somewhere?
