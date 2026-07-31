# Shared Foundations — Morpho Integrator Playbook

These seven foundations apply to every Morpho-powered product — Earn (Vaults), variable-rate borrow (Blue), and fixed-rate borrow (Midnight). Treat them as the base layer of any integration: build them in first, then layer each skill's product-specific guidance on top.

Items flagged critical are the ones that matter most for end-user trust and compliance — the ones Morpho would push hardest on in a product/design review.

## The three goals

Every recommendation serves one of three outcomes:

- **Compliant** — meets Morpho's attribution and legal expectations, and sets honest expectations for users.
- **Converts, grows TVL** — the flow turns a visitor into a depositor or borrower, and keeps assets in the vault or market.
- **Smooth & discoverable** — users understand every step, and the right opportunity is easy to find.

## 1. Product vocabulary (critical)

**Why it matters.** The words set the expectations. Users who hear *staking* expect lock-ups and validator risk. Users who hear *guaranteed* expect a promise no one can make. Clean vocabulary is the highest-leverage thing an integration can get right, because it flows into every other screen.

- Use **Earn** or **DeFi yield** for vault deposits and steer away from *staking* or *investment*.
- For loans, say **borrow against collateral**; name the rate type explicitly as **variable rate** or **fixed rate**; use **liquidation** plainly rather than hiding it.
- Describe yield and variable borrow cost as **variable** or **indicative**, and avoid *guaranteed* and *risk-free*.
- Refer to the underlying as **Morpho Vault / Morpho Market smart contracts**, not *funds* or *strategies*.

## 2. Brand & attribution (critical)

**Why it matters.** The Powered by Morpho badge is the shortest way to tell users that your app is the interface and Morpho is the protocol. Partners who get this framing right tend to have cleaner regulatory conversations and clearer user support.

- Surface **Powered by Morpho** on the screens where users actually touch Morpho functionality: the product-detail screen, the review step, the confirmation, and the post-action position view.
- Use the official `powered-by-morpho` web component or the static badge from brand.morpho.org. Match the badge theme to the surface (light on light, dark on dark).
- Make the short disclaimer reachable from the badge; the web component does this via tooltip.

## 3. Morpho disclosures (critical)

**Why it matters.** Morpho is an immutable, permissionless, non-custodial protocol; its partners provide the interface. A distinct moment where users see Morpho's disclaimer keeps that line legible for users and regulators, and protects both sides.

Before or upon any end user's first interaction with the Morpho Protocols through the product, present a notice the user must acknowledge, substantially in this form:

> "Accessing the Morpho Protocol through this app is governed by [Integrator's] Terms of Use and Morpho's Disclaimer. By using it, you acknowledge that you have read and understood these terms and the risks involved."

Ensure no end user can access or interact with the Morpho Protocols through the product unless they have first acknowledged this notice.

## 4. Rate transparency (critical)

**Why it matters.** A rate with no context is a support ticket waiting to happen. Users who can't tell a variable rate from a fixed one, or don't know part of an APY pays in a different token, can feel misled.

- **Always label a rate as fixed or variable, right next to the number**, and carry that label through every surface: browse, review, and dashboard. A user should never have to guess.
- Split the all-in rate into its parts and name the token each part pays in:
  - **Earn:** base yield (borrower-paid, autocompounding, in the deposit asset) + rewards (named token, with claiming schedule).
  - **Borrow:** the protocol borrow rate + your origination fee, shown separately.

## 5. Conversion mechanics: grow TVL

**Why it matters.** Every extra step, hidden number, or ambiguous button is drop-off. The fastest way to grow vault and market TVL is to remove friction between intent and signature.

- **Lead with the headline rate** (net APY for Earn; borrow cost + rate type for borrow). It's the primary reason users act.
- **Collapse approvals into one signature:** bundle approval + action so "deposit" or "borrow" feels like a single tap.
- **Preview the outcome live** as the user types (position value, est. yield, borrow cost, health). Seeing the result drives the click.
- **Frictionless amount entry:** show balance, a MAX button, and the USD equivalent.
- **One clear primary CTA per screen:** keep secondary actions quiet.
- **Push protocol jargon into tooltips or an "advanced" reveal.**

## 6. Clarity & safety

**Why it matters.** Confidence converts. Users act when they understand what will happen and trust that nothing will surprise them.

- **Keep one recap order** so users learn to read it once: outcome → rate → cost → obligation → risk.
- **Explain every number that could worry a user** with a plain-language tooltip (liquidity limits, liquidation, fees, maturity).
- **Warn before a risky action, not after:** surface high LTV, low liquidity, or maturity proximity at input time.
- Guide users toward a **healthy default** (e.g. a sensible max-LTV well below liquidation) so they succeed and come back.

## 7. Discoverability & activation

**Why it matters.** Users can't deposit into what they can't find. The highest-intent moments — idle balances and eligible assets — are also the easiest to waste.

- Present **Earn** and **Borrow** opportunities clearly on entry, in dedicated sections, each with a one-line value prop and a learn-more link.
- Pair any **eligible-asset or idle-balance nudge with a CTA** inside the component itself.
- After the action, show the **Morpho-powered position alongside the user's other balances**, not in a separate silo.
