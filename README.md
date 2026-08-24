# Morpho Skills

## Overview

### morpho-builder

For teams building or reviewing Morpho-powered products. This plugin provides Morpho integration best practices across UI/UX, live data, official SDK usage, protocol math, transaction flows, disclosures, attribution, and pre-launch review.

| Product | Skill |
| --- | --- |
| Earn (Vaults) | `earn-integration` |
| Borrow — variable (Blue) & fixed (Midnight) | `borrow-integration` |

Each skill has two modes: build or update the integration, and run a full review. Review mode orchestrates seven specialized compliance checks, reports against the rubric checklist, and performs the red-flag pass and launch self-review. Every checker is a host-neutral prompt under the same skill's `references/` directory, so the complete workflow installs as one package through the Claude Code plugin or Agent Skills.

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

`npx skills` detects supported hosts and installs the two standalone skills. Each installed skill includes its build guidance, full review workflow, and checker prompts. In review mode, the skill instructs the main agent to spawn one subagent per checker when delegation is available, or run the same checks sequentially when it is not.

## Development

After changing the builder plugin's canonical `docs/`, run `sh scripts/sync-builder-skill-resources.sh`. The synchronized copies keep each standalone skill self-contained for Claude Code and `npx skills` installs. Checker prompts are maintained directly under each skill's `references/checkers/` directory.
