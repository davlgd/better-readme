// Rules that compare the documentation with the repository: the commands and paths it
// names, the files a project provides, and how instruction files share their content.

import { dirname } from 'node:path';

import { inlineCodeSpans, wordCount } from '../markdown.mjs';

const RUNNABLE = new Set(['bash', 'sh', 'shell', 'zsh', 'console', 'shell-session']);

// How each task runner is called, and which manifest declares its tasks. A runner whose
// name is also a common word is only read at the start of a command.
const RUNNERS = [
  { runner: 'npm', manifest: 'package.json', pattern: /\b(?:npm|pnpm|yarn|bun) run(?:-script)? ([A-Za-z0-9_:.-]+)/g },
  { runner: 'npm', manifest: 'package.json', pattern: /\bnpm (test)\b/g },
  { runner: 'make', manifest: 'the Makefile', pattern: /(?:^|&&|;|\|\|)\s*make ([A-Za-z0-9_.-]+)(?=\s|$)/g },
  { runner: 'just', manifest: 'the justfile', pattern: /(?:^|&&|;|\|\|)\s*just ([A-Za-z_][A-Za-z0-9_-]*)(?=\s|$)/g },
  { runner: 'mise', manifest: 'mise.toml', pattern: /\bmise run ([A-Za-z0-9_:-]+)/g },
  { runner: 'task', manifest: 'the Taskfile', pattern: /(?:^|&&|;|\|\|)\s*task ([A-Za-z0-9_:.-]+)(?=\s|$)/g },
  { runner: 'composer', manifest: 'composer.json', pattern: /\bcomposer run(?:-script)? ([A-Za-z0-9_:.-]+)/g },
  { runner: 'deno', manifest: 'deno.json', pattern: /\bdeno task ([A-Za-z0-9_:.-]+)/g },
];
// A command that targets another package or folder, or tolerates a missing task, can't be checked.
const ELSEWHERE = /\s(-w|--workspace|--workspaces|--filter|--prefix|--cwd|-C|--dir|--directory|-f|--file|--if-present|-r|--recursive)\b/;
const WORD_RUNNERS = new Set(['make', 'just', 'task']);
const INTRODUCES_COMMAND = /\b(run|runs|running|ran|use|uses|using|execute|executes|with|via|call|calls|invoke|invokes|type|try|launch|start)\s*:?\s*$/i;
const MOVE = /(?:^|[\s;&|(])(?:cd|pushd)\s+["']?([^\s"';&|)]+)/;
// Words telling that a path is still to be created, or is produced by a command.
const NOT_YET_THERE = /\b(creat(e|es|ed|ing)|generat(e|es|ed|ing)|writes?|written|will be|produc(e|es|ed)|outputs?|saved?|saves|stored?|stores|export(s|ed)?|download(s|ed)?|cop(y|ies|ied)|renamed?|touch|mkdir)\b/i;

// Names under which licenses are written in manifests and in prose, most specific first.
const LICENSE_NAMES = [
  ['MIT-0', /\bMIT[- ]0\b|MIT No Attribution/i],
  ['Apache-2.0', /\bApache(?:[- ]Licen[cs]e)?,?(?:[- ]Version)?[- ]?2(?:\.0)?\b/i],
  ['AGPL-3.0', /\bAGPL[- ]?v?3|Affero General Public Licen[cs]e,? (?:version |v)?3/i],
  ['LGPL-3.0', /\bLGPL[- ]?v?3|Lesser General Public Licen[cs]e,? (?:version |v)?3/i],
  ['LGPL-2.1', /\bLGPL[- ]?v?2\.1|Lesser General Public Licen[cs]e,? (?:version |v)?2\.1/i],
  ['GPL-3.0', /\bGPL[- ]?v?3|GNU General Public Licen[cs]e,? (?:version |v)?3/i],
  ['GPL-2.0', /\bGPL[- ]?v?2|GNU General Public Licen[cs]e,? (?:version |v)?2/i],
  ['MPL-2.0', /\bMPL[- ]?2|Mozilla Public Licen[cs]e/i],
  ['BSD-3-Clause', /\bBSD[- ]3|3-clause BSD/i],
  ['BSD-2-Clause', /\bBSD[- ]2|2-clause BSD/i],
  ['ISC', /\bISC\b/],
  ['Unlicense', /\bUnlicense\b/i],
  ['CC0-1.0', /\bCC0\b/i],
  ['BSL-1.0', /\bBSL-1\.0\b|Boost Software Licen[cs]e/i],
  ['EUPL-1.2', /\bEUPL\b/i],
  ['MIT', /\bMIT\b/],
];

const eachDocument = (project) => project.documents.filter((file) => !file.alias);
const rootAgents = (project) => project.agents.filter((agent) => !agent.alias);

/** Tells whether an instruction file belongs to a subfolder, where commands run against another manifest. */
function isNested(file) {
  return file.role === 'agent' && /^[^.][^/]*\//.test(file.path) && !/(^|\/)SKILL\.md$/.test(file.path);
}

/** Tells whether a file is one that agents load whole, as opposed to a rule file of a tool's folder. */
function isMainAgentFile(file) {
  return /(^|\/)(AGENTS|AGENTS\.override|CLAUDE|GEMINI)\.md$/.test(file.path) || file.path === '.github/copilot-instructions.md';
}

/** Returns the licenses a text names, removing each match so "LGPL" isn't also read as "GPL". */
function licensesNamed(text) {
  const names = new Set();
  let rest = text;
  for (const [name, pattern] of LICENSE_NAMES) {
    if (pattern.test(rest)) {
      names.add(name);
      rest = rest.replace(new RegExp(pattern.source, `${pattern.flags.replace('g', '')}g`), ' ');
    }
  }
  return names;
}

/** Yields the commands of a file: the lines of its shell code blocks, then its inline code. */
function* commandLines(project, file) {
  const headingLines = file.doc.headings.map((heading) => heading.line);
  let moved = false;
  let previousEnd = 0;
  for (const block of file.doc.codeBlocks) {
    // A section starts from the root of the repository again.
    if (headingLines.some((line) => line > previousEnd && line < block.line)) moved = false;
    previousEnd = block.endLine;
    if (!RUNNABLE.has(block.lang)) continue;
    let cloned = null;
    for (let offset = 0; offset < block.content.length; offset++) {
      const text = block.content[offset].replace(/^\s*\$\s+/, '').replace(/\s+#\s.*$/, '');
      if (/^\s*#/.test(text)) continue;
      // `git clone` names the folder of the clone: its last argument, or the end of the address.
      const clone = /\bgit clone\b(?:\s+-{1,2}\S+(?:[ =]\S+)?)*\s+(\S+)(?:\s+([^\s;&|]+))?/.exec(text);
      if (clone) cloned = (clone[2] ?? clone[1].replace(/\/$/, '').split(/[/:]/).pop().replace(/\.git$/, '')).replace(/\/$/, '').toLowerCase();
      // After moving to a folder of the repository, commands no longer run against the root manifest.
      const move = MOVE.exec(text);
      // The folder of a clone is the root. Another folder is a part of the repository, or a project the reader just generated.
      const target = move ? move[1].replace(/\/$/, '').toLowerCase() : null;
      const elsewhere = move && !/^(\.|~|\/|\$|-)/.test(move[1]) && !project.names.has(target) && target !== cloned;
      if (elsewhere && (project.isDirectory(move[1]) || offset > 0)) {
        if (!/\(\s*(?:cd|pushd)\b/.test(text)) moved = true;
        continue;
      }
      if (/(?:^|[\s;&|])popd\b/.test(text)) moved = false;
      if (!moved) yield { line: block.line + 1 + offset, text };
    }
  }
  for (let index = 0; index < file.doc.lines.length; index++) {
    if (file.doc.kinds[index] !== 'prose') continue;
    const line = file.doc.lines[index];
    for (const span of inlineCodeSpans(line)) yield { line: index + 1, text: span.text, before: line.slice(0, span.column - 1) };
  }
}

function looksLikePath(text) {
  if (!/^\.?\/?[A-Za-z0-9_@.-]+(\/[A-Za-z0-9_@.-]+)+\/?$/.test(text)) return false;
  // Without an extension or a trailing slash, it may be a route, a method, or a package name.
  if (!/(\/|\.[A-Za-z0-9]{1,8})$/.test(text)) return false;
  if (/^(https?:|\/|~|@|-)/.test(text) || text.includes('..')) return false;
  return true;
}

function normalizedParagraphs(file) {
  return file.doc.paragraphs
    .filter((paragraph) => wordCount(paragraph.text) >= 25)
    .map((paragraph) => ({ line: paragraph.line, key: paragraph.text.toLowerCase().replace(/\s+/g, ' ') }));
}

/** Tells whether a line, or a heading, of a file matches a pattern, outside code blocks. */
function proseMatches(file, pattern) {
  return file.doc.lines.some((line, index) => file.doc.kinds[index] === 'prose' && pattern.test(file.doc.visible[index] || line));
}

export default [
  {
    id: 'project/license',
    level: 'error',
    summary: 'The repository has a license file at its root, such as `LICENSE`, `COPYING`, or a `LICENSES/` folder, unless a manifest declares it `UNLICENSED` or proprietary',
    check({ project, report }) {
      if (project.licenseFiles.length > 0 || project.isPrivate) return;
      report({ file: 'LICENSE', line: 1, message: 'No license file: without one, nobody can legally use, copy, or change the project. For a proprietary project, declare the license `UNLICENSED` in the manifest' });
    },
  },
  {
    id: 'consistency/license-matches',
    level: 'error',
    summary: 'The license that a manifest declares, and the one the README names, is a license of the license files',
    check({ project, report }) {
      const families = new Set(project.licenseFamilies);
      if (families.size === 0) return;
      const held = [...families].join(' and ');
      const matches = (names) => [...names].some((name) => families.has(name));
      for (const { manifest, license } of project.declaredLicenses) {
        if (/^SEE LICEN[CS]E IN/i.test(license.trim())) continue;
        const names = licensesNamed(license);
        // A name this list doesn't know can't be compared.
        if (names.size > 0 && !matches(names)) {
          report({ file: manifest, line: 1, message: `${manifest} declares "${license}", but the license file holds ${held}` });
        }
      }
      const readme = project.readme;
      if (!readme) return;
      const { headings, lines, kinds, visible } = readme.doc;
      const section = headings.find((heading) => /licen[cs]e/i.test(heading.plain));
      const sectionEnd = section ? (headings.find((heading) => heading.line > section.line && heading.level <= section.level)?.line ?? lines.length + 1) : 0;
      for (let index = 0; index < lines.length; index++) {
        if (kinds[index] !== 'prose') continue;
        const inSection = section && index + 1 > section.line && index + 1 < sectionEnd;
        const text = visible[index];
        // With a license section, only that section speaks for the project: other mentions are about its dependencies.
        if (section ? !inSection : !/\b(licensed|released|available|distributed) under\b/i.test(text)) continue;
        const names = licensesNamed(text);
        // The first line that names a license speaks for the project: the next ones may be about its dependencies.
        if (names.size === 0) continue;
        if (!matches(names)) {
          report({ file: readme.path, line: index + 1, message: `The README names ${[...names].join(' and ')}, but the license file holds ${held}` });
        }
        return;
      }
    },
  },
  {
    id: 'project/security-policy',
    level: 'info',
    summary: 'The repository has a `SECURITY.md` telling how to report a vulnerability privately, unless a manifest declares it `UNLICENSED` or proprietary',
    check({ project, report }) {
      if (project.hasSecurityPolicy || project.isPrivate) return;
      report({ file: 'SECURITY.md', line: 1, message: 'No security policy: add a SECURITY.md telling how to report a vulnerability' });
    },
  },
  {
    id: 'consistency/commands-exist',
    level: 'error',
    summary: 'Every task the documentation runs, such as `npm run lint` or `make test`, is declared in the manifest of its runner',
    check({ project, report }) {
      for (const file of eachDocument(project)) {
        if (isNested(file)) continue;
        const reported = new Set();
        // An option that targets another package only excuses the command that carries it, not those chained after it.
        const commands = [...commandLines(project, file)].flatMap(({ line, text, before }) =>
          text.split(/\s*(?:&&|\|\||;)\s*/).map((part, position) => ({ line, text: part, before: position === 0 ? before : undefined })),
        );
        for (const { line, text, before } of commands) {
          if (ELSEWHERE.test(text)) continue;
          for (const { runner, manifest, pattern } of RUNNERS) {
            const declared = project.commands[runner];
            if (!declared || project.lenientRunners.has(runner)) continue;
            // In a sentence, `just fine` or `task id` aren't commands: a verb must introduce them.
            if (before !== undefined && WORD_RUNNERS.has(runner) && !INTRODUCES_COMMAND.test(before)) continue;
            for (const match of text.matchAll(pattern)) {
              const name = match[1];
              if (declared.has(name) || reported.has(`${runner}:${name}`)) continue;
              // `bun run` and `deno task` also take a file, and a leading dash is an option.
              if (name.startsWith('-') || /\.[cm]?[jt]sx?$/.test(name) || project.exists(name)) continue;
              reported.add(`${runner}:${name}`);
              report({
                file: file.path,
                line,
                message: `\`${match[0].replace(/^[\s;&|]+/, '')}\` runs "${name}", which ${manifest} doesn't declare`,
              });
            }
          }
        }
      }
    },
  },
  {
    id: 'consistency/paths-exist',
    level: 'info',
    summary: 'A path written as inline code, whose first folder exists in the repository, exists too, unless the text says to create it or Git ignores it',
    check({ project, report }) {
      for (const file of eachDocument(project)) {
        if (isNested(file)) continue;
        const reported = new Set();
        file.doc.lines.forEach((line, index) => {
          if (file.doc.kinds[index] !== 'prose' || NOT_YET_THERE.test(line)) return;
          for (const span of inlineCodeSpans(line)) {
            if (!looksLikePath(span.text)) continue;
            const path = span.text.replace(/^\.\//, '');
            const first = path.split('/')[0];
            if (!project.isDirectory(first) || project.exists(path) || reported.has(path)) continue;
            // A path relative to the folder of the file isn't a root path.
            if (project.exists(`${file.path}/../${path}`)) continue;
            // A path Git ignores holds generated or local files, which exist only after a build or a run.
            if (project.isIgnored(path.replace(/\/$/, ''))) continue;
            reported.add(path);
            report({ file: file.path, line: index + 1, message: `\`${span.text}\` doesn't exist, although \`${first}/\` does: fix the path, or remove it` });
          }
        });
      }
    },
  },
  {
    id: 'consistency/no-duplication',
    level: 'warning',
    summary: 'A paragraph of 25 words or more lives in one file: the others link to it instead of copying it',
    check({ project, report }) {
      const seen = new Map();
      for (const file of eachDocument(project)) {
        for (const { line, key } of normalizedParagraphs(file)) {
          const first = seen.get(key);
          // Instruction files of two subfolders belong to two projects: only files that are read together are compared.
          if (first && isNested(file) && isNested(first) && dirname(first.file) !== dirname(file.path)) continue;
          if (first && first.file !== file.path) {
            report({
              file: file.path,
              line,
              message: `This paragraph copies ${first.file}:${first.line}: keep it in one file and link to it, so the two never diverge`,
            });
          } else if (!first) {
            seen.set(key, { file: file.path, line, role: file.role, path: file.path });
          }
        }
      }
    },
  },
  {
    id: 'contributing/exists',
    level: 'warning',
    summary: 'The repository has a `CONTRIBUTING.md` at its root, in `.github/`, or in `docs/`',
    check({ project, report }) {
      if (!project.contributing) {
        report({
          file: 'CONTRIBUTING.md',
          line: 1,
          message: 'No CONTRIBUTING.md: tell contributors, and their agents, how to check and submit a change',
        });
      }
    },
  },
  {
    id: 'contributing/shadowed',
    level: 'warning',
    summary: 'The repository has one CONTRIBUTING file among `.github/`, its root, and `docs/`: GitHub links to the first it finds, in this order',
    check({ project, report }) {
      const [shown, ...hidden] = project.contributings;
      for (const path of hidden) {
        report({ file: path, line: 1, message: `GitHub links to ${shown} instead of this file: keep one of them` });
      }
    },
  },
  {
    id: 'contributing/checks',
    level: 'warning',
    summary: 'CONTRIBUTING has a section about checking a change, with the commands to run in a shell code block',
    check({ project, report }) {
      const file = project.contributing;
      if (!file) return;
      const { headings, codeBlocks } = file.doc;
      if (!headings.some((heading) => /\b(check|test|lint|valid|verif|quality|build)/i.test(heading.plain))) {
        // One finding for one cause: a file without the section has no command either.
        report({ file: file.path, line: 1, message: 'No section tells how to check a change: add one, such as "Check your change", with the commands to run in a `bash` block' });
      } else if (!codeBlocks.some((block) => RUNNABLE.has(block.lang))) {
        report({ file: file.path, line: 1, message: 'No command in a shell code block: give the exact commands that check a change' });
      }
    },
  },
  {
    id: 'contributing/submit',
    level: 'warning',
    summary: 'CONTRIBUTING has a section about submitting a change: pull request, merge request, or patch',
    check({ project, report }) {
      const file = project.contributing;
      if (!file) return;
      const pattern = /\b(pull requests?|merge requests?|patch(es)?|submit\w*|propos\w*|review\w*|workflow|PRs?|MRs?)\b/i;
      if (!file.doc.headings.some((heading) => pattern.test(heading.plain))) {
        report({ file: file.path, line: 1, message: 'No section tells how to submit a change: add one, such as "Open a pull request"' });
      }
    },
  },
  {
    id: 'contributing/commits',
    level: 'info',
    summary: 'CONTRIBUTING states the commit message convention',
    check({ project, report }) {
      const file = project.contributing;
      if (!file) return;
      const heading = file.doc.headings.some((item) => /\bcommits?\b/i.test(item.plain));
      const sentence = /\bcommit (messages?|subjects?|conventions?|format|style|titles?)\b|\bconventional commits\b|\bcommits? (follow|use|must|should|are)\b|\bsign[- ]off\b|\bDCO\b/i;
      if (!heading && !proseMatches(file, sentence)) {
        report({ file: file.path, line: 1, message: 'Nothing about commit messages: state the convention and show examples' });
      }
    },
  },
  {
    id: 'contributing/ai-policy',
    level: 'info',
    summary: 'CONTRIBUTING, or an `AI_POLICY.md` file, has a sentence or a section on contributions made with AI tools: accepted or not, and on which conditions',
    check({ project, report }) {
      const file = project.contributing;
      if (!file || project.hasAiPolicy) return;
      const tool = /\b(AI|LLMs?|generative|language models?|coding (agents?|assistants?)|Copilot|ChatGPT|Claude|Codex|Cursor)\b/;
      const stance = /\b(no|not|never|don't|without|disclos\w*|accept\w*|welcome|allow\w*|declin\w*|discourag\w*|reject\w*|refus\w*|forbid\w*|forbidden|ban(ned|s)?|prohibit\w*|polic(y|ies)|accountab\w*|responsib\w*|answers? for|generated|assisted|must (understand|review|verify)|not permitted)\b/i;
      const heading = file.doc.headings.some((item) => /\b(AI|LLMs?|generative|machine[- ]generated)\b/.test(item.plain));
      const sentence = file.doc.lines.some((line, index) => {
        if (file.doc.kinds[index] !== 'prose') return false;
        return file.doc.visible[index].split(/(?<=[.!?])\s+/).some((part) => tool.test(part) && stance.test(part));
      });
      if (!heading && !sentence) {
        report({
          file: file.path,
          line: 1,
          message: 'No policy on AI-assisted contributions: say whether they\'re accepted, what to disclose, and who answers for them',
        });
      }
    },
  },
  {
    id: 'agents/exists',
    level: 'info',
    summary: 'The repository has an `AGENTS.md` at its root, the instruction file most coding agents read',
    check({ project, report }) {
      if (!project.agents.some((agent) => agent.path === 'AGENTS.md')) {
        report({ file: 'AGENTS.md', line: 1, message: 'No AGENTS.md: add one that points agents to the rules and the checks to run' });
      }
    },
  },
  {
    id: 'agents/single-source',
    level: 'warning',
    summary: 'A root `CLAUDE.md` or `GEMINI.md` is a symbolic link to `AGENTS.md`, or imports it with `@AGENTS.md`: a mention in a sentence loads nothing',
    check({ project, report }) {
      for (const file of project.agents) {
        if (!['CLAUDE.md', '.claude/CLAUDE.md', 'GEMINI.md'].includes(file.path)) continue;
        if (file.symlink) {
          if (!/(^|\/)AGENTS\.md$/.test(file.symlink)) {
            report({ file: file.path, line: 1, message: `This symbolic link targets ${file.symlink}, not AGENTS.md` });
          }
          continue;
        }
        // Claude Code and Gemini CLI load another file only through an import: a mention in prose loads nothing.
        // An import is relative to the file that holds it.
        const wanted = file.path === '.claude/CLAUDE.md' ? '@../AGENTS.md' : '@AGENTS.md';
        const pattern = file.path === '.claude/CLAUDE.md' ? /(^|\s)@\.\.\/AGENTS\.md\b/m : /(^|\s)@(\.\/)?AGENTS\.md\b/m;
        if (!pattern.test(file.source)) {
          const hasShared = project.agents.some((agent) => agent.path === 'AGENTS.md');
          report({
            file: file.path,
            line: 1,
            message: hasShared
              ? `This file doesn't import AGENTS.md: write \`${wanted}\` here, or replace this file with a symbolic link`
              : `Only one tool reads this file: move the instructions every agent needs to an AGENTS.md, and write \`${wanted}\` here`,
          });
        }
      }
    },
  },
  {
    id: 'agents/legacy-file',
    level: 'info',
    summary: 'The repository has no `.cursorrules` or `.windsurfrules`: both tools replaced these files with a rules folder, and read `AGENTS.md`',
    check({ project, report }) {
      for (const file of project.agents) {
        if (file.path === '.cursorrules' || file.path === '.windsurfrules') {
          report({ file: file.path, line: 1, message: 'This file name is a legacy one: move its content to AGENTS.md, or to the rules folder of the tool' });
        }
      }
    },
  },
  {
    id: 'agents/size',
    level: 'warning',
    summary: 'An `AGENTS.md`, `CLAUDE.md`, or `GEMINI.md` holds at most 200 lines, and an `AGENTS.md` weighs less than 32 KiB with those of its parent folders, the default budget of Codex',
    check({ project, options, report }) {
      const agentsFiles = rootAgents(project).filter((file) => /(^|\/)AGENTS\.md$/.test(file.path));
      for (const file of rootAgents(project)) {
        if (!isMainAgentFile(file)) continue;
        if (/(^|\/)AGENTS\.md$/.test(file.path)) {
          // Codex concatenates the files from the root to the folder it works in.
          const folder = dirname(file.path) === '.' ? '' : `${dirname(file.path)}/`;
          const chain = agentsFiles.filter((other) => folder.startsWith(dirname(other.path) === '.' ? '' : `${dirname(other.path)}/`));
          const bytes = chain.reduce((sum, other) => sum + other.bytes, 0);
          if (bytes > 32 * 1024) {
            report({ file: file.path, line: 1, message: `${Math.round(bytes / 1024)} KiB with the AGENTS.md of its parent folders: Codex stops loading instructions beyond 32 KiB by default` });
          }
        }
        if (file.lineCount > options.maxAgentLines) {
          report({
            file: file.path,
            line: options.maxAgentLines + 1,
            message: `${file.lineCount} lines, over the limit of ${options.maxAgentLines}: move the details to the guides it links to`,
          });
        }
      }
    },
  },
  {
    id: 'agents/emphasis',
    level: 'info',
    summary: 'An agent instruction file states its rules plainly: at most three words in capitals such as `IMPORTANT`, `NEVER`, or `MUST`',
    check({ project, options, report }) {
      for (const file of rootAgents(project)) {
        const hits = [];
        file.doc.lines.forEach((line, index) => {
          // The marker of a callout, such as `> [!WARNING]`, isn't emphasis.
          if (file.doc.kinds[index] !== 'prose' || /^\s*>\s*\[!/.test(line)) return;
          for (const match of line.matchAll(/\b(IMPORTANT|CRITICAL|MUST|NEVER|ALWAYS|MANDATORY|WARNING|DO NOT)\b/g)) hits.push({ line: index + 1, word: match[0] });
        });
        if (hits.length > options.maxEmphasis) {
          const extra = hits[options.maxEmphasis];
          report({
            file: file.path,
            line: extra.line,
            message: `${hits.length} words in capitals such as "${extra.word}": when everything is emphasized, nothing is. State each rule and its reason plainly`,
          });
        }
      }
    },
  },
  {
    id: 'agents/personal-files',
    level: 'warning',
    summary: 'Personal instruction files, such as `CLAUDE.local.md`, `AGENTS.local.md`, or `.claude/settings.local.json`, aren\'t committed',
    check({ project, report }) {
      if (!project.committed) return;
      for (const path of project.committed) {
        if (/(^|\/)(CLAUDE\.local\.md|AGENTS\.local\.md|\.claude\/settings\.local\.json)$/.test(path)) {
          report({ file: path, line: 1, message: 'This file holds personal preferences: remove it from Git and add it to .gitignore' });
        }
      }
    },
  },
  {
    id: 'agents/checks',
    level: 'warning',
    summary: '`AGENTS.md` gives the commands that check a change, or links to the CONTRIBUTING section that does',
    check({ project, report }) {
      const file = project.agents.find((agent) => agent.path === 'AGENTS.md' && !agent.alias);
      if (!file) return;
      const hasCommand =
        file.doc.codeBlocks.some((block) => RUNNABLE.has(block.lang)) ||
        file.doc.lines.some((line, index) => file.doc.kinds[index] === 'prose' && inlineCodeSpans(line).some((span) => /\s/.test(span.text) || /^(make|just|task|pytest|tox|nox|rake|mage|ninja|bazel|ctest)$/.test(span.text)));
      const linksToGuide = file.doc.links.some((link) => /contributing/i.test(link.url));
      if (!hasCommand && !linksToGuide) {
        report({
          file: file.path,
          line: 1,
          message: 'No command and no link to CONTRIBUTING: tell agents which checks prove that a change is done',
        });
      }
    },
  },
];
