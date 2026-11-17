# Verify a migration, not just a successful GET

Return to [SKILL.md](../SKILL.md); use [route-map.md](route-map.md) and fill [migration-report.md](migration-report.md).

## Route evidence and reproducible scope

All 44 mapped routes were checked at authoring time against their downloaded GET OpenAPI operations and live public GETs: HTTP `200` with a `data` envelope. Midnight route schemas came from their individual reference pages; other routes came from the REST OpenAPI. This is reachability/envelope evidence, not comprehensive response-schema, transaction, UI or old/new parity verification. Revalidate the exact consumed fields for the target integration; snapshots age.

| Probe family | Discovered fixture |
| --- | --- |
| V1 config/state/allocations/averages/history | `1:0x2371e134e3455e0593363cBF89d3b6cf53740618` (Gauntlet WETH Prime) |
| V2 config/state/allocations/averages/history/options | `4663:0xBeEff033F34C046626B8D0A041844C5d1A5409dd` (Steakhouse USDG) |
| Blue config/state/liquidity/averages/history | `8453:0x9103c3b4e834476c9a62ea009ba2c884ee42e94e6e314a26f04d312434191836` |
| Midnight config/state/book | bare `0xcf447db8cff164867b02edbf7ee7af06d241d4f3a44b34d6e3a3ea872ddea5d6`, discovered `chain_id: 1` |
| Token metadata/price | `8453:0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913` |
| Oracle state | `8453:0x663BECd10daE6C4A3Dcd89F1d76c1174199639B9` |
| Curator details | `4663:0x9023FBD6A08C666491A2d1648737E400cF42D2Fb` |

Lists used `limit=1` when accepted, not a complete catalog; averages/APY history used `six_hours`. Balance/position history required `one_day`: an initial `six_hours` probe returned `400` with the documented allowed enum, and the corrected probes returned `200`. Do not spread one route's `lookback` values to all history routes.

User routes used a public sample wallet: user position lists and vault activity were empty, individual positions returned zero balances, and Midnight transaction history was nonempty. Do not infer nonempty vault/Blue portfolio correctness from these probes. Obtain a consenting wallet/recorded fixture with real relevant positions for target-integration parity. No legacy GraphQL client or target app was supplied, so authoring checks **did not establish GraphQL-vs-REST parity**.

## Compare old and new reads

1. Freeze a sanitized legacy response or issue the existing integration's read near the new GETs; record request variables, selector, chain, wallet, filters, pagination completeness and timestamps/indexed blocks. Do not add a production dependency on the retiring endpoint just to run comparisons. If legacy is unavailable, retain recorded fixture provenance and grade live parity `UNVERIFIED`.
2. Join by chain + canonical resource + wallet where applicable; preserve case-insensitive address matching without changing chain identity. Never join by symbol/name or assume a bare Blue ID's chain. Verify static addresses, identity and configured fees exactly after scale normalization.
3. Compare **consumed** values, not entire JSON shape. Normalize integer strings to arbitrary-precision integers, fee/rate scales, share virtual terms and token decimals before formatting. Check `null` separately from zero. A new snake_case field with the same-looking name is not evidence of the same semantics.
4. For changing balances/debt/liquidity, compare as close in indexing time as possible, include both watermarks where available and repeat only when a newer snapshot is needed. Define justified per-field tolerances (e.g. a single base-unit rounding difference or measured accrual interval), not a global percentage that hides bugs. Unexplained differences remain failures/unverified, not “indexing lag” by assumption.
5. For APY, compare equal realized windows excluding rewards, then separately compare reward scope. Instant GraphQL APY versus REST realized APY is `SEMANTIC_CHANGE`, not a numeric parity test. Preserve chart range versus trailing-window differences and early-history omissions. Never average already-realized APY points to invent unsupported windows.
6. Compare counts and identities across **all** pages with equal filters. Exercise currently exited positions with `active_only=false`, several wallets with independent cursors, no results, repeated cursor, failed middle page and filter changes. Distinguish partial catalog/activity coverage from a complete history.
7. Compare performance accounting, liquidity capacities and metadata against the known-gaps list. A documented approximation must be opt-in, labeled and still classified as changed semantics; lack of an equivalent never authorizes fake data.

## Verify transactions without unsafe broadcasts

Use the copied helper from [Actions docs](https://api.morpho.org/actions/docs) and route schemas from [Actions OpenAPI](https://api.morpho.org/actions/docs/openapi.json). Map every former SDK/calldata/bundle entrypoint to an Actions intent and inspect backend/network boundaries. Do not compare old vs new calldata for byte equality: compare account/chain, intent, amounts, recipient, fees, limits, simulation and allowed state transitions. **Returned Actions calls themselves must remain byte-for-byte unchanged and ordered.**

With controlled mocks/fixtures test: authentic/invalid/expired proof; unknown `kid` refresh; incorrect request/response binding; wrong chain/domain; signature rejection and stale continuation; three-round limit and ≤60 s restart; `simulation_failed` sends nothing; prepared+successful simulation only; final call review; atomic vs sequential send/rejection; partial receipt reconciliation and duplicate prevention. Verify keys never reach client bundles, browser requests/responses or logs. Label fixture evidence, not live executions.

Force insufficient wallet balance, liquidity shortfall and expired action in safe preparation/fixture tests: input stays, error-specific recovery is shown, validated available amount is offered where known, and expiry prepares/reviews anew. Do not bypass proof, widen guard, invent amount, replay calls or broadcast a dangerous transaction to get evidence. Check delta preview arithmetic on both additions and reductions; no snapshot replacement or unsigned-wallet-delta assumption.

## Finish

Run the target project's relevant unit/integration/type/build checks after the last edit. Search source, configuration, generated hooks and runtime requests for retired Morpho reads/builders. Keep unrelated protocol clients and labeled fixtures out of removal scope. Inspect rendered loading/null/error/review states only when a UI check is requested/needed; otherwise report visual parity unverified. Require every consumed field and transaction intent to have a report row; incomplete evidence cannot pass.
