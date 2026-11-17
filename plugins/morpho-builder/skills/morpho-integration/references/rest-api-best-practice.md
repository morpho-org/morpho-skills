# REST API best practice

How to source data and prepare transactions for a Morpho integration. The [shared manual](../SKILL.md) owns units, signature rounds and reconciliation; this file owns API choice, read conventions and the Actions response proof.

## Prefer the REST APIs

**Guideline: build an integration on Morpho's REST APIs.** Read protocol data from Core REST and Midnight REST, and prepare every protocol transaction through the Actions API. Do not use the GraphQL API, a subgraph, direct RPC reads of protocol state or hand-built calldata where a REST route covers the need.

| API | Use it for | Documentation | OpenAPI |
| --- | --- | --- | --- |
| Core REST | Blue markets, Vault V1/V2, positions, performance, tokens, prices, oracles, curators | https://api.morpho.org/core/docs | https://api.morpho.org/core/docs/swagger/json |
| Midnight REST | Fixed-rate markets, offers and quotes, positions, transactions | https://api.morpho.org/midnight/docs/ | https://api.morpho.org/midnight/docs/swagger/json |
| Actions | Building and simulating Earn and Borrow transactions | https://api.morpho.org/actions/docs | https://api.morpho.org/actions/docs/openapi.json |

Why REST comes first:

- **One published contract per API.** Routes, parameters, nullable fields and error codes are in an OpenAPI document that a client can be generated from and checked against.
- **Stated freshness.** State and position responses carry `last_indexed_block`, so a baseline can be compared with a transaction's block.
- **Explicit unknowns.** The API separates "not available" from zero with distinct statuses, which a raw contract read does not.
- **Verified transactions.** Actions responses are simulated and signed by Morpho; hand-built calldata has neither protection.

Where REST does not apply:

- **Wallet state.** Token balances, allowances and transaction receipts come from the wallet or an RPC node.
- **Merkl rewards and claims.** These use [Merkl's API](https://developers.merkl.xyz/api-reference/get/v4/opportunities) and the Distributor contract; Actions has no claim route.
- **A gap in coverage.** When no REST route exists, say which value comes from another source and why. A missing Actions route is a reason to leave the action unavailable, not to build calldata.

An existing integration that reads protocol data through GraphQL should move those reads to the matching REST routes, one resource at a time, comparing units and null handling as it goes.

## Hosts and keys

- Core and Midnight REST are served from `https://api.morpho.org`: Core under `/v0` and `/v1`, Midnight under `/v0/midnight`. The Core documentation samples send the key in `x-api-key`; neither specification declares a security scheme or publishes rate limits.
- Actions is served from the keyed origin, `https://private.api.morpho.org` or the origin issued with the key, and requires `x-api-key` on every action request. JWKS and the documentation need no key.
- Keep keys on the integration's backend. Current keys are not origin-restricted, so a key shipped to a browser is exposed. Browser code calls the backend; only the wallet adapter runs in the browser.
- The Actions API is in alpha and its specification warns of breaking changes. Fetch the specification when building or reviewing, and treat a copied field list as stale.

## Reading from Core and Midnight REST

- **Derive the route from the specification, including its version.** Versions are per route: Vault V2 state and APY averages are under `/v1` while most Vault V2 routes are under `/v0`. Do not copy a prefix from a neighbouring route.
- **Use the documented selector.** Core selectors are `<chain_id>:<address>` or `<chain_id>:<market_id>`. Midnight REST market IDs are bare; Midnight address filters must be combined with `chain_ids`, because an address alone is not unique across chains.
- **Read the envelope, then the data.** Single resources are wrapped in `data`. Lists are cursor-paginated; Midnight lists return `{ cursor, data }` and a `null` cursor marks the last page.
- **Treat the cursor as opaque.** It encodes the sort field, direction and filters. Changing any of them invalidates it; never parse or build one. `limit` defaults to 100 and is capped at 1000.
- **Paginate to the end before aggregating.** A total, a maximum or an "absent" conclusion drawn from the first page is wrong.
- **Parse amounts as integers.** Base-unit and WAD values are integer strings; convert to `bigint`, never to a float. Rates such as APY averages are decimal fractions.
- **Keep `last_indexed_block` with the data.** Different resources can be at different blocks; do not present them as one atomic snapshot.
- **Choose the averaging window explicitly.** APY-average routes take `lookback` (`six_hours` by default). History routes derive their averaging window from `lookback`, so a chart range is not the averaging window.
- **Honour deprecations.** Use the replacement the specification names, for example Midnight's `effective_apr` in place of the deprecated `effective_rate_wad`.

### Status codes carry meaning

| Status | Meaning | Client behaviour |
| --- | --- | --- |
| 206 on a token price | Known token the API cannot price; price fields are null | Show the token amount, mark USD value unknown |
| 400 `VALIDATION_FAILED` / `INVALID_CURSOR` | Bad parameters, or a cursor from another sort or filter set | Fix the request or restart pagination; do not retry unchanged |
| 404 | The selected resource does not exist on that chain | Report it; do not fall back to another chain or version |
| 422 on a Midnight quote | The requested size cannot be filled | Refresh capacity and let the user choose a smaller amount |
| 501 on reallocatable liquidity | Unsupported vault adapter or vault outside the simulated set | Treat as unknown capacity, never as zero |
| 503 | Temporary upstream unavailability | Retry with bounded backoff |

Midnight errors use `{ error: { code, message, details, request_id } }`; keep `request_id` for support. Retry only 429 and 503, as the [shared manual](../SKILL.md#recovery-and-protection-limits) requires.

Midnight list routes document short public caching (`max-age` of 2 to 5 seconds). Polling faster than the cache lifetime returns the same data; debounce quotes and bind each response to the inputs that produced it.

## Preparing transactions with Actions

1. POST the intent with `account` set to the wallet that will send the calls.
2. While `data.status` is `signature_required`, sign each EIP-712 request with that wallet and POST only `{ continuation, signatures }` to the same endpoint.
3. When `data.status` is `prepared` and `simulation.status` is `success`, send `calls` unchanged and in order, before `expires_at`.

- **Check chain support per route group in the specification.** A chain outside a route's group returns 422 `ACTION_UNSUPPORTED`.
- **Never cache or replay an action response.** Responses are `Cache-Control: private, no-store, no-transform`; request a fresh action for each attempt.
- **Do not take gas values from the simulation.** A successful simulation does not prove a wallet can send the calls; let the wallet estimate gas.
- **Disclose the `signature_mode: "none"` fallback.** When a wallet cannot sign typed data, the returned approval calls can grant more than the signature would have, including an unlimited approval. Tell the user before sending them.
- **Classify what was sent before retrying.** After a failure, nothing, part or an unknown amount of the plan may have landed. Check a pending hash or batch before requesting the action again, or it can run twice.

## Verify the Actions response proof

Every successful action response carries a `Morpho-Action-Proof` header: a compact JWS that Morpho signs over the exact request and response bytes. Verify it before showing typed data or sending calls. An unverified response is not a plan.

Use the `postAction` and `runAction` TypeScript helpers published in the [Actions documentation](https://api.morpho.org/actions/docs), unmodified. They run server-side on Node.js 20 or later with the `jose` library. Do not rewrite the procedure from this summary; the steps below are what the helper must be seen to do.

1. **Send only to the keyed origin.** POST to a path under `/v0/actions/` on the keyed origin, with the key in `x-api-key`. The proof binds the path but not the host, so a request sent elsewhere could be relayed with a genuine response. Do not follow redirects.
2. **Keep the exact bytes.** Keep the request body bytes that were sent. Read the response body as bytes before parsing it as JSON. A client that decodes compression, such as `fetch`, hashes the decoded bytes.
3. **Verify the signature and registered claims.**
   - Fetch the keys from `/.well-known/morpho-actions-jwks.json` on that same origin, without a key. Select the key by the header `kid`; it must identify exactly one key.
   - Allow only `ES256` and require `typ` `morpho-action-proof+jwt`.
   - Require `iss` `https://api.morpho.org/v0/actions`, `aud` `morpho-actions-client` and `sub` `action-response`. The issuer is the environment's canonical issuer, not the host that was called.
   - Require an unexpired `exp` and an `iat` that is not in the future and at most 60 seconds old, with about 5 seconds of clock skew. The published helpers also reject a proof whose `exp` is not after `iat` or is more than 300 seconds after it.
   - Cache the key set for at most 60 seconds, and fetch it again when a `kid` is not in the cached copy.
4. **Check that the claims describe this exchange.**
   - `request_id` equals the `X-Request-Id` response header.
   - `action_id` and `action` equal the response's `data.action_id` and `data.action`.
   - `request` holds `POST`, the request path (`target`), the request `Content-Type` and the base64url SHA-256 of the request body (`body_sha256`).
   - `response` holds the HTTP status, the response `Content-Type` and the base64url SHA-256 of the response body.
5. **Check `decision` against the response.** It is `signature_required` for a `signature_required` response, `rejected` for `simulation_failed`, and `approved` for `prepared` with `simulation.status` `success`. Send calls only when `status` is `prepared` and the verified decision is `approved`.
6. **Check scope before the wallet signs or sends.** The response's `chain_id` and every typed-data `domain.chainId` equal the chosen chain, the action's `account` is the sending wallet (the published wallet module checks this), and `expires_at` has not passed. Before each typed-data signature, more than 60 seconds must remain. Have the user approve each typed-data request, and stop after three signature rounds.

Any failed check fails closed: show nothing from the response and send nothing.

What the proof does and does not establish:

- It proves the response is the one Morpho signed for this request and has not expired.
- It does not stop the same unchanged response from being presented again before it expires.
- It does not replace the chain, account, expiry and user-consent checks in step 6, and it does not control whether or when a transaction is included.

Other environments and languages:

- **Staging.** Against `https://private-api.dev.morpho.dev`, fetch the key set from that origin and require the issuer `https://api.dev.morpho.dev/v0/actions`.
- **Go, Python and Java.** The documentation publishes a verifier for each. They return verified `data`, `decision` and an `execute_calls` flag, and send only when that flag is true. They verify the proof only; the application still performs step 6 and the wallet flow.
- **Support.** Include the `request_id` and, for a successful response, the `Morpho-Action-Proof` header value.
