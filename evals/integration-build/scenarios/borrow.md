## What to build: Borrow

A borrow product that covers one loan through its whole life, on both Morpho borrow products: Morpho Blue (variable rate, no maturity) and Morpho Midnight (fixed rate, fixed maturity). Every story must work on both products unless it says otherwise.

Targets:

- Morpho Blue: the USDC / cbBTC market on Base, `8453:0x9103c3b4e834476c9a62ea009ba2c884ee42e94e6e314a26f04d312434191836`.
- Morpho Midnight: one listed USDC market on Base. Choose it from the listed markets at run time.

### Stories

1. **Take a position.** As a user, I pick collateral and an amount, see my rate, LTV and liquidation price before I sign, and open the loan in one confirmation.
   The screen shows: a collateral input with wallet balance and Max; a borrow input with Max; the rate (Blue: variable; Midnight: fixed APR to a maturity date); LTV before and after, with LLTV; the liquidation price; available liquidity; a review step that lists every signature and call.

2. **Borrow by target LTV.** As a user, I set how much risk I want by dragging an LTV slider, and the borrow amount, liquidation price and health update live, so I choose a risk level rather than guess an amount.
   The screen shows: an LTV slider from 0% to the maximum LTV, with the track coloured by the health bands below and an LLTV tick that is shown but cannot be reached; a numeric LTV input; the borrow amount in token and USD, kept in two-way sync with the slider; live readouts for liquidation price, price drop to liquidation and rate; a short warning when the thumb enters the warning or danger band.
   On an existing position the slider opens at the current LTV. Dragging right borrows the difference; dragging left repays it. The button label follows the direction.

3. **Show the position.** As a borrower, I see what I posted, what I owe, what it costs, and how close I am to liquidation, in my own currency.
   The screen shows: collateral (amount and USD); debt now; borrowing cost to date; borrow rate; LTV; LLTV; health factor; liquidation price; and, for Midnight, maturity with a countdown.

4. **Monitor the position.** As a borrower, I am warned before I can be liquidated, early enough to act.
   The position screen refreshes while it is open, and a backend job produces alerts when the screen is closed. Midnight loans also alert before and at maturity.

5. **Keep it healthy.** As a borrower in warning, I add collateral or repay part of the loan and see my new health before I sign.
   The screen shows two actions side by side, Add collateral and Repay, each with a "to reach LTV X%" helper that fills the amount, and LTV and liquidation price before and after.

6. **Partial repay on a liquidatable position.** As a borrower whose LTV is already above LLTV, I can still repay part of my loan to lower my risk, and I am told clearly that I am still liquidatable afterwards.

7. **Exit the position.** As a borrower, I close my loan and get my collateral back, and I know what it costs before I sign.
   Cover three cases: Blue at any time; Midnight at or after maturity; Midnight before maturity, where the user compares exiting at the market price with paying face value.

8. **Liquidated.** As a borrower who was liquidated, I see what happened, how much collateral was taken and what remains.

### Health bands

| Band | Rule (ratio = LTV / LLTV) | Colour | Message |
| --- | --- | --- | --- |
| Healthy | ratio < 0.85 | green | none |
| Warning | 0.85 ≤ ratio < 0.95 | amber | "Your loan is close to its liquidation limit. Add collateral or repay to lower your LTV." |
| Danger | ratio ≥ 0.95 | red | "Your position can be liquidated if prices move further. Act now." |
| Liquidated | a liquidation happened | red, persistent banner | "Part of your collateral was liquidated on {date}." |
