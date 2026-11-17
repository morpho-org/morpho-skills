# QA requirements: Borrow

Taken from the acceptance lines of Flow A (Borrow), the action error states and the global rules in the integration brief. Each is checked against the source for both Morpho Blue and Morpho Midnight unless it names one.

### A1-1. Previews come from the simulation
After an action is prepared, the before and after numbers shown to the user are computed from `simulation.position_changes`, not from the typed input alone.

### A1-2. Max never produces a rejected borrow
The Max control for borrowing keeps a margin below LLTV, and also caps at available liquidity, so the amount it fills is not rejected for health.

### A1-3. A too-large amount is blocked before the request
An amount above the borrowable liquidity, or a Midnight amount whose quote cannot be filled, disables confirmation and explains why before any Actions request is sent.

### A1b-1. Slider, LTV input and amount always agree
The LTV slider, the numeric LTV input and the borrow amount are driven by one value, so changing any of them updates the other two.

### A1b-2. The slider stops at the maximum
The thumb cannot pass the maximum LTV, and the LLTV tick cannot be reached. When liquidity is the limit, the slider stops there and shows how much is available to borrow now.

### A1b-3. Previewed LTV matches the simulation
The LTV shown after preparation is the LTV implied by the simulated position changes, and the app compares or replaces its own estimate with it.

### A1b-4. Changing collateral keeps the target LTV
When the user changes the collateral amount, the app recomputes the borrow amount for the same target LTV.

### A1b-5. Midnight quotes are debounced
Midnight quotes are requested when the slider stops or after a short debounce, not on every movement, and a late quote for an older input is discarded.

### A2-1. No debt is shown as "No debt"
A position with collateral and no debt shows "No debt". It does not show an infinite or very large health factor.

### A2-2. A missing price disables what depends on it
When the oracle price or a token price is missing, the affected values show a dash and the actions that need them are disabled.

### A2-3. Midnight shows maturity with a countdown
A Midnight position shows its maturity date with a countdown, and a distinct state once it has matured.

### A3-1. The open position screen polls
While the position screen is open, position data is refetched every 30 to 60 seconds.

### A3-2. Alerts fire once per band change
An alert is raised when a position's health band changes, never more than once for the same change, and it links to the screen where the user can add collateral or repay.

### A3-3. Midnight alerts before maturity
Midnight loans raise alerts 7 days before maturity, 1 day before, and at maturity.

### A4-1. Helpers fill the amount for a target LTV
Add collateral and Repay each have a control that fills the amount needed to reach a chosen LTV, and both show LTV and liquidation price before and after.

### A4-2. The screen refreshes after confirmation
After a confirmed add-collateral or repay, the position is refetched and the band updates without a manual reload.

### A4b-1. A repay is never health-gated
A repay that lowers debt is allowed whatever the resulting LTV. The repay form stays enabled in the danger and liquidatable states, and the borrow-side health check is not applied to it.

### A4b-2. The remaining gap is explained
When LTV after a repay is still at or above LLTV, the app warns that the loan can still be liquidated and states how much more to repay or how much collateral to add.

### A4b-3. A partial repay never withdraws collateral
A partial repay request contains no collateral withdrawal.

### A4b-4. An unhealthy-position error on a repay offers collateral
If the API rejects a pure repay as unhealthy, the app says the repayment could not be prepared and offers Add collateral.

### A5-1. A full Blue exit repays all and withdraws in one action
Closing a Blue loan uses the full-repayment mode together with the collateral withdrawal in one action, not an estimated debt amount, and shows the most that can leave the wallet.

### A5-2. An early Midnight exit shows both prices
Before maturity, the exit screen shows the cost of exiting at the market price next to the cost of paying face value. If the market quote cannot be filled, the app offers repayment at face value.

### A5-3. A closed position leaves the list
After a full exit, the position is refetched, no longer appears as open, and the returned collateral shows in the wallet balance.

### A6-1. A liquidation is shown with its details
A liquidated position shows a persistent banner with the date, the collateral taken, the debt cleared and what remains, and offers to withdraw remaining collateral.

### A6-2. Inferred liquidations are not presented as facts
Midnight liquidations come from the transaction events. Where Blue has no liquidation event to read, an inferred liquidation is labelled as inferred.

### F-1. Insufficient balance
When the wallet balance is too low, confirmation is disabled and the balance is shown, with a message naming the token.

### F-2. Liquidity shortfall
When liquidity is too low for the amount, the app states how much can be borrowed now and offers that amount.

### F-3. Expired action
When an action expires or its continuation is invalid, the app tells the user it expired and restarts from a new request without reusing the continuation.

### GL-1. Every number has a unit and every rate a type
Amounts carry their token or currency. Rates carry their type and window, such as "variable, 6h avg" or "fixed until {date}".

### GL-2. Loading and unknown are distinct from zero
Loading values show placeholders, and unknown values show a dash. Neither shows as zero.

### GL-3. One review screen before the first prompt
A single review screen lists each signature and transaction in order before the first wallet prompt.

### GL-4. Pending until the indexer catches up
After a confirmed transaction, the app shows a pending state until the indexed block reaches the transaction's block.
