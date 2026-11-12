# Rate transparency compliance — Earn and Borrow

Read-only: review only owned criteria; do not edit code, copy, configuration, artifacts or external state. Read [SKILL.md](../../SKILL.md), [review.md](../review.md) and only the selected product references: [Vaults](../vault-v2.md), [Blue](../blue.md), [Midnight](../midnight.md), completely for applicable contracts/stories. Grade scoped V2/V1 compatibility, Blue and Midnight separately; V2-only illiquid actions do not apply to V1, and shared helpers do not imply shared correctness. The current skill/reference is the source of truth; do not infer missing design values.

## Owned checks

| Scope | Check | Priority | Pass condition |
| --- | --- | --- | --- |
| All | REST realized rates | Critical | Variable rates come from realized REST averages, never instant rates. Trace every displayed number to exact route/field and selected window; history range is not averaging window. |
| All | Single window | Critical | One `rateWindow` controls native and reward rates: default/integrator setting 6h, labels show variable/type/window and incl./excl. rewards. Null chosen window stays “—”; no silent fallback. |
| All | Merkl recipe | Critical | Opportunities use `chainId`, `mainProtocolId=morpho`, vault/market `identifier` and `campaigns=true`; per opportunity use `apr-records` with matching `from`/`to` and `grain=HOUR`, paginate/deduplicate buckets, drop `hasUntrustedContribution`. |
| All | Coverage math | Critical | Reward APR fraction = mean retained `avg` × (retained/expected buckets) / 100, summed across opportunities; never substitute `totalApr`/`nativeApr`. Empty/unavailable data is unknown, not fabricated zero. Follow the skill's open/vendor-guarantee caveats. |
| All | Long windows | Critical | 30d/90d/1y show native only, labeled “excl. rewards”; no invented long-window hourly reward average. Native and reward fetch failures remain distinguishable. |
| All | Fee/convention split | Critical | Native yield or borrow cost, underlying-token yield where relevant, named reward-token APR, vault/protocol/settlement/continuous/integrator fees are distinct. No double-counting fees or pretending reward APR compounds like APY. |
| All | Reward conditions | Recommended | Campaign/end/eligibility/claim context and historical/non-forecast status are visible; no promised rewards or silently accepted untrusted contributions. |
| Earn | B1/B2 native source | Critical | Use `GET /v1/vaults-v2/{v}/apy-averages?lookback=...` → `apy`; V1 uses its own `/v0` route. Native fraction is converted only for display, not annualized again. |
| Earn | Rewards by default | Critical | Live campaign leads with Net APY = same-window native APY + reward APR and Total earned, both with split. No campaign hides reward rows. Merkl failure shows Net APY “—” while native stays visible, never relabeled net. |
| Earn | Earned vs claimable | Critical | Scoped rewards earned = `amount + pending`; claimable = `amount − claimed`, using campaign breakdowns, reward-token decimals/prices. Native interest comes from `net_earnings_assets`; `return_on_capital` is non-annualized; total earned does not silently drop an unknown component. |
| Earn | History and cadence | Recommended | History is labeled by source/range. Root update “~8 h” stays open, pending ~2 h is not that schedule. Preserve post-exit pending/claimable rewards without promising new accrual. |
| Borrow | Blue variable cost | Critical | Use `GET /v0/blue/markets/{m}/apy-averages` → `borrow_apy_averages[rateWindow]`. Label variable average; do not blend rewards into a depositor-style net yield or market instant post-trade rate. |
| Borrow | Midnight fixed term | Critical | Quote/effective fixed APR is paired with maturity, price, assets received and debt units at maturity; ignore `rateWindow`. Rate guard `max_rate` is WAD per-second simple rate, not APR. |
| Borrow | Midnight quote/fees | Critical | Borrow bids and early asks quotes show bound/guard/deadline/freshness, effective fees and market cost vs direct face value. Distinguish fixed quote APR from effective position APR; no guaranteed fill/early exit. |
| Borrow | Open interest | Recommended | `cost_basis` accounting is open: do not infer exact interest owed from unscaled subtraction. Missing confirmation is `UNVERIFIED`, not an invented principal or failed missing API value. |

| `rateWindow` | Blue average key | Vault `lookback` | Merkl `grain=HOUR` expected buckets | Display |
| --- | --- | --- | --- | --- |
| 6h default | `6h` | `six_hours` | 6 | same-window native + rewards |
| 24h | `24h` | `one_day` | 24 | same-window native + rewards |
| 7d | `7d` | `seven_days` | 168 | same-window native + rewards |
| 30d / 90d / 1y | `30d` / `90d` / `1y` | `thirty_days` / `ninety_days` / `one_year` | not covered | native only, excl. rewards |

Vault `one_hour`/`inception` are extra API values, not automatic substitutes. Midnight fixed rates ignore this table. Merkl retention/averaging and any unverified fields remain as qualified by the owning skill; do not grade an unresolved vendor guarantee as a missing design failure.

## Evidence procedure

Inventory every rate/performance renderer and source mapping. Quote the rendered type/window/split label and exact route/field; test window changes, chosen-window null, missing buckets, failed Merkl fetch and no campaign. Arithmetic without an honest label still fails. Use fixtures for dangerous/unavailable states and mark them; code/build success alone does not prove runtime outcome.

## Report

Return a separate table per scoped product:

| Check | Priority | Verdict | Evidence | Impact / smallest fix |
| --- | --- | --- | --- | --- |
| Every owned row | Critical / Recommended | `PASS` / `FAIL` / `UNVERIFIED` / `N-A` | Exact expression/source, request/response or screen/test | Defect, consequence and smallest fix |

Overall: `PASS` / `FAIL` / `UNVERIFIED`. Include missing evidence, `N-A` reasons and open questions. Missing evidence is `UNVERIFIED`; confirmed defects are `FAIL`. An open threshold, buffer, feed/accounting gap or vendor guarantee alone is `UNVERIFIED`/open, never `FAIL` for a missing design value. Invented safety/data remains a Critical failure. Follow orchestrator aggregation.
