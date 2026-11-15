// Rules that apply to every documentation file: structure, code blocks, links, and style.

import { dirname, join, normalize } from 'node:path';

import { plainText, proseLines, wordCount } from '../markdown.mjs';

const RUNNABLE = new Set(['bash', 'sh', 'shell', 'zsh']);
// A marker that stands for the content: alone on its line, opening it, or after a colon.
// `TBD` always does. A sentence that only mentions a marker, such as "add a TODO", doesn't.
const PLACEHOLDER =
  /^\W*(TODO|FIXME)\b\s*[:.!]?\s*$|^\W*(TODO|FIXME)\s*:|:\s*(TODO|FIXME)\b|\bTBD\b|^Project name$|\bReplace each comment with content\b|\blorem ipsum\b|\bcoming soon\b|\bunder construction\b|\bto be (written|completed|documented|defined)\b/i;
const VAGUE_LINK = /^(here|click here|this|this link|link|this page|read more|more|see here)$/i;
const FILLER =
  /\b(please note|note that|keep in mind|feel free to|basically|simply|just|obviously|straightforward|easily|of course|needless to say|as you (may|might|probably) know)\b/gi;
const TIME_BOUND =
  /\b(soon|currently|for now|not yet|recently|upcoming|in the (near )?future|at the moment|as of (this writing|now|today)|nowadays|brand[- ]new)\b/gi;

// Characters that render as nothing, or reorder the text, whatever surrounds them.
const ALWAYS_HIDDEN =
  /[\u034F\u115F\u1160\u180E\u200B\u2028\u2029\u202A-\u202E\u2060-\u2064\u2066-\u2069\u3164\uFEFF\uFFA0]|[\u{E0000}-\u{E007F}\u{E0100}-\u{E01EF}]/u;
// Scripts whose spelling uses the zero-width joiner and non-joiner.
const JOINING_SCRIPT = /[\p{Script=Arabic}\p{Script=Devanagari}\p{Script=Bengali}\p{Script=Gurmukhi}\p{Script=Gujarati}\p{Script=Tamil}\p{Script=Telugu}\p{Script=Kannada}\p{Script=Malayalam}\p{Script=Sinhala}\p{Script=Khmer}\p{Script=Myanmar}]/u;
const RIGHT_TO_LEFT = /[\p{Script=Arabic}\p{Script=Hebrew}\p{Script=Syriac}\p{Script=Thaana}]/u;
const EMOJI_PART = /[\p{Extended_Pictographic}\p{Emoji_Modifier}\uFE0F]/u;

const SECRET =
  /\bgh[pousr]_[A-Za-z0-9]{36}\b|\bgithub_pat_[A-Za-z0-9_]{40,}\b|\bsk-(?:ant-|proj-)?[A-Za-z0-9_-]{32,}\b|\bsk_live_[A-Za-z0-9]{20,}\b|\bAKIA[0-9A-Z]{16}\b|\bAIza[0-9A-Za-z_-]{35}\b|\bnpm_[A-Za-z0-9]{36}\b|\bxox[baprs]-[A-Za-z0-9-]{20,}\b|\bglpat-[A-Za-z0-9_-]{20,}\b|\beyJ[A-Za-z0-9_-]{10,}\.eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}|-----BEGIN [A-Z ]*PRIVATE KEY-----/;
const HTML_TAG = /^<(a|b|i|p|br|hr|em|ul|ol|li|h[1-6]|div|span|html|head|body|title|table|thead|tbody|tr|td|th|pre|code|img|strong|script|style|form|input|button|label|select|option|svg|path|nav|main|section|article|header|footer|iframe|link|meta)>$/i;
const UNSAFE =
  /(?:curl|wget)\b[^|\n]*\|\s*(?:sudo\s+(?:-\S+\s+)*)?(?:ba|z|da)?sh\b|\beval\s+["']?\$\(\s*(?:curl|wget)\b|\b(?:iwr|irm|Invoke-WebRequest|Invoke-RestMethod)\b[^|\n]*\|\s*(?:iex|Invoke-Expression)\b|(?:curl|wget)\b[^|\n]*\|\s*(?:sudo\s+)?python3?\s*(?:-\s*)?(?=[`'")]|$)|\b(?:ba|z)?sh\s+(?:-c\s+["']?\$\(|<\()\s*(?:curl|wget)\b|--dangerously-[a-z-]+|--yolo\b|\bbypassPermissions\b|\bdanger-full-access\b|\b(?:ANTHROPIC|OPENAI)_(?:BASE_URL|API_BASE)\b|\bautoApprove\b|--no-verify\b/;
// A line that forbids something names it too.
// A sentence that forbids an option names it. Each branch ties the prohibition to the option by position:
// a negative verb that runs up to it, "forbidden to <verb>" that runs up to it, or a word such as "avoid" right before it.
// A passive about something else ("prompts aren't allowed, run with x") doesn't forbid the option that follows.
// Between the verb and the option, no other code span may close: "don't use `a` on main, use `b`" forbids `a` only.
const UP_TO_OPTION = String.raw`(?:[^.;!?\x60]|\x60(?=[^\x60]*$))*`;
const NEGATION = String.raw`(?:never|don't|do not|must not|mustn't|must never|shouldn't|should not|should never|cannot|can't)`;
const FORBIDDEN_VERBS = String.raw`(?:use|run|pass|add|set|call|invoke|enable|execute|type|commit|push|merge|rebase|pipe|download|install|bypass|skip|disable|start|launch)`;
const PROHIBITION = new RegExp(
  [
    String.raw`\b${NEGATION}\s+(?:ever\s+)?${FORBIDDEN_VERBS}\b${UP_TO_OPTION}$`,
    String.raw`\b(?:forbidden|prohibited|not allowed|not permitted|never allowed)\s+to\s+(?:ever\s+)?${FORBIDDEN_VERBS}\b${UP_TO_OPTION}$`,
    String.raw`\b${NEGATION}\s+be\s+(?:used|run|started|launched|invoked|called|passed|set)\b${UP_TO_OPTION}$`,
    String.raw`(?<!\b(?:nothing|nobody|no one|never)\s)\b(?:avoid|forbid|forbids|forbidden|prohibit|prohibits|prohibited|refuse|refrain from)(?:\s+(?:using|passing|running|setting|the))?\s*:?\s*[\x60'"(]*$`,
    String.raw`(?:^|[\s(])no\s*[\x60'"]*$`,
  ].join('|'),
  'i',
);
const UNSAFE_ALL = new RegExp(UNSAFE.source, 'g');
const SECRET_ALL = new RegExp(SECRET.source, 'g');
const COLON_PROHIBITION =
  /\b(?:never|don't|do not|must not|mustn't|shouldn't|should not|should never)\s+(?:ever\s+)?(?:(?:use|run|pass|add|set|call|invoke|execute|type|do)(?:\s+(?:this|these|that|those|the following|it|them)(?:\s+[\w-]+){0,2})?|pipe\b[^.;!?:]*)\s*:\s[^.;!?:]*$/i;
// The comments of tools that lint or format Markdown, which hold rule names only.
const TOOL_COMMENT =
  /^\s*(?:betterreadme-(?:disable-next-line|disable-file|disable|enable)|markdownlint-(?:disable-next-line|disable-line|disable-file|enable-file|disable|enable|capture|restore)|textlint-(?:disable|enable)|prettier-ignore(?:-start|-end)?|vale (?:off|on)|vale [A-Za-z]+\.[A-Za-z]+ = (?:YES|NO)|cspell:(?:disable|enable)[\w-]*)(?:[\s,]+(?:\*|[A-Z]{2,}\d+|[a-z]+(?:-[a-z]+)+|[a-z]+\/[a-z-]+))*\s*$/;
// What a comment addressed to an agent looks like, in a file that isn't an instruction file.
const ADDRESSED_TO_AGENT =
  /\bignore (all |any |the )?(previous|prior|above) (instructions?|rules?|prompts?)|\bsystem prompt\b|\bas an? (ai|assistant|agent|llm)\b|\b(agents?|assistants?|AI|LLMs?|claude|codex|copilot|cursor|gemini|chatgpt)\b[^.!?\n]{0,40}\b(must|should|shall|always|never|also|please|run|execute|add|send|push|ignore|do not|don't)\b|\bwithout (telling|asking|informing|notifying) the (user|maintainers?|reviewers?)\b|\bdo not (tell|mention|reveal|inform)\b/i;

const eachDocument = (project) => project.documents.filter((file) => !file.alias);

/** Blanks what stands between double quotes: a quoted word is mentioned, not used. */
const unquoted = (text) => text.replace(/"[^"\n]{1,80}"|\u201C[^\u201D\n]{1,80}\u201D/g, (match) => ' '.repeat(match.length));

function codePoint(character) {
  return `U+${character.codePointAt(0).toString(16).toUpperCase().padStart(4, '0')}`;
}

/** Finds the passwords in the addresses of remote services, such as a database. */
function urlPasswords(line) {
  const found = [];
  for (const match of line.matchAll(/:\/\/([^/\s:@`'"]+):([^/\s:@`'"]{8,})@(\[[^\]]+\]|[\w.-]+)/g)) {
    const [, user, password, host] = match;
    // The default credentials of a local service aren't a secret.
    if (/^(localhost|127\.0\.0\.1|\[::1\])$/i.test(host) || !host.includes('.') || password === user) continue;
    // Private addresses and internal names hold development services.
    if (/^(10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)|\.(internal|local|localhost|test|lan|svc|cluster\.local)$/i.test(host)) continue;
    if (/(.)\1{5,}|example|your|password|secret|changeme|\.{3}|[<>${}]/i.test(password)) continue;
    found.push({ text: `${user}:${password}`, index: match.index });
  }
  return found;
}

/** Finds the first character of a line that a reader can't see and that the text doesn't need. */
function findHidden(line) {
  const always = ALWAYS_HIDDEN.exec(line);
  const characters = [...line];
  let column = 0;
  let found = null;
  for (let index = 0; index < characters.length && !found; index++) {
    const character = characters[index];
    const previous = characters[index - 1] ?? '';
    const next = characters[index + 1] ?? '';
    if (character === '\u200C' || character === '\u200D') {
      const spelling = JOINING_SCRIPT.test(previous) && JOINING_SCRIPT.test(next);
      const emoji = character === '\u200D' && EMOJI_PART.test(previous) && EMOJI_PART.test(next);
      if (!spelling && !emoji) found = { character, column: column + 1 };
    } else if ((character === '\u200E' || character === '\u200F' || character === '\u061C') && !RIGHT_TO_LEFT.test(line)) {
      found = { character, column: column + 1 };
    }
    column += character.length;
  }
  if (always && (!found || always.index + 1 < found.column)) return { character: always[0], column: always.index + 1 };
  return found;
}

export default [
  {
    id: 'structure/heading-levels',
    level: 'warning',
    summary: 'Heading levels go down one at a time: a level 2 is followed by a level 3, never a level 4',
    check({ project, report }) {
      for (const file of eachDocument(project)) {
        let previous = 0;
        for (const heading of file.doc.headings) {
          if (previous > 0 && heading.level > previous + 1) {
            report({
              file: file.path,
              line: heading.line,
              message: `"${heading.plain}" is a level ${heading.level} under a level ${previous}: use a level ${previous + 1}`,
            });
          }
          previous = heading.level;
        }
      }
    },
  },
  {
    id: 'structure/heading-unique',
    level: 'warning',
    summary: 'Two headings of a file never share the same text, so each anchor stays stable',
    check({ project, report }) {
      for (const file of eachDocument(project)) {
        const seen = new Map();
        for (const heading of file.doc.headings) {
          const key = heading.plain.toLowerCase();
          if (!key) continue;
          if (seen.has(key)) {
            report({
              file: file.path,
              line: heading.line,
              message: `"${heading.plain}" repeats the heading of line ${seen.get(key)}: its anchor gets a numeric suffix that breaks when a section moves`,
            });
          } else {
            seen.set(key, heading.line);
          }
        }
      }
    },
  },
  {
    id: 'structure/heading-text',
    level: 'info',
    summary: 'A heading is short plain text: no trailing punctuation, no emoji, and at most 60 characters',
    check({ project, options, report }) {
      for (const file of eachDocument(project)) {
        for (const heading of file.doc.headings) {
          if (heading.html) continue;
          const problems = [];
          if (/[.:;,!]$/.test(heading.plain)) problems.push('ends with punctuation');
          if (/\p{Extended_Pictographic}/u.test(heading.plain)) problems.push('contains an emoji, which changes its anchor');
          if (heading.plain.length > options.maxHeadingLength) problems.push(`has more than ${options.maxHeadingLength} characters`);
          if (problems.length > 0) {
            report({ file: file.path, line: heading.line, message: `"${heading.plain}" ${problems.join(', and ')}` });
          }
        }
      }
    },
  },
  {
    id: 'structure/line-wrap',
    level: 'info',
    summary: 'A paragraph stays on one line: the editor wraps it, and editing a sentence never reflows the lines around it',
    check({ project, options, report }) {
      if (options.wrap !== 'none') return;
      for (const file of eachDocument(project)) {
        const wrapped = file.doc.paragraphs.filter((paragraph) => {
          if (paragraph.lines.length < 2) return false;
          // Rows of badges or images aren't prose.
          if (paragraph.lines.every((line) => line.replace(/!?\[(?:[^\][]|\[[^\]]*\])*\]\([^)]*\)/g, '').trim() === '')) return false;
          return paragraph.lines.slice(0, -1).some((line) => !/(\\| {2,}|<br\s*\/?>)$/.test(line));
        });
        // One finding per file: a project either wraps its prose or doesn't.
        if (wrapped.length > 0) {
          report({
            file: file.path,
            line: wrapped[0].line,
            message: `${wrapped.length === 1 ? 'This paragraph is' : `${wrapped.length} paragraphs are`} hard-wrapped${wrapped.length === 1 ? '' : ', the first one here'}: keep each on one line, or set the "wrap" option to "any"`,
          });
        }
      }
    },
  },
  {
    id: 'structure/callouts',
    level: 'info',
    summary: 'A file holds at most two callouts, such as `> [!NOTE]`: beyond that, readers stop noticing them',
    check({ project, options, report }) {
      for (const file of eachDocument(project)) {
        const callouts = proseLines(file.doc).filter(([, text]) => /^\s*>\s*\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]/i.test(text));
        if (callouts.length > options.maxCallouts) {
          report({
            file: file.path,
            line: callouts[options.maxCallouts][0],
            message: `${callouts.length} callouts, over the limit of ${options.maxCallouts}: keep them for what readers risk if they skip it, and move the rest to the text`,
          });
        }
      }
    },
  },
  {
    id: 'structure/final-newline',
    level: 'warning',
    summary: 'A file ends with exactly one newline character',
    check({ project, report }) {
      for (const file of eachDocument(project)) {
        if (file.source.length === 0) continue;
        if (!file.source.endsWith('\n')) {
          report({ file: file.path, line: file.doc.lines.length, message: 'The file doesn\'t end with a newline character' });
        } else if (/\n\s*\n$/.test(file.source)) {
          report({ file: file.path, line: file.doc.lines.length - 1, message: 'The file ends with blank lines: keep one newline character' });
        }
      }
    },
  },
  {
    id: 'content/no-placeholder',
    level: 'warning',
    summary: 'No leftover placeholder outside headings: `TBD`, a `TODO` or `FIXME` that stands for the content, or a phrase such as "coming soon" or "lorem ipsum"',
    check({ project, report }) {
      for (const file of eachDocument(project)) {
        for (const [line, text] of proseLines(file.doc)) {
          // A section named after a marker, such as a list of tasks, is content.
          if (/^ {0,3}#{2,6}\s/.test(text)) continue;
          const match = PLACEHOLDER.exec(unquoted(text).replace(/^\s*(?:[-*+>]|\d+[.)]|#)\s*/, ''));
          if (match) {
            report({
              file: file.path,
              line,
              message: `"${match[0].trim()}" is a placeholder: write the content, or remove the section and track the work in an issue`,
            });
          }
        }
      }
    },
  },
  {
    id: 'code/fence-closed',
    level: 'error',
    summary: 'Every fenced code block is closed',
    check({ project, report }) {
      for (const file of eachDocument(project)) {
        for (const block of file.doc.codeBlocks) {
          if (!block.closed) {
            report({ file: file.path, line: block.line, message: 'This code block is never closed: the rest of the file renders as code' });
          }
        }
      }
    },
  },
  {
    id: 'code/unread',
    level: 'warning',
    summary: 'The checker can read every line: no `<pre>` block left open, and no line of more than 20,000 characters, 600 backticks, or 600 opening brackets',
    check({ project, report }) {
      for (const file of eachDocument(project)) {
        if (file.doc.unclosedPre) {
          report({ file: file.path, line: file.doc.unclosedPre, message: 'This `<pre>` block is never closed: the checker reads nothing after it' });
        }
        for (const line of file.doc.skipped) {
          report({ file: file.path, line, message: 'This line is too long or too dense to be prose: the checker doesn\'t read it. Move the data to a file' });
        }
      }
    },
  },
  {
    id: 'code/language',
    level: 'warning',
    summary: 'Every fenced code block declares its language: `bash` for commands, `text` for output, or the format of a file',
    check({ project, report }) {
      for (const file of eachDocument(project)) {
        for (const block of file.doc.codeBlocks) {
          if (block.closed && !block.lang) {
            report({
              file: file.path,
              line: block.line,
              message: 'This code block has no language: use `bash` for commands, `text` for output, or the format of the file',
            });
          }
        }
      }
    },
  },
  {
    id: 'code/no-prompt',
    level: 'warning',
    summary: 'A `bash`, `sh`, `shell`, or `zsh` block holds commands only, without a `$` prompt, so it runs when pasted',
    check({ project, report }) {
      for (const file of eachDocument(project)) {
        for (const block of file.doc.codeBlocks) {
          if (!RUNNABLE.has(block.lang)) continue;
          const offset = block.content.findIndex((line) => /^\s*\$ \S/.test(line));
          if (offset >= 0) {
            report({
              file: file.path,
              line: block.line + 1 + offset,
              message: 'Remove the `$` prompt so the block can be pasted and run, and move any output to a separate `text` block',
            });
          }
        }
      }
    },
  },
  {
    id: 'code/no-placeholder',
    level: 'warning',
    summary: 'A `bash`, `sh`, `shell`, or `zsh` block runs as written: no `<placeholder>`, which the shell reads as a redirection, and no `[optional]` argument',
    check({ project, report }) {
      for (const file of eachDocument(project)) {
        for (const block of file.doc.codeBlocks) {
          if (!RUNNABLE.has(block.lang)) continue;
          let heredoc = null;
          block.content.forEach((line, offset) => {
            if (heredoc) {
              if (line.trim() === heredoc) heredoc = null;
              return;
            }
            const opening = /<<-?\s*['"]?([A-Za-z_][A-Za-z0-9_]*)['"]?/.exec(line);
            if (opening) heredoc = opening[1];
            if (/^\s*#/.test(line)) return;
            // Single-quoted strings and trailing comments hold text, not arguments.
            const code = line.replace(/'[^']*'/g, "''").replace(/\s#\s.*$/, '');
            const angle = /<[A-Za-z](?:[A-Za-z0-9_ .:-]*[A-Za-z0-9_])?>/.exec(code.replace(/<<-?\s*['"]?\w+['"]?/, ''));
            const bracket = /(?<=\s)\[(?:-{1,2}[A-Za-z][^\]]*|[A-Za-z][A-Za-z0-9_|-]*)\](?=\s|$)/.exec(code);
            // An HTML tag in a string, and a range of characters such as [a-z], are real shell.
            const match = (angle && !HTML_TAG.test(angle[0]) ? angle : null) ?? (bracket && !/^\[\w-\w\]$/.test(bracket[0]) ? bracket : null);
            if (match) {
              report({
                file: file.path,
                line: block.line + 1 + offset,
                message:
                  match === angle
                    ? `\`${match[0]}\` is a placeholder that the shell reads as a redirection: use a realistic value or an environment variable`
                    : `\`${match[0]}\` marks an optional argument, which the shell passes as written: show the command without it, and describe the option in the text`,
              });
            }
          });
        }
      }
    },
  },
  {
    id: 'links/relative-exists',
    level: 'error',
    summary: 'Every relative link and image targets a file that exists in the repository, with the same letter case',
    check({ project, report }) {
      for (const file of eachDocument(project)) {
        for (const link of [...file.doc.links, ...file.doc.images]) {
          const target = localTarget(project, file, link.url);
          if (target && target.path !== null && project.exists(target.path) === false) {
            report({ file: file.path, line: link.line, message: `\`${link.url}\` targets a file that doesn't exist: check the path and its letter case` });
          }
        }
      }
    },
  },
  {
    id: 'links/anchor-exists',
    level: 'error',
    summary: 'Every link to a section targets a heading that exists, in the same file or in the Markdown file it names',
    check({ project, report }) {
      for (const file of eachDocument(project)) {
        for (const link of file.doc.links) {
          const target = localTarget(project, file, link.url);
          // `#L10` selects lines of a file, not a section.
          if (!target || !target.fragment || /^L\d+(-L\d+)?$/.test(target.fragment)) continue;
          let anchors;
          if (target.path === null) {
            anchors = file.doc.anchors;
          } else {
            if (!/\.(md|markdown)$/i.test(target.path) || !project.exists(target.path)) continue;
            anchors = project.document(target.path)?.doc.anchors;
          }
          if (!anchors) continue;
          const wanted = target.fragment.toLowerCase();
          if (![...anchors].some((anchor) => anchor.toLowerCase() === wanted)) {
            report({ file: file.path, line: link.line, message: `\`${link.url}\` targets a section that doesn't exist` });
          }
        }
      }
    },
  },
  {
    id: 'links/image-alt',
    level: 'warning',
    summary: 'Every image has an alternative text, which screen readers and agents read instead of the image',
    check({ project, report }) {
      for (const file of eachDocument(project)) {
        for (const image of file.doc.images) {
          if (image.alt === null || (!image.html && image.alt.trim() === '')) {
            report({ file: file.path, line: image.line, message: `The image \`${image.url}\` has no alternative text` });
          }
        }
      }
    },
  },
  {
    id: 'links/text',
    level: 'warning',
    summary: 'A link text names its destination: never "here", "this link", or a bare "link"',
    check({ project, report }) {
      for (const file of eachDocument(project)) {
        for (const link of file.doc.links) {
          if (link.kind !== 'html' && VAGUE_LINK.test(link.text.trim())) {
            report({ file: file.path, line: link.line, message: `The link text "${link.text}" doesn't name its destination` });
          }
        }
      }
    },
  },
  {
    id: 'links/https',
    level: 'warning',
    summary: 'External links use HTTPS, except for local addresses',
    check({ project, report }) {
      for (const file of eachDocument(project)) {
        for (const link of [...file.doc.links, ...file.doc.images]) {
          if (/^http:\/\/(?!localhost\b|127\.|0\.0\.0\.0|\[::1\]|[^/]*\.(localhost|test|local|internal)\b)/i.test(link.url)) {
            report({ file: file.path, line: link.line, message: `\`${link.url}\` uses HTTP: link to the HTTPS address` });
          }
        }
      }
    },
  },
  {
    id: 'links/relative-in-repository',
    level: 'info',
    summary: 'A link to a file of the repository is relative, unless the README is published on PyPI, which shows it without the repository',
    check({ project, report }) {
      if (!project.github || project.registry === 'PyPI') return;
      const own = new RegExp(`^https?://github\\.com/${project.github.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}/(?:blob|tree)/(?:main|master|HEAD)/([^?#]+)`, 'i');
      for (const file of eachDocument(project)) {
        for (const link of file.doc.links) {
          const match = own.exec(link.url);
          if (match && project.exists(safeDecode(match[1]))) {
            report({ file: file.path, line: link.line, message: `\`${link.url}\` targets a file of this repository: use a relative link, which also works in a clone, a fork, or a branch` });
          }
        }
      }
    },
  },
  {
    id: 'security/unsafe-instruction',
    level: 'warning',
    summary: 'An agent instruction file never asks to bypass approvals or sandboxing, redirect an API endpoint, or pipe a download to a shell',
    check({ project, report }) {
      for (const file of project.agents.filter((agent) => !agent.alias)) {
        file.doc.lines.forEach((line, index) => {
          // A line is a paragraph: each unsafe pattern it holds is judged on its own clause, and the first one that no prohibition governs is reported.
          for (const match of line.matchAll(UNSAFE_ALL)) {
            // A download from the machine itself isn't a download.
            if (/https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(?=[:/\s`'"|]|$)/.test(match[0])) continue;
            // A colon ends the clause, unless it introduces the code: only a quote and the name of a command may stand between it and the match.
            // A clause also ends at "but", "so", and "yet" after a comma: what follows may grant what the start forbids.
            // In a list, each option shares the verb of the first: "never use `a`, `b`, or `c`".
            const head = line.slice(0, match.index).replace(/(?:\x60[^\x60]*\x60\s*(?:,\s*(?:or|and|nor)?|or|and|nor)\s*)+(\x60?)$/, '$1');
            const before = head.split(/[.;!?]\s|,\s+(?:but|so|yet|however|although|though|except|unless)\b|:\s(?![`'"]*(?:[\w./-]+\s+)*$)/).pop();
            const subject = before;
            const after = line.slice(match.index + match[0].length);
            // Across such a colon, only a verb that takes the code as its object forbids it: "never run this: x", not "never skip this: x".
            const governs = subject.includes(': ') && !/\b(?:forbidden|prohibited)\s*:\s/i.test(subject) ? COLON_PROHIBITION.test(subject) : PROHIBITION.test(subject);
            const forbidden = governs || /^[`'")\s]*(?:flag|option)?\s*(?:(?:is|are)\s+(?:forbidden|prohibited|rejected|discouraged|not allowed|never allowed|not permitted)|(?:isn't|aren't)\s+(?:allowed|permitted)|(?:must|should)(?:n't| not| never) be (?:used|set|passed)|(?:unset|untouched|alone)\b|,? ever\b)/i.test(after);
            if (!forbidden) {
              report({ file: file.path, line: index + 1, message: `\`${match[0]}\` weakens the safeguards of an agent: remove it, and keep such a decision out of a shared file` });
              break;
            }
          }
        });
      }
    },
  },
  {
    id: 'security/secret',
    level: 'error',
    summary: 'No access token, private key, or password in the address of a remote service, even in an example: use a variable name, or a value that is visibly fake',
    check({ project, report }) {
      for (const file of eachDocument(project)) {
        file.doc.lines.forEach((line, index) => {
          // Every candidate of the line is judged: a placeholder mustn't hide the real value that follows it.
          const candidates = [...line.matchAll(SECRET_ALL)]
            .filter((match) => {
              // A key header counts only above a body of key material, not above an ellipsis.
              if (match[0].startsWith('-----BEGIN')) return /^[\s>]*[A-Za-z0-9+/=]{40,}\s*$/.test(file.doc.lines[index + 1] ?? '');
              // Repeated letters, and words such as "example" or "your", mark a value as fake.
              return !/(.)\1{5,}|example|your|token|secret|placeholder|changeme|password|\.{3}|[<>$]/i.test(match[0].replace(/^[a-z]+_|^sk-/i, ''));
            })
            .map((match) => ({ text: match[0], index: match.index }));
          const [first] = [...candidates, ...urlPasswords(line)].sort((a, b) => a.index - b.index);
          if (first) {
            report({ file: file.path, line: index + 1, message: `\`${first.text.slice(0, 12)}\u2026\` looks like a real secret: revoke it if it is one, and replace it with a variable name` });
          }
        });
      }
    },
  },
  {
    id: 'security/hidden-characters',
    level: 'error',
    summary: 'No invisible or bidirectional Unicode character, except where a script or an emoji needs it: it can hide instructions from reviewers but not from agents',
    check({ project, report }) {
      for (const file of eachDocument(project)) {
        file.doc.lines.forEach((line, index) => {
          const hidden = findHidden(line);
          if (hidden) {
            report({
              file: file.path,
              line: index + 1,
              message: `Invisible character ${codePoint(hidden.character)} at column ${hidden.column}: remove it`,
            });
          }
        });
      }
    },
  },
  {
    id: 'security/hidden-comment',
    level: 'warning',
    summary: 'An agent instruction file has no HTML comment, and no other file has a comment addressed to an agent: some agents read what the rendered page hides',
    check({ project, report }) {
      for (const file of eachDocument(project)) {
        for (const comment of file.doc.comments) {
          if (TOOL_COMMENT.test(comment.text)) continue;
          if (file.role === 'agent') {
            report({ file: file.path, line: comment.line, message: 'Comment in an agent instruction file: write the text visibly, or remove it' });
          } else if (ADDRESSED_TO_AGENT.test(comment.text)) {
            report({ file: file.path, line: comment.line, message: 'This comment addresses an agent, out of sight of reviewers: write the text visibly, or remove it' });
          }
        }
      }
    },
  },
  {
    id: 'style/filler',
    level: 'info',
    summary: 'No filler or word that judges the difficulty for the reader, such as "simply", "obviously", or "please note"',
    check({ project, report }) {
      for (const file of eachDocument(project)) {
        for (const [line, text] of proseLines(file.doc)) {
          for (const match of unquoted(text).matchAll(FILLER)) {
            report({ file: file.path, line, message: `Remove "${match[0]}" and go straight to the point` });
          }
        }
      }
    },
  },
  {
    id: 'style/time-bound',
    level: 'info',
    summary: 'The text describes the current state, without words that expire, such as "soon", "currently", or "not yet"',
    check({ project, report }) {
      for (const file of eachDocument(project)) {
        for (const [line, text] of proseLines(file.doc)) {
          for (const match of unquoted(text).matchAll(TIME_BOUND)) {
            report({
              file: file.path,
              line,
              message: `"${match[0]}" ties the text to a moment: describe the current state, and announce changes in the changelog`,
            });
          }
        }
      }
    },
  },
  {
    id: 'style/sentence-length',
    level: 'info',
    summary: 'A sentence of a paragraph or of a list item holds at most 25 words, an inline code span counting as one',
    check({ project, options, report }) {
      for (const file of eachDocument(project)) {
        // An inline code span counts as one word, so a sentence that starts with one is still seen as a sentence.
        const readable = (text) => plainText(text.replace(/<!--.*?-->/g, ' ').replace(/(`+)(?!`)(.+?)(?<!`)\1(?!`)/g, 'Code'));
        const units = file.doc.paragraphs.map((paragraph) => ({ line: paragraph.line, text: readable(paragraph.lines.join(' ')) }));
        file.doc.lines.forEach((line, index) => {
          const item = file.doc.kinds[index] === 'prose' ? /^\s*(?:[-*+]|\d{1,9}[.)])\s+(.*)$/.exec(line) : null;
          if (item) units.push({ line: index + 1, text: readable(item[1]) });
        });
        for (const { line, text } of units.sort((a, b) => a.line - b.line)) {
          for (const sentence of text.split(/(?<=[.!?])["')\]]*\s+(?=[\p{Lu}"'(\[])/u)) {
            const words = wordCount(sentence);
            if (words > options.maxSentenceWords) {
              const start = sentence.trim().split(/\s+/).slice(0, 5).join(' ');
              report({ file: file.path, line, message: `The sentence that starts with "${start}" has ${words} words, over the limit of ${options.maxSentenceWords}: split it, or turn it into a list` });
            }
          }
        }
      }
    },
  },
  {
    id: 'style/paragraph-length',
    level: 'info',
    summary: 'A paragraph holds at most 80 words, inline code aside',
    check({ project, options, report }) {
      for (const file of eachDocument(project)) {
        for (const paragraph of file.doc.paragraphs) {
          const words = wordCount(paragraph.text);
          if (words > options.maxParagraphWords) {
            report({
              file: file.path,
              line: paragraph.line,
              message: `This paragraph has ${words} words, over the limit of ${options.maxParagraphWords}: split it`,
            });
          }
        }
      }
    },
  },
];

/**
 * Resolves a link to a path of the repository and a fragment.
 * Returns null for external links, and a null path for a link to the same file.
 */
export function localTarget(project, file, url) {
  if (!url || /^[a-z][a-z0-9+.-]*:/i.test(url) || url.startsWith('//')) return null;
  const [rawPath, ...rest] = url.split('#');
  const fragment = safeDecode(rest.join('#'));
  const path = safeDecode(rawPath.split('?')[0]);
  if (path === '') return { path: null, fragment };
  const resolved = path.startsWith('/') ? normalize(path.slice(1)) : normalize(join(dirname(file.path), path));
  if (resolved.startsWith('..')) return null; // outside the repository
  return { path: resolved, fragment };
}

function safeDecode(value) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}
