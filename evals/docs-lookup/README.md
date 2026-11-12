# Documentation lookup: MCP vs vanilla

Compares four models answering the same 20 Morpho documentation questions, with
and without `morpho_doc_search`. Covers Blue, Vault V1/V2, Midnight, bundles, SDK
rate conventions and REST API accounting. Each reference has a documentation URL;
references were checked against `morpho-apps/apps/documentation-v3-app/content/docs`
at `ab3d74d7d8c339e4ec3383cdcbfda541fd991af5`.

## Run

With `ANTHROPIC_API_KEY` set, from this directory:

```sh
npx --yes promptfoo@0.125.1 eval -c promptfooconfig.yaml --no-cache -o results.json
```

View locally with `npx --yes promptfoo@0.125.1 view`. Results stay local and are
gitignored. All targets and the fixed Opus 5.5 rubric grader use the direct Anthropic API;
concurrency is 2. The prompt contains only the question and a shared instruction,
never the reference. MCP runs execute tools and continue to a final answer.
`DocToolCalled` is a zero-weight metric, not a correctness requirement.

## Measured results

2026-11-11, promptfoo **0.125.1**, one uncached 160-cell run, 15m 17s.
This recorded run used Vercel AI Gateway (the same Anthropic models) before the switch to the direct API.
Pass means the fixed grader accepted all key facts against the reference, not
just plausible wording. Tokens below are target-model totals across tool-loop
turns, excluding the grader; latency is mean target latency, excluding grading.

| Provider | Pass rate | Avg latency | Total tokens | Doc tool called |
| --- | ---: | ---: | ---: | ---: |
| fable-vanilla | 16/20 (80%) | 10.42 s | 18,884 | 0/20 |
| fable-mcp | 20/20 (100%) | 12.25 s | 1,703,765 | 20/20 |
| opus-vanilla | 14/20 (70%) | 8.38 s | 16,844 | 0/20 |
| opus-mcp | 19/20 (95%) | 10.11 s | 1,263,557 | 20/20 |
| sonnet-vanilla | 13/20 (65%) | 6.42 s | 16,106 | 0/20 |
| sonnet-mcp | 19/20 (95%) | 6.36 s | 1,307,925 | 20/20 |
| haiku-vanilla | 9/20 (45%) | 4.34 s | 17,632 | 0/20 |
| haiku-mcp | 17/20 (85%) | 6.73 s | 1,209,971 | 20/20 |

No execution errors or questions failed by all eight providers. Grading used
another 174,466 tokens. No reliable dollar total was reported for the recorded
run; its zero cost values do **not** mean it was free. Promptfoo 0.125.1 may still
warn "unknown Anthropic model" for IDs absent from its model registry, even when
using the direct API.

All 33 failed cells were selected for a separate uncached diagnostic rerun;
5 passed, 28 failed and there were no execution errors. Retries are not
substituted into the table. One grader false negative compared
the capped Blue liquidation formula with Midnight's uncapped expression; the
reference now makes that distinction explicit, and an eight-provider targeted
rerun passed 8/8. No other reference answers were changed to accommodate failures.

MCP improved pass rates for every model in this sample, especially on Midnight
mechanics and API history windows. Retrieval increased token use substantially,
and tool use did not guarantee the answer contained every requested fact.
These are single-run, model-graded results on a small dataset, not a general
model ranking; the false negative also illustrates grader sensitivity.
