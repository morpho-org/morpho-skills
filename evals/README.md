# Skill Evaluations

Promptfoo-based eval suites for the skills in this repo, modeled on [Uniswap's uniswap-ai eval framework](https://github.com/Uniswap/uniswap-ai/tree/main/evals). Evals are to skills what tests are to code: each suite injects the skill content plus a realistic integrator brief into a single model call and grades the output with deterministic checks and LLM rubrics.

## Structure

```text
evals/
└── suites/
    └── <skill-name>/
        ├── promptfoo.yaml      # suite config: provider, cases, assertions
        ├── prompt-wrapper.txt  # template injecting SKILL.md + references + case
        ├── cases/*.md          # realistic task briefs
        └── rubrics/*.txt       # LLM-judge rubrics (checklist + scoring guide)
```

## Running

```bash
export ANTHROPIC_API_KEY=sk-ant-...   # or CLAUDE_CODE_OAUTH_TOKEN

cd evals/suites/vault-integration
npx promptfoo@latest eval
npx promptfoo@latest view   # browse results
```

## Conventions

- **Deterministic checks first** (`contains` / `regex`) for load-bearing strings — API endpoints, badge element names, `redeem`. Cheap and unambiguous.
- **LLM rubrics** for anything a blunt string match would get wrong — vocabulary anti-patterns (the model may legitimately *mention* "staking" while correcting it), APY-split quality, transparency. Rubrics are checklists with explicit scoring math so the judge stays consistent.
- **Thresholds**: blueprint compliance ≥ 0.85, technical correctness ≥ 0.8. Raise, don't lower, as the skill matures.
- **`***` separators** in `prompt-wrapper.txt` — promptfoo treats a bare `---` line as a multi-prompt separator and silently splits the template.
- Build new cases from real failures observed in usage, not hypotheticals.
