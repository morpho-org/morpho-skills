# Exposure transparency

Review read-only using [review guidance](../../SKILL.md), the [shared manual](../../../morpho-integration/SKILL.md), [UI principles](../../../morpho-integration/references/ui-principles.md), the [handbook](../../../morpho-integration/references/handbook.md) and the applicable product manual. Do not edit or transact. Report concrete defects and evidence limits separately, scoped by product/version; do not infer execution from source or synthetic data.

Check the handbook's [exposure transparency](../../../morpho-integration/references/handbook.md#exposure-transparency) guidelines: vault or market identity, curator, collateral and allocation, liquidity, oracle and any warnings the API returns.

For functionality the integration offers, essential identity, units, source freshness, costs, protection limits and relevant risk information must be available when making the decision, not hidden behind an unrelated path.

Review actual layouts and alternate entry points, including narrow viewports, deep links, loading and errors. Data present in a response or source file does not establish that the user can read or act on it.

Trace each displayed identity to contract identity plus chain rather than a symbol. Curator, description and any warning or listing status come from the API response; do not accept invented or hard-coded values. An oracle shown by type alone is a defect.

Separate absent information from unknown information. Expose actionable failure/restart context without promising capacity or safety that has not been verified.

Earn risks include variable yield, curator/configuration/adapters, contracts, underlying markets/oracles, liquidity, fees and reward conditions.
