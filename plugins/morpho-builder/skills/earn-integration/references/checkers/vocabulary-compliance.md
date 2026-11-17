# Earn vocabulary checker

Read-only. Review only owned criteria below; do not edit artifacts or external state. Scope Vault V2 and explicitly scoped V1 compatibility; keep version-specific applicability separate. Read [SKILL.md](../../SKILL.md), [review.md](../review.md), and [vault-v2.md](../vault-v2.md) completely for applicable contract/stories. The current skill/reference is the source of truth; do not infer a missing design value.

## Owned checks

| Check | Priority | Pass condition |
| --- | --- | --- |
| Vault identity | Critical | Earn names the actual Vault V2 or scoped V1; do not call the vault a fund, investment, staking product or unnamed strategy. |
| Yield claims | Critical | Yield is variable/indicative, historical rates are not forecasts. No guaranteed, risk-free or protected return; rewards are incentives, not guaranteed interest or autocompounding. |
| Roles/assets | Critical | Distinguish Morpho, integrator, curator, vault, underlying, receipt shares and reward tokens. Reward campaign income is not native vault interest. |
| Exit language | Critical | Qualify “withdraw anytime” by liquidity. Normal, force and in-kind outcomes differ; in-kind may return Blue positions, not all cash. |
| After exit | Critical | Pending already-earned rewards can settle after exit; do not promise indefinite new accrual on a withdrawn position. |

## Evidence procedure

Inventory every applicable browse/detail/input/review/confirmation/portfolio/manage/exit surface, including mobile, deep links, loading, empty and failure states. Sweep user-visible strings for guaranteed/risk-free, staking/investment/fund, fixed/variable, units and liquidity claims; inspect context, internal identifiers alone are not findings. Use safe fixtures for unavailable/dangerous states and label fixture vs live evidence. Missing artifact ⇒ `UNVERIFIED` with the exact test needed.

## Report

Return only the owned evidence table and summary, one section per scoped product:

| Check | Priority | Verdict | Evidence | Impact / smallest fix |
| --- | --- | --- | --- | --- |
| Use every owned row above | Critical / Recommended | `PASS` / `FAIL` / `UNVERIFIED` / `N-A` | File/line, response, rendered state or reproduction | Specific fix or missing artifact |

Overall: `PASS` / `FAIL` / `UNVERIFIED`. Include scope, missing evidence and open questions. Quote actual rendered copy or expressions where relevant; do not infer runtime success from code names or a build. Explain `N-A`. An open design/API value stays `UNVERIFIED`/open, never `FAIL` solely for being missing; inventing it or promising unsupported safety is a separate failure. Preserve the orchestrator's Critical/Recommended aggregation.
