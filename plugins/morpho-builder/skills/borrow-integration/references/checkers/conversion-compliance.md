# Borrow conversion checker

Read-only. Review only owned criteria below; do not edit artifacts or external state. Scope Blue, Midnight or both; return independent Blue/Midnight verdicts. Read [SKILL.md](../../SKILL.md), [review.md](../review.md), and [blue.md](../blue.md) / [midnight.md](../midnight.md) completely for applicable contract/stories. The current skill/reference is the source of truth; do not infer a missing design value.

## Owned checks

| Check | Priority | Pass condition |
| --- | --- | --- |
| Input and preview | Critical | Wallet balances, token/USD input, Max and before→after preview update together. Null values remain unknown; loading skeletons do not look like spendable zero or a completed quote. |
| Signature flow | Critical | Review explains every signature/call and rejection recovery. At most 3 continuation rounds and >60 s remain at each signature; stale/new requirements refresh the review, not silently sign. |
| Submission recovery | Critical | Only verified-proof `prepared` + successful simulation sends ordered unchanged calls. Pending/rejection/failure/confirmation are distinct; stop on failure, reconcile receipts before retry and prevent duplicate submissions. |
| Receipt reconciliation | Critical | Confirmation refetches REST positions and wallet balances, using `last_indexed_block` where available or re-polling/reconciliation otherwise; never show completed indexed state from receipt alone. |
| Forced failures | Critical | Exercise insufficient balance, liquidity shortfall and expired action from the review matrix. Retain input, offer validated available amount/new action, and never auto-resubmit a wallet transaction. |
| A1 atomic open | Critical | Use the route-specific combined collateral+borrow Actions intent when intended; never hand-build calldata from returned offers. Quote limits block known too-large requests before POST. |
| A1b target slider | Critical | LTV/amount/slider agree, current position initializes target, direction changes Borrow/Repay label, LLTV tick stays unreachable. Liquidity cap stops thumb with available amount; preview within 0.1 pp; collateral edits preserve target. |
| Midnight quote race | Critical | Debounce quote after slider release (~300 ms), cancel/ignore obsolete responses, use bids for borrow, units-at-maturity debt and explicit guard. Never promise fallback-offer cap sums or widen a guard. |
| A4 maintenance | Critical | Add collateral and Repay are side by side with target helper and before→after LTV/liquidation price. Confirmation reconciles without reload; missed target is explained rather than falsely clearing a warning. |
| A5 full exit | Critical | Blue full repay and Midnight direct full repay use `amount: {unit: "all"}`. Midnight market repay uses exact current units, not unsupported all; verify residual debt/collateral before hiding position. |
| A5 early exit | Critical | Midnight asks quote shows market cost and face-value direct alternative; no quote/liquidity offers direct fallback with consent. A matured state retains repayment and no negative countdown. |

## Evidence procedure

Inventory every applicable browse/detail/input/review/confirmation/portfolio/manage/exit surface, including mobile, deep links, loading, empty and failure states. Trace the interaction/state transition from entry to receipt and reconciled position; do not explore unrelated product features. Use safe fixtures for unavailable/dangerous states and label fixture vs live evidence. Missing artifact ⇒ `UNVERIFIED` with the exact test needed.

## Report

Return only the owned evidence table and summary, one section per scoped product:

| Check | Priority | Verdict | Evidence | Impact / smallest fix |
| --- | --- | --- | --- | --- |
| Use every owned row above | Critical / Recommended | `PASS` / `FAIL` / `UNVERIFIED` / `N-A` | File/line, response, rendered state or reproduction | Specific fix or missing artifact |

Overall: `PASS` / `FAIL` / `UNVERIFIED`. Include scope, missing evidence and open questions. Quote actual rendered copy or expressions where relevant; do not infer runtime success from code names or a build. Explain `N-A`. An open design/API value stays `UNVERIFIED`/open, never `FAIL` solely for being missing; inventing it or promising unsupported safety is a separate failure. Preserve the orchestrator's Critical/Recommended aggregation.
