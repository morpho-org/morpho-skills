# Integrator handbook

Product and interface guidelines for a Morpho-powered integration, grouped by the concern each one solves. Apply them to the functionality the integration actually offers; they do not prescribe a feature set, layout or navigation. Units, calculations and transaction rules stay in the [shared manual](../SKILL.md), [UI principles](ui-principles.md) and product manuals, and are not restated here. Source the data behind every guideline as [REST API best practice](rest-api-best-practice.md) describes.

| Category | Concern it solves |
| --- | --- |
| [Truthful language](#truthful-language) | Words set expectations the protocol cannot meet |
| [Attribution and protocol boundary](#attribution-and-protocol-boundary) | Users cannot tell the interface from the protocol |
| [Legal acknowledgment](#legal-acknowledgment) | Users act without accepting Morpho's disclaimer |
| [Exposure transparency](#exposure-transparency) | Users do not know what their assets are in |
| [Rate and cost honesty](#rate-and-cost-honesty) | The headline number is not what users earn or pay |
| [Position risk and safety](#position-risk-and-safety) | Users learn about liquidation after it is too late |
| [Transaction friction](#transaction-friction) | Intent is lost between the click and the signature |
| [Discovery and activation](#discovery-and-activation) | Users never find the product or return to it |
| [User education](#user-education) | Users have nowhere to go to understand the product |

Each guideline carries a product tag (**Shared**, **Earn**, **Blue**, **Midnight**) and a priority: ⭐ trust-critical, **Rec** recommended, **Nice** nice to have. Guidelines are recommendations, with one exception: the [legal acknowledgment](#legal-acknowledgment) notice is an obligation. A priority here never relaxes a rule in the shared manual or a product manual.

## Truthful language

Words set the expectation for every later screen. A user who reads *staking* expects lock-ups and validators; a user who reads *loan from Morpho* expects a lender to call.

- **Shared ⭐** Call vault deposits **Earn** or **DeFi yield**. Do not use *staking*, *delegation*, *validators* or *investment*, and do not place a vault under a staking menu.
- **Shared ⭐** Describe yield and variable borrow cost as **variable** or **indicative**. Do not use *guaranteed*, *risk-free*, *stable* or *secure*.
- **Shared ⭐** Morpho is infrastructure, not a counterparty. Say "open a borrow position", "borrow against collateral via Morpho Markets" and "permissionless liquidation"; never "loan from Morpho", "Morpho lends", "Morpho liquidates" or "Morpho seizes collateral".
- **Shared ⭐** Use "Morpho" only for what is Morpho's: the protocols, Morpho Vaults, Morpho Markets and the Morpho App. A third-party vault, curator or integration is not "Morpho".
- **Earn ⭐** Rewards are token incentives under a program. They are not interest, dividends or a guaranteed bonus, and Morpho does not pay them.
- **Earn ⭐** Qualify withdrawals as subject to available liquidity. Do not promise an unconditional *instant* withdrawal.
- **Shared Rec** Replace regulated-finance terms with the protocol terms below.
- **Midnight Rec** Use *offer* and *unit*; avoid *order*, *bond*, *security* and *trading venue*. Describe early exit as an offer-based exit path, not a *secondary market*.

| Avoid in user-facing copy | Use instead |
| --- | --- |
| Fund, strategy, investment product | Morpho Vault smart contract, Morpho Market |
| Asset manager, fund manager, managed | Curator, curated; the curator configures risk parameters |
| Investor, client, customer | User |
| Shares of a fund, ownership stake | Receipt tokens (code and API fields keep `shares`) |
| Assets under management | TVL, value deposited into smart contracts |
| Insured deposits | Morpho does not provide insurance; third parties may offer coverage |
| Platform, service, custody | Infrastructure, noncustodial protocol |

## Attribution and protocol boundary

The Powered by Morpho badge is the shortest way to say that the app is the interface and Morpho is the protocol.

- **Shared ⭐** Show Powered by Morpho where users interact with Morpho functionality: product detail, input and review steps, confirmation and the position view. A distant legal footer is not enough when Morpho is central to the product.
- **Shared ⭐** Use the official `powered-by-morpho` web component (`https://brand.morpho.org/snippet.js`) or an official static badge from [brand.morpho.org](https://brand.morpho.org/#powered-by-morpho). Do not redraw, recolor, restyle or build a custom lockup. Text such as "via Morpho" or "(Morpho)" does not replace the badge.
- **Shared ⭐** Keep the boundary explicit: the integrator operates the interface; the user's protocol interaction is with Morpho smart contracts. Never imply that Morpho operates, audits, endorses or guarantees the interface.
- **Shared ⭐** Tag every initial intent with the integration's own `calldata_origin`, as the [shared manual](../SKILL.md#initial-intent-and-funding) requires.
- **Shared Rec** Match the badge theme to the surface, light on light and dark on dark. Do not invert it.
- **Shared Rec** Keep the short disclaimer reachable from the badge. The web component shows it in a tooltip; a static badge needs an equivalent.

## Legal acknowledgment

A distinct moment where users see Morpho's disclaimer keeps the interface and protocol line legible for users and regulators.

- **Shared ⭐ (obligation)** Before or upon a user's first interaction with the Morpho protocols through the product, present a notice the user must acknowledge, substantially in this form: "Accessing the Morpho Protocol through this app is governed by [Integrator's] Terms of Use and [Morpho's Disclaimer](https://morpho.org/disclaimers/). By using it, you acknowledge that you have read and understood these terms and the risks involved." No user may interact with the protocols through the product before acknowledging it.
- **Shared ⭐** The acknowledgment is an active choice. It is never preselected, and a deep link, restored state, alternate action or wallet change must not bypass it.
- **Shared Rec** Keep the acknowledged version and time auditable, without logging signatures or unnecessary personal data.
- **Shared Rec** Repeat a one-line disclaimer on the review step of each action, where assets move or debt is created.
- **Shared Rec** Link Morpho's disclaimers from every Morpho-powered surface.

## Exposure transparency

Morpho's architecture lets users know which vault or market they are in, who curates it and what backs it. An integration should not remove that.

- **Earn ⭐** Show the vault name on the input, review and position views. A generic label such as "Earn USDC" or a receipt-token symbol alone hides it.
- **Earn ⭐** Name the curator, with logo and link where available, as a trust signal rather than small print.
- **Shared ⭐** When a response carries a warning or a listing status for the vault, market or offer, show it before the yield or rate and restate it at review. Do not invent a warning the API does not return.
- **Blue, Midnight ⭐** Show the oracle as type, address and a link to it. A bare type such as "Chainlink" implies a uniform risk profile that composed and custom oracles do not have.
- **Earn Rec** Make collateral exposure reachable within a tap or two of product detail, named by asset rather than "DeFi strategies", with allocation percentages. A link to the vault on the Morpho App can carry the advanced data.
- **Earn Rec** Show TVL and currently withdrawable liquidity, including any withdrawal limits.
- **Blue, Midnight Rec** Show the market's chain, loan and collateral assets, LLTV, available liquidity and rate; show utilization for Blue.
- **Shared Rec** A user can name the vault or market they are using without leaving the flow.
- **Earn Nice** Show a one-line vault description taken from the vault's own metadata.
- **Blue Nice** Indicate where a market's liquidity depends heavily on one vault or curator.

## Rate and cost honesty

A rate without context sets the wrong expectation: users assume a blended number arrives in the deposit asset, or that a headline borrow rate is all they pay.

- **Shared ⭐** Label every rate **fixed** or **variable** next to the number, on browse, review and position views.
- **Earn ⭐** Split yield into native yield (borrower-paid, accruing in the deposit asset) and rewards (named token, with schedule). Never show one blended figure without the breakdown.
- **Blue ⭐** State that the borrow rate changes with utilization. Rewards arrive as a separate token and do not reduce debt; keep them out of the borrow cost.
- **Blue, Midnight ⭐** Show an integrator fee as the integrator's own, separate from the protocol rate, with net amount received against gross debt. Interest accrues on gross debt.
- **Midnight ⭐** Present the fixed rate as priced from available offers: it moves with the borrow size and as offers change. Requote on input changes and before signing, and show quote freshness.
- **Shared Rec** State the averaging window and whether the figure is APR or APY, following the [rate convention](../SKILL.md#rates-and-accounting).
- **Earn Rec** Show the end date of a rewards program when it has one.
- **Blue Rec** In a high-utilization market, warn that a new borrow can itself raise the rate.
- **Midnight Nice** Explain early exit: direct repayment before maturity pays full face value, and offer-based repayment depends on available offers and is not a guaranteed cheaper exit.

## Position risk and safety

Borrowing is a risk product before it is a rate product. If a user can enter an amount without seeing the resulting health and liquidation price, the interface has told them the rate matters more than the risk.

- **Blue, Midnight ⭐** Keep LTV, LLTV, health factor and liquidation price visible on market detail, input, review, the position view and every management action. Never show LTV without LLTV.
- **Blue, Midnight ⭐** Treat the input as a live projection of resulting LTV, health factor, liquidation price, borrowable amount and estimated cost.
- **Shared ⭐** Warn before a risky action, not after: high LTV, low liquidity, maturity proximity.
- **Blue ⭐** Say that debt grows on its own, so health can fall without a price move.
- **Blue, Midnight ⭐** Describe liquidation as permissionless: third parties repay unhealthy positions and receive collateral under contract rules, with no margin call or grace period. Label any protection the integrator adds as the integrator's.
- **Midnight ⭐** Show the maturity date or countdown, a clear matured state, and what can happen to debt left unpaid at maturity.
- **Blue, Midnight Rec** Guide users to a default target below LLTV, explained in a tooltip and labelled as the integrator's policy. The Actions health buffer is unpublished; do not invent its value.
- **Blue, Midnight Rec** Make repay and add collateral obvious on the position view. Full repayment uses the supported full-repay mode so no residual debt remains.
- **Blue, Midnight Rec** Offer alerts, or a clear hook for them, on a health or LTV threshold. Alerts inform and never transact; route ambiguous signals to a person rather than to automated remediation.
- **Midnight Rec** Infer and show the collateral a borrow amount requires.
- **Earn Rec** State withdrawal limits before the user relies on them. Penalties and returned positions in force or in-kind exits need their own consent.

## Transaction friction

Every extra step, hidden number or ambiguous button loses users between intent and signature. Remove friction, never review or verification.

- **Shared Rec** Use the fewest signatures the protocol and wallet permit: approval with action, and supplied collateral with borrow, in one action where supported. The [signature and simulation rules](../SKILL.md#signature-rounds-and-simulation) still apply.
- **Shared Rec** Preview the outcome as the user types: position value, estimated yearly yield, borrow cost, health. These are estimates until simulation succeeds.
- **Shared Rec** Show the wallet balance, a maximum action and the USD equivalent beside the amount input.
- **Shared Rec** Lead with the headline rate and its type; do not place it below secondary details.
- **Shared Rec** Give each screen one primary action.
- **Shared Rec** Keep one recap order on every review: outcome, rate, cost, obligation, risk.

## Discovery and activation

Idle balances and eligible assets are the highest-intent moments in an app, and the easiest to waste.

- **Shared Rec** Present Earn and Borrow in their own sections on entry, each with a one-line value statement and a path to learn more.
- **Shared Rec** When the user has positions, show them before new opportunities. An empty state points to the opportunities.
- **Shared Nice** Put the action inside any eligible-asset or idle-balance prompt, not on another screen.
- **Shared Nice** Show the Morpho-powered position beside the user's other balances, not in a separate area.
- **Shared Rec** Keep accrued rewards and history reachable after an active balance reaches zero.
- **Earn Nice** State the three vault benefits on product detail, accurately: no lock-ups (withdrawals subject to available liquidity), native yield that accrues continuously in the vault, and a noncustodial design.
- **Earn Nice** Show accrued yield on the position view.

## User education

A little context in the flow works better than documentation behind a footer link.

- **Shared Rec** Give at least one visible path from product detail to [Morpho documentation](https://docs.morpho.org) or an explainer, such as "Learn more about Morpho".
- **Shared Rec** Explain any number that could worry a user in plain language: liquidity limits, liquidation, fees, maturity.
- **Shared Rec** Explain required terms such as LLTV where they appear; keep deeper protocol detail (interest rate model, share accounting, oracle scaling) behind an advanced reveal.
- **Shared Rec** Give an unsupported or unavailable action an understandable reason.
- **Earn Nice** Explain where yield comes from: the user deposits through the integrator into a Morpho Vault, the vault allocates to Morpho Markets, borrowers pay interest, and that interest returns to the vault.
- **Earn Nice** Link to the vault on the Morpho App for users who want the full data.
