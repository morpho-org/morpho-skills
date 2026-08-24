---
name: earn-integration
description: Build or review Morpho Earn integrations that deposit into and exit from Morpho Vault V2. Use for Vault V2 discovery, data, APY and rewards, positions, deposit or withdrawal transactions, illiquid exits, UI copy, QA, and pre-launch review. Treat Vault V1 only as migration or compatibility context.
---

# Earn Integration — Vault V2

Build and review Earn products on **Morpho Vault V2**. Do not silently substitute a Vault V1/MetaMorpho flow, a direct Blue supply position, or a generic ERC-4626 recipe.

Use the authoritative [Morpho documentation index](https://docs.morpho.org/llms.txt), [Morpho SDK documentation](https://docs.morpho.org/developers/sdks/morpho-sdk/), and [Core API reference](https://api.morpho.org/core/docs) for current signatures and schemas. Keep copied examples small; link to the current specification instead of recreating it.

## Choose a mode

- **Build or update:** read [references/vault-v2.md](references/vault-v2.md) completely, then implement only the surfaces relevant to the request.
- **Review, audit, QA, or pre-launch:** read [references/review.md](references/review.md) completely. Review only unless the user explicitly asks for fixes.

## Build workflow

1. Confirm chain, Vault V2 address, underlying asset, user/account, requested action, and whether the app needs indexed analytics or execution-fresh state.
2. Discover candidates with the Morpho API; resolve the selected vault to a fresh `client.morpho.vaultV2(address, chainId)` entity before previewing or building a transaction.
3. Use the primary `@morpho-org/morpho-sdk` action flow: create the action, await and satisfy every `getRequirements()` result, call `buildTx(...)`, simulate the final authorized transaction, then submit and wait for a receipt.
4. Preserve bigint token units, token-specific decimals, explicit slippage/deadline choices, and the builder/signer invariant. Never hand-build a supported vault or bundler transaction.
5. Show the vault identity, variable APY breakdown, fees, rewards by token, allocation exposure, available withdrawal paths, risks, and data freshness on the surfaces where each fact changes the user's decision.
6. Re-fetch critical state immediately before building or submitting. Indexed API data is not transaction state.

## Product boundaries

- Earn defaults to Vault V2. Load Vault V1 material only when the request explicitly involves migration, an existing V1 position, or compatibility.
- A normal liquid exit uses `withdraw` (exact assets) or `redeem` (exact shares). An illiquid exit may require force deallocation or in-kind redemption; do not describe these as equivalent outcomes.
- Vault V2's ERC-4626 `maxDeposit`, `maxMint`, `maxWithdraw`, and `maxRedeem` always return zero. Never use them as availability or balance signals.
- Yield is variable, not guaranteed. Separate native vault APY, underlying-token yield, rewards, performance fees, management fees, and any integrator fee rather than blending unlike components.
- “Withdraw anytime” must be qualified by available liquidity. For force or in-kind exits, preview and disclose penalties, assets/positions received, and follow-up work.

## Verification while building

Use the applicable checker prompt under [references/checkers/](references/checkers/) after the corresponding surface exists. Run [math-correctness.md](references/checkers/math-correctness.md) whenever code converts shares/assets, computes rate or fee displays, sizes an exit, or formats protocol quantities. A complete review uses all eight checkers through the orchestrator.

Do not claim a check passed without artifact evidence. If code, runtime state, or a required screen is unavailable, report `UNVERIFIED` and say what is missing.
