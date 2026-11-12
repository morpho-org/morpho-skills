# Morpho integration review

Apply shared sections and only the selected product’s scoped sections. Read only its product references; preserve separate product/version verdicts.

## Scope

Use for audit, QA, pre-launch or full review. **Review-only:** do not edit code, copy, configuration or external state unless fixes are separately requested. Do not execute dangerous transactions to manufacture evidence; use controlled fixtures and label them.

Reference sources: [REST](https://docs.morpho.org/api/), [Actions](https://api.morpho.org/actions/docs), [Actions OpenAPI](https://api.morpho.org/actions/docs/openapi.json), [Merkl](https://developers.merkl.xyz/api-reference/get/v4/opportunities). Follow [SKILL.md](../SKILL.md); do not replace its verified route contracts with inferred conventions.

## 1. Classify scope

| Product | Scope |
| --- | --- |
| Earn | Default to Vault V2; include Vault V1 only when requested or evidenced. Read [vault-v2.md](vault-v2.md), including compatibility routes/chains. Identify chain + vault address, asset, curator and selected version; do not silently substitute direct Blue supply. Grade V1 separately when present; V2-only force/in-kind criteria are `N-A` for V1, not missing V1 features. |
| Borrow | Classify artifacts as Blue (variable/no maturity), Midnight (fixed rate/fixed maturity), or both. Midnight is not restricted to one chain: Actions supports `1, 4663, 5042, 8453`. Read [blue.md](blue.md) and/or [midnight.md](midnight.md). Unknown product ⇒ `UNVERIFIED` pending identity evidence. Tag shared artifacts; never transfer a Blue verdict to Midnight or collapse both into one verdict. |

## Verdict semantics

- `PASS` requires direct artifacts for every applicable supplied surface/state.
- `FAIL` requires an observed defect with file/line, request/response, screen or reproduction.
- `UNVERIFIED` means evidence is missing; name the exact artifact/test.
- `N-A` means genuinely outside scope; explain it, never hide absent evidence.
- Any confirmed Critical defect makes the affected product `FAIL` and blocks release. Recommended defects also make the overall verdict `FAIL`, but remain separately prioritized in the release recommendation. With no confirmed defect, missing required evidence makes the verdict `UNVERIFIED`; only all applicable non-open criteria passing supports `PASS`.
- Open questions are tracked as `UNVERIFIED`/open, not `FAIL` for lacking a design/API value, and are not by themselves release blockers for unrelated supported stories. Fabricating a value, claiming an unsupported outcome or sending an unsafe action is a separate Critical `FAIL`. A product cannot claim the unresolved capability passed.

## 2. Establish evidence and run eight checkers

When delegation is available, run one read-only worker per checker **in parallel**. Supply artifact paths, scope, known runtime limits and these verdict semantics. Require the worker to read its entire prompt and current skill/reference, stay within owned checks, make no edits and return evidence tables separately for every scoped vault version and for Blue/Midnight.

Inventory routes/screens/copy for every scoped story, REST/Merkl clients and response artifacts, backend key handling, copied Actions helper/proof path, signature/continuation/send/receipt traces, math/rate utilities, cache/retry code, tests/fixtures and runtime screenshots. Missing UI/runtime evidence cannot be replaced by a successful build.

1. [vocabulary-compliance.md](checkers/vocabulary-compliance.md)
2. [attribution-compliance.md](checkers/attribution-compliance.md)
3. [disclosure-compliance.md](checkers/disclosure-compliance.md)
4. [rate-transparency-compliance.md](checkers/rate-transparency-compliance.md)
5. [conversion-compliance.md](checkers/conversion-compliance.md)
6. [clarity-safety-compliance.md](checkers/clarity-safety-compliance.md)
7. [discoverability-compliance.md](checkers/discoverability-compliance.md)
8. [math-correctness.md](checkers/math-correctness.md)

If delegation is unavailable run all eight sequentially; never skip after an early failure. Downgrade unsupported `PASS` or unlocated `FAIL` to `UNVERIFIED`. Deduplicate findings without erasing checker-owned verdicts.

## 3. Shared contract and forced-failure matrix

Evaluate these rows yourself after the checkers; checker summaries are not acceptance proof. Use independent applicability for V2/V1 and Blue/Midnight. Fill every row with verdict, evidence, impact and smallest fix; initial `UNVERIFIED` is a placeholder, not a reviewed result.

| ID | Priority | Acceptance criterion | Verdict | Evidence / impact / smallest fix |
| --- | --- | --- | --- | --- |
| CON-01 | Critical | Displayed protocol numbers come only from REST reads; rewards from Merkl, wallet balances from the wallet. Indexed reads are not treated as atomic execution state. | `UNVERIFIED` | Supply artifact or justify `N-A`. |
| CON-02 | Critical | The Actions key stays server-side; browser requests go through the backend. No key/signature/private-key exposure in logs, fixtures or reports. | `UNVERIFIED` | Supply artifact or justify `N-A`. |
| CON-03 | Critical | Step 1: POST the route-specific intent with sending `account` and selected `chain_id`; require configured four-byte hex `calldata_origin` in the top-level JSON intent body, not headers/nested fields. Missing configuration blocks launch; continuation bodies stay continuation-only. Inspect the successful `data` envelope and `data.status`. | `UNVERIFIED` | Supply artifact or justify `N-A`. |
| CON-04 | Critical | Step 2: review `signatures[].{id,kind,typed_data}`, verify chain/domain, obtain consent, sign, and continue on the same path with only `continuation` and matching unique `{id,signature}` entries. | `UNVERIFIED` | Supply artifact or justify `N-A`. |
| CON-05 | Critical | Continuation is bounded to at most 3 rounds; more than 60 seconds remain before `expires_at` for each signature. Expiry/refresh/invalid continuation restarts the intent without continuation. | `UNVERIFIED` | Supply artifact or justify `N-A`. |
| CON-06 | Critical | Step 3: only `prepared` + `simulation.status: success` may send `calls`; sending account/chain match, `to`/`data`/`value` remain unchanged and ordered, and action is unexpired. | `UNVERIFIED` | Supply artifact or justify `N-A`. |
| CON-07 | Critical | Atomic wallet batching is used only when supported; otherwise wait for sequential confirmations. Stop on first failure, reconcile submitted calls/receipts, never blindly resend approvals or remaining calls. | `UNVERIFIED` | Supply artifact or justify `N-A`. |
| CON-08 | Critical | Step 4: `simulation_failed` / `simulation.status: failed` sends nothing; show mapped error and raw `simulation.failure.message` only in details; never silently loosen safeguards. | `UNVERIFIED` | Supply artifact or justify `N-A`. |
| CON-09 | Critical | Step 5: copy the Actions docs' TypeScript `postAction`/`runAction` helper, do not rewrite it. Verify `Morpho-Action-Proof` before typed data/calls: `ES256`, `kid`/same-origin JWKS, `typ`, issuer/audience/subject, freshness/expiry and exact request/response binding; fail closed. | `UNVERIFIED` | Supply artifact or justify `N-A`. |
| CON-10 | Critical | Step 6: previews apply `simulation.position_changes` deltas to REST baseline and show signed `wallet_changes`, not alleged complete snapshots. Refresh inconsistent baselines. | `UNVERIFIED` | Supply artifact or justify `N-A`. |
| CON-11 | Critical | One review surface lists signatures/calls in order; pending final calls are labeled pending, each signature has consent, and final calls are reviewed before send. | `UNVERIFIED` | Supply artifact or justify `N-A`. |
| CON-12 | Critical | Amounts/units, funding objects, `signature_mode`, guards, expiry and optional fields exactly match the route schema; `calldata_origin` is 4-byte hex, `referral_fee` is accepted only where supported, `bps` 1–200, recipient/cost/net receipt disclosed. | `UNVERIFIED` | Supply artifact or justify `N-A`. |
| CON-13 | Critical | Raw quantities use bigint/base units and token/share decimals. Null price ⇒ token amount plus “—”, never $0; unknown/loading does not become zero. | `UNVERIFIED` | Supply artifact or justify `N-A`. |
| CON-14 | Critical | Error codes map to the skill's copy/behavior table; retain inputs, use validated `details` only, refresh the relevant liquidity read if absent, offer known smaller amounts, expose raw message/`request_id` in details. Unknown codes fail safely. | `UNVERIFIED` | Supply artifact or justify `N-A`. |
| CON-15 | Critical | Receipt triggers position/wallet refetch; pending remains until `last_indexed_block` ≥ transaction block where present, otherwise poll/reconcile. Receipt alone is not an updated indexed UI. | `UNVERIFIED` | Supply artifact or justify `N-A`. |
| CON-16 | Recommended | Cache metadata/config, paginate full lists, respect 750 requests/min/IP and 30–60 s position polling. Reads and Actions POSTs retry only HTTP 429/503 with bounded exponential backoff/jitter (≤3 retries), respecting `Retry-After` seconds/HTTP-date; no other 4xx retries or wallet auto-resubmission. Exercise non-JSON/empty errors and exhaustion without a JSON-parser crash. | `UNVERIFIED` | Supply artifact or justify `N-A`. |
| CON-17 | Critical | Reference pointers are restricted to REST API pages, Actions docs/OpenAPI and Merkl API references. No obsolete read/write integration workflow or tutorial pointer replaces the current contract. | `UNVERIFIED` | Supply artifact or justify `N-A`. |
| FORCE-01 | Critical | Force insufficient wallet balance: show “Not enough {token} in your wallet.” with balance, disable confirmation and send nothing. | `UNVERIFIED` | Supply artifact or justify `N-A`. |
| FORCE-02 | Critical | Force liquidity shortfall: show known available amount and offer a smaller amount plus supported product-specific alternatives; never invent unknown availability, and preserve explicit consent. Earn: reach this UI without a funded wallet using a dev-only non-signing fixture/override; show supported force-withdraw with maximum penalty and redeem-in-kind with positions received, explaining unavailable alternatives. | `UNVERIFIED` | Supply artifact or justify `N-A`. |
| FORCE-03 | Critical | Force an expired action: stop before signing/sending, discard continuation, fetch a new action and require confirmation. Borrow: using a controlled clock/response fixture, exercise the signing UI at 61 s and 59 s remaining; at ≤60 s disable signing, show “Action expiring — restart required” and a Restart action control. Verify restart and that expired actions never send; a dead helper is not evidence. | `UNVERIFIED` | Supply artifact or justify `N-A`. |

### Earn

Actions-only contract rows apply to Actions transactions, not the separate Merkl Distributor claim. For Claim, grade the explicit claim rows and shared source/consent/simulation/reconciliation rules; do not demand a nonexistent Actions endpoint or action-response proof.

| ID | Priority | Acceptance criterion | Verdict | Evidence / impact / smallest fix |
| --- | --- | --- | --- | --- |
| EARN-01 | Critical | Use verified V2 versions: `/v1` state/APY averages; `/v0` config, positions, performance, history, withdrawal-options; curator `/details`. User positions use the published GET `/v0/vaults-v2/users/{user-address}/positions`, not a version inferred from state routes. V1 uses its own `/v0/vaults-v1` reads and deposit/withdraw Actions chain list. | `UNVERIFIED` | Supply artifact or justify `N-A`. |
| EARN-02 | Critical | Share preview includes share/asset decimals and RAY price. V2 zero `maxDeposit`/`maxMint`/`maxWithdraw`/`maxRedeem` never mean zero capacity/position. | `UNVERIFIED` | Supply artifact or justify `N-A`. |
| EARN-03 | Critical | Use one `rateWindow` for native APY and Merkl APR; rewards-by-default leads with Net APY/Total earned and split for live campaigns; no campaign hides reward rows, not failed-fetch errors or past claims. | `UNVERIFIED` | Supply artifact or justify `N-A`. |
| EARN-04 | Critical | Force/in-kind schema and consent distinguish outcomes: exact-assets vs all force variants, preparation-only penalty cap, residual shares, conditional in-kind 2% coverage, selected allocated same-chain Blue market and Midnight-adapter exclusions. | `UNVERIFIED` | Supply artifact or justify `N-A`. |
| EARN-05 | Critical | Claim is the explicit no-Actions-route exception: align users/tokens/cumulative amounts/proofs, selected distribution chain and verified Distributor, positive standard ERC-20 `TREE` entries with nonempty proofs. Never replace cumulative amount with campaign subtotal. | `UNVERIFIED` | Supply artifact or justify `N-A`. |
| EARN-06 | Critical | Vault analytics scope campaign breakdowns; chain-wide claims retain full proofs/amounts. Respect `distributionChainId`, unsupported ledger/points/wrappers, recipient exceptions and post-claim `reloadChainId`. | `UNVERIFIED` | Supply artifact or justify `N-A`. |
| OPEN-DESIGN | Recommended | Open: app color tokens, error copy and empty states require design evidence; no borrowed health-band requirement on Earn. | `UNVERIFIED` | Supply artifact or justify `N-A`. |
| OPEN-MERKL | Recommended | Open: hourly retention/averaging semantics are not vendor-guaranteed; live `avg`/`hasUntrustedContribution` fields do not prove the coverage-weighted formula. | `UNVERIFIED` | Supply artifact or justify `N-A`. |
| OPEN-CADENCE | Recommended | Open: root-update “~8 h” cadence is unverified; pending ~2 h is not claimable-root timing. | `UNVERIFIED` | Supply artifact or justify `N-A`. |
| OPEN-DISTRIBUTOR | Recommended | Open: chain-specific Distributor deployment/configured recipient where evidence is unavailable; no universal address or wallet receipt guarantee. | `UNVERIFIED` | Supply artifact or justify `N-A`. |

### Borrow — Blue and Midnight

| ID | Priority | Acceptance criterion | Verdict | Evidence / impact / smallest fix |
| --- | --- | --- | --- | --- |
| BOR-01 | Critical | Blue identity uses exact market ID/params, not pair symbols. Blue/token selectors are chain-prefixed; Midnight REST IDs are bare, Actions selectors are `{chain_id}:{market_id}`. Enforce each Actions chain list. | `UNVERIFIED` | Supply artifact or justify `N-A`. |
| BOR-02 | Critical | Oracle `price` scales by 1e36; Blue debt shares→assets round up using virtual +1 assets/+10^6 shares, supply rounds down. Midnight units are debt at maturity; rate guards are WAD per-second, cost basis WAD-scaled. | `UNVERIFIED` | Supply artifact or justify `N-A`. |
| BOR-03 | Critical | Single `rateWindow` controls Blue realized averages and Merkl buckets; null window stays unknown, never instant/fallback. Midnight fixed rates ignore it. | `UNVERIFIED` | Supply artifact or justify `N-A`. |
| BOR-04 | Critical | Health uses LTV/LLTV and before→after, multi-collateral capacity uses weighted LLTV. Proposed bands remain labeled proposed. Bids for borrow, asks for early repay; direct repay fallback is explicit, never silently selected. | `UNVERIFIED` | Supply artifact or justify `N-A`. |
| OPEN-BANDS | Recommended | Open: thresholds, color tokens/copy and empty-state parity remain `UNVERIFIED` until app-team design evidence; test band-change mechanics with labeled fixtures. | `UNVERIFIED` | Supply artifact or justify `N-A`. |
| OPEN-MAX | Recommended | Open: numeric Max buffer below LLTV must match Actions; missing published value is `UNVERIFIED`, not invented. | `UNVERIFIED` | Supply artifact or justify `N-A`. |
| OPEN-BLUE-FEED | Recommended | Open for Blue: history collateral drop without a user withdrawal is only an interim signal, not proof of liquidation/date/seized amounts. | `UNVERIFIED` | Supply artifact or justify `N-A`. |
| OPEN-COST-BASIS | Recommended | Open for Midnight: interest-owed accounting interpretation of `cost_basis`, despite known WAD scaling. | `UNVERIFIED` | Supply artifact or justify `N-A`. |
| OPEN-ROLL | Recommended | Open: rolling Midnight into Blue/Midnight and margin are not silently required shipped flows. Roll events are not liquidation events. | `UNVERIFIED` | Supply artifact or justify `N-A`. |
| OPEN-MERKL | Recommended | Open: Merkl recipe/schema confirmation remains as scoped by the Borrow skill; missing confirmation is not proof the vendor guarantees the formula. Any surfaced ~8 h root cadence remains unverified; do not invent a schedule. | `UNVERIFIED` | Supply artifact or justify `N-A`. |

## 4. Product story acceptance matrix

Read source acceptance for selected products: [Vaults](vault-v2.md), [Blue](blue.md), [Midnight](midnight.md). Evaluate each clause separately; retain independent verdict/evidence columns per product for mixed apps.

| IDs (grade each product separately) | Priority | Acceptance criterion | Verdict | Evidence / impact / smallest fix |
| --- | --- | --- | --- | --- |
| EARN-B1-01 | Critical | APY label states its window (“6h avg”) and says rewards are separate when shown. | `UNVERIFIED` | Supply artifact or justify `N-A`. |
| EARN-B1-02 | Critical | A vault using a Midnight liquidity adapter disables deposit with the API reason. | `UNVERIFIED` | Supply artifact or justify `N-A`. |
| EARN-B2-01 | Critical | Earned-to-date uses the performance route, not deposits minus withdrawals. | `UNVERIFIED` | Supply artifact or justify `N-A`. |
| EARN-B2-02 | Critical | Missing price shows token amount only. | `UNVERIFIED` | Supply artifact or justify `N-A`. |
| EARN-B2-rewards-01 | Critical | Reward APR and native APY use the same six-hour window by default (or same selected supported window). | `UNVERIFIED` | Supply artifact or justify `N-A`. |
| EARN-B2-rewards-02 | Critical | Failed Merkl fetch shows Net APY “—” with native APY visible, never native relabeled as net. | `UNVERIFIED` | Supply artifact or justify `N-A`. |
| EARN-B2-rewards-03 | Critical | Rewards earned uses scoped `amount + pending`; claimable uses scoped `amount − claimed`. | `UNVERIFIED` | Supply artifact or justify `N-A`. |
| EARN-B3-01 | Critical | Max uses `unit: all` and leaves no dust on a supported liquid exit. | `UNVERIFIED` | Supply artifact or justify `N-A`. |
| EARN-B3-02 | Critical | Partial liquidity never fails silently and shows the force-exit penalty in token terms before signing. | `UNVERIFIED` | Supply artifact or justify `N-A`. |
| EARN-B3-03 | Critical | Verify remaining shares; do not promise dust-free force exits. | `UNVERIFIED` | Supply artifact or justify `N-A`. |
| EARN-B3-04 | Critical | Full exit hides zero active rows and preserves Claim access. | `UNVERIFIED` | Supply artifact or justify `N-A`. |
| EARN-Claim-01 | Critical | After confirmation and read reconciliation, claimable drops to zero and default-recipient standard ERC-20 wallet balance rises by the amount. | `UNVERIFIED` | Supply artifact or justify `N-A`. |
| EARN-Claim-02 | Critical | Configured-recipient exceptions are disclosed. | `UNVERIFIED` | Supply artifact or justify `N-A`. |
| EARN-Claim-03 | Critical | Withdraw all prompts “You still have {x} in rewards to claim” when claimable > 0. | `UNVERIFIED` | Supply artifact or justify `N-A`. |
| EARN-Claim-04 | Critical | Claim works after full withdrawal. | `UNVERIFIED` | Supply artifact or justify `N-A`. |
| BLU-A1-01, MID-A1-01 | Critical | Preview matches `simulation.position_changes` applied as deltas. | `UNVERIFIED` | Supply artifact or justify `N-A`. |
| BLU-A1-02 | Critical | Max does not promise a rejection-free amount while the Actions health buffer is open; unavailable numeric-buffer evidence stays `UNVERIFIED`, not invented. | `UNVERIFIED` | Supply artifact or justify `N-A`. |
| BLU-A1-03 | Critical | Amounts above known available liquidity are blocked before POST; sending requires successful simulation. | `UNVERIFIED` | Supply artifact or justify `N-A`. |
| BLU-A1b-01, MID-A1b-01 | Critical | Slider, LTV input and loan amount always agree. | `UNVERIFIED` | Supply artifact or justify `N-A`. |
| BLU-A1b-02, MID-A1b-02 | Critical | Thumb cannot pass the max; liquidity-limited movement stops with “Only {x} available to borrow now”. | `UNVERIFIED` | Supply artifact or justify `N-A`. |
| BLU-A1b-03, MID-A1b-03 | Critical | Preview LTV matches the LTV implied by `simulation.position_changes` within 0.1 pp. | `UNVERIFIED` | Supply artifact or justify `N-A`. |
| BLU-A1b-04, MID-A1b-04 | Critical | Changing collateral re-solves borrowing at the same target LTV. | `UNVERIFIED` | Supply artifact or justify `N-A`. |
| BLU-A1b-05, MID-A1b-05 | Critical | Safe-Max numeric-buffer evidence remains explicitly open until verified. | `UNVERIFIED` | Supply artifact or justify `N-A`. |
| BLU-A2-01, MID-A2-01 | Critical | No debt shows “No debt”, not health infinity. | `UNVERIFIED` | Supply artifact or justify `N-A`. |
| BLU-A2-02, MID-A2-02 | Critical | Null oracle/token price shows “—” and disables actions that require it. | `UNVERIFIED` | Supply artifact or justify `N-A`. |
| BLU-A3-01, MID-A3-01 | Critical | An alert fires on a band change, never more than once per change, and links directly to A4. | `UNVERIFIED` | Supply artifact or justify `N-A`. |
| BLU-A4-01 | Critical | Confirmation refreshes the screen and clears the band without manual reload only when the target is reached. | `UNVERIFIED` | Supply artifact or justify `N-A`. |
| BLU-A4-02 | Critical | Pending remains until indexed state reconciles; a missed target is explained rather than falsely clearing the band. | `UNVERIFIED` | Supply artifact or justify `N-A`. |
| BLU-A5-01 | Critical | Full exit hides zero-debt/zero-collateral positions from the active list even when an indexed row remains. | `UNVERIFIED` | Supply artifact or justify `N-A`. |
| BLU-A5-02 | Critical | Released collateral appears in wallet balance. | `UNVERIFIED` | Supply artifact or justify `N-A`. |
| BLU-A5-03 | Critical | Pending remains until position and wallet reconcile; debt dust prevents a full-exit success claim. | `UNVERIFIED` | Supply artifact or justify `N-A`. |
| BLU-A6-01 | Critical | With verified liquidation evidence, persistent banner shows date, seized collateral, debt cleared, remaining amounts and safe remaining-collateral withdrawal. | `UNVERIFIED` | Supply artifact or justify `N-A`. |
| BLU-A6-02 | Critical | With only the interim history signal, show possible liquidation and unknown event details; exact-event acceptance stays `UNVERIFIED` (API gap). | `UNVERIFIED` | Supply artifact or justify `N-A`. |
| MID-A1-02 | Critical | Do not promise rejection-free Max until the Actions health buffer is verified (open). | `UNVERIFIED` | Supply artifact or justify `N-A`. |
| MID-A1-03 | Critical | Too-large borrowing is blocked using the bids quote before POST; never send a failed simulation. | `UNVERIFIED` | Supply artifact or justify `N-A`. |
| MID-A2-03 | Critical | Interest owed stays unknown/`UNVERIFIED` until `cost_basis` accounting is resolved; do not fabricate principal. | `UNVERIFIED` | Supply artifact or justify `N-A`. |
| MID-A3-02 | Critical | Maturity alerts fire at −7d, −1d and maturity once each. | `UNVERIFIED` | Supply artifact or justify `N-A`. |
| MID-A3-03 | Critical | Unknown health is not reported healthy. | `UNVERIFIED` | Supply artifact or justify `N-A`. |
| MID-A4-01 | Critical | Confirmation refreshes the screen and clears the band without manual reload when target is reached. | `UNVERIFIED` | Supply artifact or justify `N-A`. |
| MID-A4-02 | Critical | Re-poll until indexed changes reconcile; explain a missed target rather than falsely clearing the band. | `UNVERIFIED` | Supply artifact or justify `N-A`. |
| MID-A5-01 | Critical | Full exit disappears from the active list when debt, credit and collateral are zero, with released collateral in wallet. | `UNVERIFIED` | Supply artifact or justify `N-A`. |
| MID-A5-02 | Critical | Early-exit screen always shows market cost/price and direct face-value alternative. | `UNVERIFIED` | Supply artifact or justify `N-A`. |
| MID-A5-03 | Critical | Re-poll indexed state and inspect residual debt; do not declare full exit from receipt alone. | `UNVERIFIED` | Supply artifact or justify `N-A`. |
| MID-A6-01 | Critical | Verified liquidation shows persistent date, seized collateral, cleared debt and remaining amounts, plus safe remaining-collateral withdrawal. | `UNVERIFIED` | Supply artifact or justify `N-A`. |
| MID-A6-02 | Critical | Empty events show no liquidation, not fabricated event data. | `UNVERIFIED` | Supply artifact or justify `N-A`. |
| MID-A6-03 | Critical | Transaction history remains available after the active position disappears. | `UNVERIFIED` | Supply artifact or justify `N-A`. |

## Red-flag pass

Search every supplied data/action path and rendered state, even if a checker found nothing:

- Hand-built calldata where an Actions route exists; sending without verified proof, after `simulation_failed`, with modified/reordered calls, or with mismatched account/chain.
- API key in browser/bundle, logs containing secrets/signatures, unbounded signature rounds, ≤60 s remaining at signing, expired continuation reuse or blind wallet resubmission.
- Displayed protocol numbers from a non-REST path, or indexed snapshots treated as atomic execution truth.
- Instant variable rates, mixed native/reward windows, fabricated missing rates, null price rendered $0, or native APY relabeled as net.
- Full repay/Max liquid exit estimated from an assets snapshot instead of `unit: all` where supported; do not demand unsupported `all` on Midnight market repay or in-kind exact-assets exits.
- Unreviewed force/in-kind/direct-vs-market fallback; unsupported action-chain assumptions.
- Obsolete external read/write guidance, missing official Powered by Morpho attribution, bypassable disclosure, or guaranteed/risk-free claims.

A confirmed red flag is Critical `FAIL` for the affected product, with evidence. Missing artifacts are `UNVERIFIED`. Open design/API values alone are not red flags.

- **Earn:** Earn red flags: V2 zero-max gating; unsupported Midnight-adapter deposit/force exit; in-kind described as all cash; penalty cap presented as on-chain protection; wrong campaign totals/proofs; expired/stale claim proof reuse; post-exit Claim hidden.

- **Borrow:** Product-specific red flags: wrong bid/ask side; chain fixed to one Midnight network; fabricated liquidation event from Blue snapshots; missing maturity/repay path; mixed fixed/variable rate labels; residual debt called closed; unsupported `unit: all` on Midnight market repay.

## Final report

Return in this order:

1. **Scope classification and evidence limits:** named products, versions/chains, surfaces, runtime checks, fixtures and missing artifacts.

2. **Product verdicts:** `PASS`/`FAIL`/`UNVERIFIED`, separately for scoped V2/V1, Blue and Midnight, with Critical/Recommended counts; distinguish unresolved open rows.
3. **Critical findings:** ordered by user-loss/compliance risk, row/checker ID, exact evidence, impact and smallest fix.
4. **Recommended findings:** same structure.
5. **Acceptance matrices:** every applicable contract, forced-failure and story row, including passes, open and `N-A` reasons.
6. **Checker summary:** eight lines per product, retaining disagreements and unsupported claims.
7. **Red flags:** confirmed or unverified, by product.
8. **Release recommendation per product:** ship/do not ship/blocked on evidence, minimum retest set and whether products can ship independently.

Do not implement fixes in review mode. If fixes are requested later, preserve the report baseline and rerun affected rows plus every prior Critical failure.
