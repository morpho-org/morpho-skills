# Build prompt: Borrow, builder skill

Paste everything below the line into a fresh build session.
Fill in:

- `<OUTPUT_REPO>` and `<OUTPUT_BRANCH>`: where the app is pushed. Use a
  branch name that does not reveal the condition (for example `run-<random-id>`).
- `<MIDNIGHT_MARKET_ID>`: the round's Midnight market, the same in both Borrow
  prompts (see the [README](../README.md#selectors)).
- Provide the Actions API key to the session as `MORPHO_API_KEY`.
- Pin the skill: if `feature/sdk-1862-rewrite-the-morpho-builder-skills-around` has moved since the round
  started, replace the branch with the commit SHA you recorded.

---

Before you start, clone `https://github.com/morpho-org/morpho-skills` at branch
`feature/sdk-1862-rewrite-the-morpho-builder-skills-around` into `~/morpho-skills`, outside the app
directory. Read `~/morpho-skills/plugins/morpho-builder/skills/borrow-integration/SKILL.md`
and follow it, opening its references as it tells you to. Do not copy the
skill into the app. Do not use the `morpho-mcp` plugin or the Morpho MCP
server.

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
