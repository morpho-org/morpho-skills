# Morpho Skills

## Overview

### morpho-builder

For teams building, reviewing or migrating Morpho-powered integrations. The skills use the Morpho REST read API for displayed protocol data, the Actions API for vault and borrowing transactions, and Merkl for reward rates, balances, and Distributor claims. They include product-specific UI/UX, protocol math, disclosures, attribution, and pre-launch review.

| Product | Skill |
| --- | --- |
| Earn — Morpho Vault V2, with Vault V1 compatibility | `earn-integration` |
| Borrow — Blue variable rate, no maturity; Midnight fixed rate, fixed maturity | `borrow-integration` |
| Migration — existing GraphQL reads and legacy transaction builders to REST + Actions | `migrate-graphql-to-rest` |

The Earn and Borrow skills have build/update and review modes. Earn defaults to Vault V2, including deposits, position performance, liquid and illiquid exits, and separate Merkl reward claims. Borrow first routes to Blue, Midnight, or both; mixed reviews preserve separate product verdicts. Review mode runs eight specialized checkers in parallel when delegation is available, evaluates a product acceptance matrix, and performs a red-flag pass. Every checker is a host-neutral prompt bundled under its skill's `references/checkers/` directory. Actions API keys stay server-side; browser requests go through the integrator's backend. The skills provide guidance, not a transaction execution service.

The migration skill audits query/transaction consumers, maps consumed fields to verified REST routes, rewrites transactions to Actions, and compares legacy/new outputs with explicit semantic changes and gaps. It includes a migration-report template; missing equivalents are not silently approximated.

### morpho-mcp

Connects the agent to Morpho's hosted MCP server for live Vaults V1 and V2, Markets, positions and docs, plus unsigned transaction preparation. It never signs or sends. The plugin carries the server connection and one `safe-transactions` skill that the agent follows before preparing a transaction.

## Quickstart

### Claude Code

```bash
# Add the Morpho marketplace
/plugin marketplace add morpho-org/morpho-skills

# Install the builder plugin
/plugin install morpho-builder@morpho-skills

# Install the MCP plugin
/plugin install morpho-mcp@morpho-skills
```

The Claude Code plugin installs the same self-contained skills and checker prompts used by Agent Skills hosts.

Any MCP client: point it at `https://mcp.morpho.org/`.

### Codex CLI

With a current Codex CLI that supports `codex plugin`:

```bash
codex plugin marketplace add morpho-org/morpho-skills
codex plugin add morpho-mcp@morpho-skills
codex plugin list
```

The plugin includes the server connection and the `safe-transactions` skill. No API key is needed. The marketplace also lists `morpho-builder`.

For just the server connection, without the bundled skill, use `codex mcp add morpho --url https://mcp.morpho.org/` instead. See the [Codex setup guide](https://docs.morpho.org/developers/agents/mcp/#codex) for configuration and timeout settings.

### Agent Skills

```bash
npx skills add morpho-org/morpho-skills
```

`npx skills` detects supported hosts and installs the three standalone skills. The root entries under `skills/` remain symlinks to the self-contained plugin copies, so both installation paths expose the same entrypoint, product references, review orchestrator, and checker fleet.

## Development

Product guidance is maintained directly with each public skill:

```text
plugins/morpho-builder/skills/
├── earn-integration/
│   ├── SKILL.md
│   └── references/{vault-v2.md,review.md,checkers/...}
├── borrow-integration/
│   ├── SKILL.md
│   └── references/{blue.md,midnight.md,review.md,checkers/...}
└── migrate-graphql-to-rest/
    ├── SKILL.md
    └── references/{route-map.md,verification.md,migration-report.md}
```

Maintain each skill in place and keep Earn and Borrow references product-specific; do not copy generic reference files between them. Validate all three skill directories after changes with the `quick_validate.py` supplied by the Codex `skill-creator` skill.
