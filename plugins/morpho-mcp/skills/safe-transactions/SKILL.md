---
name: safe-transactions
description: Prepare a Morpho transaction (vault deposit, withdraw or redeem, market supply, borrow, repay, collateral, refinance, claim rewards) with the morpho_prepare_* tools. Use whenever the user asks to deposit into or exit a vault, lend, borrow, repay, move collateral, refinance or claim rewards on Morpho.
---

# Safe Morpho transactions

Every tool named here comes from Morpho's MCP server, `https://mcp.morpho.org/`. The `morpho_prepare_*` tools return an **unsigned** transaction for the user's own wallet to review, sign and send. They never sign or send anything.

The order is always: **look up → read the position → state the details → build → hand over unsigned.**

## Steps

1. **Look up the target in this session.** Fetch the vault or market with a tool call now, even when it looks familiar. Never take an address, market ID or token decimals from memory.
   - Vault: `morpho_get_vault` with `vault-selector` `<chainId>:<vaultAddress>` (it returns a V1 or V2 vault). For what the vault can pay out now, read its `liquidity` from `morpho_query_vaults`.
   - Market: `morpho_get_market` with `market-selector` `<chainId>:<marketId>`. It returns the loan and collateral tokens and `liquidity_assets`, what can be borrowed or withdrawn now.
   - If the user gave a name instead of an address, find it with `morpho_query_vaults` (`search`, `chain_ids`) or `morpho_query_markets`, and ask the user to confirm the address when more than one matches.
2. **Read the user's current position** before sizing anything, with their `user-address` and `chain_ids`: `morpho_get_vault_positions` for a vault, `morpho_get_market_positions` for a market. For a deposit, supply or repay, check the wallet holds the token with `morpho_get_token_balance`. A withdrawal can't exceed the position or what the vault or market can pay out now. For a borrow, report the current `health_factor` from `morpho_get_market_positions` only when the response includes it. The build step's simulation rejects a borrow or collateral withdrawal that would leave the position unhealthy (`POSITION_UNHEALTHY`), but no tool returns the health factor after it: never state one as a fact; show the current position and what changes.
3. **State the details before building:** chain (name and chain ID), full vault address or market ID, the user's account address, the token, and the amount in both token units and the base units you will send. Amounts are integer strings in base units: 1,000 USDC (6 decimals) is `"1000000000"`. Read the decimals from a tool response.
4. **Build** with the matching `morpho_prepare_*` tool, using the same selector as step 1 and the intent in `body`. Vault prepare tools pick V1 or V2 from the vault itself. `morpho_prepare_claim_rewards` takes a `chain` slug and a plain address instead. If `data.status` is `signature_required`, the user signs each `data.signatures[].typed_data` message in their own wallet and gives you the signatures; call the same tool again with `continuation` and those signatures.
5. **Hand over unsigned.** Show every call in `data.calls`, in order, with its target, value and data, plus `data.simulation.status`, `data.expires_at` and every warning by level. Say plainly that nothing has been signed or sent, and tell the user to check the chain, addresses and amounts in their wallet before signing. `morpho_prepare_claim_rewards` returns `transactions` and `warnings` instead of `data.calls`; present them the same way. Then stop: signing and sending are the user's move.

## Stop rules

- `data.simulation.status` is `failed`: show `data.simulation.failure` and don't present the calls.
- An `error` level warning: don't present the calls; explain why. A `warning` level warning: present the calls and flag it first.
- Past `data.expires_at`: rebuild instead of presenting old calls.
- Never ask for, accept or repeat a private key or seed phrase. If the user pastes one, tell them not to share it and to treat that wallet as exposed, and don't use it.
- Don't tell the user whether to make the transaction. APY is a snapshot of past performance, not a promise, and nothing here is investment advice.

## Done when

- The target and the user's position were both read in this session, before the build.
- The answer names the chain, the full addresses and the amount.
- The calls are shown unsigned, with the simulation result and every warning, and the answer says nothing was sent.
