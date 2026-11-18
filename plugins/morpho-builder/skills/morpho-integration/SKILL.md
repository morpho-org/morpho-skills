---
name: morpho-integration
description: Build or review correct Morpho integrations using REST reads, Actions transactions and Merkl rewards. Covers Earn through Vault V2 with Vault V1 compatibility, Blue variable-rate borrowing and Midnight fixed-rate, fixed-maturity borrowing; protocol units, transaction verification, accounting, state management, and product guidelines for language, attribution, disclosure, transparency and risk.
---

# Morpho integration manual

## Always

- Keep Actions and Merkl credentials server-side ([keys](#data-use-the-published-contracts)).
- Prepare every protocol transaction through Actions, never hand-built calldata; Merkl claims are excepted ([claims](references/vault-v2.md#rewards-and-claims)).
- Verify `Morpho-Action-Proof` before exposing typed data or calls ([proof](#verify-before-exposing-a-plan)).
- Except for Merkl claims, send only `prepared` calls whose simulation succeeded; review values come from that simulation ([simulation](#signature-rounds-and-simulation)).
- Show the official Powered by Morpho attribution where users interact with Morpho ([attribution](references/handbook.md#attribution-and-protocol-boundary)).
- Require acknowledgment of Morpho's disclaimer before a user's first protocol interaction; this is an obligation ([disclaimer](references/handbook.md#legal-acknowledgment)).
- Label every rate, reward APR included, as fixed or variable, APR or APY, with its averaging window (a fixed rate: its maturity). Show native yield and rewards separately ([rates](#rates-and-accounting)).
- Show missing or failed values as unknown, never as zero ([units](#identity-and-units)).
- Bound Max and sliders by every applicable limit (balance, position, liquidity, caps, health) and state shortfall amounts ([UI principles](references/ui-principles.md#state-and-controls)).

## Concepts

Use this manual to build, update or review an integration. Choose the product from the requested use case and deployed configuration, not from a preferred transaction template.

- **Earn:** [Vault V2](references/vault-v2.md) by default; Vault V1 only for explicit compatibility. A vault is not direct Blue supply, a staking product or guaranteed investment.
- **Borrow:** [Blue](references/blue.md) has variable rates and no maturity; [Midnight](references/midnight.md) has fixed rates and fixed maturity. They have different debt units, liquidity and repayment semantics.
- Read only the applicable product manuals, then apply the shared transaction and UI rules below and the [integrator handbook](references/handbook.md). In a mixed integration, keep product/version evidence separate.

Morpho provides protocol infrastructure; do not describe Morpho Association as lender, custodian, guarantor, counterparty, risk assessor or curator without evidence. Distinguish integrator, curator, vault, underlying asset, receipt shares and reward tokens. Historical rates are not forecasts; collateral, smart-contract, oracle, liquidity, configuration and fee risks remain.

## Data: use the published contracts

Prefer Morpho's REST APIs: Core and Midnight REST for protocol reads, Actions for every protocol transaction. Do not use GraphQL, a subgraph, direct RPC reads of protocol state or hand-built calldata where a REST route covers the need. [REST API best practice](references/rest-api-best-practice.md) gives the reasons, the exceptions, read conventions and the full proof procedure.

| Contract | Canonical OpenAPI |
| --- | --- |
| Core REST: Blue, Vault V1/V2, tokens, prices and oracles | https://api.morpho.org/core/docs/swagger/json |
| Midnight REST: markets, books, positions and activity | https://api.morpho.org/midnight/docs/swagger/json |
| Actions: transaction preparation and simulation | https://api.morpho.org/actions/docs/openapi.json |

Fetch the applicable OpenAPI before implementing a client. Derive routes, versions, parameters, pagination, response envelopes, nullable fields, supported chains and discriminated variants from it. Follow referenced schemas, not guessed paths or a version copied from a neighboring operation. Core and Midnight are separate documents. Read coverage does not imply Actions support; an unsupported action is not a reason to build custom calldata.

Use REST GETs for displayed protocol data, token metadata/prices and indexed position baselines; use wallet reads for wallet balances. Use Actions for protocol transactions: it builds and simulates, but never submits. The explicit exception is [Merkl Distributor claims](references/vault-v2.md#rewards-and-claims), which have no Actions route. Consult [Merkl's API reference](https://developers.merkl.xyz/api-reference/get/v4/opportunities) for vendor-specific rewards contracts.

Keep Actions `x-api-key` and Merkl credentials server-side. Browser clients call the integration backend; never embed secrets or expose them in logs. Use the documented REST host/authentication for the deployment rather than assuming it shares Actions authentication.

### Identity and units

- Token, vault and Blue market selectors combine chain and address/market ID as `{chain_id}:{identifier}`. Midnight REST market IDs are bare and globally unique; Midnight Actions use `{chain_id}:{market_id}`, with the chain obtained from discovery.
- Raw integer amounts are `bigint` base units. Earn shares use the share token's decimals; Borrow shares are raw accounting units, not token-decimal amounts. Never rescale execution payloads for display or use floats for token math.
- Resolve metadata from contract identity plus chain, not symbol. USD value = raw amount / 10^tokenDecimals × token USD price. An oracle exchange ratio is not a USD price.
- Oracle price is scaled by 1e36: collateralRaw × oraclePrice / 1e36 yields loan-token base units. LLTV fractions use WAD (1e18); the product manuals explain share-price and debt scaling.
- Preserve null, loading, empty and zero as distinct states. A missing price leaves the token amount available but its USD value unknown; a missing input to a safety calculation blocks actions depending on it. Never default a missing or failed value to zero; see [unknown values](references/ui-principles.md#numbers-metadata-and-previews).
- Indexed reads can be non-atomic or stale. Keep identity, freshness and any available block watermark with the baseline rather than treating it as execution state.

### Rates and accounting

Choose one explicit `rateWindow` for every variable native rate and reward APR. Use realized REST averages rather than instantaneous rates; a chart range is not an averaging window. Six hours is the integration default unless configured otherwise. Never replace a null selected window with another window silently. Fixed-term Midnight rates do not use this window.

Compute reward APR over the same window with the [Merkl display convention](references/rest-api-best-practice.md#reward-apr-convention); failed or empty reward data is unavailable, not zero. Keep APR and APY conventions distinct; adding reward APR does not establish auto-compounding.

Scope rewards to the actual campaign, token and distribution chain. A successful no-campaign result differs from lookup failure; an incomplete combined rate must not be relabeled as complete native-only yield. Borrow incentives remain separate from borrowing cost. Cumulative earnings and return on capital are not the same as a historical rate window. Net worth and earned to date include priced rewards, or are marked partial.

## Transactions: verified preparation, consent and execution

### Initial intent and funding

Derive each request variant from the Actions OpenAPI; do not copy fields between products or modes. Set `account` to the sending wallet and verify the selected `chain_id`. Reject zero exact amounts and validate funding balances before preparation. Every initial intent must include configured top-level `calldata_origin`, a four-byte hex analytics tag. Missing/malformed configuration blocks launch. It is not authentication, and a sample tag is not your integration identity.

Only accepting variants may include top-level `referral_fee`: `{bps, recipient}` with integer `bps` from 1 to 200 (at most 2%). Omit zero. Disclose recipient, fee token/cost and gross versus net receipt; never inject it into a continuation or alter returned calls.

Funding is the schema's object, not a string: ERC-20, native, or auto where supported. Native/auto requires `max_native_assets`. For Earn/Blue it applies only to wrapped-native assets; Midnight applies it only to the supplied wrapped-native collateral portion. Auto chooses by balances, not mixed funding. Reserve native gas and disclose wrapping/spend limits.

Use `signature_mode: "auto"` only where accepted, supported ERC-2612 permits only with matching on-chain domains, otherwise approvals. Default `none` returns prerequisite calls; smart-contract accounts generally receive calls only. Do not add signature mode, funding or expiry fields to variants that exclude them.

### Verify before exposing a plan

Copy the documented TypeScript `postAction`/`runAction` helper from the [Actions documentation](https://api.morpho.org/actions/docs); do not reimplement the verification/wallet flow from a sketch. Go, Python and Java proof verifiers are not complete wallet flows.

Verify `Morpho-Action-Proof` before exposing typed data or calls, following the [proof procedure](references/rest-api-best-practice.md#verify-the-actions-response-proof). The helper must:

- **Bind the origin and bytes.** POST only to a `/v0/actions/` path on the keyed origin, without following redirects. Keep the exact request body bytes and hash the response body bytes before parsing; the proof binds the path, not the host.
- **Verify the signature.** Allow only ES256; select exactly one key by `kid` from same-origin `/.well-known/morpho-actions-jwks.json`; require `typ: morpho-action-proof+jwt`, the environment's canonical issuer (`https://api.morpho.org/v0/actions` in production, not the host called), audience `morpho-actions-client` and subject `action-response`.
- **Bound the lifetime.** Require an unexpired `exp` and an `iat` that is not in the future and at most 60 seconds old, with a few seconds of clock skew. Cache JWKS at most 60 seconds and refresh on an unknown key ID.
- **Match the exchange.** `request_id` equals the `X-Request-Id` header; `action_id` and `action` equal the response data; `request` and `response` claims match method, path, content types, HTTP status and the base64url SHA-256 of each body.
- **Match the decision.** `signature_required`, `rejected` for `simulation_failed`, or `approved` for `prepared` with a successful simulation. Send calls only for `prepared` with a verified `approved` decision.

Fail closed. A valid proof does not stop an unchanged response being replayed before it expires, and does not replace checks of account, chain, typed-data domain, expiry or user intent.

### Signature rounds and simulation

Successful HTTP responses wrap the action in `data`; inspect `data.status`.

For `signature_required`, review each requested signature, including kind, ID, typed-data domain and actual token/spender/amount. Match domain chain to the selected chain. Obtain consent for each EIP-712 request. Continue at the same endpoint using only `continuation` and signatures with matching unique IDs, not the original intent plus extra fields. Allow at most three signing/continuation rounds.

Require more than 60 seconds before `expires_at` before each signature; otherwise disable signing, discard continuation and restart from a fresh intent with renewed review. `expires_at` is Unix seconds; never extend validity locally. Full-force validity is not an on-chain deadline.

Only `prepared` with `simulation.status === "success"` may proceed to sending. `simulation_failed` or a failed simulation sends nothing and must not be bypassed. Explain failure using structured data; expose raw `simulation.failure.message` only in secondary details. Do not loosen guards to make a plan pass.

Previews apply `simulation.position_changes` deltas to the matching indexed baseline and use signed `simulation.wallet_changes`. They are not full snapshots; never recompute review values from the input amount ([preview detail](references/ui-principles.md#numbers-metadata-and-previews)). Use product-specific accounting units, simulated fees/penalties, actual wallet spend and net receipts.

### Review, send and reconcile

Before a wallet prompt, explain the signature or currently available call plan, account/chain, units, amounts, approvals, fees, protection limits and expected changes. A signature-required response may not contain final calls: identify them as pending, update the review after continuation, and review the final ordered calls before sending. Never claim unseen calls were reviewed.

Send returned `to`, `data` and `value` unchanged, in order, from the selected account on the selected chain before expiry. Atomic EIP-5792 batching is allowed only if the wallet supports atomic batches; otherwise send sequentially, awaiting each confirmation. Stop on the first failure. Earlier approvals/authorizations can remain applied.

Track confirmed and possibly submitted calls. Reconcile receipts before retrying and request a new action instead of blindly resending remaining calls. After confirmation, refetch until the indexed watermark reaches the transaction block where available; otherwise reconcile position and wallet state explicitly. Midnight has no universal watermark. Rewards index independently. A receipt alone does not prove a refreshed position or a complete exit.

### Recovery and protection limits

Parse empty/non-JSON errors defensively. Use the OpenAPI's error schema and validated structured details when available; retain inputs and request IDs without leaking secrets. Unknown codes fail safely. Raw service messages belong in details, not promises of recovery.

Retry only HTTP 429/503, honoring `Retry-After` (seconds or HTTP date) with bounded exponential backoff and jitter, at most three retries. Never retry other 4xx automatically or automatically resubmit a wallet transaction.

Expired/invalid continuations require a new intent. Stale quotes or slippage/rate failures require a fresh quote and consent. Liquidity failures require refreshed capacity and a smaller supported amount or explicitly chosen alternative; unknown capacity stays unknown. Shortfalls state requested and available amounts. Unsupported actions remain unavailable with their reason. Repayment beyond current debt requires refreshing and selecting a supported full-repay mode, not increasing the amount blindly.

Per-product intent [expiry bounds](references/rest-api-best-practice.md#expiry-bounds) still apply.

## UI correctness principles

Read [UI integration principles](references/ui-principles.md) for state isolation, canonical controls and limits, precision, resilient lists, previews, source-shaped tests and honest asynchronous status. These apply to whatever product functionality the integration actually offers; they do not prescribe an application layout or feature set.

## Integrator handbook

Read the [integrator handbook](references/handbook.md) for what users must be told and shown. It groups product guidelines by the concern each solves, tagged by product and priority:

| Concern | Categories |
| --- | --- |
| Compliance | Truthful language; attribution and protocol boundary; legal acknowledgment |
| Trust and risk | Exposure transparency; rate and cost honesty; position risk and safety |
| Growth | Transaction friction; discovery and activation; user education |

The guidelines are recommendations for the functionality offered, except the first-interaction acknowledgment of Morpho's disclaimer, which is an obligation. They never relax a rule in this manual.

## Review

Use [review guidance](references/review.md) for read-only review, evidence boundaries and specialist prompts. Building requires the same correctness invariants; the review prompts do not define a separate application specification.

Unpublished health buffers, visual thresholds, notification policy, vendor accounting guarantees, claim deployment/recipient configuration and unsupported roll/margin behavior require evidence. Do not invent them to complete a calculation or imply parity with another application.
