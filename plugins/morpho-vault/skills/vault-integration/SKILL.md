---
name: vault-integration
description: Build Morpho Vault "Earn" features into applications — deposit/withdraw flows, APY display, vault detail screens, position views, idle-balance prompts. Use whenever the user is integrating Morpho Vaults, adding a yield/earn/savings feature backed by Morpho, embedding DeFi yield in a wallet or fintech app, or asks about "Powered by Morpho", vault APY display, or earn-flow UX — even if they don't say "vault integration" explicitly. Covers both the technical wiring (SDK, GraphQL API, ERC-4626) and Morpho's Integrator Blueprint (vocabulary, attribution, disclosures, APY composition, transparency). For one-off protocol queries or preparing a single transaction in conversation, use the morpho-cli skill instead; this skill is for writing application code.
license: MIT
metadata:
  author: Morpho Agents
  version: "0.1.0"
---

# Morpho Vault Integration

> **Experimental (pre-v1.0)** — SDK recommendations, API schemas, and blueprint guidance may evolve.

Build an earn feature backed by Morpho Vaults that users can trust. A good integration is two things at once: correct plumbing (ERC-4626 deposits, honest APY math, safe approvals) and correct presentation (users know which vault they're in, who curates it, what the yield is made of, and what they're agreeing to). This skill covers both because they fail together — a perfect deposit flow under a "Guaranteed 12% Staking" banner is still a broken integration.

## Quick decision guide

| Building… | Transaction path | Data path |
|-----------|-----------------|-----------|
| React/Next.js frontend | `@morpho-org/morpho-sdk` (`MorphoClient`) + wagmi `useSendTransaction` | GraphQL API or `@morpho-org/blue-sdk-wagmi` hooks |
| Backend / bot (viem) | `@morpho-org/morpho-sdk` | GraphQL API |
| Agent-driven / scripted | `npx @morpho-org/cli@latest prepare-*` (morpho-cli skill) | morpho-cli query commands |
| Display-only dashboard | — | GraphQL API |

GraphQL endpoint: `https://api.morpho.org/graphql`. Never hardcode vault or token addresses — discover them via the API and confirm with the user.

## Integration workflow

Work through these five stages. Each links to a reference — read it when you reach that stage.

### 1. Discover and select the vault

Query vaults by chain and asset (`chainId_in` is required; APY fields are decimal fractions — `0.0534` = 5.34%):

```graphql
{
  vaults(
    first: 10
    where: { chainId_in: [8453], assetSymbol_in: ["USDC"], listed: true }
    orderBy: TotalAssetsUsd
    orderDirection: Desc
  ) {
    items {
      address name symbol
      asset { address symbol decimals }
      state { netApy totalAssetsUsd curators { name } }
    }
  }
}
```

Filter to `listed: true` (Morpho's curated set — the field is `listed`, not `whitelisted`) unless the user explicitly wants otherwise. Note Vault V2 is a separate query root (`vaultV2s`) — see [references/data-display.md](references/data-display.md). Present candidates (name, curator, net APY, TVL) and let the user choose — vault selection is a trust decision, not just a yield sort.

### 2. Build the display layer

This is where integrations most often go wrong, and the fixes are cheap. The four rules that matter most (⭐ = highest trust impact, per Morpho's Integrator Blueprint):

- ⭐ **Vocabulary** — the feature is **Earn** / **DeFi yield**, never *staking* or *investment*. Yield is **variable** or **indicative**, never *guaranteed* or *risk-free*. Vaults are **Morpho Vault smart contracts**, not *funds* or *strategies*.
- ⭐ **APY composition** — show **base rate** (native, autocompounding, paid in the deposit asset) separately from **rewards** (named by token, with schedule). One blended number is the top source of user confusion. Field-level wiring: [references/data-display.md](references/data-display.md).
- ⭐ **Vault transparency** — vault name on every Morpho screen; curator named and linked; TVL visible; collateral reachable in a tap or two.
- **Attribution** — "Powered by Morpho" badge on deposit, review, post-deposit, and product-detail screens, themed to the surface. Embed code: [references/attribution.md](references/attribution.md).

Full playbook (benefits messaging, education CTAs, activation surfaces): [references/earn-ux-playbook.md](references/earn-ux-playbook.md).

### 3. Gate first interaction behind the disclosure

Before a user's first Morpho interaction, they must acknowledge a notice linking your Terms of Use and Morpho's Disclaimer (https://morpho.org/disclaimers). This is the one blueprint item phrased as a requirement, not a recommendation. Notice text and implementation pattern: [references/disclosures.md](references/disclosures.md).

### 4. Wire deposits, withdrawals, and positions

Default to `@morpho-org/morpho-sdk` — it handles approvals/permits (including the USDT reset and DAI quirks), slippage bounds, and native-ETH wrapping internally. Full flows, the V1/V2 ABI split, `redeem`-vs-`withdraw`, and position math: [references/deposit-withdraw.md](references/deposit-withdraw.md).

Non-negotiables regardless of path:

- Read token `decimals` from the API or contract — never assume 18.
- Simulate every transaction before presenting it for signature.
- Full exits use `redeem`, not `withdraw`.
- Withdrawals are bounded by vault liquidity — handle that revert path with a clear message, and say "no lock-ups, subject to available liquidity", never just "withdraw anytime".

### 5. Run the launch review

Before presenting finished work, review it against [references/pitfalls.md](references/pitfalls.md) (CRITICAL/WARNING severity table) and the launch self-review checklist at the end of [references/earn-ux-playbook.md](references/earn-ux-playbook.md). Fix CRITICALs; list any WARNINGs you left open and why.

## References

| File | Read when |
|------|-----------|
| [references/earn-ux-playbook.md](references/earn-ux-playbook.md) | Building any user-facing screen; running the launch review |
| [references/data-display.md](references/data-display.md) | Wiring APY split, curator, TVL, allocations, liquidity to real API fields |
| [references/deposit-withdraw.md](references/deposit-withdraw.md) | Writing transaction code (SDK flows, approvals, slippage, positions) |
| [references/attribution.md](references/attribution.md) | Adding the Powered by Morpho badge |
| [references/disclosures.md](references/disclosures.md) | Implementing the disclaimer acknowledgment gate |
| [references/pitfalls.md](references/pitfalls.md) | Final review; debugging a failing integration |
