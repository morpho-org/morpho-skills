# Clarity safety compliance — Earn and Borrow

Read-only: review only owned criteria; do not edit code, copy, configuration, artifacts or external state. Read [SKILL.md](../../SKILL.md), [review.md](../review.md) and only the selected product references: [Vaults](../vault-v2.md), [Blue](../blue.md), [Midnight](../midnight.md), completely for applicable contracts/stories. Grade scoped V2/V1 compatibility, Blue and Midnight separately; V2-only illiquid actions do not apply to V1, and shared helpers do not imply shared correctness. The current skill/reference is the source of truth; do not infer missing design values.

## Owned checks

| Scope | Check | Priority | Pass condition |
| --- | --- | --- | --- |
| All | Source/freshness | Critical | Every displayed protocol number traces to REST, rewards to Merkl, balances to wallet. Explain indexed freshness; simulation, not atomic-snapshot assumptions, validates execution. |
| All | Loading and unknown | Critical | Skeletons while loading; unknown price/rate/value is “—”, never $0 or a false healthy/available state. Units, rate type, fees and errors remain visible. |
| All | Error behavior | Critical | Compare every error code/copy/behavior to SKILL.md: preserve inputs, structured `details` only when validated, raw `simulation.failure.message`/`request_id` in details; no fabricated availability, unsafe retry or widened guard. |
| All | Degraded service | Recommended | Reads and Actions POSTs retry only HTTP 429/503 with bounded exponential backoff/jitter (≤3 retries), honoring `Retry-After` seconds/HTTP-date. No other 4xx retries or automatic wallet resubmission. Test success, retry exhaustion, non-JSON/empty error bodies and non-retryable 4xx; malformed bodies must not crash JSON parsing. Preserve inputs and show safe manual recovery. |
| All | Open design | Recommended | Exact color tokens/copy/empty-state parity need app-team evidence. Record open values `UNVERIFIED`, never fail solely because a design value was not supplied. |
| Selected | Product transparency | Critical | Earn: Exact vault/chain/underlying, curator, fees, warnings, adapters/allocations and exposure are reachable; TVL, idle, allocated and withdrawable amounts are distinct. Borrow: Blue identity includes oracle, IRM, LLTV and liquidity; Midnight identity includes selected chain, loan token, maturity, collateral configurations, bids depth and fees, not a fixed network assumption. |
| Earn | Zero-max handling | Critical | V2 `maxDeposit`/`maxMint`/`maxWithdraw`/`maxRedeem` zero values do not gate capacity or imply no position. Do not apply this V2 rule to V1 indiscriminately. |
| Earn | Exit consequences | Critical | A non-signing dev fixture/override reaches shortfall UI without a funded wallet: immediate available amount/smaller withdrawal, supported force-withdraw with maximum penalty, redeem-in-kind with positions received. Explain unavailable alternatives. Preview `penalty_assets` and remaining shares, disclose preparation-only caps/ordinary price risks. |
| Earn | Rewards truth | Critical | Live campaign defaults to Net APY/Total earned with split; fetch failure is unknown, not no campaign or native mislabeled net. Earned uses scoped amount+pending, claimable amount−claimed, pending never claimed. |
| Earn | Claim gaps | Recommended | ~8 h root cadence, chain-specific Distributor/recipient and unsupported ledger/points/wrappers remain explicit gaps when evidence is missing; pending ~2 h is not root timing. |
| Borrow | A2 health | Critical | Show debt, collateral token/USD, LTV beside LLTV, health and liquidation prices; Midnight uses multi-collateral weighted capacity, debt at maturity and countdown. No debt shows “No debt”, no infinity. |
| Borrow | A3 monitoring | Critical | Poll 30–60 s; band change alerts deduplicate and link to A4. Midnight maturity alerts at −7d/−1d/at maturity once each; unknown health never becomes healthy. Backend scans respect documented market-wide-list availability. |
| Borrow | Proposed bands and Max | Critical | Band thresholds/colors/copy stay proposed/design-open; numeric Max buffer stays open below LLTV. Test mechanics using labeled fixtures; do not invent parity, a buffer or rejection-free Max. |
| Borrow | A6 evidence | Critical | Blue collateral drop without known user withdrawal is only an interim possible-liquidation signal. Midnight uses filtered/paginated liquidation/roll transactions; display event date/seized/repaid/remaining amounts, distinguish roll and retain history after exit. |
| Borrow | Open accounting | Recommended | Midnight `cost_basis` WAD scale is known but interest accounting remains open; show unknown until verified. Exact Blue liquidation feed, roll and margin gaps remain `UNVERIFIED`, not fabricated. |

## Evidence procedure

Inventory every applicable browse/detail/input/review/confirmation/portfolio/manage/exit surface, including mobile, deep links, loading, empty and failure states. Trace the interaction/state transition from entry to receipt and reconciled position; do not explore unrelated product features. Use safe fixtures for unavailable/dangerous states and label fixture vs live evidence. Missing artifact ⇒ `UNVERIFIED` with the exact test needed.

## Report

Return only the owned evidence table and summary, one section per scoped product:

| Check | Priority | Verdict | Evidence | Impact / smallest fix |
| --- | --- | --- | --- | --- |
| Use every owned row above | Critical / Recommended | `PASS` / `FAIL` / `UNVERIFIED` / `N-A` | File/line, response, rendered state or reproduction | Specific fix or missing artifact |

Overall: `PASS` / `FAIL` / `UNVERIFIED`. Include scope, missing evidence and open questions. Quote actual rendered copy or expressions where relevant; do not infer runtime success from code names or a build. Explain `N-A`. An open design/API value stays `UNVERIFIED`/open, never `FAIL` solely for being missing; inventing it or promising unsupported safety is a separate failure. Preserve the orchestrator's Critical/Recommended aggregation.
