# Morpho MCP plugin

Connects your agent to Morpho's hosted MCP server at `https://mcp.morpho.org/`. Your agent can then answer questions about Morpho with live data: Vaults V1 and V2, Markets, Midnight fixed rate books, wallet positions, and a search over the official docs. No API key needed.

The plugin only holds the server connection. It ships no skills: the agent picks its tools from the server's own tool descriptions.

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

Call `discover_tools` to get the full list.

**About transactions:** the `morpho_prepare_*` tools only build *unsigned* transactions. They return calldata for the user to review and sign in their own wallet. The server never asks for keys, never signs and never sends anything onchain.

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

## Listing metadata

The same details go into every marketplace submission (Claude, ChatGPT, Codex, Cursor, MCP Registry):

| Field | Value |
| --- | --- |
| Name | Morpho MCP |
| Server URL | `https://mcp.morpho.org/` (Streamable HTTP, no authentication) |
| Documentation | https://docs.morpho.org/developers/agents/mcp/ |
| Privacy policy | https://morpho.org/privacy-policy |
| Support | https://help.morpho.org |
| Icon | `assets/logo.svg` (square, 200×200) or `assets/logo.png` (512×512) |

## Layout

One folder with both manifests (`.cursor-plugin/plugin.json`, `.claude-plugin/plugin.json`), the server config (`mcp.json` for Cursor, `.mcp.json` for Claude) and the logo (`assets/logo.svg`, with a PNG export in `assets/logo.png`).
