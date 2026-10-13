# Morpho MCP plugin

Connects the agent to Morpho's hosted MCP server, `https://mcp.morpho.org/`: live Vaults V1 and V2, Markets, wallet positions, token balances, supported chains and docs search. No key.

This plugin's skills are **read only**. The server also has `morpho_prepare_*` tools that return unsigned transactions; this plugin does not use them.

| Skill | Use |
|---|---|
| `morpho-live-data` | Rates, TVL, fees, curator, allocations, positions, balances |
| `morpho-docs-answer` | Concepts and integration questions from the current docs |
| `morpho-builder-handoff` | Send product builders to `earn-integration` / `borrow-integration` |

Layout mirrors `aave/skills` (`plugins/mcp`): one folder with both `.cursor-plugin/` and `.claude-plugin/` manifests, `mcp.json` / `.mcp.json`, and `skills/`.
