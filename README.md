# Morpho Skills

> **Experimental** — This project is under active development (pre-v1.0). Tool schemas, command syntax, and behavior may change without notice. The underlying MCP server and CLI are also experimental.

## Overview

**morpho-cli** — A conversational skill that lets Claude query the Morpho lending protocol and prepare unsigned transactions directly from the CLI. Ask about vault APYs, market rates, user positions, or build deposit/withdraw/borrow operations on Ethereum and Base.

**morpho-mcp** — A remote MCP server for the Morpho lending protocol. Query vaults, markets, and user positions, prepare transactions, and simulate outcomes on Ethereum and Base from any MCP-compatible client.

**morpho-integration** — Skills and compliance agents for building and reviewing Morpho-powered products, driven by the Morpho Integrator UX Playbook. One skill pair per product:

| Product | Build skill | Review skill |
| --- | --- | --- |
| Earn (Vaults) | `earn-integration` | `earn-integration-review` |
| Borrow — variable (Blue) & fixed (Midnight) | `borrow-integration` | `borrow-integration-review` |

Build skills use the playbook's shared foundations as their base with product-specific guidance folded into each SKILL.md. Review skills orchestrate seven per-foundation compliance agents and report against the rubric checklist in tabular form, plus the red-flag pass and launch self-review. Shared references (foundations, glossary, rubrics) live once in the plugin's `docs/`.

## Quickstart

### Claude Code

```bash
# Add the Morpho marketplace
/plugin marketplace add morpho-org/morpho-skills

# Install the morpho-cli plugin
/plugin install morpho-cli@morpho-agent

# Install the morpho-mcp plugin
/plugin install morpho-mcp@morpho-agent

# Install the integration plugin
/plugin install morpho-integration@morpho-agent
```

### Other Agents

```bash
npx skills add morpho-org/morpho-skills
```

Add MCP with the following URL: `https://mcp.morpho.org`
