# Midnight fixed-rate borrowing guide

Read this reference when the requested product borrows at a fixed rate and fixed maturity through Morpho Midnight. Midnight is currently **Base-only** (chain ID 8453). Reject or reroute any attempt to construct a Midnight action on another chain; do not silently turn it into Blue borrowing.

This skill covers the borrower side. Fixed-rate lending and advanced maker infrastructure are outside scope unless needed to understand a borrower's secondary exit.

## Contents

- Market, book, and position model
- Data-source and API policy
- Quote semantics
- Atomic collateral and borrow
- Position maintenance, maturity, and secondary exit
- Errors and degraded operation
- Safety and release checks

## Market, book, and position model

A Midnight market fixes a loan token, accepted collateral configurations (token, LLTV, liquidation cursor, oracle), maturity, gates, and other market parameters. Positions exchange discounted **credit units**: one unit is face-value debt/credit at maturity, subject to protocol fees and loss mechanics.

The offchain router indexes ratified maker offers into two sides:

- **bids:** makers buy units (lend); a borrower takes bids, sells units, and receives loan assets;
- **asks:** makers sell units (borrow); a lender—or an existing borrower buying units to close debt early—takes asks.

For a borrow product, discovery must include chain, market ID, loan token, maturity, accepted collateral/LLTV/oracles, gates/warnings, bid depth, price and implied fixed rate, settlement/continuous fee information, and current position health. Never call an ask a borrow quote.

The fixed rate applies to an executed fill, not to a displayed orderbook snapshot. The transaction creates debt in units due at the market maturity. Borrowers can be liquidated before maturity if debt exceeds collateral capacity and face post-maturity liquidation if debt remains unpaid.

## Data-source policy

1. **`@morpho-org/morpho-sdk`:** primary abstraction for fresh Midnight entities and all supported writes. Use `client.morpho.midnight(8453)`, same-block `getMarketData`/`getPositionData`, action `getRequirements()`, and `buildTx(...)`.
2. **Midnight API:** sole source for executable orderbook plans. Use the Morpho SDK's Midnight API helper subpath when practical, pin the package version because that helper surface may change, and validate successful response shapes at the integration boundary.
3. **Morpho REST API:** indexed market/book/position/performance/transaction discovery and history. Use GraphQL only for related cross-product metadata that the documented schema actually exposes; it is not a replacement for a Midnight quote.
4. **Onchain RPC:** final truth and fallback for market/position state, collateral/oracle health, approvals/authorizations, and transaction simulation. During an API outage users must still be able to inspect and maintain/repay positions when the onchain path permits it, but new orderbook fills cannot invent a quote.

Current REST route families are under `/midnight` and documented in the [Core API reference](https://api.morpho.org/core/docs):

| Need | Route family |
| --- | --- |
| Discover markets and state | `/markets`, `/markets/{marketId}`, `/markets/{marketId}/state` |
| Browse liquidity | `/books`, `/books/{marketId}`, `/books/{marketId}/{asks|bids}` |
| Executable plan | `/books/{marketId}/{asks|bids}/quote` |
| Raw executable offers | `/books/{marketId}/{side}/takeable-offers` |
| User positions | `/users/{user}/positions`, `/markets/{marketId}/users/{user}/position` |
| Position performance | `/markets/{marketId}/users/{user}/position/performance` |
| User/market activity | user and market transaction routes |
| Offer validation | `/mempool/validate` (advanced maker context only) |

List endpoints use cursor pagination. Continue until `cursor` is null; never treat the first page as complete. Cache discovery and historical analytics with explicit TTLs, but do not reuse a quote as a cached market fact. Read `last_indexed_block` from indexed position/performance responses and compare it with the Base head before showing critical status. For a write, fetch onchain state and quote again.

Honor `429` and `Retry-After` with jittered backoff. Avoid synchronized polling. Monitor GraphQL `extensions.warnings` for deprecation warnings if GraphQL is used for related data. The Morpho API has no SLA, so keep an onchain maintenance/repayment fallback for open positions.

## Fetch a borrow quote

Use the Midnight quote helper or `GET /books/{marketId}/bids/quote` with exactly one target dimension:

- `assets`: loan assets the borrower wants to receive; or
- `units`: face-value units the borrower wants to sell/owe.

Apply one executable price guard:

- `slippage`, which derives a conservative worst-price guard; or
- `average_worst_price`, an explicit guard.

Do not send both. Also use a bounded `limit` for offers walked and returned.

The response contains realized best/worst average prices, available assets/units, and ordered `takeable_offers`. Those offers intentionally include **fallback excess** beyond the target so the bundle can skip or partially consume offers that change before inclusion. The builder must stop at the requested target and enforce `loanAssets` plus `maxUnits`; never execute every returned cap as an independent take.

Quote lifecycle requirements:

- refresh on market, collateral, amount, side, or slippage change;
- cancel/ignore superseded requests so a slow response cannot overwrite the latest input;
- bind the quote to market ID, Base chain, target, side `bids`, and guard;
- show quote timestamp, fixed rate, price, debt units at maturity, assets received, fees, fallback nature, and expiry/deadline;
- fetch fresh same-block market state, rebuild, and simulate immediately before signing;
- use a finite deadline appropriate to the UX; “no expiry” requires an explicit product decision, not a default shortcut.

An executable quote is still not a guaranteed fill. Offers can be consumed or invalidated before the bundle lands.

## Atomic collateral plus borrow

Construct `midnight = client.morpho.midnight(8453)`. Fetch a Base block, then `getMarketData(marketId, { blockNumber })`; select and validate the collateral index/config.

For a new position, use `supplyCollateralTakeBorrow` with:

- account address matching the connected signer;
- fresh market data;
- collateral amount and selected collateral index;
- quote target assets and maximum units;
- quote-provided takeable offers in their returned order;
- a finite deadline.

Await every `getRequirements()` result. The atomic route may require collateral-token approval and MidnightBundles authorization. Send prerequisite transactions and wait for their receipts before `buildTx()`. Midnight taker requirements are not interchangeable with Blue permits.

Simulate the exact built bundle from the user account. Before confirmation show:

- collateral supplied and its oracle value;
- loan assets targeted/expected;
- debt units due at maturity and total fixed cost;
- fixed rate and price, with best/worst execution bounds;
- maturity date and time-to-maturity;
- post-action max debt, health/buffer, LLTV, and liquidation consequence;
- settlement fee, continuous fee exposure where relevant, gas, and any integrator fee separately.

If collateral is already supplied, use `takeBorrow` with the same quote, guard, deadline, fresh market data, requirement, and simulation discipline. Do not split an intended atomic open into collateral and borrow transactions unless the user understands the interim state.

## Position maintenance

Fetch a common Base block, hydrate market and user position data at that block, and accrue the returned position to the block timestamp before showing debt or health.

- **Add collateral:** use `supplyCollateral` and its approval requirement.
- **Repay and/or withdraw collateral:** use `repayWithdrawCollateral`; set repay and withdrawal amounts explicitly, keep a finite deadline, and simulate the combined post-state.
- **Health:** show total debt units/assets, collateral by token, max debt/capacity, oracle inputs, buffer, and pre-maturity liquidation status.
- **Maturity:** show an absolute UTC/localized timestamp and a countdown. At maturity switch to a distinct matured state; never render a negative countdown.

Do not say a Midnight loan is “locked at a fixed rate” without also naming its fixed maturity and debt at maturity. The quote rate does not remove collateral, oracle, liquidity, fee, or liquidation risk.

## Repay at maturity

At or around maturity, quote/display the current repay assets needed from fresh accrued position state and use `repayWithdrawCollateral` to repay and optionally release collateral atomically. Resolve loan-token approval and bundle authorization, simulate, and reconcile the post-receipt debt and collateral.

Warn well before maturity. State plainly that unpaid debt can be liquidated after maturity. Do not rely on a client-side scheduler or notification as the only repayment path.

## Early close through secondary liquidity

Before maturity, a borrower may close debt by buying units on the **ask** side. This is a new orderbook trade, not a refund of the original borrow, and it depends on available secondary liquidity.

- Fetch an ask-side quote for the units required to reduce/close the fresh debt.
- Apply the same slippage, fallback-window, finite-deadline, requirement, and simulation rules as any taker fill.
- Show the assets paid, units acquired/netted, realized exit rate/price, fees, residual debt, and whether collateral can be withdrawn afterward.
- Do not promise an early exit when the book cannot fill it. A partial quote must remain a partial close unless the user explicitly accepts it.
- After the trade, refetch position data; withdraw collateral only when the fresh post-trade state permits it.

## API and quote failure handling

Branch on typed SDK/API errors where available and preserve the user's inputs. At minimum handle:

- `400`: invalid side/amount/guard/request—fix the request; do not retry unchanged;
- `404`: unknown or inactive market/book—return to discovery and verify market ID;
- `422`: target cannot fill within liquidity, guard, or offer limit—show available liquidity, allow a smaller target or explicit guard change, and never loosen slippage silently;
- `429`: honor `Retry-After`, stop aggressive polling, and show a retry state;
- `503`/network timeout: quote service unavailable—do not fabricate or reuse an expired quote; keep read/onchain maintenance paths available;
- malformed success response: fail closed and log schema evidence without exposing secrets;
- simulation revert: discard the plan, refetch quote and onchain state, then explain the decoded reason if known.

Do not change `bids` to `asks`, extend the deadline, raise `maxUnits`, or increase slippage automatically to make a failed borrow pass.

## Rates, attribution, and disclosures

Label the executed result **fixed rate, fixed term**. The interface should distinguish orderbook price from implied annualized rate and label the annualization convention/time to maturity. Never describe Midnight's rate as utilization-driven.

Before the first transaction, require an unavoidable acknowledgment covering the integrator's terms, the [Morpho disclaimer](https://morpho.org/disclaimers/), smart-contract, orderbook/partial-fill, secondary-liquidity, oracle, collateral, liquidation, fee, and maturity risks. Use the official Powered by Morpho asset on detail, review, confirmation, and position surfaces. Do not present Morpho Association as the counterparty, guarantor, or operator promising a fill.

## Advanced math review

The primary SDK and quote response should own supported price/unit/fee math and transaction construction. If custom analytics are unavoidable, review the exact lower-level tick, price, unit, settlement-fee, rounding, and maturity implementation against current SDK source and contract behavior. Keep WAD and token values as bigint until formatting. Never use floating exponentiation for tick/rate conversions.

## Safety and release checks

- Base chain, market ID, bid side, collateral index, user, target, quote guard, and deadline are bound together.
- Quote requests are race-safe, fresh, and never cached as executable truth.
- Fallback offers are passed to the primary SDK builder, not blindly executed to their summed cap.
- Atomic collateral+borrow and maintenance actions use `@morpho-org/morpho-sdk`, complete requirements, and simulate before send.
- Fixed rate, price, maturity, debt units, fees, health, liquidation, and secondary-liquidity risk are visible and distinct.
- Matured state, repayment, partial fill, no-liquidity, `422`, `429`, `503`, malformed response, and simulation failure are tested.
- Cursor pagination, caching policy, freshness metadata, and onchain maintenance fallback are implemented.
