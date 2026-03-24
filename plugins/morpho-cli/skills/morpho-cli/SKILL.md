---
name: morpho-cli
description: >
  Interact with the Morpho lending protocol using the CLI. Use this skill when the user asks to:
  query vault APYs, TVL, or allocation strategies ("What's the best USDC vault on Base?");
  query market rates, utilization, or LLTV ("Show me ETH/USDC markets on Ethereum");
  check user positions, balances, or health ("What are my Morpho positions?");
  deposit into or withdraw from a vault ("Deposit 1000 USDC into Steakhouse vault");
  supply collateral, borrow, or repay on a market ("Borrow 5000 USDC against my WETH");
  prepare or simulate any Morpho transaction.
---

# morpho-cli

Query Morpho protocol data and build unsigned transactions. All commands output JSON to stdout. No private keys needed.

```bash
morpho <command> [options]
```

Always use `@latest`. Supported chains: `base`, `ethereum`. Every command requires `--chain`.

## Response Schemas

- **[Read commands](references/read.md)** — exact JSON shapes for query-vaults, get-vault, query-markets, get-market, get-positions, get-position
- **[Write commands](references/write.md)** — exact JSON shapes for prepare-\*, simulate-transactions

## Quick Reference

```bash
# Read — query protocol state
morpho query-vaults    --chain base [--asset-symbol USDC] [--sort apy_desc] [--limit 5] [--skip 0] [--fields apyPct,tvl,feePct]
morpho get-vault       --chain base --address 0x...
morpho query-markets   --chain base [--loan-asset 0x...] [--collateral-asset 0x...] [--sort-by supplyApy] [--sort-direction desc] [--limit 10] [--skip 0] [--fields supplyApy,totalSupply]
morpho get-market      --chain base --id 0x...
morpho get-positions   --chain base --user-address 0x... [--vault-address 0x...] [--market-id 0x...]
morpho get-position    --chain base --user-address 0x... [--vault-address 0x...]

# Write — prepare unsigned transactions (amounts are human-readable, e.g. 1000 = 1000 USDC)
morpho prepare-deposit  --chain base --vault-address 0x... --user-address 0x... --amount 1000
morpho prepare-withdraw --chain base --vault-address 0x... --user-address 0x... --amount max
morpho prepare-supply   --chain base --market-id 0x... --user-address 0x... --amount 5000
morpho prepare-borrow   --chain base --market-id 0x... --user-address 0x... --collateral-amount 3000 --borrow-amount 1
morpho prepare-repay    --chain base --market-id 0x... --user-address 0x... --amount max

# Simulate — always simulate before presenting transactions to the user
morpho simulate-transactions --chain base --from 0x... --transactions '<JSON>' --analysis-context '<JSON>'

# Utility
morpho health-check
morpho get-supported-chains
```

## Write Workflow: Prepare → Simulate → Present

Every write operation follows three steps. Never skip a step.

1. **Prepare** — run a `prepare-*` command. The CLI handles token decimals, allowances, and approvals automatically. Returns `{transactions, summary, analysisContext}`.
2. **Simulate** — pass `transactions` and `analysisContext` from the prepare response to `simulate-transactions` as JSON strings. Returns `{success, gasUsed, results, analysis}` with pre/post state deltas.
3. **Present** — show the summary, list of unsigned transactions, simulation results, and any warnings (low health factor, partial liquidity) in tabular format. Do not present if simulation fails — diagnose first.

## Simulation Failures

| Revert | Cause | What to do |
|--------|-------|------------|
| `ERC20: insufficient allowance` | Missing approval | Re-prepare — CLI should include approvals automatically |
| `ERC4626ExceededMaxWithdraw` | Vault liquidity insufficient | Reduce amount (see below) |
| `insufficient balance` | User lacks tokens | Tell the user |
| Custom error hex | Protocol-specific | Query state with `get-market` or `get-vault` to diagnose |

## Partial Withdrawal

If `prepare-withdraw --amount max` returns a liquidity warning:
1. Parse the safe amount from `summary`, apply ~1% buffer (`parsedAmount * 0.99`)
2. Re-call `prepare-withdraw` with the buffered amount, then simulate
3. Tell the user: remaining locked assets free up as borrowers repay

## Safety Rules

1. **Always simulate before presenting** — never show transactions without simulation success
2. **Never sign or broadcast** — unsigned payloads only
3. **Watch health factor** for borrows — warn if below 1.1
4. **Communicate liquidity constraints** clearly for partial withdrawals

## Common Mistakes

- Forgetting `--chain` — every command requires it, there is no default
- Using chain IDs (`1`, `8453`) instead of names (`ethereum`, `base`)
- Displaying raw amounts without dividing by `10^decimals` — `"2000000000"` USDC is `2000`, not 2 billion
- Assuming 18 decimals — USDC/USDT have 6
- Passing raw units as `--amount` — CLI expects human-readable (`1000` not `1000000000`)
- Skipping simulation — never present transactions without simulating first
- Not passing `--analysis-context` to simulate — you lose pre/post state analysis
