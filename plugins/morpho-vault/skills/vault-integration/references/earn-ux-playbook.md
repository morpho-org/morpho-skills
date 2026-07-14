# Earn UX Playbook — Morpho Integrator Blueprint

The product, brand, and compliance guidelines from Morpho's Integrator Blueprint. These are recommendations shaped by what has worked across live integrations — items flagged ⭐ are the ones that matter most for end-user trust and would get pushed hardest in a Morpho design review.

## 1. Product vocabulary ⭐

Words set expectations. Users who hear *staking* expect lock-ups and validator risk; users who hear *guaranteed* expect a promise on-chain yield can't make. Vocabulary is the highest-leverage thing an integration gets right because it flows into every other screen.

- Call the product **Earn** or **DeFi yield** — not *staking*, not *investment*.
- Frame yield as **variable** or **indicative** — never *guaranteed* or *risk-free*.
- Refer to vaults as **Morpho Vault smart contracts** — not *funds* or *strategies*. This keeps the technical reality intact for users who dig in.

## 2. Brand & attribution

"Powered by Morpho" tells users the app is the interface and Morpho is the protocol. Partners who get this framing right tend to have cleaner regulatory conversations and clearer user support.

- Surface **"Powered by Morpho"** on the screens where users actually interact with Morpho functionality: the deposit flow, the review step, the post-deposit view, and the product-detail screen.
- Use the official `powered-by-morpho` web component or the official static badge (see [attribution.md](attribution.md) for embed code). Don't rebuild the mark.
- Match the badge theme to the UI surface — light on light, dark on dark.
- Make Morpho's short disclaimer reachable from the badge. The web component does this via tooltip.

## 3. Morpho disclosures

Morpho is an immutable, permissionless, non-custodial protocol; partners provide interfaces. A distinct moment where users see Morpho's disclaimer keeps that line legible for users and regulators, and protects both sides.

Before or upon a user's **first interaction** with the Morpho protocol through the app, present a notice they must acknowledge, substantially in this form:

> "Accessing the Morpho Protocol through this app is governed by [Integrator]'s Terms of Use and Morpho's Disclaimer. By using it, you acknowledge that you have read and understood these terms and the risks involved."

No user should be able to interact with Morpho through the product before acknowledging this notice. Link the word "Disclaimer" to https://morpho.org/disclaimers. Implementation pattern in [disclosures.md](disclosures.md).

## 4. APY composition ⭐

When rewards get blended into one headline APY, users expect that whole number to land in their wallet as the deposit asset. When part of it is a different token on a different schedule, confusion follows — this is the single most common source of support tickets across integrations.

- Split APY into two labeled components:
  - **Base rate** (also called *native yield*): borrower-paid interest, autocompounding, paid in the deposit asset.
  - **Rewards**: named by token, with the claim schedule where relevant.
- Name the token each component pays in — that detail does the most work.
- Frame every rate as **variable** or **indicative**.

Nice to have: a short autocompounding note on the product-detail screen (a real selling point that gets lost when APY is flattened), and the rewards program end date if one exists.

Data wiring for the split is in [data-display.md](data-display.md).

## 5. Vault transparency ⭐

Morpho's architecture is designed so users know which vault they're in, who curates it, and what collateral it's exposed to. Don't flatten that away.

- Show the **vault name** on the deposit flow, review screen, and post-deposit view. Generic labels ("Earn USDC") and wrapped receipt-token names obscure it.
- Name the **curator** on the product-detail or review screen, with logo where available; link their website or X account. The curator is a trust signal — treat them as one.
- Make **underlying collateral** reachable within a tap or two from product detail, or link to the vault's page on app.morpho.org for the advanced data.
- Show **TVL** on product-detail or review — it helps users calibrate.
- Nice to have: allocation percentages across underlying markets, instantly withdrawable liquidity, and a one-line vault thesis ("Blue-chip markets curated by X").

## 6. Vault benefits messaging

Three differentiators worth communicating on the product-detail screen:

- **No lock-ups** — users can withdraw anytime, subject to available liquidity in the underlying Morpho Markets.
- **Native yield auto-compounds** — borrower-paid interest accrues continuously inside the Morpho Vault smart contract.
- **Non-custodial** — user funds flow through Morpho Vault smart contracts.

Keep the liquidity caveat on "no lock-ups" — dropping it turns a benefit into an overpromise.

## 7. Educational redirection

Users who understand what they're depositing into deposit more and churn less. A little context in-flow outperforms docs buried behind a footer link.

- Provide at least one outbound path to Morpho docs or an Earn explainer from the product-detail screen.
- Use a clear CTA ("Learn more about Morpho") rather than a buried footer link.

## 8. Activation surfaces

"Eligible assets" prompts and idle-balance nudges are among the highest-intent moments in a partner app.

- Pair idle-balance and eligible-asset prompts with a **deposit CTA inside the component itself**.
- After deposit, show the Morpho-powered position **alongside the user's other balances**, not in a separate tab.

## Launch self-review

Run this pass before shipping — it's the review Morpho's integration team would do:

- [ ] Is the language aligned? (Earn, variable, Morpho Vault — no staking/guaranteed/fund)
- [ ] Is "Powered by Morpho" visible wherever users interact with Morpho functionality?
- [ ] Is there a distinct, required acknowledgment of Morpho's disclaimer before first interaction?
- [ ] Is APY transparent about where it comes from and what token each part pays in?
- [ ] Can a user name the vault they're depositing into without leaving the flow?
- [ ] Is the curator named somewhere a user will actually look?
- [ ] Are the three headline benefits visible on product detail (with the liquidity caveat)?
- [ ] Is there a path to learn more from the product-detail screen?
- [ ] Do idle-balance prompts carry a deposit CTA?
