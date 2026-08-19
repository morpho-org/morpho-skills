---
name: borrow-integration-review
description: Orchestrated compliance review of a Morpho borrow integration — variable rate (Blue), fixed rate (Midnight), or both — against Morpho's integrator playbook — spawns one compliance agent per playbook foundation, aggregates verdicts into the rubric checklist, then judges the whole flow for weaknesses. Use whenever a user asks to review, audit, QA, or pre-launch-check a Morpho borrow/loan/leverage/term-loan integration, its screens, or its copy — even if they just say "check my borrow flow".
---

# Borrow Integration Review (Blue & Midnight)

An orchestrated review of a borrow integration against the Morpho Integrator UX Playbook. You are the **orchestrator**: the per-foundation compliance agents do the check-level work — each agent carries its own checks and fail signals — and report back; you aggregate their verdicts into the rubric checklist, judge the whole flow, and deliver one report.

**Baseline checklist:** [references/rubrics.md](references/rubrics.md) — read it first. For borrow, the applicable rows are the **Shared** table plus the **Variable Rate Borrow** and/or **Fixed Rate Borrow** tables, depending on which rate types the integration offers. Every applicable row appears in the final report, cited by its criterion (e.g. "fails Origination fee shown as your fee, separate").

## Procedure

1. **Scope the review.** Identify what's being reviewed: a codebase (find the UI components, copy, quoting and transaction logic), screenshots, or a written flow description. Determine which rate types the integration offers — variable (Blue), fixed (Midnight), or both — and collect the concrete artifact paths; the agents need both.
2. **Delegate all seven compliance checks in parallel.** Give every checker the artifact paths/context, the rate type(s) — "variable-rate borrow (Blue)", "fixed-rate borrow (Midnight)", or both — and the instruction to review only and report verdicts. Use a host-native named agent when available; otherwise spawn a general-purpose subagent and tell it to read and follow the bundled checker file. If the host cannot run subagents, run the same seven checker files sequentially yourself; do not skip a foundation.

   | Foundation | Claude Code agent | Codex project agent | Bundled checker |
   | --- | --- | --- | --- |
   | Product vocabulary | `morpho-integration:vocabulary-compliance` | `morpho_vocabulary_compliance` | [vocabulary-compliance.md](references/checkers/vocabulary-compliance.md) |
   | Powered by Morpho | `morpho-integration:attribution-compliance` | `morpho_attribution_compliance` | [attribution-compliance.md](references/checkers/attribution-compliance.md) |
   | Disclosure gate | `morpho-integration:disclosure-compliance` | `morpho_disclosure_compliance` | [disclosure-compliance.md](references/checkers/disclosure-compliance.md) |
   | Rate transparency | `morpho-integration:rate-transparency-compliance` | `morpho_rate_transparency_compliance` | [rate-transparency-compliance.md](references/checkers/rate-transparency-compliance.md) |
   | Conversion mechanics | `morpho-integration:conversion-compliance` | `morpho_conversion_compliance` | [conversion-compliance.md](references/checkers/conversion-compliance.md) |
   | Clarity & safety | `morpho-integration:clarity-safety-compliance` | `morpho_clarity_safety_compliance` | [clarity-safety-compliance.md](references/checkers/clarity-safety-compliance.md) |
   | Discoverability | `morpho-integration:discoverability-compliance` | `morpho_discoverability_compliance` | [discoverability-compliance.md](references/checkers/discoverability-compliance.md) |
3. **While agents run, do the whole-flow pass yourself** — holistic judgments that need the whole flow in view, not a single row. Flag the flow as weak if any of these are true:
   - More than one signature for a single borrow.
   - The headline rate is below the fold or smaller than secondary details.
   - No live preview of the outcome or health as the user types.
   - Risk (LTV, liquidation, low liquidity, maturity) surfaced only after confirmation.
   - A rate whose fixed-vs-variable nature is ambiguous on any screen.
   - A fixed-rate quote that doesn't move when the borrow amount changes, or isn't refreshed before signing.
   - Protocol jargon (LLTV, shares, IRM, orderbook mechanics, oracle scaling) in the primary flow instead of behind a tooltip or advanced reveal.
   - An eligible-asset prompt that doesn't lead to a CTA.
   - More than a tap or two to learn what market the user is borrowing from.
4. **Aggregate.** Match each agent's named checks to the rubric rows in [references/rubrics.md](references/rubrics.md) — the names correspond one-to-one. Every applicable row must land a verdict; a row no agent could assess is UNVERIFIED, never guessed. If an agent contradicts your own observation, re-check the evidence — every verdict must be traceable to a file, screenshot, or quoted flow step.
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
```
