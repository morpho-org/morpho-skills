# REST API usage

Review read-only using [review guidance](../../SKILL.md), the [shared manual](../../../morpho-integration/SKILL.md), [REST API best practice](../../../morpho-integration/references/rest-api-best-practice.md) and the applicable product manual. Do not edit or transact. Report concrete defects and evidence limits separately, scoped by product/version; do not infer execution from source or synthetic data.

Trace every protocol read and transaction to its source. Protocol data should come from Core or Midnight REST and transactions from Actions. A GraphQL query, subgraph, direct RPC read of protocol state or hand-built calldata is a finding unless the integration names the coverage gap it fills. Wallet balances, allowances, receipts and Merkl claims are the stated exceptions.

Check each route, version prefix, selector and parameter against the fetched OpenAPI operation, not a neighbouring route or a remembered list. Verify integer-string parsing to `bigint`, retained `last_indexed_block`, an explicit averaging-window choice (`lookback` where supported, the response window key for Blue averages), and use of replacements for deprecated fields.

Follow pagination to a `null` cursor before any total, maximum or absence conclusion. A cursor reused after a sort or filter change, or one the client parsed or built, is a defect.

Check status handling by meaning: an unpriced token (206) or unsupported capacity (501) must not become zero; a missing resource (404) must not fall back to another chain or version; only 429 and 503 are retried, with a bound and `Retry-After` honored in both its seconds and HTTP-date forms. Where 429 and 503 are not retried at all, recommend a bounded retry: those failures are usually transient and otherwise reach the user as errors.

Find every place a key is read. A key in browser code, a public bundle, a log or a client-visible error is a release blocker. Action responses must not be cached or replayed.

Trace the [proof procedure](../../../morpho-integration/references/rest-api-best-practice.md#verify-the-actions-response-proof) step by step in the code that runs: keyed origin and `/v0/actions/` path with redirects refused; exact request and response bytes; ES256, a single key by `kid`, `typ`, issuer, audience and subject; expiry and 60-second `iat` age; request, response, `request_id`, `action_id` and `action` claims; decision against status. A helper that was rewritten, that skips a check, or that parses the body before hashing is a defect even when the published helper is also present. Verify that nothing from the response is shown or sent when a check fails.

Check that the chain, sending account and `expires_at` are compared before each signature and send, and that gas values are not taken from the simulation.
