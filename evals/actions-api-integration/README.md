# Actions API integration benchmark: builder skill vs vanilla

Measures whether the `morpho-builder` skills make an agent build a correct
Morpho integration on the Actions API (the "Borrow and Earn API") and the REST
API, compared with the same agent on its own. Agents build a Next.js app from
the same task; blind grader sessions score each app on the
[rubric](rubric.md), 40 criteria tied to the product brief for the integration
skills (posted on SDK-1862) and the
[Actions API reference](https://api.morpho.org/actions/docs).

The previous round (SDK-1861) graded with the skills' own checker files. This
rubric is written from the brief and the API reference instead, and it focuses
on what a generic agent gets wrong with the Actions API: the key in the browser,
skipped signature rounds and proof checks, calls sent without a successful
simulation, hand-built calldata, float amounts, instant rates and Blue-style
math on Midnight.

## Files

| File | What it is |
| --- | --- |
| [rubric.md](rubric.md) | 40 criteria in 10 groups, each scored 0–10 with evidence |
| [prompts/build-earn-builder.md](prompts/build-earn-builder.md) | build prompt: Earn, builder skill |
| [prompts/build-earn-vanilla.md](prompts/build-earn-vanilla.md) | build prompt: Earn, vanilla |
| [prompts/build-borrow-builder.md](prompts/build-borrow-builder.md) | build prompt: Borrow, builder skill |
| [prompts/build-borrow-vanilla.md](prompts/build-borrow-vanilla.md) | build prompt: Borrow, vanilla |
| [prompts/grade.md](prompts/grade.md) | grader prompt: takes an app repo and branch, returns 0–10 per criterion with evidence as JSON and a Markdown table |

Each prompt file lists the placeholders to fill in, then the text to paste
below a line. The build task text is identical in the two conditions; only the
first paragraph (read the skill, or don't use any Morpho skill) differs.

## Conditions

| | Builder skill | Vanilla |
| --- | --- | --- |
| Earn | `earn-integration` skill from the SDK-1862 branch | no Morpho skill or plugin |
| Borrow | `borrow-integration` skill from the SDK-1862 branch | no Morpho skill or plugin |

- Same model, same task text, same API key, same web access in both
  conditions. Neither condition gets the `morpho-mcp` plugin or the product
  brief.
- The builder condition reads the rewritten skill from a clone of
  `morpho-skills` at `feature/sdk-1862-rewrite-the-morpho-builder-skills-around`,
  kept outside the app. Record the commit SHA at the start of the round and
  use it for every builder build.
- Run at least one build per cell; three per cell when budget allows, so the
  median and range can be reported.
- The build session must not ask questions. If it does, answer "Decide
  yourself" and record the question; a build that stops waiting for an answer
  counts as unfinished and scores 0 on every criterion it did not reach.
- Record wall-clock time to completion and session cost (ACUs) for each build.

## Selectors

From the brief's "Acceptance test for the 2-minute build":

| Build | Product | Selector |
| --- | --- | --- |
| Earn | Vault V2, Steakhouse USDG on Robinhood Chain | `4663:0xBeEff033F34C046626B8D0A041844C5d1A5409dd` |
| Borrow | Blue, USDC / cbBTC on Base | `8453:0x9103c3b4e834476c9a62ea009ba2c884ee42e94e6e314a26f04d312434191836` |
| Borrow | Midnight, one listed USDC market on Base | picked once per round from `GET /v0/midnight/markets?listed=true&chain_ids=8453` |

## Forced failures

Each app is run through the three failures the brief requires. The grader
drives the app's UI with a connected browser wallet and records a HAR
file. Nothing here needs funds to move: each failure stops before a transaction
is sent.

| Failure | How to cause it | Expected behavior | Criteria |
| --- | --- | --- | --- |
| Insufficient balance | Deposit (Earn) or supply collateral (Borrow) more than the wallet holds. If the app blocks the amount before posting, also post it once through the app's own backend route to see the API's answer reach the UI. | Confirm disabled with "Not enough {token} in your wallet."; if posted, `simulation_failed` / `INSUFFICIENT_BALANCE` shown in plain language and no wallet prompt | C13, C19, C22 |
| Liquidity shortfall | Earn: withdraw more than `withdrawable_assets` from `/v1/vaults-v2/{v}/state` (use a wallet with a position, or set `account` to a known depositor through the app's backend route). Borrow: borrow more than `market_liquidity` + `reallocatable_liquidity` on Blue, or more than the Midnight bid quote fills. | The amount available now is offered; Earn shows force-withdraw with the penalty in token terms, or redeem-in-kind; Borrow stops the slider or input with "Only {x} available to borrow now" | C19, C22, C34, C38, C40 |
| Expired action | Start an action until the review step, then advance the browser clock past `expires_at` (for example Playwright `page.clock.fastForward`) and confirm. | No wallet prompt; "This request expired. Try again."; retrying restarts without the old continuation | C08, C09 |

When a failure cannot be reached through the UI (for example the app has no
withdraw screen), record it as `not reachable` and score its criteria from the
code, capped at 5.

## Running a round

1. Pick the Midnight market (see [Selectors](#selectors)) and record the
   SDK-1862 skill commit SHA and the `morpho-skills` commit SHA of this rubric.
2. Start the four builds, one per prompt in `prompts/build-*.md`, in fresh
   sessions with the same model.
3. Anonymize each app and start one grader per app (below).
4. Aggregate the four sheets (see [Aggregation](#aggregation)).

## Blind grading

1. Give each finished app a random ID (`earn-7f3a`). Copy its tree without
   `.git`, agent folders (`.agents/`, `.claude/`, `.cursor/`, `.devin/`),
   session notes and any file or comment that names the skill, the plugin or
   the condition. Keep the README's list of decisions. Push it as a single
   commit to a branch named with the ID, so the history doesn't show the
   build session.
2. Start one grader session per app with [prompts/grade.md](prompts/grade.md),
   pointing it at that branch. A grader never sees a build transcript or more
   than one app.
3. Keep the ID → condition map outside the graders' reach until all sheets are
   in.

## Aggregation

1. **Criterion score:** the grader's 0–10. With several builds per cell, take
   the median per criterion and report the range.
2. **Group score:** mean of the scored (non-N/A) criteria in the group, on 0–10.
3. **App score:** mean of the group scores, so a group with many criteria does
   not outweigh a small one.
4. **Gates:** C01, C04, C10, C12 and C13 are reported as pass (≥ 7) or fail
   next to the app score. A failed gate is called out in the summary whatever
   the average.
5. **Skill effect:** per criterion and per group, builder-skill score minus
   vanilla score. The summary lists:
   - **Vanilla misses, skill gets right:** criteria where vanilla ≤ 3 and the
     skill ≥ 7.
   - **Both miss:** both ≤ 3, which points at gaps in the skill.
   - **Skill regressions:** skill lower than vanilla by 3 or more.
6. Report time to completion and ACUs per build next to its scores.

Groups, for the summary table:

| # | Group | Criteria | Builds |
| --- | --- | --- | --- |
| 1 | Next.js boundary and sources | C01–C05 | both |
| 2 | Signature loop | C06–C09 | both |
| 3 | Response proof | C10–C12 | both |
| 4 | Simulation, review and execution | C13–C18 | both |
| 5 | Errors and resilience | C19–C22 | both |
| 6 | Units, selectors and display | C23–C28 | both |
| 7 | Health and risk display | C29–C30 | Borrow |
| 8 | Earn (Vault V2) | C31–C36 | Earn |
| 9 | Borrow on Blue | C37–C39 | Borrow |
| 10 | Borrow on Midnight | C40 | Borrow |

Results are posted on the Linear issue for the round, not committed here.
