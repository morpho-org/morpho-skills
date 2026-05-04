# Write Command Response Schemas

## Write response shape

All `morpho_prepare_*` tools return a `PreparedOperation` directly (no wrapper envelope). Every prepare call dry-runs the resulting bundle through `@morpho-org/evm-simulation`; the verified token transfers ship inline in the optional `simulation` block. When the simulation reverts, is screened against a sanctioned address, or detects bundler retention, the field is omitted and the failure surfaces as an `error`-level entry in `warnings` — agents must HALT on those.

The `chain` field accepts any registered slug: `ethereum`, `base`, `arbitrum`, `optimism`, `polygon`, `unichain`, `worldchain`, `katana`, `hyperevm`, `monad`, `stable`. Examples below use `"base"` but the shape is identical across all chains.

```json
{
  "operation": "deposit",
  "chain": "base",
  "summary": "Deposit 1000 USDC into Steakhouse USDC",
  "requirements": [
    { "type": "approval", "token": "0x...", "spender": "0x...", "amount": "1000000000" }
  ],
  "transactions": [
    { "to": "0x...", "data": "0x...", "value": "0", "chainId": "8453", "description": "Approve 1000 USDC to vault" },
    { "to": "0x...", "data": "0x...", "value": "0", "chainId": "8453", "description": "Deposit 1000 USDC into vault" }
  ],
  "simulation": {
    "transfers": [
      {
        "token": { "address": "0x...", "symbol": "USDC" },
        "from": "0xb078...",
        "to": "0x21fE...",
        "amount": { "symbol": "USDC", "value": "1000.00" }
      }
    ],
    "assetChanges": [
      {
        "type": "Transfer",
        "from": "0xb078...",
        "to": "0x21fE...",
        "amount": "1000.00",
        "rawAmount": "1000000000",
        "dollarValue": "1000.00",
        "tokenInfo": {
          "address": "0xA0b8...",
          "symbol": "USDC",
          "decimals": 6,
          "name": "USD Coin"
        }
      }
    ]
  },
  "outcome": { ... },
  "warnings": []
}
```

- `operation` — `"deposit"` | `"withdraw"` | `"supply"` | `"borrow"` | `"repay"` | `"supply_collateral"` | `"withdraw_collateral"`
- `outcome` — canonical post-state view (see below); absent when no SDK preview is available
- `simulation` — present when the SDK simulation succeeded. Always contains `transfers[]` (verified ERC-20/native transfers, `{ token, from, to, amount }` with decimal-applied amounts). May also contain `assetChanges[]` — Tenderly-only enrichment with `{ type ('Transfer' | 'Mint' | 'Burn'), from, to, amount (decimal-applied), rawAmount (base units), dollarValue (USD at sim time), tokenInfo: { address, symbol, decimals, name } }`. `assetChanges` is absent when Tenderly is not configured (CLI default), when the SDK fell back to `eth_simulateV1`, or for chains Tenderly does not support. The whole `simulation` block is absent on simulation failure; check `warnings` for an `error`-level entry like `SIMULATION_REVERTED`, `BUNDLER_RETAINS_FUNDS`, or `SANCTIONED_ADDRESS`.
- `warnings` — always present (may be empty); check before presenting to the user

### `requirements` variants

- `{ "type": "approval", "token": "0x...", "spender": "0x...", "amount": "1000000000" }`
- `{ "type": "permit", "token": "0x...", "spender": "0x...", "amount": "...", "deadline": "..." }`
- `{ "type": "permit2", "token": "0x...", "spender": "0x...", "amount": "...", "deadline": "..." }`
- `{ "type": "unsupported", "token": "0x...", "reason": "...", "notes": "..." }`

Approvals are already included in `transactions` — `requirements` is informational only.

### `outcome` field

The `outcome` is the canonical post-state view, populated from simulation when available, or from SDK preview math otherwise. The agent does not need to know which source produced it — the shape is the same.

```json
{
  "outcome": {
    "vault": {
      "sharesReceived": "987654321",
      "assetsReceived": "1000000000",
      "positionAssets": "1000000000",
      "positionShares": "987654321"
    }
  }
}
```

```json
{
  "outcome": {
    "market": {
      "supplied": "0",
      "borrowed": "500000000",
      "collateral": "1000000000000000000",
      "healthFactor": "1.25",
      "isHealthy": true,
      "maxBorrowable": "200000000",
      "utilizationBeforePct": "75",
      "utilizationAfterPct": "78",
      "borrowApyBeforePct": "3.12",
      "borrowApyAfterPct": "3.45"
    }
  }
}
```

Either `vault` or `market` (or both) may be present depending on operation type.

**`vault` outcome fields:**
- `sharesReceived` — vault shares minted (deposit) or burned (withdraw); optional
- `assetsReceived` — assets received (withdraw only); optional
- `positionAssets` — total position value in assets after operation
- `positionShares` — total share balance after operation

**`market` outcome fields (all amounts are raw integer strings):**
- `supplied`, `borrowed`, `collateral` — user positions in loan-token and collateral-token units after operation
- `healthFactor` — ratio; `< 1` is liquidatable; absent when there is no borrow
- `isHealthy` — whether position is above liquidation threshold; optional
- `maxBorrowable` — max additional borrowable in loan-token units; optional
- `utilizationBeforePct`, `utilizationAfterPct` — market utilization as percent strings (`"75"` = 75%)
- `borrowApyBeforePct`, `borrowApyAfterPct` — borrow APY as percent strings; optional

---

## `prepare-deposit`

**Options:** `--chain` (required), `--vault-address` (required), `--user-address` (required), `--amount` (required; human-readable, e.g. `1000`)
Returns a `PreparedOperation` with `operation: "deposit"`. The `outcome.vault` field is populated.

---

## `prepare-withdraw`

**Options:** `--chain` (required), `--vault-address` (required), `--user-address` (required), `--amount` (required; human-readable, or `max` for the full position)
The `outcome.vault` field is populated, including `assetsReceived`.

If `--amount max` cannot withdraw the full balance, the returned `PreparedOperation` represents the largest withdrawable amount right now; `warnings[]` calls out the liquidity shortfall. Surface the warning verbatim — do not parse `summary`. The user can accept the partial amount (optionally re-run with `--amount <value>` at ~99% of `outcome.vault.assetsReceived` as an interest-accrual buffer) or wait for more liquidity.

---

## `prepare-supply`

**Options:** `--chain` (required), `--market-id` (required), `--user-address` (required), `--amount` (required; human-readable)
Returns a `PreparedOperation` with `operation: "supply"`. The `outcome.market` field is populated.

---

## `prepare-borrow`

**Options:** `--chain` (required), `--market-id` (required), `--user-address` (required), `--borrow-amount` (required; human-readable, note the flag is `--borrow-amount`, not `--amount`)
Returns a `PreparedOperation` with `operation: "borrow"`. The `outcome.market` field is populated, including `healthFactor`.

---

## `prepare-repay`

**Options:** `--chain` (required), `--market-id` (required), `--user-address` (required), `--amount` (required; human-readable, or `max` to repay the full debt)
Returns a `PreparedOperation` with `operation: "repay"`.

---

## `prepare-supply-collateral`

**Options:** `--chain` (required), `--market-id` (required), `--user-address` (required), `--amount` (required; human-readable, in collateral-asset units)
Returns a `PreparedOperation` with `operation: "supply_collateral"`. The `outcome.market` field is populated.

---

## `prepare-withdraw-collateral`

**Options:** `--chain` (required), `--market-id` (required), `--user-address` (required), `--amount` (required; human-readable, or `max` to withdraw all collateral)
Returns a `PreparedOperation` with `operation: "withdraw_collateral"`.

