# Borrow clarity safety checker

Read-only. Review only owned criteria below; do not edit artifacts or external state. Scope Blue, Midnight or both; return independent Blue/Midnight verdicts. Read [SKILL.md](../../SKILL.md), [review.md](../review.md), and [blue.md](../blue.md) / [midnight.md](../midnight.md) completely for applicable contract/stories. The current skill/reference is the source of truth; do not infer a missing design value.

## Owned checks

| Check | Priority | Pass condition |
| --- | --- | --- |
| Source/freshness | Critical | Every displayed protocol number traces to REST, rewards to Merkl, balances to wallet. Explain indexed freshness; simulation, not atomic-snapshot assumptions, validates execution. |
| Loading and unknown | Critical | Skeletons while loading; unknown price/rate/value is “—”, never $0 or a false healthy/available state. Units, rate type, fees and errors remain visible. |
| Error behavior | Critical | Compare every error code/copy/behavior to SKILL.md: preserve inputs, structured `details` only when validated, raw `simulation.failure.message`/`request_id` in details; no fabricated availability, unsafe retry or widened guard. |
| Degraded service | Recommended | Safe states exist for `429`/`503`, malformed responses, stale reads, no quote/liquidity and failed simulation; honor `Retry-After` and keep read-only recovery guidance without inventing executable data. |
| Open design | Recommended | Exact color tokens/copy/empty-state parity need app-team evidence. Record open values `UNVERIFIED`, never fail solely because a design value was not supplied. |
| Market transparency | Critical | Blue identity includes oracle, IRM, LLTV and liquidity; Midnight identity includes selected chain, loan token, maturity, collateral configurations, bids depth and fees, not a fixed network assumption. |
| A2 health | Critical | Show debt, collateral token/USD, LTV beside LLTV, health and liquidation prices; Midnight uses multi-collateral weighted capacity, debt at maturity and countdown. No debt shows “No debt”, no infinity. |
| A3 monitoring | Critical | Poll 30–60 s; band change alerts deduplicate and link to A4. Midnight maturity alerts at −7d/−1d/at maturity once each; unknown health never becomes healthy. Backend scans respect documented market-wide-list availability. |
| Proposed bands and Max | Critical | Band thresholds/colors/copy stay proposed/design-open; numeric Max buffer stays open below LLTV. Test mechanics using labeled fixtures; do not invent parity, a buffer or rejection-free Max. |
| A6 evidence | Critical | Blue collateral drop without known user withdrawal is only an interim possible-liquidation signal. Midnight uses filtered/paginated liquidation/roll transactions; display event date/seized/repaid/remaining amounts, distinguish roll and retain history after exit. |
| Open accounting | Recommended | Midnight `cost_basis` WAD scale is known but interest accounting remains open; show unknown until verified. Exact Blue liquidation feed, roll and margin gaps remain `UNVERIFIED`, not fabricated. |

## Evidence procedure

Inventory every applicable browse/detail/input/review/confirmation/portfolio/manage/exit surface, including mobile, deep links, loading, empty and failure states. Trace the interaction/state transition from entry to receipt and reconciled position; do not explore unrelated product features. Use safe fixtures for unavailable/dangerous states and label fixture vs live evidence. Missing artifact ⇒ `UNVERIFIED` with the exact test needed.

## Report

Return only the owned evidence table and summary, one section per scoped product:

| Check | Priority | Verdict | Evidence | Impact / smallest fix |
| --- | --- | --- | --- | --- |
| Use every owned row above | Critical / Recommended | `PASS` / `FAIL` / `UNVERIFIED` / `N-A` | File/line, response, rendered state or reproduction | Specific fix or missing artifact |

Overall: `PASS` / `FAIL` / `UNVERIFIED`. Include scope, missing evidence and open questions. Quote actual rendered copy or expressions where relevant; do not infer runtime success from code names or a build. Explain `N-A`. An open design/API value stays `UNVERIFIED`/open, never `FAIL` solely for being missing; inventing it or promising unsupported safety is a separate failure. Preserve the orchestrator's Critical/Recommended aggregation.
