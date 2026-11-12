# Borrow attribution checker

Read-only. Review only owned criteria below; do not edit artifacts or external state. Scope Blue, Midnight or both; return independent Blue/Midnight verdicts. Read [SKILL.md](../../SKILL.md), [review.md](../review.md), and [blue.md](../blue.md) / [midnight.md](../midnight.md) completely for applicable contract/stories. The current skill/reference is the source of truth; do not infer a missing design value.

## Owned checks

| Check | Priority | Pass condition |
| --- | --- | --- |
| Official asset | Critical | Use the official Powered by Morpho badge/web component or current official asset, not a redrawn or text-only imitation. |
| Interaction surfaces | Critical | Attribution is visible on detail, review, confirmation/status and position/manage/exit surfaces, including degraded and mobile states. |
| Role accuracy | Critical | Morpho Association is not presented as lender, custodian, guarantor, counterparty, risk assessor or curator without concrete role evidence; protocol attribution is not an endorsement. |
| Calldata attribution | Critical | If attribution is configured, pass `calldata_origin` as four-byte hex only on accepting intents; it is analytics, not authentication. Absence of optional attribution is `N-A` with reason, not an invented mandatory tag. |
| Referral disclosure | Critical | Where accepted, `referral_fee` is `{bps,recipient}` with integer `bps` 1–200; disclose recipient, fee token/cost and gross vs net receipt. Omit zero; do not inject unsupported fields or modify returned calls. |
| Persistent identity | Recommended | Product name, chain and exact market/vault identity persist through action/position states; receipt symbols do not replace identity. |

## Evidence procedure

Inventory every applicable browse/detail/input/review/confirmation/portfolio/manage/exit surface, including mobile, deep links, loading, empty and failure states. Inspect actual rendered official assets, responsive visibility, role copy and attribution/referral request fields; missing screens are `UNVERIFIED`, not proof of a missing badge. Use safe fixtures for unavailable/dangerous states and label fixture vs live evidence. Missing artifact ⇒ `UNVERIFIED` with the exact test needed.

## Report

Return only the owned evidence table and summary, one section per scoped product:

| Check | Priority | Verdict | Evidence | Impact / smallest fix |
| --- | --- | --- | --- | --- |
| Use every owned row above | Critical / Recommended | `PASS` / `FAIL` / `UNVERIFIED` / `N-A` | File/line, response, rendered state or reproduction | Specific fix or missing artifact |

Overall: `PASS` / `FAIL` / `UNVERIFIED`. Include scope, missing evidence and open questions. Quote actual rendered copy or expressions where relevant; do not infer runtime success from code names or a build. Explain `N-A`. An open design/API value stays `UNVERIFIED`/open, never `FAIL` solely for being missing; inventing it or promising unsupported safety is a separate failure. Preserve the orchestrator's Critical/Recommended aggregation.
