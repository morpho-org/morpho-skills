# Morpho Skills

> **Experimental** — This project is under active development (pre-v1.0). Tool schemas, command syntax, and behavior may change without notice. The underlying MCP server and CLI are also experimental.

## Overview

**morpho-cli** — A conversational skill that lets Claude query the Morpho lending protocol and prepare unsigned transactions directly from the CLI. Ask about vault APYs, market rates, user positions, or build deposit/withdraw/borrow operations on Ethereum and Base.

**morpho-mcp** — A remote MCP server for the Morpho lending protocol. Query vaults, markets, and user positions, prepare transactions, and simulate outcomes on Ethereum and Base from any MCP-compatible client.

**vault-integration** — An integration skill for code-generation agents building Morpho Vault earn features. Covers the technical wiring (SDK flows, GraphQL API, ERC-4626) and Morpho's Integrator Blueprint: product vocabulary, Powered by Morpho attribution, disclosures, APY composition, and vault transparency.

## Quickstart

### Claude Code

```bash
# Add the Morpho marketplace
/plugin marketplace add morpho-org/morpho-skills

# Install the morpho-cli plugin
/plugin install morpho-cli@morpho-agent

# Install the morpho-mcp plugin
/plugin install morpho-mcp@morpho-agent

# Install the morpho-vault plugin (vault-integration skill)
/plugin install morpho-vault@morpho-agent
```

### Other Agents

```bash
npx skills add morpho-org/morpho-skills --skill morpho-cli

npx skills add morpho-org/morpho-skills --skill vault-integration
```

Add MCP with the following URL: `https://mcp.morpho.org`
