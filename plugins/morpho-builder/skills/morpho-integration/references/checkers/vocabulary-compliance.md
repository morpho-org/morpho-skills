# Vocabulary compliance — Earn and Borrow

Apply shared sections and only the selected product’s scoped sections. Read only its product references; preserve separate product/version verdicts.

## Scope

### Earn

Read-only. Review only owned criteria below; do not edit artifacts or external state. Scope Vault V2 and explicitly scoped V1 compatibility; keep version-specific applicability separate. Read [SKILL.md](../../SKILL.md), [review.md](../review.md), and [vault-v2.md](../vault-v2.md) completely for applicable contract/stories. The current skill/reference is the source of truth; do not infer a missing design value.

### Borrow — Blue and Midnight

Read-only. Review only owned criteria below; do not edit artifacts or external state. Scope Blue, Midnight or both; return independent Blue/Midnight verdicts. Read [SKILL.md](../../SKILL.md), [review.md](../review.md), and [blue.md](../blue.md) / [midnight.md](../midnight.md) completely for applicable contract/stories. The current skill/reference is the source of truth; do not infer a missing design value.

## Owned checks

### Earn

| Check | Priority | Pass condition |
| --- | --- | --- |
| Vault identity | Critical | Earn names the actual Vault V2 or scoped V1; do not call the vault a fund, investment, staking product or unnamed strategy. |
| Yield claims | Critical | Yield is variable/indicative, historical rates are not forecasts. No guaranteed, risk-free or protected return; rewards are incentives, not guaranteed interest or autocompounding. |
| Roles/assets | Critical | Distinguish Morpho, integrator, curator, vault, underlying, receipt shares and reward tokens. Reward campaign income is not native vault interest. |
| Exit language | Critical | Qualify “withdraw anytime” by liquidity. Normal, force and in-kind outcomes differ; in-kind may return Blue positions, not all cash. |
| After exit | Critical | Pending already-earned rewards can settle after exit; do not promise indefinite new accrual on a withdrawn position. |

### Borrow — Blue and Midnight

| Check | Priority | Pass condition |
| --- | --- | --- |
| Blue identity | Critical | Blue is borrowing against collateral at a variable rate with no maturity, not fixed-rate/guaranteed lending. |
| Midnight identity | Critical | Midnight is fixed-rate, fixed-maturity borrowing on the selected supported chain, not a single-network product or utilization-driven rate. Name maturity, units and repayment. |
| Orderbook terms | Critical | Borrow takes bids; early secondary repayment uses asks. Distinguish quote/price/debt units, available liquidity, partial/no fill and direct face-value repayment. |
| Risk and roles | Critical | Use LTV/LLTV, liquidation, oracle, fees and maturity plainly. No guaranteed, risk-free, protected-rate/fill/exit or claim that Morpho is lender/guarantor/custodian. |
| Liquidation and roll | Critical | Blue history heuristic is possible liquidation, not a proven event. Midnight roll is distinct from liquidation; unresolved roll/margin flows are not promised. |

## Evidence procedure

Inventory every applicable browse/detail/input/review/confirmation/portfolio/manage/exit surface, including mobile, deep links, loading, empty and failure states. Sweep user-visible strings for guaranteed/risk-free, staking/investment/fund, fixed/variable, units and liquidity claims; inspect context, internal identifiers alone are not findings. Use safe fixtures for unavailable/dangerous states and label fixture vs live evidence. Missing artifact ⇒ `UNVERIFIED` with the exact test needed.

## Report

Return only the owned evidence table and summary, one section per scoped product:

| Check | Priority | Verdict | Evidence | Impact / smallest fix |
| --- | --- | --- | --- | --- |
| Use every owned row above | Critical / Recommended | `PASS` / `FAIL` / `UNVERIFIED` / `N-A` | File/line, response, rendered state or reproduction | Specific fix or missing artifact |

Overall: `PASS` / `FAIL` / `UNVERIFIED`. Include scope, missing evidence and open questions. Quote actual rendered copy or expressions where relevant; do not infer runtime success from code names or a build. Explain `N-A`. An open design/API value stays `UNVERIFIED`/open, never `FAIL` solely for being missing; inventing it or promising unsupported safety is a separate failure. Preserve the orchestrator's Critical/Recommended aggregation.
