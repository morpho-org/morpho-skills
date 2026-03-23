# Morpho Skills

> [!WARNING]
> **EXPERIMENTAL BETA SOFTWARE**
> 
> These skills are experimental features in active development. They may contain bugs, produce unexpected results, or change significantly between versions.
> 
> **IMPORTANT SECURITY NOTICE:**
> - **Always thoroughly review all generated transactions before signing or submitting**
> - **Never blindly execute code or transactions suggested by AI agents**
> - **Verify all addresses, amounts, and parameters independently**
> - **Use at your own risk** - the authors assume no responsibility for any losses
> - Test operations on testnets first when possible
> - Consider using a separate wallet with limited funds for initial testing
>
> This software is provided "as is" without warranty of any kind. Users are responsible for validating all operations.

## Overview

**morpho-cli** — A conversational skill that lets Claude query the Morpho lending protocol and prepare unsigned transactions directly from the CLI. Ask about vault APYs, market rates, user positions, or build deposit/withdraw/borrow operations on Ethereum and Base.

**morpho-builder** — A reference skill for code-generation agents building Morpho integrations. Provides SDK guidance, GraphQL API schemas, contract ABIs, and best practices for scaffolding deposit apps, dashboards, and bots.

## Quickstart

Install the skill you need:

```bash
# For querying Morpho and preparing transactions in conversation
npx skills add morpho-org/morpho-skills --skill morpho-cli

# For building apps that integrate with Morpho
npx skills add morpho-org/morpho-skills --skill morpho-builder
```
