# Clarity and safety

Review read-only using [review guidance](../review.md), the [shared manual](../../SKILL.md), [UI principles](../ui-principles.md) and the applicable product manual. Do not edit or transact. Report concrete defects and evidence limits separately, scoped by product/version; do not infer execution from source or synthetic data.

Trace identity and asynchronous state: product/chain/account transitions must not render stale schemas or balances; reject late replies and invalidate old plans/consent.

Inspect loading, empty, null, error, expired and unsupported states independently. Unknown amounts/health cannot become zero/safe; nonzero values cannot disappear through rounding. Raw failures belong in details with safe recovery and request IDs.

Safety-relevant information must remain readable on narrow layouts. Controls must share canonical amounts and bounds; existing unsafe state remains truthful rather than silently selecting a corrective transaction.

Failed proof/simulation, rejected signatures and expired plans send nothing. Retry only bounded 429/503 service failures, never wallet transactions. Preserve inputs; do not silently weaken guards or change funding/action/recipient.

Check partial submission and receipt-to-index lag. Successful confirmation is not evidence that indexed state converged, and earlier approvals can persist after a later call fails.
