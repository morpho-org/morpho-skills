# Blue — variable rate, no `maturity`

Apply the shared Actions contract, conventions, UX, errors, and verification rules in [SKILL.md](../SKILL.md) to every story. All routes below are REST GETs unless explicitly POST; read response fields under `data`. Define m = `{chainId}:{marketId}`, u = wallet `address`, o = `{chainId}:{oracle_address}`, and s = `{chainId}:{tokenAddress}`. Replace placeholders with discovered values; JSON sketches show valid field shapes, not executable addresses or preselected user `amounts`.

Reference map: [market discovery](https://docs.morpho.org/api/blue/list-markets/), [config](https://docs.morpho.org/api/blue/get-market/), [state](https://docs.morpho.org/api/blue/get-market-state/), [liquidity](https://docs.morpho.org/api/blue/get-market-liquidity/), [average APY](https://docs.morpho.org/api/blue/get-market-apy-averages/), [position](https://docs.morpho.org/api/blue/user-market-position/), [performance](https://docs.morpho.org/api/blue/user-market-position-performance/), [position history](https://docs.morpho.org/api/blue/user-market-position-history/), [oracle](https://docs.morpho.org/api/oracles/get-oracle-state/), [`token`](https://docs.morpho.org/api/global/get-token/), [USD `price`](https://docs.morpho.org/api/global/get-token-price/), [Actions](https://api.morpho.org/actions/docs).

Use `collateral` C in `collateral` base `units`, loan `debt` D in loan base `units`, oracle P, `value` V = C × P / 1e36, and L = `lltv_wad` / 1e18. Keep rational/integer arithmetic until formatting. Oracle P is not a USD `price`.

## A1. Take a position

**Components:** `collateral` input with connected-wallet balance and Max; borrow input with Max; variable average rate; LTV before → after beside LLTV; liquidation `price`; available liquidity; review listing every signature and call.

**Reads:**

| Route | Fields / purpose |
| --- | --- |
| GET `/v0/blue/markets` (discovery), then `/v0/blue/markets/{m}` | `loan_token`, `collateral_token`, `oracle_address`, `irm_address`, `lltv_wad` |
| GET `/v0/blue/markets/{m}/state` | `total_borrow_assets`, `total_borrow_shares`, `total_supply_assets`, `total_supply_shares`; indexed block |
| GET `/v0/blue/markets/{m}/liquidity` | `market_liquidity` + `reallocatable_liquidity`; `borrow_amount_to_target_utilization` is a separate target-utilization bound |
| GET `/v0/blue/markets/{m}/apy-averages` | `borrow_apy_averages[rateWindow]`, default "6h" |
| GET `/v0/blue/markets/{m}/users/{u}/position` | `collateral_assets`, `borrow_shares`, `supply_shares`; existing position or zeros |
| GET `/v0/oracles/{o}/state` | `price`, `last_indexed_block` |
| GET `/v0/tokens/{s}` and `/v0/tokens/{s}/price` for both `tokens` | `symbol`, `decimals`, `logo_uri`; nullable USD `price` |

**Math:** derive D with the shared ceiling `shares`→`assets` formula. V = C × P / 1e36; LTV = D / V; theoretical max `debt` = V × L. Available loan `assets` = `market_liquidity` + `reallocatable_liquidity`, subject to Actions simulation and health constraints. Keep Max below LLTV using the shared **open** safety buffer; do not invent a number. Liquidation `price` = D / (C × L) in raw loan `units` per raw `collateral` `unit`; multiply by 10^(collateralDecimals−loanDecimals) for loan `tokens` per whole `collateral` `token`. USD values use `token` `price`, not oracle.

**Action:** POST `/v0/actions/blue/markets/{m}/borrow`. Supply `collateral` and borrow atomically, including shared-liquidity reallocation when needed:

~~~json
{
  "account": "<wallet>",
  "amount": {"unit": "assets", "value": "<gross-loan-base-units>"},
  "collateral_amount": {"unit": "assets", "value": "<collateral-base-units>"},
  "funding": {"type": "erc20"},
  "signature_mode": "auto"
}
~~~

Omit `collateral_amount` and `funding` together for borrow-only against existing `collateral`. Choose the shared `native`/`auto` `funding` object for wrapped-`native` `collateral` when requested; never submit a zero `collateral` `amount`. Optional attribution, expiry, and supported referral fee follow SKILL.md. Fees reduce received `assets`; show gross `debt` and net wallet receipt separately. Prepare, proof-check, preview, sign/continue, and send only under the shared contract.

**Acceptance:** preview numbers match `simulation.position_changes` applied as deltas; the Max button must not claim a reject-free `amount` until the Actions health buffer is verified (open); block `amounts` above known available liquidity before POST, then require successful simulation before sending. Report unavailable Max-buffer evidence `UNVERIFIED` rather than inventing it.

## A1b. Borrow by target LTV (slider)

**Components:** slider from 0% to max LTV, health-colored track, visible but unreachable LLTV tick; numeric LTV input; borrow `token`/USD input in two-way sync; live liquidation `price`, `price` drop to liquidation, and "variable, 6h avg" (or chosen window); short warning in warning/danger bands. Existing positions start at current LTV. Right means Borrow; left means Repay, with matching button label.

**Reads:** `all` A1 routes and fields. Recompute from current indexed `collateral`/`debt` and added `collateral`; do not fetch on every animation tick.

**Math:** V = (current C + added C) × P / 1e36. Rightward borrow `assets` = max(0, floor(t × V − D)); inverse t = (D + `assets`) / V. Round down to whole loan-`token` base `units`, not floating-point `decimals`. Leftward repay `assets` = max(0, D − t × V), rounded conservatively; preview the actual resulting `debt`. Price drop to liquidation = 1 − LTV / L. Slider max = min(L − safety buffer, (D + available loan `assets`) / V), with available = `market_liquidity` + `reallocatable_liquidity`. The numeric safety buffer remains open; do not set the LLTV tick as the maximum.

**Action:** for rightward moves POST `/v0/actions/blue/markets/{m}/borrow`:

~~~json
{"account":"<wallet>","amount":{"unit":"assets","value":"<computed-loan-assets>"},"signature_mode":"auto"}
~~~

Add the A1 `collateral_amount`/`funding` pair when adding `collateral` simultaneously. For leftward moves POST `/v0/actions/blue/markets/{m}/repay`:

~~~json
{"account":"<wallet>","amount":{"unit":"assets","value":"<computed-repay-assets>"},"funding":{"type":"erc20"},"signature_mode":"auto"}
~~~

At zero `debt` target use the A5 `all`-`debt` action, not an estimated dust-producing `assets` `amount`. Never POST a zero-`value` intent.

**Acceptance:** slider, LTV input and `amount` always agree; the thumb cannot pass the max, and when liquidity is what limits it, the slider stops there with "Only {x} available to borrow now"; the previewed LTV matches the LTV implied by `simulation.position_changes` to within 0.1 pp; changing the `collateral` `amount` re-solves the borrow at the same target LTV. Keep safe-Max evidence explicitly open until verified.

## A2. Show the position

**Components:** `collateral` and `debt` `token`/USD balances, interest owed, variable average rate, LTV/LLTV, health factor, liquidation `price`; no `maturity` countdown.

**Reads and Math:**

| Field on screen | Exact source | Math / presentation |
| --- | --- | --- |
| Collateral (`token`, USD) | GET `/v0/blue/markets/{m}/users/{u}/position` → `collateral_assets`; GET `/v0/tokens/{collateral-selector}/price` | raw / 10^`decimals` × USD `price` |
| Debt now | same position → `borrow_shares`; GET `/v0/blue/markets/{m}/state` | ceiling shared `debt` formula; USD via loan-`token` `price` |
| Interest owed | GET `/v0/blue/markets/{m}/users/{u}/position/performance` → `borrow_net_cost_assets` | average-cost realized + unrealized borrow cost; do not replace with balance minus deposits |
| Borrow rate | GET `/v0/blue/markets/{m}/apy-averages` → `borrow_apy_averages[rateWindow]` | default "variable, 6h avg"; never instant rate |
| LTV | position, GET `/v0/oracles/{o}/state` → `price` | D / V |
| LLTV | GET `/v0/blue/markets/{m}` → `lltv_wad` | divide by 1e18 |
| Health factor | same `collateral`, `debt`, oracle and LLTV | V × L / D |
| Liquidation `price` | same inputs | D / (C × L), decimal-adjusted loan `tokens` per `collateral` `token` |
| Maturity | `none` | n/a |

Get `decimals` from GET `/v0/tokens/{s}`. A missing `value` must not become zero. Label negative cost values as returned rather than clamping to zero.

**Action:** display alone sends no POST. Route explicit Borrow/Add `collateral`/Repay/Exit clicks to A1/A4/A5, never `auto`-transact while polling. For a selected partial repay, POST `/v0/actions/blue/markets/{m}/repay`:

~~~json
{"account":"<wallet>","amount":{"unit":"assets","value":"<user-selected-assets>"},"funding":{"type":"erc20"},"signature_mode":"auto"}
~~~

**Acceptance:** a position with no `debt` shows "No `debt`" (not health ∞); a null oracle or `token` `price` shows "—" and disables actions that need it.

## A3. Monitor the position

**Components:** health `status`/buffer, `price`-drop-to-liquidation, band-change alerts linked directly to A4; open-screen polling plus backend push alerts.

**Reads:** A2 config/state/position/oracle/`price`/APY routes, every 30–60 s while open. Blue has no documented market-wide borrower list; store the integration's user/market IDs and query each GET `/v0/blue/markets/{m}/users/{u}/position`. Use `last_indexed_block` where present and never interpret stale polling as a fresh chain snapshot.

**Math:** buffer = L − LTV in percentage points; `price` drop to liquidation = 1 − LTV / L. Apply proposed/design-unconfirmed health bands from SKILL.md. No `debt` ⇒ no liquidation alert; unknown oracle ⇒ unknown health, not healthy.

**Action:** monitoring is read-only. Link the alert to A4; after user consent an add-`collateral` action is POST `/v0/actions/blue/markets/{m}/supply-collateral`:

~~~json
{"account":"<wallet>","amount":{"unit":"assets","value":"<selected-collateral-assets>"},"funding":{"type":"erc20"},"signature_mode":"auto"}
~~~

**Acceptance:** an alert fires when the band changes, never more than once per band change, and links straight to A4 (Keep it healthy).

## A4. Keep it healthy

**Components:** Add `collateral` and Repay side by side; "to reach LTV X%" `amount` helper; LTV and liquidation `price` before → after; wallet balance and `funding` cost.

**Reads:** A2 position/config/state/oracle and both `token` metadata/`price` routes; liquidity when offering additional borrow or `collateral` withdrawal. Refetch before preparing each action.

**Math:** `collateral` needed for target t = max(0, D / (t × (P / 1e36)) − C), rounded **up** in `collateral` base `units`; repay needed = max(0, D − t × V), rounded **up** in loan base `units`. Do not divide by t=0: use full repay. Reject invalid targets or missing `price`; simulate the actual rounded result.

**Action:** POST `/v0/actions/blue/markets/{m}/supply-collateral`:

~~~json
{"account":"<wallet>","amount":{"unit":"assets","value":"<collateral-assets>"},"funding":{"type":"erc20"},"signature_mode":"auto"}
~~~

Or POST `/v0/actions/blue/markets/{m}/repay`:

~~~json
{"account":"<wallet>","amount":{"unit":"assets","value":"<loan-assets>"},"funding":{"type":"erc20"},"signature_mode":"auto"}
~~~

Use `native`/`auto` `funding` only with the required `max_native_assets` object. If a computed partial repay exceeds fresh `debt`, offer A5 `all` instead.

**Acceptance:** after confirmation the screen refreshes and the band clears without a manual reload. Preserve `pending` state until indexed `data` reconciles; if the chosen `amount` does not reach the target, explain rather than falsely clearing the band.

## A5. Exit the position

**Components:** partial/full repay, `collateral` release `amount`, max wallet spend, before/after `debt` and `collateral`, `signatures`/`calls` review, `pending`/confirmed state.

**Reads:** `debt` from A2; GET `/v0/blue/markets/{m}/users/{u}/position` → `collateral_assets`; market `/state`, oracle `/state` and `token` prices. Full repay does not depend on secondary-market liquidity.

**Math:** estimate D with upward share conversion for display; use `all` rather than an estimated `assets` `amount` for full repayment. Read `max_repay_assets` from the `prepared` response: maximum wallet outflow including accrued interest and supported referral fee. Exact `collateral` withdrawal `amount` is the current raw `collateral` balance for a full exit, subject to simulation.

**Action:** POST `/v0/actions/blue/markets/{m}/repay`:

~~~json
{
  "account":"<wallet>",
  "amount":{"unit":"all"},
  "collateral_amount":{"unit":"assets","value":"<current-collateral-assets>"},
  "funding":{"type":"erc20"},
  "signature_mode":"auto"
}
~~~

Omit `collateral_amount` if no `collateral` or not withdrawing it. `max_repay_assets` is **not** an input. Partial repay supports `assets` or `shares`; use `all` to avoid `debt` dust. Repay plus exact `collateral` withdrawal is atomic within the action.

For a `debt`-free position with remaining `collateral`, POST `/v0/actions/blue/markets/{m}/withdraw-collateral`:

~~~json
{"account":"<wallet>","amount":{"unit":"assets","value":"<remaining-collateral-assets>"},"signature_mode":"auto"}
~~~

Do not invent a `collateral` `unit`: `all` variant.

**Acceptance:** after a full exit, hide the zero-`debt`/zero-`collateral` position from the active list even if an indexed row remains; the `collateral` appears in the wallet balance. Keep `pending` until the position and wallet reconcile; no full-exit `success` while `debt` dust remains.

## A6. Liquidated

**Components:** persistent liquidation banner with date, `collateral` seized, `debt` cleared and what remains; offer withdrawal of remaining `collateral`.

**Reads:** GET `/v0/blue/markets/{m}/users/{u}/position/history` → `collateral_assets`, `borrow_shares` and timestamps; current `/position` and `/state`; oracle and `token` prices from A2. **Open API gap:** no Blue REST user liquidation event feed is documented. Interim: compare history for a `collateral` drop with no user withdrawal in the integration's known action/receipt history. This is a signal, not proof: external wallet activity or coarse history can look identical. Do not fabricate exact liquidation date or `amounts` from snapshots.

**Math:** history `collateral`/`debt` differences are estimates, not event accounting. Current remaining `collateral` = `position.collateral_assets`; current `debt` follows A2. Mark missing event date/seized/cleared values unknown and the liquidation explanation `UNVERIFIED` until event evidence exists.

**Action:** only after explicit user choice and successful simulation, withdraw available `debt`-free `collateral` via POST `/v0/actions/blue/markets/{m}/withdraw-collateral`:

~~~json
{"account":"<wallet>","amount":{"unit":"assets","value":"<remaining-collateral-assets>"},"signature_mode":"auto"}
~~~

If `debt` remains, use A4/A5 or a verified safe partial withdrawal; never presume `all` `collateral` is withdrawable.

**Acceptance:** a verified liquidated position shows a persistent banner with date, `collateral` seized, `debt` cleared and what remains, and offers to withdraw any remaining `collateral`. With only the interim signal, show a possible-liquidation notice and unknown event details; report the exact-event acceptance `UNVERIFIED` (API gap).
