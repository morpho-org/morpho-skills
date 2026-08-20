# Morpho Skills

## Overview

### morpho-builder

For teams building or reviewing Morpho-powered products. This plugin provides Morpho integration best practices across UI/UX, live data, official SDK usage, protocol math, transaction flows, disclosures, attribution, and pre-launch review.

| Product | Build skill | Review skill |
| --- | --- | --- |
| Earn (Vaults) | `earn-integration` | `earn-integration-review` |
| Borrow — variable (Blue) & fixed (Midnight) | `borrow-integration` | `borrow-integration-review` |

Each build skill combines shared integration best practices with product-specific guidance. Review skills orchestrate seven specialized compliance agents and report against the rubric checklist in tabular form, plus the red-flag pass and launch self-review. Shared references (foundations, glossary, rubrics) live once in the plugin's `docs/`.

### morpho-agent

For people using personal agents to interact with Morpho markets and vaults. This plugin bundles the remote Morpho MCP server so an agent can query markets, vaults, rates, and user positions, prepare transactions, and simulate outcomes on Ethereum and Base.

## Quickstart

### Claude Code

```bash
# Add the Morpho marketplace
/plugin marketplace add morpho-org/morpho-skills

# Install the builder plugin
/plugin install morpho-builder@morpho-skills

# Install the agent plugin with the Morpho MCP server
/plugin install morpho-agent@morpho-skills
```

The `morpho-agent` plugin bundles the Morpho MCP configuration, so no separate MCP setup is required in Claude Code.

### Other Agents

```bash
npx skills add morpho-org/morpho-skills
```

The standalone skills command installs every skill in this repository, but it does not install Claude plugin configuration. Configure the Morpho MCP server separately with `https://mcp.morpho.org` when your agent supports MCP.
