# Growth

Transaction friction, discovery and activation, and user education. Each requirement is judged from the flows and screens in the source.

### G1. The fewest signatures the protocol allows
Deposits and borrows do not force a separate approval transaction when a signature can replace it: the app requests `signature_mode: "auto"` where the route accepts it, supplies collateral and borrows in one action, and sends prepared calls as one batch when the wallet supports atomic batching, falling back to sequential sends.

### G2. The outcome is previewed live
While the user enters an amount, the app shows the result before any submission: expected receipt-token amount or position value for Earn, and borrow cost, LTV and liquidation price for Borrow. After preparation, the preview is replaced by the values from the Actions simulation.

### G3. Amount entry shows balance, Max and USD
Each amount input shows the wallet balance or position balance it draws from, a Max control, and the USD equivalent of the typed amount.

### G4. One primary action per screen
Each screen has a single primary button whose label names the action that will happen, and the label changes with the direction or mode, for example Borrow against Repay. Secondary actions are visually quieter.

### G5. One review step lists everything in order
Before the first wallet prompt, a review step lists each signature and each transaction in the order they will be requested, with amounts, approvals, fees and limits. When final calls are not known yet, the review says so and is updated before sending.

### G6. The headline rate leads
The rate that motivates the action, net APY for Earn and borrow rate for Borrow, is the most prominent figure on the product screen and carries its type.

### G7. Positions and entry points are easy to find
A user with positions sees them before or alongside new opportunities. A user with none sees an empty state that links to the Earn and Borrow entry screens. Each position row opens its detail.

### G8. State refreshes itself after a transaction
After a confirmed transaction, the app refetches the position without a manual reload and shows a pending state until the indexed data includes the transaction. Rewards and history stay reachable after a balance reaches zero.

### G9. Users can learn more in the flow
The product screens have a visible link to Morpho documentation or an explainer. Terms such as LLTV, health factor, liquidation price, and any number that could worry a user have a plain-language tooltip or helper text.

### G10. Errors are actionable
API error codes are mapped to plain user messages with a next step: the available amount when liquidity is short, switching to full repayment when the amount exceeds debt, a new quote when the rate moved, and a restart when the action expired. The raw service message appears only in a details view.
