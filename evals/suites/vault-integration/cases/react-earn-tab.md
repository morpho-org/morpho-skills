# React Earn Tab

We're building a self-custody wallet app in React (Next.js 14, wagmi v2, viem) and want to add an Earn tab backed by Morpho vaults for USDC on Base.

## Context

- Design system exposes `<Button>`, `<Card>`, `<Modal>`, `<Sheet>` primitives
- Users hold USDC in the wallet already
- Components live under `src/features/earn/`

## Requirements

1. Product-detail screen showing the yield opportunity
2. Deposit flow with a review step
3. Post-deposit view showing the user's position alongside their other balances

## Expected Output

React components for all three surfaces with real data wiring (Morpho GraphQL API / SDK), correct transaction flow for deposits, and user-facing copy.
