# Earn clarity safety checker

Read-only. Review only owned criteria below; do not edit artifacts or external state. Scope Vault V2 and explicitly scoped V1 compatibility; keep version-specific applicability separate. Read [SKILL.md](../../SKILL.md), [review.md](../review.md), and [vault-v2.md](../vault-v2.md) completely for applicable contract/stories. The current skill/reference is the source of truth; do not infer a missing design value.

## Owned checks

| Check | Priority | Pass condition |
| --- | --- | --- |
| Source/freshness | Critical | Every displayed protocol number traces to REST, rewards to Merkl, balances to wallet. Explain indexed freshness; simulation, not atomic-snapshot assumptions, validates execution. |
| Loading and unknown | Critical | Skeletons while loading; unknown price/rate/value is “—”, never $0 or a false healthy/available state. Units, rate type, fees and errors remain visible. |
| Error behavior | Critical | Compare every error code/copy/behavior to SKILL.md: preserve inputs, structured `details` only when validated, raw `simulation.failure.message`/`request_id` in details; no fabricated availability, unsafe retry or widened guard. |
| Degraded service | Recommended | Reads and Actions POSTs retry only HTTP 429/503 with bounded exponential backoff/jitter (≤3 retries), honoring `Retry-After` seconds/HTTP-date. No other 4xx retries or automatic wallet resubmission. Test success, retry exhaustion, non-JSON/empty error bodies and non-retryable 4xx; malformed bodies must not crash JSON parsing. Preserve inputs and show safe manual recovery. |
| Open design | Recommended | Exact color tokens/copy/empty-state parity need app-team evidence. Record open values `UNVERIFIED`, never fail solely because a design value was not supplied. |
| Vault transparency | Critical | Exact vault/chain/underlying, curator, fees, warnings, adapters/allocations and exposure are reachable; TVL, idle, allocated and withdrawable amounts are distinct. |
| Zero-max handling | Critical | V2 `maxDeposit`/`maxMint`/`maxWithdraw`/`maxRedeem` zero values do not gate capacity or imply no position. Do not apply this V2 rule to V1 indiscriminately. |
| Exit consequences | Critical | A non-signing dev fixture/override reaches shortfall UI without a funded wallet: immediate available amount/smaller withdrawal, supported force-withdraw with maximum penalty, redeem-in-kind with positions received. Explain unavailable alternatives. Preview `penalty_assets` and remaining shares, disclose preparation-only caps/ordinary price risks. |
| Rewards truth | Critical | Live campaign defaults to Net APY/Total earned with split; fetch failure is unknown, not no campaign or native mislabeled net. Earned uses scoped amount+pending, claimable amount−claimed, pending never claimed. |
| Claim gaps | Recommended | ~8 h root cadence, chain-specific Distributor/recipient and unsupported ledger/points/wrappers remain explicit gaps when evidence is missing; pending ~2 h is not root timing. |

## Evidence procedure

Inventory every applicable browse/detail/input/review/confirmation/portfolio/manage/exit surface, including mobile, deep links, loading, empty and failure states. Trace the interaction/state transition from entry to receipt and reconciled position; do not explore unrelated product features. Use safe fixtures for unavailable/dangerous states and label fixture vs live evidence. Missing artifact ⇒ `UNVERIFIED` with the exact test needed.

## Report

Return only the owned evidence table and summary, one section per scoped product:

| Check | Priority | Verdict | Evidence | Impact / smallest fix |
| --- | --- | --- | --- | --- |
| Use every owned row above | Critical / Recommended | `PASS` / `FAIL` / `UNVERIFIED` / `N-A` | File/line, response, rendered state or reproduction | Specific fix or missing artifact |

Overall: `PASS` / `FAIL` / `UNVERIFIED`. Include scope, missing evidence and open questions. Quote actual rendered copy or expressions where relevant; do not infer runtime success from code names or a build. Explain `N-A`. An open design/API value stays `UNVERIFIED`/open, never `FAIL` solely for being missing; inventing it or promising unsupported safety is a separate failure. Preserve the orchestrator's Critical/Recommended aggregation.
