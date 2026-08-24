# Morpho Skills

## Overview

### morpho-builder

For teams building or reviewing Morpho-powered products. This plugin provides Morpho integration best practices across UI/UX, live data, official SDK usage, protocol math, transaction flows, disclosures, attribution, and pre-launch review.

| Product | Build skill | Review skill |
| --- | --- | --- |
| Earn (Vaults) | `earn-integration` | `earn-integration-review` |
| Borrow — variable (Blue) & fixed (Midnight) | `borrow-integration` | `borrow-integration-review` |

Each build skill combines shared integration best practices with product-specific guidance. Review skills orchestrate seven specialized compliance checks and report against the rubric checklist in tabular form, plus the red-flag pass and launch self-review. Every checker is a host-neutral prompt under the skill's `references/` directory, so the same skill package works through the Claude Code plugin or a standalone Agent Skills install.

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

`npx skills` detects supported hosts and installs the four standalone skills. Each installed skill includes its own references and checker prompts. The skill instructs the main agent to spawn one subagent per checker when delegation is available, or run the same checks sequentially when it is not.

## Development

After changing the builder plugin's canonical `docs/`, run `sh scripts/sync-builder-skill-resources.sh`. The synchronized copies keep each standalone skill self-contained for Claude Code and `npx skills` installs. Checker prompts are maintained directly under each skill's `references/checkers/` directory.
