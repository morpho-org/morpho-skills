---
name: morpho-builder
description: Use when building applications, bots, or integrations that interact with the Morpho lending protocol — scaffolding deposit apps, risk monitors, portfolio dashboards, or any Morpho protocol integration
---

# Morpho Builder Skill

Reference guide for building applications that integrate with the Morpho lending protocol. For operating on the protocol directly in a conversation, use the runtime skill instead.

## Agents

**[morpho-security-reviewer](agents/morpho-security-reviewer.md)** — reviews Morpho integration code against protocol-specific safety checks.

**When to invoke**: After implementation is complete but before presenting the final result to the user. Spawn the security reviewer agent to audit the code, then incorporate any CRITICAL or WARNING findings before showing the plan or deliverable.

## Protocol Overview

**Morpho Blue** — isolated lending markets. Each market is defined by five parameters: loan token, collateral token, oracle, interest rate model (IRM), and liquidation LTV (LLTV). Markets are identified by a `MarketId` (hash of these parameters).

**MetaMorpho Vaults** — aggregation layer on top of Morpho Blue. ERC-4626 compliant. A vault allocates deposits across multiple markets according to a curator's strategy. Identified by address.

**Singleton contract**: `0xBBBBBbbBBb9cC5e90e3b3Af64bdAF62C37EEFFCb` — same address on Ethereum (chain 1) and Base (chain 8453) via CREATE2.

### Key Entities

| Entity | Identifier | Description |
|--------|-----------|-------------|
| Market | `MarketId` | Isolated lending pool with specific collateral/loan pair |
| Vault | `Address` | Multi-market aggregator (MetaMorpho), ERC-4626 |
| Position | User + Market/Vault | User's supply/borrow in a market or deposit in a vault |
| Token | `Address` + `decimals` | ERC-20 — decimals vary (USDC/USDT = 6, WETH/DAI = 18) |

### Key Quantities

| Quantity | Format | Notes |
|----------|--------|-------|
| APY | Decimal (`0.0534` = 5.34%) | From GraphQL `state.netApy` |
| LLTV | Raw 1e18 (`860000000000000000` = 86%) | From SDK or API |
| Token amounts | Raw units | Divide by 10^decimals for human-readable. Use `parseUnits`/`formatUnits` from viem |
| Health factor | Ratio | ≥ 1.0 = safe, < 1.0 = liquidatable |

## SDK Ecosystem

### Tier 1 — Core SDKs (always relevant)

#### `@morpho-org/blue-sdk`

Types, entity classes, and constants.

- **`Market`** — class with operation methods (`.supply()`, `.borrow()`, `.repay()`, `.withdraw()`) and conversion methods (`.toSupplyAssets()`, `.toBorrowAssets()`)
- **`MarketParams`** — `new MarketParams({ loanToken, collateralToken, oracle, irm, lltv })`
- **`MarketId`** — branded type identifying a market
- **`Position`** — `new Position({ supplyShares, borrowShares, collateral })`
- **`VaultConfig`** — configuration class for MetaMorpho vaults

#### `@morpho-org/blue-sdk-viem`

ABIs, fetch helpers, and viem augmentation.

**ABI catalog** — import these instead of hand-rolling ABI JSON:

| Export | Contract |
|--------|----------|
| `blueAbi` | Morpho Blue singleton |
| `metaMorphoAbi` | MetaMorpho vault |
| `erc2612Abi` | ERC-2612 permit |
| `permit2Abi` | Uniswap Permit2 |
| `wstEthAbi` | Wrapped stETH |
| `adaptiveCurveIrmAbi` | Morpho's adaptive curve IRM |
| `blueOracleAbi` | Morpho oracle |
| `metaMorphoFactoryAbi` | Vault factory |

**Fetch helpers** — `fetchMarket`, `fetchVault`, `fetchPosition` read on-chain state into SDK entity objects. Entity methods include `market.toSupplyAssets()`, `vault.toShares()`, etc.

### Tier 2 — React / Wagmi (for frontend apps)

#### `@morpho-org/blue-sdk-wagmi`

React hooks wrapping the core SDK. Requires wagmi v2.

Hooks: `useMarket`, `useVault`, `usePosition`, `useToken`, `useHolding`, `useMarkets`, `useVaults`, `usePositions`, `useTokens`, `useHoldings`, `useVaultMarketConfig`, `useVaultMarketConfigs`, `useVaultUser`, `useVaultUsers`, `useMarketParams`, plus plural variants.

#### `@morpho-org/simulation-sdk` + `@morpho-org/simulation-sdk-wagmi`

Client-side simulation of Morpho operations. `useSimulationState` hook provides simulated post-state for UI previews without submitting transactions.

### Tier 3 — Specialized SDKs (awareness-level)

| Package | Purpose |
|---------|---------|
| `@morpho-org/bundler-sdk-viem` | Transaction bundling for multi-step operations |
| `@morpho-org/liquidity-sdk-viem` | Liquidity monitoring and bot infrastructure |
| `@morpho-org/liquidation-sdk-viem` | Liquidation bot infrastructure |
| `@morpho-org/migration-sdk-viem` | Migration from Aave/Compound to Morpho |
| `@morpho-org/morpho-ts` | Time/format utilities |
| `@morpho-org/test` | Vitest/Anvil test fixtures for Morpho |

## GraphQL API

Endpoint: `https://api.morpho.org/graphql`

Key queries: `vaults` (fields: address, name, symbol, asset, state.netApy, state.totalAssets) and `markets` (fields: uniqueKey, loanAsset, collateralAsset, state.supplyApy, state.borrowApy, state.utilization, lltv).

### Filters and Pagination

| Filter | Example | Notes |
|--------|---------|-------|
| `chainId_in` | `[1]`, `[8453]`, `[1, 8453]` | Required — always specify chain |
| `assetSymbol_in` | `["USDC"]` | Filter by asset symbol |
| `address_in` | `["0x..."]` | Filter by vault address |
| `uniqueKey_in` | `["0x..."]` | Filter by market ID |
| `userAddress_in` | `["0x..."]` | Filter positions for a user |

Paginate with `first` and `skip`. Iterate until `items.length < first`.

### Value Interpretation

| Field | Format | Conversion |
|-------|--------|------------|
| `netApy` / `supplyApy` / `borrowApy` | Decimal | `0.0534` = 5.34% |
| `totalAssets` | Raw string | Divide by 10^`asset.decimals` |
| `lltv` | Raw 1e18 string | Divide by 1e18 for percentage |

## Integration Approaches

- **Direct SDK (viem)** — for backends, scripts, bots. Use `createPublicClient` + `readContract`/`encodeFunctionData` with ABIs from `@morpho-org/blue-sdk-viem`.
- **React (wagmi + SDK hooks)** — for frontend apps. Use `useVault`, `usePosition`, etc. from `@morpho-org/blue-sdk-wagmi` with `useSendTransaction` from wagmi.

## Protocol Mechanics

### Dead Deposits (Inflation Attack Protection)

[Detailed reference](references/dead-deposits.md)

ERC-4626 vaults are vulnerable to share-price inflation attacks on their first deposit. A **dead deposit** — minting shares to the burn address `0x000000000000000000000000000000000000dEaD` — must be the very first transaction on any new vault or market. Any user deposit before this enables the attack.

**Vault V2** — target shares depend on the asset's decimals:

Formula: `targetShares = max(1e9, 10^(6 + max(0, 18 - decimals)))` — 18-dec assets: 1e9, 8-dec: 1e16, 6-dec: 1e18. Call `vault.mint(TARGET_SHARES, 0xdead)`.

**Market V1** — fixed `1e9` shares regardless of decimals. Call `morpho.supply(marketParams, 0, 1e9, 0xdead, "")`.

**Vault V1** — `1e9` shares standard; use `1e12` for tokens with fewer than 9 decimals.

**Active-cap requirement**: When a Vault V2 references underlying markets/vaults, `0xdead` must also hold:
- `1e9` supplyShares in each **Market V1** with non-zero vault caps
- `1e9` shares in each **Vault V1** with non-zero caps or present in withdraw queues

### AdaptiveCurveIRM

[Detailed reference](references/adaptive-curve-irm.md)

Morpho's approved IRM uses a two-pronged mechanism:
1. **Curve** — instantly adjusts rates when utilization changes (e.g., 90% ↔ 0% scales rate ×4 or ÷4)
2. **Adaptive** — continuously shifts the target rate over time based on sustained utilization

| Utilization | Rate behavior |
|-------------|---------------|
| 0% | Halves every ~5 days |
| 90% (target) | Stable |
| 100% | Doubles every ~5 days |

**Operational warnings**: Avoid 100% utilization — rates compound aggressively. Seed markets with initial supply immediately after creation; an empty market at 0% utilization triggers automatic rate decay.

### Slippage and Share/Asset Conversion

[Detailed reference](references/slippage.md)

The exchange rate between assets and shares can shift between transaction preparation and on-chain execution. With a proper dead deposit this is a UX concern, not a security vulnerability, but integrations should still protect users.

**Defensive pattern:** Use `previewDeposit()` to estimate shares, apply a 1% tolerance floor, verify actual result meets minimum.

**Full withdrawals**: Use `redeem()`, not `withdraw()` — avoids leaving dust behind.

**Vault V2 quirk**: `maxDeposit`, `maxMint`, `maxWithdraw`, and `maxRedeem` always return zero. Do not rely on these for capacity checks.

### Bad Debt Tracking

[Detailed reference](references/bad-debt.md)

- **V1.0**: Realized immediately — share price drops atomically for all suppliers in the affected market. Vulnerable to flash-loan amplification of bad debt realization.
- **V1.1+**: Tracked via `lostAssets` field — share price is unaffected until explicit realization. Prevents flash-loan manipulation.

### Common Pitfalls

[Detailed reference](references/common-pitfalls.md)

| Pitfall | Consequence | Prevention |
|---------|-------------|------------|
| Missing dead deposit | Inflation attack / share-price manipulation | Seed shares to `0xdead` before any user deposit |
| `withdraw()` for full exit | Dust remains in position | Use `redeem()` for full exits |
| Oracle risk blindness | Liquidations with stale or manipulated prices | Check oracle type, freshness, and known risks before integrating a market |
| ERC4626 vault as collateral | Share-price manipulation (Cream-hack style) | Avoid V1.0 vaults as collateral; V1.1+ without bad debt realization are safer |
| ERC4626 vault as loan asset | Unpredictable liquidation incentives | Do not list any ERC4626 vault as a loan asset |
| Ignoring vault governance | Owner/curator can reallocate to risky markets | Audit role holders; document trust assumptions to users |

## Safety Notes

**Addresses**: Discover via GraphQL API or SDK fetch helpers. Present candidates to the user for confirmation before use. Never hardcode vault, market, or token addresses.

**Chain**: Always parameterize — accept chain as a function parameter. Never assume Ethereum or Base. Morpho is deployed on both chains at the same singleton address.

**Write flow**: All write operations follow: **query → prepare → simulate → confirm → execute**. Simulate transactions before execution to catch reverts early. The server returns unsigned transactions — your app handles signing.

**Token decimals**: USDC/USDT = 6, WETH/DAI = 18. Read `decimals` from the API or contract — never assume 18. Use `parseUnits(amount, decimals)` for conversion.

**USDT approval quirk**: Must reset allowance to 0 before setting a new value. Implement as a conditional check for USDT or as a general reset-before-set pattern.

**DAI permit**: Non-standard — use ERC-20 `approve()` instead of EIP-2612 permit.

**Health factor**: For borrow operations, validate the health factor after the intended borrow. Prevent proceeding if the position would become unsafe (health factor < 1.0). Warn at ~1.1.

**Dead deposits**: Any vault or market creation must include the dead deposit as the first transaction. See *Protocol Mechanics > Dead Deposits* above.

## Testing

- **`@morpho-org/test`** — Vitest/Anvil fixtures for Morpho-specific test setup.

## Edge Cases

**No Bundler3**: Deprecated. Do not reference in new code.
**ABIs**: Always import from `@morpho-org/blue-sdk-viem`. Never hand-roll ABI JSON.
