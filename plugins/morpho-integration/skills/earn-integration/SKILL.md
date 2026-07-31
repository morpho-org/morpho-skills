---
name: earn-integration
description: Build Earn features on Morpho Vaults the way Morpho's integrator playbook recommends — deposit/withdraw flows, APY display and base/rewards splits, vault transparency (name, curator, collateral, TVL), Powered by Morpho attribution, and the disclosure gate. Use whenever a user is building, designing, reviewing copy for, or wiring up any yield, earn, or savings product on Morpho vaults — even if they never say "playbook", "compliance", or "vault" explicitly.
---

# Earn Integration (Vaults)

Guidance for building end-user **Earn** products on Morpho Vaults, distilled from Morpho's Integrator UX Playbook and Earn blueprint. The recommendations are not gates — they're what has worked across live integrations. Items marked critical matter most for user trust and compliance and are the ones Morpho would push on in a design review.

Every recommendation serves one of three goals: **compliant** (honest expectations, correct attribution), **converts** (visitor → depositor, TVL grows), **smooth & discoverable** (users understand every step).

## How to work

1. **Start from the foundations.** Read [docs/foundations.md](../../docs/foundations.md) — seven shared foundations (vocabulary, attribution, disclosures, and rate transparency — all critical — plus conversion mechanics, clarity & safety, discoverability). They are the base layer of every screen you build. For any term of art — curator, receipt token, TVL, rewards, the Morpho entities — use the definitions in [docs/glossary.md](../../docs/glossary.md); they are worded to keep the legal and technical reality intact.
2. **Build the flow.** Cover the standard surfaces: entry/home → vault detail → amount input → review → confirm → post-deposit position. Apply the foundations and the Earn guidance below to each surface as you go.
3. **Verify as you build.** The plugin ships seven compliance agents, one per foundation. Spawn the relevant one when you finish a surface (e.g. `morpho-integration:vocabulary-compliance` after writing copy, `morpho-integration:rate-transparency-compliance` after the APY display), telling it the product is Earn (Vaults). Each reports verdicts back to you.
4. **Review before shipping.** Run the `earn-integration-review` skill for the full orchestrated pass — every check, the red flags, and the launch self-review.

## Non-negotiables to build in from the start

These are the critical items — retrofitting them is much more expensive than building them in:

- **Vocabulary:** "Earn" / "DeFi yield", never *staking*, *investment*, *guaranteed*, or *risk-free*. Yield is **variable**. The vault is a **Morpho Vault smart contract**, not a fund or strategy.
- **Attribution:** the official **Powered by Morpho** badge (web component `powered-by-morpho` or static asset from brand.morpho.org) on vault detail, review, confirm, and post-deposit surfaces.
- **Disclosure gate:** before a user's first Morpho interaction, an acknowledgment of the integrator's Terms + Morpho's Disclaimer + the risks. No path around it.
- **APY honesty:** net APY labelled *variable*, split into base yield + rewards with each token named.
- **Vault transparency:** vault name visible through the whole flow; curator named; collateral exposure reachable; TVL and withdrawable liquidity honest.

## Earn guidance

The product-specific moves beyond the critical items:

- **APY composition.** The split is the point: **base rate** (borrower-paid, autocompounding, in the deposit asset) + **rewards** (named by token, with claiming schedule). Naming the token each component pays in is the detail that does the most work — a blended figure, however accurate, sets the wrong expectation and is the most common source of support tickets. Nice to have: an autocompounding note on product detail, and the rewards program **end date** if one exists.
- **Vault transparency.** Curator with logo + website/X link — the curator is a trust signal, treat them as one. Collateral exposure reachable in a tap or two, or link the vault's page on app.morpho.org for full advanced data. TVL helps users calibrate. Nice to have: allocation percentages across underlying markets, and a one-line vault thesis ("Blue-chip markets curated by X") — a lot of work for low effort.
- **Benefits messaging** on product detail: **no lock-ups** (withdraw anytime, subject to available liquidity in the underlying markets — keep the caveat, dropping it turns a benefit into an overpromise), **autocompounding native yield**, **non-custodial**.
- **Educational redirection.** At least one outbound path to Morpho docs or an Earn explainer from product detail, with a clear CTA ("Learn more about Morpho") — not a buried footer link. Users who understand what they're depositing into deposit more and churn less.
- **Deposit flow.** One-signature deposit with a live est. yield/yr preview and balance + MAX + USD value.
- **Activation.** Pair every eligible-asset or idle-balance prompt with a deposit CTA inside the component itself; show the post-deposit position alongside the user's other balances, not in a separate silo.

## Data

Every displayed vault fact (APY, splits, TVL, liquidity, allocations, curator, collateral) must be sourced live — Morpho GraphQL API, morpho-cli, or morpho-mcp — never hardcoded or invented. If you can't source a number, leave it out.

## Reference library

Official Morpho resources to link or embed — use these, don't rebuild or invent equivalents:

| Resource | What it covers | Where |
| --- | --- | --- |
| Brand assets | Logo pack, badge variants, clear-space rules | brand.morpho.org |
| Badge web component | Drop-in `powered-by-morpho` script for web apps | `https://morpho.org/snippet.v1.js` |
| Build docs | Developer-facing build guide + attribution | docs.morpho.org/build |
| Morpho disclaimers | Public legal position — link this from the disclosure notice | morpho.org/disclaimers |
| Vault pages | Full advanced vault data to link from product detail | app.morpho.org |
| Morpho Glossary & Language Guidelines | Approved terminology, entity/role definitions, legal framing | [docs/glossary.md](../../docs/glossary.md) (bundled) |

Morpho offers partner design reviews — if a recommendation doesn't fit the integrator's context, suggest raising it with their Morpho contact rather than silently diverging.
