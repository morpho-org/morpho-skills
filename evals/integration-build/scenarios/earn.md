## What to build: Earn

An earn product on Morpho Vault V2.

Target: the Steakhouse USDG vault on Robinhood Chain, `4663:0xBeEff033F34C046626B8D0A041844C5d1A5409dd`.

### Stories

1. **Take a position.** As a user, I see what the vault earns and who manages it, deposit an amount, and see my expected position before I sign.
   The screen shows: a vault header (name, asset, curator); the APY, with a rewards line when the vault has a rewards campaign; total deposits; a deposit input with wallet balance and Max; a "you will receive" preview; a review step.

2. **Show the position.** As a depositor, I see my balance, the rate I am earning, and how much I have earned so far.
   The screen shows: balance (token and USD); net APY as the headline, with its native and rewards parts; interest earned to date; rewards earned to date; rewards claimable now; total earned; return on capital; optionally a history chart.

3. **Exit the position.** As a depositor, I withdraw some or all of my balance and know up front if the vault cannot pay all of it right now.

4. **Claim rewards.** As a depositor, I claim the rewards I have earned, including after I have withdrawn everything.
   The screen shows: the claimable amount per token (amount and USD), a Claim all button, and the amount that is earned but not yet claimable.
