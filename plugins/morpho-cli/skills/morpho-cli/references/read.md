# Read Command Response Schemas

All read commands return JSON to stdout with a `tool` and `timestamp` field.

## query-vaults

```json
{
  "vaults": [
    {
      "address": "0x...",
      "name": "Steakhouse USDC",
      "chain": "base",
      "asset": {
        "address": "0x...",
        "symbol": "USDC",
        "decimals": 6,
        "chain": "base"
      },
      "curator": "string (optional)",
      "allocator": "string (optional)",
      "apy": "0.0534",
      "tvl": "125000000000"
    }
  ],
  "chain": "base",
  "count": 12,
  "tool": "morpho.query_vaults",
  "timestamp": "2026-03-17T00:00:00.000Z"
}
```

- `apy` — decimal string, multiply by 100 for percentage
- `tvl` — raw integer string, divide by `10^asset.decimals`

## get-vault

```json
{
  "vault": {
    "address": "0x...",
    "name": "Steakhouse USDC",
    "chain": "base",
    "asset": {
      "address": "0x...",
      "symbol": "USDC",
      "decimals": 6,
      "chain": "base"
    },
    "curator": "string (optional)",
    "allocator": "string (optional)",
    "apy": "0.0534",
    "tvl": "125000000000",
    "allocations": [
      {
        "market": {
          "uniqueKey": "0x...",
          "loanAsset": { "address": "0x...", "symbol": "USDC" },
          "collateralAsset": { "address": "0x...", "symbol": "WETH" }
        },
        "supplyAssets": "50000000000",
        "supplyAssetsUsd": "50000.00"
      }
    ]
  },
  "found": true,
  "chain": "base",
  "tool": "morpho_get_vault",
  "timestamp": "2026-03-17T00:00:00.000Z"
}
```

- `found` — `false` if vault address not found, `vault` will be `null`
- `allocations` — per-market breakdown of vault's deployed capital

## query-markets

```json
{
  "markets": [
    {
      "id": "0x...",
      "chain": "base",
      "loanAsset": {
        "address": "0x...",
        "symbol": "USDC",
        "decimals": 6,
        "chain": "base"
      },
      "collateralAsset": {
        "address": "0x...",
        "symbol": "WETH",
        "decimals": 18,
        "chain": "base"
      },
      "lltv": "860000000000000000",
      "apy": "0.0312",
      "totalSupply": {
        "address": "0x...", "symbol": "USDC", "decimals": 6, "chain": "base",
        "value": "5000000000000"
      },
      "totalBorrow": {
        "address": "0x...", "symbol": "USDC", "decimals": 6, "chain": "base",
        "value": "3500000000000"
      },
      "utilization": "0.70"
    }
  ],
  "chain": "base",
  "count": 8,
  "tool": "morpho.query_markets",
  "timestamp": "2026-03-17T00:00:00.000Z"
}
```

- `lltv` — raw 1e18 string, divide by 1e18 for percentage (e.g., `860000000000000000` = 86%)
- `totalSupply.value`, `totalBorrow.value` — raw integer strings, divide by `10^decimals`
- `utilization` — decimal string (e.g., `"0.70"` = 70%)

## get-market

```json
{
  "market": {
    "id": "0x...",
    "chain": "base",
    "loanAsset": { "address": "0x...", "symbol": "USDC", "decimals": 6, "chain": "base" },
    "collateralAsset": { "address": "0x...", "symbol": "WETH", "decimals": 18, "chain": "base" },
    "lltv": "860000000000000000",
    "apy": "0.0312",
    "totalSupply": { "address": "0x...", "symbol": "USDC", "decimals": 6, "chain": "base", "value": "5000000000000" },
    "totalBorrow": { "address": "0x...", "symbol": "USDC", "decimals": 6, "chain": "base", "value": "3500000000000" },
    "utilization": "0.70"
  },
  "found": true,
  "chain": "base",
  "tool": "morpho.get_market",
  "timestamp": "2026-03-17T00:00:00.000Z"
}
```

- Same fields as `query-markets` items, plus `found` boolean

## get-positions

```json
{
  "positions": [
    {
      "userAddress": "0x...",
      "chain": "base",
      "vault": {
        "address": "0x...",
        "name": "Steakhouse USDC",
        "chain": "base",
        "asset": { "address": "0x...", "symbol": "USDC", "decimals": 6, "chain": "base" }
      },
      "suppliedAmount": { "address": "0x...", "symbol": "USDC", "decimals": 6, "chain": "base", "value": "10000000000" },
      "borrowedAmount": null,
      "collateralAmount": null,
      "shares": "9876543210"
    },
    {
      "userAddress": "0x...",
      "chain": "base",
      "market": {
        "id": "0x...",
        "chain": "base",
        "loanAsset": { "address": "0x...", "symbol": "USDC", "decimals": 6, "chain": "base" },
        "collateralAsset": { "address": "0x...", "symbol": "WETH", "decimals": 18, "chain": "base" },
        "lltv": "860000000000000000"
      },
      "suppliedAmount": { "address": "0x...", "symbol": "USDC", "decimals": 6, "chain": "base", "value": "0" },
      "borrowedAmount": { "address": "0x...", "symbol": "USDC", "decimals": 6, "chain": "base", "value": "500000000" },
      "collateralAmount": { "address": "0x...", "symbol": "WETH", "decimals": 18, "chain": "base", "value": "1000000000000000000" }
    }
  ],
  "chain": "base",
  "count": 2,
  "userAddress": "0x...",
  "tool": "morpho.get_positions",
  "timestamp": "2026-03-17T00:00:00.000Z"
}
```

- Vault positions have `vault` field, market positions have `market` field
- `suppliedAmount.value`, `borrowedAmount.value`, `collateralAmount.value` — raw integer strings
- `shares` — vault share count (raw)

## get-position

```json
{
  "position": { ... },
  "found": true,
  "chain": "base",
  "tool": "morpho.get_position",
  "timestamp": "2026-03-17T00:00:00.000Z"
}
```

- Same position shape as `get-positions` items, plus `found` boolean
- `position` is `null` if not found

## health-check

```json
{
  "status": "healthy",
  "timestamp": "2026-03-17T00:00:00.000Z",
  "version": "1.0.0",
  "tool": "morpho.health_check",
  "services": {
    "api": "operational",
    "chains": {
      "base": "operational",
      "ethereum": "operational"
    }
  }
}
```

## get-supported-chains

```json
{
  "chains": [
    {
      "slug": "base",
      "name": "Base",
      "chainId": "8453",
      "rpcUrl": "https://...",
      "explorerUrl": "https://basescan.org",
      "isTestnet": false
    }
  ],
  "tool": "morpho.get_supported_chains",
  "timestamp": "2026-03-17T00:00:00.000Z"
}
```
