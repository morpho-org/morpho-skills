# Position risk and safety

Review read-only using [review guidance](../review.md), the [shared manual](../../SKILL.md), [UI principles](../ui-principles.md), the [handbook](../handbook.md) and the applicable product manual. Do not edit or transact. Report concrete defects and evidence limits separately, scoped by product/version; do not infer execution from source or synthetic data.

Check the handbook's [position risk and safety](../handbook.md#position-risk-and-safety) guidelines: risk shown before and during input, LTV never without LLTV, warnings before the action, liquidation and maturity stated plainly.

Inspect loading, empty, null, error, expired and unsupported states independently. Unknown amounts/health cannot become zero/safe; nonzero values cannot disappear through rounding.

Safety-relevant information must remain readable on narrow layouts. Controls must share canonical amounts and bounds; existing unsafe state remains truthful rather than silently selecting a corrective transaction.

Blue adds variable debt accrual and liquidation/LLTV risk. Midnight adds maturity, bid/ask fill, offer liquidity, settlement/continuous fees and pre/post-maturity liquidation. Fixed rate is not guaranteed fill or exit.

Explain preparation-only penalty caps, full-force's lack of on-chain deadline, and market versus direct face-value repayment. Force/in-kind penalties and returned illiquid positions require separate consent. Ordinary withdrawal preparation slippage is not an on-chain execution-price guarantee.

A default target or health band is the integrator's policy and must be labelled as such; an invented Actions health buffer is a defect.

Monitoring notifications, if offered, must identify the affected position and a relevant management destination; a link alone is not evidence of backend delivery. Alerts never transact.
