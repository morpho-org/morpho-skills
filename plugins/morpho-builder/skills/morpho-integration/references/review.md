# Reviewing an integration

Review is read-only: do not change code, configuration, copy or external state. Read the [shared manual](../SKILL.md), [UI principles](ui-principles.md), [integrator handbook](handbook.md), [REST API best practice](rest-api-best-practice.md) and only the applicable product manuals: [Vaults](vault-v2.md), [Blue](blue.md), [Midnight](midnight.md).

## Establish scope and contracts

Identify deployed product/version, chains, market/vault identities, supported actions and dependencies. Fetch the canonical OpenAPI documents linked in the manual. Protocol reads and transactions that bypass the REST APIs are findings unless the integration states the gap they cover. Trace implemented routes, params and response parsing to the relevant operation/schema rather than checking against a second route catalogue.

Judge the functionality actually offered and the agreed integration scope. Do not infer a missing application feature from a review prompt. Product/version correctness remains separate even when helpers are shared.

## Specialist perspectives

Use these read-only prompts in parallel when delegation is available; otherwise apply them sequentially. Give each reviewer the scope and contracts, not assumed results.

| Perspective | Reference |
| --- | --- |
| Product naming, roles and claims in copy | [Truthful language](checkers/truthful-language.md) |
| Badge, interface-versus-protocol framing and origin tag | [Attribution and protocol boundary](checkers/attribution-protocol-boundary.md) |
| Disclaimer acknowledgment before first interaction | [Legal acknowledgment](checkers/legal-acknowledgment.md) |
| Vault or market identity, curator, collateral, oracle and warnings | [Exposure transparency](checkers/exposure-transparency.md) |
| Rate sources, components, fees and accounting conventions | [Rate and cost honesty](checkers/rate-cost-honesty.md) |
| Health, liquidation, maturity and unknown states | [Position risk and safety](checkers/position-risk-safety.md) |
| Intent-to-confirmation continuity and consent | [Transaction friction](checkers/transaction-friction.md) |
| Entry points, prompts and position visibility | [Discovery and activation](checkers/discovery-activation.md) |
| Explanations and paths to learn more | [User education](checkers/user-education.md) |
| API choice, read conventions and proof verification | [REST API usage](checkers/rest-api-usage.md) |
| Units, calculations and transaction integrity | [Math correctness](checkers/math-correctness.md) |

The first nine follow the [handbook](handbook.md) categories; the last two cover [REST API best practice](rest-api-best-practice.md) and the shared manual's units and transaction rules. Handbook priorities order the findings: trust-critical gaps first, then recommended, then nice to have.

## Evidence and conclusions

Trace requests and expressions through response parsing, rendered state, preparation, wallet boundary and reconciliation. Inspect the intended consumer: mobile clipping, deep links and loading/error states can hide critical information even when it exists in code.

Use normal, empty and error inputs with real response shapes; safe fixtures cover dangerous/unavailable states without signing. Distinguish inspected source, observed rendering, synthetic arithmetic and actual execution. Builds do not prove rendering, proof verification or transaction success.

Report each actual defect with product/version, file/expression or runtime evidence, consequence and smallest fix. Mark missing evidence `UNVERIFIED` with the discriminating check; distinguish that from a demonstrated defect and explain inapplicable concerns. Do not pass a safety invariant without relevant evidence.

Proof/domain failure, unsuccessful simulation, changed calls, secret exposure, duplicate sends, wrong units/recipient, fabricated values and silently weakened protection are release blockers. Keep unresolved deployment, health-buffer, design, interest/event accounting and vendor guarantees explicitly open instead of inventing a value.

A combined conclusion cannot hide a product-specific blocker. Keep critical defects, lesser usability issues and unverified paths separate; state the exact limits of the review rather than assigning completeness from feature counts.
