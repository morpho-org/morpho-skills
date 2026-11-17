---
name: migrate-graphql-to-rest
description: Migrate an existing Morpho GraphQL integration to REST reads and Actions API transactions. Use for GraphQL queries, Apollo/urql/graphql-request clients, codegen, old transaction builders, bundlers or hand-built calldata; audit consumed fields, map routes, rewrite and verify parity with explicit gaps.
---

# Migrate Morpho reads and transactions

Migrate an existing integration, not just its HTTP client. Replace displayed protocol reads with the Morpho REST read API and supported transaction construction with the Actions API. Keep user intent, product identity, wallet/chain and behavior intact; disclose unavoidable semantic changes. Do not silently drop a consumed field or invent an equivalent.

Sources: [migration guide](https://docs.morpho.org/developers/api/migrate-from-graphql/), [REST reference](https://docs.morpho.org/api/), [Actions docs](https://api.morpho.org/actions/docs), [Actions OpenAPI](https://api.morpho.org/actions/docs/openapi.json). The migration guide announces GraphQL shutdown on January 29, 2027; recheck the notice when planning cutover. Only this migration skill uses that guide. Never send a fresh builder to the retired read/transaction path.

For complete product stories, invoke `earn-integration` (Vault V2 default, V1 compatibility) or `borrow-integration` (Blue variable/no maturity, Midnight fixed/maturity). Do not duplicate their full product flows here. This skill and its local references contain the migration method; no file outside this directory is required to audit, map or report a migration.

## 1. Audit

1. Identify application entrypoints, backends/jobs, caches, tests, generated artifacts, wallet adapters and supported products/chains. Keep Blue, Midnight, V1 and V2 distinct. Start with a read-only inventory; do not remove dependencies before all consumers are traced.
2. Search tracked source and configuration, excluding dependency/build directories. Use `rg` for `gql`, `graphql`, `graphql-request`, Apollo, `@apollo/client`, urql, `@urql`, `.graphql`/`.gql` documents, GraphQL codegen configuration, introspection schemas, persisted query IDs, operation names and `api[.]morpho[.]org/graphql`. Trace aliases, fragments, interpolation, custom wrappers, environment variables, fetch/POST calls, SSR routes, workers, fixtures and generated hooks. A symbol hit is not proof of an executed dependency: follow dispatch/imports and runtime configuration.
3. For **each operation and consumed field**, record file/line, variables/filters, selector/chain/wallet, all pages, refresh policy, units/rounding, current label and UI/math consumer. Nested selections unused by the app need not be fetched; a hidden risk check is still a consumer. Record archived/unreachable usage separately rather than counting it as migrated production traffic.
4. Independently find transaction preparation: SDK imports (including `@morpho-org/*`), `getRequirements`, `buildTx`, `Bundler3`, `MidnightBundles`, `writeContract`, `encodeFunctionData`, `sendTransaction`, hand-built approvals/callbacks, relayers and wallet calls. Inventory intent, amount units/Max meaning, account/receiver, funding, guards, fees, chain, signing and retry behavior. Read migration does not prove transaction migration.
5. Capture sanitized legacy responses using the integration's existing read path before replacing it. Store selector, variables, timestamp/block if available, operation and consumed fields; never log API keys, raw signatures or private user data. If legacy access is unavailable, use labeled recorded fixtures and mark live parity `UNVERIFIED`.

Use [the report template](references/migration-report.md) from the first inventory onward.

## 2. Map

Use [route-map.md](references/route-map.md): it maps common legacy queries/fields to **44 concrete GET routes**, their field semantics and reference pages. A single GraphQL query commonly becomes several independently indexed reads. Do not mechanically change camelCase to snake_case or guess route versions.

For every consumed field, record the exact route, query parameters, response path, join key, unit/scale, availability and cache key. Classify it as `EXACT`, `TRANSFORMED`, `SEMANTIC_CHANGE`, `GAP` or `UNVERIFIED`; do not call a realized average an exact instant-rate replacement. Verify each selected route against its current reference/OpenAPI and a live GET with a discovered valid selector. A `200` with empty positions proves route reachability, not nonempty shape or legacy parity. Preserve failures and schema drift in the report.

Review the known gaps in [route-map.md](references/route-map.md) before implementing substitutes. New/unmapped queries require the same field-by-field verification; the table is a seed, not an exhaustive schema. Unsupported displayed fields stay visibly unknown or blocked pending an explicit product decision, never silently approximate or coerce to zero.

## 3. Rewrite reads

| Convention | Required behavior |
| --- | --- |
| Surfaces/auth | Public REST origin: `https://api.morpho.org`; private REST/Actions origin: `https://private.api.morpho.org`. REST GETs supply protocol display data; wallet supplies balances; Merkl supplies rewards separately. Keep private API keys server-side. Browser Actions calls go through the integrator's backend. Root origins are not data endpoints. |
| Envelope | Read successful payloads under `data`; list routes also carry a top-level `cursor`. Check HTTP status and route schema before unwrapping. Error envelopes vary; do not interpret a failed read as an empty successful list. |
| Selectors | Blue markets use `{chain_id}:{market_id}`; vault/token/oracle use `{chain_id}:{address}`. Discover the chain for a bare Blue ID; never default to Base. Midnight REST paths use bare `market_id`; Actions uses `{chain_id}:{market_id}`. Preserve wallet address and chain in joins and cache keys. |
| Units | Keep base-unit integer strings as `bigint`; parse/format using token `decimals` from `GET /v0/tokens/{token-selector}`, never hardcoded 18. Do not coerce raw amounts/shares into JavaScript `Number`. `_wad` is scaled by `1e18`, `_ray` by `1e27`; each field's schema determines whether it is scaled, a fraction, APR, APY or per-second rate. |
| Price/USD | Scale token amounts before multiplying by current token USD `price`. Null price ⇒ “—”, never $0. Oracle prices are scaled by `1e36` and express raw-unit conversion, not USD. Do not use current price to fabricate historical USD. Missing oracle disables dependent actions. |
| Share conversion | Blue debt rounds **up**, supply **down**, with the virtual terms below. Vault `share_price_ray` describes whole share/asset tokens: include asset/share decimal adjustment if estimating raw shares. A vault position already exposes `assets`; do not apply Blue share math to it. |
| Freshness | REST responses are indexed and not block-atomic. `last_indexed_block` is not universal. Preserve timestamps/watermarks and loading skeletons, not temporary zeros. Rely on Actions simulation before acting. After receipts, refetch until watermark catches up where available; otherwise re-poll/reconcile rather than declaring the indexer current. |
| Traffic | Public REST limit is 750 requests/minute/IP. Cache stable configuration/metadata, deduplicate requests across consumers, bound fan-out, debounce interactive reads and poll open positions every 30–60 s. Honor `Retry-After`/backoff on `429`/transient failure; no retry storm or automatic wallet replay. |
| Pagination | Replace `first`/`skip` with supported `limit`/`cursor`. Follow until `cursor` is null, with identical filters/sort. URL-encode cursors; detect repeated cursors. Keep independent cursors per wallet/resource, mark failed pages incomplete, deduplicate by stable identity, not displayed symbols. Reset on filter changes. |

```latex
\text{debt}=\left\lceil\frac{\text{borrow\_shares}(\text{total\_borrow\_assets}+1)}{\text{total\_borrow\_shares}+10^6}\right\rceil
\qquad
\text{supply assets}=\left\lfloor\frac{\text{supply\_shares}(\text{total\_supply\_assets}+1)}{\text{total\_supply\_shares}+10^6}\right\rfloor
```

Keep arithmetic rational/integer until display. Missing totals are unknown, not permission to divide shares by token decimals alone. Debt at Midnight maturity is units, not Blue debt shares or loan assets received; fixed rates ignore `rateWindow`.

### Rates

Use one `rateWindow` (default/integrator setting: `6h`) for native, reward and net rates. Never display instant rates. Realized averages are native/exclude Merkl; label variable vs fixed, averaging window, and “incl. rewards” or “excl. rewards”. Null selected window stays “—”, never silently substitute another window. Historic averages are not a forecast.

| `rateWindow` | Blue `borrow_apy_averages` / `supply_apy_averages` key | Vault `lookback` | Merkl hourly buckets |
| --- | --- | --- | --- |
| `6h` (default) | `6h` | `six_hours` | 6 |
| `24h` | `24h` | `one_day` | 24 |
| `7d` | `7d` | `seven_days` | 168 |
| `30d` | `30d` | `thirty_days` | Not covered: native only |
| `90d` | `90d` | `ninety_days` | Not covered: native only |
| `1y` | `1y` | `one_year` | Not covered: native only |

Vault averages return `data.apy`; Blue returns named window maps without a `lookback` parameter. Vault `one_hour`/`inception` are extra API values, not substitutes for missing chosen windows. APY **history range is not averaging window**: use the separate history table in [route-map.md](references/route-map.md). Balance/position history does not accept APY's `six_hours` value.

If rewards are consumed, migrate them separately to Merkl, not a nonexistent Morpho rewards field. Use the direct-vault or direct-market campaign recipe from the migration guide: for Blue supply, `type=MORPHOSUPPLY` and first 20 bytes of market ID as `identifier`, not the full market ID. Keep reward APR in fractions (Merkl percentages ÷100), use same-window `apr-records`/`grain=HOUR`, concatenate pages, drop `hasUntrustedContribution`, then mean retained `avg` × retained/expected coverage ÷100 and sum opportunities. Do not use `totalApr`/`nativeApr` or filter ended opportunities out of historical windows. A complete lookup with no opportunities/retained buckets contributes zero; a failed/incomplete lookup is unknown. This recipe has narrower campaign coverage than GraphQL and is an approximation, not exact parity. Native APY must never be relabeled net during reward failure. Follow `earn-integration` for reward-earned/claimable/claim details; keep unverified root cadence/deployment/recipient values open.

Rewrite fetch/schema adapters and downstream consumers together, including caches, UI labels, tests and generated types. Remove obsolete operations/codegen/client dependencies only after tracing remaining consumers; do not remove a shared client used by another protocol. Preserve feature flags/rollback during a staged cutover without presenting the old path as the new production implementation.

## 4. Rewrite transactions: condensed six-step Actions contract

Use [Actions docs](https://api.morpho.org/actions/docs) and its [OpenAPI](https://api.morpho.org/actions/docs/openapi.json) for exact route schemas, supported action-group chains, funding, deadlines and guards. Read support does not imply action support; unsupported groups return `422 ACTION_UNSUPPORTED`. Do not copy old bundle logic into a new wrapper.

1. **Intent:** POST the route-specific user intent from the backend, with the user's `account`/chain and base units. Inspect `data.status`. Copy the docs' TypeScript `postAction`/`runAction` helper; **do not rewrite it**. Keep `x-api-key` server-side and redact keys/continuations/signatures in logs.
2. **Sign/continue:** for `signature_required`, inspect `signatures[].{id,kind,typed_data}`, verify chain/domain and obtain user consent. POST to the **same endpoint** using `{"continuation":"...","signatures":[{"id":"...","signature":"0x..."}]}` with matching IDs. At most three signature/continuation rounds; stop/restart when ≤60 s remain before `expires_at`. Reject stale/unexpected signature requests.
3. **Prepared calls:** only `prepared` with `simulation.status: success` may send returned `calls`; preserve `to`, `data`, `value` **unchanged and in order**, from the selected wallet on the selected chain before expiry. Use atomic batching only if supported; otherwise confirm sequentially, stop on failure, reconcile receipts before retry and never blindly replay.
4. **Failed simulation:** `simulation_failed` or failed simulation sends **nothing**. Map error codes to actionable copy, retain input and expose raw `simulation.failure.message` in details. Use validated available amount from `details` when present or refreshed reads; never fabricate it or silently widen guards. Expiry means prepare/review anew, not resubmit old calls.
5. **Proof:** the copied helper must verify `Morpho-Action-Proof` before exposing signing material/calls: `ES256`, `kid` from same-origin `/.well-known/morpho-actions-jwks.json`, `typ: morpho-action-proof+jwt`, exact production issuer, `aud: morpho-actions-client`, `sub: action-response`, expiry/freshness (`iat` ≤60 s with allowed skew) and exact request/response binding. Cache JWKS ≤60 s, refresh unknown key, fail closed. Proof authenticity does not replace intent/chain/domain/consent checks.
6. **Preview/consent:** apply `simulation.position_changes` **deltas** to the REST baseline; use signed `simulation.wallet_changes` for balance differences. One review surface lists all signatures and calls (call plan explicitly pending during signature rounds); final call review precedes send. Show fees, gross/net receipt, wallet spend and before→after position; re-review changed plans.

Use only route-accepted fields: funding is `{"type":"erc20"}`, `{"type":"native","max_native_assets":"..."}` or `{"type":"auto","max_native_assets":"..."}`, subject to wrapped-native and route constraints. Optional `calldata_origin` is four-byte hex; `referral_fee` is `{bps,recipient}` with integer `bps` 1–200 where supported (omit zero, disclose fee/recipient). `signature_mode: "auto"`, expiry limits and full-exit `unit: all` are route-specific, not universal fields. Midnight market repay has no `all`; full-force vault exit has a reduced schema. Invoke the product skill for exact flows. Merkl Distributor claims are a separate explicit exception: no Actions claim endpoint exists; do not invent one.

## 5. Verify and cut over

Follow [verification.md](references/verification.md) and fill [migration-report.md](references/migration-report.md). Compare old/new outputs for the **same chain, selector, wallet, filters, paging scope and averaging window**; normalize units/rounding, record timestamps/indexed blocks and explain semantic differences. Verify equivalent static identity exactly; do not assert exact dynamic parity across non-atomic snapshots or compare instant APY to a realized average.

Require normal, empty/null and error evidence for reads and transaction preparation, plus insufficient balance, liquidity shortfall and expired action tests. Use mocks/controlled fixtures for unsafe states; never manufacture real liquidations or send transactions just to prove a migration. Run the integration's relevant tests/types/build after the last edit. Scan active source/config/build artifacts for remaining Morpho legacy reads/builders; classify intentional historical fixtures and unrelated protocol clients separately.

Finish with changed files, each consumed field's disposition/evidence, read/transaction coverage, tests and explicit gaps/decisions. Use `PASS`, `FAIL`, `UNVERIFIED`, `N-A` with evidence. A missing product/API/design value stays open/`UNVERIFIED`; inventing it is a defect. Do not report complete migration while an active consumer is unmapped, a safety check regressed, a fallback silently uses the retired endpoint or parity is untested. Keep unresolved capabilities blocked/unknown and state their impact plainly.
