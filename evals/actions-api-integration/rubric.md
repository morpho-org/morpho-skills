# Rubric: Morpho integration through the Actions API and REST API

40 criteria for grading a Next.js app that an agent built for Morpho Earn
(Vault V2) or Borrow (Blue and Midnight). Each criterion is tied to a rule or
story in the product brief for the integration skills (posted on SDK-1862) or
to the [Actions API reference](https://api.morpho.org/actions/docs). The rubric
was written from those two sources, not from the `morpho-builder` checkers, so
a build is not graded against the checklist it was given.

## How to score

- Score every criterion 0–10, or `N/A` when its product is out of scope (see
  [N/A rules](#na-rules)). Use the 0, 5 and 10 anchors; pick values in between
  when a build sits between two anchors.
- Every score above 0 needs evidence: `path:line` in the generated app, or an
  observed request/response from the forced-failure run (HAR entry, server log
  line or screenshot). A score of 0 needs a note on where you looked
  (for example "grep for `continuation` in `app/` and `lib/`: no match").
- Score what the code does on the path a user takes, not comments, TODOs,
  README claims or unused helpers. A helper that exists but is never called
  scores as missing.
- When a criterion depends on a forced failure (marked **FF**), the observed
  behavior decides the score; code reading alone caps it at 5.
- **Gate** criteria are reported separately in the summary as pass (≥ 7) or
  fail. A failed gate means the app is unsafe to ship whatever its average.

"Vanilla trap" in each criterion is the mistake an agent without Morpho-specific
guidance is expected to make. It is there to help the grader look in the right
place, not to change the anchors.

## N/A rules

| Build | Groups scored | Groups N/A |
| --- | --- | --- |
| Earn (Vault V2) | 1–6, 8 | 7, 9, 10 |
| Borrow (Blue + Midnight) | 1–7, 9, 10 | 8 |

Inside a scored group, a criterion is N/A only when the build task did not ask
for its story. A story that was asked for but not built scores 0, not N/A.

---

## 1. Next.js boundary and sources

### C01. Actions API key stays on the server — Gate

Source: brief, "Shared foundations" table (`x-api-key` required, server-side only); Actions docs, "Verify the response proof" (browser apps call through their own backend).

- **0:** the key reaches the browser: a `NEXT_PUBLIC_*` variable, a key in a client component, or `x-api-key` sent from browser code. Check the built client bundle (`.next/static`) for the key value or variable name.
- **5:** the key is only read on the server, but some Actions call is made from a client component through a route that echoes the key back, or the key is logged.
- **10:** the key is read only in route handlers or server actions (`server-only` or equivalent), the browser calls the app's own backend, and the built client bundle contains neither the key nor its variable name.
- **Evidence:** `path:line` of where the key is read and where Actions requests are sent; result of searching `.next/static`.
- **Vanilla trap:** calling `private.api.morpho.org` straight from a React component with `NEXT_PUBLIC_MORPHO_API_KEY`.

### C02. The backend proxy is pinned to Morpho action routes

Source: Actions docs, proof step 1 (send only to the keyed origin under `/v0/actions/`, do not follow redirects).

- **0:** the server route forwards whatever URL or path the client sends, or the client chooses the upstream host.
- **5:** the host is fixed, but the client controls the path freely, or redirects are followed.
- **10:** the host is fixed to the keyed origin, the path is limited to `/v0/actions/...` (ideally to the routes the app uses), and `redirect: "error"` (or equivalent) is set.
- **Evidence:** `path:line` of the proxy and its path check.
- **Vanilla trap:** a generic `/api/morpho/[...path]` passthrough that turns the app into an open relay for the key.

### C03. Reads use the REST API only, never GraphQL or Morpho SDKs

Source: brief, "Shared foundations" and "Linking rule for every skill" (REST for every number; never GraphQL or `@morpho-org/*`).

- **0:** numbers on screen come from `api.morpho.org/graphql`, Blue/Vault contract reads through `@morpho-org/*`, or on-chain reads that duplicate REST data.
- **5:** most reads are REST, but at least one displayed number comes from GraphQL, an SDK or a direct contract read.
- **10:** every displayed Morpho number comes from a documented `GET /v0/...` or `GET /v1/...` route; `package.json` has no `@morpho-org/*` dependency.
- **Evidence:** `package.json`; `path:line` of each data-fetching module; grep for `graphql`.
- **Vanilla trap:** GraphQL, because most public examples and blog posts use it.

### C04. Transactions come from the Actions API, never hand-built calldata — Gate

Source: brief, "Shared foundations" (Actions API for every transaction); Actions docs (treat `to`, `data`, `value` as opaque).

- **0:** the app encodes Morpho, bundler or vault calls itself (`encodeFunctionData`, `writeContract` with a Morpho or vault ABI, its own approvals).
- **5:** the main action goes through the Actions API, but some step (approval, collateral supply, withdraw) is hand-built.
- **10:** every Morpho transaction is an Actions API `calls` entry. The only hand-built call is the Merkl claim (C36), which has no Actions route.
- **Evidence:** grep for `encodeFunctionData`, `writeContract`, ABI imports; `path:line` of where calls are sent.
- **Vanilla trap:** adding its own ERC-20 `approve` before the Actions calls, or using `writeContract` on the vault.

### C05. `account` and chain match the wallet that will send

Source: brief, contract step 1 (`account` = the wallet that will send); Actions docs, proof step 5 (`chain_id` and every typed-data `domain.chainId` equal the chosen chain).

- **0:** `account` is hard-coded, taken from a form field unrelated to the connected wallet, or the app sends calls on whatever chain the wallet is on.
- **5:** `account` is the connected wallet, but there is no check that the wallet is on the action's chain, or no check of `chain_id` / `domain.chainId`.
- **10:** `account` is the connected address; the app switches or blocks when the wallet is on another chain; it checks the response `chain_id` and every typed-data `domain.chainId` before signing or sending.
- **Evidence:** `path:line` of the request body, the chain switch and the chain checks.
- **Vanilla trap:** assuming the wallet is on Base.

## 2. Signature loop

### C06. `signature_required` is completed with a continuation

Source: brief, contract step 2; Actions docs, "How actions work" step 2.

- **0:** the app ignores `signature_required` (treats it as an error or as `prepared`).
- **5:** the app signs the typed data but sends a new action instead of the continuation, or posts signatures without their `id`, or posts to another path.
- **10:** each entry of `signatures` is signed with `signTypedData` by the user's wallet, and the app POSTs `{continuation, signatures: [{id, signature}]}` to the same action path, repeating while the status stays `signature_required`.
- **Evidence:** `path:line` of the loop; for full marks, a HAR pair of the first POST and the continuation POST.
- **Vanilla trap:** assuming every response is already `prepared`.

### C07. The loop is bounded to three rounds

Source: brief, contract step 2 (max 3 rounds); Actions docs, `MAX_SIGNATURE_ROUNDS = 3`.

- **0:** no limit, or a recursive call with no exit other than success.
- **5:** a limit exists but is not 3, or exceeding it leaves the UI stuck without a message.
- **10:** at most three continuation rounds, then the action stops with a user-facing message.
- **Evidence:** `path:line` of the bound.

### C08. Signing stops near `expires_at` — FF

Source: brief, contract step 2 (stop if fewer than 60 s remain); Actions docs, proof step 5; brief, error table (`SIGNATURE_EXPIRED` → "This request expired. Try again.").

- **0:** `expires_at` is never read; in the expired-action forced failure the wallet is asked to sign or send.
- **5:** `expires_at` is checked before sending calls but not before each typed-data signature, or the 60-second margin is missing.
- **10:** before each signature the app requires more than 60 s left, and before sending it requires `expires_at` not passed; in the forced failure it shows the expired copy and offers to restart, with no wallet prompt.
- **Evidence:** `path:line` of the checks; forced-failure observation.
- **Vanilla trap:** caching a prepared response and sending it minutes later.

### C09. Expired or invalid continuations restart the action

Source: Actions docs, "Availability and continuation expiry" (`SIGNATURE_REFRESH_REQUIRED` and `ACTION_CONTINUATION_INVALID` mean restarting without the continuation); brief, error table.

- **0:** these codes show a generic error, or the app retries the same continuation.
- **5:** the app tells the user to try again, but retrying reuses the stale continuation or keeps old signatures.
- **10:** on `SIGNATURE_EXPIRED`, `SIGNATURE_REFRESH_REQUIRED` or `ACTION_CONTINUATION_INVALID` the app discards the continuation and signatures and restarts from the first POST.
- **Evidence:** `path:line` of the handling.

## 3. Response proof

### C10. `Morpho-Action-Proof` is verified against the JWKS — Gate

Source: brief, contract step 5; Actions docs, proof step 2.

- **0:** the header is never read.
- **5:** the JWS is verified but with loose settings: algorithm not limited to `ES256`, `typ`/`iss`/`aud`/`sub` not required, `iat` age not checked, or the JWKS fetched from a host other than the one called.
- **10:** `jwtVerify` (or another JOSE library) with `ES256` only, `typ` `morpho-action-proof+jwt`, `iss` `https://api.morpho.org/v0/actions`, `aud` `morpho-actions-client`, `sub` `action-response`, unexpired `exp`, `iat` at most 60 s old, key chosen by `kid` from `/.well-known/morpho-actions-jwks.json` on the same origin, cached at most 60 s. Copying the docs' `postAction` helper earns 10 when it is wired in.
- **Evidence:** `path:line` of the verifier and its options.
- **Vanilla trap:** not knowing the header exists.

### C11. The proof is bound to this exact exchange

Source: Actions docs, proof steps 1 and 3 (exact request bytes, response read as bytes, `body_sha256`, `request_id`, `action_id`).

- **0:** only the signature is checked, or the claims are not compared with the request and response.
- **5:** some claims are compared, but the request body is re-serialized before hashing, or the response is parsed before its bytes are hashed.
- **10:** the app hashes the exact request bytes it sent and the raw response bytes, and compares `request.method`, `request.target`, `request.content_type`, `request.body_sha256`, `response.status`, `response.content_type`, `response.body_sha256`, `request_id` (with `X-Request-Id`), `action_id` and `action`.
- **Evidence:** `path:line` of each comparison.

### C12. Nothing is signed or sent before the proof passes — Gate

Source: brief, contract step 5 (verify before showing typed data or sending calls); Actions docs, proof step 4 (execute only when the decision is `approved`).

- **0:** typed data or calls reach the wallet when the proof is missing or invalid, or verification runs after sending.
- **5:** verification runs first, but a failure is only logged and the flow continues, or `decision` is not checked against the status.
- **10:** an unverified response never reaches the wallet; `decision` must be `signature_required` for typed data and `approved` (with `prepared` and simulation `success`) for calls.
- **Evidence:** `path:line` of the ordering in the client flow.

## 4. Simulation, review and execution

### C13. Calls are sent only after a successful simulation — Gate, FF

Source: brief, contract steps 3 and 4.

- **0:** calls are sent when `status` is not `prepared` or `simulation.status` is not `success`, or the app ignores the simulation.
- **5:** the success check exists, but `simulation_failed` shows a generic error instead of `simulation.failure.message`.
- **10:** calls are sent only for `prepared` + `success`; on `simulation_failed` the app sends nothing and shows the failure (mapped copy per C19, raw message available).
- **Evidence:** `path:line`; insufficient-balance forced-failure observation.

### C14. Calls are sent in order and unchanged

Source: brief, contract step 3; Actions docs, "How actions work" step 3.

- **0:** calls are reordered, filtered (for example "skip approval if allowance is enough"), re-encoded, or `value` is dropped.
- **5:** order and data are kept, but sequential sending does not wait for each confirmation or does not stop when one fails, or `value` is parsed as a `Number`.
- **10:** `to`, `data` and `value` are passed through (value as `BigInt`), either as one EIP-5792 `wallet_sendCalls` batch or sequentially, waiting for each receipt and stopping on the first failure.
- **Evidence:** `path:line` of the sender.

### C15. One review step lists every signature and call before the first prompt

Source: brief, A1 components (review step listing every signature and call); "Global rules" (one review screen lists each signature and transaction in order).

- **0:** the wallet pops up with no review step.
- **5:** a confirm dialog exists but shows only the amount, not the list of signatures and calls.
- **10:** before the first wallet prompt, the user sees each signature and each call in order, with a readable label per step.
- **Evidence:** `path:line` of the review component; screenshot.

### C16. Previews come from the simulation

Source: brief, contract step 6 (use `simulation.position_changes` and `wallet_changes`); A1 acceptance (preview numbers match `simulation.position_changes`).

- **0:** the before → after preview is computed only on the client, or there is none.
- **5:** the simulation is shown for some fields, but the main figures (shares received, debt, collateral, LTV after) are client estimates.
- **10:** the reviewed before → after values (position and wallet) come from `simulation.position_changes` and `simulation.wallet_changes`; client estimates, if any, are only shown while typing and are replaced once the simulation returns.
- **Evidence:** `path:line` of the preview mapping; screenshot next to the response body.
- **Vanilla trap:** computing shares with `amount / sharePrice` and never reading the simulation.

### C17. Attribution and referral fields are sent correctly

Source: brief, contract step 6 (`calldata_origin` for attribution; optional `referral_fee`, max 200 bps).

- **0:** `calldata_origin` is never sent.
- **5:** `calldata_origin` is sent on some actions only, or `referral_fee` is sent above 200 bps or in the wrong unit.
- **10:** every action request carries `calldata_origin` from config; `referral_fee`, if used, is capped at 200 bps.
- **Evidence:** `path:line` of the request builder.

### C18. After confirmation, the app waits for the indexer

Source: brief, "Global rules" (refetch the position; pending until `last_indexed_block` ≥ the transaction block); A4 acceptance (refresh without manual reload).

- **0:** no refetch, or a single immediate refetch that shows stale data.
- **5:** a timed refetch or polling, but no comparison with the transaction block.
- **10:** after the receipt, the app shows a pending state and polls until the REST response's `last_indexed_block` is at least the receipt block, then shows the new position.
- **Evidence:** `path:line` of the polling.

## 5. Errors and resilience

### C19. API error codes map to user copy — FF

Source: brief, "Action error states" table.

- **0:** raw API messages or HTTP status codes are shown as the only text.
- **5:** some codes are mapped, but fewer than half of the codes the built actions can return, or the raw message is not available at all.
- **10:** at least `INSUFFICIENT_BALANCE`, `INSUFFICIENT_LIQUIDITY`, `POSITION_UNHEALTHY`, the expiry codes and the quote codes (Borrow), or `CAP_EXCEEDED` (Earn), map to plain copy with the UI behavior in the brief (disable confirm, offer the available amount, re-quote, restart); the raw `simulation.failure.message` sits behind a details toggle.
- **Evidence:** `path:line` of the map; forced-failure screenshots.

### C20. 429 and 503 are retried with backoff

Source: brief, error table (429, 503: retry with backoff, honour `Retry-After`); Actions docs (503 retryable; 429 may have no JSON body).

- **0:** no retry, or the app retries every error including 4xx/422.
- **5:** retries exist, but ignore `Retry-After` or are unbounded, or a 429 without a JSON body crashes the parser.
- **10:** bounded retries with backoff for 429 and 503 only, honouring `Retry-After`; non-JSON error bodies are handled.
- **Evidence:** `path:line` of the retry wrapper.

### C21. Unsupported chains and actions are hidden

Source: brief, "Chain coverage" (Midnight on 1, 8453, 5042, 4663 only; else 422 `ACTION_UNSUPPORTED`); error table (`ACTION_UNSUPPORTED` → hide the action); B1 acceptance (Midnight liquidity adapter disables deposit with the API's reason).

- **0:** unsupported actions are offered and fail with a raw error.
- **5:** `ACTION_UNSUPPORTED` shows a message but the action stays clickable.
- **10:** the action is hidden or disabled with the brief's copy when the chain or vault does not support it, and the API's reason is shown where the brief asks.
- **Evidence:** `path:line`.

### C22. Over-limit amounts are blocked before the POST — FF

Source: brief, A1 acceptance (a too-large amount is blocked before the POST); error table (`INSUFFICIENT_BALANCE` → disable confirm, show balance).

- **0:** any amount is posted; the wallet balance is not read.
- **5:** the wallet balance is checked, but not position size, available liquidity or, for Midnight, the bid quote.
- **10:** confirm is disabled with a reason when the amount exceeds wallet balance, position, available liquidity (Borrow and withdraw) or the Midnight quote's fill; the API's answer still decides (C13).
- **Evidence:** `path:line`; insufficient-balance forced-failure observation.

## 6. Units, selectors and display

### C23. Selectors use the right format per product

Source: brief, "Conventions" (Blue `{chainId}:{marketId}`; vault and token `{chainId}:{address}`; Midnight market ID alone).

- **0:** paths use a bare address or market ID where a chain prefix is required (or the reverse for Midnight), so calls 404.
- **5:** one product's selectors are right and another's wrong.
- **10:** every REST and Actions path uses the product's selector format.
- **Evidence:** `path:line` of URL builders.

### C24. Amounts stay integers in base units

Source: brief, "Conventions" (integer strings in base units, parsed as `bigint`, scaled by token decimals from `GET /v0/tokens/{selector}` only for display).

- **0:** amounts go through `Number`/`parseFloat` math, or request amounts are decimal strings.
- **5:** requests use base-unit strings, but decimals are hard-coded (for example 6 for USDC) or display math uses floats on raw values.
- **10:** inputs are parsed with `parseUnits` (or equivalent) into `bigint`, request amounts are integer strings, decimals come from the token route, and only display formatting converts.
- **Evidence:** `path:line` of parsing and formatting.
- **Vanilla trap:** `amount * 1e6`.

### C25. USD values use the token price route; missing prices show "—"

Source: brief, "Conventions" (USD = amount × `GET /v0/tokens/{selector}/price`; null ⇒ "—", never $0); A2 and B2 acceptance (missing price shows the token amount only).

- **0:** a null price shows `$0.00`, or USD comes from a hard-coded 1:1 stablecoin assumption.
- **5:** the token price route is used, but null handling is missing somewhere a price is shown.
- **10:** every USD figure uses the token price route, and a null price shows "—" (token amount still visible) and disables actions that need it.
- **Evidence:** `path:line`; screenshot or code path for null.

### C26. Loading and unknown values never show as zero

Source: brief, "Global rules" (skeletons, not zeros; unknown shows "—"); A2 acceptance (no debt shows "No debt", not health ∞).

- **0:** balances, rates or health show `0` or `∞` while loading or when unknown.
- **5:** skeletons on some cards, zeros on others.
- **10:** skeletons while loading, "—" for unknown, "No debt" for a debt-free position everywhere.
- **Evidence:** `path:line`.

### C27. Rates are realized averages driven by one `rateWindow`

Source: brief, "Conventions" (realized averages, never instant rates; one `rateWindow`, default 6h; route parameters per window; null for the window shows "—", no silent fallback).

- **0:** the app shows an instant rate (`apy`, `borrow_apy` from state) or mixes windows on one screen.
- **5:** averages are used, but the window is hard-coded per call, the Vault `lookback` value is wrong (for example `6h` instead of `six_hours`), or a null falls back to another window.
- **10:** one setting drives every rate (Blue `apy-averages` `6h`, Vault `/v1/.../apy-averages?lookback=six_hours`, Merkl over the same hours); null shows "—".
- **Evidence:** `path:line` of the setting and each rate fetch.

### C28. Every rate is labelled with its type and window

Source: brief, "Global rules" (every number has a unit, and rates their type: "variable, 6h avg", "fixed until {date}", "6h avg, excl. rewards"); B1 acceptance (APY label states its window).

- **0:** rates are shown as a bare "APY 4.2%".
- **5:** some rates are labelled, or the label does not follow the configured window.
- **10:** every rate shows its type and window, the label follows `rateWindow`, and Midnight fixed rates say "fixed" with the maturity date.
- **Evidence:** `path:line`; screenshot.

## 7. Health and risk display

Borrow builds only.

### C29. LTV, LLTV, health and liquidation price use the oracle correctly 

Source: brief, "Conventions" (oracle price scaled by 1e36, converts collateral to loan-token units); A2 table; "Position health bands".

- **0:** LTV or liquidation price uses USD prices, ignores the 1e36 scale, or is missing.
- **5:** the formulas are right, but LTV is not shown next to LLTV, or the health bands are missing.
- **10:** collateral value = collateral × oracle price / 1e36; LTV shown as "x% / LLTV%"; health factor and liquidation price per the A2 table; bands at ratio 0.85 and 0.95 with the brief's copy.
- **Evidence:** `path:line` of the math and band component.
- **Vanilla trap:** LTV from USD prices.

### C30. The app warns once per band change 

Source: brief, A3 (poll every 30–60 s; alert when the band changes, once per change, linking to the fix; Midnight alerts at maturity −7 d, −1 d and at maturity).

- **0:** no warning beyond the static band.
- **5:** a warning shows, but it repeats on every poll, polls faster than every 30 s, or has no link to add collateral / repay.
- **10:** polls at 30–60 s, raises one alert per band change linking to A4, and adds the Midnight maturity reminders.
- **Evidence:** `path:line`.

## 8. Earn (Vault V2)

### C31. Vault reads use the right routes and versions

Source: brief, B1 reads and B2 table (Vault V2 state, APY and positions are on `/v1`; metadata on `/v0`; earned from `position/performance`).

- **0:** the app uses Vault V1 routes, or V2 state/APY/positions on `/v0`, so data is missing.
- **5:** routes are right, but earned to date is deposits minus withdrawals, or the curator, total deposits or "you will receive" preview is missing.
- **10:** `GET /v0/vaults-v2/{v}`, `GET /v1/vaults-v2/{v}/state`, `/v1/.../apy-averages`, `GET /v1/vaults-v2/users/{u}/positions`, curator route, and `net_earnings_assets` from the performance route.
- **Evidence:** `path:line` of each fetch.

### C32. Deposit uses the Vault V2 action with the right funding

Source: brief, B1 action (`POST /v0/actions/vaults-v2/{v}/deposit` with `amount`, `funding` (`native` for wrapped-native vaults), `signature_mode: auto`).

- **0:** deposit is not built through the Vault V2 action.
- **5:** the action is used, but `funding` is wrong for a wrapped-native vault, or `signature_mode` is never set so permits are never used.
- **10:** `amount` in base units, `funding` chosen from the vault asset, `signature_mode: auto`.
- **Evidence:** `path:line` of the request body; HAR entry.

### C33. Withdraw all uses `{unit: "all"}`

Source: brief, B3 action and acceptance (Max withdraws the full position with `unit: all`, leaving no dust).

- **0:** Max sends the displayed balance as an assets amount.
- **5:** Max sends shares from a REST read (can leave dust or fail after accrual).
- **10:** Max sends `amount: {unit: "all"}`; partial withdrawals send `assets`.
- **Evidence:** `path:line`; HAR entry.

### C34. A liquidity shortfall offers what can leave now and the forced exits — FF

Source: brief, B3 (read `withdrawable_assets` and `withdrawal-options`; on 422 `INSUFFICIENT_LIQUIDITY` offer the amount in `details`, then `force-withdraw` with `max_penalty_bps` and the penalty shown in token terms, or `redeem-in-kind`).

- **0:** the shortfall shows a generic error or fails silently.
- **5:** the app offers the amount from `details` but no forced exit, or offers `force-withdraw` without showing the penalty first.
- **10:** shows withdrawable now before the request; on the shortfall offers the `details` amount, `force-withdraw` with `max_penalty_bps` and the penalty in token units, and `redeem-in-kind` where supported.
- **Evidence:** `path:line`; liquidity-shortfall forced-failure observation.

### C35. Reward APR and Net APY follow the Merkl recipe

Source: brief, B2 rows "Net APY" and "Reward APR"; "Rewards by default"; "Acceptance (rewards)".

- **0:** rewards are ignored on a vault with a live campaign, or `totalApr`/`nativeApr` is used.
- **5:** `apr-records` are used, but over another window, without dropping `hasUntrustedContribution`, or a Merkl failure relabels native APY as net.
- **10:** opportunities filtered by `identifier={vault}`, hourly `apr-records` over the `rateWindow` hours, untrusted contributions dropped, Net APY = native + reward with the split in a tooltip, "—" when Merkl fails, reward rows hidden with no campaign; rewards earned uses `amount + pending`.
- **Evidence:** `path:line` of the Merkl client and the math.

### C36. Claims go to the Merkl Distributor with cumulative amounts

Source: brief, B3 "Claim rewards" (filter `amount > claimed` with non-empty `proofs`; `claim(users, tokens, amounts, proofs)` on `0x3Ef3D8bA38EBe18DB133cEc108f4D14CE00Dd9Ae` with the cumulative `amount`; prompt after withdraw all; works after a full exit).

- **0:** no claim, or a claim built through a non-existent Actions route.
- **5:** a claim exists, but sends `amount − claimed`, includes entries without proofs, or is not offered after withdraw all.
- **10:** follows the recipe exactly and shows "You still have {x} in rewards to claim" after withdraw all.
- **Evidence:** `path:line` of the claim builder.

## 9. Borrow on Blue

### C37. Opening a loan is one atomic Blue borrow action

Source: brief, A1 action (`POST /v0/actions/blue/markets/{m}/borrow` with `amount`, `collateral_amount`, `funding`; one call supplies collateral and borrows).

- **0:** the borrow is not built through the Blue borrow action.
- **5:** two separate actions (supply collateral, then borrow), so the user signs twice and can be left half-done.
- **10:** one borrow request with `amount` and `collateral_amount` (and `funding`) when collateral is added in the same step.
- **Evidence:** `path:line`; HAR entry.

### C38. Max borrow and the LTV slider respect LLTV and liquidity

Source: brief, A1 math and acceptance (Max never produces a transaction the API rejects for health); A1b (slider max = min(LLTV − buffer, LTV reachable with `market_liquidity` + `reallocatable_liquidity`); "Only {x} available to borrow now"); A1b Midnight math.

- **0:** Max uses LLTV with no buffer or ignores liquidity, so Max can return `POSITION_UNHEALTHY` or `INSUFFICIENT_LIQUIDITY`.
- **5:** a buffer is applied, but liquidity ignores `reallocatable_liquidity`, or the slider and amount drift out of sync.
- **10:** Max and the slider stop at the lower of the LLTV buffer and available liquidity, with the brief's message when liquidity limits; amount and slider stay in two-way sync and agree with the simulation to 0.1 pp.
- **Evidence:** `path:line` of the max computation; liquidity forced-failure observation.

### C39. Debt and exits use shares correctly

Source: brief, "Conventions" (shares → assets, round debt up with the `+1` / `+1e6` virtual amounts); A4 (repay with `amount.unit: assets`); A5 (repay all with `amount: {unit: "all"}` plus `collateral_amount` in one call; show `max_repay_assets`).

- **0:** debt is shown from `borrow_shares` scaled like an amount, or repay-all sends the displayed debt as assets (leaves dust or reverts).
- **5:** the debt formula is right, but closing the loan takes two actions, or rounds down.
- **10:** debt from shares with the brief's formula rounded up (or from an API field that already does it); close sends `{unit: "all"}` and `collateral_amount` in one request and shows `max_repay_assets` before signing.
- **Evidence:** `path:line` of the debt math and exit request.

## 10. Borrow on Midnight

### C40. Midnight borrow and exits use quotes, guards and the right repay type

Source: brief, A1 Midnight reads and action (`GET .../books/{id}/bids/quote`, `collateral_supplies`, `funding`, `guard` with `slippage` or `max_rate`); A1b (quote on slider release, debounced); A2 (`debt` face value, `effective_apr`, `maturity` countdown); A5 (at maturity `type: direct` with `{unit: "all"}` and `collateral_withdrawals`; early exit via `asks/quote` with `type: market` and a `guard`, always showing the face-value alternative); error table (quote codes → re-quote and reconfirm).

Score the four parts and average them (each 0, 5 or 10):

| Part | 0 | 5 | 10 |
| --- | --- | --- | --- |
| Quote | no quote, or a rate computed from the book on the client only | quote fetched on every keystroke or slider tick | debounced quote for the typed amount; 422 `INSUFFICIENT_LIQUIDITY` blocks the amount |
| Borrow request | not the Midnight borrow action | no `guard` | `collateral_supplies`, `funding` and a `guard` |
| Position | Blue-style shares math applied to Midnight | `debt` shown but no maturity or `effective_apr` | face-value `debt`, `effective_apr`, maturity countdown, per-collateral LLTV |
| Exit | none | direct repay only | direct repay at maturity with `{unit: "all"}` + `collateral_withdrawals`; early exit through `asks/quote` + `type: market` + `guard`, shown next to face value, falling back to direct when the quote 422s; quote errors re-quote and need a new confirmation |

- **Evidence:** `path:line` per part.
- **Vanilla trap:** treating Midnight as another Blue market.

---

## Scoring sheet

The grader returns one JSON object per app, with one row per criterion:

```json
{
  "app_id": "earn-7f3a",
  "build": "earn",
  "forced_failures": {
    "insufficient_balance": "observed | not reachable | not run",
    "liquidity_shortfall": "observed | not reachable | not run",
    "expired_action": "observed | not reachable | not run"
  },
  "criteria": [
    { "id": "C01", "score": 10, "evidence": ["app/api/actions/route.ts:12", "no match for MORPHO in .next/static"], "note": "" }
  ]
}
```

`score` is an integer 0–10 or `"N/A"`. `evidence` is required for every score
above 0.
