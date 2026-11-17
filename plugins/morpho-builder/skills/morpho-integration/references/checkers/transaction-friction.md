# Transaction friction

Review read-only using [review guidance](../review.md), the [shared manual](../../SKILL.md), [UI principles](../ui-principles.md), the [handbook](../handbook.md) and the applicable product manual. Do not edit or transact. Report concrete defects and evidence limits separately, scoped by product/version; do not infer execution from source or synthetic data.

Check the handbook's [transaction friction](../handbook.md#transaction-friction) guidelines: fewest signatures the protocol and wallet permit, live preview, amount entry, one primary action and a fixed recap order. Fewer steps must not remove review, verification or consent.

Trace an offered action from explicit intent through preparation, review, consent, wallet interaction and reconciliation. Loading/polling must not transact; pending state must prevent duplicate sends.

Trace identity and asynchronous state: product/chain/account transitions must not render stale schemas or balances; reject late replies and invalidate old plans/consent.

Disclose actual account/chain, assets/units, approvals, calls when available, gas, fees, recipient, deadlines and protection limits before prompting. A signature-required plan may lack final calls. Verify honest pending-plan disclosure, per-signature consent and final call review after continuation. Changed amounts, quotes, guards, penalties, recipients or received positions require renewed consent.

Inspect expiry restart, signature rejection, stale quote, liquidity shortfall and partial-call failure as state transitions, not just rendered messages. Alternate actions must retain their own schema and protections.

Failed proof/simulation, rejected signatures and expired plans send nothing. Retry only bounded 429/503 service failures, never wallet transactions. Preserve inputs; do not silently weaken guards or change funding/action/recipient. Raw failures belong in details with safe recovery and request IDs.

Treat transaction receipts, indexed position state, wallet balances and rewards as separate reconciliation sources. Successful confirmation is not evidence that indexed state converged, and earlier approvals can persist after a later call fails. Do not infer full closure while residual debt/shares remain.

Fixtures should traverse actual parsers and request construction without signing/sending. Synthetic proof bytes, placeholder calls or a disabled wallet cannot establish valid real claims or funded execution.
