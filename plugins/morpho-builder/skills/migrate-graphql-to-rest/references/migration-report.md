# Migration report template

Use throughout the audit, map, rewrite and verify workflow in [SKILL.md](../SKILL.md). Keep one row per consumed field, not just per query. Use stable IDs to join the inventories, comparisons, gaps and changed files. Never paste secrets/signatures or unredacted personal data.

## Scope and inventory

- Repository/revision, runtime/client, environments and affected surfaces/jobs:
- Products and selected chains, vaults/markets, wallets (redacted as needed):
- Legacy query/client/codegen/configuration entrypoints and dispatch evidence:
- Current read/API access and fixture provenance; what cannot be exercised:
- Cutover/rollback policy and exclusions (including other protocols):

| ID | Operation / consumed field | Source file:line / active consumer | Variables, chain/selector, wallet, filters/pages | Current unit, rounding, label, refresh | REST route / response field / join | Mapping class / cache key |
| --- | --- | --- | --- | --- | --- | --- |
| `R-001` | One field or explicitly identical group | Runtime reachability, not only text hit | Exact values or sanitized fixture IDs | Include null behavior | Exact GET + parameters + envelope path | `EXACT` / `TRANSFORMED` / `SEMANTIC_CHANGE` / `GAP` / `UNVERIFIED` |

| ID | Existing transaction builder / entrypoint | User intent, account/chain, funding, fees/guard | Actions route / schema / Max meaning | Helper/proof/signature review | Send/receipt/retry evidence |
| --- | --- | --- | --- | --- | --- |
| `T-001` | SDK / calldata / bundle / contract write | Preserve actual intent | Exact supported endpoint, not a guessed generic route | Copied helper, backend key, bounded continuations | Ordered unchanged calls and reconciliation |

## Verification and differences

| ID | Legacy artifact + timestamp/block | REST artifact + timestamp/block | Same selector/window/page scope? | Normalized old / new value and unit | Expected difference, tolerance and evidence | Verdict |
| --- | --- | --- | --- | --- | --- | --- |
| `R-001` | Sanitized original or labeled recorded fixture | Exact GET/status/schema/field | Confirm chain/wallet, not symbols alone | Raw integer/fraction before formatted display | Explicit rounding/indexing/window/accounting/coverage rule; no blanket tolerance | `PASS` / `FAIL` / `UNVERIFIED` / `N-A` |

| Check | Evidence / output | Verdict | Missing artifact or smallest fix |
| --- | --- | --- | --- |
| Every consumed field mapped; incomplete pages detected | | `UNVERIFIED` | |
| Normal / empty / null / zero / decimal and rounding boundaries | | `UNVERIFIED` | |
| Read failures, rate limiting, schema mismatch, stale responses | | `UNVERIFIED` | |
| Copied helper and proof verification before exposure; key server-side | | `UNVERIFIED` | |
| Signature rejection, 3-round limit, ≤60 s deadline, failed simulation sends nothing | | `UNVERIFIED` | |
| Prepared successful simulation, final call review, immutable order/values | | `UNVERIFIED` | |
| Insufficient balance, liquidity shortfall, expired action | | `UNVERIFIED` | |
| Receipt reconciliation / no duplicate send | | `UNVERIFIED` | |
| Relevant tests / types / build | | `UNVERIFIED` | |
| Active source/config/runtime requests no longer use retired Morpho reads/builders | | `UNVERIFIED` | |
| UI labels/skeletons/unknown values / product-specific review | | `UNVERIFIED` | |

## Gaps and decisions

| Gap ID / affected fields | Missing equivalent or changed semantics | Evidence / known limit | User-facing impact | Proposed explicit behavior | Decision owner / status |
| --- | --- | --- | --- | --- | --- |
| `G-001` | No guessed route/formula | Reference + observed response, or explicitly unverified | Blocked feature, unknown value or relabel | Never silently approximate or drop a safety check | `OPEN` / agreed with named evidence |

An agreed alternative remains `SEMANTIC_CHANGE`, not retroactive exact parity. Keep an unresolved API/design value open/`UNVERIFIED`; do not mark it `FAIL` solely for being unavailable. A fabricated value, unsafe fallback or missing required migration is a demonstrated defect. A `200`/successful build alone cannot establish behavioral or visual parity.

## Final summary

- Changed files and deleted/replaced operations/builders/dependencies:
- Read coverage: audited active operations/fields, migrated, transformed, semantic changes, gaps and unverified totals:
- Transaction coverage by product/action/chain, including unsupported routes and Merkl claim exception:
- Remaining legacy hits classified as active dependency, recorded fixture, docs, unreachable code or unrelated protocol:
- Overall `PASS` / `FAIL` / `UNVERIFIED`; critical blockers vs nonblocking open capabilities:
- Cutover, rollback and telemetry plan; explicitly state what remains disabled/unknown:
- Checks actually run and exact results; mock vs live, untested production/UI behavior:

Do not claim full migration while any active consumer is unmapped, safety behavior is missing, old fallback remains active or required comparisons are unverified. No automatic cutover/deployment or transaction broadcast is authorized by this report.
