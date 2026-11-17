// promptfoo assertions that read the run record instead of asking a grader.
const record = (context) => context.providerResponse?.metadata || {};
const flag = (value, yes, no) => ({ pass: true, score: Number(Boolean(value)), reason: value ? yes : no });

// Whether `npm install && npm run build` succeeded. This one counts toward the result.
module.exports.buildPasses = (_output, context) => {
  const build = record(context).build;
  if (!build) return { pass: true, score: 0, reason: 'Build check skipped (EVAL_SKIP_BUILD_CHECK=1).' };
  return {
    pass: build.ok,
    score: Number(build.ok),
    reason: build.ok ? 'npm install and npm run build succeeded.' : `Failed at ${build.step}: ${build.tail}`,
  };
};

// Whether the agent finished on its own, without a timeout, budget stop or CLI error.
module.exports.runCompleted = (_output, context) => {
  const failure = record(context).failure;
  return { pass: !failure, score: Number(!failure), reason: failure || 'Claude Code finished normally.' };
};

// Zero-weight checks that each arm used what it was given. They never fail a test.
module.exports.skillInvoked = (_output, context) =>
  flag(
    (record(context).skillsInvoked || []).some((name) => name.includes('morpho-integration')),
    'The morpho-integration skill was invoked.',
    'The morpho-integration skill was not invoked.',
  );

module.exports.docSearchCalled = (_output, context) =>
  flag(record(context).docSearchCalls > 0, 'morpho_doc_search was called.', 'morpho_doc_search was not called.');
