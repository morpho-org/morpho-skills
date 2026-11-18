# Vault V2: Earn

Apply the shared [integration manual](../SKILL.md). Discover the selected vault's configuration rather than substituting direct Blue supply. Vault V1 compatibility is a separate deployed contract, not an alias for V2.

## Data and valuation

Use the [Core REST OpenAPI](https://api.morpho.org/core/docs/swagger/json) for discovery, configuration, state, positions, performance, prices and withdrawal options; derive routes, parameters, fields and versions from it. Use the [Actions OpenAPI](https://api.morpho.org/actions/docs/openapi.json) for transaction variants and supported chains.

Vault/token selectors are `{chain_id}:{address}`. Obtain asset and share-token metadata independently. A share price quoted in RAY is whole underlying tokens per whole share, scaled by 1e27. The indexed estimate is:

`sharesRaw = floor(assetsRaw × 10^shareDecimals × 1e27 / (10^assetDecimals × share_price_ray))`

Use share-token decimals or the configured asset-decimal offset, not an assumed 18 decimals. Null/zero share price gives an unknown estimate; successful simulation determines execution.

V2 `maxDeposit`, `maxMint`, `maxWithdraw` and `maxRedeem` return zero by design. They are not availability or position signals. Use indexed state/options and successful simulation. Withdrawal availability remains subject to liquidity.

Performance accounting uses average-cost realized plus unrealized native earnings, not deposits minus withdrawals. Convert earnings with underlying decimals and token USD price; return on capital is non-annualized. Combined earnings add scoped reward USD only when every component is known. A known absence of rewards permits native-only accounting; an unsuccessful lookup does not.

## Liquidity and execution protections

Native/auto funding is meaningful only for a wrapped-native underlying and requires the maximum native spend. Deposit capacity and expected shares are estimates until preparation succeeds. Vaults using a Midnight liquidity adapter cannot accept the unsupported deposit; normal withdrawals in that configuration use idle assets only.

Liquid withdrawal availability is bounded by both the user's position and currently withdrawable liquidity. Do not double-count liquidity-adapter availability and force-deallocation capacity. Max withdraw is the smaller of the position and that liquidity. On a shortfall, use validated error details or refreshed state/options and state the requested and available amounts; never invent an available amount.

A supported ordinary full redemption uses the full-position variant rather than an estimated asset amount. Derive exact asset/share variants from the Actions schema. Ordinary asset-withdrawal slippage is preparation/attestation-only, not an on-chain maximum-share guard; share/full withdrawals have no on-chain minimum-assets guarantee. Disclose execution-price risk.

Force and in-kind exits require separate consent to penalties and received assets/positions; they are not silent retries of ordinary withdrawal. An indicative adapter penalty is forced assets × WAD penalty rate / 1e18. Final review uses the simulated token penalty, with USD only when priced; do not apply an unrelated adapter's rate to the whole exit.

Full-position force withdrawal's penalty cap is checked at preparation, not enforced on chain; this variant has response validity but no on-chain deadline. It excludes funding, signature mode, referral fee and client expiry. A zero cap means penalty-free consent only. Exact-assets force withdrawal has different protections: its deadline is enforced on chain, and it does not accept the full-position penalty-cap input. Obtain fresh consent if unsupported full-position planning requires an exact-assets plan.

Prepared residual shares and simulated remaining shares may differ. Never promise a dust-free force exit; reconcile actual residuals.

In-kind redemption requires exact assets and an explicitly selected, same-chain Blue market allocated by the vault with sufficient capacity. No silent amount reduction, full-position shortcut, cross-chain market, funding or referral fee. It can return idle assets plus an illiquid Blue supply position, not all cash.

The in-kind penalty cap is checked at preparation/continuation only. When current penalty is below 2% and its setter has not abdicated, consent must cover the conditional 2% requirement regardless of setter timelock. A queued change can exceed a preparation cap at execution; disclose that limit and subsequent position/liquidity risk. A schema example is not user tolerance.

Vaults containing a Midnight adapter do not support force withdrawal or in-kind redemption. Respect other unsupported-vault reasons; alternatives are not guaranteed exits.

## Rewards and claims

Use [Merkl's current reference](https://developers.merkl.xyz/api-reference/get/v4/opportunities) for campaign discovery, APR records, paginated attribution, rewards and distribution-chain metadata. Apply the [shared rate convention](../SKILL.md#rates-and-accounting), not a spot opportunity rate.

Collect the vault's campaign identities across all opportunities, including ended campaigns for historical earnings. Match chain and campaign breakdowns; use opportunity identity as a consistency check. The same reward token may cover unrelated vaults, so do not allocate the whole token total to one vault. Paginate breakdowns, using the vendor's paginated leaf breakdown contract for large recipients. Private/truncated attribution stays unknown.

For a scoped cumulative reward amount, earned-to-date = `amount + pending`; claimable = `amount − claimed`. Pending is earned but not yet in a claimable root. Use the reward token's own decimals, price and distribution chain, which may differ from the vault's chain. Restriction/eligibility evidence is not inferred from whether the wallet previously received rewards.

No active campaign does not erase accrued rewards. Withdrawal does not claim them; already-earned pending rewards may settle after exit without implying indefinite new accrual. Reward lookup failures must not silently produce complete net yield or complete earnings. Root update cadence remains unverified; pending-data refresh cadence is not a root schedule.

Actions has no claim operation. For standard ERC-20 TREE rewards, retain only positive unclaimed entries with nonempty proofs. Exclude unsupported LEDGER, points, pre-token and wrapper flows explicitly. Empty proofs or zero claimable value are not universally an InvalidProof diagnosis; a mismatched leaf/proof can revert the whole batch.

Verify the distribution chain's Merkl Distributor deployment and configured recipient before enabling send; do not assume a universal address or that wallet balance must rise. This integration sends from the user's wallet, not an undisclosed operator or recipient-management flow.

The Distributor ABI is `claim(address[] users, address[] tokens, uint256[] amounts, bytes32[][] proofs)`. Align every array: wallet user, reward token, full cumulative token `amount` and unchanged corresponding proofs. Never replace cumulative amount with claimable difference or a vault subtotal while retaining the proof. A chain-wide batch can include rewards from multiple campaigns; disclose scope.

Simulate the encoded claim, review tokens/costs/recipient, obtain consent, send on the distribution chain and wait for receipt. Refresh rewards with the vendor's post-claim cache bypass (`reloadChainId`), not on every poll; ordinary cache/indexing can lag. Refresh wallet balances independently and reconcile claimed values. Root/proof change requires fresh data and review, never silent resubmission.

### Reward APR convention

The Merkl coverage-weighted display convention uses hourly records over the same interval: deduplicate timestamps, exclude the extra inclusive boundary bucket, discard `hasUntrustedContribution` records, and sum mean(retained `avg`) × retained/expected / 100 across opportunities. Expected hourly counts are 6, 24 and 168 for six hours, one day and seven days. Paginate before computing. Do not substitute opportunity spot APR, `totalApr` or `nativeApr`. Empty/all-excluded or failed data is unavailable, not an invented zero.

Hourly retention and vendor averaging guarantees remain unconfirmed. This convention is not a Merkl guarantee. For 30/90-day or one-year native windows, omit the unsupported reward average and identify the exclusion. Vault one-hour/inception lookbacks are not automatic substitutes.

## Vault V1 compatibility

Use the V1 contracts in the same [Core REST spec](https://api.morpho.org/core/docs/swagger/json) and [Actions spec](https://api.morpho.org/actions/docs/openapi.json). Derive supported chains and amount variants independently.

Use V1's own state and accounting contract rather than applying V2 RAY math to it. Do not infer availability from max functions without validating their semantics.

V1 has no V2 force/in-kind operations. If instant liquidity is insufficient, communicate limited availability rather than presenting an unsupported fallback. Performance, price/null semantics, reward attribution, proofs and post-exit accrued rights remain applicable.
