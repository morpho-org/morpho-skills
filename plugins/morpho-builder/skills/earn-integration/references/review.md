# Full Vault V2 Earn integration review

Use this workflow for an audit, QA pass, pre-launch check, or full review of a Morpho Earn integration. It is **review-only**: inspect and report; do not edit code, copy, configuration, or external state unless the user separately requests fixes.

Read [vault-v2.md](vault-v2.md) before reviewing. Scope every finding to Vault V2. Vault V1 findings are `N-A` unless migration/compatibility is explicitly in scope.

## Verdict semantics

- `PASS`: direct evidence demonstrates the criterion across every applicable supplied surface and state.
- `FAIL`: direct evidence demonstrates a defect. Cite the exact file/line, screen/state, request/response, or reproduced behavior.
- `UNVERIFIED`: evidence is missing or runtime behavior cannot be established. Name the missing artifact or test.
- `N-A`: the criterion genuinely does not apply; explain why. Do not use `N-A` to hide missing evidence.

Any critical failure makes the product verdict `FAIL`. Otherwise any non-optional `UNVERIFIED` makes it `UNVERIFIED`. Only return `PASS` when every applicable critical and recommended criterion passes.

## 1. Establish evidence

Inventory the supplied artifacts before judging:

- routes/screens and user-visible copy for browse, detail, amount entry, review, confirmation, portfolio, normal exit, and illiquid exit;
- data clients, GraphQL documents, REST calls, cache/retry code, freshness indicators, and onchain fallbacks;
- wallet/SDK setup, vault entity creation, action builders, requirement dispatch, simulation, submission, and receipt reconciliation;
- share/asset/APY/fee/reward/position calculations and formatting;
- tests, fixtures, screenshots, recordings, and runtime/API evidence.

Do not infer a runtime `PASS` from component names or TODO comments. Record limitations before launching checkers.

## 2. Run the eight checkers

When delegation is available, run one read-only worker per checker **in parallel**. Give every worker the artifact paths, known runtime evidence, and product label `Earn — Vault V2`. Instruct it to read its prompt completely, stay within its owned criteria, make no edits, and return the exact evidence table requested.

1. [vocabulary-compliance.md](checkers/vocabulary-compliance.md)
2. [attribution-compliance.md](checkers/attribution-compliance.md)
3. [disclosure-compliance.md](checkers/disclosure-compliance.md)
4. [rate-transparency-compliance.md](checkers/rate-transparency-compliance.md)
5. [conversion-compliance.md](checkers/conversion-compliance.md)
6. [clarity-safety-compliance.md](checkers/clarity-safety-compliance.md)
7. [discoverability-compliance.md](checkers/discoverability-compliance.md)
8. [math-correctness.md](checkers/math-correctness.md)

If workers are unavailable, run the same prompts sequentially. Never skip a checker because another one found a critical issue.

Reject unsupported checker conclusions: a `PASS` without concrete evidence becomes `UNVERIFIED`; a `FAIL` without a location and observed defect becomes `UNVERIFIED` pending confirmation. Deduplicate overlapping findings, but preserve each checker's owned verdict.

## 3. Acceptance matrix

Evaluate this matrix yourself after collecting checker results. Checker output is evidence, not a substitute for product acceptance.

| ID | Priority | Vault V2 acceptance criterion | Primary evidence |
| --- | --- | --- | --- |
| EV2-01 | Critical | The flow resolves chain + Vault V2 address and does not substitute V1, direct Blue supply, or a generic ERC-4626 flow. | Entity construction, routing, selected vault UI |
| EV2-02 | Critical | Writes and fresh entity reads use `@morpho-org/morpho-sdk`, `client.morpho.vaultV2`, complete `getRequirements()`, `buildTx`, final simulation, and receipt reconciliation. | Imports, action path, runtime trace/tests |
| EV2-03 | Critical | Deposit uses fresh accrued vault data and SDK share-price/slippage protection; native input is accepted only for wrapped-native underlying. | Deposit builder, preview, tests |
| EV2-04 | Critical | Normal exits correctly distinguish exact-asset `withdraw` from exact-share `redeem`; MAX/full exit uses user shares, not Vault V2 max functions. | Exit code and tests |
| EV2-05 | Critical | The integration knows all four Vault V2 ERC-4626 max functions return zero and never interprets them as disabled/unavailable/zero balance. | Availability/MAX logic |
| EV2-06 | Critical | Illiquidity has an explicit recovery path; force and in-kind exits are never silent fallbacks and show materially different outcomes. | Illiquid state, builders, UX |
| EV2-07 | Critical | In-kind redemption uses the supported SDK path, requirements, sizing/rounding checks, final simulation, and discloses idle assets, fees/penalties, Blue positions received, and residual liquidity risk. | Preview, action, review screen/tests |
| EV2-08 | Critical | Raw assets/shares/rates/fees use bigint and correct decimals/rounding; no hand-built supported protocol transaction or float share math. | Numeric paths and transaction construction |
| EV2-09 | Critical | Variable APY is split into native vault yield, underlying-token yield, reward APRs by token, vault fees, and integrator fees without misleading blending. | Data mapping and every rate surface |
| EV2-10 | Critical | First-use acknowledgment is unavoidable and covers terms, Morpho disclaimer, variable yield, contract/curator/market/oracle/liquidity/reward risks. | Gate state/control-flow tests |
| EV2-11 | Critical | Official Morpho attribution is present on detail, review, confirmation, and position surfaces without implying Morpho is curator, guarantor, or counterparty. | Rendered surfaces/assets |
| EV2-12 | Recommended | Discovery/detail show vault identity, underlying, curator, allocations/exposure, fees, TVL, withdrawable/idle liquidity, warnings, and data freshness. | Queries and rendered detail |
| EV2-13 | Recommended | API use paginates, caches by purpose, honors `429`/`Retry-After`, monitors GraphQL deprecations, exposes freshness, and falls back onchain for critical paths. | Client implementation/tests |
| EV2-14 | Recommended | Positions show actual shares/assets and performance with correct window/accounting labels, refetch after receipts, and keep exits discoverable. | Portfolio, performance, refresh path |
| EV2-15 | Recommended | Historical APY/rewards are labeled by window/source and never presented as guaranteed future yield. | Analytics and copy |

For each row record `PASS`, `FAIL`, `UNVERIFIED`, or `N-A`, evidence, impact, and the smallest viable fix.

## 4. Red-flag pass

Search specifically for these release blockers even if no checker raised them:

- Vault V1 or a lower-level package is treated as the default Earn transaction path.
- Supported vault/bundler calldata is assembled manually.
- `buildTx` happens before requirements resolve, or send occurs without final simulation.
- API/indexed data is treated as execution-fresh without a block/freshness check.
- Any Vault V2 max function gates availability or supplies a MAX amount.
- APY, rewards, fees, allocations, liquidity, or withdrawal results are hardcoded/invented.
- A normal exit failure silently becomes a force or in-kind exit.
- In-kind redemption is described as receiving only underlying assets.
- “Guaranteed,” “risk-free,” “staking,” “investment,” “fund,” or unqualified “withdraw anytime” appears in user-visible Earn copy.
- The disclosure gate can be bypassed or acknowledgement state is preselected.
- Logs, screenshots, fixtures, or reports expose private keys, signatures, API keys, or full sensitive wallet data.

Every confirmed red flag is a critical `FAIL` with evidence. If the relevant artifact is absent, record `UNVERIFIED`.

## 5. Final report

Return a concise report in this order:

1. **Scope and evidence limitations** — Vault V2 surfaces reviewed, runtime checks performed, and missing artifacts.
2. **Product verdict** — `PASS`, `FAIL`, or `UNVERIFIED`, with critical/recommended counts.
3. **Critical findings** — ordered by user-loss/compliance risk, each with acceptance/checker ID, evidence, impact, and exact fix.
4. **Recommended findings** — same structure.
5. **Acceptance matrix** — all EV2 rows, including passes and unverified rows.
6. **Checker summary** — one line per checker with its overall verdict; do not hide disagreement.
7. **Red flags** — confirmed or unverified.
8. **Release recommendation** — ship, do not ship, or blocked on evidence, plus the minimum retest set.

Do not implement fixes in review mode. If fixes are later requested, preserve this report as the baseline and rerun affected rows plus every prior critical failure.
