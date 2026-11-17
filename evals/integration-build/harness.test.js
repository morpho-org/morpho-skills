const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { test } = require('node:test');

process.env.EVAL_CLAUDE_BIN = process.execPath;
const { runClaude, resultEvent } = require('./lib/claude-cli');
const { ROOT, locate, resetWorkspace, digestWorkspace } = require('./lib/workspace');
const grade = require('./graders/grade');
const Provider = require('./providers/claude-code');

test('CLI events, trailing JSON and stderr survive a normal exit', async () => {
  const run = await runClaude({ args: ['-e', `
    process.stdin.resume();
    console.log('warning');
    console.log(JSON.stringify({ type: 'assistant' }));
    process.stdout.write(JSON.stringify({ type: 'result', result: 'done' }));
    console.error('diagnostic');
  `], input: 'prompt', timeoutMs: 2000 });
  assert.equal(run.exitCode, 0);
  assert.equal(run.timedOut, false);
  assert.equal(run.events.length, 2);
  assert.equal(resultEvent(run.events).result, 'done');
  assert.match(run.stderr, /diagnostic/);
});

test('an early CLI exit with a large prompt records failure instead of crashing', async () => {
  const run = await runClaude({
    args: ['-e', "console.error('CLI failed'); process.exit(42)"],
    input: 'x'.repeat(320_000), timeoutMs: 2000,
  });
  assert.equal(run.exitCode, 42);
  assert.equal(run.timedOut, false);
  assert.match(run.stderr, /CLI failed/);
});

test('a missing CLI is a recorded spawn failure', async () => {
  const run = await runClaude({ args: [], cwd: '/nonexistent-eval-cwd', input: 'x'.repeat(320_000) });
  assert.equal(run.exitCode, null);
  assert.match(run.stderr, /ENOENT/);
});

test('timeout kills descendants holding inherited streams after the parent exits', {
  skip: process.platform === 'win32', timeout: 15_000,
}, async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'eval-process-test-'));
  const marker = path.join(dir, 'survived');
  const started = Date.now();
  try {
    const run = await runClaude({ args: ['-e', `
      const { spawn } = require('node:child_process');
      spawn(process.execPath, ['-e', ${JSON.stringify(`
        process.on('SIGTERM', () => {});
        setTimeout(() => require('node:fs').writeFileSync(${JSON.stringify(marker)}, 'alive'), 12000);
      `)}], { stdio: ['ignore', 1, 2] });
      console.log(JSON.stringify({ type: 'descendant' }));
      process.exit(0);
    `], timeoutMs: 500 });
    assert.equal(run.timedOut, true);
    assert.ok(Date.now() - started < 14_000, 'timeout must not wait for the descendant');
    await new Promise((resolve) => setTimeout(resolve, Math.max(0, 12_500 - (Date.now() - started))));
    assert.equal(fs.existsSync(marker), false);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('workspace identifiers reject traversal rather than silently colliding', () => {
  for (const name of ['..', '../borrow', '/tmp/borrow', 'a/b', 'a\\b', '', 'borrow\n', {}]) {
    assert.throws(() => locate('vanilla', name), /Arm and scenario/);
    assert.throws(() => locate(name, 'borrow'), /Arm and scenario/);
  }
  assert.equal(locate('vanilla', 'borrow').workspace, path.join(ROOT, 'workspaces', 'vanilla', 'borrow'));
});

test('requirements reject traversal, absolute paths and symlinks outside the eval', async () => {
  const link = path.join(__dirname, `.requirements-test-${process.pid}`);
  fs.symlinkSync(path.join(__dirname, '..', '..', 'README.md'), link);
  try {
    for (const config of [
      { file: '../../README.md' },
      { file: path.join(__dirname, '..', '..', 'README.md') },
      { file: path.basename(link) },
      { perScenario: true, dir: 'qa' },
    ]) {
      const result = await grade('', { config, vars: { scenario: '../../../README' } });
      assert.equal(result.pass, false);
      assert.match(result.reason, /inside the evaluation directory/);
    }
  } finally {
    fs.unlinkSync(link);
  }
});

test('provider rejects an escaped transcript before creating any workspace', async () => {
  const provider = new Provider({ config: { arm: 'vanilla' } });
  await assert.rejects(provider.build('', 'borrow', {
    workspace: '/not-a-workspace', transcript: path.join(ROOT, '..', 'outside.jsonl'),
  }), /Transcripts must be inside/);
  await assert.rejects(provider.callApi('', { vars: { scenario: '../../outside' } }), /Arm and scenario/);
});

test('source digest reads app files but skips external symlinks', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'eval-digest-test-'));
  try {
    fs.writeFileSync(path.join(dir, 'app.js'), 'app source');
    fs.symlinkSync(__filename, path.join(dir, 'outside.js'));
    const digest = digestWorkspace(dir);
    assert.equal(digest.fileCount, 1);
    assert.match(digest.text, /app source/);
    assert.doesNotMatch(digest.text, /outside.js/);
    assert.throws(() => resetWorkspace(dir), /outside the workspace root/);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});
