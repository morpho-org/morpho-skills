# Earn discoverability checker

Read-only. Review only owned criteria below; do not edit artifacts or external state. Scope Vault V2 and explicitly scoped V1 compatibility; keep version-specific applicability separate. Read [SKILL.md](../../SKILL.md), [review.md](../review.md), and [vault-v2.md](../vault-v2.md) completely for applicable contract/stories. The current skill/reference is the source of truth; do not infer a missing design value.

## Owned checks

| Check | Priority | Pass condition |
| --- | --- | --- |
| Product entry | Recommended | Product is findable from relevant home/asset surfaces, with named Morpho product rather than a generic bucket. Optional absent nudges may be `N-A` with reason. |
| Selection | Critical | Exact chain and market/vault identity, token(s), rate type/window, liquidity, risk/warnings and relevant manager are reachable; never select by rate or symbols alone. |
| Portfolio | Critical | Active positions appear in main portfolio with detail/manage/exit actions. A route that exists but cannot be reached is not discoverable. |
| Recovery access | Critical | Loading, empty, zero balance, rejected action and illiquid states retain an understandable next action; mobile/deep links do not strand users. |
| Vault selection | Critical | Vault/asset/curator, warnings, variable average rate/reward split and liquidity context are reachable; distinguish requested V1 compatibility from V2 default. |
| Illiquid exits | Critical | Unavailable normal exit offers smaller known amount and supported force/in-kind recovery guidance on the same flow, not a hidden admin screen. |
| Reward access | Critical | Claimable per-token list/Claim all/pending are findable beside Withdraw and after full exit; outstanding rewards are not hidden when active position disappears. |
| Contextual entry | Recommended | If eligible/idle-balance nudges exist they link to an identified vault with learn-more context; absence of optional nudges is `N-A`, not absence of portfolio/exit actions. |

## Evidence procedure

Inventory every applicable browse/detail/input/review/confirmation/portfolio/manage/exit surface, including mobile, deep links, loading, empty and failure states. Trace the interaction/state transition from entry to receipt and reconciled position; do not explore unrelated product features. Use safe fixtures for unavailable/dangerous states and label fixture vs live evidence. Missing artifact ⇒ `UNVERIFIED` with the exact test needed.

## Report

Return only the owned evidence table and summary, one section per scoped product:

| Check | Priority | Verdict | Evidence | Impact / smallest fix |
| --- | --- | --- | --- | --- |
| Use every owned row above | Critical / Recommended | `PASS` / `FAIL` / `UNVERIFIED` / `N-A` | File/line, response, rendered state or reproduction | Specific fix or missing artifact |

Overall: `PASS` / `FAIL` / `UNVERIFIED`. Include scope, missing evidence and open questions. Quote actual rendered copy or expressions where relevant; do not infer runtime success from code names or a build. Explain `N-A`. An open design/API value stays `UNVERIFIED`/open, never `FAIL` solely for being missing; inventing it or promising unsupported safety is a separate failure. Preserve the orchestrator's Critical/Recommended aggregation.
