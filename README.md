# Morpho Skills

## Overview

### morpho-builder

For teams building, reviewing or migrating Morpho-powered integrations. The integration manual covers REST reads, Actions transactions and Merkl rewards through product manuals, data contracts derived from canonical OpenAPI specifications, shared transaction safeguards, UI correctness principles and an integrator handbook of product guidelines grouped by the concern each solves, and REST API best practice.

| Product | Skill |
| --- | --- |
| Earn — Morpho Vault V2, with Vault V1 compatibility | `morpho-integration` |
| Borrow — Blue variable rate, no maturity; Midnight fixed rate, fixed maturity | `morpho-integration` |
| Migration — existing GraphQL reads and legacy transaction builders to REST + Actions | `migrate-graphql-to-rest` |

Before building, `morpho-integration` interviews the user like the [Integration Compass](https://morpho-integration-compass.vercel.app/): Earn, Borrow or both, then architecture and footprint, and builds from the confirmed profile. Read only the applicable product manuals. Reviews assess the functionality actually offered and the agreed integration scope using eleven specialist checkers: one per handbook category, plus REST API usage and units and transaction integrity, in parallel when delegation is available. Each checker is a host-neutral prompt under `morpho-integration/references/checkers/`; conclusions keep defects, unverified paths and product-specific evidence separate. Actions API keys stay server-side. The skills provide guidance, not a transaction execution service.

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

`npx skills` detects supported hosts and installs the two standalone skills. The root entries under `skills/` remain symlinks to the self-contained plugin copies, so both installation paths expose the same entrypoint, product references, review orchestrator, and checker fleet.

## Development

Product guidance is maintained in one public integration skill, alongside the migration skill:

```text
plugins/morpho-builder/skills/
├── morpho-integration/
│   ├── SKILL.md
│   └── references/{vault-v2.md,blue.md,midnight.md,ui-principles.md,handbook.md,rest-api-best-practice.md,intake.md,review.md,checkers/...}
└── migrate-graphql-to-rest/
    ├── SKILL.md
    └── references/{route-map.md,verification.md,migration-report.md}
```

Keep Earn, Blue and Midnight manuals product-specific; maintain shared principles and specialist checker prompts once. Validate both skill directories after changes with the `quick_validate.py` supplied by the Codex `skill-creator` skill.
