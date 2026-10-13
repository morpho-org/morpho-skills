---
name: morpho-live-data
description: Read live Morpho data — vault APY, TVL, fees, curator and allocations; market supply and borrow rates, LLTV, utilization and liquidity; a wallet's vault and market positions; token balances; supported chains. Use for any "what is the rate / TVL / position of …" question about Morpho Vaults or Markets.
---

# Morpho live data (read only)

Every tool below comes from Morpho's hosted MCP server, `https://mcp.morpho.org/` (Streamable HTTP, no key). If the tools are missing, connect it first: `claude mcp add --transport http morpho https://mcp.morpho.org/` (Claude Code), or point any MCP client at the URL.

## Steps

1. **Chain.** If the user did not name one, call `morpho_get_supported_chains` and ask. Query tools take the numeric `chainId`; get and position tools take the `chain` slug.
2. **Discover.**
   - Vaults: `morpho_query_vaults` with `chainId`, **`version` (`"v1"` or `"v2"`, required)**, optional `assetAddress`, `limit` (max 100) and `cursor`. If the user did not say V1 or V2, query both.
   - Markets: `morpho_query_markets` with `chainId`, optional `loanAsset`, `collateralAsset`, `listed`, `limit`, `cursor`.
   - Follow `pagination.cursor` until it is absent whenever the user asks for "all", and say how many pages you read.
3. **Inspect.** `morpho_get_vault` (`chain`, `address`) for `apyPct`, `tvl`, `tvlUsd`, fees and `allocations`. `morpho_get_market` (`chain`, **`id`**) for `supplyApyPct`, `borrowApyPct`, `utilizationPct`, `lltvPct`, totals and liquidity.
4. **Positions.** `morpho_get_vault_positions` (`chain`, `userAddress`, `version`, cursor). `morpho_get_market_positions` (`chain`, `userAddress`, 1 to 100 explicit `marketIds`): it cannot discover which markets a wallet uses, so ask for the market IDs or say the answer only covers the IDs checked. `morpho_get_token_balance` for balances.

## Comparing or ranking

Query results carry no APY or TVL, and `sortBy` only accepts `address`, `name`, `creationTimestamp`, `creationBlockNumber`, `performanceFee`, `managementFee`. To compare on APY, TVL or liquidity, call the get tool for each candidate. Cap it at 20 candidates, filter by asset first, and say whether the answer covers the full list or a sample. Sort by the criterion the user chose. Never call one "best".

## Reporting rules

- Every address comes from a tool result in this conversation. Never from memory, never constructed.
- The curator is returned as an **address only**. Show it with an explorer link from `morpho_get_supported_chains`. Do not infer a curator name from the vault name.
- Rates with a `Pct` suffix are percents (`"4.72"` = 4.72%). Vault `apyPct` and market APYs exclude rewards and are variable.
- A missing or null field is "not returned", never an estimate.
- Footer on every answer with numbers: `Source: Morpho MCP (<tools>), <chain>, fetched <UTC time>. APYs exclude rewards and are variable.`
- On a schema or validation error, report the tool and input. Fix only what the error message names; do not guess other parameters.

## Read only

This skill never prepares a transaction. If the user asks to deposit, borrow, repay or withdraw, say this assistant is read only, and point them to the Morpho app or to the `morpho_prepare_*` tools in their own agent, where they sign in their own wallet.
