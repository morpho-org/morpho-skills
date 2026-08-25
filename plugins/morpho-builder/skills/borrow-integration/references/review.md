# Full Borrow integration review

Use this workflow for an audit, QA pass, pre-launch check, or full review of Morpho borrowing. It is **review-only**: do not edit code, copy, configuration, or external state unless the user separately asks for fixes.

## 1. Identify product scope

Classify the artifacts before reviewing:

- **Blue:** market params/ID, utilization or IRM, variable rates, borrow shares, LLTV-based open-ended position.
- **Midnight:** Base chain, books/bids/asks/offers, units, fixed rate, deadline, and maturity.
- **Both:** evidence of both products. Keep all later verdicts and findings separated by product, even for shared components.

Read [blue.md](blue.md) for Blue and [midnight.md](midnight.md) for Midnight. If the artifacts cannot establish the product, stop the acceptance verdict at `UNVERIFIED` and state what is needed.

## Verdict semantics

- `PASS`: direct evidence demonstrates the criterion across every applicable supplied surface and state.
- `FAIL`: direct evidence demonstrates a defect; cite the exact location or reproduction.
- `UNVERIFIED`: required code, state, screen, or runtime evidence is missing; name it.
- `N-A`: the criterion genuinely does not apply; explain why.

Any critical failure makes that **product's** verdict `FAIL`. Otherwise any non-optional `UNVERIFIED` makes that product `UNVERIFIED`. A mixed app has two top-level verdicts; never collapse them into one PASS.

## 2. Establish evidence

Inventory:

- product routes/screens and copy for discovery, market detail, collateral/amount input, review, confirmation, dashboard, maintenance, and close/exit;
- API clients, GraphQL documents, quote calls, cache/retry/freshness paths, and onchain fallbacks;
- SDK setup, entities, action builders, requirement dispatch, simulation, submission, and receipt reconciliation;
- debt/share/rate/health/price/unit/fee/maturity calculations;
- tests and runtime evidence for stale state, no liquidity, partial fill, maturity, and transaction failures.

Tag each artifact Blue, Midnight, or shared. Shared evidence may be cited in both reviews, but it receives separate applicability and verdict judgments.

## 3. Run the eight checkers

When delegation is available, run one read-only worker per checker **in parallel**. Give each worker the artifact inventory and scope (`Blue`, `Midnight`, or `Blue and Midnight`). It must read its prompt fully, make no edits, and return separate Blue and Midnight tables when both are present.

1. [vocabulary-compliance.md](checkers/vocabulary-compliance.md)
2. [attribution-compliance.md](checkers/attribution-compliance.md)
3. [disclosure-compliance.md](checkers/disclosure-compliance.md)
4. [rate-transparency-compliance.md](checkers/rate-transparency-compliance.md)
5. [conversion-compliance.md](checkers/conversion-compliance.md)
6. [clarity-safety-compliance.md](checkers/clarity-safety-compliance.md)
7. [discoverability-compliance.md](checkers/discoverability-compliance.md)
8. [math-correctness.md](checkers/math-correctness.md)

If workers are unavailable, run the prompts sequentially. Never let a Blue result supply a Midnight verdict or vice versa. Downgrade unsupported `PASS`/`FAIL` claims to `UNVERIFIED` until evidence is checked.

## 4. Blue acceptance matrix

Evaluate when Blue is in scope.

| ID | Priority | Blue acceptance criterion |
| --- | --- | --- |
| BLU-01 | Critical | Chain + exact five-field market params/ID are verified; pair symbols cannot select the market. |
| BLU-02 | Critical | Fresh same-block accrued market and position entities drive debt, rate, liquidity, and health before every write. |
| BLU-03 | Critical | Supported writes use `@morpho-org/morpho-sdk`, complete `getRequirements()`, `buildTx`, final simulation, receipt wait, and fresh reconciliation. |
| BLU-04 | Critical | Open uses supported collateral+borrow ordering (atomic when intended) and previews post-action variable rate, debt, LTV/LLTV, health, liquidation price, and liquidity. |
| BLU-05 | Critical | Full repay and full refinance use borrow shares and verify zero residual borrow shares; partial repay is clearly distinct. |
| BLU-06 | Critical | Repay+withdraw and collateral-only withdrawal use fresh position health and supported SDK actions; unsafe withdrawals are blocked/warned. |
| BLU-07 | Critical | Variable rate, reward APRs, protocol fees, reallocation fee, and integrator fees are distinct; no fixed-rate or guaranteed language. |
| BLU-08 | Critical | Liquidation, oracle, collateral-price, variable-rate, market-liquidity, and smart-contract risks are visible and covered by an unavoidable first-use disclosure. |
| BLU-09 | Critical | Raw token/share/oracle/rate/risk values use bigint, token decimals, current accrual, and protocol-consistent rounding; supported transactions are not hand-built. |
| BLU-10 | Recommended | Discovery exposes exact market identity, LLTV, oracle/IRM, utilization, available liquidity, warnings, history, and rewards—not rate alone. |
| BLU-11 | Recommended | Public Allocator reallocation uses SDK planning, discloses source/amount/native fee, and refreshes/simulates ephemeral availability. |
| BLU-12 | Recommended | Refinance compares source/target market params, rate, LLTV, oracle, liquidity, rewards, fees, and post-state, with explicit consent. |
| BLU-13 | Recommended | API usage paginates, caches by purpose, honors `429`/`Retry-After`, monitors deprecations, checks freshness, and falls back onchain for critical paths. |
| BLU-14 | Recommended | Position maintenance and attribution remain discoverable through pending, failure, confirmation, and refreshed portfolio states. |

## 5. Midnight acceptance matrix

Evaluate when Midnight is in scope.

| ID | Priority | Midnight acceptance criterion |
| --- | --- | --- |
| MID-01 | Critical | Midnight is restricted to Base (8453); market ID, collateral config/index, account, and maturity are verified. |
| MID-02 | Critical | Borrow quote uses `/bids/quote`, one target dimension, one explicit price guard, and binds side/market/amount/guard to the action. |
| MID-03 | Critical | Fallback excess is passed in order to the target-aware SDK bundle; the app does not execute all returned caps or promise a fill. |
| MID-04 | Critical | Quote requests are race-safe, refreshed on input changes and before signing, use a finite deadline, and never silently widen guard/deadline/max units. |
| MID-05 | Critical | New open uses supported atomic collateral+borrow when intended, resolves all requirements, builds through `@morpho-org/morpho-sdk`, and simulates exact final state. |
| MID-06 | Critical | Review shows fixed rate and price, debt units/assets at maturity, settlement/continuous/integrator fees, collateral capacity/health, and liquidation consequence. |
| MID-07 | Critical | Position accrues to a fresh common block; maturity has explicit pre/at/post states, repayment remains available, and overdue liquidation is stated. |
| MID-08 | Critical | Early close uses fresh ask-side secondary liquidity, clearly permits partial/no fill, shows realized cost/residual debt, and does not promise exit. |
| MID-09 | Critical | `400`/`404`/`422`/`429`/`503`, malformed response, stale quote, and simulation failure fail safely without side-switching or fabricated quotes. |
| MID-10 | Critical | Raw token/unit/price/rate/fee/time values use bigint and protocol rounding; no floating tick math or hand-built supported bundle. |
| MID-11 | Critical | First-use disclosure covers fixed-term, maturity, orderbook/fill, secondary-liquidity, fee, oracle, collateral, liquidation, and contract risks. |
| MID-12 | Recommended | Discovery shows markets/books by Base, loan token, maturity, collateral, bid depth, fixed rate/price, fees, and warnings. |
| MID-13 | Recommended | Cursor pagination, purpose-specific caching, `Retry-After`, indexed-block freshness, and onchain maintenance fallback are implemented. |
| MID-14 | Recommended | Position, countdown/matured state, repay/add collateral/early-close routes, attribution, and receipt reconciliation remain discoverable. |

For every applicable row record `PASS`, `FAIL`, `UNVERIFIED`, or `N-A`, evidence, impact, and the smallest viable fix. Maintain two tables for mixed apps.

## 6. Red-flag pass

### Blue red flags

- Unaccrued indexed debt/health is used to build or approve a write.
- Pair symbols select a market without verifying oracle, IRM, and LLTV.
- Full close repays an asset snapshot and leaves shares/dust.
- A supported action, reallocation, or refinance is assembled manually.
- Variable rate is labeled fixed, guaranteed, or blended with rewards/integrator fees.
- Health/liquidation appears only after confirmation.

### Midnight red flags

- A borrow takes asks instead of bids, or runs off Base.
- A quote is hardcoded, cached as executable, presented as guaranteed, or all fallback caps are submitted independently.
- Amount changes do not cancel/refetch the quote; final build has no finite deadline or price/unit guard.
- Matured UI shows a negative countdown or hides repayment/liquidation consequence.
- Early close is promised without ask-side liquidity.
- A `422`, `429`, or `503` automatically widens slippage, raises max units, changes side, or reuses an expired plan.

### Shared red flags

- Supported transaction calldata is hand-built; `buildTx` precedes requirements; no final simulation occurs.
- Raw protocol quantities use floating-point arithmetic.
- Attribution/disclosure is bypassable or implies Morpho is lender, counterparty, guarantor, or risk assessor.
- Secrets, signatures, private keys, API keys, or unnecessary wallet data appear in evidence/logs.

A confirmed red flag is a critical `FAIL` for the affected product. Missing relevant evidence is `UNVERIFIED`, not `PASS`.

## 7. Final report

Return:

1. **Scope classification and evidence limitations.**
2. **Product verdicts:** Blue and/or Midnight separately, with critical/recommended counts.
3. **Critical findings by product,** ordered by user-loss/compliance risk.
4. **Recommended findings by product.**
5. **Acceptance matrices:** full Blue and/or Midnight table.
6. **Checker summary:** eight lines per applicable product; retain conflicts and unverified claims.
7. **Red flags by product.**
8. **Release recommendation per product** and minimum retest set. For a mixed app, say whether one product can ship independently of the other.

Do not implement fixes in review mode. If fixes are later requested, keep this report as baseline and rerun affected rows plus every prior critical failure for each product.
