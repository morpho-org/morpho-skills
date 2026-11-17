# Midnight: fixed rate, fixed maturity

Apply the shared [integration manual](../SKILL.md), keeping Midnight distinct from Blue. Fixed debt units, market quotes and maturity create different health and repayment semantics.

## Data and identity

Use the [Midnight REST OpenAPI](https://api.morpho.org/midnight/docs/swagger/json) for market/book discovery, quotes, positions and transactions; use the [Core REST OpenAPI](https://api.morpho.org/core/docs/swagger/json) for token prices/metadata and oracles. Derive routes, filters, pagination, nullable fields and schemas from these documents. Use the [Actions OpenAPI](https://api.morpho.org/actions/docs/openapi.json) for executable plans and chain support.

Midnight REST market IDs are bare, globally unique identifiers. Actions market selectors are `{chain_id}:{market_id}`; retain chain from discovery. Do not transfer the REST selector to an Actions operation unchanged.

## Debt, rates and valuation

One debt unit redeems for one loan-token base unit at maturity. Debt D is units owed at maturity, not assets received today. Position effective APR is a nullable simple annual decimal fraction using a 365-day year; it is not a historical average and ignores the variable `rateWindow`.

For positive seconds to maturity and WAD quote price p:

`fixedAPR = (1e18/p − 1) × 31,536,000 / secondsToMaturity`

Guard rates use WAD per-second simple rates, not annual APR: an APR ceiling r converts as floor(r × 1e18 / 31,536,000). Fees and guards can change effective results; the fee-free quote formula is not a promise of final cost. After maturity, do not extrapolate this formula with zero/negative time.

Let C_i be each collateral's base units, P_i its 1e36 oracle price, V_i = C_i×P_i/1e36 in loan base units, V = ΣV_i, and L_i the corresponding WAD LLTV divided by 1e18. Resolve LLTV and oracle from market configuration, not a position amount row.

Capacity H = Σ(V_i×L_i); effective LLTV = H/V, not the unweighted mean. LTV = D/V; health factor = H/D; uniform price drop to liquidation = 1 − LTV/(H/V).

Holding every other collateral price fixed, the liquidation threshold for collateral i in raw loan per raw collateral units is:

`max(0, (D − Σ(j≠i)(V_j×L_j)) / (C_i×L_i))`

Decimal-adjust for whole-token display. A zero-clamped threshold means other collateral covers this debt under that one-price-change assumption, not that the whole position is risk-free. Undefined denominators yield unknown values; no debt is not displayed as infinite health.

Token USD prices remain separate from oracle ratios. Known WAD scaling of cost basis does not establish its accounting interpretation; exact interest owed remains unknown until verified, not debt minus an invented principal.

## Quotes and capacity

Borrowing takes bids; early secondary repayment takes asks. They have different economic directions. Quote availability covers its returned offer window; fallback takeable offers can sum above the requested target. Never execute that sum or hand-build calls from offers; Actions resolves the executable plan.

Debounce network quotes and avoid fetching on every drag tick. Bind each response to product, chain, market, inputs and request generation; discard late replies. A stale quote, exhausted liquidity or moved rate requires re-quoting and renewed consent, not a guaranteed fill.

Debt and health constraints use face units. For target ratio t, incremental desired debt = max(0, t×V − D); solve quoted assets from those units with conservative rounding. Do not use assets received as the debt side of LTV. Available quoted units/assets and the unverified Actions safety buffer can further limit capacity.

For selected collateral i, added collateral to target = max(0, ceil((D/t − V)/(P_i/1e36))). Direct face-value repay to target = max(0, ceil(D − t×V)). At zero target use full repayment. Recompute weighted H and effective LLTV after collateral changes and simulate the actual rounded result.

## Transaction semantics

Derive amount/guard variants from Actions; do not copy Blue payloads. Borrow assets and borrow units have different bound directions. Rate guards require per-second WAD conversion; do not widen any protection silently. Paired collateral supplies and funding are omitted together when borrowing against existing collateral.

Native/auto funding applies only to the wrapped-native supplied collateral portion and requires a maximum native spend. Unsupported signature-mode fields do not become valid because another product supports them. Collateral-only operations have narrower schemas; do not inject funding, expiry or signature-mode fields they exclude.

Quoted borrow/market repayment is constrained by maturity and offer freshness as well as the shared expiry bounds. Direct repayment has distinct validity. Restart expired plans; never extend quote validity locally.

Direct repayment pays face value, including before maturity, without a market-price guard or offers. It supports full debt repayment. Early market repayment buys back debt through asks and requires an appropriate guard; it targets exact current units for closure, not a full-position shortcut.

Quoted early cost ≈ units × WAD price / 1e18, rounded up for spend estimation, reconciled with the prepared maximum repayment and fees. Compare its cost, liquidity dependence and residual debt with direct face value; it is not a refund or guaranteed cheaper exit. If unavailable, a direct alternative requires explicit choice and fresh review.

Borrow and market-repay guards have mode/amount-specific bound directions. Use their OpenAPI variants rather than treating slippage, rate, unit and asset caps as interchangeable. Direct repayment must not acquire a quote guard accidentally.

Collateral withdrawals identify each collateral explicitly; supported full-collateral variants do not imply that collateral securing remaining debt can be released. Use a verified safe amount and successful simulation whenever debt remains. Reconcile debt, credit, collateral and wallet balances before declaring closure; old exact-unit quotes can leave residuals.

## Maturity, monitoring and events

Maturity timestamps, not browser uptime, govern overdue status. Countdown presentation stops at zero; matured unpaid debt may be liquidated or roll to Blue under an opted-in configuration. Do not promise automatic rollover for every loan; broader roll/margin integration remains unverified.

Midnight supports paginated market-position reads for monitoring. Hydrate configuration, oracle and metadata separately. There is no universal indexed-block watermark: poll and reconcile observed changes rather than treating a receipt as fresh indexed data. Background notification guarantees require a running worker, durable schedules and deduplication; alerts never transact.

Use paginated transaction events, scoped to chain/market, for actual liquidation/roll accounting. Event amounts describe what happened; current position state describes what remains. Seized collateral uses collateral decimals; repaid debt and bad debt use loan-token units. Do not double-count rolled debt as seized collateral or infer event timestamps from the current clock.

Distinguish partial liquidation, full liquidation and roll semantics; an empty event feed does not establish an invented event. Retain historical information independently of whether an active balance remains. Remaining collateral is withdrawable only through an explicitly chosen successfully simulated action, not because an event was displayed.
