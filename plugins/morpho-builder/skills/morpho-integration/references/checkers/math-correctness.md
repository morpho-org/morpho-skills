# Units, calculations and transaction integrity

Review read-only using [review guidance](../review.md), the [shared manual](../../SKILL.md), [UI principles](../ui-principles.md) and the applicable product manual. Do not edit or transact. Report concrete defects and evidence limits separately, scoped by product/version; do not infer execution from source or synthetic data.

Trace each expression's source, identity, unit, scale, sign and rounding through parsing, preview and wallet payload. Inspect floating-point coercion, early formatting, bigint division and assumed decimals in context; display-only formatting is not itself execution arithmetic.

Use [Vault](../vault-v2.md), [Blue](../blue.md) or [Midnight](../midnight.md) valuation semantics, never a borrowed product's share/debt formula. Verify undefined denominators, nullable successful responses, nonzero tiny amounts and actual permit/approval token metadata. Maximum allowance is unlimited, not an overflowing token amount.

Linked controls share one canonical target and clamp; distinguish observed current state from feasible new actions. Conservative rounding must agree with the simulation, including fees, penalties, gross debt and net wallet receipt.

Trace initial schema/attribution → proof-before-exposure → account/domain/expiry checks → bounded signature continuation → successful simulation → final review → unchanged ordered calls → receipt and indexed reconciliation. The shared manual owns these rules; this prompt does not redefine the contract.

Check claims separately: proof-bound cumulative token amounts, aligned arrays, chain/Distributor/recipient, supported distribution layer and simulation. A display subtotal cannot replace a Merkle leaf amount.

Use normal, empty and error data with real response shapes and numeric boundaries. Record missing evidence for health buffers, event accounting, Midnight interest or vendor rate guarantees; invented constants are not a remedy.
