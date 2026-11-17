// Runs the Claude Code CLI headless and returns its parsed event stream.
const { spawn } = require('node:child_process');

const CLAUDE_BIN = process.env.EVAL_CLAUDE_BIN || 'claude';

// Flags that keep the user's own settings, plugins, skills and MCP servers out of a run.
const ISOLATION_ARGS = ['--setting-sources', '', '--strict-mcp-config', '--no-session-persistence'];

function runClaude({ args, input, cwd, timeoutMs, onEvent }) {
  return new Promise((resolve) => {
    const child = spawn(CLAUDE_BIN, args, { cwd, stdio: ['pipe', 'pipe', 'pipe'] });
    const events = [];
    let buffer = '';
    let stderr = '';
    let timedOut = false;
    const timer = timeoutMs
      ? setTimeout(() => {
          timedOut = true;
          child.kill('SIGTERM');
          setTimeout(() => child.kill('SIGKILL'), 10_000).unref();
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
      if (timer) clearTimeout(timer);
      resolve({ events, exitCode: null, stderr: String(error), timedOut });
    });
    child.on('close', (exitCode) => {
      if (timer) clearTimeout(timer);
      take(buffer);
      resolve({ events, exitCode, stderr, timedOut });
    });
    child.stdin.end(input ?? '');
  });
}

const resultEvent = (events) => events.findLast((event) => event.type === 'result');

module.exports = { runClaude, resultEvent, ISOLATION_ARGS };
