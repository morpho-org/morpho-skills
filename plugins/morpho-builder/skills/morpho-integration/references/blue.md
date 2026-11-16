# Blue: variable-rate borrowing

Apply the shared [integration manual](../SKILL.md). Blue has a variable rate and no maturity. Do not apply Midnight face-unit or fixed-term accounting to it.

## Data and identity

Derive discovery, market/position state, performance, historical averages, liquidity, oracles and metadata from the [Core REST OpenAPI](https://docs.morpho.org/openapi.json). Derive transaction variants and chain support from the [Actions OpenAPI](https://api.morpho.org/actions/docs/openapi.json); this manual does not duplicate their route or field catalogues.

Market selectors are `{chain_id}:{market_id}`; token/oracle selectors are chain-prefixed addresses. Resolve exact identity rather than symbol. Indexed history and current state may differ in freshness.

## Valuation and rounding

Let C be collateral base units, P the 1e36-scaled oracle price, V = C × P / 1e36 in loan base units, D debt in loan base units, and L the WAD LLTV divided by 1e18. Keep rational/integer arithmetic until display.

Borrow shares convert with virtual terms, rounding debt up:

`D = ceil(borrow_shares × (total_borrow_assets + 1) / (total_borrow_shares + 10^6))`

Supply assets round down with the corresponding supply totals and the same virtual terms. These raw shares are not ERC-20 amounts with loan-token decimals.

LTV = D/V; health factor = V×L/D; price drop to liquidation = 1 − LTV/L. Liquidation price = D/(C×L) in raw loan per raw collateral units; multiply by 10^(collateralDecimals−loanDecimals) for whole-token display. USD valuation uses token USD prices, not P.

No debt is a distinct state, not infinite displayed health. Missing/zero valuation inputs make dependent ratios undefined; do not divide by zero or label unknown health safe. A negative performance cost is not silently clamped to zero.

Use realized borrowing averages for the selected shared rate window, not instantaneous rates. Borrow cost/performance accounting comes from the performance contract, not debt minus deposits. Incentives remain separate from debt cost.

## Capacity and target calculations

Borrowing capacity is constrained by collateral health and currently available liquidity, including validated reallocatable liquidity where applicable. A target-utilization bound is distinct from total liquidity. Indexed availability is not a guaranteed fill.

A safe maximum must remain below LLTV according to the Actions health buffer. Its numeric margin is not established here; do not invent a reject-free maximum. Successful simulation remains mandatory.

For target ratio t:
- Incremental borrow = max(0, floor(t×V − D)).
- Repay to target = max(0, ceil(D − t×V)).
- Added collateral to target = max(0, ceil(D/(t×(P/1e36)) − C)).

At t=0, use supported full repayment instead of dividing by zero or estimating debt dust. Recompute from actual rounded amounts. When collateral changes under a fixed target, solve again against the new V. Linked controls use one clamp for health and liquidity; retain current position truth even if it exceeds new-action limits.

## Transaction semantics

Use Actions for borrow, repay and collateral management; do not build protocol calls yourself. Combined borrowing pairs added collateral with its funding specification; omit both when borrowing only against existing collateral. Never post zero amounts. Fees can separate gross debt from net wallet receipt.

Use the supported full-debt repayment variant rather than converting an estimated debt amount to an exact-assets repayment. The prepared maximum repayment is an output describing possible wallet outflow, including accrual and supported fee, not an input.

Combined repayment and exact collateral withdrawal is atomic within the action. Do not invent a full-collateral amount variant for Blue: an exact raw balance is subject to successful simulation. Standalone collateral actions have their own schemas. A debt-free position does not establish that every withdrawal plan is valid without preparation.

Respect the shared expiry, proof, signature and ordered-call rules. A receipt does not establish closure: reconcile debt, collateral and wallet balances; check residual debt before treating a position as closed. Zero indexed rows need not be deleted for the active balance to be zero.

## Monitoring and event interpretation

Read-only monitoring does not transact. Open-client polling can refresh every 30–60 seconds, but closed-client delivery requires a running backend and durable identity/transition tracking. Blue has no documented market-wide borrower list; monitor registered user/market identities rather than assuming one exists.

Health bands and safety margins are application policy, not verified visual parity with another app. Unknown oracle state is not healthy; no-debt positions do not generate liquidation alerts. Deduplicate state transitions and identify the position needing attention without authorizing actions automatically.

There is no documented exact Blue user liquidation event feed in this contract. A collateral drop not explained by the integration's known receipts is only a possible-liquidation signal: external wallet actions and coarse history can look identical. Snapshot differences do not prove exact date, seized collateral or repaid debt.

Keep inferred and observed events distinct. Current position state determines what remains; only a successful, explicitly chosen action establishes a safe remaining-collateral withdrawal. Unknown event accounting stays unknown.
