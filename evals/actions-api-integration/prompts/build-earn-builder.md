# Build prompt: Earn, builder skill

Paste everything below the line into a fresh build session.
Fill in:

- `<OUTPUT_REPO>` and `<OUTPUT_BRANCH>`: where the app is pushed. Use a
  branch name that does not reveal the condition (for example `run-<random-id>`).
- Provide the Actions API key to the session as `MORPHO_API_KEY`.
- Pin the skill: if `feature/sdk-1862-rewrite-the-morpho-builder-skills-around` has moved since the round
  started, replace the branch with the commit SHA you recorded.

---

Before you start, clone `https://github.com/morpho-org/morpho-skills` at branch
`feature/sdk-1862-rewrite-the-morpho-builder-skills-around` into `~/morpho-skills`, outside the app
directory. Read `~/morpho-skills/plugins/morpho-builder/skills/earn-integration/SKILL.md`
and follow it, opening its references as it tells you to. Do not copy the
skill into the app. Do not use the `morpho-mcp` plugin or the Morpho MCP
server.

Build a Next.js app (App Router, TypeScript) where a user connects a wallet
and earns on the Morpho Vault V2 `4663:0xBeEff033F34C046626B8D0A041844C5d1A5409dd`
(Steakhouse USDG on Robinhood Chain).

Use Morpho's public REST API for all data and Morpho's Actions API (the
"Borrow and Earn API") for all transactions. A Morpho API key is in the
`MORPHO_API_KEY` environment variable.

The user must be able to:

1. See what the vault earns, who curates it, and its total deposits.
2. Deposit an amount, see what they will receive, and review every step
   before signing.
3. See their balance, the rate they are earning, and what they have earned
   so far, including rewards.
4. Withdraw part or all of their balance, and know up front if the vault
   cannot pay all of it right now.
5. Claim any rewards, including after a full withdrawal.

Errors must be shown in plain language. Do not ask me questions; make the
decisions yourself and list them in the app's README. Finish with `pnpm build`
passing and the app running on `localhost:3000`.

When done, push the app to `<OUTPUT_REPO>` on branch `<OUTPUT_BRANCH>`, with the
app at the repository root. Commit only the app: no `.env*` file or key value,
and no agent folders (`.agents/`, `.claude/`, `.cursor/`, `.devin/`). Do not
mention in the code, comments, README or commit messages which guidance you
used. Reply with the branch name, the commit SHA and the list of decisions.
