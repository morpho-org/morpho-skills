# Morpho Skills

> **Experimental** — This project is under active development (pre-v1.0). Tool schemas, command syntax, and behavior may change without notice. The underlying MCP server and CLI are also experimental.

## Overview

**morpho-cli** — A conversational skill that lets Claude or Codex query the Morpho lending protocol and prepare unsigned transactions directly from the CLI. Ask about vault APYs, market rates, user positions, or build deposit/withdraw/borrow operations on Ethereum and Base.

**morpho-mcp** — A remote MCP server for the Morpho lending protocol. Query vaults, markets, and user positions, prepare transactions, and simulate outcomes on Ethereum and Base from any MCP-compatible client.

**morpho-integration** — Skills and compliance agents for building and reviewing Morpho-powered products, driven by the Morpho Integrator UX Playbook. One skill pair per product:

| Product | Build skill | Review skill |
| --- | --- | --- |
| Earn (Vaults) | `earn-integration` | `earn-integration-review` |
| Borrow — variable (Blue) & fixed (Midnight) | `borrow-integration` | `borrow-integration-review` |

Build skills use the playbook's shared foundations as their base with product-specific guidance folded into each SKILL.md. Review skills orchestrate seven per-foundation compliance agents and report against the rubric checklist in tabular form, plus the whole-flow pass and launch self-review. Canonical shared references (foundations, glossary, rubrics) live in the plugin's `docs/` and are synchronized into each standalone skill for portable installs.

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

### Codex

Install the native Codex plugins from this repository's marketplace:

```bash
codex plugin marketplace add morpho-org/morpho-skills
codex plugin add morpho-cli@morpho-agent
codex plugin add morpho-mcp@morpho-agent
codex plugin add morpho-integration@morpho-agent
```

Codex supports subagent workflows. The integration review skills delegate the seven independent compliance foundations in parallel. This repo also includes project-scoped custom agent profiles under `.codex/agents/`; installed skills fall back to general-purpose Codex subagents with the same bundled checker instructions.

### Standalone skills and other agents

```bash
npx skills add morpho-org/morpho-skills --agent codex
```

`npx skills` installs the five `SKILL.md` workflows, but not plugin MCP configuration or custom agent profiles. Add the MCP server separately when using the standalone route:

```bash
codex mcp add morpho --url https://mcp.morpho.org
```

Other Agent Skills-compatible clients can omit `--agent codex` and select their target interactively. The MCP URL is `https://mcp.morpho.org`.

## Development

After changing the integration plugin's canonical `docs/` or Claude `agents/`, run `sh scripts/sync-integration-skill-resources.sh`. The synchronized copies keep each standalone skill self-contained for `npx skills` installs.
