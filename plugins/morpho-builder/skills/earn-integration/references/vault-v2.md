# Vault V2 — variable-rate Earn

Apply [SKILL.md](../SKILL.md) for the shared Actions contract, conventions, errors, UX, and verification. Define `v = {chainId}:{vaultAddress}`, `u = wallet address`, `s = {chainId}:{assetAddress}`. Morpho REST fields below are under `data`. JSON sketches show valid shapes, not executable addresses or chosen `amounts`.

Reference map: [discovery](https://docs.morpho.org/api/vaults-v2/list-v2-vaults/), [config](https://docs.morpho.org/api/vaults-v2/get-v2-vault/), [state](https://docs.morpho.org/api/vaults-v2/get-v2-vault-state/), [average APY](https://docs.morpho.org/api/vaults-v2/get-v2-vault-realized-average-apy/), [positions](https://docs.morpho.org/api/vaults-v2/list-user-v2-vault-positions/), [performance](https://docs.morpho.org/api/vaults-v2/user-v2-vault-position-performance/), [position history](https://docs.morpho.org/api/vaults-v2/user-v2-vault-position-history/), [APY history](https://docs.morpho.org/api/vaults-v2/get-v2-vault-apy-history/), [withdrawal options](https://docs.morpho.org/api/vaults-v2/get-v2-vault-withdrawal-options/), [curator](https://docs.morpho.org/api/curators/get-curator-details/), [`token`](https://docs.morpho.org/api/global/get-token/), [`price`](https://docs.morpho.org/api/global/get-token-price/), [Actions](https://api.morpho.org/actions/docs), [Merkl opportunities](https://developers.merkl.xyz/api-reference/get/v4/opportunities), [APR records](https://developers.merkl.xyz/api-reference/get/v4/opportunities/%7Bid%7D/apr-records), [rewards](https://developers.merkl.xyz/api-reference/get/v4/users/%7Baddress%7D/rewards).

Vault V2's `maxDeposit`, `maxMint`, `maxWithdraw` and `maxRedeem` return zero by design; never use them as availability or position signals. Use REST state/options and successful Actions simulation. "Withdraw anytime" is subject to liquidity. Separate `native` yield, rewards, fees and penalties; never promise guaranteed returns.

## B1. Take a position

*As a user, I see what the vault earns and who manages it, deposit an `amount`, and see my expected position before I sign.*

**Components:** vault header (name, asset, curator name/logo); variable average APY with separate rewards line when a live campaign exists; total deposits; deposit input with connected-wallet balance and Max; "you will receive" `shares` preview; review step listing `all` `signatures`/`calls`, fees and net receipt.

**Reads:**

| Exact GET route | Fields / purpose |
| --- | --- |
| `/v0/vaults-v2` then `/v0/vaults-v2/{v}` | vault identity, name, asset, fees, `curator`, `decimals_offset` |
| `/v1/vaults-v2/{v}/state` | `total_assets`, `share_price_ray`, `last_indexed_block` |
| `/v1/vaults-v2/{v}/apy-averages?lookback=six_hours` | `apy`; map selected `rateWindow` using SKILL.md |
| `https://api.merkl.xyz/v4/opportunities?chainId={c}&mainProtocolId=morpho&identifier={vaultAddress}&campaigns=true` | opportunity `id`, `status`, `campaigns[]` with `campaignId`; paginate; B2 reward recipe |
| `/v0/curators/{chainId}:{curator}/details` | `curators[]` → name, `logo_uri` |
| `/v0/tokens/{s}`, `/v0/tokens/{s}/price` | `symbol`, `decimals`, `logo_uri`, nullable USD `price`; also load vault-share `decimals` |

**Math:** displayed APY = `native` realized APY + Merkl reward APR over the same window (B2). Expected raw `shares` ≈ floor(assetsRaw × 10^shareDecimals × 1e27 / (10^assetDecimals × `share_price_ray`)); this is an indexed estimate, not a minimum receipt. USD = raw `assets` / 10^assetDecimals × USD `price`. Max uses wallet balance, accounting for `native` gas and maximum `native` spend; never POST zero. Show unknown rather than zero for missing `price`/rate.

**Action:** `POST /v0/actions/vaults-v2/{v}/deposit`:

~~~json
{
  "account":"<wallet>",
  "amount":{"unit":"assets","value":"<asset-base-units>"},
  "funding":{"type":"erc20"},
  "signature_mode":"auto"
}
~~~

For wrapped-`native` vaults only, replace `funding` with `{"type":"native","max_native_assets":"<maximum-native-spend>"}` or `{"type":"auto","max_native_assets":"<maximum-native-spend>"}`; `auto` is balance-based, not mixed `funding`. Optional `slippage_bps`, `expires_at`, `calldata_origin` and `referral_fee` follow the shared schema. Preview `simulation.position_changes.vault_shares` and `wallet_changes`. Apply proof verification, `signatures`/`continuation`, final review and ordered `calls` before sending.

**Acceptance:** the APY label states its window ("6h avg") and says rewards are separate when shown; a vault that uses a Midnight liquidity adapter disables deposit with the API's reason.

## B2. Show the position

*As a depositor, I see my balance, the rate I am earning, and how much I have earned so far.*

**Components:** balance `token`/USD; headline Net APY with `native`/reward split; interest earned; per-`token` earned/`pending`/claimable rewards; Total earned with split; non-annualized return on capital; optional history chart; Claim beside Withdraw.

**Reads and Math:**

| Field on screen | Source | Math / presentation |
| --- | --- | --- |
| Balance (`token`, USD) | `GET /v0/vaults-v2/users/{u}/positions` → selected vault `assets`, `shares` | raw `assets` / 10^assetDecimals × `GET /v0/tokens/{s}/price`; hide zero active positions, not reward claims |
| **Net APY (headline, default)** | two rows below | `native` APY + reward APR over same window; label "incl. rewards", split tooltip; not compounded rewards |
| Native APY | `GET /v1/vaults-v2/{v}/apy-averages?lookback=six_hours` → `apy` | fraction, multiply by 100 only for percentage display; null ⇒ "—" |
| Reward APR | Merkl opportunity call in B1, then `GET /v4/opportunities/{id}/apr-records?from={from}&to={to}&grain=HOUR` | same six hours by default; drop `hasUntrustedContribution`; average retained `avg` × (records kept / 6) / 100, sum across opportunities; never `totalApr` or `nativeApr` |
| Interest earned to date | `GET /v0/vaults-v2/{v}/users/{u}/position/performance` → `net_earnings_assets` | average-cost realized + unrealized; raw / 10^assetDecimals × asset `price`, not deposits minus withdrawals |
| **Rewards earned to date ($, default)** | `GET https://api.merkl.xyz/v4/users/{u}/rewards?chainId={c}` → reward `breakdowns[]` scoped to this vault's `campaignId` set | Σ (scoped `amount + pending`) / 10^rewardDecimals × `GET /v0/tokens/{rewardChain}:{rewardToken}/price` |
| Claimable now | same rewards response; scoped breakdown `amounts` for vault display | `amount − claimed` per `token`; separate `pending`, Claim button; actual `claim` uses full `token` cumulative `amount`/`proofs`, not a scoped subtotal |
| Total earned ($) | interest USD + scoped rewards USD | always show native/rewards breakdown; unknown component ⇒ "—", never silently undercount |
| Return on capital | performance → `return_on_capital` | non-annualized; label explicitly |
| History chart (optional) | `GET /v0/vaults-v2/{v}/users/{u}/position/history`, `GET /v0/vaults-v2/{v}/apy/history` | selected `lookback` chooses chart range, not the averaging window |

Use the documented `/v0` user list: the `/v1` list returned empty during research, so its nonempty shape is not verified. Select by chain/vault identity, not `symbol`. Cache/poll as in SKILL.md.

**Reward rate recipe:** request `from`/`to` Unix seconds spanning the same window as native APY, `grain=HOUR`; paginate (default 100, max 200 records/page), deduplicate hourly timestamps, exclude an extra boundary bucket because bounds are inclusive. Expected counts: 6, 24, 168 for 6h, 24h, 7d. Missing buckets count as uncovered in the brief's coverage-weighted formula; all excluded/empty records ⇒ unavailable, not invented zero. At 30d/90d/1y show native only "excl. rewards". The reference verifies parameters and limited hourly retention; a live hourly sample confirmed `timestamp`, `avg` and `hasUntrustedContribution`. The coverage-weighted formula remains the brief's display convention, not a documented Merkl formula. If records/fields are unavailable, show Net APY "—" and retain native APY.

**Reward attribution:** collect on-chain `campaigns[].campaignId` from `all` opportunities for this vault (including ended `campaigns` for earned-to-date, not just live). Match chain and `breakdowns[].campaignId`, using `opportunityId` as a consistency check. Sum scoped breakdown `amount`, `pending` and `claimed`, not the entire `token` totals: the same reward `token` can include unrelated vaults. Paginate `breakdowns`; unavailable/private/truncated attribution ⇒ unknown, not zero. The legacy endpoint supports `breakdownPage`; for large `users` use Merkl's paginated leaf breakdown route documented in its reference rather than accepting a truncated total. Pending is earned but not in a claimable `root`; `amounts` are cumulative and include `claimed` rewards. Use reward-`token` chain/`decimals`, not the vault underlying's.

For large users, paginate `GET /v4/leaves/{recipient}/breakdowns?tokenAddress={token}&distributionChainId={c}&page={page}&items={items}`; see the [leaf breakdown reference](https://developers.merkl.xyz/api-reference/get/v4/leaves/%7Brecipient%7D/breakdowns). Discover each campaign's `distributionChainId`; it can differ from the vault's chain. Query rewards and send claims on the distribution chain, preserving vault campaign attribution.

**Rewards by default:** when the vault has a live Merkl campaign, the position card leads with Net APY and Total earned, each with native/rewards split. With no campaign, hide reward rows, not 0. Preserve already earned/claimable rewards from past campaigns and post-exit claims in the rewards/exit surface; no live campaign does not imply no outstanding rewards. When discovery succeeds and no campaign has ever rewarded this vault, Total earned is native interest alone; do not confuse that known absence with a failed rewards fetch.

**Action:** display/polling sends no POST. User Deposit/Withdraw/Claim clicks route to B1/B3/Claim rewards; never `auto`-transact while loading.

**Acceptance:** earned-to-date uses the performance route, not deposits minus withdrawals; a missing `price` shows the `token` `amount` only.

**Acceptance (rewards):** reward APR and `native` APY use the same 6-hour window; a `failed` Merkl call shows Net APY as "—" with `native` APY still visible, never `native` APY relabelled as net; rewards $ uses `amount + pending`, claimable uses `amount − claimed`.

## B3. Exit the position

*As a depositor, I withdraw some or `all` of my balance and know up front if the vault cannot pay `all` of it right now.*

**Components:** `amount`/Max/full-position choice, available-now `amount`, before → after `shares`/`assets`, penalty in `token`/USD and net `assets`, normal/force/in-kind choice, received-position disclosure and review; Claim next to Withdraw.

**Reads:** `GET /v1/vaults-v2/{v}/state` → `withdrawable_assets` (idle + liquidity-adapter availability); `GET /v0/vaults-v2/{v}/withdrawal-options` → `idle_assets`, `liquidity_adapter_available_assets`, `adapter_penalties[]` with `adapter_address`, `adapter_kind`, `force_deallocatable_assets`, `penalty_rate_wad`. Refresh user `assets`/`shares` and `token` prices. Normal withdrawal with Midnight liquidity adapter can use only idle `assets`.

**Math:** available to this user now ≤ min(position `assets`, `withdrawable_assets`), subject to successful simulation. Per-adapter indicative penalty ≈ selected forced `assets` × `penalty_rate_wad / 1e18`; use `simulation.effects.penalty_assets` for the action preview, never multiply the whole exit by an unrelated adapter's rate. Display penalty in `token` terms before signing, plus USD only when priced. Never double-count liquidity-adapter and force-deallocation capacity.

**Action — liquid exit:** `POST /v0/actions/vaults-v2/{v}/withdraw`:

~~~json
{"account":"<wallet>","amount":{"unit":"all"},"signature_mode":"auto"}
~~~

Partial withdrawal uses `{"unit":"assets","value":"<asset-base-units>"}` (optional `slippage_bps`) or `{"unit":"shares","value":"<raw-shares>"}`; neither `shares` nor `all` accepts `slippage_bps`. All redeems current `shares` rather than an estimated `assets` `amount`. Disclose ordinary withdrawal's lack of on-chain execution-`price` bounds.

On `422 INSUFFICIENT_LIQUIDITY` offer available `amount` from validated `details` (the withdrawal route documents it); if absent, refresh state/options and cap against the position. Never silently fail or invent an `amount`. Offer a smaller normal withdrawal first, then supported alternatives.

**Action — force exit:** `POST /v0/actions/vaults-v2/{v}/force-withdraw`, only after separate penalty consent. Full-position variant:

~~~json
{"account":"<wallet>","amount":{"unit":"all"},"max_penalty_bps":0}
~~~

Here 0 means user consents only to penalty-free exits, not a magic general default. Replace with the user's explicit tolerance when needed; full-position requests do not accept `funding`, signature mode, referral fee, or client expiry. Cap is preparation-only, not enforced on chain. If `all` cannot be safely planned, `ACTION_UNSUPPORTED` can require retry with exact `assets` and new consent:

~~~json
{"account":"<wallet>","amount":{"unit":"assets","value":"<exact-exit-assets>"},"slippage_bps":50,"signature_mode":"auto"}
~~~

The 50 `bps` sketch is illustrative, not an app default; disclose and obtain the user's tolerance. Assets variant has no `max_penalty_bps`. Its call reverts after `expires_at`; `all` variant has no on-chain deadline. Show `prepared` `residual_shares` and simulated `simulation.effects.remaining_shares`, which can differ; do not promise dust-free force exits.

**Action — in kind:** `POST /v0/actions/vaults-v2/{v}/redeem-in-kind`:

~~~json
{"account":"<wallet>","amount":{"unit":"assets","value":"<exact-exit-assets>"},"market":"<same-chain-id>:<blue-market-id>","max_penalty_bps":200,"signature_mode":"auto"}
~~~

Do not treat 200 `bps` as blanket consent. It illustrates the schema's conditional 2% coverage requirement: when current penalty <2% and its setter is not abdicated, `max_penalty_bps` is required and must cover 2%, regardless of setter timelock. Obtain explicit worst-case consent. The cap is checked at preparation/`continuation` only, never execution; a queued change can exceed it. Requires an exact `assets` `amount` and a caller-selected **same-chain Blue** market allocated by the vault with enough capacity. No automatic `amount` reduction, `all`, cross-chain market, `funding` or referral fee. Returns idle `assets` plus an illiquid Blue supply position, not all cash. Disclose split, penalty and subsequent position management; re-simulate if stale.

Vaults containing a Midnight adapter do not support force-withdraw or `redeem-in-kind`. Respect other unsupported-vault reasons; never present these as guaranteed fallbacks.

**Acceptance:** Max withdraws the full position with `unit: all`, leaving no dust on a supported liquid exit; a partial-liquidity case never fails silently and always shows the penalty in `token` terms before a force exit. Verify remaining `shares` rather than promising dust-free force exits. After full exit, hide zero active rows and preserve Claim access.

## Claim rewards — separate step

Withdrawal does not `claim` rewards. Already earned rewards can remain `pending` and become claimable after full exit; do not imply a withdrawn position keeps earning new rewards indefinitely. Offer Claim next to Withdraw and in the post-exit wallet view. Actions has no `claim` route; build this transaction from Merkl `data`.

**Components:** claimable list per `token` (`amount`, USD), Claim all button, `pending` line "{x} more becomes claimable at the next Merkl update". Brief's "~8 h" cadence remains **open/unverified**; current docs say `pending` updates ~2 h, not the `root` schedule. Disable empty claims and show separate loading/error states.

**Reads:** `GET https://api.merkl.xyz/v4/users/{u}/rewards?chainId={c}` → chain `id` and `rewards[]` with `recipient`, `token.address`, `token.chainId`, `token.decimals`, `amount`, `claimed`, `pending`, `distributionLayer`, `proofs`. Inspect [rewards reference](https://developers.merkl.xyz/api-reference/get/v4/users/%7Baddress%7D/rewards). Match wallet and selected distribution chain; do not `claim` other `users`' entries.

**Math:** claimable = `amount − claimed`; earned-to-date = `amount + pending`. For this vault's card use scoped `breakdowns` (B2); for the chain-wide `claim` use full cumulative `token` values. Do not change an `amount` to a vault subtotal while retaining its proof. Label Claim all as `all` eligible `tokens` on the chain, including other `campaigns` where present.

**Action:** retain only standard ERC-20 `TREE` entries where `amount > claimed` and `proofs` is non-empty. Exclude `LEDGER` (empty `proofs` by design), points, and unsupported pre-token/wrapper flows; name them as unsupported rather than failing the batch. Do not conclude every excluded zero-claim entry would revert; a mismatched leaf/proof can revert the whole batch with `InvalidProof`.

ABI: `claim(address[] users, address[] tokens, uint256[] amounts, bytes32[][] proofs)` on the Merkl Distributor, commonly `0x3Ef3D8bA38EBe18DB133cEc108f4D14CE00Dd9Ae` on EVM chains, **not universally**. Verify the selected chain's deployment via Merkl chain contract metadata before enabling send; `address` confirmation is open where unavailable. Keep this ABI inline; do not link to non-reference tutorials/contracts.

Set `users[i]` to the wallet, `tokens[i]` to `token.address`, `amounts[i]` to the cumulative `amount` (not claimable difference), `proofs[i]` unchanged. Arrays must align. ABI-encode one batch, simulate, review every `token`/delta, send from the user's own wallet on that chain, wait for receipt. Do not implement operator/`recipient`-management changes silently. Authorized operators exist, but this integration uses the wallet; configured `claim` recipients can redirect receipt, so do not promise wallet balance rises without checking.

After confirmation refetch rewards with `reloadChainId={c}` to bypass the cache (normal indexing may lag ~5 min); use this bypass only after claims, not every poll. Refresh wallet balances; keep `pending` state until reconciled. Root/proof change ⇒ refresh and review, never silently retry the old `claim`.

**Acceptance:** after `claim` confirms and reads reconcile, claimable drops to 0 and the wallet balance rises by that `amount` for the default `recipient` and standard ERC-20 rewards; disclose configured-`recipient` exceptions. Withdraw all ends with "You still have {x} in rewards to claim" when claimable > 0; `claim` works on a wallet that has already fully withdrawn.

## Vault V1 compatibility — same stories, versioned contracts

Use the same B1 deposit, B2 display/performance/rewards, B3 liquid exit and Claim stories, never substitute V2 state/`price` math blindly. Reference [V1 config](https://docs.morpho.org/api/vaults-v1/get-v1-vault/), [state](https://docs.morpho.org/api/vaults-v1/get-v1-vault-state/), [average APY](https://docs.morpho.org/api/vaults-v1/get-v1-vault-realized-average-apy/), [positions](https://docs.morpho.org/api/vaults-v1/list-user-v1-vault-positions/).

| Need | V1 route |
| --- | --- |
| Discovery/config | `GET /v0/vaults-v1`, `GET /v0/vaults-v1/{v}` |
| State/APY | `GET /v0/vaults-v1/{v}/state`, `GET /v0/vaults-v1/{v}/apy-averages?lookback=six_hours` |
| Positions/performance | `GET /v0/vaults-v1/users/{u}/positions`, `GET /v0/vaults-v1/{v}/users/{u}/position/performance` |
| History | `GET /v0/vaults-v1/{v}/users/{u}/position/history`, `GET /v0/vaults-v1/{v}/apy/history` |
| Deposit/withdraw | `POST /v0/actions/vaults-v1/{v}/deposit`, `POST /v0/actions/vaults-v1/{v}/withdraw` |

Deposit body uses `assets`/`funding`/`auto` as B1; withdrawal accepts `assets`/`shares`/`all` with `auto` as B3. Only V1 action chains listed in SKILL.md are supported. Do not copy V2 force-withdraw/`redeem-in-kind` routes or V2 max-function behavior onto V1; no such V1 Actions fallback is documented. Merkl attribution/`claim` rules remain the same, using the V1 vault `address`.

V1 deposit request:

~~~json
{"account":"<wallet>","amount":{"unit":"assets","value":"<asset-base-units>"},"funding":{"type":"erc20"},"signature_mode":"auto"}
~~~

V1 full liquid exit request:

~~~json
{"account":"<wallet>","amount":{"unit":"all"},"signature_mode":"auto"}
~~~
