---
name: morpho-builder
description: Use when building applications, bots, or integrations that interact with the Morpho lending protocol — scaffolding deposit apps, risk monitors, portfolio dashboards, or any Morpho protocol integration
---

# Morpho Builder Skill

> **Experimental (pre-v1.0)** — SDK recommendations, API schemas, and best practices may evolve as the protocol tooling matures.

Reference guide for building applications that integrate with the Morpho lending protocol. For operating on the protocol directly in a conversation, use the morpho-user skill instead.

> **Prefer Morpho v2.** The Morpho Optimizer (Morpho-Aave, Morpho-Compound) is deprecated. For new vault deployments, prefer vault v2 over MetaMorpho (vault v1). Note: the two vault versions have **incompatible ABIs** — use `vaultV2Abi` for v2 vaults and `metaMorphoAbi` for v1 vaults. Match the ABI to the on-chain contract.

## Protocol Overview

**Morpho Blue** — isolated lending markets. Each market is defined by five parameters: loan token, collateral token, oracle, interest rate model (IRM), and liquidation LTV (LLTV). Markets are identified by a `MarketId` (hash of these parameters).

**Morpho Vaults v2** — the newer vault contract. ERC-4626 compliant. Allocates deposits across multiple markets via adapters, which can wrap MetaMorpho (v1) vaults and Morpho Blue markets. Preferred for new vault deployments. In the SDK: `vaultV2Abi`, `VaultV2`, `fetchVaultV2`.

**MetaMorpho (vault v1)** — the original vault contract. Still functional and widely deployed on-chain. In the SDK: `metaMorphoAbi`, `Vault`, `fetchVault`. The two vault versions have incompatible ABIs — use the correct one for the contract you're interacting with.

**Singleton contract**: `0xBBBBBbbBBb9cC5e90e3b3Af64bdAF62C37EEFFCb` — same address on Ethereum (chain 1) and Base (chain 8453) via CREATE2.

### Key Entities

| Entity | Identifier | Description |
|--------|-----------|-------------|
| Market | `MarketId` | Isolated lending pool with specific collateral/loan pair |
| Vault | `Address` | Multi-market aggregator, ERC-4626. Two versions: v2 (`VaultV2`) and MetaMorpho v1 (`Vault`) — ABIs differ |
| Position | User + Market/Vault | User's supply/borrow in a market or deposit in a vault |
| Token | `Address` + `decimals` | ERC-20 — decimals vary (USDC/USDT = 6, WETH/DAI = 18) |

### Key Quantities

| Quantity | Format | Notes |
|----------|--------|-------|
| APY | Decimal (`0.0534` = 5.34%) | From GraphQL `state.netApy` |
| LLTV | Raw 1e18 (`860000000000000000` = 86%) | From SDK or API |
| Token amounts | Raw units | Divide by 10^decimals for human-readable. Use `parseUnits`/`formatUnits` from viem |
| Health factor | Ratio | ≥ 1.0 = safe, < 1.0 = liquidatable |

## SDK Registry

All packages are published under `@morpho-org` on npm.

| Package | Purpose |
|---------|---------|
| `@morpho-org/blue-sdk` | Core types, entity classes (`Market`, `Vault`, `VaultV2`, `Position`, `MarketParams`), and constants |
| `@morpho-org/blue-sdk-viem` | Viem augmentation — ABIs, fetch helpers (`fetchMarket`, `fetchVault`, `fetchVaultV2`, `fetchPosition`) |
| `@morpho-org/blue-sdk-ethers` | Ethers augmentation — same fetch helpers as viem, for Ethers-based projects |
| `@morpho-org/blue-sdk-wagmi` | React hooks (`useMarket`, `useVault`, `usePosition`, etc.) wrapping core SDK. Requires wagmi v2 |
| `@morpho-org/blue-api-sdk` | GraphQL SDK with typed queries for the Morpho API |
| `@morpho-org/simulation-sdk` | Framework-agnostic simulation of Morpho operations |
| `@morpho-org/simulation-sdk-wagmi` | React hooks for client-side simulation (`useSimulationState`) |
| `@morpho-org/bundler-sdk-viem` | Multi-step transaction bundling (approvals, transfers, Morpho ops in one tx) |
| `@morpho-org/liquidity-sdk-viem` | Liquidity monitoring and bot infrastructure |
| `@morpho-org/liquidation-sdk-viem` | Liquidation bot infrastructure |
| `@morpho-org/migration-sdk-viem` | Migration from Aave/Compound to Morpho |
| `@morpho-org/consumer-sdk` | Abstraction layer for Morpho's complexity |
| `@morpho-org/morpho-ts` | Time and format utilities |
| `@morpho-org/test` | Vitest/Anvil test fixtures for Morpho |
| `@morpho-org/test-wagmi` | Wagmi test config extension of `@morpho-org/test` |
| `@morpho-org/morpho-test` | Framework-agnostic test fixtures |

## SDK Details

### `@morpho-org/blue-sdk`

Types, entity classes, and constants.

- **`Market`** — class with operation methods (`.supply()`, `.borrow()`, `.repay()`, `.withdraw()`) and conversion methods (`.toSupplyAssets()`, `.toBorrowAssets()`)
- **`MarketParams`** — `new MarketParams({ loanToken, collateralToken, oracle, irm, lltv })`
- **`MarketId`** — branded type identifying a market
- **`Position`** — `new Position({ supplyShares, borrowShares, collateral })`
- **`VaultV2`** — vault v2 entity class (preferred for new integrations)
- **`Vault`** — MetaMorpho (vault v1) entity class
- **`VaultConfig`** — configuration class for MetaMorpho vaults

### `@morpho-org/blue-sdk-viem`

ABIs, fetch helpers, and viem augmentation.

**ABI catalog** — import these instead of hand-rolling ABI JSON:

| Export | Contract |
|--------|----------|
| `blueAbi` | Morpho Blue singleton |
| `vaultV2Abi` | Vault v2 (preferred for new deployments) |
| `vaultV2FactoryAbi` | Vault v2 factory |
| `metaMorphoAbi` | MetaMorpho / vault v1 (use for existing v1 vaults) |
| `metaMorphoFactoryAbi` | MetaMorpho factory / vault v1 |
| `erc2612Abi` | ERC-2612 permit |
| `permit2Abi` | Uniswap Permit2 |
| `wstEthAbi` | Wrapped stETH |
| `adaptiveCurveIrmAbi` | Morpho's adaptive curve IRM |
| `blueOracleAbi` | Morpho oracle |

**Fetch helpers** — `fetchMarket`, `fetchVaultV2` (v2) / `fetchVault` (v1), `fetchPosition` read on-chain state into SDK entity objects. Use the fetch helper matching the on-chain vault version. Entity methods include `market.toSupplyAssets()`, `vault.toShares()`, etc.

### `@morpho-org/blue-sdk-wagmi`

React hooks wrapping the core SDK. Requires wagmi v2.

Hooks: `useMarket`, `useVault`, `usePosition`, `useToken`, `useHolding`, `useMarkets`, `useVaults`, `usePositions`, `useTokens`, `useHoldings`, `useVaultMarketConfig`, `useVaultMarketConfigs`, `useVaultUser`, `useVaultUsers`, `useMarketParams`, plus plural variants.

### `@morpho-org/simulation-sdk` + `@morpho-org/simulation-sdk-wagmi`

Client-side simulation of Morpho operations. `useSimulationState` hook provides simulated post-state for UI previews without submitting transactions.

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

## Best Practices

**Prefer vault v2 for new deployments**: When creating new vaults, prefer vault v2 over MetaMorpho (v1). When interacting with existing vaults, match the ABI to the on-chain contract — `vaultV2Abi` for v2, `metaMorphoAbi` for v1. They are not interchangeable.

**Prefer Morpho Blue over Morpho Optimizer**: The original Morpho Optimizer (Morpho-Aave, Morpho-Compound) is deprecated. Prefer Morpho Blue contracts and SDKs for new integrations.

**No Bundler3**: Deprecated. Do not reference in new code.

**ABIs**: Always import from `@morpho-org/blue-sdk-viem`. Never hand-roll ABI JSON.

## Post-Implementation Review

After finishing code or a plan, review it against these Morpho-specific checks before presenting the result. For each, mark CRITICAL (fund loss), WARNING (broken UX), or N/A.

1. **Dead Deposit Protection** — vault/market creation includes dead deposit to `0xdead` as the first tx; correct formula per version ([reference](references/dead-deposits.md))
2. **Slippage Protection** — deposits/withdrawals use preview functions + tolerance check; full exits use `redeem()` not `withdraw()`; no reliance on Vault V2 `max*` functions ([reference](references/slippage.md))
3. **IRM Awareness** — new markets seeded promptly; no sustained 100% utilization; APY formulas correct ([reference](references/adaptive-curve-irm.md))
4. **Bad Debt Safety** — no V1.0 vault as collateral; no ERC4626 vault as loan asset; dashboards surface `lostAssets` ([reference](references/bad-debt.md))
5. **Token Approvals** — USDT resets allowance to 0 first; DAI uses `approve()` not `permit()` ([reference](references/common-pitfalls.md))
6. **Vault Governance** — UI surfaces role holders; trust assumptions documented ([reference](references/common-pitfalls.md))
7. **General Safety** — no hardcoded addresses; chain ID parameterized; decimals read not assumed; write ops simulate before execute; health factor validated; ABIs from `@morpho-org/blue-sdk-viem`
