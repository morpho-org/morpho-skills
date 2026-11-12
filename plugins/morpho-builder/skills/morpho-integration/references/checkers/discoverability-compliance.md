# Discoverability compliance — Earn and Borrow

Read-only: review only owned criteria; do not edit code, copy, configuration, artifacts or external state. Read [SKILL.md](../../SKILL.md), [review.md](../review.md) and only the selected product references: [Vaults](../vault-v2.md), [Blue](../blue.md), [Midnight](../midnight.md), completely for applicable contracts/stories. Grade scoped V2/V1 compatibility, Blue and Midnight separately; V2-only illiquid actions do not apply to V1, and shared helpers do not imply shared correctness. The current skill/reference is the source of truth; do not infer missing design values.

## Owned checks

| Scope | Check | Priority | Pass condition |
| --- | --- | --- | --- |
| All | Product entry | Recommended | Product is findable from relevant home/asset surfaces, with named Morpho product rather than a generic bucket. Optional absent nudges may be `N-A` with reason. |
| All | Selection | Critical | Exact chain and market/vault identity, token(s), rate type/window, liquidity, risk/warnings and relevant manager are reachable; never select by rate or symbols alone. |
| All | Portfolio | Critical | Active positions appear in main portfolio with detail/manage/exit actions. A route that exists but cannot be reached is not discoverable. |
| All | Recovery access | Critical | Loading, empty, zero balance, rejected action and illiquid states retain an understandable next action; mobile/deep links do not strand users. |
| Earn | Vault selection | Critical | Vault/asset/curator, warnings, variable average rate/reward split and liquidity context are reachable; distinguish requested V1 compatibility from V2 default. |
| Selected | Manage and exit | Critical | Earn: Unavailable normal exit offers smaller known amount and supported force/in-kind recovery guidance on the same flow, not a hidden admin screen. Borrow: Portfolio exposes add collateral, partial/full repay, safe collateral withdrawal, and Midnight early asks/direct alternatives and maturity status. Reminders are not the only repayment entry. |
| Earn | Reward access | Critical | Claimable per-token list/Claim all/pending are findable beside Withdraw and after full exit; outstanding rewards are not hidden when active position disappears. |
| Earn | Contextual entry | Recommended | If eligible/idle-balance nudges exist they link to an identified vault with learn-more context; absence of optional nudges is `N-A`, not absence of portfolio/exit actions. |
| Borrow | Separate products | Critical | Blue variable/no-maturity and Midnight fixed/maturity are distinct through selection and portfolio; supported network selector does not hardcode Midnight to one chain. |
| Borrow | Alerts and history | Critical | A3 alert links directly to A4; A6 persistent banner and remaining-collateral action are findable when evidenced. Empty liquidation history does not fabricate events. |
| Borrow | Optional advanced routes | Recommended | Only applicable reallocation/advanced routes are offered with fee/context; open rolling and margin features are not required for a story to pass. |

## Evidence procedure

Inventory every applicable browse/detail/input/review/confirmation/portfolio/manage/exit surface, including mobile, deep links, loading, empty and failure states. Trace the interaction/state transition from entry to receipt and reconciled position; do not explore unrelated product features. Use safe fixtures for unavailable/dangerous states and label fixture vs live evidence. Missing artifact ⇒ `UNVERIFIED` with the exact test needed.

## Report

Return only the owned evidence table and summary, one section per scoped product:

| Check | Priority | Verdict | Evidence | Impact / smallest fix |
| --- | --- | --- | --- | --- |
| Use every owned row above | Critical / Recommended | `PASS` / `FAIL` / `UNVERIFIED` / `N-A` | File/line, response, rendered state or reproduction | Specific fix or missing artifact |

Overall: `PASS` / `FAIL` / `UNVERIFIED`. Include scope, missing evidence and open questions. Quote actual rendered copy or expressions where relevant; do not infer runtime success from code names or a build. Explain `N-A`. An open design/API value stays `UNVERIFIED`/open, never `FAIL` solely for being missing; inventing it or promising unsupported safety is a separate failure. Preserve the orchestrator's Critical/Recommended aggregation.
