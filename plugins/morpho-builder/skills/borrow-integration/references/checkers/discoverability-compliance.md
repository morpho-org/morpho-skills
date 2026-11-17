# Borrow discoverability checker

Read-only. Review only owned criteria below; do not edit artifacts or external state. Scope Blue, Midnight or both; return independent Blue/Midnight verdicts. Read [SKILL.md](../../SKILL.md), [review.md](../review.md), and [blue.md](../blue.md) / [midnight.md](../midnight.md) completely for applicable contract/stories. The current skill/reference is the source of truth; do not infer a missing design value.

## Owned checks

| Check | Priority | Pass condition |
| --- | --- | --- |
| Product entry | Recommended | Product is findable from relevant home/asset surfaces, with named Morpho product rather than a generic bucket. Optional absent nudges may be `N-A` with reason. |
| Selection | Critical | Exact chain and market/vault identity, token(s), rate type/window, liquidity, risk/warnings and relevant manager are reachable; never select by rate or symbols alone. |
| Portfolio | Critical | Active positions appear in main portfolio with detail/manage/exit actions. A route that exists but cannot be reached is not discoverable. |
| Recovery access | Critical | Loading, empty, zero balance, rejected action and illiquid states retain an understandable next action; mobile/deep links do not strand users. |
| Separate products | Critical | Blue variable/no-maturity and Midnight fixed/maturity are distinct through selection and portfolio; supported network selector does not hardcode Midnight to one chain. |
| Manage and close | Critical | Portfolio exposes add collateral, partial/full repay, safe collateral withdrawal, and Midnight early asks/direct alternatives and maturity status. Reminders are not the only repayment entry. |
| Alerts and history | Critical | A3 alert links directly to A4; A6 persistent banner and remaining-collateral action are findable when evidenced. Empty liquidation history does not fabricate events. |
| Optional advanced routes | Recommended | Only applicable reallocation/advanced routes are offered with fee/context; open rolling and margin features are not required for a story to pass. |

## Evidence procedure

Inventory every applicable browse/detail/input/review/confirmation/portfolio/manage/exit surface, including mobile, deep links, loading, empty and failure states. Trace the interaction/state transition from entry to receipt and reconciled position; do not explore unrelated product features. Use safe fixtures for unavailable/dangerous states and label fixture vs live evidence. Missing artifact ⇒ `UNVERIFIED` with the exact test needed.

## Report

Return only the owned evidence table and summary, one section per scoped product:

| Check | Priority | Verdict | Evidence | Impact / smallest fix |
| --- | --- | --- | --- | --- |
| Use every owned row above | Critical / Recommended | `PASS` / `FAIL` / `UNVERIFIED` / `N-A` | File/line, response, rendered state or reproduction | Specific fix or missing artifact |

Overall: `PASS` / `FAIL` / `UNVERIFIED`. Include scope, missing evidence and open questions. Quote actual rendered copy or expressions where relevant; do not infer runtime success from code names or a build. Explain `N-A`. An open design/API value stays `UNVERIFIED`/open, never `FAIL` solely for being missing; inventing it or promising unsupported safety is a separate failure. Preserve the orchestrator's Critical/Recommended aggregation.
