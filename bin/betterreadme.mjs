#!/usr/bin/env node
// Command line of Better README. Exit codes: 0 clean, 1 findings at a failing level,
// 2 bad invocation, bad configuration, or internal error.

import { existsSync, readFileSync, statSync } from 'node:fs';
import { parseArgs } from 'node:util';

import { check, ConfigError, DEFAULT_OPTIONS, LEVELS, loadConfig, RULES, VERSION } from '../src/engine.mjs';

const HELP = `Usage: betterreadme [options] [directory]

Checks the README, CONTRIBUTING, and agent instruction files of a repository
against the Better README rules. The directory defaults to the current one.

Options:
  --format <human|json>   Output format (default: human). JSON goes to stdout only
  --fail-on <level>       Lowest level that fails the run: error, warning, or info (default: error)
  --config <file>         Configuration file (default: .betterreadme.json in the directory)
  --list-rules            Print every checked rule with its default level, then exit;
                          with --format json, the reviewed rules too
  --version               Print the version, then exit
  -h, --help              Print this help

Exit codes: 0 clean, 1 findings at a failing level, 2 bad invocation, configuration, or internal error.`;

// Sets the exit code and lets the process end by itself, so piped output is never cut.
class Exit extends Error {
  constructor(code) {
    super(`exit ${code}`);
    this.code = code;
  }
}

function fail(message) {
  process.stderr.write(`betterreadme: ${message}\n`);
  throw new Exit(2);
}

function main() {

let args;
try {
  args = parseArgs({
    allowPositionals: true,
    options: {
      format: { type: 'string', default: 'human' },
      'fail-on': { type: 'string', default: 'error' },
      config: { type: 'string' },
      'list-rules': { type: 'boolean', default: false },
      version: { type: 'boolean', default: false },
      help: { type: 'boolean', short: 'h', default: false },
    },
  });
} catch (error) {
  fail(`${error.message}\n\n${HELP}`);
}

const { values, positionals } = args;
if (values.help) {
  process.stdout.write(`${HELP}\n`);
  throw new Exit(0);
}
if (values.version) {
  process.stdout.write(`${VERSION}\n`);
  throw new Exit(0);
}
if (!['human', 'json'].includes(values.format)) fail(`unknown format "${values.format}": use human or json`);
if (!LEVELS.includes(values['fail-on'])) fail(`unknown level "${values['fail-on']}": use error, warning, or info`);

if (values['list-rules']) {
  if (values.format === 'json') {
    const rules = RULES.map(({ id, level, summary }) => ({ id, level, summary }));
    // The reviewed rules live in RULES.md, as rows of three cells: identifier, question, evidence.
    const catalog = readFileSync(new URL('../RULES.md', import.meta.url), 'utf8');
    const reviewed = [...catalog.matchAll(/^\| `(review\/[\w-]+)` \| (.+?) \| (.+?) \|$/gm)].map(([, id, question, evidence]) => ({ id, question, evidence }));
    process.stdout.write(`${JSON.stringify({ rules, reviewed, options: DEFAULT_OPTIONS }, null, 2)}\n`);
  } else {
    for (const rule of RULES) process.stdout.write(`${rule.id.padEnd(30)} ${rule.level.padEnd(8)} ${rule.summary}\n`);
  }
  throw new Exit(0);
}

if (positionals.length > 1) fail('pass one directory at most');
const root = positionals[0] ?? '.';
if (!existsSync(root) || !statSync(root).isDirectory()) fail(`"${root}" isn't a directory`);

let result;
try {
  result = check(root, loadConfig(root, values.config));
} catch (error) {
  if (error instanceof ConfigError) fail(error.message);
  throw error;
}

const failing = LEVELS.slice(0, LEVELS.indexOf(values['fail-on']) + 1);
const failed = result.findings.some((finding) => failing.includes(finding.level));

if (values.format === 'json') {
  process.stdout.write(`${JSON.stringify({ ...result, failed }, null, 2)}\n`);
} else {
  const color = process.stdout.isTTY && !process.env.NO_COLOR;
  const paint = (code, text) => (color ? `\u001B[${code}m${text}\u001B[0m` : text);
  const colors = { error: 31, warning: 33, info: 36 };
  let current = null;
  for (const finding of result.findings) {
    if (finding.file !== current) {
      current = finding.file;
      process.stdout.write(`\n${paint(1, current)}\n`);
    }
    const position = String(finding.line).padStart(5);
    process.stdout.write(`${position}  ${paint(colors[finding.level], finding.level.padEnd(7))}  ${finding.message}  ${paint(2, finding.rule)}\n`);
  }
  const { error, warning, info } = result.counts;
  const checked = result.files.length > 0 ? result.files.join(', ') : 'no documentation file';
  process.stdout.write(`\nChecked ${checked}: ${error} error(s), ${warning} warning(s), ${info} info(s)\n`);
}

throw new Exit(failed ? 1 : 0);
}

try {
  main();
} catch (error) {
  if (error instanceof Exit) {
    process.exitCode = error.code;
  } else {
    process.stderr.write(`betterreadme: internal error, please report it\n${error.stack}\n`);
    process.exitCode = 2;
  }
}
