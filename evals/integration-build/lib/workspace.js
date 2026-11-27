// Workspace locations, the source digest handed to graders, and the optional build check.
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

// Outside this repository on purpose: a workspace inside it would let every arm read the skill.
const ROOT = path.resolve(
  process.env.EVAL_WORKSPACE_ROOT || path.join(os.tmpdir(), 'morpho-integration-build'),
);

const SKIP_DIRS = new Set([
  'node_modules', '.git', 'dist', 'build', 'out', '.next', '.turbo', '.vercel', 'coverage', '.cache',
]);
const SKIP_FILES = /(^|\/)(package-lock\.json|pnpm-lock\.yaml|yarn\.lock|bun\.lockb?|\.DS_Store)$/;
const TEXT_FILE =
  /\.(ts|tsx|js|jsx|mjs|cjs|json|md|mdx|html|css|scss|svelte|vue|astro|yaml|yml|toml|sql|sh|txt|example)$|(^|\/)(\.env\.example|Dockerfile|Makefile)$/;
const MAX_FILE_CHARS = Number(process.env.EVAL_DIGEST_FILE_CHARS || 40_000);
const MAX_TOTAL_CHARS = Number(process.env.EVAL_DIGEST_CHARS || 320_000);

function locate(arm, scenario) {
  for (const value of [arm, scenario]) {
    if (typeof value !== 'string' || !/^[a-zA-Z0-9_-]+$/.test(value)) {
      throw new Error('Arm and scenario must contain only letters, numbers, underscores or hyphens.');
    }
  }
  const key = path.join(arm, scenario);
  return {
    workspace: path.join(ROOT, 'workspaces', key),
    record: path.join(ROOT, 'runs', `${key}.json`),
    transcript: path.join(ROOT, 'runs', `${key}.jsonl`),
  };
}

function resetWorkspace(workspace) {
  if (!workspace.startsWith(path.join(ROOT, 'workspaces') + path.sep)) {
    throw new Error(`Refusing to reset a directory outside the workspace root: ${workspace}`);
  }
  fs.rmSync(workspace, { recursive: true, force: true });
  fs.mkdirSync(workspace, { recursive: true });
}

function listFiles(dir, base = dir, found = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isSymbolicLink()) continue;
    if (entry.isDirectory()) {
      if (!SKIP_DIRS.has(entry.name)) listFiles(full, base, found);
    } else if (entry.isFile()) {
      found.push(path.relative(base, full));
    }
  }
  return found;
}

// Files a reviewer reads first come first, so they survive the size cap.
const rank = (file) =>
  /^readme/i.test(file) ? 0 : /^(package\.json|\.env\.example)$/.test(file) ? 1 : /\.(test|spec)\./.test(file) ? 3 : 2;

function digestWorkspace(workspace) {
  const files = listFiles(workspace).filter((file) => !SKIP_FILES.test(file)).sort();
  const readable = files
    .filter((file) => TEXT_FILE.test(file))
    .sort((a, b) => rank(a) - rank(b) || a.localeCompare(b));
  const parts = [`# File tree (${files.length} files)\n${files.join('\n')}`];
  const omitted = [];
  let total = parts[0].length;
  for (const file of readable) {
    const target = fs.realpathSync(path.join(workspace, file));
    const relative = path.relative(fs.realpathSync(workspace), target);
    if (relative === '..' || relative.startsWith(`..${path.sep}`) || path.isAbsolute(relative)) {
      throw new Error('Source files must be inside the workspace.');
    }
    let text = fs.readFileSync(target, 'utf8');
    if (text.length > MAX_FILE_CHARS) {
      text = `${text.slice(0, MAX_FILE_CHARS)}\n[... file truncated at ${MAX_FILE_CHARS} characters]`;
    }
    if (total + text.length > MAX_TOTAL_CHARS) {
      omitted.push(file);
      continue;
    }
    total += text.length;
    parts.push(`# File: ${file}\n${text}`);
  }
  if (omitted.length) {
    parts.push(`# Omitted for size (${omitted.length} files)\n${omitted.join('\n')}`);
  }
  return { text: parts.join('\n\n'), fileCount: files.length, omitted: omitted.length };
}

// Checks the brief's requirement that `npm install && npm run build` succeeds.
function checkBuild(workspace) {
  if (!fs.existsSync(path.join(workspace, 'package.json'))) {
    return { ok: false, step: 'package.json', tail: 'No package.json at the project root.' };
  }
  const timeout = Number(process.env.EVAL_BUILD_TIMEOUT_MS || 15 * 60_000);
  for (const [step, args] of [['install', ['install', '--no-audit', '--no-fund']], ['build', ['run', 'build']]]) {
    const run = spawnSync('npm', args, { cwd: workspace, encoding: 'utf8', timeout, env: { ...process.env, CI: '1' } });
    if (run.status !== 0) {
      return { ok: false, step, tail: `${run.stdout || ''}${run.stderr || ''}${run.error || ''}`.slice(-2000) };
    }
  }
  return { ok: true };
}

module.exports = { ROOT, locate, resetWorkspace, digestWorkspace, checkBuild };
