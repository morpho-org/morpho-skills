# Grader task

Give each grader session this task, the anonymized app directory, the
[rubric](rubric.md) and nothing else: no build transcript, no skill files, no
hint of which condition produced the app.

> You are grading a Next.js app that integrates Morpho. It is in `<APP_DIR>`.
> The app's build is `<earn|borrow>`. Grade it with `rubric.md`.
>
> 1. Read the whole app before scoring. Install and build it with the
>    `<API_KEY_SECRET>` key, then search the built client bundle
>    (`.next/static`) for the key value and its variable name (C01).
> 2. Run the app on `localhost:3000` with a browser wallet on the test account
>    and record the network traffic as a HAR file.
> 3. Run the three forced failures in `README.md` ("Forced failures") and keep
>    a screenshot and the HAR entries for each.
> 4. Score every criterion with its 0 / 5 / 10 anchors and evidence. Mark N/A
>    only as the rubric's N/A rules allow. Do not guess what the author
>    intended; score what the code and the running app do.
> 5. Return the scoring sheet JSON from the end of the rubric, plus a list of
>    the five lowest-scoring criteria with one sentence each on what is wrong.
>
> Do not sign or send any transaction that moves funds beyond the forced
> failures. Do not fix the app.
