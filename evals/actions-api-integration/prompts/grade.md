# Grader prompt

Paste everything below the line into a fresh grader session, one per app.
Give it nothing else: no build transcript, no skill files, no hint of which
condition built the app. Fill in:

- `<APP_REPO>` and `<APP_BRANCH>`: the anonymized copy of one build (see
  [Blind grading](../README.md#blind-grading)). The branch name must not reveal
  the condition.
- `<earn|borrow>`: the build.
- `<RUBRIC_REF>`: the `morpho-skills` commit SHA that holds this rubric, the
  same for every grader in the round.
- Provide the Actions API key to the session as `MORPHO_API_KEY`, and a
  browser wallet it can connect (`<TEST_WALLET>`). The wallet needs no funds;
  nothing in this task sends a transaction.

---

You are grading a Next.js app that integrates Morpho. Score it against a fixed
rubric, with evidence for every score.

Setup:

1. Clone `https://github.com/morpho-org/morpho-skills` at `<RUBRIC_REF>` into
   `~/morpho-skills`. The rubric is
   `~/morpho-skills/evals/actions-api-integration/rubric.md`; the forced
   failures are in the "Forced failures" section of
   `~/morpho-skills/evals/actions-api-integration/README.md`. Read nothing else
   in that repository.
2. Clone `<APP_REPO>` at branch `<APP_BRANCH>` into `~/app`. The build is
   `<earn|borrow>`; apply the rubric's N/A rules for it.

Grade:

1. Read the whole app before scoring.
2. Install it, build it with `MORPHO_API_KEY` set, and search the built client
   bundle (`.next/static`) for the key value and for `MORPHO_API_KEY` (C01).
3. Run the app on `localhost:3000`, connect `<TEST_WALLET>`, and record the
   network traffic as a HAR file. Go through every story the app offers up to
   the wallet prompt, then reject it.
4. Run the three forced failures and keep a screenshot and the HAR entries for
   each. When a failure can't be reached through the UI, record it as
   `not reachable`.
5. Score every criterion C01–C40 with its 0 / 5 / 10 anchors and evidence
   (`path:line` in `~/app`, or a HAR entry, server log line or screenshot).
   Mark N/A only as the N/A rules allow. Score what the code and the running
   app do, not what comments or the README say.

Do not approve any wallet prompt, sign anything or send any transaction. Do
not fix, refactor or rerun the app's build agent; grade the app as it is.

Reply with:

1. The scoring sheet as JSON, in the format at the end of the rubric, with
   `app_id` set to `<APP_BRANCH>`.
2. The same scores as a Markdown table:

   | ID | Criterion | Score | Evidence | Note |
   | --- | --- | --- | --- | --- |

3. The five lowest-scoring criteria, one sentence each on what is wrong.
4. The gate results (C01, C04, C10, C12, C13): pass (≥ 7) or fail.

Attach the HAR file and the forced-failure screenshots.
