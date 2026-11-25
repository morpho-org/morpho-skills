# Integration intake

Before building, interview the user the way the [Integration Compass](https://morpho-integration-compass.vercel.app/) does, then build from the resulting profile. If they already have a Compass profile (its Markdown or JSON export), use it and ask only what it leaves missing or marked `?`.

Ask one question at a time with the options below and their one-line meaning, and mark the recommended option where there is one. Skip a question the request, repository or earlier answers already settle, and say what you assumed. Every question except Product and Wallet model accepts "Not sure yet", recorded as `?`. In an unattended run, take the answers the brief states, record the rest as `?` and continue.

## 1. Product

Ask whether they want **Earn** (users deposit assets into vaults to earn yield), **Borrow** (users take loans against collateral) or **both**. For both, ask the Wallet model once with Borrow's restrictions, then the Earn and Borrow questions in turn, and the shared questions once.

## 2. Architecture

| Question | Asked when | Options |
| --- | --- | --- |
| Rate model: should borrowers pay a variable or a fixed rate? | Borrow | Variable rate (Blue: utilization-driven rate, no maturity); fixed rate (Midnight: fixed when drawn, dated maturity the borrower repays or rolls) |
| Wallet model: how do you want to custody user funds? | Always | Omnibus-only (pooled on-chain addresses, balances tracked off-chain; Earn only); custodial-only (the integrator holds keys); non-custodial (users hold their keys); omnibus + custodial (Earn only) |
| Account kind: what kind of account should users have? | Wallet model is not omnibus-only | Smart account (batching, gas sponsorship); EOA (a normal private-key wallet) |
| EIP-7702: upgrade those EOAs to smart accounts? | Non-custodial with EOA | Yes (batched approvals and actions); no (separate approve and action steps) |
| Vault: new vault, or an existing one? | Earn | New (deploy a vault the integrator curates); existing (integrate a deployed Morpho vault) |
| Curator: who curates the new vault? | New vault | The integrator; an established curator |
| Deposit access: who can deposit? | Earn | Open, recommended (anyone; compatible with the Morpho App); gated (a Gate controls who deposits; not supported by the Morpho App) |
| Curator relationship: do you have a direct relationship with the vault's curator? | Existing vault | No; yes (fees can be coordinated with the curator) |
| Earn fee: how do you want to take a fee on deposits? | Earn | New vault: none, direct (taken by the vault), splitter (split on-chain; needs a dedicated new vault). Existing vault: none, wrapper (a contract over the vault; recommended without a curator relationship), off-chain revenue share with the curator (recommended with one) |
| Market: new market, or an existing one? | Borrow | New (an isolated market: collateral, loan asset, oracle, LLTV, rate model); existing |
| Market ID: which existing markets? | Existing market | One or more `0x`-prefixed 32-byte market IDs |
| Oracle: what pricing does the new market need? | New market | Existing oracle, recommended; new oracle from existing price feeds; new price feeds and a new oracle |
| Borrow access: who can borrow? | Borrow | Open, recommended (compatible with the Morpho App); gated (for example KYC-wrapped collateral; not supported by the Morpho App) |
| Origination fee: how do you want to charge for opening a loan? | Borrow | Flat fee in basis points of the borrowed amount; none |
| Liquidity: where does the new market's borrowable liquidity come from? | New market | The market's existing supply; a supplying vault the integrator seeds; the Public Allocator (just-in-time liquidity) |
| Rewards: do you want to run your own incentive campaign? | Always | None (forwarded market rewards still reach users); a Merkl campaign on top |

The Compass also asks how to read Morpho data. Do not ask it here: this manual requires the REST APIs, and a strictly on-chain requirement is a gap to state, not an option.

## 3. Footprint

| Question | Options |
| --- | --- |
| Launch timeline (one) | Live now; under 1 month; 1–3 months; 3–6 months; 6+ months; exploring |
| Regions (several) | Global; North America; LATAM; Europe; MENA; Africa; APAC |
| Chains (several) | Ethereum; Base; Arbitrum; Optimism; Polygon; Unichain; World; HyperEVM; Katana; Monad; Stable; Robinhood Chain; Arc; other (name it) |
| Asset class (several) | Crypto-native; stablecoin; RWA |
| Assets (several) | Earn: deposit assets. Borrow: borrow assets and collateral assets. Options: USDC, USDT, DAI, USDS, PYUSD, WETH, wstETH, cbBTC, WBTC, other (name it) |
| Wallet provider (one) | Privy; Dynamic; Turnkey; Coinbase Smart Wallet; Safe; WalletConnect; Pimlico; self-hosted; none or undecided |
| Contact (optional) | Email, Telegram or LinkedIn, if they want Morpho's team to follow up |

## 4. Profile

Summarize the answers as the Compass export does, then ask the user to confirm or correct it before building:

```markdown
# Morpho Integration Profile: <integrator>

> **Draft**: <n> open questions (marked `?`).

## Architecture
- **<Question title>:** <answer>: <its one-line meaning>

## Footprint
- **Launch timeline:** <answer or —>
- **Region / Chains / Asset class / <Deposit|Borrow|Collateral> assets / Wallet provider:** <answers or —>
```

Keep the contact in the profile only, never in code, configuration or logs.

## 5. Build from the profile

| Answer | What it decides |
| --- | --- |
| Product and rate model | Which manuals to read: Earn → [Vault V2](vault-v2.md); variable → [Blue](blue.md); fixed → [Midnight](midnight.md) |
| Existing vault or market | Discover candidates through Core or Midnight REST filtered by the chosen chains and assets, and confirm the exact one with the user; verify given market IDs exist on those chains |
| New vault, curator, new market, oracle, seeded liquidity, splitter or wrapper | Deployment and curation work this manual does not cover. List each as a prerequisite and build against the deployed address once the user supplies it; do not invent one |
| Chains | Check each against the Core or Midnight REST and Actions OpenAPI chain lists before building; an unsupported chain is a gap to tell the user |
| Asset class RWA, or gated access | Usually a gated vault or market. Gated products are not supported by the Morpho App; disclose eligibility as the [handbook](handbook.md) asks |
| Wallet model | Non-custodial: the user's wallet signs in the client. Custodial or omnibus: the integrator's custody signs server-side, and per-user balances follow the integrator's own ledger for omnibus |
| Account kind and EIP-7702 | Smart account or 7702 EOA: atomic EIP-5792 batching when the wallet supports it, else sequential sends; plain EOA: separate approval and action sends in the returned order ([execution](../SKILL.md#signature-rounds-and-simulation)) |
| Wallet provider | Which wallet SDK or connector the client uses |
| Earn fee, origination fee | Off-chain share or none: no fee code. Origination fee: Actions `referral_fee` where the variant accepts it, at most 200 bps, disclosed as the [manual](../SKILL.md#initial-intent-and-funding) requires |
| Rewards | Show and claim Merkl rewards as the product manual describes; creating a campaign is outside this manual |
| Timeline, regions, contact | Context for the user's plan; they do not change the build |
| `?` answers | Build what does not depend on them and list each as an open question in the hand-off |
