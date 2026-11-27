# QA requirements: Earn

Taken from the acceptance lines of Flow B (Earn), the action error states and the global rules in the integration brief. Each is checked against the source for Morpho Vault V2.

### B1-1. The APY states its window and keeps rewards separate
The APY label states its averaging window, for example "6h avg". When rewards are shown, the label says they are separate from native yield.

### B1-2. A vault that cannot accept deposits disables deposit
When the API reports that the vault cannot accept the deposit, for example a vault that uses a Midnight liquidity adapter or one that is at its cap, the deposit control is disabled and shows the API's reason.

### B1-3. The expected position is previewed
Before signing, the user sees the receipt-token amount they will receive, estimated from the vault's share price while typing and taken from the simulation once the action is prepared.

### B2-1. Earned to date comes from the performance data
Interest earned to date is read from the position performance route. It is not computed as deposits minus withdrawals.

### B2-2. A missing price shows the token amount only
When a token has no price, the app shows the token amount and a dash for USD.

### B2-3. Rewards lead when a campaign is live and hide when none is
With a live rewards campaign, the position leads with net APY and total earned, each with its native and rewards split. With no campaign, the reward rows are hidden and not shown as zero.

### B2-4. Native APY and reward APR share one window
The reward APR is computed over the same window as the native APY, six hours by default.

### B2-5. A failed rewards read does not relabel native APY
When the rewards read fails, net APY shows a dash while native APY stays visible. Native APY is never shown under the net APY label.

### B2-6. Earned and claimable rewards use the right amounts
Rewards earned to date use the cumulative amount plus pending. Claimable uses the cumulative amount minus the claimed amount. Both are limited to this vault's campaigns.

### B2-7. Return on capital is labelled as not annualized
Return on capital is shown with a label that says it is not an annual rate.

### B3-1. Max withdraws the whole position
The Max control for withdrawing uses the full-position mode of the withdraw action, not an estimated asset amount, so no residual balance is left.

### B3-2. A liquidity shortfall is explained with the available amount
When the vault cannot pay the requested amount now, the app says so, offers the amount that is withdrawable, and does not fail silently.

### B3-3. A forced exit shows its penalty first
A force withdrawal or in-kind redemption is offered only where the vault supports it, as a separate choice, and the penalty is shown in token terms before the user signs.

### CL-1. Claim is offered next to Withdraw
The exit screen offers Claim alongside Withdraw and says that withdrawing does not claim rewards.

### CL-2. The claim is built correctly
The claim keeps only tokens whose cumulative amount exceeds the claimed amount and whose proof is not empty. It passes the full cumulative amount with the unchanged proof, with the user's wallet as the user, and is sent by that wallet on the distribution chain.

### CL-3. Claimable updates after the claim
After the claim confirms, rewards and wallet balances are refetched and claimable shows the new value.

### CL-4. A full withdrawal ends with a reminder to claim
When claimable is above zero, the withdraw-all flow ends by telling the user how much is left to claim.

### CL-5. A wallet with no balance can still claim
The claim screen and action work for a wallet that has withdrawn everything.

### F-1. Insufficient balance
When the wallet balance is too low, confirmation is disabled and the balance is shown, with a message naming the token.

### F-2. Liquidity shortfall
When liquidity is too low for a withdrawal, the app states how much can be withdrawn now and offers that amount.

### F-3. Expired action
When an action expires or its continuation is invalid, the app tells the user it expired and restarts from a new request without reusing the continuation.

### GL-1. Every number has a unit and every rate a type
Amounts carry their token or currency. Rates carry their type and window, such as "variable, 6h avg" or "6h avg, excl. rewards".

### GL-2. Loading and unknown are distinct from zero
Loading values show placeholders, and unknown values show a dash. Neither shows as zero.

### GL-3. One review screen before the first prompt
A single review screen lists each signature and transaction in order before the first wallet prompt.

### GL-4. Pending until the indexer catches up
After a confirmed transaction, the app shows a pending state until the indexed block reaches the transaction's block.
