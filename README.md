# Morpho Skills

## Overview

### morpho-builder

For teams building or reviewing Morpho-powered products. This plugin provides Morpho integration best practices across UI/UX, live data, official SDK usage, protocol math, transaction flows, disclosures, attribution, and pre-launch review.

| Product | Build skill | Review skill |
| --- | --- | --- |
| Earn (Vaults) | `earn-integration` | `earn-integration-review` |
| Borrow — variable (Blue) & fixed (Midnight) | `borrow-integration` | `borrow-integration-review` |

Each build skill combines shared integration best practices with product-specific guidance. Review skills orchestrate seven specialized compliance checks and report against the rubric checklist in tabular form, plus the red-flag pass and launch self-review. Canonical references and Claude Code agent definitions are synchronized into each skill so standalone Agent Skills installs remain self-contained.

## Quickstart

### Claude Code

```bash
# Add the Morpho marketplace
/plugin marketplace add morpho-org/morpho-skills

# Install the builder plugin
/plugin install morpho-builder@morpho-skills
```

The Claude Code plugin includes named compliance agents used by the build and review skills.

### Agent Skills

```bash
npx skills add morpho-org/morpho-skills
```

`npx skills` detects supported agents and installs the four standalone skills. Each installed skill includes its own references and checker prompts, so review workflows can delegate to general-purpose subagents when the host supports them or run the same checks sequentially when it does not.

## Development

After changing the builder plugin's canonical `docs/` or Claude Code `agents/`, run `sh scripts/sync-builder-skill-resources.sh`. The synchronized copies keep each standalone skill self-contained for `npx skills` installs.
