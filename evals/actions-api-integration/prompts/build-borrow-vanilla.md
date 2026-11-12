# Build prompt: Borrow, vanilla

Paste everything below the line into a fresh build session with no Morpho plugin installed.
Fill in:

- `<OUTPUT_REPO>` and `<OUTPUT_BRANCH>`: where the app is pushed. Use a
  branch name that does not reveal the condition (for example `run-<random-id>`).
- `<MIDNIGHT_MARKET_ID>`: the round's Midnight market, the same in both Borrow
  prompts (see the [README](../README.md#selectors)).
- Provide the Actions API key to the session as `MORPHO_API_KEY`.

---

Do not install or read any Morpho agent skill or plugin: nothing from
`morpho-org/morpho-skills`, no `morpho-builder` or `morpho-mcp` plugin, and not
the Morpho MCP server. Anything else on the web is fine.

Build a Next.js app (App Router, TypeScript) where a user connects a wallet
and borrows on Morpho, in two markets:

- Blue: USDC / cbBTC on Base, `8453:0x9103c3b4e834476c9a62ea009ba2c884ee42e94e6e314a26f04d312434191836`.
- Midnight: `<MIDNIGHT_MARKET_ID>` (USDC, on Base).

Use Morpho's public REST API for all data and Morpho's Actions API (the
"Borrow and Earn API") for all transactions. A Morpho API key is in the
`MORPHO_API_KEY` environment variable.

In each market, the user must be able to:

1. Pick a collateral amount and a borrow amount, see the rate, LTV and
   liquidation price before signing, and open the loan in one confirmation.
2. Choose the borrow amount with an LTV slider instead of typing it.
3. See what they posted, what they owe, what it costs and how close they are
   to liquidation.
4. Be warned in the app when the position gets close to liquidation.
5. Add collateral or repay part of the loan, seeing the new health before
   signing.
6. Close the loan and get the collateral back, knowing the cost before
   signing.

Errors must be shown in plain language. Do not ask me questions; make the
decisions yourself and list them in the app's README. Finish with `pnpm build`
passing and the app running on `localhost:3000`.

When done, push the app to `<OUTPUT_REPO>` on branch `<OUTPUT_BRANCH>`, with the
app at the repository root. Commit only the app: no `.env*` file or key value,
and no agent folders (`.agents/`, `.claude/`, `.cursor/`, `.devin/`). Do not
mention in the code, comments, README or commit messages which guidance you
used. Reply with the branch name, the commit SHA and the list of decisions.
