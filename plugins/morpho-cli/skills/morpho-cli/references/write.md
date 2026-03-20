# Write Command Response Schemas

All `prepare-*` commands return the same `PreparedOperation` shape. `simulate-transactions` returns a `TransactionSimulationResult`.

## prepare-deposit / prepare-withdraw / prepare-supply / prepare-borrow / prepare-repay

```json
{
  "operation": "deposit",
  "chain": "base",
  "summary": "Deposit 1000 USDC into Steakhouse USDC vault",
  "transactions": [
    {
      "to": "0x...",
      "data": "0x...",
      "value": "0",
      "chainId": "8453",
      "description": "Approve 1000 USDC to vault"
    },
    {
      "to": "0x...",
      "data": "0x...",
      "value": "0",
      "chainId": "8453",
      "description": "Deposit 1000 USDC into vault"
    }
  ],
  "requirements": [
    {
      "type": "approval",
      "token": "0x...",
      "spender": "0x...",
      "amount": "1000000000"
    }
  ],
  "analysisContext": {
    "protocol": "morpho",
    "operation": "deposit",
    "chain": "base",
    "userAddress": "0x...",
    "vaultAddress": "0x...",
    "assets": [
      { "address": "0x...", "symbol": "USDC", "decimals": 6, "chain": "base" }
    ],
    "positionKeys": ["0x..."],
    "postStateReads": [
      { "target": "0x...", "calldata": "0x...", "label": "vault shares" }
    ]
  },
  "warnings": [
    {
      "level": "warning",
      "message": "Insufficient vault liquidity for full withdrawal",
      "code": "INSUFFICIENT_LIQUIDITY"
    }
  ]
}
```

### Fields

- **`operation`** — `"deposit"` | `"withdraw"` | `"supply"` | `"borrow"` | `"repay"`
- **`summary`** — human-readable description of the operation
- **`transactions`** — ordered array of unsigned transactions to sign and send
  - `to` — contract address
  - `data` — encoded calldata
  - `value` — ETH value (usually `"0"`)
  - `chainId` — `"1"` (Ethereum) or `"8453"` (Base)
  - `description` — what this transaction does
- **`requirements`** — approvals/permits needed (already included in `transactions`)
  - `type` — `"approval"` | `"permit"` | `"permit2"` | `"unsupported"`
  - For `"unsupported"`: includes `reason` and `notes` fields
- **`analysisContext`** — pass this to `simulate-transactions` for pre/post state analysis
- **`warnings`** — array of warnings (may be empty)
  - `level` — `"info"` | `"warning"` | `"error"`
  - `code` — machine-readable code (optional)

## simulate-transactions

```json
{
  "chain": "base",
  "allSucceeded": true,
  "totalGasUsed": "245000",
  "executionResults": [
    {
      "transactionIndex": 0,
      "success": true,
      "gasUsed": "45000",
      "returnData": "0x..."
    },
    {
      "transactionIndex": 1,
      "success": true,
      "gasUsed": "200000",
      "returnData": "0x..."
    }
  ],
  "morphoAnalysis": {
    "protocol": "morpho",
    "operation": "deposit",
    "vault": {
      "vaultAddress": "0x...",
      "sharesBefore": "0",
      "sharesAfter": "987654321",
      "assetsBefore": "0",
      "assetsAfter": "1000000000",
      "shareDelta": "987654321",
      "assetDelta": "1000000000",
      "projectedApy": "0.0534"
    },
    "warnings": []
  },
  "postStateReads": [
    {
      "label": "vault shares",
      "raw": "0x...",
      "decoded": "987654321",
      "type": "uint256"
    }
  ],
  "warnings": []
}
```

### Fields

- **`allSucceeded`** — `true` if every transaction executed without revert
- **`totalGasUsed`** — sum of gas across all transactions
- **`executionResults`** — per-transaction results
  - `success` — `false` if reverted
  - `revertReason` — present only on failure (e.g., `"ERC4626ExceededMaxWithdraw"`)
- **`morphoAnalysis`** — Morpho-specific pre/post state (only present if `analysisContext` was passed)
  - **`vault`** — for vault operations: shares/assets before/after with deltas
    - `projectedApy` — estimated APY (optional)
    - `marketStates` — per-market supply/borrow/utilization (optional)
  - **`market`** — for market operations: supply/borrow before/after with deltas
    - `healthFactor` — post-operation health factor (optional)
    - `liquidationRisk` — risk level string (optional)
    - `utilizationBefore` / `utilizationAfter` — market utilization change (optional)
    - `borrowAPYBefore` / `borrowAPYAfter` — borrow rate change (optional)
  - **`warnings`** — Morpho-specific warnings (health factor, liquidity)
- **`postStateReads`** — decoded on-chain reads after simulation
- **`warnings`** — top-level warnings
