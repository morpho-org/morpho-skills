# Disclosure compliance — Earn and Borrow

Read-only: review only owned criteria; do not edit code, copy, configuration, artifacts or external state. Read [SKILL.md](../../SKILL.md), [review.md](../review.md) and only the selected product references: [Vaults](../vault-v2.md), [Blue](../blue.md), [Midnight](../midnight.md), completely for applicable contracts/stories. Grade scoped V2/V1 compatibility, Blue and Midnight separately; V2-only illiquid actions do not apply to V1, and shared helpers do not imply shared correctness. The current skill/reference is the source of truth; do not infer missing design values.

## Owned checks

| Scope | Check | Priority | Pass condition |
| --- | --- | --- | --- |
| All | First-use gate | Critical | Before the first transaction, actively acknowledge integrator terms, Morpho disclaimer and product risks. No preselected checkbox or bypass via deep link, remembered state, alternate wallet/action or direct route. |
| All | Review and consent | Critical | Explain account/chain, amounts, before→after position and wallet deltas, signatures, calls, gas, fees and deadline before wallet prompts. Label final calls pending until available; final call review precedes send. |
| All | Changed outcome | Critical | No silent fallback changes action, guard, slippage, repayment mode, penalty tolerance, received assets/positions or recipient. Material changes require renewed review/consent. |
| All | Privacy and record | Recommended | Acknowledgment version/time is auditable without logging secrets, raw signatures or unnecessary wallet data. Missing runtime gate evidence is `UNVERIFIED`, not a pass. |
| Selected | Product risks | Critical | Earn: Cover variable/non-guaranteed yield, contracts, curator/configuration/adapters, underlying markets/oracles, liquidity, vault/integrator fees and reward eligibility/variability. Blue: Cover variable-rate/debt accrual, collateral/oracle price, LLTV/liquidation, market liquidity, contracts, rewards and applicable reallocation costs before first use. Midnight: Cover fixed term/maturity, bids/quote/fill, secondary liquidity, oracle/collateral, pre/post-maturity liquidation, contracts, settlement/continuous fees and direct repayment cost. |
| Selected | Action review | Critical | Earn: Native wrap, amount/shares, vault/asset, fees and expiry are visible. Ordinary withdraw has no execution-time maximum-share/minimum-assets guarantee; never misstate preparation slippage as an on-chain bound. Borrow: Show exact market/account/chain, collateral, debt/units at maturity, LTV/LLTV, liquidation consequence and wallet receipt/cost; guards and deadlines are visible, proposed health bands not marketed as confirmed design. |
| Selected | Exit consent | Critical | Earn: Separate penalty consent before force/in-kind exit; show token penalty, idle/in-kind split, received Blue position and residual liquidity risk. Full-force/in-kind penalty cap is preparation-only and full-force has no on-chain deadline. Borrow: Partial/full repay, collateral release and early market vs direct face-value exit are distinct. Ask-side quote includes liquidity, cost vs face value, residual debt and explicit direct fallback. |
| Earn | Claim consent | Critical | Explain chain-wide eligible tokens, cumulative proof-bound amount, pending vs claimable, selected Distributor/recipient and claim separate from withdrawal; unsupported reward layers are labeled, not silently batched. |

## Evidence procedure

Inventory every applicable browse/detail/input/review/confirmation/portfolio/manage/exit surface, including mobile, deep links, loading, empty and failure states. Trace every entry into the first wallet interaction; test gate bypasses with direct URLs, alternate actions, restored state and wallet changes. A modal after a wallet prompt is too late. Use safe fixtures for unavailable/dangerous states and label fixture vs live evidence. Missing artifact ⇒ `UNVERIFIED` with the exact test needed.

## Report

Return only the owned evidence table and summary, one section per scoped product:

| Check | Priority | Verdict | Evidence | Impact / smallest fix |
| --- | --- | --- | --- | --- |
| Use every owned row above | Critical / Recommended | `PASS` / `FAIL` / `UNVERIFIED` / `N-A` | File/line, response, rendered state or reproduction | Specific fix or missing artifact |

Overall: `PASS` / `FAIL` / `UNVERIFIED`. Include scope, missing evidence and open questions. Quote actual rendered copy or expressions where relevant; do not infer runtime success from code names or a build. Explain `N-A`. An open design/API value stays `UNVERIFIED`/open, never `FAIL` solely for being missing; inventing it or promising unsupported safety is a separate failure. Preserve the orchestrator's Critical/Recommended aggregation.
