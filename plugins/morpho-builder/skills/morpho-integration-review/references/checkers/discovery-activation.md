# Discovery and activation

Review read-only using [review guidance](../../SKILL.md), the [shared manual](../../../morpho-integration/SKILL.md), [UI principles](../../../morpho-integration/references/ui-principles.md), the [handbook](../../../morpho-integration/references/handbook.md) and the applicable product manual. Do not edit or transact. Report concrete defects and evidence limits separately, scoped by product/version; do not infer execution from source or synthetic data.

Check the handbook's [discovery and activation](../../../morpho-integration/references/handbook.md#discovery-and-activation) guidelines for the entry points, prompts and position views the integration offers. These are growth recommendations; report gaps as usability findings, not release blockers.

Follow each prompt or entry point to its destination. An eligible-asset or idle-balance prompt without an action in the component, or one that leads to a different product or a stale selection, loses the intent.

Verify that positions appear with the user's other balances and before new opportunities when they exist, and that an empty state is a known empty result rather than a failed or pending read.

Keep accrued rewards and historical information independent of active-position visibility. Hiding a zero active row must not remove claim or history access.

Benefit statements must stay accurate: withdrawals are subject to available liquidity, only native yield accrues in the vault, and noncustodial does not mean risk-free.
