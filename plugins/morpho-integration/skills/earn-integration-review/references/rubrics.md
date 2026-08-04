# Review Rubrics — Morpho Integrator UX Playbook

The baseline checklist for reviewing a Morpho integration. Each row is independently checkable. Priority: Critical (trust/compliance-critical), Recommended, or Nice to have. Each row has a concrete **fail signal** so a verdict can be reached from a screenshot, code, or a flow description alone.

A review covers the Shared table plus the table(s) for the product under review: Earn (Vaults), Variable Rate Borrow (Blue), and/or Fixed Rate Borrow (Midnight).

Each row's **Goal** ties it to one of the playbook's three outcomes: Compliance → **Compliant** (honest expectations, correct attribution); Conversion → **Converts, grows TVL**; Clarity and Discoverability → **Smooth & discoverable** (users understand every step, and the right opportunity is easy to find).

## Shared (all products)

| Criterion | Goal | Priority | Where to look | Fail signal |
| --- | --- | --- | --- | --- |
| Approved vocabulary; yield framed variable/indicative | Compliance | Critical | All copy | Uses "staking", "investment", "guaranteed", or "risk-free" |
| Powered by Morpho on interaction surfaces | Compliance | Critical | Detail, review, confirm, post-action | Badge missing on any of these surfaces, or not the official asset |
| Disclaimer acknowledged before first interaction | Compliance | Critical | First deposit/borrow | User can act without acknowledging Integrator Terms + Morpho Disclaimer + risk |
| Every rate labelled fixed or variable | Compliance | Critical | Anywhere a rate appears | A rate shown with no fixed/variable label |
| Rate split into components; tokens named; your fee separated | Compliance | Critical | Detail, review | Rewards blended into headline with no token named, or integrator fee folded into protocol rate |
| Action completes in one signature | Conversion | Recommended | Deposit/borrow confirm | Separate approval transaction surfaced as its own signing step |
| Live outcome preview on input | Conversion | Recommended | Amount entry | Value/yield/cost/health not updated until submit |
| Balance + MAX + USD value on input | Conversion | Recommended | Amount input | No balance shown, no MAX, or no USD equivalent |
| One clear primary CTA per screen | Clarity | Recommended | Every screen | Multiple competing primary buttons |
| Consistent recap order (outcome → rate → cost → obligation → risk) | Clarity | Recommended | Review | Recap rows in a different or inconsistent order |
| Plain-language tooltip on any worrying number | Clarity | Recommended | All | Liquidation, liquidity, fee, or maturity shown with no explanation |
| Warn before a risky action | Clarity | Recommended | Pre-confirm | Over-LTV or low-liquidity discovered only after the action |
| Products presented with value prop + learn-more | Discoverability | Recommended | Entry / home | Earn/Borrow not presented, or no value prop |
| Idle-balance / eligible-asset nudge paired with CTA | Conversion | Nice to have | Balance/nudge | Prompt with no inline deposit/borrow CTA |
| Position shown alongside user's other balances | Discoverability | Nice to have | Post-action / portfolio | Morpho position siloed in a separate tab |

## Earn (Vaults)

| Criterion | Goal | Priority | Where to look | Fail signal |
| --- | --- | --- | --- | --- |
| Prominent net APY, labelled variable | Conversion | Recommended | Vault detail | Net APY buried or not labelled variable |
| APY split into base + rewards, tokens named | Compliance | Critical | Detail, review | Single blended figure with no breakdown or token names |
| Vault name shown through the flow | Compliance | Critical | Deposit, review, post-deposit | Generic "Earn USDC" or receipt-token name only |
| Curator named | Compliance | Critical | Detail or review | Curator not identified |
| Underlying collateral exposure reachable | Compliance | Recommended | Product detail | No way to see what the vault is exposed to |
| TVL + withdrawable liquidity shown honestly | Compliance | Recommended | Detail, review | Withdrawal caps or low liquidity not disclosed |
| Headline benefits communicated | Conversion | Nice to have | Product detail | No lock-ups / autocompounding / non-custodial not mentioned |
| Estimated yield preview | Conversion | Nice to have | Deposit input | No est. yield/yr shown as the user types |

## Variable Rate Borrow (Blue)

| Criterion | Goal | Priority | Where to look | Fail signal |
| --- | --- | --- | --- | --- |
| Borrow rate labelled variable | Compliance | Critical | Anywhere the rate appears | Rate shown without a variable label |
| Live health / LTV / liquidation price | Clarity | Critical | Borrow config | Health/LTV/liquidation not shown, or not updated live |
| Market transparency: pair, oracle, LLTV | Compliance | Recommended | Market detail | Loan/collateral, oracle, or LLTV not surfaced anywhere |
| Origination fee shown as your fee, separate | Compliance | Critical | Review | Integrator fee blended into protocol rate or unlabelled |
| Safe default max-LTV below LLTV | Conversion | Recommended | Borrow config | User can open right at LLTV with no buffer or guidance |
| Warn before over-borrow | Clarity | Recommended | Pre-confirm | Over-max/over-LLTV flagged only after the action |
| Repay & add-collateral obvious; full repay clears dust | Conversion | Recommended | Dashboard | Manage actions hard to find, or full repay leaves dust debt |
| Supply-collateral + borrow bundled | Conversion | Recommended | Execute | Multiple signatures for one borrow |

## Fixed Rate Borrow (Midnight)

| Criterion | Goal | Priority | Where to look | Fail signal |
| --- | --- | --- | --- | --- |
| Rate clearly fixed and distinguished from variable | Compliance | Critical | Anywhere the rate appears | Rate not labelled fixed, or indistinguishable from the variable product |
| Maturity date/countdown and matured state shown | Clarity | Critical | Detail, dashboard | No maturity shown, or matured state not surfaced |
| Repay-by-maturity obligation stated | Clarity | Critical | Review, dashboard | Consequence of missing maturity (liquidation) not stated |
| Required collateral inferred and shown | Clarity | Recommended | Borrow config | Required collateral not computed from the borrow amount |
| Early-exit caveat noted | Compliance | Nice to have | Review | Early-exit terms unstated |
| Fixed rate shown as orderbook-priced; requoted on input change and before signing | Clarity | Critical | Borrow config, review | Rate presented as static or utilization-based, or the quote not refreshed when the amount changes or before the transaction lands |
