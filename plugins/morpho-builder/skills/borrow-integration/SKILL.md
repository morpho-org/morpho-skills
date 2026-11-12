---
name: borrow-integration
description: Build or review Blue variable-rate and Midnight fixed-rate borrowing integrations using the Morpho REST read API and Actions API. Use for market discovery, opening loans, target-LTV sliders, position balances and costs, health alerts, collateral changes, repayment, exits, liquidation history, UI states, QA, and pre-launch review.
---

# Borrow integration — Blue and Midnight

## Product routing

- **Blue:** variable-rate borrowing, no `maturity`.
- **Midnight:** fixed-rate borrowing, fixed `maturity`.
- **Both:** load both references; keep `data`, flows, terminology, risks, and review verdicts separate.

If the product is not named, infer it from concrete evidence: utilization/IRM/market params imply Blue; books/bids/offers/`units`/`maturity` imply Midnight. If evidence supports neither and the choice changes the implementation, ask which product is intended.

## Two APIs and Merkl

Use REST GETs for every displayed protocol number and the Actions API for every transaction. Rewards come separately from Merkl. Derive display math from REST values, not independently fetched chain state; wallet balances come from the connected wallet. Actions builds and simulates `calls` but never submits them.

| Surface | Base URL | Auth | Used for | Reference |
| --- | --- | --- | --- | --- |
| Read API (Core + Midnight REST) | public host: `https://api.morpho.org`; keyed host: `https://private.api.morpho.org` | `none` publicly; `x-api-key` privately | Markets, positions, prices, oracles, books, quotes | [REST reference](https://docs.morpho.org/api/) |
| Actions API (Borrow and Earn API, alpha) | `https://private.api.morpho.org/v0/actions/...` | `x-api-key` required | Build + simulate wallet `calls` | [Actions reference](https://api.morpho.org/actions/docs) |
| Merkl | `https://api.merkl.xyz/v4/opportunities` | `X-API-Key` per Merkl access requirements | Reward APR on markets | [Merkl reference](https://developers.merkl.xyz/api-reference/get/v4/opportunities) |

Keep the Actions API key server-side only. Browser requests go through the integrator's backend. The Actions API is alpha; check its [OpenAPI](https://api.morpho.org/actions/docs/openapi.json) for current route schemas. Link only to these reference surfaces; write required formulas and flows here rather than sending agents to other documentation.

## Choose a mode

- **Build or update:** read [Blue](references/blue.md), [Midnight](references/midnight.md), or both.
- **Review, audit, QA, pre-launch:** read [`review.md`](references/review.md) completely. Review only unless fixes are requested.

## Actions API contract

Apply all six steps to every action in either reference:

1. POST the intent with `account` equal to the sending wallet. Successful HTTP responses wrap the action in `data`; inspect `data.status`, not a `root` `status`. Validate `account` and `chain_id` against the chosen wallet/chain.
2. For `signature_required`, review every `signatures[]` entry `{id,kind,typed_data}`; `kind` is `authorization` or `permit`. Verify each `typed_data.domain.chainId` matches the selected chain. Ask consent and sign each EIP-712 request, then POST `{"continuation":"...","signatures":[{"id":"...","signature":"0x..."}]}` to the **same path**, not the original intent plus extra fields. IDs must match requested IDs and be unique. Allow at most three signing/`continuation` rounds; require **more than 60 seconds** before `expires_at` before each signature. Otherwise stop and restart without the `continuation`.
3. Only for `prepared` with `simulation.status` equal to `success`, send `calls` in returned order, from `account` on `chain_id`, with `to`/`data`/`value` unchanged and before `expires_at`. Use an atomic EIP-5792 batch only when the wallet supports atomic batching, or sequential transactions, waiting for each confirmation. Stop at the first failure; earlier approvals/authorizations remain applied. Track confirmed and possibly submitted `calls`; reconcile receipts before retrying. Request a new action rather than blindly sending remaining `calls`.
4. For `simulation_failed` (`simulation.status`: `failed`), send nothing. Explain the failure; expose `simulation.failure.message` only in a details toggle. Failed actions have no wallet `calls`. Never bypass `failed` simulation or loosen a guard silently.
5. **Copy the docs' TypeScript `postAction`/`runAction` from [Actions docs](https://api.morpho.org/actions/docs); do not rewrite it.** They verify `Morpho-Action-Proof` before exposing typed `data` or `calls`. Proof verifiers also ship in Go, Python, and Java, not complete wallet flows. Verify `ES256`, `kid` against same-origin `/.well-known/morpho-actions-jwks.json` (no key), `typ` `morpho-action-proof+jwt`, the helper's exact production issuer, audience `morpho-actions-client`, subject `action-response`, expiry and freshness (`iat` not future, at most 60 s old with allowed clock skew), and the exact request/response byte binding as implemented in the helper. Cache `JWKS` at most 60 s and refresh unknown `kid`. Reject unverifiable responses; also check `account`, chain/domain, expiry, and user consent.
6. Render the preview from `simulation.position_changes` **deltas** applied to the REST position plus `simulation.wallet_changes` (signed base-unit balance differences). Blue deltas: `supply_shares`, `borrow_shares`, `collateral_assets`; Midnight borrow deltas: `credit_units`, `debt_units` and `collaterals[].difference`. They are not complete before/after snapshots. Pass optional `calldata_origin` as four-byte hex, e.g. `0x25afea44`, for attribution, not authentication. Where supported, `referral_fee` is `{"bps":1,"recipient":"0x..."}` with integer `bps` 1–200; omit rather than send zero. Blue borrow/repay and Midnight borrow accept it; do not add it to `collateral`-only or Midnight repay intents. Show its cost and net received `amount`.

Funding is an object: `{"type":"erc20"}`, `{"type":"native","max_native_assets":"..."}`, or `{"type":"auto","max_native_assets":"..."}`. Native/`auto` require maximum `native` spend. Use `native` for wrapped-`native` `assets` only; `auto` selects based on balances, not mixed `funding` for Blue. Midnight `native`/`auto` applies to the wrapped-`native` supplied `collateral` portion; other `collateral` remains ERC-20 funded.

Use `signature_mode: "auto"` where the route accepts it to reuse allowances, otherwise request ERC-2612 permits when supported with matching on-chain domains, falling back to approvals. Default `none` returns prerequisite `calls`; smart-contract accounts generally receive `calls` only. Do not add `signature_mode` to Midnight intents that do not accept it.

`expires_at` is Unix seconds: Blue defaults to 30 min, must be >60 s and ≤2 h away. Midnight defaults to 30 min: quoted borrow/market-repay max 1 h, minimum 5 min, not past `maturity`; direct repay max 24 h and >60 s away. A quote can return `QUOTE_STALE` if a selected offer expires before the deadline. Follow each route's schema for `collateral`-only deadlines. Never extend an expired action locally.

## Chain coverage

- **Blue:** 1, 10, 130, 137, 143, 196, 480, 988, 999, 4217, 4663, 5042, 8453, 42161, 747474.
- **Midnight actions:** 1, 4663, 5042, 8453 (Ethereum, Robinhood Chain, Arc, Base).

Other action-group chains return 422 `ACTION_UNSUPPORTED`. Read coverage does not establish action coverage.

## Conventions

- Blue market selector: `{chainId}:{marketId}`. Token selector: `{chainId}:{address}`. Midnight **REST** market ID is bare and unique across chains; **Actions** selector is `{chain_id}:{market_id}`, using `chain_id` from market discovery.
- Parse integer strings as `bigint`. Amounts use base `units`; `shares` use raw share `units`, not `token` `decimals`. Fetch `decimals`/`symbol`/`logo_uri` from [GET `/v0/tokens/{selector}`](https://docs.morpho.org/api/global/get-token/) for input parsing and display only; never rescale raw API `amounts` for execution.
- USD = raw `amount` / 10^`decimals` × [GET `/v0/tokens/{selector}/price`](https://docs.morpho.org/api/global/get-token-price/) → `data.price`. Null `price` ⇒ "—", never $0; show `token` `amount`.
- [GET `/v0/oracles/{selector}/state`](https://docs.morpho.org/api/oracles/get-oracle-state/) → `data.price` is scaled by 1e36: collateralRaw × `price` / 1e36 gives loan-`token` base `units`. Use oracle `price` for health/liquidation math, `token` USD `price` for USD. Adjust `decimals` when displaying a human `collateral`/loan-`token` `price`.
- Blue `shares` → `assets` from [market state](https://docs.morpho.org/api/blue/get-market-state/), rounding `debt` **up**, supply **down**:

```latex
\text{debt}=\left\lceil\frac{\text{borrow\_shares}(\text{total\_borrow\_assets}+1)}{\text{total\_borrow\_shares}+10^6}\right\rceil
```

  Supply `assets` = floor(`supply_shares` × (`total_supply_assets` + 1) / (`total_supply_shares` + 10^6)). Use integer ceiling division for `debt`.
- REST reads are indexed, not block-atomic. Display from REST; rely on the Actions simulation's chain state before acting. Reconcile delta previews against their REST baseline; refresh stale/inconsistent reads rather than claiming exact atomic snapshots.
- Public host: 750 requests/min/IP. Cache market config/`token` metadata; poll open positions no faster than every 30–60 s. Paginate cursor lists to completion where a full inventory is needed. Honor `Retry-After` and back off with jitter on throttling.
- Show realized average variable rates, never instant rates. Expose one `rateWindow` setting (integrator default; 6h if unset), optionally a selector beside rates. One window drives `native`, reward, and net rates. Midnight quoted fixed APR and `effective_apr` ignore `rateWindow`.

| `rateWindow` | Blue apy-averages key | Vault apy-averages `lookback` | Merkl apr-records, `grain`=`HOUR` | Net APY shown? |
| --- | --- | --- | --- | --- |
| 6h (default) | 6h | `six_hours` | 6 buckets | yes |
| 24h | 24h | `one_day` | 24 buckets | yes |
| 7d | 7d | `seven_days` | 168 buckets | yes |
| 30d, 90d, 1y | 30d, 90d, 1y | `thirty_days`, `ninety_days`, `one_year` | not covered by this recipe | `native` only, "excl. rewards" |

For a reward-bearing rate, fetch Merkl opportunities by `chainId`, `mainProtocolId=morpho`, `identifier`=market `identifier` and `campaigns`=`true`; per opportunity request `/v4/opportunities/{id}/apr-records?from&to&grain=HOUR` over the same window. Drop `hasUntrustedContribution` records; reward APR = average retained `avg` × (retained buckets / expected buckets) / 100, summed across opportunities. Keep rewards separate from borrow cost; never relabel a borrow APY as depositor net yield. Verify Merkl's current schema before using this recipe; do not substitute `totalApr`/`nativeApr`. Failed rewards fetch ⇒ combined rate "—", `native` rate still visible. No campaign ⇒ hide reward rows. Label the selected window ("variable, 24h avg"); chosen-window null ⇒ "—", never silently fall back. Merkl formula/schema confirmation remains open.

## UX

### Position health bands — proposed defaults, design to confirm

Confirm exact thresholds, color tokens, copy, and empty states against `app.morpho.org` design input before claiming visual parity. These are proposed, not verified app behavior. For multi-`collateral` Midnight use effective LLTV = Σ(`value_i` × `LLTV_i`) / Σ(`value_i`).

| Band | Rule (ratio = LTV / LLTV) | Proposed color token | Proposed copy |
| --- | --- | --- | --- |
| Healthy | ratio < 0.85 | `success` (green) | `none` |
| Warning | 0.85 ≤ ratio < 0.95 | warning (amber) | "Your loan is close to its liquidation limit. Add `collateral` or repay to lower your LTV." |
| Danger | ratio ≥ 0.95 | error (red) | "Your position can be liquidated if prices move further. Act now." |
| Liquidated | liquidation event found | error (red), persistent banner | "Part of your `collateral` was liquidated on {date}." |

Always show LTV next to LLTV ("62% / 86%") and before → after on every action preview. Max borrow/`collateral` withdrawal must keep a safety margin below LLTV matching the Actions API's own buffer: **open question, numeric buffer not published here**. Do not invent one or promise a reject-free Max until verified; simulation is authoritative.

### Action error states

Errors use {error:{code,message,details,`request_id`}}; simulation errors use `simulation.failure`. Retain inputs; raw messages belong in a details toggle. Use structured details only when present and validated.

| API code | User message | UI behavior |
| --- | --- | --- |
| `INSUFFICIENT_BALANCE` | "Not enough {`token`} in your wallet." | disable confirm, show balance |
| `INSUFFICIENT_LIQUIDITY` | "Only {x} can be borrowed / withdrawn right now." | offer available `amount` from details when present; otherwise refresh Blue liquidity or Midnight quote availability; if unknown, say unavailable, not an invented x |
| `POSITION_UNHEALTHY` | "This would put your loan above its safe limit." | show max allowed `amount` when verified; recompute health and re-simulate |
| `REPAY_EXCEEDS_DEBT` | "That's more than you owe." | offer repay `all` where supported; Midnight market repay uses exact remaining `units` |
| `QUOTE_STALE`, `SLIPPAGE_EXCEEDED`, `QUOTE_RATE_ABOVE_CEILING` | "The rate moved. Review the new quote." | re-quote, require a new confirmation |
| `SIGNATURE_EXPIRED`, `SIGNATURE_REFRESH_REQUIRED`, `ACTION_CONTINUATION_INVALID` | "This request expired. Try again." | restart without `continuation` |
| `CAP_EXCEEDED` | "This vault is full for now." | disable deposit on an earn surface; on borrow explain the affected cap, not a vault deposit failure |
| `ACTION_UNSUPPORTED` | "Not available on this network or vault." | hide the unavailable action; label market rather than vault for borrow |
| HTTP 429, 503 | "Service busy, retrying…" | backoff; honor Retry-After; never resubmit a wallet transaction automatically |

Handle other codes with a generic actionable failure, details toggle and `request_id` for support; do not assume every failure is retryable. Borrow-relevant codes include `MARKET_NOT_FOUND`, `NOT_FOUND`, `POSITION_EMPTY`, `POSITION_INSUFFICIENT`, `QUOTE_UNAVAILABLE`, `QUOTE_INSUFFICIENT`, `QUOTE_INVALID`, `QUOTE_MARKET_MISMATCH`, `QUOTE_ORDER_INVALID`, `SHARED_LIQUIDITY_INSUFFICIENT`, `REALLOCATION_DISCOVERY_UNAVAILABLE`, `COLLATERAL_UNSUPPORTED`, `FUNDING_UNSUPPORTED`, `AMOUNT_TOO_SMALL`, `TARGET_UNREACHABLE`, `CONTINUOUS_FEE_TOO_HIGH`, `ACTION_TOO_COMPLEX`, `REQUIREMENTS_CHANGED`, `TOKEN_METADATA_INVALID`, `RECEIVER_INVALID`, `SIGNATURE_INVALID`, `SIGNATURE_UNEXPECTED`, `VALIDATION_FAILED`, `REQUEST_ABORTED`, `REQUEST_BODY_INCOMPLETE`, `PAYLOAD_TOO_LARGE`, `STATE_UNAVAILABLE`, `RPC_CHAIN_MISMATCH`, `CONTRACT_CODE_MISSING`, `VERIFICATION_REJECTED`, `VERIFICATION_INVALID_RESPONSE`, `VERIFICATION_UNAVAILABLE`, `INTERNAL_ERROR`, `PREPARATION_INVALID`, `REQUIREMENT_UNSUPPORTED`, `REQUIREMENT_SERIALIZATION_FAILED`, `ACCESS_RESTRICTED`, `EXECUTION_REVERTED`, `FUNDS_RETAINED`, `INSUFFICIENT_ALLOWANCE`, `NONCE_ALREADY_USED`, `MARKET_LLTV_NOT_ENABLED`, `MARKET_LIQUIDATION_CURSOR_NOT_ENABLED`, and `MARKET_MATURITY_TOO_FAR`. Treat unknown codes safely; never send `calls` after an error.

### Global rules

Every number has a `unit` and rates a `type`: "variable, 6h avg", "fixed until {date}", "6h `avg`, excl. rewards". Show skeletons, not zeros, while loading; unknown ⇒ "—"; a loaded empty position list shows "No position". Use one review screen listing every signature and transaction in order before the first prompt; update it if `continuation` reveals another requirement. Signature-required responses do not yet expose final `calls`: label that `pending` plan explicitly, obtain consent for each signature, then require a final call review before sending; never `claim` unseen `calls` were reviewed. After confirmation refetch positions; keep `pending` until `last_indexed_block` ≥ transaction block **where provided**. Otherwise re-poll and reconcile balances/`debt`/`collateral` with the confirmed action; Midnight has no universal watermark. Never equate a receipt with an already updated indexed UI.

## Acceptance test — two-minute build

Give a fresh agent this skill, an API key, and a selector. Build every A1, A1b, A2–A6 surface in the applicable reference without a human answering implementation questions; unresolved product/design questions must stay explicitly open, not invented.

- **Blue:** USDC / cbBTC on Base, selector 8453:0x9103c3b4e834476c9a62ea009ba2c884ee42e94e6e314a26f04d312434191836.
- **Midnight:** pick a listed USDC market on Base or Robinhood Chain from GET `/v0/midnight/markets?listed=true`, preserving `chain_id` for the Actions selector.
- Exercise normal, no-position/no-`debt`, null `price`/rate, partial/full repay, slider, warnings, `maturity` and liquidation states. Every story's acceptance line must hold or be reported `UNVERIFIED` with the missing evidence/API gap.
- Force insufficient balance: disable confirmation, show `token`/balance; send nothing.
- Force liquidity shortfall: show available `amount` when known, offer smaller `amount`; Midnight early exit also offers direct face-`value` repay.
- Force an expired action: stop before signing/sending, discard `continuation`, request a new action and confirmation.
- Never manufacture real liquidation or unsafe transactions to test; use controlled fixtures for dangerous/unavailable states and label that evidence.

## Open questions

- Design confirmation: health thresholds/color tokens/copy and empty states; obtain app-team design input as one embeddable file.
- Max safety buffer below LLTV must match Actions; unknown numeric `value`.
- Blue user liquidation feed is absent; interim history comparison is an API gap, not proof.
- Midnight interest owed from `cost_basis`: accounting interpretation remains open despite known WAD scaling.
- Rolling Midnight loans into Blue or Midnight: scope/flow remains open.
- Margin remains open.
- Merkl reward recipe/schema confirmation remains open.

## Verification while building

Use applicable prompts in [references/checkers/](references/checkers/) and [math-correctness](references/checkers/math-correctness.md) after each surface exists. Keep Blue/Midnight verdicts separate.

No check passes without artifact evidence: code, API response, runtime state, or screen as applicable. Report `UNVERIFIED` and name missing evidence when a required artifact is unavailable. Do not claim visual parity from a build or API response.
