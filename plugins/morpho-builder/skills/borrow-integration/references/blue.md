# Blue variable-rate borrowing guide

Read this reference when the requested product uses Morpho Blue: isolated markets identified by loan token, collateral token, oracle, interest-rate model, and LLTV. Do not apply Midnight orderbook or maturity semantics here.

## Contents

- Market and position model
- Data-source policy
- Primary transaction pattern
- Open, manage, close, reallocate, and refinance
- Rates, rewards, risk, and UI
- Safety and release checks

## Market and position model

A Blue market is uniquely derived from five immutable parameters:

- loan token;
- collateral token;
- oracle;
- interest-rate model (IRM);
- liquidation loan-to-value (LLTV).

Treat chain ID plus market ID/params as identity. Token symbols are insufficient. Discovery views should expose the pair, chain, variable borrow rate, utilization, available liquidity, LLTV, oracle/IRM, warnings, reward programs, and recent/historical behavior.

Blue stores market totals at the last interaction and accrues interest lazily. Before using debt, liquidity, rate, LTV, health, liquidation price, max borrow, or collateral-withdrawal capacity, fetch a common current block and obtain accrued market and position entities. `market.getMarketData()` and `market.getPositionData(userAddress)` are the default fresh read path.

## Data-source policy

1. **`@morpho-org/morpho-sdk`:** primary abstraction for writes and fresh accrued market/position entities. Construct `client.morpho.blue(marketParams, chainId)` and use its actions, `getRequirements()`, and `buildTx(...)`.
2. **Morpho REST API:** single-market config/state, APY/history, oracle/token data, and one user position after a market is known.
3. **Morpho GraphQL API:** indexed market discovery/filtering, aggregate positions, USD values, IRM curves, warnings, histories, reward APRs, and Public Allocator candidates.
4. **Onchain RPC:** final truth and fallback for current state, oracle reads, approvals/authorizations, accrual inputs, transaction simulation, and position management during API outages.

REST market selectors are `<chainId>:<marketId>`. Resolve the current version prefix from the [Core API reference](https://api.morpho.org/core/docs). Route families map as follows:

| Need | REST route family | GraphQL use |
| --- | --- | --- |
| Immutable market params | `/blue/markets/{selector}` | discovery and filtering across markets |
| Market totals/liquidity | `/blue/markets/{selector}/state` | aggregates and USD analytics; accrue with SDK for execution |
| APY averages/history | `/apy-averages`, `/apy/history`, `/state/history` under the market | flexible histories and IRM curves |
| Oracle/token price | oracle state and token price routes | oracle composition and cross-market analytics |
| User position | `/blue/markets/{selector}/users/{user}/position` | cross-market positions and USD values |
| Rewards | indexed through GraphQL/rewards data | campaigns and per-token APRs |
| Reallocation candidates | Public Allocator data routes | discovery and aggregate available shared liquidity |

REST has no list endpoint for Blue discovery; use GraphQL for enumeration. Paginate connections (`first`/`skip`, `pageInfo`) because defaults are partial. Select only required fields, split history from list queries, monitor `extensions.warnings` for field deprecations, and migrate before removal. Cache market metadata and histories with explicit TTLs; do not cache borrow execution state as current. On `429`, honor `Retry-After` and back off with jitter. Read `last_indexed_block` or equivalent metadata where provided and compare with chain head. If freshness affects health or a write, use the SDK/onchain result.

## Primary transaction pattern

Build the extended viem client with `morphoViemExtension`, then create the market from verified `MarketParams`. The action's `userAddress` must be the connected account that signs and sends.

For each action:

1. fetch one current block and fresh accrued market/position data;
2. create the supported SDK action;
3. await `getRequirements()` and dispatch every approval, Morpho authorization, or requested signature, waiting for prerequisite receipts;
4. call `buildTx(signatures?)`;
5. simulate the final authorized transaction from the actual account and with the exact native value;
6. show post-action risk/cost, submit, wait for the receipt, and reconcile fresh accrued state.

Requirements vary by action and client configuration. Never assume an approval, authorization, or permit already exists from an indexer response. Refresh if the account, market, amount, position, or reallocation plan changes.

## Discover and select a market

Use GraphQL to filter candidates by chain, exact loan/collateral addresses, listing/warnings, liquidity, LLTV, oracle, IRM, rewards, and rate/history. Verify the selected market ID by reconstructing it from the returned params or resolving those params onchain. A familiar pair can have multiple markets with different oracle, IRM, or LLTV.

Do not rank on headline variable rate alone. At minimum include available liquidity, utilization, LLTV/risk buffer, oracle design and warnings, market age/history, and reward durability. Keep rewards separate from protocol borrow cost.

## Open: collateral plus borrow

Prefer the SDK's `supplyCollateralBorrow` for a one-bundle open. It supplies collateral before borrowing, resolves collateral-token approval/permit and GeneralAdapter1 Morpho authorization, and validates the post-action position against the SDK LLTV buffer.

For a staged flow, use `supplyCollateral` and `borrow`; do not hand-compose their calldata. Before confirmation show:

- exact collateral and loan assets with token decimals and USD estimates;
- post-action variable borrow rate and estimated cost, including the user's own utilization impact when material;
- post-action debt, LTV, LLTV, health factor/buffer, liquidation price, and available liquidity;
- protocol/reward/integrator fee components separately;
- whether shared-liquidity reallocation is included and its native fee.

The SDK's safety buffer is a transaction guard, not the product's recommended user buffer. The UI should default materially below LLTV and warn before aggressive positions.

## Manage a position

Fetch fresh accrued `positionData` for every management action. Provide obvious routes to add collateral, repay, and—only while healthy—withdraw collateral.

### Partial repay

Use `repay` in asset-amount mode for an exact partial repayment. Preview post-repay accrued debt and health. Resolve loan-token funding approval/permit through `getRequirements()`.

### Full repay

Use `repay` in **shares mode** with the user's full fresh `borrowShares`. A fixed asset snapshot can leave dust as interest accrues before inclusion. Full-close success means fresh post-receipt borrow shares are zero, not merely that the submitted asset amount matched an earlier preview.

### Repay and withdraw collateral

Use `repayWithdrawCollateral` for an atomic combined action. The SDK orders repay before collateral withdrawal and validates the combined post-state. For a full close, repay by all borrow shares and explicitly choose the collateral amount to withdraw; reconcile both debt and collateral after the receipt.

### Withdraw collateral only

Use `withdrawCollateral` with fresh position data. The SDK builds the direct Morpho action and checks the resulting health against its LLTV buffer. Still simulate at the latest block and show the reduced buffer/liquidation price before confirmation.

## Liquidity reallocation

When the target market lacks loan-asset liquidity, the SDK can prepend Public Allocator reallocation calls to a borrow or loan-asset withdrawal bundle. Use `getReallocationData(...)` and `getReallocations(...)` (or validated SDK-compatible inputs), not a hand-ordered liquidity plan.

- Show source vault(s), amounts, and Public Allocator native fees.
- Include the fee in transaction `value` and total-cost preview.
- Treat reallocation availability as ephemeral; refresh and simulate immediately before submission.
- Do not imply that advertised reallocatable liquidity is guaranteed to remain available.

## Refinance

Use `refinance` to atomically move collateral and debt between compatible Blue markets sharing the same loan and collateral tokens. The target may differ in oracle, IRM, or LLTV.

- Compare source and target params, variable rates, liquidity, oracle risk, LLTV, rewards, fees, and post-refinance health.
- Use **borrow-shares mode** for a full source-debt close; asset mode is for exact partial debt.
- Include optional target-market reallocation only through the supported SDK flow.
- Require explicit confirmation of the new market identity and risks; “lower rate” alone is not adequate consent.
- Verify the source borrow shares are zero and the target position matches the preview after confirmation.

## Rates, rewards, and risk

Label Blue borrow rates **variable** everywhere. They move with utilization and accrue continuously between market interactions. A current API rate is a snapshot; an action may change utilization and therefore the user's post-trade rate.

Display protocol borrow APY/APR consistently, state the compounding convention, and do not mix it with reward APR or the integrator's fees. Name every reward token and campaign/end/claim conditions. Rewards are incentives, not a reduction guaranteed for the life of the debt.

Health views must be based on fresh accrued debt and current oracle data. Show at least:

- debt and collateral in native units and value;
- LTV and LLTV;
- health factor or remaining buffer with its convention explained;
- liquidation price or equivalent actionable threshold;
- variable rate and projected cost;
- warnings for oracle, liquidity, bad debt, or market configuration.

Explain plainly that interest growth can worsen health even if collateral price does not move and that liquidation can seize collateral. Never use infinite/undefined health from a zero-debt position as a misleading numeric score.

## Position, attribution, and disclosures

Keep the exact Blue market pair and variable-rate label visible on detail, review, confirmation, and dashboard. Show pending/confirmed/failed transaction states and refetch accrued data after confirmation.

Before the first transaction, require an unavoidable acknowledgment covering the integrator's terms, the [Morpho disclaimer](https://morpho.org/disclaimers/), smart-contract, oracle, market-liquidity, variable-rate, collateral-price, and liquidation risks. Use the official Powered by Morpho asset on interaction surfaces. Do not present Morpho Association as the lender, market operator, guarantor, or risk assessor.

## Advanced math review

The primary SDK should own supported transaction and entity math. If an integration intentionally performs custom analytics not exposed by it, review the exact lower-level entity/math implementation against the current SDK source, onchain rounding, oracle scale, and accrued timestamp. Keep protocol amounts as bigint until display formatting. Do not replace a supported SDK action with lower-level packages merely to save a call.

## Safety and release checks

- Market ID/params, account, and chain are verified.
- Every debt/risk preview uses fresh accrued market and position data from one coherent block.
- Full repay/refinance closes by shares; post-receipt debt shares are checked.
- LTV/LLTV, liquidation, variable rate, liquidity, rewards, and all fees are distinct and visible.
- Supported actions, reallocations, and refinance are built through `@morpho-org/morpho-sdk`.
- All requirements resolve and the exact final transaction simulates before send.
- No floating-point arithmetic touches raw token, share, oracle, rate, or risk values.
- API pagination, caching, `429`/`Retry-After`, deprecation warnings, freshness, and onchain fallback are implemented and testable.
