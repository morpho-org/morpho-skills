# Morpho MCP plugin

Connects the agent to Morpho's hosted MCP server, `https://mcp.morpho.org/`: live Vaults V1 and V2, Markets, wallet positions, token balances, supported chains and docs search. No key.

The plugin only carries the server connection — no skills. The agent discovers the tools from the server's own tool descriptions.

Everything is read only. The server also exposes `morpho_prepare_*` tools that build unsigned transactions; they return calldata but never sign or send it.

Layout mirrors `aave/skills` (`plugins/mcp`): one folder with both `.cursor-plugin/` and `.claude-plugin/` manifests and `mcp.json` / `.mcp.json`.
