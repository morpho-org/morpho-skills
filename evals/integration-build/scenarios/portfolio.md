## What to build: Portfolio

One screen that shows all of a user's Morpho positions.

There is no fixed target. The screen works for any wallet address, on every chain the Morpho APIs cover, across Vault V2 and Vault V1 (Earn), Morpho Blue (variable-rate borrow) and Morpho Midnight (fixed-rate borrow).

### Story

**See every position in one view.** As a user, I see all my Earn and Borrow positions across chains on one screen, with totals, so I know what I have, what I owe, what I earn and what needs attention.

The screen shows:

- A totals header: Net worth, Total earning, Total borrowed, Total collateral, Claimable rewards, blended Net APY and blended borrow rate.
- A "Needs attention" strip that lists positions in the warning, danger or liquidated bands below, and Midnight loans within 7 days of maturity.
- An Earn list: vault, balance, Net APY, earned to date.
- A Borrow list: market, collateral, debt, LTV / LLTV with the band colour, rate, and maturity for Midnight.
- Each row opens a detail view of that position.

A position whose token has no price still appears in its row. An empty wallet gets an empty state that leads to Earn and Borrow.

### Health bands

| Band | Rule (ratio = LTV / LLTV) | Colour |
| --- | --- | --- |
| Healthy | ratio < 0.85 | green |
| Warning | 0.85 ≤ ratio < 0.95 | amber |
| Danger | ratio ≥ 0.95 | red |
| Liquidated | a liquidation happened | red, persistent banner |
