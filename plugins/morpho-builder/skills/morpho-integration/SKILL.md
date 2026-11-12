---
name: morpho-integration
description: Build or review Morpho Earn (Vault V2, with Vault V1 compatibility) and Borrow (Blue variable-rate or Midnight fixed-rate, fixed-maturity) integrations using REST reads, Actions transactions and Merkl rewards. Use for discovery, deposits and loans, target-LTV sliders, balances and earnings/costs, realized rates and rewards, health alerts, collateral management, repayment, liquid/illiquid exits, claims, liquidation history, UI states, QA and pre-launch review.
---

# Morpho integration — Earn and Borrow

Select Earn (Vault V2, with scoped V1 compatibility), Borrow (Blue, Midnight or both), or both products. Read only the selected product references: [Vaults](references/vault-v2.md), [Blue](references/blue.md), [Midnight](references/midnight.md). Apply shared rules and only the selected product’s scoped sections below. For review, read [review.md](references/review.md) completely and apply the same scope to its checkers.

## Product routing

- **Earn:** default to Vault V2; do not silently substitute Vault V1 or direct Blue supply. Vault yield is variable, not guaranteed. V1 uses the same B1–B3 and rewards stories with its own routes/actions; see [vault-v2.md](references/vault-v2.md). Infer the version from vault configuration or the existing integration.
- **Borrow:** Blue is variable-rate with no `maturity`; Midnight is fixed-rate with fixed `maturity`. Infer from concrete evidence: utilization/IRM/market params imply Blue; books/bids/offers/`units`/`maturity` imply Midnight.
- If both are requested, load both references and keep data, flows, terminology, identities, risks and verdicts separate. Ask only when unresolved product/version evidence changes the implementation.

## Two APIs and Merkl

Use REST GETs for every displayed protocol number and the Actions API for every transaction, except Earn's Merkl Distributor `claim` because Actions has no `claim` route. Rewards come separately from Merkl. Derive display math from REST values, not independently fetched chain state; wallet balances come from the connected wallet. Actions builds and simulates `calls` but never submits them.

Keep the Actions API key and Merkl credentials server-side only. Browser requests go through the integrator's backend. The Actions API is alpha; check its [OpenAPI](https://api.morpho.org/actions/docs/openapi.json) for current schemas.

| Surface | Base URL | Auth | Used for | Reference |
| --- | --- | --- | --- | --- |
| Read API (Core + Midnight REST) | public host: `https://api.morpho.org`; keyed host: `https://private.api.morpho.org` | `none` publicly; `x-api-key` privately | Vaults, markets, positions, prices, history, oracles, books, quotes | [REST reference](https://docs.morpho.org/api/) |
| Actions API (Borrow and Earn API, alpha) | `https://private.api.morpho.org/v0/actions/...` | `x-api-key` required | Build + simulate wallet `calls` | [Actions reference](https://api.morpho.org/actions/docs) |
| Merkl | `https://api.merkl.xyz/v4/opportunities` | `X-API-Key` per access requirements | Campaigns, reward rates, `proofs`; market reward APR | [Merkl reference](https://developers.merkl.xyz/api-reference/get/v4/opportunities) |

Link only to reference surfaces; write required formulas and flows inline rather than sending agents to other documentation.

## Choose a mode

- **Build or update:** completely read the selected references: Earn [Vaults](references/vault-v2.md), Borrow [Blue](references/blue.md) and/or [Midnight](references/midnight.md). Do not load unselected products.
- **Review, audit, QA, pre-launch:** completely read [review.md](references/review.md). Review only unless fixes are requested.

## Actions API contract

1. POST the intent with `account` equal to the sending wallet. **Always include the integration's configured `calldata_origin` in the top-level JSON intent body**, e.g. `"calldata_origin":"0x25afea44"` (four-byte hex, not a header or nested funding field). The API makes this analytics tag optional; this integration requires it, and missing configuration blocks launch. Do not copy the example tag as your identity. Optional top-level `referral_fee` is `{"bps":1,"recipient":"0x..."}` only on accepting routes; integer `bps` must be 1–200 (≤2%), never zero. Successful HTTP responses wrap the action in `data`; inspect `data.status`, not a `root` `status`. Validate `account` and `chain_id` against the chosen wallet/chain.
2. For `signature_required`, review every `signatures[]` entry `{id,kind,typed_data}`; `kind` is `authorization` or `permit`. Verify each `typed_data.domain.chainId` matches the selected chain. Ask consent and sign each EIP-712 request, then POST `{"continuation":"...","signatures":[{"id":"...","signature":"0x..."}]}` to the **same path**, not the original intent plus extra fields. IDs must match requested IDs and be unique. Allow at most three signing/`continuation` rounds; require **more than 60 seconds** before `expires_at` before each signature. Otherwise stop and restart without the `continuation`.
3. Only for `prepared` with `simulation.status` equal to `success`, send `calls` in returned order, from `account` on `chain_id`, with `to`/`data`/`value` unchanged and before `expires_at`. Use an atomic EIP-5792 batch only when the wallet supports atomic batching, or sequential transactions, waiting for each confirmation. Stop at the first failure; earlier approvals/authorizations remain applied. Track confirmed and possibly submitted `calls`; reconcile receipts before retrying. Request a new action rather than blindly sending remaining `calls`.
4. For `simulation_failed` (`simulation.status`: `failed`), send nothing. Explain the failure; expose `simulation.failure.message` only in a details toggle. Failed actions have no wallet `calls`. Never bypass `failed` simulation or loosen a guard silently.
5. **Copy the docs' TypeScript `postAction`/`runAction` from [Actions docs](https://api.morpho.org/actions/docs); do not rewrite it.** They verify `Morpho-Action-Proof` before exposing typed `data` or `calls`. Proof verifiers also ship in Go, Python, and Java, not complete wallet flows. Verify `ES256`, `kid` against same-origin `/.well-known/morpho-actions-jwks.json` (no key), `typ` `morpho-action-proof+jwt`, the helper's exact production issuer, audience `morpho-actions-client`, subject `action-response`, expiry and freshness (`iat` not future, at most 60 s old with allowed clock skew), and the exact request/response byte binding as implemented in the helper. Cache `JWKS` at most 60 s and refresh unknown `kid`. Reject unverifiable responses; also check `account`, chain/domain, expiry, and user consent.

6. Render the preview from `simulation.position_changes` **deltas** applied to the REST position plus `simulation.wallet_changes` (signed base-unit balance differences), not complete before/after snapshots. Show before → after, referral fee cost and net received `amount`; attribution is analytics, not authentication.

| Product | Position deltas and preview | Accepting `referral_fee` routes |
| --- | --- | --- |
| Earn | `vault_shares`; `assets` spent/received and `shares` before → after | Deposit/withdraw and `assets` force-withdraw; not full-position force-withdraw or `redeem-in-kind` |
| Blue | `supply_shares`, `borrow_shares`, `collateral_assets` | Borrow/repay, not `collateral`-only |
| Midnight | `credit_units`, `debt_units`, `collaterals[].difference` | Borrow, not repay |

Apply all six steps to every action in each selected reference. For Midnight market Actions, build `/v0/actions/midnight/markets/{chain_id}:{market_id}/...` from discovery. Right: `8453:0xcdea4ca06837feca3026b23a95f0bd96c3eabdc77d1211472ce0346fcc200649`; wrong: that bare ID on the Actions path. Bare IDs belong to Midnight REST reads. The current Actions OpenAPI explicitly requires the chain-prefixed selector; do not apply the benchmark's bare-ID assumption here.

**Borrow expiry UI:** at ≤60 s remaining, disable signing and show “Action expiring — restart required” with a Restart action control; discard continuation, request a new action and require confirmation. Exercise this actual UI path with a controlled clock/response fixture, not an unused expiry helper.

Funding is an object: `{"type":"erc20"}`, `{"type":"native","max_native_assets":"..."}`, or `{"type":"auto","max_native_assets":"..."}`. Native/`auto` require maximum `native` spend. Earn/Blue `native` applies only to wrapped-`native` assets; `auto` selects based on balances, not mixed funding. Midnight `native`/`auto` applies to the wrapped-`native` supplied `collateral` portion while other collateral remains ERC-20 funded.

Use `signature_mode: "auto"` only where accepted to reuse allowances, otherwise request supported ERC-2612 permits with matching on-chain domains, falling back to approvals. Default `none` returns prerequisite `calls`; smart-contract accounts generally receive `calls` only. Full-position force-withdraw accepts neither `signature_mode` nor client expiry; do not add `signature_mode` to unsupported Midnight intents.

`expires_at` is Unix seconds; never extend an expired action locally.

| Product | Expiry and protection |
| --- | --- |
| Earn | Standard Vault V1/V2 intents default to 2 h, must be >60 s and ≤7 d away. Full-position force-withdraw has only off-chain response validity, not an on-chain deadline. Ordinary `assets` withdrawal slippage is preparation/attestation-only, not an on-chain maximum-share guard; `shares`/`all` have no on-chain minimum-assets guarantee. Disclose execution-time `price` risks. |
| Borrow | Blue defaults to 30 min, must be >60 s and ≤2 h away. Midnight defaults to 30 min: quoted borrow/market-repay max 1 h, minimum 5 min, not past `maturity`; direct repay max 24 h and >60 s away. A quote can return `QUOTE_STALE` if a selected offer expires before the deadline. Follow each route's schema for `collateral`-only deadlines. |

## Chain coverage

| Action group | Chains |
| --- | --- |
| Vault V2 deposit/withdraw/force-withdraw/`redeem-in-kind`; Blue | `1, 10, 130, 137, 143, 196, 480, 988, 999, 4217, 4663, 5042, 8453, 42161, 747474` |
| Vault V1 deposit/withdraw | `1, 10, 130, 137, 143, 480, 988, 999, 8453, 42161, 747474` |
| Midnight actions | `1, 4663, 5042, 8453` (Ethereum, Robinhood Chain, Arc, Base) |

Other action-group chains return `422 ACTION_UNSUPPORTED`. Read coverage and Merkl support do not establish action coverage. Verify a chain-specific Merkl Distributor before enabling Earn claims.

## Conventions

- Parse integer strings as `bigint`; amounts use base `units`. For shares, Earn uses share-token decimals; Borrow uses raw share units, not token decimals. Fetch `decimals`, `symbol`, `logo_uri` from [GET `/v0/tokens/{selector}`](https://docs.morpho.org/api/global/get-token/) for input parsing/display only; never rescale raw execution amounts.
- USD = raw `amount` / 10^`decimals` × [GET `/v0/tokens/{selector}/price`](https://docs.morpho.org/api/global/get-token-price/) → `data.price`. Null `price` ⇒ "—", never $0; show token amount. Never add unlike tokens before USD conversion.
- REST reads are indexed, not block-atomic. Display from REST; rely on the Actions simulation's chain state before acting. Reconcile delta previews against their REST baseline; refresh stale/inconsistent reads rather than claiming exact atomic snapshots.
- Public host: 750 requests/min/IP. Cache vault/market config and token metadata; poll open positions every 30–60 s, not faster. Paginate full inventories, cursor lists and Merkl opportunity/APR/breakdown lists to completion where needed. Honor `Retry-After` and back off with jitter.
- Show realized average variable rates, never instant rates. Expose one `rateWindow` setting (integrator default; 6h if unset), optionally a selector beside rates. One window drives native, reward and net rates. Midnight quoted fixed APR and `effective_apr` ignore `rateWindow`.

- For reads **and Actions POSTs**, retry only HTTP 429/503 with bounded exponential backoff and jitter (at most 3 retries); honor `Retry-After` seconds or HTTP-date, and stop with manual retry if its delay exceeds the retry budget. Never retry other 4xx or auto-resubmit wallet transactions. Parse error bodies defensively: non-JSON/empty bodies use the HTTP status and generic copy, not an unguarded `response.json()`. Retries must preserve proof verification and expiry checks.

| `rateWindow` | Blue apy-averages key | Vault apy-averages `lookback` | Merkl apr-records, `grain`=`HOUR` | Net APY shown? |
| --- | --- | --- | --- | --- |
| 6h (default) | 6h | `six_hours` | 6 buckets | yes |
| 24h | 24h | `one_day` | 24 buckets | yes |
| 7d | 7d | `seven_days` | 168 buckets | yes |
| 30d, 90d, 1y | 30d, 90d, 1y | `thirty_days`, `ninety_days`, `one_year` | not covered by this recipe | `native` only, "excl. rewards" |

### Earn

- Vault/`token` selectors: `{chainId}:{address}`; user `{u}` is the wallet `address`. Morpho REST uses `data`; Merkl returns chain-grouped arrays, not that envelope.
- User positions: GET `/v0/vaults-v2/users/{user-address}/positions`, as published in the [REST OpenAPI](https://docs.morpho.org/openapi.json); do not infer its version from the `/v1` state/APY routes.
- `share_price_ray` quotes one whole share in whole underlying `tokens`, scaled by 1e27. Expected raw `shares` ≈ floor(assetsRaw × 10^shareDecimals × 1e27 / (10^assetDecimals × `share_price_ray`)). Obtain share `decimals` from vault-`token` metadata or asset `decimals` + configured `decimals_offset`. Null/zero share `price` ⇒ unknown preview, not division by zero. Use integer arithmetic; simulation determines execution.

Vault additionally supports `one_hour` and `inception` lookbacks; do not silently substitute them. Label "variable, 6h avg", "incl. rewards" with a split tooltip, or "excl. rewards". Chosen-window null ⇒ "—", never silently fall back. At 30d/90d/1y show `native` only, explicitly excluding rewards. B2 defines the Merkl hourly recipe. A live hourly response confirmed `timestamp`, `avg` and `hasUntrustedContribution`; the coverage-weighted averaging recipe is the brief's display convention, not a documented Merkl guarantee. Do not fabricate net yield when records are unavailable.

### Borrow — Blue and Midnight

- Blue market selector: `{chainId}:{marketId}`. Token selector: `{chainId}:{address}`. Midnight **REST** market ID is bare and unique across chains; **Actions** selector is `{chain_id}:{market_id}`, using `chain_id` from market discovery.
- [GET `/v0/oracles/{selector}/state`](https://docs.morpho.org/api/oracles/get-oracle-state/) → `data.price` is scaled by 1e36: collateralRaw × `price` / 1e36 gives loan-`token` base `units`. Use oracle `price` for health/liquidation math, `token` USD `price` for USD. Adjust `decimals` when displaying a human `collateral`/loan-`token` `price`.
- Blue `shares` → `assets` from [market state](https://docs.morpho.org/api/blue/get-market-state/), rounding `debt` **up**, supply **down**:

```latex
\text{debt}=\left\lceil\frac{\text{borrow\_shares}(\text{total\_borrow\_assets}+1)}{\text{total\_borrow\_shares}+10^6}\right\rceil
```

  Supply `assets` = floor(`supply_shares` × (`total_supply_assets` + 1) / (`total_supply_shares` + 10^6)). Use integer ceiling division for `debt`.

For a reward-bearing rate, fetch Merkl opportunities by `chainId`, `mainProtocolId=morpho`, `identifier`=market `identifier` and `campaigns`=`true`; per opportunity request `/v4/opportunities/{id}/apr-records?from&to&grain=HOUR` over the same window. Drop `hasUntrustedContribution` records; reward APR = average retained `avg` × (retained buckets / expected buckets) / 100, summed across opportunities. Keep rewards separate from borrow cost; never relabel a borrow APY as depositor net yield. Verify Merkl's current schema before using this recipe; do not substitute `totalApr`/`nativeApr`. Failed rewards fetch ⇒ combined rate "—", `native` rate still visible. No campaign ⇒ hide reward rows. Label the selected window ("variable, 24h avg"); chosen-window null ⇒ "—", never silently fall back. Merkl formula/schema confirmation remains open.

## Position health bands — proposed defaults, design to confirm

Borrow only.

Confirm exact thresholds, color tokens, copy, and empty states against `app.morpho.org` design input before claiming visual parity. These are proposed, not verified app behavior. For multi-`collateral` Midnight use effective LLTV = Σ(`value_i` × `LLTV_i`) / Σ(`value_i`).

| Band | Rule (ratio = LTV / LLTV) | Proposed color token | Proposed copy |
| --- | --- | --- | --- |
| Healthy | ratio < 0.85 | `success` (green) | `none` |
| Warning | 0.85 ≤ ratio < 0.95 | warning (amber) | "Your loan is close to its liquidation limit. Add `collateral` or repay to lower your LTV." |
| Danger | ratio ≥ 0.95 | error (red) | "Your position can be liquidated if prices move further. Act now." |
| Liquidated | liquidation event found | error (red), persistent banner | "Part of your `collateral` was liquidated on {date}." |

Always show LTV next to LLTV ("62% / 86%") and before → after on every action preview. Max borrow/`collateral` withdrawal must keep a safety margin below LLTV matching the Actions API's own buffer: **open question, numeric buffer not published here**. Do not invent one or promise a reject-free Max until verified; simulation is authoritative.
## Action error states

Errors use `{error:{code,message,details,request_id}}`; simulation errors use `simulation.failure`. Retain inputs; raw messages belong in a details toggle. Use structured `details` only when present and validated.

Handle other codes with a generic actionable failure, details toggle and `request_id` for support; do not assume retryability. Treat unknown codes safely; never send `calls` after an error.

| API code | User message | UI behavior |
| --- | --- | --- |
| `INSUFFICIENT_BALANCE` | "Not enough {`token`} in your wallet." | disable confirm, show balance |
| `SIGNATURE_EXPIRED`, `SIGNATURE_REFRESH_REQUIRED`, `ACTION_CONTINUATION_INVALID` | "This request expired. Try again." | restart without `continuation` |
| `INSUFFICIENT_LIQUIDITY` | Earn: "Only {x} can be withdrawn right now."; Borrow: "Only {x} can be borrowed / withdrawn right now." | Earn: offer validated details `amount`; otherwise refresh state/withdrawal-options; if unknown, say unavailable; Borrow: offer available `amount` from details when present; otherwise refresh Blue liquidity or Midnight quote availability; if unknown, say unavailable, not an invented x |
| `CAP_EXCEEDED` | "This vault is full for now." | Earn: disable deposit; Borrow: disable deposit on an earn surface; on borrow explain the affected cap, not a vault deposit failure |
| `QUOTE_STALE`, `SLIPPAGE_EXCEEDED`, `QUOTE_RATE_ABOVE_CEILING` | "The rate moved. Review the new quote." | Earn: refresh preview, require confirmation; rate-quote codes are not normal vault responses; Borrow: re-quote, require a new confirmation |
| `ACTION_UNSUPPORTED` | "Not available on this network or vault." | Earn: hide action; show API reason, including Midnight adapter limits; Borrow: hide the unavailable action; label market rather than vault for borrow |
| `POSITION_UNHEALTHY` | "This would put your loan above its safe limit." | show max allowed `amount` when verified; recompute health and re-simulate |
| `REPAY_EXCEEDS_DEBT` | "That's more than you owe." | offer repay `all` where supported; Midnight market repay uses exact remaining `units` |
| HTTP 429, 503 | "Service busy, retrying…" | backoff; honor `Retry-After`; never auto-resubmit a wallet transaction |

| Scope | Additional codes |
| --- | --- |
| All | `MARKET_NOT_FOUND`, `POSITION_EMPTY`, `POSITION_INSUFFICIENT`, `AMOUNT_TOO_SMALL`, `FUNDING_UNSUPPORTED`, `SHARED_LIQUIDITY_INSUFFICIENT`, `REALLOCATION_DISCOVERY_UNAVAILABLE`, `CONTINUOUS_FEE_TOO_HIGH`, `ACTION_TOO_COMPLEX`, `REQUIREMENTS_CHANGED`, `TOKEN_METADATA_INVALID`, `RECEIVER_INVALID`, `SIGNATURE_INVALID`, `SIGNATURE_UNEXPECTED`, `VALIDATION_FAILED`, `STATE_UNAVAILABLE`, `RPC_CHAIN_MISMATCH`, `CONTRACT_CODE_MISSING`, `VERIFICATION_REJECTED`, `VERIFICATION_INVALID_RESPONSE`, `VERIFICATION_UNAVAILABLE`, `INTERNAL_ERROR`, `ACCESS_RESTRICTED`, `EXECUTION_REVERTED`, `FUNDS_RETAINED`, `INSUFFICIENT_ALLOWANCE`, `NONCE_ALREADY_USED` |
| Earn | `VAULT_NOT_FOUND`, `VAULT_UNSUPPORTED`, `IN_KIND_REDEEM_CROSS_CHAIN` |
| Borrow | `NOT_FOUND`, `QUOTE_UNAVAILABLE`, `QUOTE_INSUFFICIENT`, `QUOTE_INVALID`, `QUOTE_MARKET_MISMATCH`, `QUOTE_ORDER_INVALID`, `COLLATERAL_UNSUPPORTED`, `TARGET_UNREACHABLE`, `REQUEST_ABORTED`, `REQUEST_BODY_INCOMPLETE`, `PAYLOAD_TOO_LARGE`, `PREPARATION_INVALID`, `REQUIREMENT_UNSUPPORTED`, `REQUIREMENT_SERIALIZATION_FAILED`, `MARKET_LLTV_NOT_ENABLED`, `MARKET_LIQUIDATION_CURSOR_NOT_ENABLED`, `MARKET_MATURITY_TOO_FAR` |

## Global rules

Every number has a unit and rates a type: "variable, 6h avg", "fixed until {date}" for Midnight, or "6h avg, excl. rewards". Show skeletons, not zeros, while loading; unknown ⇒ "—"; a loaded empty position list shows "No position". Earn previews show shares/assets before → after, fees/penalties and net wallet receipts.

Use one review screen listing every signature and transaction in order before the first prompt. Signature-required responses lack final calls: label the call plan pending, obtain consent for each signature, update it on continuation, and require final call review before sending. Never claim unseen calls were reviewed.

After confirmation refetch positions; keep pending until `last_indexed_block` ≥ transaction block where provided. Otherwise re-poll and reconcile balances and shares (Earn) or debt/collateral (Borrow) with the confirmed action; Midnight has no universal watermark. Never equate a receipt with an updated indexed UI. Earn full exit can leave a zero-assets/zero-shares indexed row: hide it from active positions, do not require deletion. Merkl indexing is separate; after claim use `reloadChainId` to reconcile cached `claimed`.

## Acceptance test — two-minute build

Give a fresh agent this skill, an API key and the selected selector. Build the selected stories without a human answering implementation questions. Every acceptance line must hold or be reported `UNVERIFIED` with missing evidence/API gap; unresolved product/design questions stay explicitly open, not invented.

- Force insufficient balance: disable confirmation, show token/balance; send nothing.
- Force an expired action: stop before signing/sending, discard continuation, request a new action and confirmation.

### Earn

Earn selector: Steakhouse USDG on Robinhood Chain, `4663:0xBeEff033F34C046626B8D0A041844C5d1A5409dd`. Build B1–B3 and Claim rewards.

Exercise deposit, empty position, null rate/`price`, rewards/no campaign, partial/full exit, illiquid alternatives, `claim`, and post-exit `claim`. Use controlled fixtures when the selected vault has no campaign or cannot safely exhibit a state.

- Force liquidity shortfall: show what can leave now and offer that smaller withdrawal, force-withdraw with an explicit maximum penalty where supported, and redeem-in-kind with positions received. Provide a dev-only fixture/override that reaches this UI without a funded wallet; it must never enable signing or submission. Label unsupported alternatives rather than silently hiding why they cannot be used.

### Borrow — Blue and Midnight

Borrow: build every A1, A1b, A2–A6 surface in the selected reference.

- **Blue:** USDC / cbBTC on Base, selector 8453:0x9103c3b4e834476c9a62ea009ba2c884ee42e94e6e314a26f04d312434191836.
- **Midnight:** pick a listed USDC market on Base or Robinhood Chain from GET `/v0/midnight/markets?listed=true`, preserving `chain_id` for the Actions selector.
- Exercise normal, no-position/no-`debt`, null `price`/rate, partial/full repay, slider, warnings, `maturity` and liquidation states. Every story's acceptance line must hold or be reported `UNVERIFIED` with the missing evidence/API gap.
- Force liquidity shortfall: show available `amount` when known, offer smaller `amount`; Midnight early exit also offers direct face-`value` repay.
- Never manufacture real liquidation or unsafe transactions to test; use controlled fixtures for dangerous/unavailable states and label that evidence.

## Open questions

- App-team design confirmation: exact color tokens, error copy, empty states and proposed Borrow health thresholds; obtain one embeddable design file. No health bands on Earn.
- Merkl reward recipe/schema and averaging semantics remain open, including limited `HOUR` retention. Live fields are verified, but the coverage-weighted display recipe is not a vendor guarantee.

### Earn

- Position route versioning: `/v1/vaults-v2/users/{user-address}/positions` also returned 200, but the published schema documents `/v0`; the alias/version policy is unconfirmed.
- Root-update cadence: brief's "~8 h" is unverified, not a promise. Current docs say `pending` updates ~2 h; that is not the claimable-`root` schedule.
- Distributor `address` per target chain and configured `claim` `recipient`; do not assume universal `address` or wallet receipt.
- Ledger/points/pre-token rewards and unavailable private/truncated campaign attribution remain explicit gaps, not claimable ERC-20 rewards.

### Borrow — Blue and Midnight

- Midnight selector discrepancy: the benchmark's bare-ID Actions requirement is unconfirmed; the published `MidnightMarketSelector` requires `{chain_id}:{market_id}`. Verify any different deployment's schema before changing this contract.
- Max safety buffer below LLTV must match Actions; unknown numeric `value`.
- Blue user liquidation feed is absent; interim history comparison is an API gap, not proof.
- Midnight interest owed from `cost_basis`: accounting interpretation remains open despite known WAD scaling.
- Rolling Midnight loans into Blue or Midnight: scope/flow remains open.
- Margin remains open.

## Verification while building

Use applicable prompts in [references/checkers/](references/checkers/) and [math-correctness](references/checkers/math-correctness.md) after each surface exists. Keep scoped V1/V2 and Blue/Midnight verdicts separate.

No check passes without artifact evidence: code, API response, runtime state, or screen as applicable. Report `UNVERIFIED` and name missing evidence when a required artifact is unavailable. Do not claim visual parity from a build or API response.
