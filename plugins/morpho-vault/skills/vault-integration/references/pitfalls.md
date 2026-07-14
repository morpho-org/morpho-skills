# Integration Pitfalls

Failure modes seen across real Morpho Vault integrations, with prevention. Severity: **CRITICAL** = potential fund loss, **WARNING** = broken UX or misleading display.

## Transaction-side

| Pitfall | Severity | Prevention |
|---------|----------|------------|
| `withdraw()` for a full exit | WARNING — dust remains | Use `redeem()` with the full share balance |
| Relying on Vault V2 `max*` functions | WARNING — they always return 0 on V2 | Compute capacity from vault state / API instead |
| Wrong ABI for the vault version | CRITICAL — V1 (MetaMorpho) and V2 ABIs are incompatible | Match `metaMorphoAbi` vs `vaultV2Abi` to the on-chain contract; construct the matching SDK entity |
| Hand-rolled approval flow missing USDT reset | WARNING — tx revert for USDT users | Reset allowance to 0 first, or let morpho-sdk requirements handle it |
| EIP-2612 permit on DAI | WARNING — nonstandard permit reverts | Plain `approve()` for DAI |
| Assuming 18 decimals | CRITICAL — 10^12× amount errors on USDC/USDT | Read `decimals` from contract or API, always |
| Hardcoded vault/token addresses | CRITICAL — wrong asset or malicious lookalike | Discover via GraphQL API (`listed: true`) and cross-check `factory.address`; confirm with the user |
| Skipping simulation before signature | CRITICAL — user signs a reverting or fund-trapping tx | Simulate every prepared tx; morpho-cli `prepare-*` does this automatically |
| No slippage bound on hand-rolled deposit | WARNING — fewer shares than quoted | Use morpho-sdk (automatic bounds) or preview + tolerance check |

## Display-side

| Pitfall | Severity | Prevention |
|---------|----------|------------|
| Blending rewards into one headline APY | WARNING — #1 source of support tickets | Split base rate vs rewards, name the payout token of each ([earn-ux-playbook.md §4](earn-ux-playbook.md)) |
| Showing gross APY instead of net | WARNING — overstates yield by the fee | Use `netApy`/`avgNetApy` (V2 nets out both performance and management fees) — see [data-display.md](data-display.md) |
| Computing headline APY as `apy + rewards` | WARNING — double-counts and ignores fees | `apy` is gross pre-fee; headline is `netApy`, base is `netApyExcludingRewards` |
| "Guaranteed" / "risk-free" / "staking" language | WARNING — legal + trust exposure | Vocabulary rules in [earn-ux-playbook.md §1](earn-ux-playbook.md) |
| Hiding the vault behind a generic label | WARNING — obscures curator accountability | Vault name + curator on deposit, review, post-deposit screens |
| Promising instant withdrawals unconditionally | WARNING — withdrawal can exceed available liquidity | "No lock-ups" always carries the liquidity caveat; surface withdrawable liquidity |
| Treating rewards APR as autocompounding | WARNING — rewards are separate claims, not share-price growth | Only the base rate autocompounds; label rewards with token + schedule |

## Vault-creator concerns (out of scope, but flag them)

If the user is *creating* a vault rather than integrating existing ones, that's curator territory — different skill set (caps, roles, timelocks, dead deposits for inflation-attack protection). Flag it and point them to Morpho's curator docs rather than improvising; a missed dead deposit is a CRITICAL fund-loss risk on new vaults.

## Trust and governance

A vault's curator can reallocate funds across markets within the caps they set. This is the design — the curator is the risk manager users are trusting. The integration's job is to make that visible (name the curator, link them, show allocations), not to hide it. If a vault's curator is anonymous or unverifiable, treat that as a signal in vault selection.
