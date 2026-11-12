# Math correctness — Earn and Borrow

Apply shared sections and only the selected product’s scoped sections. Read only its product references; preserve separate product/version verdicts.

## Scope

### Earn

Read-only; do not edit code/copy/configuration or external state. Read [SKILL.md](../../SKILL.md), [review.md](../review.md) and [vault-v2.md](../vault-v2.md) for current route contracts and every story acceptance line. Grade V2 and scoped V1 compatibility separately; V2-only illiquid actions do not apply to V1.

### Borrow — Blue and Midnight

Read-only; do not edit code/copy/configuration or external state. Read [SKILL.md](../../SKILL.md), [review.md](../review.md) and [blue.md](../blue.md) / [midnight.md](../midnight.md) for current route contracts and every story acceptance line. Grade Blue and Midnight separately; shared helpers do not imply shared correctness.

## Owned checks

| Check | Priority | Pass condition |
| --- | --- | --- |
| Sources/selectors/chains | Critical | REST-only displayed protocol data, Merkl rewards and wallet balances; exact product selector, chain/action coverage and route version. Indexed/non-atomic state is a display baseline, successful Actions simulation validates execution. |
| Bigint and units | Critical | All raw assets/shares/rates/oracles/fees use bigint/rational arithmetic; no float/Number coercion, hardcoded 18 token decimals, early formatting, wrong sign or unsafe JSON conversion. Zero/null inputs cannot cause division-by-zero or fabricated zero values. |
| Six-step contract | Critical | Every applicable action satisfies all six audit steps below, including proof-before-exposure, bounded signatures, unchanged ordered calls and server-only key. |
| Preview and formatting | Critical | Position deltas plus signed wallet deltas match displayed before→after, using consistent fresh REST baseline. Preserve meaningful precision, sign/unit, fee effect and rate/window label; unknown price ⇒ token amount and “—”, never $0. |
| Reconciliation | Critical | After confirmation refetch until indexed block catches up where present, otherwise poll/reconcile; prevent duplicate sends and verify residual position before declaring a full exit. |
| Normal/empty/error tests | Recommended | Require artifact-backed tests for ordinary values, null/zero/no-position, decimal mismatch, rounding boundaries, rejected/expired signature, failed simulation and the three forced failures. A passing build alone is not math/action proof. |

### Earn

| Check | Priority | Pass condition |
| --- | --- | --- |
| Vault decimals/RAY | Critical | `share_price_ray` is whole-share/whole-asset RAY. Expected raw shares = floor(assetsRaw × 10^shareDecimals × 1e27 / (10^assetDecimals × price)); share decimals from metadata or configured offset. Null/zero price is unknown, not division by zero. |
| Versions/max functions | Critical | V2 state/APY `/v1`; config/user positions/performance/history/options `/v0`, curator `/details`. V1 uses its own `/v0/vaults-v1` family and action chains. V2 zero `maxDeposit`/`maxMint`/`maxWithdraw`/`maxRedeem` never determine Max or capacity. |
| Vault expiry/options | Critical | Standard intents default 2 h, >60 s and ≤7 d. Full-force accepts no client expiry/signature mode/referral fee/funding and has only response validity, not on-chain deadline. Ordinary assets withdrawal slippage is preparation/attestation-only; shares/all have no on-chain minimum-assets guarantee. |
| B1/B3 units | Critical | Deposit uses assets/funding/auto where accepted; only wrapped-native asset uses native/auto. Full liquid exit uses `unit: all`, partial uses assets/shares; `slippage_bps` only for assets. Midnight-liquidity-adapter deposit unavailable; normal exit idle-only in that case. |
| Liquidity/penalty | Critical | User available now ≤ min(position assets, `withdrawable_assets`), validated by simulation. Withdrawal-options adapter capacity is not double-counted; indicative penalty uses forced assets × `penalty_rate_wad / 1e18`, action preview uses `simulation.effects.penalty_assets`. |
| Force exit | Critical | Exact-assets variant has optional `slippage_bps`, not `max_penalty_bps`. All variant requires explicit `max_penalty_bps`; preparation-only cap, possible residual shares and simulated remaining shares disclosed. Unsupported planning offers exact-assets retry with consent, not guaranteed dust-free exit. |
| In-kind exit | Critical | Exact assets, selected same-chain Blue market allocated with sufficient capacity, no silent amount reduction; idle cash plus illiquid position disclosed. If current penalty <2% and setter not abdicated, cap is required and covers 2%; checked preparation/continuation only, not execution. Midnight-adapter vaults unsupported for force/in-kind. |
| B2 performance/rewards | Critical | `net_earnings_assets` gives interest, `return_on_capital` is non-annualized. Scoped breakdown reward earned = amount+pending, claimable = amount−claimed; use each reward token's decimals/price/distribution chain. Native plus reward rate uses same window/recipe; missing component is unknown, never relabeled native as net. |
| Claim exception | Critical | Actions has no claim route. Merkl standard ERC-20 TREE entries require amount>claimed and nonempty proofs; align users/token/cumulative amount/proof arrays on verified Distributor/distribution chain. Do not pass campaign subtotal with full-token proof. Simulate/review, send from wallet, refresh on root change and `reloadChainId` after receipt. |
| Claim gaps | Recommended | Verify chain deployment/common address, configured recipient and unsupported ledger/points/wrappers. Empty proof/zero claim is excluded, not universally diagnosed InvalidProof. ~8 h cadence and vendor averaging guarantee remain open, not invented. |

### Borrow — Blue and Midnight

| Check | Priority | Pass condition |
| --- | --- | --- |
| Blue share conversion | Critical | Debt = ceil(`borrow_shares` × (`total_borrow_assets` + 1) / (`total_borrow_shares` + 10^6)); supply rounds down with supply totals and same virtual terms. Do not estimate full repay from rounded assets: use `unit: all`; `max_repay_assets` is response-only. |
| Blue oracle and target | Critical | `V = C × P / 1e36` in loan base units; `L = lltv_wad / 1e18`; LTV D/V, health V×L/D; decimal-adjust displayed liquidation price D/(C×L). Target borrow floor(tV−D), repay/add collateral conservatively round up; t=0 means full repay. Liquidity = `market_liquidity + reallocatable_liquidity` subject to simulation, not a guaranteed fill. |
| Blue routes/expiry | Critical | Actions Blue supported chain list matches SKILL.md. Combined borrow pairs `collateral_amount` with funding; repay supports exact collateral withdrawal, not collateral all. Default expiry 30 min, >60 s and ≤2 h. Standalone collateral routes use their actual schema. |
| Midnight identity | Critical | REST market ID is bare; Actions `{chain_id}:{market_id}` uses discovery chain. Supported action chains `1, 4663, 5042, 8453`, not read coverage. Borrow bids, early repayment asks; do not build calls from fallback offers or execute cap sums. |
| Midnight debt/rate | Critical | Debt D is units due at maturity, not assets received. For WAD price p, APR = (1e18/p − 1) × 31,536,000 / positive seconds-to-maturity. APR ceiling converts to `max_rate` by floor(APR × 1e18 / 31,536,000). Guard is per-second WAD, not annual APR. |
| Midnight multi-collateral | Critical | `V_i = C_i × P_i / 1e36`; capacity `H = Σ(V_i × L_i)`, effective LLTV `H / ΣV_i`, health H/D. Use weighted LLTV, not mean; liquidation price holds other collateral prices fixed and decimal-adjusts. Undefined ratios show unknown, no-debt health is not infinity. |
| Midnight targets/exits | Critical | Slider targets incremental debt units then re-solves quoted assets; rounded target helpers recompute weighted capacity. Direct repay assets/all has no guard; market repay assets/units requires guard and never all. Borrow assets/units guard shapes, combined `collateral_supplies` and repay `collateral_withdrawals` match schema. |
| Midnight timing | Critical | Quoted borrow/market repay default 30 min, max 1 h, min 5 min and not past maturity; direct repay max 24 h and >60 s. Do not inject funding/signature-mode/expiry into standalone supply/withdraw routes that do not accept them. |
| Open calculations | Recommended | Numeric Max buffer, exact Blue liquidation feed, Midnight `cost_basis` interpretation, roll/margin and design thresholds remain open/`UNVERIFIED`. WAD scale of cost basis is known but does not settle accounting semantics; do not invent values. |

## Six-step Actions audit

Trace initial intent → proof verification → signatures/continuation → simulation → review → send → receipts/reconciliation. Require:

1. POST exact route schema; `account` equals sending wallet and selected `chain_id`; include configured four-byte hex `calldata_origin` in the top-level intent body. Optional top-level `referral_fee` only where supported: integer `bps` 1–200 and valid `recipient`, omit zero. Read response under `data`, not root.

### Step 2 — Earn

2. `signature_required` carries `signatures[].{id,kind,typed_data}`. Verify EIP-712 chain/domain, review/consent and sign each request. Continue **same endpoint** using only `{"continuation":"...","signatures":[{"id":"...","signature":"0x..."}]}` with matching unique IDs. At most 3 rounds and >60 s before `expires_at` for every signature; otherwise restart without continuation.

### Step 2 — Borrow

2. `signature_required` carries `signatures[].{id,kind,typed_data}`. Verify EIP-712 chain/domain, review/consent and sign each request. Continue **same endpoint** using only `{"continuation":"...","signatures":[{"id":"...","signature":"0x..."}]}` with matching unique IDs. At most 3 rounds and >60 s before `expires_at` for every signature; otherwise disable signing, show the expiring/restart UI and restart without continuation. Require evidence through the actual UI at 61 s and 59 s remaining.

### Steps 3–6 — shared

3. Only `prepared` with `simulation.status: success` sends calls: selected account/chain, unchanged `to`/`data`/`value` in returned order before expiry. Atomic batch only if wallet supports it; otherwise await each confirmation. Stop on failure and reconcile receipts before retry; never blindly resend.
4. `simulation_failed` or failed simulation sends nothing; map code and expose raw `simulation.failure.message` only in details. Do not bypass simulation or silently loosen guards.
5. Copy Actions docs' TypeScript `postAction`/`runAction`, do not rewrite it. Verify `Morpho-Action-Proof` **before exposing typed data/calls**: `ES256`, `kid` against same-origin `/.well-known/morpho-actions-jwks.json`, `typ: morpho-action-proof+jwt`, exact production issuer, `aud: morpho-actions-client`, `sub: action-response`, expiry and `iat` freshness (≤60 s with allowed skew), exact request/response byte binding. Cache JWKS ≤60 s, refresh unknown key, fail closed. Check account/chain/domain/consent too; a valid proof does not replace user intent checks.
6. Apply `simulation.position_changes` deltas to REST baseline and use signed `simulation.wallet_changes`; they are not complete snapshots. Show fees, wallet outflow/receipt and before→after values; disclose referral cost/net receipt.

Keep `x-api-key` server-side; browser calls backend. Use exact funding objects `{"type":"erc20"}`, `{"type":"native","max_native_assets":"..."}`, `{"type":"auto","max_native_assets":"..."}` only where accepted, wrapped-native restrictions and no unsupported mixed funding. Use `signature_mode: "auto"` only where accepted; do not inject it into incompatible intents. No custom calldata where an Actions route exists.

## Evidence procedure

Trace each expression's source, unit, scale and rounding through request → response → preview → wallet call → receipt. Search numeric utilities for Number/parseFloat/toFixed, bare bigint division, fixed-decimal assumptions and direct ABI encoding; inspect context before flagging display-only formatting or the explicit Merkl-claim exception. Require exact expression/file, consequence and smallest REST/Actions replacement for each failure. Use fixtures for dangerous/unavailable states and mark them; code/build success alone does not prove runtime outcome.

## Report

Return a separate table per scoped product:

| Check | Priority | Verdict | Evidence | Impact / smallest fix |
| --- | --- | --- | --- | --- |
| Every owned row | Critical / Recommended | `PASS` / `FAIL` / `UNVERIFIED` / `N-A` | Exact expression/source, request/response or screen/test | Defect, consequence and smallest fix |

Overall: `PASS` / `FAIL` / `UNVERIFIED`. Include missing evidence, `N-A` reasons and open questions. Missing evidence is `UNVERIFIED`; confirmed defects are `FAIL`. An open threshold, buffer, feed/accounting gap or vendor guarantee alone is `UNVERIFIED`/open, never `FAIL` for a missing design value. Invented safety/data remains a Critical failure. Follow orchestrator aggregation.
