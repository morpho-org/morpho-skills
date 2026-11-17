# Integration build: vanilla vs MCP doc search vs integration skill

Asks Claude Code to build a demo app end to end from each of three briefs, under three setups, and grades the source of each app. It measures what the `morpho-integration` skill and the Morpho MCP documentation search add to an unassisted build.

No run has been recorded yet. The numbers of cells, calls and requirements below describe the configuration, not results.

## Design

| Part | What it is |
| --- | --- |
| Provider | `providers/claude-code.js` runs the `claude` CLI headless in an empty workspace. The provider is the Claude Code harness itself, not a model API. |
| Scenarios | `scenarios/{borrow,earn,portfolio}.md`: the three flows of the integration brief, as user stories and the components each screen shows. |
| Arms | `vanilla`, `mcp-doc-search`, `integration-skill`. |
| Rubric suite | `promptfooconfig.yaml`: 10 requirements in each of `rubrics/{compliance,trust-and-risk,growth,api-usage}.md`. |
| QA suite | `promptfooconfig.qa.yaml`: the brief's acceptance lines, in `qa/{borrow,earn,portfolio}.md` (32, 25 and 14 requirements). |

3 scenarios × 3 arms is 9 builds. The rubric suite makes 4 grader calls per build and the QA suite 1.

### Arms

Every arm gets the same prompt, the same model and the same built-in tools. Each adds one thing:

| Arm | Addition |
| --- | --- |
| `vanilla` | Nothing. No skill and no Morpho MCP server. |
| `mcp-doc-search` | The Morpho MCP server, with only `morpho_doc_search` permitted. |
| `integration-skill` | The `morpho-builder` plugin from this checkout, which carries the `morpho-integration` skill. |

Each run passes `--setting-sources ""` and `--strict-mcp-config`, so your own settings, plugins, skills and MCP servers are not loaded. Runs use `--permission-mode dontAsk` with an explicit tool list, which denies every tool that is not listed; that is how the MCP arm is held to documentation search.

### Prompts

`prompt.txt` wraps each brief with the same build requirements. The briefs carry the user stories, the screen components and the target market or vault. They leave out the brief's routes, formulas and acceptance lines: those are what the skill and the documentation are meant to supply, and the acceptance lines are the QA suite's hidden criteria.

### Grading

`graders/grade.js` sends the brief, one requirements file and a digest of the app's source to a grader, which returns `pass`, `fail` or `na` with evidence for each requirement. A category's score is passes over applicable requirements, and the assertion passes at 0.7 or above. Each requirement is also reported as its own named score, for example `Compliance/C7` or `QA/A4b-1`.

- The grader is also the `claude` CLI, with no tools and its own system prompt. It defaults to Opus 5.5 so the builder does not grade itself.
- The digest contains the app's files only. Nothing in it names the arm.
- `BuildPasses` records whether `npm install && npm run build` succeeded, and `RunCompleted` whether Claude Code finished without a timeout or budget stop.
- `SkillInvoked` and `DocSearchCalled` are zero-weight checks that an arm used what it was given.

Grading is static. A pass means the source shows the behaviour, not that it was observed in a browser or against a funded wallet. The QA suite does not replace browser QA.

## Run

Requires the `claude` CLI, signed in, and Node.js 20 or later. From this directory:

```sh
npx --yes promptfoo@0.125.1 eval -c promptfooconfig.yaml --no-cache -o results.json
EVAL_REUSE_WORKSPACES=1 npx --yes promptfoo@0.125.1 eval -c promptfooconfig.qa.yaml --no-cache -o results-qa.json
```

The second command grades the apps the first one built instead of building them again. Run one cell with `--filter-providers integration-skill --filter-pattern earn`.

Builds run with shell access and without permission prompts. Run them in a container or a disposable machine.

| Variable | Default | Purpose |
| --- | --- | --- |
| `EVAL_WORKSPACE_ROOT` | `<tmpdir>/morpho-integration-build` | Where workspaces, run records and transcripts are written. Keep it outside this repository, or every arm can read the skill. |
| `EVAL_REUSE_WORKSPACES` | unset | `1` grades existing workspaces instead of building. |
| `EVAL_BUILD_MODEL` | `claude-fable-5-2` | Model that builds the apps. |
| `EVAL_GRADER_MODEL` | `claude-opus-5-5` | Model that grades them. |
| `EVAL_MAX_BUDGET_USD` | unset | Spending cap for each build. |
| `EVAL_BUILD_TIMEOUT_MS_AGENT` | 7200000 | Time limit for each build. |
| `EVAL_SKIP_BUILD_CHECK` | unset | `1` skips `npm install && npm run build`. |
| `EVAL_PLUGIN_DIR` | `plugins/morpho-builder` in this checkout | Plugin loaded by the skill arm. |
| `EVAL_MORPHO_MCP_URL` | `https://mcp.morpho.org/` | MCP server for the MCP arm. |

Results stay local and are gitignored.

## Limits

- One build per cell. Agent builds vary between runs, so a single run does not rank the arms.
- The skill arm reads the skill in this checkout. Record the commit with any result.
- The digest is capped (320,000 characters by default, `EVAL_DIGEST_CHARS`). Files left out are listed at its end, and a requirement met only in an omitted file is graded as failed.
- The QA requirements follow the brief. Where the skill deliberately differs from the brief, the skill arm can fail a requirement for following the skill.
