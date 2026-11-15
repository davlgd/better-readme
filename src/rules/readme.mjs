// Rules about what a README contains and in which order a reader meets it.

import { plainText, wordCount } from '../markdown.mjs';

const START_HEADING =
  /\b(install(ation|ing)?|getting started|get started|quick ?start|usage|use|using|set ?up|how to|run(ning)?|deploy(ment|ing)?|build(ing)?|examples?|development|requirements|prerequisites|commands?|tutorial|demo)\b|(installer|utilis(er|ation)|d\u00E9marr(er|age)|lancer|construire|d\u00E9plo(yer|iement)|exemples?|d\u00E9veloppement|pr\u00E9requis)|(instalaci\u00F3n|instalar|primeros pasos|inicio r\u00E1pido|verwendung|erste schritte|schnellstart|installazione|utilizzo|instala\u00E7\u00E3o)|\buso\b/i;
const SHELL = new Set(['bash', 'sh', 'shell', 'zsh', 'console', 'shell-session', 'sh-session', 'terminal', 'powershell', 'pwsh', 'ps1', 'cmd', 'bat', 'fish']);

/** Removes images, badges, and HTML, which don't describe anything to a text reader. */
function descriptiveText(line) {
  return plainText(
    line
      .replace(/^\s*>\s?/, '')
      .replace(/\[!\[[^\]]*\]\([^)]*\)\]\([^)]*\)/g, '')
      .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
      .replace(/<[^>]+>/g, ''),
  );
}

export default [
  {
    id: 'readme/exists',
    level: 'error',
    summary: 'The repository has a Markdown README at its root, in `.github/`, or in `docs/`: a README in another markup is reported as an `info`, since it isn\'t read',
    check({ project, report }) {
      if (project.readme) return;
      const message = project.otherReadme
        ? `${project.otherReadme} isn't Markdown: Better README only checks Markdown READMEs`
        : 'No README found: add a README.md at the root of the repository';
      // A README in another markup is a valid README that this checker can't read.
      report({ file: project.otherReadme ?? 'README.md', line: 1, message, level: project.otherReadme ? 'info' : undefined });
    },
  },
  {
    id: 'readme/shadowed',
    level: 'warning',
    summary: 'The repository has one README between `.github/` and its root: GitHub displays the one in `.github/` and hides the other',
    check({ project, report }) {
      if (project.readmes.length < 2) return;
      const [shown, ...hidden] = project.readmes;
      for (const path of hidden) {
        report({ file: path, line: 1, message: `GitHub displays ${shown} on the repository page instead of this file: keep one of them` });
      }
    },
  },
  {
    id: 'readme/title',
    level: 'error',
    summary: 'The README starts with one level-1 heading, its title, and has no other',
    check({ project, report }) {
      const readme = project.readme;
      if (!readme) return;
      const { headings } = readme.doc;
      const titles = headings.filter((heading) => heading.level === 1);
      if (titles.length === 0) {
        report({ file: readme.path, line: 1, message: 'No level-1 heading: start the README with `# Project name`' });
        return;
      }
      if (headings[0].level !== 1) {
        report({
          file: readme.path,
          line: headings[0].line,
          message: `The first heading is a level ${headings[0].level}: the level-1 title comes first`,
        });
      }
      for (const extra of titles.slice(1)) {
        report({
          file: readme.path,
          line: extra.line,
          message: `Second level-1 heading "${extra.plain}": keep one title, and use level 2 for sections`,
        });
      }
    },
  },
  {
    id: 'readme/description',
    level: 'error',
    summary: 'A sentence of at least five words, between the title and the first section, says what the project is',
    check({ project, options, report }) {
      const readme = project.readme;
      if (!readme) return;
      const { headings, lines, kinds } = readme.doc;
      const title = headings.find((heading) => heading.level === 1);
      if (!title) return;
      const next = headings.find((heading) => heading.line > title.line);
      const end = next ? next.line - 1 : lines.length;
      for (let index = title.line; index < end; index++) {
        if (kinds[index] !== 'prose') continue;
        const line = lines[index];
        if (/^\s*(\||[-*+]\s|\d+[.)]\s)/.test(line) || /^\s*>\s*\[!/.test(line)) continue;
        if (wordCount(descriptiveText(line)) >= options.minDescriptionWords) return;
      }
      report({
        file: readme.path,
        line: title.line,
        message: `No description under the title: say what the project is, and for whom, in a sentence of at least ${options.minDescriptionWords} words before the first section`,
      });
    },
  },
  {
    id: 'readme/quick-start',
    level: 'warning',
    summary: 'The README has a section to install, run, or use the project, and at least one command in a shell code block',
    check({ project, report }) {
      const readme = project.readme;
      if (!readme) return;
      const { headings, codeBlocks } = readme.doc;
      // The section names are known in English and French only: other languages are left alone.
      const known = /^[\p{Script=Latin}\p{N}\p{P}\p{S}\s]*$/u.test(headings.map((heading) => heading.plain).join(' '));
      if (known && !headings.some((heading) => heading.level > 1 && START_HEADING.test(heading.plain))) {
        report({
          file: readme.path,
          line: 1,
          message: 'No section to get started: add one named after the task, such as "Installation", "Usage", or "Quick start"',
        });
      }
      if (!codeBlocks.some((block) => SHELL.has(block.lang))) {
        report({
          file: readme.path,
          line: 1,
          message: 'No command in a shell code block: show the exact commands to install or run the project in a `bash` block',
        });
      }
    },
  },
  {
    id: 'readme/contributing',
    level: 'warning',
    summary: 'The README links to CONTRIBUTING, or has a section explaining how to contribute',
    check({ project, report }) {
      const readme = project.readme;
      if (!readme) return;
      const { headings, links } = readme.doc;
      if (project.contributing) {
        const linked = links.some((link) => /(^|\/)contributing(\.(md|markdown))?(#.*)?$/i.test(link.url.split('?')[0]));
        if (!linked) {
          report({
            file: readme.path,
            line: 1,
            message: `No link to ${project.contributing.path}: contributors and agents start from the README`,
          });
        }
      } else if (!headings.some((heading) => /contribut/i.test(heading.plain))) {
        report({
          file: readme.path,
          line: 1,
          message: 'Nothing tells how to contribute: add a "Contributing" section, or a CONTRIBUTING.md and a link to it',
        });
      }
    },
  },
  {
    id: 'readme/license',
    level: 'warning',
    summary: 'The README has a sentence or a section about the license of the project',
    check({ project, report }) {
      const readme = project.readme;
      if (!readme) return;
      const { lines, kinds } = readme.doc;
      if (lines.some((line, index) => kinds[index] === 'prose' && /licen[cs]e|copyright|public domain/i.test(line))) return;
      report({
        file: readme.path,
        line: 1,
        message: 'The license isn\'t named: add a "License" section with its name and a link to the license file',
      });
    },
  },
  {
    id: 'readme/agent-instructions',
    level: 'info',
    summary: 'The README or CONTRIBUTING links to the agent instruction file when the repository has one',
    check({ project, report }) {
      const readme = project.readme;
      // A skill, or a rule file of a tool, isn't the entry point of an agent.
      const main = project.agents.find((agent) => agent.path === 'AGENTS.md') ?? project.agents.find((agent) => /^(CLAUDE|GEMINI)\.md$/.test(agent.path));
      if (!readme || !main) return;
      const name = main.path.split('/').pop().toLowerCase();
      const mentioned = [readme, project.contributing]
        .filter(Boolean)
        .some((file) => file.doc.links.some((link) => link.url.toLowerCase().split('#')[0].endsWith(name)));
      if (!mentioned) {
        report({
          file: readme.path,
          line: 1,
          message: `No link to ${main.path}: tell contributors that coding agents have their own entry point`,
        });
      }
    },
  },
  {
    id: 'readme/size',
    level: 'info',
    summary: 'The README holds at most 500 lines, and less than 500 KiB, beyond which GitHub truncates it',
    check({ project, options, report }) {
      const readme = project.readme;
      if (!readme) return;
      const count = readme.lineCount;
      if (readme.bytes > 500 * 1024) {
        report({ file: readme.path, line: 1, message: `${Math.round(readme.bytes / 1024)} KiB: GitHub truncates a README beyond 500 KiB` });
      }
      if (count > options.maxReadmeLines) {
        report({
          file: readme.path,
          line: options.maxReadmeLines + 1,
          message: `${count} lines, over the limit of ${options.maxReadmeLines}: move reference material to docs/ and link to it`,
        });
      }
    },
  },
];
