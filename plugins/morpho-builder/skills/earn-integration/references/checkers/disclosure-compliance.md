# Earn disclosure checker

Read-only. Review only owned criteria below; do not edit artifacts or external state. Scope Vault V2 and explicitly scoped V1 compatibility; keep version-specific applicability separate. Read [SKILL.md](../../SKILL.md), [review.md](../review.md), and [vault-v2.md](../vault-v2.md) completely for applicable contract/stories. The current skill/reference is the source of truth; do not infer a missing design value.

## Owned checks

| Check | Priority | Pass condition |
| --- | --- | --- |
| First-use gate | Critical | Before the first transaction, actively acknowledge integrator terms, Morpho disclaimer and product risks. No preselected checkbox or bypass via deep link, remembered state, alternate wallet/action or direct route. |
| Review and consent | Critical | Explain account/chain, amounts, before→after position and wallet deltas, signatures, calls, gas, fees and deadline before wallet prompts. Label final calls pending until available; final call review precedes send. |
| Changed outcome | Critical | No silent fallback changes action, guard, slippage, repayment mode, penalty tolerance, received assets/positions or recipient. Material changes require renewed review/consent. |
| Privacy and record | Recommended | Acknowledgment version/time is auditable without logging secrets, raw signatures or unnecessary wallet data. Missing runtime gate evidence is `UNVERIFIED`, not a pass. |
| Vault risks | Critical | Cover variable/non-guaranteed yield, contracts, curator/configuration/adapters, underlying markets/oracles, liquidity, vault/integrator fees and reward eligibility/variability. |
| Deposit/withdraw protection | Critical | Native wrap, amount/shares, vault/asset, fees and expiry are visible. Ordinary withdraw has no execution-time maximum-share/minimum-assets guarantee; never misstate preparation slippage as an on-chain bound. |
| Illiquid exits | Critical | Separate penalty consent before force/in-kind exit; show token penalty, idle/in-kind split, received Blue position and residual liquidity risk. Full-force/in-kind penalty cap is preparation-only and full-force has no on-chain deadline. |
| Claim consent | Critical | Explain chain-wide eligible tokens, cumulative proof-bound amount, pending vs claimable, selected Distributor/recipient and claim separate from withdrawal; unsupported reward layers are labeled, not silently batched. |

## Evidence procedure

Inventory every applicable browse/detail/input/review/confirmation/portfolio/manage/exit surface, including mobile, deep links, loading, empty and failure states. Trace every entry into the first wallet interaction; test gate bypasses with direct URLs, alternate actions, restored state and wallet changes. A modal after a wallet prompt is too late. Use safe fixtures for unavailable/dangerous states and label fixture vs live evidence. Missing artifact ⇒ `UNVERIFIED` with the exact test needed.

## Report

Return only the owned evidence table and summary, one section per scoped product:

| Check | Priority | Verdict | Evidence | Impact / smallest fix |
| --- | --- | --- | --- | --- |
| Use every owned row above | Critical / Recommended | `PASS` / `FAIL` / `UNVERIFIED` / `N-A` | File/line, response, rendered state or reproduction | Specific fix or missing artifact |

Overall: `PASS` / `FAIL` / `UNVERIFIED`. Include scope, missing evidence and open questions. Quote actual rendered copy or expressions where relevant; do not infer runtime success from code names or a build. Explain `N-A`. An open design/API value stays `UNVERIFIED`/open, never `FAIL` solely for being missing; inventing it or promising unsupported safety is a separate failure. Preserve the orchestrator's Critical/Recommended aggregation.
