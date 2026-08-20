# Morpho Skills

## Overview

**morpho-agent** — A Claude plugin that includes the remote Morpho MCP server. Query vaults, markets, and user positions, prepare transactions, and simulate outcomes on Ethereum and Base.

**morpho-builder** — Skills and compliance agents for building and reviewing Morpho-powered products, driven by the Morpho Integrator UX Playbook. One skill pair per product:

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

# Install the agent plugin with the Morpho MCP server
/plugin install morpho-agent@morpho-skills

# Install the builder plugin
/plugin install morpho-builder@morpho-skills
```

The `morpho-agent` plugin bundles the Morpho MCP configuration, so no separate MCP setup is required in Claude Code.

### Other Agents

```bash
npx skills add morpho-org/morpho-skills
```

The standalone skills command installs every skill in this repository, but it does not install Claude plugin configuration. Configure the Morpho MCP server separately with `https://mcp.morpho.org` when your agent supports MCP.
