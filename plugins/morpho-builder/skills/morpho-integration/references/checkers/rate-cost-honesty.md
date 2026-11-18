# Rate and cost honesty

Review read-only using [review guidance](../review.md), the [shared manual](../../SKILL.md), [UI principles](../ui-principles.md), the [handbook](../handbook.md) and the applicable product manual. Do not edit or transact. Report concrete defects and evidence limits separately, scoped by product/version; do not infer execution from source or synthetic data.

Check the handbook's [rate and cost honesty](../handbook.md#rate-and-cost-honesty) guidelines: fixed or variable label, component split with tokens named, and integrator fees shown separately.

Trace each rate to the selected OpenAPI operation/vendor contract and its averaging convention. Variable rates use realized averages; Midnight uses quote/effective fixed APR and maturity. Never substitute instantaneous or another-window data for a null chosen window.

Native and reward rates use one explicit window and the shared filtered/coverage-weighted convention, with vendor-guarantee and retention caveats. Verify pagination, timestamp deduplication, inclusive boundaries, untrusted buckets, percentage-to-fraction conversion and unavailable/all-excluded inputs.

Distinguish native yield/cost, reward APR, underlying-token yield where relevant and every fee without double counting or implying reward compounding. Restricted campaign eligibility is not inferred from past rewards.

Where accepted, referral fees require integer `bps` 1–200, a valid recipient, omission of zero and disclosure of token cost/gross versus net receipt. Verify the actual body and unchanged calls rather than a configuration variable alone.

Check every rendered rate for its fixed or variable label, APR or APY, and averaging window. Check that net worth and earned-to-date totals include priced rewards as their own component, or, when rewards are unknown, name what they leave out where known and are otherwise marked incomplete, and that rewards are not netted against position value or debt.

Combined metrics are unknown when a required component fails. Confirmed no campaign differs from failure and does not erase previously earned rewards.

Cumulative native earnings, campaign-scoped earned/pending/claimable rewards and non-annualized return remain distinct from the rate window. Use each token's decimals/USD price/distribution chain and preserve unknown components. Claims are separate from withdrawal and use a verified distribution chain/Distributor/recipient; unsupported reward layers are explicit, not silently batched.

Midnight fixed debt units differ from cash received; rate guards are per-second WAD, not annual APR. Unverified cost-basis interpretation cannot support an invented interest amount.
