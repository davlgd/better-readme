// Runs the rules against a repository, and applies the configuration and the inline directives.

import { readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

import { loadProject } from './project.mjs';
import content from './rules/content.mjs';
import readme from './rules/readme.mjs';
import repository from './rules/repository.mjs';

// Reported by the engine itself, when a directive can't do what its author expects.
const DIRECTIVE_RULE = {
  id: 'meta/directive',
  level: 'error',
  summary: 'A `betterreadme` directive is one of the four that exist, and names rules that exist, never a `security/` rule, which only the configuration turns off',
  check() {},
};

export const RULES = [...readme, ...content, ...repository, DIRECTIVE_RULE];
export const LEVELS = ['error', 'warning', 'info'];
export const CONFIG_FILE = '.betterreadme.json';
export const VERSION = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8')).version;

export const DEFAULT_OPTIONS = {
  // Minimum number of words of the description under the README title
  minDescriptionWords: 5,
  // Beyond this length, a README holds reference material that belongs elsewhere
  maxReadmeLines: 500,
  // Agents load instruction files whole, in every session
  maxAgentLines: 200,
  maxHeadingLength: 60,
  // Words in capitals an agent instruction file can hold before they stop meaning anything
  maxEmphasis: 3,
  maxCallouts: 2,
  maxParagraphWords: 80,
  maxSentenceWords: 25,
  // 'none': a paragraph stays on one line. 'any': the rule is off
  wrap: 'none',
};

export class ConfigError extends Error {}

/** Reads `.betterreadme.json`, or the file passed with `--config`. */
export function loadConfig(root, explicitPath) {
  const path = explicitPath ?? join(root, CONFIG_FILE);
  let text;
  try {
    if (!statSync(path).isFile()) throw new Error('not a file');
    text = readFileSync(path, 'utf8');
  } catch {
    if (explicitPath) throw new ConfigError(`Configuration file not found: ${explicitPath}`);
    return { rules: {}, options: {}, include: [] };
  }
  let config;
  try {
    config = JSON.parse(text);
  } catch (error) {
    throw new ConfigError(`Invalid JSON in ${path}: ${error.message}`);
  }
  return validateConfig(config, path);
}

/** Checks a configuration object, and returns it with every key present. */
export function validateConfig(config, path = 'the configuration') {
  const isObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
  if (!isObject(config)) throw new ConfigError(`${path} must hold a JSON object`);
  for (const key of Object.keys(config)) {
    if (key === '$schema') continue; // editors add it
    if (!['rules', 'options', 'include'].includes(key)) throw new ConfigError(`Unknown key "${key}" in ${path}: use rules, options, or include`);
  }
  const { rules = {}, options = {}, include = [] } = config;
  if (!isObject(rules)) throw new ConfigError(`"rules" must be an object in ${path}`);
  if (!isObject(options)) throw new ConfigError(`"options" must be an object in ${path}`);
  if (!Array.isArray(include) || include.some((entry) => typeof entry !== 'string')) {
    throw new ConfigError(`"include" must be a list of paths in ${path}`);
  }
  const known = new Set(RULES.map((rule) => rule.id));
  for (const [id, level] of Object.entries(rules)) {
    if (!known.has(id)) throw new ConfigError(`Unknown rule "${id}" in ${path}`);
    if (level !== 'off' && !LEVELS.includes(level)) {
      throw new ConfigError(`Invalid level "${level}" for ${id} in ${path}: use error, warning, info, or off`);
    }
  }
  for (const [key, value] of Object.entries(options)) {
    if (!(key in DEFAULT_OPTIONS)) throw new ConfigError(`Unknown option "${key}" in ${path}`);
    if (key === 'wrap') {
      if (value !== 'none' && value !== 'any') throw new ConfigError(`Option "wrap" must be "none" or "any" in ${path}`);
    } else if (!Number.isInteger(value) || value < 0) {
      throw new ConfigError(`Option "${key}" must be a positive integer in ${path}`);
    }
  }
  return { rules, options, include };
}

/**
 * Checks a repository and returns its findings, sorted by file and line.
 * @param {string} root
 * @param {{rules?: Record<string, string>, options?: object, include?: string[]}} [config]
 */
export function check(root, config = {}) {
  const { rules, options: custom, include } = validateConfig(config);
  const project = loadProject(root, { include });
  if (project.missingIncludes.length > 0) {
    throw new ConfigError(`"include" names a path that isn't a file or a folder of the repository, or that is a symbolic link: ${project.missingIncludes.join(', ')}`);
  }
  const options = { ...DEFAULT_OPTIONS, ...custom };
  const known = new Set(RULES.map((rule) => rule.id));
  const findings = [];

  for (const rule of RULES) {
    const level = rules[rule.id] ?? rule.level;
    if (level === 'off') continue;
    rule.check({
      project,
      options,
      report({ file, line, message, level: lower }) {
        const document = project.documents.find((candidate) => candidate.path === file);
        // A comment in the checked file can't silence a security rule: it would hide what the rule looks for.
        if (document && !rule.id.startsWith('security/')) {
          const { disabled, fileWide } = document.doc;
          if (fileWide.has(rule.id) || fileWide.has('*')) return;
          const here = disabled.get(line);
          if (here && (here.has(rule.id) || here.has('*'))) return;
        }
        // A rule can report a finding below its level, never above.
        findings.push({ rule: rule.id, level: lower && LEVELS.indexOf(lower) > LEVELS.indexOf(level) ? lower : level, file, line, message });
      },
    });
  }

  const directiveLevel = rules[DIRECTIVE_RULE.id] ?? DIRECTIVE_RULE.level;
  if (directiveLevel !== 'off') {
    for (const document of project.documents) {
      for (const directive of document.doc.directives) {
        if (directive.unknown) {
          const message = `Unknown directive "betterreadme-${directive.action}": use disable, enable, disable-next-line, or disable-file`;
          findings.push({ rule: DIRECTIVE_RULE.id, level: directiveLevel, file: document.path, line: directive.line, message });
          continue;
        }
        for (const id of directive.ids) {
          let message = null;
          if (id !== '*' && !known.has(id)) message = `Unknown rule "${id}" in a betterreadme directive: it silences nothing`;
          else if (id.startsWith('security/')) message = `A directive can't silence ${id}: turn it off in ${CONFIG_FILE}, where reviewers see it`;
          if (message) findings.push({ rule: DIRECTIVE_RULE.id, level: directiveLevel, file: document.path, line: directive.line, message });
        }
      }
    }
  }

  findings.sort((a, b) => a.file.localeCompare(b.file) || a.line - b.line || a.rule.localeCompare(b.rule));
  const counts = Object.fromEntries(LEVELS.map((level) => [level, findings.filter((finding) => finding.level === level).length]));
  return {
    version: VERSION,
    root: project.root,
    files: project.documents.map((document) => document.path),
    findings,
    counts,
  };
}
