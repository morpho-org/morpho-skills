---
name: morpho-integration
description: Build or review correct Morpho integrations using REST reads, Actions transactions and Merkl rewards. Covers Earn through Vault V2 with Vault V1 compatibility, Blue variable-rate borrowing and Midnight fixed-rate, fixed-maturity borrowing; protocol units, transaction verification, accounting, state management, and product guidelines for language, attribution, disclosure, transparency and risk.
---

# Morpho integration manual

## Always

Core rules, not the whole manual: every section and linked reference still applies.

- Keep Actions and Merkl credentials server-side ([keys](#data-use-the-published-contracts)).
- Read protocol data, history included, from Core and Midnight REST, and every page before a total or "none found"; where REST lacks a route, name the other source and why ([data](#data-use-the-published-contracts)).
- Prepare every protocol transaction through Actions with the integration's configured `calldata_origin`, never hand-built calldata; Merkl claims are excepted ([intent](#initial-intent-and-funding), [claims](references/vault-v2.md#rewards-and-claims)).
- Verify `Morpho-Action-Proof` before exposing typed data or calls ([proof](#verify-before-exposing-a-plan)).
- Handle every Actions status: review and continue `signature_required`; send only `prepared` calls whose simulation succeeded (Merkl claims excepted), with review values from it. Recheck account, chain and validity before each signature and send ([rounds](#signature-rounds-and-simulation)).
- Show the official Powered by Morpho badge where users interact with Morpho and say the integrator operates the interface while the protocol is Morpho's; linking the disclaimer from it is recommended ([attribution](references/handbook.md#attribution-and-protocol-boundary)).
- Before a user's first protocol interaction, require acknowledgment of a notice naming the integrator's own terms and Morpho's Disclaimer, in the handbook's wording; this is an obligation ([disclaimer](references/handbook.md#legal-acknowledgment)).
- Label every rate, reward APR included, as fixed or variable, APR or APY, with its averaging window (a fixed rate: its maturity). Show native yield and rewards separately ([rates](#rates-and-accounting)).
- Show missing, failed or loading values as unknown, never as zero or a smaller complete-looking value; a total missing items names them where known, else is marked incomplete ([units](#identity-and-units)).
- Bound Max and sliders by every applicable limit (balance, position, liquidity, caps, health) and state shortfall amounts ([UI principles](references/ui-principles.md#state-and-controls)).
- Explain errors from structured data; raw service messages go in secondary details ([recovery](#recovery-and-protection-limits)).

## Concepts

Choose the product from the use case and deployed configuration, not a preferred transaction template.

- **Earn:** [Vault V2](references/vault-v2.md) by default; Vault V1 only for explicit compatibility. A vault is not direct Blue supply, a staking product or guaranteed investment.
- **Borrow:** [Blue](references/blue.md) has variable rates and no maturity; [Midnight](references/midnight.md) has fixed rates and fixed maturity. They have different debt units, liquidity and repayment semantics.
- Read only the applicable product manuals, then the shared rules below and the [integrator handbook](references/handbook.md). In a mixed integration, keep product/version evidence separate.

Morpho provides protocol infrastructure; do not describe Morpho Association as lender, custodian, guarantor, counterparty, risk assessor or curator without evidence. Distinguish integrator, curator, vault, underlying asset, receipt shares and reward tokens. Historical rates are not forecasts; collateral, smart-contract, oracle, liquidity, configuration and fee risks remain.

## Data: use the published contracts

Prefer Morpho's REST APIs: Core and Midnight REST for protocol reads and history (events, transactions, past rates), Actions for every protocol transaction. Do not use GraphQL, a subgraph, node log queries, direct RPC reads of protocol state or hand-built calldata where a REST route covers the need; where none does, show the value as unavailable or name the other source and why. Paginate to the end before computing a total, maximum or "none found". See [REST API best practice](references/rest-api-best-practice.md) for reasons, exceptions and conventions.

| Contract | Canonical OpenAPI |
| --- | --- |
| Core REST: Blue, Vault V1/V2, tokens, prices and oracles | https://api.morpho.org/core/docs/swagger/json |
| Midnight REST: markets, books, positions and activity | https://api.morpho.org/midnight/docs/swagger/json |
| Actions: transaction preparation and simulation | https://api.morpho.org/actions/docs/openapi.json |

Fetch the applicable OpenAPI before implementing a client and derive routes, versions, parameters, pagination, envelopes, nullable fields, chains and variants from its referenced schemas, not guessed paths or a neighboring operation's version. Core and Midnight are separate documents. Read coverage does not imply Actions support; an unsupported action is not a reason to build custom calldata.

Use REST GETs for displayed protocol data, token metadata/prices and indexed position baselines; wallet reads for wallet balances. Use Actions for protocol transactions: it builds and simulates, but never submits. The exception is [Merkl Distributor claims](references/vault-v2.md#rewards-and-claims), which have no Actions route.

Browser clients call the integration backend, which holds the Actions `x-api-key` and Merkl credentials; never embed or log secrets. Use the documented REST host/authentication rather than assuming it shares Actions authentication.

### Identity and units

- Token, vault and Blue market selectors combine chain and address/market ID as `{chain_id}:{identifier}`. Midnight REST market IDs are bare and globally unique; Midnight Actions use `{chain_id}:{market_id}`, with the chain obtained from discovery.
- Raw integer amounts are `bigint` base units. Earn shares use the share token's decimals; Borrow shares are raw accounting units, not token-decimal amounts. Never rescale execution payloads for display or use floats for token math.
- Resolve metadata from contract identity plus chain, not symbol. USD value = raw amount / 10^tokenDecimals × token USD price. An oracle exchange ratio is not a USD price.
- Oracle price is scaled by 1e36: collateralRaw × oraclePrice / 1e36 yields loan-token base units. LLTV fractions use WAD (1e18); the product manuals explain share-price and debt scaling.
- Preserve null, loading, empty and zero as distinct states. A missing price leaves the token amount available but its USD value unknown; a missing input to a safety calculation blocks actions depending on it. Failed data is unavailable, not zero. A total over loading or unknown rows is pending, or excludes them and says so; a value derived from a failed read (debt, health, Max) is unknown, not 0 or "no debt"; a combined rate missing a part loses the combined label. See [unknown values](references/ui-principles.md#numbers-metadata-and-previews).
- Indexed reads can be non-atomic or stale. Keep identity, freshness and any available block watermark with the baseline rather than treating it as execution state.

### Rates and accounting

Choose one explicit `rateWindow` for every variable native rate and reward APR. Use realized REST averages rather than instantaneous rates; a chart range is not an averaging window. Six hours is the integration default unless configured otherwise. Never replace a null selected window with another window silently. Fixed-term Midnight rates do not use this window.

Compute reward APR over the same window with the [Merkl display convention](references/rest-api-best-practice.md#reward-apr-convention); failed or empty reward data is unavailable, not zero. Keep APR and APY conventions distinct; adding reward APR does not establish auto-compounding.

Scope rewards to the actual campaign, token and distribution chain. A successful no-campaign result differs from lookup failure; an incomplete combined rate must not be relabeled as complete native-only yield. Borrow incentives remain separate from borrowing cost. Omit an unsupported reward average and identify the exclusion. Net worth and earned to date include priced rewards; a total missing some names them where known, else is marked incomplete.

## Transactions: verified preparation, consent and execution

### Initial intent and funding

Derive each request variant from the Actions OpenAPI; do not copy fields between products or modes. Set `account` to the sending wallet and verify the selected `chain_id`. Reject zero exact amounts and validate funding balances before preparation. Every initial intent must include configured top-level `calldata_origin`, a four-byte hex analytics tag. Missing/malformed configuration blocks launch. It is not authentication, and a sample tag is not your integration identity.

Only accepting variants may include top-level `referral_fee`: `{bps, recipient}` with integer `bps` from 1 to 200 (at most 2%). Omit zero. Disclose recipient, fee token/cost and gross versus net receipt; never inject it into a continuation or alter returned calls.

Funding is the schema's object, not a string: ERC-20, native, or auto where supported. Native/auto requires `max_native_assets`. For Earn/Blue it applies only to wrapped-native assets; Midnight applies it only to the supplied wrapped-native collateral portion. Auto chooses by balances, not mixed funding. Reserve native gas and disclose wrapping/spend limits.

Use `signature_mode: "auto"` only where accepted, supported ERC-2612 permits only with matching on-chain domains, otherwise approvals. Default `none` returns prerequisite calls; smart-contract accounts generally receive calls only. Do not add signature mode, funding or expiry fields to variants that exclude them.

### Verify before exposing a plan

Copy the documented TypeScript `postAction`/`runAction` helper from the [Actions documentation](https://api.morpho.org/actions/docs); do not reimplement the verification/wallet flow from a sketch.

Verify `Morpho-Action-Proof` before exposing typed data or calls, following the [proof procedure](references/rest-api-best-practice.md#verify-the-actions-response-proof). The helper POSTs only to a `/v0/actions/` path on the keyed origin without following redirects, and hashes the exact request and response bytes. It allows only ES256 with one same-origin JWKS key by `kid`, the canonical issuer (not the host called), the documented `typ`, audience and subject, an unexpired `exp` and an `iat` within 60 seconds. Claims must match `X-Request-Id`, the action, method, path, content types, status and both body hashes. Send calls only for `prepared` with a verified `approved` decision.

Fail closed. A valid proof does not prevent replay before expiry or replace account, chain, typed-data domain, expiry and intent checks.

### Signature rounds and simulation

Successful HTTP responses wrap the action in `data`; inspect `data.status`. `signature_required` is a normal step, not an error.

For `signature_required`, review each requested signature, including kind, ID, typed-data domain and actual token/spender/amount. Match domain chain to the selected chain. Obtain consent for each EIP-712 request. Continue at the same endpoint using only `continuation` and signatures with matching unique IDs, not the original intent plus extra fields. Allow at most three signing/continuation rounds.

Before each signature and each send, recheck account and chain and require more than 60 seconds before `expires_at`; otherwise disable signing, discard continuation and restart from a fresh intent with renewed review. `expires_at` is Unix seconds; never extend validity locally. Full-force validity is not an on-chain deadline.

Only `prepared` with `simulation.status === "success"` may proceed to sending. `simulation_failed` or a failed simulation sends nothing and must not be bypassed. Explain failure using structured data; expose raw `simulation.failure.message` only in secondary details. Do not loosen guards to make a plan pass.

Previews apply `simulation.position_changes` deltas to the matching indexed baseline and use signed `simulation.wallet_changes`. They are not full snapshots; never recompute review values from the input amount ([preview detail](references/ui-principles.md#numbers-metadata-and-previews)). Use product-specific accounting units, simulated fees/penalties, actual wallet spend and net receipts.

### Review, send and reconcile

Before a wallet prompt, explain the signature or currently available call plan, account/chain, units, amounts, approvals, fees, protection limits and expected changes. A signature-required response may not contain final calls: identify them as pending, update the review after continuation, and review the final ordered calls before sending. Never claim unseen calls were reviewed.

Send returned `to`, `data` and `value` unchanged, in order, from the selected account on the selected chain before expiry. Atomic EIP-5792 batching is allowed only if the wallet supports atomic batches; otherwise send sequentially, awaiting each confirmation. Stop on the first failure. Earlier approvals/authorizations can remain applied.

Track confirmed and possibly submitted calls. Reconcile receipts before retrying and request a new action instead of blindly resending remaining calls. After confirmation, refetch until the indexed watermark reaches the transaction block where available; otherwise reconcile position and wallet state explicitly. Midnight has no universal watermark. Rewards index independently. A receipt alone does not prove a refreshed position or a complete exit.

### Recovery and protection limits

Parse empty/non-JSON errors defensively. Use the OpenAPI's error schema and validated structured details when available; retain inputs and request IDs without leaking secrets. Unknown codes fail safely. Raw service messages, including those a shared fetch helper passes through, belong in details, not inline or promises of recovery.

Retry only HTTP 429/503, honoring `Retry-After` (seconds or HTTP date) with bounded exponential backoff and jitter, at most three retries. Never automatically retry other 4xx or resubmit a wallet transaction.

Expired/invalid continuations require a new intent. Stale quotes or slippage/rate failures require a fresh quote and consent. Liquidity failures require refreshed capacity and a smaller supported amount or explicitly chosen alternative; unknown capacity stays unknown. Shortfalls state requested and available amounts. Unsupported actions remain unavailable with their reason. Repayment beyond current debt requires refreshing and selecting a supported full-repay mode, not increasing the amount blindly.

Per-product intent [expiry bounds](references/rest-api-best-practice.md#expiry-bounds) still apply.

## UI correctness principles

Read [UI integration principles](references/ui-principles.md) for state, controls and limits, precision, lists, previews, tests and asynchronous status. They apply to the functionality offered, not a layout.

## Integrator handbook

Read the [integrator handbook](references/handbook.md) for what users must be told and shown: compliance (truthful language, attribution, legal acknowledgment), trust and risk (exposure, rate and cost honesty, position safety) and growth (friction, discovery, education). Its guidelines are recommendations, except the first-interaction acknowledgment of Morpho's disclaimer, which is an obligation. They never relax a rule in this manual.

## Review

Use [review guidance](references/review.md) for read-only review, evidence boundaries and specialist prompts; building needs the same invariants, not a separate specification.

Unpublished health buffers, visual thresholds, notification policy, vendor accounting guarantees, claim deployment/recipient configuration and unsupported roll/margin behavior require evidence. Do not invent them to complete a calculation or imply parity with another application.
