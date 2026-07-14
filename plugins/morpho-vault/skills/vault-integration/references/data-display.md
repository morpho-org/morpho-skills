# Data & Display Wiring

Which field feeds which UI element. Endpoint: `https://api.morpho.org/graphql` (public, no key; ~750 req/min rate limit). Also available via `npx @morpho-org/cli@latest get-vault` (see the morpho-cli skill) and `@morpho-org/blue-api-sdk` for typed queries. Field names below were verified against the live schema (2026-07).

Conventions: APY/APR and fee fields are decimal fractions (`0.0534` = 5.34%). Raw token amounts divide by `10^asset.decimals`. Always filter by `chainId_in`. Lists paginate with `first`/`skip` and return `{ items }`.

**Two vault families, two query roots.** Vault V1 (MetaMorpho) lives under `vaults` / `vaultByAddress`; Vault V2 under `vaultV2s` / `vaultV2ByAddress` with a different (flatter) field layout. There is no `version` field — the query root is the version selector. The examples below are V1; V2 differences are noted at the end.

## Discovery + vault card query (V1)

```graphql
{
  vaults(
    first: 10
    where: { chainId_in: [8453], assetSymbol_in: ["USDC"], listed: true }
    orderBy: TotalAssetsUsd
    orderDirection: Desc
  ) {
    items {
      address
      name                        # ⭐ show verbatim — never a generic label
      symbol
      listed                      # curated by Morpho — filter AND display trust signal
      factory { address }         # cross-check against canonical factories
      asset { address symbol decimals }
      metadata { description }    # basis for the one-line vault thesis
      state {
        netApy                    # headline: net of fees, INCLUDING rewards
        netApyExcludingRewards    # base/native rate — autocompounding, paid in deposit asset
        avgNetApy                 # time-averaged netApy — steadier headline display
        fee                       # performance fee (0.05 = 5%), already reflected in netApy
        totalAssetsUsd            # TVL
        curators { name image verified socials { type url } }  # ⭐ curator display
        allRewards {              # one entry per reward token
          asset { address symbol }
          supplyApr               # this token's APR component
        }
        allocation {
          supplyAssetsUsd
          supplyCap
          market {
            marketId
            collateralAsset { symbol }
            loanAsset { symbol }
          }
        }
      }
      liquidity { underlying usd }  # instantly withdrawable liquidity
    }
  }
}
```

Field-name traps (these errors are common because older docs differ):
- It's `netApyExcludingRewards` — **not** `netApyWithoutRewards`.
- Rewards are `state.allRewards` on V1 — **not** `state.rewards` (V2 uses root-level `rewards`).
- The curated-set filter/field is `listed` — **not** `whitelisted`.
- Inside `allocation.market` the id field is `marketId` — not `uniqueKey`.

## Element → field map

| UI element | Field(s) | Display rule |
|------------|----------|--------------|
| Headline APY | `state.netApy` (or `avgNetApy` for smoothing) | Net of fees, includes rewards. Label **variable**/**indicative** |
| Base rate (native yield) | `state.netApyExcludingRewards` | "Paid in {asset.symbol}, autocompounding" |
| Rewards line(s) | `state.allRewards[].supplyApr` + `.asset.symbol` | One line per token: "+1.0% in MORPHO". Rewards are claimed separately — never present them as compounding principal |
| Vault name | `name` | On deposit, review, and post-deposit screens |
| Curator | `state.curators[].name/image/verified/socials` | Name + logo, linked; `verified` is a trust signal |
| TVL | `state.totalAssetsUsd` | Product-detail or review screen |
| Withdrawable liquidity | `liquidity.usd` | "Instantly withdrawable: $X" near the withdraw control |
| Collateral exposure | `state.allocation[].market.collateralAsset.symbol` (+ `supplyAssetsUsd` for %) | Reachable within a tap or two |
| Vault thesis | `metadata.description` | One line, or compose "…curated by {curator}" |
| Advanced data link | — | the vault's page on app.morpho.org |

**APY decomposition invariant** (verified against live data): `netApy − netApyExcludingRewards ≈ Σ allRewards[].supplyApr`. Never compute the headline as `apy + rewards` — `apy` is gross pre-fee and that double-counts. If the components don't reconcile, show what you can label truthfully rather than forcing the sum.

## User position (post-deposit view)

```graphql
{
  userByAddress(address: "0x...", chainId: 8453) {
    vaultPositions {
      shares assets assetsUsd
      vault { address name asset { symbol decimals } }
    }
  }
}
```

Earnings = current `assets` minus net deposits (tracked app-side). On-chain alternative: `vault.balanceOf(user)` → `vault.convertToAssets(shares)`. Never assume shares and assets are 1:1 — share decimals and exchange rate both differ from the asset.

## Vault legitimacy

Anyone can deploy an ERC-4626 that looks like a Morpho vault. Before integrating an address — especially one pasted by a user:

1. Prefer discovery through the API with `listed: true` (Morpho's curated set); treat `warnings` as blocking until reviewed.
2. Cross-check `factory { address }` against the canonical factories on https://docs.morpho.org/get-started/resources/addresses/ (V2 vaults: also check the MorphoRegistry).
3. Show curator identity (`verified: true` where present) as the human-side trust signal.

## Vault V2 differences

`vaultV2s` / `vaultV2ByAddress` expose most state at the root: `totalAssetsUsd`, `netApy`, `netApyExcludingRewards`, `avgNetApy`, `rewards { asset supplyApr }`, `sharePrice`, `liquidityUsd`, `idleAssetsUsd`, `forceDeallocatableLiquidityUsd`, `performanceFee` **and** `managementFee` (both already reflected in `netApy`), `curators`, `adapters { items { type assets assetsUsd } }` (paginated) instead of `allocation`. V2 withdrawable liquidity = `liquidityUsd` + `idleAssetsUsd`, extendable by `forceDeallocate` at up to ~2% penalty (`adapters[].forceDeallocatePenalty`) — don't count the force-deallocatable portion as "instant".
