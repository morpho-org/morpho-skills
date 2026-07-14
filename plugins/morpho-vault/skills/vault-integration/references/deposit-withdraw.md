# Deposit & Withdraw Flows

How to build the transaction side of an earn feature. Morpho Vaults are ERC-4626 tokenized vaults; deposits mint shares, withdrawals burn them.

## Integration paths

| Building… | Use |
|-----------|-----|
| Frontend (React + wagmi) or backend (viem) with user-facing txs | `@morpho-org/morpho-sdk` (`MorphoClient`) |
| Agent-driven or scripted flows, unsigned tx preparation | `npx @morpho-org/cli@latest prepare-deposit / prepare-withdraw` (see the morpho-cli skill) |
| Reads only (dashboard, position display) | GraphQL API or `@morpho-org/blue-sdk-wagmi` hooks |

**Default to `@morpho-org/morpho-sdk` for user-facing transactions.** It handles slippage bounds, ERC-20 approvals / EIP-2612 permits / Permit2, native-token wrapping, and bundler-vs-direct routing internally. Hand-rolling these from `blue-sdk-viem` duplicates logic morpho-sdk already gets right, and it's where integrations historically introduce bugs.

## Canonical deposit flow (morpho-sdk)

Pattern from Morpho's assets-flow tutorial (docs.morpho.org/build/earn/tutorials/assets-flow):

```ts
import { createWalletClient, http, parseUnits } from "viem";
import { base } from "viem/chains";
import { morphoViemExtension } from "@morpho-org/morpho-sdk";

const client = createWalletClient({ account, chain: base, transport: http(RPC_URL) })
  .extend(morphoViemExtension({ supportSignature: true }));

// V1 (MetaMorpho) vs V2 vaults have incompatible ABIs — construct the right entity.
const vault = client.morpho.vaultV1(vaultAddress, base.id); // or client.morpho.vaultV2(...)

// 1. Fetch live state
const vaultData = await vault.getData();

// 2. Build the action (amount in raw units — parseUnits(humanAmount, asset.decimals))
const deposit = vault.deposit({ amount, userAddress: account.address, vaultData });

// 3. Resolve requirements — approvals/permits, signed or sent as dictated
const requirements = await deposit.getRequirements();
const signatures = [];
for (const req of requirements) {
  if ("sign" in req) signatures.push(await req.sign(client, account.address));
  else await client.sendTransaction(req);
}

// 4. Build final tx and send
const txHash = await client.sendTransaction(deposit.buildTx(signatures));
```

A `MorphoClient(publicClient)` construction form also exists if you'd rather not extend the client. Deposit actions accept a `slippageTolerance` option; the default bounds are computed automatically.

**React/wagmi:** there is no `@morpho-org/morpho-sdk-wagmi`. Use `@morpho-org/blue-sdk-wagmi` hooks (`useVault`, `usePosition`, …) for reactive reads; for writes, construct `MorphoClient` against `usePublicClient()` and pass `buildTx` output to `useSendTransaction`.

## Withdrawals

- **Partial withdrawal**: `vault.withdraw({ amount, userAddress })` — amount in assets.
- **Full exit**: use `redeem` with the user's full share balance, not `withdraw` with a computed asset amount. Share price moves between quote and execution; `withdraw` leaves dust, `redeem` doesn't.
- **Liquidity**: withdrawals are bounded by the vault's idle + instantly-free market liquidity (V1 exposes it as `liquidity { underlying usd }`; V2 as `liquidityUsd`/`idleAssetsUsd`). A withdrawal can revert even when the user's balance covers it. Surface instantly withdrawable liquidity in the UI (see [data-display.md](data-display.md)) and handle the revert path with a clear message rather than a raw error.
- **No approval needed** for `withdraw`/`redeem` — the caller burns their own shares.

## Slippage and share/asset conversion

The share/asset exchange rate can shift between preparation and execution. morpho-sdk computes `maxSharePrice`/`minSharePrice` bounds automatically (default 3 bps tolerance, capped at 10%) — no manual wiring needed. Only when dropping to `blue-sdk-viem` directly: call `previewDeposit()`, apply a tolerance floor, and verify the result.

**Vault V2 quirk**: `maxDeposit`, `maxMint`, `maxWithdraw`, `maxRedeem` always return zero on V2 vaults. Never gate UI or validation on them.

## Position display after deposit

A user's position = their share balance converted to assets:

- On-chain: `vault.balanceOf(user)` → `vault.convertToAssets(shares)`.
- GraphQL: `userByAddress(address, chainId) { vaultPositions { shares assets assetsUsd vault { address } } }`.

Show the position in the deposit asset (plus fiat), alongside the user's other balances — not in a separate tab. Earnings = current asset value minus net deposits; the share price only rises as interest accrues, so no claim step exists for the base rate (that's the autocompounding story from the playbook).

## Token quirks

- **Decimals**: USDC/USDT = 6, WETH/DAI = 18. Always read `decimals` from the API or contract; convert with `parseUnits`/`formatUnits`.
- **USDT**: allowance must be reset to 0 before setting a new value. morpho-sdk's requirements flow handles this; hand-rolled flows must implement it.
- **DAI**: non-standard permit — use plain ERC-20 `approve()`, not EIP-2612.
- **Native ETH**: pass `nativeAmount` to deposit actions for atomic wrap-and-deposit.

## Verify before signing

Whatever path builds the transaction, simulate before presenting it for signature (morpho-cli's `prepare-*` commands do this automatically and return warnings). Never present a transaction that failed simulation.
