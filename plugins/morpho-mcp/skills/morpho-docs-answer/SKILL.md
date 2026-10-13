---
name: morpho-docs-answer
description: Answer concept and integration questions about Morpho from the current documentation — Vaults V2 roles (owner, curator, allocator, sentinel), adapters, caps, Markets and LLTV, liquidation, oracles, Midnight fixed-rate offers and maturities, rewards, SDKs and contract addresses — with links to the pages used.
---

# Answer from Morpho docs

## Steps

1. Call `morpho_doc_search` with a short query. If `data` is empty or off target, go to step 2. (In October 2026 it returned empty results for every query; treat empty as "not available", not as "the docs say nothing".)
2. Fetch `https://docs.morpho.org/llms.txt`, find the page whose title or one-line description matches, and fetch that page as Markdown by appending `.md` to its URL.
3. Use `https://docs.morpho.org/llms-full.txt` only when the question spans many sections; it is large.
4. For contract addresses, use `https://docs.morpho.org/developers/contracts/addresses.md`. Never quote an address from memory.
5. If the question also needs a live number, use `morpho-live-data` for that part.

## Reporting rules

- Every claim maps to a page read in this conversation. If the docs do not answer it, say so and link the closest page.
- Rewrite in plain words; no long quotes.
- End with `Sources:` and the docs URLs.
- Use Morpho's wording even where an older page differs: user (not depositor or investor), curator configures vault parameters (not manages), receipt tokens, variable yield (never guaranteed), permissionless liquidation by third parties (never "Morpho liquidates"), Midnight offers and settlement (never "order book" or "bonds").
