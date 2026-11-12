# Build task

Give each build session exactly one of the two tasks below, unchanged, in a
fresh session. The task names what the user must be able to do, never how: the
API rules the rubric checks are left out on purpose, so the benchmark measures
what the agent knows or looks up on its own.

Replace `<API_KEY_SECRET>` with the name of the secret that holds a Morpho
Actions API key. Both conditions get the same text; only the installed plugin
differs (see the [README](README.md#conditions)).

## Earn

> Build a Next.js app (App Router, TypeScript) where a user connects a wallet
> and earns on the Morpho Vault V2 `4663:0xBeEff033F34C046626B8D0A041844C5d1A5409dd`
> (Steakhouse USDG on Robinhood Chain).
>
> Use Morpho's public REST API for all data and Morpho's Actions API (the
> "Borrow and Earn API") for all transactions. A Morpho API key is in the
> `<API_KEY_SECRET>` environment variable.
>
> The user must be able to:
>
> 1. See what the vault earns, who curates it, and its total deposits.
> 2. Deposit an amount, see what they will receive, and review every step
>    before signing.
> 3. See their balance, the rate they are earning, and what they have earned
>    so far, including rewards.
> 4. Withdraw part or all of their balance, and know up front if the vault
>    cannot pay all of it right now.
> 5. Claim any rewards, including after a full withdrawal.
>
> Errors must be shown in plain language. Do not ask me questions; make the
> decisions yourself and list them in the README. Finish with the app running
> on `localhost:3000` and `pnpm build` passing.

## Borrow

> Build a Next.js app (App Router, TypeScript) where a user connects a wallet
> and borrows on Morpho, in two markets:
>
> - Blue: USDC / cbBTC on Base, `8453:0x9103c3b4e834476c9a62ea009ba2c884ee42e94e6e314a26f04d312434191836`.
> - Midnight: `<MIDNIGHT_MARKET_ID>` (USDC, on Base).
>
> Use Morpho's public REST API for all data and Morpho's Actions API (the
> "Borrow and Earn API") for all transactions. A Morpho API key is in the
> `<API_KEY_SECRET>` environment variable.
>
> In each market, the user must be able to:
>
> 1. Pick a collateral amount and a borrow amount, see the rate, LTV and
>    liquidation price before signing, and open the loan in one confirmation.
> 2. Choose the borrow amount with an LTV slider instead of typing it.
> 3. See what they posted, what they owe, what it costs and how close they are
>    to liquidation.
> 4. Be warned in the app when the position gets close to liquidation.
> 5. Add collateral or repay part of the loan, seeing the new health before
>    signing.
> 6. Close the loan and get the collateral back, knowing the cost before
>    signing.
>
> Errors must be shown in plain language. Do not ask me questions; make the
> decisions yourself and list them in the README. Finish with the app running
> on `localhost:3000` and `pnpm build` passing.

Pick `<MIDNIGHT_MARKET_ID>` once per benchmark round from
`GET https://api.morpho.org/v0/midnight/markets?listed=true&chain_ids=8453`
(a listed, active USDC market with the latest maturity), and use the same ID
for every Borrow build in the round.
