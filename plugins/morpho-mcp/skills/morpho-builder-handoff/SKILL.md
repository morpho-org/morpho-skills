---
name: morpho-builder-handoff
description: Route someone building a product on Morpho (an Earn deposit flow on Vault V2, a borrow flow on Markets or Midnight, or a pre-launch review) to Morpho's builder skills, the SDK and the MCP, with install commands and a first prompt.
---

# Hand off builders to Morpho Skills

1. Ask which product: Earn (Vault V2), Borrow on Markets, Borrow on Midnight, or mixed; and which coding agent.
2. Point them to the `morpho-builder` plugin in `morpho-org/morpho-skills`, with two skills: `earn-integration` and `borrow-integration`. Each one builds, updates and reviews.
3. Install:
   - Any Agent Skills host: `npx skills add morpho-org/morpho-skills` (Yarn: `yarn dlx skills add morpho-org/morpho-skills`).
   - Claude Code: `/plugin marketplace add morpho-org/morpho-skills`, then `/plugin install morpho-builder@morpho-skills`.
4. Suggest connecting the Morpho MCP (`https://mcp.morpho.org/`) in that agent too, for live data and unsigned transactions while they build.
5. Code snippets written here use `@morpho-org/morpho-sdk` with viem. Fetch the SDK docs page first; never invent SDK functions.
6. Check every command against `https://docs.morpho.org/developers/agents/skills.md` before giving it.

Return: which skill and why (one sentence), the install command, and a first prompt such as "Use earn-integration to build a Vault V2 deposit and withdraw flow for vault <address> on Base."
