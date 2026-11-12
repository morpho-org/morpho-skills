# Build prompt: Earn, vanilla

Paste everything below the line into a fresh build session with no Morpho plugin installed.
Fill in:

- `<OUTPUT_REPO>` and `<OUTPUT_BRANCH>`: where the app is pushed. Use a
  branch name that does not reveal the condition (for example `run-<random-id>`).
- Provide the Actions API key to the session as `MORPHO_API_KEY`.

---

Do not install or read any Morpho agent skill or plugin: nothing from
`morpho-org/morpho-skills`, no `morpho-builder` or `morpho-mcp` plugin, and not
the Morpho MCP server. Anything else on the web is fine.

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
