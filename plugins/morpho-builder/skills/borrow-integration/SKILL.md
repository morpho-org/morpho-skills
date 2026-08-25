---
name: borrow-integration
description: Build or review Morpho borrowing integrations for Blue variable-rate markets, Midnight fixed-rate fixed-term markets, or both. Use for market discovery, collateralized borrow and repayment transactions, position risk, rates, liquidity, refinancing, Midnight quotes and maturities, UI copy, QA, and pre-launch review. Identify the product before loading implementation guidance.
---

# Borrow Integration — Blue and Midnight

Route every request to the product actually being integrated:

- **Blue:** variable-rate, open-ended borrowing against collateral in isolated Morpho Blue markets.
- **Midnight:** fixed-rate, fixed-term borrowing through the Base orderbook.
- **Both:** two distinct products. Load and apply both references, and keep their data, transaction flows, terminology, risks, and review verdicts separate.

If the product is not named, infer it from concrete evidence: utilization/IRM/market params imply Blue; books/bids/offers/units/maturity imply Midnight. If evidence supports neither and the choice changes the implementation, ask which product is intended.

Use the authoritative [Morpho documentation index](https://docs.morpho.org/llms.txt), [Morpho SDK documentation](https://docs.morpho.org/developers/sdks/morpho-sdk/), and [Core API reference](https://api.morpho.org/core/docs) for current signatures and schemas.

## Choose a mode

- **Build or update:** read [references/blue.md](references/blue.md) for Blue, [references/midnight.md](references/midnight.md) for Midnight, or both when both products are in scope.
- **Review, audit, QA, or pre-launch:** identify Blue, Midnight, or both, then read [references/review.md](references/review.md) completely. Review only unless the user explicitly asks for fixes.

## Shared build workflow

1. Establish chain, product, market identity, account, collateral and loan tokens, requested action, and whether the data is for discovery/analytics or transaction execution.
2. Use the Morpho API for indexed discovery and histories. Before a write, resolve fresh protocol entities through `@morpho-org/morpho-sdk` and, for Midnight execution, fetch a fresh quote plan from the Midnight API.
3. Use the primary SDK action flow: create the action, await and satisfy all `getRequirements()`, call `buildTx(...)`, simulate the final authorized transaction, submit, and wait for a receipt. Never hand-build a supported protocol, bundler, or router transaction.
4. Keep raw amounts as bigint token units, use token-specific decimals, and make slippage/deadline choices explicit. Re-fetch state and re-quote immediately before signing or submitting.
5. Surface post-action debt, collateral, rate/cost, health or maturity, liquidity constraints, fees, and the next maintenance action.

## Product invariants

- **Blue:** label rates variable. Accrue market and position data to a common fresh block; show LTV/LLTV/health and liquidation consequences; repay all debt by shares; use the SDK's atomic collateral+borrow, repay+withdraw, reallocation, and refinance flows where applicable.
- **Midnight:** Base only. Borrowers take the **bid** side (lenders' buy offers); a quote is an executable fallback window, not a promise of fill. Show fixed rate, price, maturity, units/debt at maturity, collateral health, fees, quote guard, and deadline. Early close depends on secondary liquidity.
- **Both:** never aggregate fixed and variable rates into one unlabeled figure or issue one combined acceptance verdict. Review Blue and Midnight independently even when they share UI components.

## Verification while building

Use the applicable checker prompt under [references/checkers/](references/checkers/) after the corresponding surface exists. For a mixed integration, instruct every checker to return separate Blue and Midnight sections. Run [math-correctness.md](references/checkers/math-correctness.md) for debt/share conversion, risk math, rates, quote guards, collateral requirements, maturity totals, and numeric formatting.

Do not claim a check passed without artifact evidence. If code, runtime state, API response, or a required screen is unavailable, report `UNVERIFIED` and name the missing evidence.
