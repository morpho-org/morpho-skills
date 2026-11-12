# Morpho Skills

## Overview

### morpho-builder

For teams building or reviewing Morpho-powered Earn and Borrow products. The integration skill uses the Morpho REST read API for displayed protocol data, the Actions API for vault and borrowing transactions, and Merkl for reward rates, balances, and Distributor claims. It includes product-specific UI/UX, protocol math, disclosures, attribution, and pre-launch review.

| Product | Skill |
| --- | --- |
| Earn — Morpho Vault V2, with Vault V1 compatibility | `morpho-integration` |
| Borrow — Blue variable rate, no maturity; Midnight fixed rate, fixed maturity | `morpho-integration` |

The skill has build/update and review modes. Read only the selected product's references. Earn defaults to Vault V2, including deposits, position performance, liquid and illiquid exits, and separate Merkl reward claims. Borrow first routes to Blue, Midnight, or both; mixed reviews preserve separate product verdicts. Review mode runs eight specialized checkers in parallel when delegation is available, evaluates a product acceptance matrix, and performs a red-flag pass. Every checker is a host-neutral prompt bundled under `morpho-integration/references/checkers/`. Actions API keys stay server-side; browser requests go through the integrator's backend. The skill provides guidance, not a transaction execution service.

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

`npx skills` detects supported hosts and installs the standalone integration skill. The root entry under `skills/` remains a symlink to the self-contained plugin copy, so both installation paths expose the same entrypoint, product references, review orchestrator, and checker fleet.

## Development

Product guidance is maintained in one public integration skill:

```text
plugins/morpho-builder/skills/
└── morpho-integration/
    ├── SKILL.md
    └── references/{vault-v2.md,blue.md,midnight.md,review.md,checkers/...}
```

Keep Earn, Blue and Midnight references product-specific; maintain shared contracts and checker rows once. Validate the skill directory after changes with the `quick_validate.py` supplied by the Codex `skill-creator` skill.
