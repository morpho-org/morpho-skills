# UI integration principles

Apply these invariants to the functionality being integrated; they do not prescribe screens, navigation, labels or a product feature set.

## State and controls

- **Isolate identity before render.** Key or synchronously reset state by product, version, chain, market/vault and account; reject late responses. An effect that clears state after rendering can expose another product's schema or another user's balances.
- **Invalidate plans with their inputs.** Account/chain/product, amount, quote, guard and recipient changes invalidate prepared data and consent. A valid old response is not consent for a new intent.
- **Use one canonical value and clamp for linked controls.** Amounts, target ratios, numeric fields, sliders and maximum actions must resolve through the same unit-aware calculation and health/liquidity bounds. Independent setters produce contradictory executable amounts.
- **Preserve observed state separately from permitted edits.** A position already outside a new-action limit must remain truthfully displayed; clamping its opening value must not silently select a corrective transaction.
- **Preserve user intent during recomputation.** If a target is held constant while collateral changes, re-solve amounts against the new valuation and show actual rounded results. Input synchronization must not drift the target.
- **Keep asynchronous resources independent.** Distinguish loading, loaded-empty, known zero, missing and failed data per resource. One successful native-rate fetch cannot make failed rewards or an unknown combined metric complete.

## Numbers, metadata and previews

- **Resolve the token actually targeted.** Use the approval call target or the permit schema's token: domain verifying contract for token-local permits, explicit token for shared permit contracts. Use its own metadata, not the initiating asset's; shares and underlying assets can differ in symbol/decimals. Unknown metadata stays address/raw units, not guessed formatting.
- **Handle maximum allowance semantically.** Represent max uint as unlimited, without converting the raw integer through floating point; otherwise a valid approval becomes an overflow or misleading token amount.
- **Never round a nonzero amount to zero.** Keep sign, units and meaningful precision for spend, receipts, tiny repayments, capacity and penalties; provide exact values when abbreviated. A visually unchanged debt can conceal an actual wallet outflow.
- **Never turn unknown into zero.** Missing prices leave token quantities usable but USD unknown; undefined health is not safe health. Zero is a known accounting value, not a fallback.
- **Preview the verified simulation.** Apply position deltas to the matching indexed baseline and use signed wallet deltas. Input-derived guesses and complete-snapshot assumptions can omit fees, penalties or returned positions.
- **Use consistent rate windows and provenance.** Match native averages and filtered reward buckets, identify APR versus APY and separate cumulative earnings from rates. Mixed windows and fee/reward double counting imply returns unsupported by the data.
- **Preserve accounting scope.** Keep campaign, token, chain and recipient identity through earnings and claims; aggregate only compatible quantities. A proof-bound cumulative amount is not an interchangeable display subtotal.

## Consent and asynchronous outcomes

- **Review before prompting and after material changes.** Explain known signatures, final ordered calls when available, actual spend/receipt, approvals, fees and protection limits. Pending final calls must not masquerade as a reviewed executable plan.
- **Treat alternative plans as new decisions.** Different funding, penalty, liquidity, repayment mode, guards, received positions or recipients require explicit consent. A recovery path must not silently change what the user buys, owes or receives.
- **Represent expiry as a state transition.** Disable signing when remaining validity is insufficient, discard continuation and require fresh preparation/review. A timer label alone does not prevent expired signing.
- **Reconcile beyond the receipt.** Keep transaction success distinct from indexed convergence and inspect residual balances. Positions, wallet assets and reward claims can update at different times.
- **Separate accrued rights from active balances.** Zero assets/debt does not imply no historical performance or outstanding rewards. Hiding a zero active row must not erase independent claim/history access.
- **Use events for events.** Preserve actual timestamps and units; mark snapshot-based inferences and unknown accounting explicitly. Synthetic dates or drops in collateral do not establish liquidation.
- **Make monitoring guarantees match deployment.** Open-browser polling is not closed-browser delivery; backend workers need durable deduplication and delivery evidence. Notifications inform but never authorize transactions.

## Testing these invariants

Use API-shaped fixtures through real parsers, calculation paths and state machines rather than injecting final UI constants. Exercise normal, empty and error responses, nullable successful responses, rounding boundaries, delayed/out-of-order replies, identity switches, expiry and receipt-to-index lag. This tests integration behavior rather than a separate fixture-only implementation.

A failed-simulation fixture must contain the actual wrapped failure status and simulation failure shape, not merely a generic disabled button. Capture requests and verify zero wallet prompts/sends on blocked paths. Test valid continuation, invalid proof/domain, signature rejection, stale quotes and partial-call failure at the wallet boundary.

Synthetic modes must be clearly identified and unable to sign or send. Use controlled clocks and notification sinks for timing/delivery. A non-signing fixture can validate calculation, rendering and request construction, not real cryptography, funded execution or indexing convergence; report those limits.
