// promptfoo assertion: grades one build against one Markdown file of requirements, in one call.
//
// config.file          requirements file, relative to this eval's directory
// config.perScenario   when true, the file is `${config.dir}/${vars.scenario}.md`
// config.prefix        name used for the per-requirement scores
// config.threshold     share of applicable requirements that must pass (default 0.7)
const fs = require('node:fs');
const path = require('node:path');
const { runClaude, resultEvent, ISOLATION_ARGS } = require('../lib/claude-cli');

const EVAL_DIR = path.resolve(__dirname, '..');

const SYSTEM_PROMPT = `You grade the source code of a web app that integrates Morpho.

You receive the brief the app was built from, a list of requirements, and the app's source files.
Judge each requirement separately and only from the source.

- "pass": the source shows the requirement is met. Name the file and what you saw.
- "fail": the source contradicts the requirement, or you cannot find the code that meets it. A claim
  in a README or a comment is not evidence; the code must do it.
- "na": the requirement is about a product or feature that the brief does not ask for. A feature
  the brief asks for and the app left out is "fail", not "na".

Be strict and literal. Do not give credit for intent, for a TODO, or for a value that is hard-coded
where the requirement needs it computed or fetched. Return one result for every requirement id.`;

const SCHEMA = {
  type: 'object',
  required: ['results'],
  properties: {
    results: {
      type: 'array',
      items: {
        type: 'object',
        required: ['id', 'verdict', 'evidence'],
        properties: {
          id: { type: 'string' },
          verdict: { type: 'string', enum: ['pass', 'fail', 'na'] },
          evidence: { type: 'string', description: 'One or two sentences naming the file and what it shows.' },
        },
      },
    },
  },
};

// A requirement is a `### ID. Title` heading followed by its text.
function parseRequirements(markdown) {
  const items = [];
  for (const section of markdown.split(/^### /m).slice(1)) {
    const [heading, ...body] = section.split('\n');
    const match = heading.match(/^([A-Za-z0-9-]+)[.:]?\s+(.*)$/);
    if (!match) continue;
    items.push({ id: match[1], title: match[2].trim(), text: body.join('\n').trim() });
  }
  return items;
}

function parseVerdicts(result) {
  if (result.structured_output?.results) return result.structured_output.results;
  const text = String(result.result || '');
  const json = text.slice(text.indexOf('{'), text.lastIndexOf('}') + 1);
  return JSON.parse(json).results;
}

async function askGrader(input) {
  const model = process.env.EVAL_GRADER_MODEL || 'claude-opus-5-5';
  const args = [
    '-p', '--output-format', 'json',
    '--model', model,
    '--system-prompt', SYSTEM_PROMPT,
    '--json-schema', JSON.stringify(SCHEMA),
    '--tools', '',
    ...ISOLATION_ARGS,
  ];
  let lastError;
  for (let attempt = 0; attempt < 2; attempt++) {
    const run = await runClaude({ args, input, cwd: EVAL_DIR, timeoutMs: 15 * 60_000 });
    // `--output-format json` prints one object, or an array of events on some versions.
    const events = run.events.flatMap((event) => (Array.isArray(event) ? event : [event]));
    const result = resultEvent(events);
    try {
      if (run.timedOut || run.exitCode !== 0 || !result || result.is_error) {
        throw new Error(run.stderr || result?.result || 'no successful result from the grader');
      }
      return { verdicts: parseVerdicts(result), cost: result.total_cost_usd };
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError;
}

module.exports = async (output, context) => {
  const config = context.config || {};
  const scenario = context.vars?.scenario;
  const file = config.perScenario ? path.join(config.dir, `${scenario}.md`) : config.file;
  const prefix = config.prefix || path.basename(file, '.md');
  const target = fs.realpathSync(path.resolve(EVAL_DIR, file));
  const relative = path.relative(EVAL_DIR, target);
  if (relative === '..' || relative.startsWith(`..${path.sep}`) || path.isAbsolute(relative)) {
    return { pass: false, score: 0, reason: 'Requirements must be inside the evaluation directory.' };
  }
  const requirements = parseRequirements(fs.readFileSync(target, 'utf8'));
  if (requirements.length === 0) return { pass: false, score: 0, reason: `No requirements found in ${file}` };

  const input = [
    `# Brief the app was built from\n${context.vars?.brief || '(not provided)'}`,
    `# Requirements\n${requirements.map((item) => `## ${item.id}. ${item.title}\n${item.text}`).join('\n\n')}`,
    `# App source\n${output}`,
  ].join('\n\n---\n\n');

  let graded;
  try {
    graded = await askGrader(input);
  } catch (error) {
    return { pass: false, score: 0, reason: `Grader failed: ${String(error.message || error).slice(0, 300)}` };
  }
  const byId = new Map(graded.verdicts.map((verdict) => [String(verdict.id).replace(/\.$/, ''), verdict]));

  const namedScores = {};
  const componentResults = [];
  let passed = 0;
  let applicable = 0;
  for (const item of requirements) {
    const verdict = byId.get(item.id) || { verdict: 'fail', evidence: 'The grader returned no verdict.' };
    const isPass = verdict.verdict === 'pass';
    if (verdict.verdict !== 'na') {
      applicable += 1;
      passed += Number(isPass);
      namedScores[`${prefix}/${item.id}`] = Number(isPass);
    }
    componentResults.push({
      pass: verdict.verdict !== 'fail',
      score: isPass ? 1 : 0,
      reason: `${item.id} ${item.title}: ${verdict.verdict.toUpperCase()}. ${verdict.evidence || ''}`,
    });
  }

  const score = applicable ? passed / applicable : 0;
  const failed = componentResults.filter((component) => !component.pass).map((component) => component.reason.split(' ')[0]);
  return {
    pass: score >= (config.threshold ?? 0.7),
    score,
    reason: `${passed}/${applicable} applicable requirements passed${failed.length ? `; failed: ${failed.join(', ')}` : ''}`,
    namedScores,
    componentResults,
  };
};

module.exports.parseRequirements = parseRequirements;
