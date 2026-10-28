# Morpho MCP plugin

Connects your agent to Morpho's hosted MCP server at `https://mcp.morpho.org/`. Your agent can then answer questions about Morpho with live data (Vaults V1 and V2, Markets, Midnight fixed rate books, wallet positions, and a search over the official docs) and prepare unsigned transactions for your own wallet to sign. It never signs or sends anything. No API key needed.

The plugin holds the server connection and one skill, `safe-transactions`, which the agent follows before preparing any transaction (see [Safety](#safety)). For everything else the agent picks its tools from the server's own tool descriptions.

## Install

**Claude Code**

```
/plugin marketplace add morpho-org/morpho-skills
/plugin install morpho-mcp@morpho-skills
```

**Cursor**: install `morpho-mcp` from the Cursor Marketplace, or add the server to `.cursor/mcp.json` yourself:

```json
{ "mcpServers": { "morpho": { "type": "http", "url": "https://mcp.morpho.org/" } } }
```

**Any other MCP client** (Grok Bot, ChatGPT, Claude Desktop…): add a remote HTTP MCP server with the URL `https://mcp.morpho.org/` and no authentication.

## What it can do

| Area | Examples of tools |
| --- | --- |
| Vaults V1 and V2 | `morpho_vault_v1_list_vaults`, `morpho_vault_v2_list_vaults`, `morpho_vault_v2_get_state`, `morpho_vault_v2_get_apy_averages`, `morpho_vault_v2_get_allocations`, `morpho_vault_v2_get_withdrawal_options` |
| Markets | `morpho_blue_list_markets`, `morpho_blue_get_market_state`, `morpho_blue_get_market_liquidity` |
| Midnight (fixed rate) | `morpho_midnight_list_markets`, `morpho_midnight_list_books`, `morpho_midnight_get_book_quote` |
| Positions | `morpho_vault_v2_list_user_positions`, `morpho_blue_get_user_position`, `morpho_midnight_list_user_positions` |
| Docs | `morpho_doc_search` |
| Transactions | `morpho_prepare_*` (deposit, withdraw, supply, borrow, repay…) |

Your MCP client lists every tool the server offers.

## Safety

- **Unsigned only.** The `morpho_prepare_*` tools return unsigned calldata, and sometimes a typed data message (such as a token permit) for your wallet to sign. Your own wallet signs and sends. The server never signs and never sends anything onchain.
- **No keys, ever.** No tool takes a private key or seed phrase. Never paste one into a chat.
- **Check before signing.** Check every transaction in your wallet before you sign it: chain, addresses and amounts. Vault and market prepare tools return the result of a simulation run when the calls were built. If it failed, the agent shows why and doesn't present the calls.
- **Same steps every time.** Before any prepare call, the `safe-transactions` skill has the agent look up the vault or market in the same session (never from memory), read your current position, and state the chain and full addresses. The answer always says nothing was sent.
- **APY is a snapshot,** not a promise of future returns.
- **No investment advice.** The agent reports data. Whether to act on it is your decision.

## Data handling

Checked in the server code that runs on mcp.morpho.org today ([`tool-logging.ts`](https://github.com/morpho-org/morpho-apps/blob/656f5cfeddb7c5232334696b71cfcb7acea4c6df/apps/morpho-agent-app/src/mcp/tool-logging.ts), [`betterstack-tool-logger.ts`](https://github.com/morpho-org/morpho-apps/blob/656f5cfeddb7c5232334696b71cfcb7acea4c6df/apps/morpho-agent-app/src/mcp/betterstack-tool-logger.ts), deployed version `656f5cf`). For each tool call the server sends this to Better Stack, when its token is set:

- the tool name, a random call ID, the status (called, completed, failed, timed out) and the duration
- the error type and message when a call fails
- the tool's response, cut at 90 KB. Responses can contain public wallet addresses, positions and unsigned calldata.
- the tool's input, cut at 32 KB, only when a call times out

What it never touches: private keys, seed phrases and wallet signing. No tool accepts them.

The next server release adds two fields to each log line: the client name (the first word of the user agent, such as `cursor`) and a caller ID, which is a SHA-256 hash of the IP address and user agent, or the client ID for OAuth clients. The raw IP address isn't stored in these logs.

Vercel's console logs get a shorter line per call: call ID, tool, status, duration and any error, without the response. This covers the server's tool logs only. Vercel's own request logs and the Morpho API that serves the data keep their own logs.

## Five things to ask

1. **"What are the largest USDC vaults on Base?"**
   The agent lists the V1 and V2 USDC vaults on Base, then fetches each one's state and APY to rank them. The lists alone don't include TVL or APY, so ranking takes one call per vault.
2. **"What is a vault curator on Morpho?"**
   The agent searches the official docs with `morpho_doc_search` and answers with a link to docs.morpho.org.
3. **"Who curates vault `0x…` on Base, and which markets does it allocate to?"**
   The agent reads the vault and its allocations. The curator comes back as an address.
4. **"Show the positions of wallet `0x…` on Ethereum."**
   The agent reads the wallet's vault and market positions. A public address is enough; never share a private key or seed phrase.
5. **"Prepare a deposit of 1,000 USDC into vault `0x…` on Base from wallet `0x…`."**
   The agent returns an unsigned transaction for you to review and sign in your wallet.

## Good to know

- Data is live and every answer depends on the chain, so name the chain in your question.
- APYs are snapshots, not promises.
- The MCP server is in active development: see [docs.morpho.org/developers/agents/mcp](https://docs.morpho.org/developers/agents/mcp/) for the current status and client setup guides.

## Layout

One folder with both manifests (`.cursor-plugin/plugin.json`, `.claude-plugin/plugin.json`), the server config (`mcp.json` for Cursor, `.mcp.json` for Claude), the `safe-transactions` skill (`skills/safe-transactions/SKILL.md`) and the logo (`assets/logo.svg`).
