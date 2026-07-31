---
name: borrow-integration
description: Build borrow-against-collateral features on Morpho — variable rate (Blue) and fixed rate (Midnight) — the way Morpho's integrator playbook recommends — borrow flows, live health/LTV/liquidation display, rate labelling, origination-fee separation, orderbook quotes with live requoting, maturity obligations, and the disclosure gate. Use whenever a user is building, designing, or writing copy for any borrowing, loan, credit, leverage, or term-loan product on Morpho — even if they never say "playbook", "compliance", "Blue", or "Midnight" explicitly.
---

# Borrow Integration (Blue & Midnight)

Guidance for building end-user **borrow** products on Morpho, distilled from Morpho's Integrator UX Playbook. Two rate types exist, and much of the UX work is keeping them distinct:

- **Variable rate (Blue):** the rate floats with market utilization. The risk story is liquidation: health, LTV, and liquidation price.
- **Fixed rate (Midnight):** the rate is **orderbook-priced** — the best ask annualized, not a utilization-driven APY. The quote moves with the borrow amount (larger sizes walk the book) and as the book moves; it is non-final until the transaction lands. The loan has a **maturity**: repay by then or the position is liquidated, and early exit still pays full accrued interest unless a secondary market is offered.

The recommendations are not gates — they're what has worked across live integrations. Items marked critical matter most for user trust and compliance and are the ones Morpho would push on in a design review. Every recommendation serves one of three goals: **compliant** (honest expectations, correct attribution), **converts** (visitor → borrower, TVL grows), **smooth & discoverable** (users understand every step).

## How to work

1. **Start from the foundations.** Read [docs/foundations.md](../../docs/foundations.md) — seven shared foundations (vocabulary, attribution, disclosures, and rate transparency — all critical — plus conversion mechanics, clarity & safety, discoverability). They are the base layer of every screen you build. For any term of art — LLTV, health factor, oracle, liquidation, Fixed Rate Markets, the Morpho entities — use the definitions in [docs/glossary.md](../../docs/glossary.md); they are worded to keep the legal and technical reality intact.
2. **Build the flow.** Cover the standard surfaces: entry/home → market detail → borrow config (collateral + amount; for fixed, amount → quote + required collateral) → review (for fixed, a fresh quote) → confirm → dashboard/manage (for fixed, with maturity state). Apply the foundations and the rate-type guidance below to each surface as you go.
3. **Verify as you build.** The plugin ships seven compliance agents, one per foundation. Spawn the relevant one when you finish a surface (e.g. `morpho-integration:clarity-safety-compliance` after the borrow-config screen, `morpho-integration:rate-transparency-compliance` after the rate display), telling it which rate type the surface serves — variable-rate borrow (Blue), fixed-rate borrow (Midnight), or both. Each reports verdicts back to you.
4. **Review before shipping.** Run the `borrow-integration-review` skill for the full orchestrated pass — every check, the red flags, and the launch self-review.

## Non-negotiables to build in from the start

These are the critical items — retrofitting them is much more expensive than building them in:

- **Vocabulary:** "borrow against collateral"; the rate type named explicitly — **variable** or **fixed** — next to every rate, carried through every surface; **liquidation** said plainly, never hidden; never *guaranteed* or *risk-free*. If the app offers both rate types, they must be visually distinct — ambiguity between them is a trust failure on its own.
- **Attribution:** the official **Powered by Morpho** badge (web component `powered-by-morpho` or static asset from brand.morpho.org) on market detail, review, confirm, and dashboard surfaces.
- **Disclosure gate:** before a user's first Morpho interaction, an acknowledgment of the integrator's Terms + Morpho's Disclaimer + the risks. No path around it.
- **Rate honesty:** the protocol rate and *your* origination fee shown separately — folding your fee into the protocol rate misattributes cost to Morpho. For fixed rate: the quote shown as orderbook-priced, requoted on input change, re-simulated before signing — never presented as a static number.
- **Live risk display:** health, LTV, and liquidation price computed and shown as the user types, warned on before confirmation — never discovered after.
- **Maturity legibility (fixed):** maturity date/countdown, matured state, and the repay-or-liquidation consequence stated where the user will see them.

## Variable rate (Blue) guidance

- **One live view.** Borrow amount, cost (**variable APR**, labelled), and health/LTV/liquidation price all recomputing as the user types — one screen, not a submit-then-discover flow.
- **Market transparency.** Surface the loan/collateral pair, oracle, and liquidation LTV (LLTV); keep deeper params behind an advanced reveal; display market liquidity.
- **Safety default.** Guide new borrowers to a **default max-LTV comfortably below the market's LLTV**, with a tooltip explaining why — a borrower opened at the edge is one price tick from liquidation, and a liquidated first-time user never comes back.
- **Manage flows.** Make repay and add-collateral obvious on the dashboard, and make full repay clear the debt completely — repaying by asset amount instead of shares typically leaves dust debt.
- **Bundling.** Supply-collateral + borrow in a single signature, approvals collapsed via permit/bundler.

## Fixed rate (Midnight) guidance

- **Maturity display.** A countdown reads better than a date ("Matures in N days"), and the dashboard needs a distinct **matured** state — a countdown that goes negative is a bug users screenshot.
- **Required collateral.** Infer it from the borrow amount and show it live as the user types — don't make the user compute it.
- **Early-exit caveat.** The rate is fixed until maturity; early exit still pays full accrued interest unless a secondary market is offered — note it on review.
- **Borrow flow.** One-signature borrow with balance + MAX + USD value on input, and total cost at maturity previewed live.

## Data

Every displayed market fact (borrow APR, LLTV, oracle, liquidity, health) must be sourced live — Morpho GraphQL API, morpho-cli, or morpho-mcp — never hardcoded or invented. Fixed-rate quotes, maturities, and required collateral must come from the live orderbook: a stale quote presented as current is the fixed-rate equivalent of a fake APY. If you can't source a number, leave it out.
