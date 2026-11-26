// Runs the Claude Code CLI headless and returns its parsed event stream.
const { spawn } = require('node:child_process');

const CLAUDE_BIN = process.env.EVAL_CLAUDE_BIN || 'claude';

// Flags that keep the user's own settings, plugins, skills and MCP servers out of a run.
const ISOLATION_ARGS = ['--setting-sources', '', '--strict-mcp-config', '--no-session-persistence'];

function runClaude({ args, input, cwd, timeoutMs, onEvent }) {
  return new Promise((resolve) => {
    const child = spawn(CLAUDE_BIN, args, {
      cwd, stdio: ['pipe', 'pipe', 'pipe'], detached: process.platform !== 'win32',
    });
    const events = [];
    let buffer = '';
    let stderr = '';
    let timedOut = false;
    let stdinFailed = false;
    let finished = false;
    let killTimer;
    const killTree = (signal) => {
      if (!child.pid) return;
      if (process.platform === 'win32') {
        const killer = spawn('taskkill', ['/pid', String(child.pid), '/T', '/F'], { stdio: 'ignore' });
        killer.on('error', (error) => { stderr += `\n${error}`; });
        killer.unref();
      } else {
        try {
          process.kill(-child.pid, signal);
        } catch (error) {
          if (error.code !== 'ESRCH') stderr += `\n${error}`;
        }
      }
    };
    const timer = timeoutMs
      ? setTimeout(() => {
          timedOut = true;
          killTree('SIGTERM');
          killTimer = setTimeout(() => {
            killTree('SIGKILL');
            child.stdin.destroy();
            child.stdout.destroy();
            child.stderr.destroy();
            finish(child.exitCode);
          }, 10_000);
        }, timeoutMs)
      : null;

    const take = (line) => {
      if (!line.trim()) return;
      try {
        const event = JSON.parse(line);
        events.push(event);
        if (onEvent) onEvent(event);
      } catch {
        // Not a JSON line (a warning printed to stdout); keep going.
      }
    };
    const finish = (exitCode) => {
      if (finished) return;
      finished = true;
      if (timer) clearTimeout(timer);
      if (killTimer) clearTimeout(killTimer);
      if (timedOut) killTree('SIGKILL');
      take(buffer);
      resolve({ events, exitCode: stdinFailed && exitCode === 0 ? 1 : exitCode, stderr, timedOut });
    };
    child.stdout.on('data', (chunk) => {
      buffer += chunk;
      const lines = buffer.split('\n');
      buffer = lines.pop();
      lines.forEach(take);
    });
    child.stderr.on('data', (chunk) => {
      stderr = (stderr + chunk).slice(-4000);
    });
    child.on('error', (error) => {
      stderr += `\n${error}`;
      finish(null);
    });
    child.on('close', finish);
    child.stdin.on('error', (error) => {
      stdinFailed = true;
      stderr += `\nstdin: ${error}`;
    });
    child.stdin.end(input ?? '');
  });
}

const resultEvent = (events) => events.findLast((event) => event.type === 'result');

module.exports = { runClaude, resultEvent, ISOLATION_ARGS };
