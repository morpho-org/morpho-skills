# Intent-to-confirmation continuity

Review read-only using [review guidance](../review.md), the [shared manual](../../SKILL.md), [UI principles](../ui-principles.md) and the applicable product manual. Do not edit or transact. Report concrete defects and evidence limits separately, scoped by product/version; do not infer execution from source or synthetic data.

Trace an offered action from explicit intent through preparation, review, consent, wallet interaction and reconciliation. Loading/polling must not transact; pending state must prevent duplicate sends.

A signature-required plan may lack final calls. Verify honest pending-plan disclosure, per-signature consent and final call review after continuation. Changed amounts, quotes, guards, penalties, recipients or received positions require renewed consent.

Inspect expiry restart, signature rejection, stale quote, liquidity shortfall and partial-call failure as state transitions, not just rendered messages. Alternate actions must retain their own schema and protections.

Treat transaction receipts, indexed position state, wallet balances and rewards as separate reconciliation sources. Preserve independent accrued rights after a zero active balance; do not infer full closure while residual debt/shares remain.

Fixtures should traverse actual parsers and request construction without signing/sending. Synthetic proof bytes, placeholder calls or a disabled wallet cannot establish valid real claims or funded execution.
