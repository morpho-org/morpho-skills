---
name: morpho-builder
description: Use when building applications, bots, or integrations that interact with the Morpho lending protocol — scaffolding deposit apps, risk monitors, portfolio dashboards, or any Morpho protocol integration
---

# Morpho Builder Skill

Reference guide for building applications that integrate with the Morpho lending protocol. For operating on the protocol directly in a conversation, use the runtime skill instead.

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

```typescript
import { blueAbi, metaMorphoAbi } from "@morpho-org/blue-sdk-viem";
import { fetchMarket, fetchVault, fetchPosition } from "@morpho-org/blue-sdk-viem";
```

**Fetch helpers** — read on-chain state into SDK entity objects:

```typescript
import { createPublicClient, http } from "viem";
import { base } from "viem/chains";
import { fetchMarket, fetchVault, fetchPosition } from "@morpho-org/blue-sdk-viem";

const client = createPublicClient({ chain: base, transport: http() });

const market = await fetchMarket(marketId, client);
const vault = await fetchVault(vaultAddress, client);
const position = await fetchPosition(userAddress, marketId, client);

// Entity methods
const supplyAssets = market.toSupplyAssets(position.supplyShares);
const shares = vault.toShares(depositAmount, "Down");
```

### Tier 2 — React / Wagmi (for frontend apps)

#### `@morpho-org/blue-sdk-wagmi`

React hooks wrapping the core SDK. Requires wagmi v2.

Hooks: `useMarket`, `useVault`, `usePosition`, `useToken`, `useHolding`, `useMarkets`, `useVaults`, `usePositions`, `useTokens`, `useHoldings`, `useVaultMarketConfig`, `useVaultMarketConfigs`, `useVaultUser`, `useVaultUsers`, `useMarketParams`, plus plural variants.

```typescript
import { useVault, usePosition } from "@morpho-org/blue-sdk-wagmi";

function VaultDisplay({ address }: { address: Address }) {
  const vault = useVault({ address, chainId: 8453 });
  const position = usePosition({ user: userAddress, marketId, chainId: 8453 });
  // Returns the same SDK entity objects as Tier 1 fetch helpers
}
```

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

### Vault Query

```graphql
query GetVaults($chainId: Int!, $first: Int, $skip: Int) {
  vaults(where: { chainId_in: [$chainId] }, first: $first, skip: $skip) {
    items {
      address
      name
      symbol
      asset { address, symbol, decimals }
      state { netApy, totalAssets }
    }
  }
}
```

### Market Query

```graphql
query GetMarkets($chainId: Int!) {
  markets(where: { chainId_in: [$chainId] }) {
    items {
      uniqueKey
      loanAsset { address, symbol, decimals }
      collateralAsset { address, symbol, decimals }
      state { supplyApy, borrowApy, utilization }
      lltv
    }
  }
}
```

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

### Direct SDK (viem) — backends, scripts, bots

```typescript
import { createPublicClient, http, parseUnits, encodeFunctionData } from "viem";
import { base } from "viem/chains";
import { metaMorphoAbi } from "@morpho-org/blue-sdk-viem";

const client = createPublicClient({ chain: base, transport: http() });

// Read vault state
const totalAssets = await client.readContract({
  address: vaultAddress,
  abi: metaMorphoAbi,
  functionName: "totalAssets",
});

// Prepare deposit calldata
const depositData = encodeFunctionData({
  abi: metaMorphoAbi,
  functionName: "deposit",
  args: [parseUnits("100", 6), userAddress], // USDC = 6 decimals
});
```

### React (wagmi + SDK hooks) — frontend apps

```typescript
import { useVault } from "@morpho-org/blue-sdk-wagmi";
import { useSendTransaction, useAccount } from "wagmi";
import { encodeFunctionData, parseUnits } from "viem";
import { metaMorphoAbi } from "@morpho-org/blue-sdk-viem";

function DepositForm({ vaultAddress }: { vaultAddress: Address }) {
  const { address } = useAccount();
  const vault = useVault({ address: vaultAddress, chainId: 8453 });
  const { sendTransaction } = useSendTransaction();

  const deposit = (amount: string) => {
    const data = encodeFunctionData({
      abi: metaMorphoAbi,
      functionName: "deposit",
      args: [parseUnits(amount, vault.data?.decimals ?? 18), address!],
    });
    sendTransaction({ to: vaultAddress, data });
  };
}
```

## Safety Notes

**Addresses**: Discover via GraphQL API or SDK fetch helpers. Present candidates to the user for confirmation before use. Never hardcode vault, market, or token addresses.

**Chain**: Always parameterize — accept chain as a function parameter. Never assume Ethereum or Base. Morpho is deployed on both chains at the same singleton address.

**Write flow**: All write operations follow: **query → prepare → simulate → confirm → execute**. Simulate transactions before execution to catch reverts early. The server returns unsigned transactions — your app handles signing.

**Token decimals**: USDC/USDT = 6, WETH/DAI = 18. Read `decimals` from the API or contract — never assume 18. Use `parseUnits(amount, decimals)` for conversion.

**USDT approval quirk**: Must reset allowance to 0 before setting a new value. Implement as a conditional check for USDT or as a general reset-before-set pattern.

**DAI permit**: Non-standard — use ERC-20 `approve()` instead of EIP-2612 permit.

**Health factor**: For borrow operations, validate the health factor after the intended borrow. Prevent proceeding if the position would become unsafe (health factor < 1.0). Warn at ~1.1.

## Testing

- **`tests/unit/`** — pure logic (slippage math, approval routing, schema validation). No network.
- **`tests/integration/fork/`** — Anvil fork tests. Pin block heights for determinism.
- **`@morpho-org/test`** — Vitest/Anvil fixtures for Morpho-specific test setup.

### Fork Test Skeleton

```typescript
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { createPublicClient, http } from "viem";
import { base } from "viem/chains";
import { anvil } from "prool";

describe("fork test", () => {
  let instance: ReturnType<typeof anvil>;

  beforeAll(async () => {
    instance = anvil({
      forkUrl: process.env.BASE_RPC_URL!,
      forkBlockNumber: 12345678n,
    });
    await instance.start();
  });

  afterAll(async () => {
    await instance.stop();
  });

  it("reads vault state at pinned block", async () => {
    const client = createPublicClient({
      chain: base,
      transport: http(`http://127.0.0.1:${instance.port}`),
    });
    // Read contract state and assert exact numerical equality
    // Never use loose assertions (toBeGreaterThan, etc.)
  });
});
```

**Assertion rules**: Read actual contract state — never estimate. Assert exact numerical equality (`toBe`), not greater-than/less-than. Pin block heights in fixtures for determinism.

## Edge Cases

**Vault liquidity constraints**: `maxRedeem` limits how much can be withdrawn. If vault liquidity is insufficient, shares free up as borrowers repay or the curator reallocates.

**Interest accrual drift**: On-chain state changes between prepare and execute. A withdrawal amount valid at prepare time may exceed `maxRedeem` by execution time. Apply a small buffer when withdrawing near the limit.

**Package manager**: Always `bun`, never `npm` or `yarn`.

**No Bundler3**: Deprecated. Do not reference in new code.

**ABIs**: Always import from `@morpho-org/blue-sdk-viem`. Never hand-roll ABI JSON.
