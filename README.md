# Morpho Skills

## Overview

### morpho-builder

For teams building or reviewing Morpho-powered Earn and Borrow products. The skills provide product-specific guidance for live data, `@morpho-org/morpho-sdk` transactions, UI/UX, protocol math, disclosures, attribution, and pre-launch review.

| Product | Skill |
| --- | --- |
| Earn — Morpho Vault V2 | `earn-integration` |
| Borrow — Blue variable rate and/or Midnight fixed rate | `borrow-integration` |

Each skill has build/update and review modes. Earn defaults to Vault V2, including liquid and illiquid exits. Borrow first routes to Blue, Midnight, or both; mixed reviews preserve separate product verdicts. Review mode runs eight specialized checkers in parallel when delegation is available, evaluates a product acceptance matrix, and performs a red-flag pass. Every checker is a host-neutral prompt bundled under its skill's `references/checkers/` directory.

## Quickstart

### Claude Code

```bash
# Add the Morpho marketplace
/plugin marketplace add morpho-org/morpho-skills

# Install the builder plugin
/plugin install morpho-builder@morpho-skills
```

The Claude Code plugin installs the same self-contained skills and checker prompts used by Agent Skills hosts.

### Agent Skills

```bash
npx skills add morpho-org/morpho-skills
```

`npx skills` detects supported hosts and installs the two standalone skills. The root entries under `skills/` remain symlinks to the self-contained plugin copies, so both installation paths expose the same entrypoint, product references, review orchestrator, and checker fleet.

## Development

Product guidance is maintained directly with each public skill:

```text
plugins/morpho-builder/skills/
├── earn-integration/
│   ├── SKILL.md
│   └── references/{vault-v2.md,review.md,checkers/...}
└── borrow-integration/
    ├── SKILL.md
    └── references/{blue.md,midnight.md,review.md,checkers/...}
```

Maintain each skill in place and keep Earn and Borrow references product-specific; do not copy generic reference files between them. Validate both skill directories after changes with the `quick_validate.py` supplied by the Codex `skill-creator` skill.
