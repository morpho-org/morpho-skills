# Midnight — fixed rate, fixed `maturity`

Apply the shared Actions contract, conventions, UX, errors, and verification rules in [SKILL.md](../SKILL.md). Keep this product separate from Blue. All reads are REST GETs; Actions builds every transaction. Define `id` = bare REST `market_id`, m = `{chain_id}:{market_id}` for Actions, u = wallet `address`, s = `{chain_id}:{tokenAddress}`, `o_i` = `{chain_id}:{collateralOracle}`. JSON sketches require substitution with discovered addresses and user-approved values.

Reference map: [market discovery](https://docs.morpho.org/api/midnight/markets/list-markets/), [market](https://docs.morpho.org/api/midnight/markets/get-market/), [book](https://docs.morpho.org/api/midnight/books/get-book/), [quotes](https://docs.morpho.org/api/midnight/books/get-quote/), [user positions](https://docs.morpho.org/api/midnight/positions/list-positions/), [market positions](https://docs.morpho.org/api/midnight/positions/list-market-positions/), [transactions](https://docs.morpho.org/api/midnight/transactions/list-user-transactions/), [oracle](https://docs.morpho.org/api/oracles/get-oracle-state/), [`token`](https://docs.morpho.org/api/global/get-token/), [USD `price`](https://docs.morpho.org/api/global/get-token-price/), [Actions](https://api.morpho.org/actions/docs).

Use `C_i` `collateral` base `units`, `P_i` oracle `price`, `V_i` = `C_i` × `P_i` / 1e36 in loan base `units`, V = Σ`V_i`, `L_i` = `lltv_i` / 1e18, borrowing capacity H = Σ(`V_i` × `L_i`), and effective LLTV `L_eff` = H / V. Debt D is `units` owed at `maturity`: one `unit` redeems for one loan-`token` base `unit` at `maturity`. Do not use loan `assets` received as `debt`.

## A1. Take a position

**Components:** `collateral` input(s) with connected-wallet balances and Max; borrow input with Max; quoted fixed APR and `maturity` date; LTV before → after and effective/per-`collateral` LLTV; liquidation prices; available liquidity; every signature and call in one review.

**Reads:**

| Route | Fields / purpose |
| --- | --- |
| GET `/v0/midnight/markets?chain_ids=…&loan_assets=…&collateral_assets=…&active_only=true&listed=true` | `chain_id`, `market_id`, `loan_token`, `maturity`; collaterals[] with `token`, oracle, lltv; one market per `maturity`/parameters |
| GET `/v0/midnight/markets/{id}` | selected market configuration; keep `chain_id` for Actions |
| GET `/v0/midnight/books/{id}` | best bid/book prices and liquidity for initial rate display |
| GET `/v0/midnight/books/{id}/bids/quote?assets={borrowAssets}` | `average_best_price`, `average_worst_price`, `available_assets`, `available_units`, `takeable_offers` |
| GET `/v0/midnight/users/{u}/positions` | existing `debt` and collaterals[] for selected market; paginate |
| GET `/v0/oracles/{o_i}/state` for each `collateral` | `price` |
| GET `/v0/tokens/{s}` and `/v0/tokens/{s}/price` for loan and each `collateral` | `decimals`, `symbol`, `logo_uri`; nullable USD `price` |

`chain_ids` is required when `loan_assets` is supplied. Borrowers take **bids** (lenders' buy offers), not asks. A too-large quote returns 422 `INSUFFICIENT_LIQUIDITY`. Quote availability covers the returned offer window; fallback `takeable_offers` can sum to more than the requested target. Never execute that sum or hand-build `calls` from offers.

**Math:** `V_i` = `C_i` × `P_i` / 1e36, H = Σ(`V_i` × `L_i`), LTV = D / V. The theoretical `debt` bound is H; safe Max must also respect available quoted `units`/`assets` and the **open** Actions safety buffer. A quote `price` p is WAD-scaled:

```latex
\text{fixed APR}=\left(\frac{10^{18}}{p}-1\right)\frac{31{,}536{,}000}{\text{seconds to maturity}}
```

Use only positive time to `maturity`. Display the quoted `price`/rate and costs; settlement/continuous fees and quote guards can change the effective result, so reconcile with Actions simulation rather than promising a fee-free `price` formula is the final cost. For a requested `assets` `amount`, estimate target `units` with conservative rounding from the `price`; use the quote/Actions resolved `amount` for final review. Liquidation health uses `units` D, not the `assets` received.

**Action:** POST `/v0/actions/midnight/markets/{m}/borrow`:

~~~json
{
  "account":"<wallet>",
  "amount":{"unit":"assets","value":"<gross-loan-assets>"},
  "collateral_supplies":[
    {"collateral":{"address":"<collateral-token>"},"amount":{"unit":"assets","value":"<collateral-assets>"}}
  ],
  "funding":{"type":"erc20"},
  "guard":{"type":"slippage","bps":50}
}
~~~

50 `bps` is an example requiring explicit integrator/user policy, not an API or design default. Omit `collateral_supplies` and `funding` together for existing-`collateral` borrow. Up to 16 supplied `collaterals` are allowed. Amount can instead be `{"unit":"units","value":"<debt-units>"}`.

Borrow guard alternatives: `{"type":"max_rate","value":"<WAD-per-second-simple-rate>"}`; `max_units` for an `assets` target; `min_assets` for a `units` target. Convert an APR ceiling r to per-second WAD as floor(r × 1e18 / 31,536,000), not r × 1e18 alone. No `signature_mode` field on this intent. Native `funding` requires a wrapped-`native` supplied `collateral` and `max_native_assets`; `auto`/`native` applies only to that `collateral` portion. Optional supported referral fee/expiry/attribution follows SKILL.md. Require proof verification and successful simulation before sending.

**Acceptance:** preview numbers match `simulation.position_changes` applied as deltas; do not promise a rejection-free Max until the Actions health buffer is verified (open). A too-large `amount` is blocked using the bids quote before the Actions POST; never send a `failed` simulation.

## A1b. Borrow by target LTV (slider)

**Components:** 0%-to-max slider with health-colored track, unreachable LLTV tick (effective LLTV with individual `collateral` limits explained); numeric LTV input; synchronized borrow `token`/USD input; live liquidation prices, `price`-drop-to-liquidation and quoted fixed APR; short warning in warning/danger band. Open at current LTV for existing positions. Right borrows; left repays; button label follows direction.

**Reads:** A1 config, position, per-`collateral` oracle and `token` routes. On slider release, debounce roughly 300 ms before GET `/v0/midnight/books/{id}/bids/quote?assets={candidateAssets}`; never quote every tick. Cancel/ignore obsolete responses so a slower old quote cannot overwrite the current target.

**Math:** V includes current plus added `collateral`. `L_eff` = Σ(`V_i` × `L_i`) / V, not an unweighted mean. Target incremental `debt` `units` = max(0, floor(t × V − D)); inverse LTV after borrow = (D + quotedDebtUnits) / V. Re-solve `assets` from the quote when the slider stops; `debt` is `units` at `maturity`, not loan `assets`. Cap at `L_eff` minus the **open** safety buffer and liquidity-reachable LTV. Use rational/base-unit rounding; no floating-point monetary math. Leftward move repays max(0, D − t × V) `debt` `units`; direct repay consumes equivalent face-`value` `assets`. Price drop to liquidation for a uniform `collateral`-`price` move = 1 − LTV / `L_eff`.

**Action:** rightward POST `/v0/actions/midnight/markets/{m}/borrow`:

~~~json
{"account":"<wallet>","amount":{"unit":"units","value":"<computed-debt-units>"},"guard":{"type":"slippage","bps":50}}
~~~

Add A1 `collateral_supplies`/`funding` when also supplying. Leftward POST `/v0/actions/midnight/markets/{m}/repay`:

~~~json
{"type":"direct","account":"<wallet>","amount":{"unit":"assets","value":"<computed-face-value-assets>"},"funding":{"type":"erc20"}}
~~~

At zero target use direct `amount` `{"unit":"all"}`. Never POST zero values; use A5 for an explicitly chosen secondary-market exit rather than silently changing repayment mode.

**Acceptance:** slider, LTV input and `amount` always agree; the thumb cannot pass the max, and when liquidity is what limits it, the slider stops there with "Only {x} available to borrow now"; the previewed LTV matches the LTV implied by `simulation.position_changes` to within 0.1 pp; changing the `collateral` `amount` re-solves the borrow at the same target LTV. Keep safe-Max evidence explicitly open until verified.

## A2. Show the position

**Components:** `collateral` rows/`token`/USD, `debt` at `maturity`, interest-cost explanation, effective APR, LTV/effective LLTV and `collateral`-specific thresholds, health factor, per-`collateral` liquidation prices, `maturity` countdown.

**Reads and Math:**

| Field on screen | Exact source | Math / presentation |
| --- | --- | --- |
| Collateral (`token`, USD) | GET `/v0/midnight/users/{u}/positions` → collaterals[]: `token`, `amount`; GET `/v0/tokens/{s}/price` | each raw `amount` / 10^`decimals` × USD `price` |
| Debt now / due at `maturity` | positions → `debt` | `units` owed at `maturity`, in loan-`token` base `units`; do not accrue as Blue `shares` |
| Interest owed | positions → `cost_basis` and `debt` | **open accounting question**: `cost_basis` is WAD-scaled average cost in loan-`token` `units`; candidate principal = `cost_basis` / 1e18 before subtracting from `debt`, not raw subtraction; do not `claim` exact interest without validating semantics/history |
| Borrow rate | positions → `effective_apr` | simple annualized decimal fraction (365-day year), can be null; show fixed rate, not an average; ignore `rateWindow` |
| LTV | `debt`; `collaterals`; GET `/v0/oracles/{o_i}/state` → `price` | D / Σ`V_i` |
| LLTV | GET `/v0/midnight/markets/{id}` → `collaterals[].lltv` | each / 1e18; effective LLTV = Σ(`V_i` × `L_i`) / V |
| Health factor | same inputs | Σ(`V_i` × `L_i`) / D |
| Liquidation `price` | same inputs, holding other `collateral` prices fixed | `P_i`,liq = max(0, (D − Σ(j≠i)(`V_j` × `L_j`)) / (`C_i` × `L_i`)); decimal-adjust raw loan/`collateral` ratio |
| Maturity | positions → `maturity` | date/countdown; unpaid `debt` past `maturity` can be liquidated or rolled to Blue if opted in |

Position `collaterals` carry `amounts`; resolve LLTV/oracle from market config, not the position `collateral` row. Fetch `token` `decimals` via GET `/v0/tokens/{s}`. No `collateral` `value` ⇒ unknown/undefined LTV, not a false healthy ratio. Do not divide by zero `collateral` or LLTV when computing a liquidation `price`; show "—" when undefined. A clamped zero threshold means other `collateral` alone covers the `debt` under this one-`price`-change assumption, not that the whole position is risk-free.

**Action:** display is read-only; explicitly selected actions go to A1/A4/A5. Example selected partial repayment, POST `/v0/actions/midnight/markets/{m}/repay`:

~~~json
{"type":"direct","account":"<wallet>","amount":{"unit":"assets","value":"<selected-face-value-assets>"},"funding":{"type":"erc20"}}
~~~

**Acceptance:** a position with no `debt` shows "No `debt`" (not health ∞); a null oracle or `token` `price` shows "—" and disables actions that need it. Show interest owed as unknown/`UNVERIFIED` until the `cost_basis` accounting question is resolved, not fabricated principal.

## A3. Monitor the position

**Components:** band-change health alerts linked to A4; `maturity` reminders at minus 7 days, minus 1 day, and at `maturity`; backend push job plus open-screen polling.

**Reads:** `all` A2 routes every 30–60 s while open. Backend scan: GET `/v0/midnight/markets/{id}/positions?types=borrow`, paginated, gives borrowers with `debt`, `collaterals`, `maturity`, `effective_apr` and `cost_basis`. Hydrate config/oracles/`token` `data` separately. Midnight positions do not expose a universal `last_indexed_block` watermark.

**Math:** effective buffer = `L_eff` − LTV in percentage points; uniform `price` drop to liquidation = 1 − LTV / `L_eff`. Apply proposed/design-unconfirmed bands. Schedule `maturity` alerts from `maturity` timestamp, not browser uptime. Warn that unpaid matured `debt` is liquidatable or can roll into Blue under an opted-in configuration; do not promise automatic rollover for every loan.

**Action:** alerts do not transact. Link directly to A4; after user consent, POST `/v0/actions/midnight/markets/{m}/supply-collateral`:

~~~json
{"account":"<wallet>","collateral":{"address":"<collateral-token>"},"amount":{"unit":"assets","value":"<selected-collateral-assets>"}}
~~~

**Acceptance:** an alert fires when the band changes, never more than once per band change, and links straight to A4 (Keep it healthy). Maturity alerts fire at −7d, −1d and `maturity` once each; unknown health must not be reported healthy.

## A4. Keep it healthy

**Components:** Add `collateral` and Repay side by side; "to reach LTV X%" helpers; LTV and per-`collateral` liquidation prices before → after; wallet spend/balance.

**Reads:** A2 position/config/oracle/`token`/`price` routes. Select which configured `collateral` is being added and respect `all` `collateral`-specific LLTVs.

**Math:** for chosen `collateral` i, added `collateral` to target t = max(0, (D / t − V) / (`P_i` / 1e36)), round up in `collateral` base `units`. Single-`collateral` equivalent: D / (t × `price`) − C. Repay to target t = max(0, D − t × V), round up to loan base `units` for direct face-`value` repay. At t=0 choose full repay rather than divide by zero. Recompute H and effective LLTV after adding `collateral`; validate both target LTV and weighted capacity.

**Action:** POST `/v0/actions/midnight/markets/{m}/supply-collateral`:

~~~json
{"account":"<wallet>","collateral":{"address":"<collateral-token>"},"amount":{"unit":"assets","value":"<collateral-base-units>"}}
~~~

Or POST `/v0/actions/midnight/markets/{m}/repay`:

~~~json
{"type":"direct","account":"<wallet>","amount":{"unit":"assets","value":"<face-value-loan-assets>"},"funding":{"type":"erc20"}}
~~~

Standalone supply-`collateral` accepts only `account`, `collateral`, `amount`, and optional `calldata_origin`: no `funding`, `signature_mode`, or `expires_at`. Direct repayment pays face `value` now, including before `maturity`; no guard/offers are needed. If an estimated partial `amount` exceeds `debt`, refresh and offer direct `all`. Do not add a `price` guard to direct repay.

**Acceptance:** after confirmation the screen refreshes and the band clears without a manual reload. Re-poll until indexed changes reconcile; if the action did not reach the target, explain rather than falsely clearing the band.

## A5. Exit the position

**Components:** direct face-`value` alternative beside early secondary exit quote; costs, `collateral` release, fees, remaining `debt`, quote guard/deadline, every signature/call in review.

**Reads:** GET `/v0/midnight/users/{u}/positions` → `debt` and `collaterals[].amount`; market `maturity`/config; per-`collateral` oracle and `all` `token` metadata/prices. Before an early secondary exit GET `/v0/midnight/books/{id}/asks/quote?units={debt}`. Use asks to buy `debt` back, unlike bids for borrowing. Read `average_best_price`, `average_worst_price`, `available_assets` and `available_units`. On quote 422 offer direct face-`value` repay; on unavailable service show it unavailable, not a stale guaranteed quote.

**Math:** direct face-`value` cost is D loan-`token` base `units`; quoted early cost is `units` × WAD `price` / 1e18, rounded up for spend preview and reconciled with `prepared` `max_repay_assets`/fees. Show difference vs face `value` and residual `units`. Secondary exit can cost less but depends on liquidity; never label it a refund. Full market repay targets exact current `units`, not `all`.

**Action:**

| Case | Exact POST route | Request |
| --- | --- | --- |
| At/after `maturity`, or explicit early direct alternative | `/v0/actions/midnight/markets/{m}/repay` | `type: direct`; `amount` `unit`: `all`; `funding`; optional `collateral_withdrawals` |
| Early secondary exit | `/v0/actions/midnight/markets/{m}/repay` | `type: market`; `amount` `unit`: `units` with current `debt`; guard; `funding`; optional `collateral_withdrawals` |

Direct full exit:

~~~json
{
  "type":"direct",
  "account":"<wallet>",
  "amount":{"unit":"all"},
  "funding":{"type":"erc20"},
  "collateral_withdrawals":[{"collateral":{"address":"<token>"},"amount":{"unit":"all"}}]
}
~~~

Early secondary full-`unit` target:

~~~json
{
  "type":"market",
  "account":"<wallet>",
  "amount":{"unit":"units","value":"<current-debt>"},
  "guard":{"type":"slippage","bps":50},
  "funding":{"type":"erc20"},
  "collateral_withdrawals":[{"collateral":{"address":"<token>"},"amount":{"unit":"all"}}]
}
~~~

List each `collateral` to release. Market repay has no `amount` `unit`: `all`. Other market guards: `min_rate` (minimum per-second WAD simple rate), `min_units` with `assets` target, `max_assets` with `units` target. Never silently broaden a guard. If `debt` changed, refresh the exact `units` and re-confirm rather than claiming dust-free closure from an old quote.

If `debt` is already zero and `collateral` remains, POST `/v0/actions/midnight/markets/{m}/withdraw-collateral`:

~~~json
{"account":"<wallet>","collateral_withdrawals":[{"collateral":{"address":"<token>"},"amount":{"unit":"all"}}]}
~~~

**Acceptance:** after a full exit the position disappears from the active list when `debt`, credit and `collateral` are zero, and the `collateral` appears in the wallet balance; the early-exit screen always shows both the market `price` and the face-`value` alternative. Re-poll indexed state, inspect residual `debt`, and do not declare full exit from a receipt alone.

## A6. Liquidated

**Components:** persistent liquidation banner with date, `collateral` seized, `debt` cleared and what remains; withdraw remaining `collateral` action; distinguish partial liquidation, full liquidation and roll.

**Reads:** `GET /v0/midnight/users/{u}/transactions?event_types=partial_liquidation,full_liquidation,roll`, paginated; filter the selected chain/market. Liquidation events expose `created_at`, `tx_hash` and `data.collateral`, `seized_assets`, `repaid_units`, `bad_debt`, `post_maturity_mode` and `pure_bad_debt_realization`. Roll `data` instead includes `blue_market_id`, `debt_assets`, `collateral_assets` and `incentive_assets`; do not describe a roll as seized `collateral`. Refetch current positions/config and `token` prices for remaining `debt`/`collateral` and USD.

**Math:** display `seized_assets` in `collateral` `units`, `repaid_units` and `bad_debt` in loan-`token` `units` with correct `decimals`; use event `amounts` for what happened, current position for what remains. Aggregate only within the selected event/transaction semantics; do not double-count a roll as a liquidation. Null prices leave `token` `amounts` visible.

**Action:** if remaining `collateral` is safe to withdraw, POST `/v0/actions/midnight/markets/{m}/withdraw-collateral`:

~~~json
{"account":"<wallet>","collateral_withdrawals":[{"collateral":{"address":"<remaining-token>"},"amount":{"unit":"all"}}]}
~~~

Only use `all` when no `debt` needs that `collateral`; otherwise choose `{"unit":"assets","value":"<verified-safe-amount>"}` and require simulation. Offer A4/A5 if `debt` remains.

**Acceptance:** a liquidated position shows a persistent banner with date, `collateral` seized, `debt` cleared and what remains, and offers to withdraw any remaining `collateral`. An empty event feed shows no liquidation, not invented event `data`. Keep transaction history available after the active position disappears.
