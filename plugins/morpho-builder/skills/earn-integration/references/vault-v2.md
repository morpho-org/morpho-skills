# Vault V2 implementation guide

Read this reference for every Earn build or targeted review. It covers Morpho Vault V2 only; Vault V1 belongs here only when an existing position must migrate or remain compatible.

## Contents

- Product and data model
- Data-source policy and endpoint map
- Transaction pattern
- Deposits and native assets
- Liquid and illiquid exits
- APY, rewards, positions, and UX
- Safety and release checks

## Product and data model

A Vault V2 accepts one ERC-20 underlying asset and issues ERC-4626 shares. It can hold idle assets and allocate through enabled adapters, including Morpho Blue market adapters. Treat the vault address plus chain ID as identity; symbols and names are display metadata, not identifiers.

For discovery and detail views, resolve at least:

- chain, address, name, symbol, listed/warning state, underlying address and decimals;
- curator/owner roles and relevant pending governance actions;
- total assets, total supply, share price, idle assets, allocated assets, and currently withdrawable assets;
- adapter allocations, underlying markets, caps, and material exposure concentrations;
- performance and management fee rates plus recipients;
- instant and realized/historical APY, underlying-token yield, and rewards by token;
- user shares, asset-equivalent value, activity/history, and realized/unrealized performance;
- normal, force-deallocation, and in-kind withdrawal options.

Accrual changes share value. For an execution preview, call `vault.getData()` and use the returned accrued Vault V2 entity and conversion helpers. Do not rebuild share math from API snapshots.

### Non-standard ERC-4626 max functions

Vault V2 deliberately returns zero from `maxDeposit`, `maxMint`, `maxWithdraw`, and `maxRedeem`. Zero does **not** mean deposits are disabled, the user owns no shares, or nothing is withdrawable. Obtain position balances and withdrawal options from fresh state, validate gates/caps, and simulate the intended transaction.

## Data-source policy

Use the least stale source appropriate to the decision:

1. **`@morpho-org/morpho-sdk`:** primary abstraction for writes and fresh protocol entities. Use `client.morpho.vaultV2(address, chainId)`, `vault.getData()`, the action's `getRequirements()`, and `buildTx(...)`.
2. **Morpho REST API:** one-vault state, histories, positions, performance, APY, allocations, and withdrawal options when a vault selector is already known.
3. **Morpho GraphQL API:** indexed discovery/filtering, cross-vault lists, USD analytics, rewards, histories, and aggregate user positions.
4. **Onchain RPC:** critical fallback and final truth for balances, shares, gates, configuration, and transaction simulation. The API has no SLA and must not be the only dependency for exits.

REST selectors are `<chainId>:<vaultAddress>`. The versioned prefix may evolve; resolve it from the [Core API reference](https://api.morpho.org/core/docs) instead of freezing an old version in a client. The current route families map as follows:

| Need | REST route family | GraphQL use |
| --- | --- | --- |
| Config and fees | `/vaults-v2/{selector}` | `vaultV2ByAddress` or `vaultV2s` for discovery and metadata |
| Accrued/live state | `/vaults-v2/{selector}/state` | indexed list/detail analytics; use SDK/onchain before writes |
| Allocations | `/vaults-v2/{selector}/allocations` | adapters and nested market positions across vaults |
| Instant APY | `/vaults-v2/{selector}/apy` | native/underlying/reward breakdown across vaults |
| APY and state history | `/vaults-v2/{selector}/apy/history`, `/state/history` | configurable interval/time-range histories |
| Realized average APY | `/vaults-v2/{selector}/apy-averages` | comparison and aggregate analytics |
| Governance/caps | pending-action and caps-history routes | `pendingConfigs`, roles, caps, warnings |
| Withdrawal planning | `/vaults-v2/{selector}/withdrawal-options` | discovery context only; confirm onchain |
| User position | `/vaults-v2/{selector}/users/{user}/position` | cross-vault user portfolios and USD values |
| User activity/history/performance | position activity, history, and performance routes | indexed transaction history and aggregate P&L |

Treat these responses as indexed snapshots. Read `last_indexed_block` or equivalent freshness metadata when present; compare it to the chain head for critical views. Label delayed analytics, and refetch after a confirmed transaction rather than assuming the indexer has caught up.

For GraphQL, paginate every connection (`first`/`skip` and `pageInfo`); the default is only the first 100 results. Select only needed fields, split expensive history queries, and inspect `extensions.warnings` for deprecated fields. Cache discovery, metadata, and histories on the backend with purpose-specific TTLs; do not cache user execution state as if current. On `429`, honor `Retry-After`, add jittered backoff, and do not fan out retries. Preserve a read-only onchain exit path if the API is unavailable.

## Primary transaction pattern

Build the extended viem client once with `morphoViemExtension`. The action's `userAddress` must match that client's connected account, and that same client must sign/send the built transaction.

For every supported action:

1. fetch fresh vault and account state;
2. create the Vault V2 action handle;
3. await `getRequirements()`;
4. dispatch each returned approval transaction or collect each requested signature, waiting for prerequisite receipts;
5. call `buildTx(signatures?)` only after requirements resolve;
6. simulate the final transaction from the actual account, including `value`;
7. display a final preview, submit, wait for receipt, and reconcile fresh state.

Do not assume requirements are always approvals or always signatures. Do not reuse a requirement set across account, chain, amount, deadline, or material state changes.

## Deposit

Create the entity with `client.morpho.vaultV2(vaultAddress, chainId)` and fetch `vaultData = await vault.getData()`. Use `vault.deposit({ amount, userAddress, vaultData, slippageTolerance })` for the ERC-20 underlying.

- `amount` and `slippageTolerance` are bigint fixed-point values; obtain the exact current units from the SDK docs.
- The SDK routes through Bundler3/GeneralAdapter1, resolves approval or permit requirements, and enforces a forward `maxSharePrice` bound against adverse share-price movement/inflation.
- Preview assets in, expected shares, the worst acceptable share result implied by the bound, fees, and native transaction value.
- Refresh `vaultData` if the review step is long-lived or the amount changes materially.
- Simulate the final authorized transaction. A quote or successful requirement pass is not a simulation.

### Native-token deposit

When the vault underlying is the chain's wrapped native token, use the SDK's `nativeAmount` deposit support. It wraps and deposits atomically. Mixed ERC-20 `amount` plus `nativeAmount` is supported when documented by the current SDK.

Reject native input for any other underlying. Keep gas balance separate from the native amount being deposited, show the wrap in the review copy, and send the exact `value` produced by `buildTx`.

## Liquid exits

Use the action that matches the user's intent:

- `withdraw({ amount, userAddress })`: request an exact asset amount. This is a direct vault call.
- `redeem({ shares, userAddress })`: burn an exact share amount. Prefer this for “redeem these shares” and full-share exits because share price cannot change the number of shares burned.

Preview both asset and share sides with fresh accrued data, but do not promise the preview as an exact output when the selected action does not guarantee it. Simulate to detect gates or insufficient liquidity. Never derive a “MAX” action from the zero-valued ERC-4626 max functions; use the user's actual share balance and fresh conversion/withdrawal data.

If a liquid `withdraw` or `redeem` fails because underlying allocations cannot release enough assets, keep the position intact and offer explicit alternatives. Do not repeatedly submit the same doomed transaction.

## Illiquid exits

Illiquidity is a routing state, not a reason to hide or disable exits. Present the available paths and their different outcomes.

### Force withdraw or force redeem

`forceWithdraw` and `forceRedeem` encode ordered `forceDeallocate` calls followed by one withdrawal/redeem inside the Vault V2 multicall. Use SDK-derived adapter/deallocation inputs and fresh state.

- Confirm each selected adapter can release the requested assets.
- For share-based redemption, include a conservative deallocation buffer for share-price drift as directed by the SDK.
- Preview and disclose any force-deallocation penalty/cost and its payer.
- Simulate the exact multicall. A deallocation can fail even if an indexed withdrawal-options response looked sufficient.

### In-kind redemption

Use `vault.inKindRedeem(...)` only when supported on the chain and vault configuration. It burns vault shares, returns idle underlying first, then transfers ordered Morpho Blue supply positions for the illiquid remainder. The user does **not** necessarily receive only the vault's underlying token.

- Use the SDK preview helper to enumerate supported choices and show idle assets, net assets, fee/penalty assets, remaining exit amount, and the market position(s) received.
- Respect the supported-adapter constraint and registered exit-bundle address. Do not invent a custom equivalent.
- Size against fresh `previewRedeem(sharesHeld)` and the SDK's rounding buffer; the SDK does not guarantee the user has sufficient shares merely because the action object was created.
- Await `getRequirements()` so deadline, Blue balance, allowance, nonce, adapter, and coverage checks run. Still simulate the final authorized transaction because gates and snapshot drift can fail onchain.
- Explain that transferred Blue supply positions may themselves be illiquid and require later withdrawal as liquidity returns.

## APY, fees, and rewards

Display components without silently summing unlike concepts:

- **native vault APY:** variable return from current allocations, net of the performance/management-fee treatment documented by the chosen source;
- **underlying-token yield:** separate when the deposit asset itself is yield-bearing;
- **rewards:** APR per named reward token, with campaign/end/claim information when available;
- **fees:** performance fee, management fee, recipients, and any integrator fee, each separately labeled.

Use instant APY for a current snapshot and realized/historical endpoints for backward-looking performance. Label the window and do not market historical performance as a forecast. Rewards data is indexed and may come from an external distribution system through Morpho; do not describe rewards as guaranteed interest.

## Position and UX requirements

Across browse, detail, review, confirmation, and portfolio surfaces:

- keep vault name, chain, underlying asset, and Morpho attribution visible;
- label APY variable and show its components and data timestamp/block;
- name the curator and link to allocation/collateral exposure and material warnings;
- distinguish TVL, user position value, idle assets, and currently withdrawable assets;
- show receipt shares where useful without making the receipt-token symbol the product name;
- provide deposit, normal exit, and illiquid-exit recovery paths;
- after submission, show pending/confirmed/failed state and reconcile the actual shares/assets from fresh data.

Before the user's first transaction, require an unavoidable acknowledgment covering the integrator's terms, the [Morpho disclaimer](https://morpho.org/disclaimers/), smart-contract/curator/market/oracle/liquidity/reward risks, and the non-guaranteed variable nature of yield. Use the official Powered by Morpho asset on the detail, review, confirmation, and position surfaces; do not redraw the brand mark.

## Safety and release checks

- No hardcoded vault facts, APYs, rewards, fees, liquidity, or allocations.
- No use of Vault V2 max functions as availability signals.
- No raw `Number`/floating-point conversion of token amounts or share math.
- No supported transaction assembled by hand when the primary SDK has an action.
- No `buildTx` before all requirements resolve; no send before final simulation.
- No unqualified “withdraw anytime,” “guaranteed,” “risk-free,” “staking,” “fund,” or “investment” language.
- No silent fallback from a liquid exit to a force or in-kind exit.
- API pagination, caching, `429`/`Retry-After`, deprecation warnings, freshness, and onchain fallback are implemented and testable.
