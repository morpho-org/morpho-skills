// promptfoo provider: one Claude Code build per (arm, scenario), run through the real CLI.
const fs = require('node:fs');
const path = require('node:path');
const { runClaude, resultEvent, ISOLATION_ARGS } = require('../lib/claude-cli');
const { locate, resetWorkspace, digestWorkspace, checkBuild } = require('../lib/workspace');

const REPO_ROOT = path.resolve(__dirname, '..', '..', '..');
const DOC_SEARCH_TOOL = 'mcp__morpho__morpho_doc_search';
const BUILT_IN_TOOLS = [
  'Task', 'Bash', 'Read', 'Write', 'Edit', 'NotebookEdit', 'Glob', 'Grep',
  'WebSearch', 'WebFetch', 'TodoWrite', 'ToolSearch', 'TaskStop', 'Monitor',
];

// Each arm adds exactly one thing to vanilla Claude Code.
const ARMS = {
  vanilla: { tools: [], args: [] },
  mcp: {
    tools: [DOC_SEARCH_TOOL],
    args: [
      '--mcp-config',
      JSON.stringify({
        mcpServers: { morpho: { type: 'http', url: process.env.EVAL_MORPHO_MCP_URL || 'https://mcp.morpho.org/' } },
      }),
    ],
  },
  skill: {
    tools: ['Skill'],
    args: ['--plugin-dir', process.env.EVAL_PLUGIN_DIR || path.join(REPO_ROOT, 'plugins', 'morpho-builder')],
  },
};

module.exports = class ClaudeCodeBuildProvider {
  constructor(options = {}) {
    this.config = options.config || {};
    this.arm = this.config.arm;
    if (!ARMS[this.arm]) throw new Error(`Unknown arm "${this.arm}". Use one of: ${Object.keys(ARMS).join(', ')}`);
    this.label = options.label || `claude-code:${this.arm}`;
  }

  id() {
    return this.label;
  }

  async callApi(prompt, context) {
    const scenario = context?.vars?.scenario;
    if (!scenario) return { error: 'The test must set vars.scenario.' };
    const paths = locate(this.arm, scenario);

    let record;
    if (process.env.EVAL_REUSE_WORKSPACES === '1' && fs.existsSync(paths.record)) {
      record = { ...JSON.parse(fs.readFileSync(paths.record, 'utf8')), reused: true };
    } else {
      record = await this.build(prompt, scenario, paths);
      fs.mkdirSync(path.dirname(paths.record), { recursive: true });
      fs.writeFileSync(paths.record, JSON.stringify(record, null, 2));
    }

    const digest = digestWorkspace(paths.workspace);
    if (digest.fileCount === 0) {
      return { error: `The build produced no files. ${record.failure || ''}`.trim(), metadata: record };
    }
    return {
      // Graders see only the app: nothing here names the arm that built it.
      output: digest.text,
      cost: record.costUsd,
      tokenUsage: record.tokenUsage,
      metadata: { ...record, workspace: paths.workspace, digestFiles: digest.fileCount, digestOmitted: digest.omitted },
    };
  }

  async build(prompt, scenario, paths) {
    resetWorkspace(paths.workspace);
    fs.mkdirSync(path.dirname(paths.transcript), { recursive: true });
    const transcript = fs.createWriteStream(paths.transcript);
    const arm = ARMS[this.arm];
    const model = process.env.EVAL_BUILD_MODEL || this.config.model || 'claude-fable-5-2';
    const budget = process.env.EVAL_MAX_BUDGET_USD || this.config.maxBudgetUsd;
    const args = [
      '-p', '--output-format', 'stream-json', '--verbose',
      '--model', model,
      // dontAsk denies every tool that is not listed, so the MCP arm gets doc search and nothing else.
      '--permission-mode', 'dontAsk',
      '--allowedTools', [...BUILT_IN_TOOLS, ...arm.tools].join(','),
      ...arm.args,
      ...ISOLATION_ARGS,
      ...(budget ? ['--max-budget-usd', String(budget)] : []),
    ];

    const toolCalls = {};
    const skillsInvoked = [];
    const started = Date.now();
    const run = await runClaude({
      args,
      input: prompt,
      cwd: paths.workspace,
      timeoutMs: Number(process.env.EVAL_BUILD_TIMEOUT_MS_AGENT || this.config.timeoutMs || 120 * 60_000),
      onEvent: (event) => {
        transcript.write(`${JSON.stringify(event)}\n`);
        if (event.type !== 'assistant') return;
        for (const block of event.message?.content || []) {
          if (block.type !== 'tool_use') continue;
          toolCalls[block.name] = (toolCalls[block.name] || 0) + 1;
          if (block.name === 'Skill' && block.input?.skill) skillsInvoked.push(block.input.skill);
        }
      },
    });
    transcript.end();

    const result = resultEvent(run.events) || {};
    const usage = result.usage || {};
    const failure = run.timedOut
      ? 'The build timed out.'
      : result.is_error || run.exitCode !== 0
        ? `Claude Code ended with ${result.subtype || `exit code ${run.exitCode}`}. ${run.stderr.slice(-500)}`
        : undefined;

    return {
      arm: this.arm,
      scenario,
      model,
      failure,
      finalMessage: typeof result.result === 'string' ? result.result.slice(0, 6000) : undefined,
      numTurns: result.num_turns,
      durationMs: Date.now() - started,
      costUsd: result.total_cost_usd,
      tokenUsage: {
        prompt: (usage.input_tokens || 0) + (usage.cache_read_input_tokens || 0) + (usage.cache_creation_input_tokens || 0),
        completion: usage.output_tokens || 0,
        total:
          (usage.input_tokens || 0) + (usage.cache_read_input_tokens || 0) +
          (usage.cache_creation_input_tokens || 0) + (usage.output_tokens || 0),
      },
      toolCalls,
      skillsInvoked,
      docSearchCalls: toolCalls[DOC_SEARCH_TOOL] || 0,
      permissionDenials: (result.permission_denials || []).length,
      build: process.env.EVAL_SKIP_BUILD_CHECK === '1' ? undefined : checkBuild(paths.workspace),
      transcript: paths.transcript,
    };
  }
};
