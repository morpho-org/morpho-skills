# Backend Deposit Bot

Write a TypeScript script (Node 20, viem) for our treasury ops: given a funded private key in `TREASURY_PK`, deposit 250,000 USDC into the best available Morpho vault on Base, and include a second command to exit the entire position later.

## Requirements

1. Discover the vault programmatically — we don't have an address
2. Logs of what it's doing at each step
3. It must not send anything that would revert
4. Full exit must not leave dust behind

## Expected Output

A runnable TypeScript script with deposit and exit commands.
