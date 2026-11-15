// A small, dependency-free Markdown scanner. It doesn't build a full syntax tree:
// it extracts what the rules need (headings, fenced code blocks, links, images,
// paragraphs, comments) with their line numbers. It approximates GitHub's rendering
// where it matters, such as heading anchors.

const FENCE = /^(\s*(?:>\s?)*\s*)(`{3,}|~{3,})\s*([^`]*)$/;
const FENCE_END = /^(\s*(?:>\s?)*\s*)(`{3,}|~{3,})\s*$/;
const ATX_HEADING = /^ {0,3}(#{1,6})(?:[ \t]+(.*?))?(?:[ \t]+#+)?[ \t]*$/;
const LIST_ITEM = /^\s*(?:[-*+]|\d{1,9}[.)])\s+/;
const CODE_SPAN = /(`+)(?!`)(.+?)(?<!`)\1(?!`)/g;
// The longest names first: `disable` is a prefix of the two others.
const DIRECTIVE = /<!--\s*betterreadme-([\w-]+)([^>]*?)-->/g;
const ACTIONS = ['disable-next-line', 'disable-file', 'disable', 'enable'];
const URL = String.raw`(<[^>]*>|(?:[^()\s]|\([^()\s]*\))*)`;
const INLINE_IMAGE = new RegExp(String.raw`!\[([^\]]*)\]\(\s*${URL}(?:\s+["'(][^)]*)?\)`, 'g');
const INLINE_LINK = new RegExp(String.raw`(?<!!)\[((?:[^\][]|\[[^\]]*\])*)\]\(\s*${URL}(?:\s+["'(][^)]*)?\)`, 'g');
// Beyond this length, a line is data, not prose: scanning it would only cost time.
const MAX_LINE = 20000;

/** Tells whether a line holds so many delimiters that scanning it would take seconds: it's data, not prose. */
function isDense(line) {
  if (line.length > MAX_LINE) return true;
  if (line.length < 400) return false;
  let ticks = 0;
  let brackets = 0;
  for (const character of line) {
    if (character === '`') ticks++;
    else if (character === '[') brackets++;
  }
  return ticks > 600 || brackets > 600;
}

/** Replaces inline code spans with spaces, so their content is never read as Markdown. */
export function blankInlineCode(line) {
  if (isDense(line)) return line;
  return line.replace(CODE_SPAN, (match) => ' '.repeat(match.length));
}

/** Replaces the HTML comments of a line with spaces: a reader doesn't see them. */
function blankComments(line) {
  return line.replace(/<!--.*?-->/g, (match) => ' '.repeat(match.length));
}

/** Returns the inline code spans of a line, without their backticks. */
export function inlineCodeSpans(line) {
  if (isDense(line)) return [];
  return [...line.matchAll(CODE_SPAN)].map((match) => ({ text: match[2].trim(), column: match.index + 1 }));
}

function decodeEntities(text) {
  return text
    .replace(/&(amp|lt|gt|quot|apos|nbsp);/g, (_, name) => ({ amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' })[name])
    .replace(/&#(\d{1,7});/g, (match, code) => (Number(code) <= 0x10ffff ? String.fromCodePoint(Number(code)) : match));
}

/** Reduces inline Markdown to the text a reader sees. Code spans keep their content as written. */
export function plainText(markdown) {
  let result = '';
  let last = 0;
  const outside = (text) =>
    decodeEntities(
      text
        .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
        .replace(/\[((?:[^\][]|\[[^\]]*\])*)\]\([^)]*\)/g, '$1')
        .replace(/\[([^\]]*)\]\[[^\]]*\]/g, '$1')
        .replace(/<[^>]+>/g, '')
        .replace(/(\*\*|__)(.*?)\1/g, '$2')
        .replace(/(?<![\w*])([*_])(.+?)\1(?![\w*])/g, '$2'),
    );
  for (const match of isDense(markdown) ? [] : markdown.matchAll(CODE_SPAN)) {
    result += outside(markdown.slice(last, match.index)) + match[2];
    last = match.index + match[0].length;
  }
  return (result + outside(markdown.slice(last))).trim();
}

/** Computes heading anchors as GitHub does for common headings, including the suffix of duplicates. */
export function createSlugger() {
  const seen = new Map();
  return (text) => {
    const base = plainText(text)
      .toLowerCase()
      .replace(/[^\p{L}\p{N}\p{M}\p{Pc} -]/gu, '')
      .replace(/ /g, '-');
    let slug = base;
    // A suffixed anchor can collide with a later heading, which then takes the next free one.
    while (seen.has(slug)) {
      const count = seen.get(base) + 1;
      seen.set(base, count);
      slug = `${base}-${count}`;
    }
    seen.set(slug, 0);
    return slug;
  };
}

function directiveIds(raw) {
  return raw.trim().split(/[\s,]+/).filter(Boolean);
}

function extractLinks(text, number, links, images) {
  for (const match of text.matchAll(INLINE_IMAGE)) {
    images.push({ line: number, alt: match[1], url: match[2].replace(/^<|>$/g, ''), html: false });
  }
  for (const match of text.matchAll(INLINE_LINK)) {
    links.push({ line: number, text: plainText(match[1]), url: match[2].replace(/^<|>$/g, ''), kind: 'inline' });
  }
  for (const match of text.matchAll(/<img\b[^>]*>/gi)) {
    const src = /\bsrc\s*=\s*["']([^"']*)["']/i.exec(match[0]);
    const alt = /\balt\s*=\s*["']([^"']*)["']/i.exec(match[0]);
    images.push({ line: number, alt: alt ? alt[1] : null, url: src ? src[1] : '', html: true });
  }
  for (const match of text.matchAll(/<a\b[^>]*\bhref\s*=\s*["']([^"']*)["'][^>]*>/gi)) {
    links.push({ line: number, text: '', url: match[1], kind: 'html' });
  }
  for (const match of text.matchAll(/<(https?:\/\/[^>\s]+)>/g)) {
    links.push({ line: number, text: match[1], url: match[1], kind: 'autolink' });
  }
}

/**
 * Scans a Markdown document.
 * @param {string} source
 */
export function parseMarkdown(source) {
  const lines = source.replace(/^\uFEFF/, '').split(/\r?\n/);
  const headings = [];
  const codeBlocks = [];
  const links = [];
  const images = [];
  const paragraphs = [];
  const comments = [];
  const directives = [];
  const definitions = new Map();
  const references = [];
  const htmlAnchors = new Set();
  /** @type {('prose'|'code'|'frontmatter'|'comment')[]} */
  const kinds = new Array(lines.length).fill('prose');
  // What a reader sees of each prose line: no inline code, no comment.
  const visible = new Array(lines.length).fill('');
  const slug = createSlugger();

  // Rules disabled on each line, by 1-based line number. '*' disables all of them.
  const disabled = new Map();
  const active = new Set();
  const fileWide = new Set();
  const disableOn = (number, ids) => disabled.set(number, new Set([...(disabled.get(number) ?? []), ...ids]));
  const readDirectives = (line, number) => {
    for (const match of line.matchAll(DIRECTIVE)) {
      const [, action, raw] = match;
      const ids = directiveIds(raw);
      const targets = ids.length > 0 ? ids : ['*'];
      directives.push({ line: number, action, ids, unknown: !ACTIONS.includes(action) });
      if (action === 'disable') targets.forEach((id) => active.add(id));
      if (action === 'enable') targets.forEach((id) => (id === '*' ? active.clear() : active.delete(id)));
      if (action === 'disable-file') targets.forEach((id) => fileWide.add(id));
      if (action === 'disable-next-line') disableOn(number + 1, targets);
    }
  };

  let index = 0;
  // Front matter, as static site generators and skills use it.
  if (lines[0] === '---') {
    const end = lines.indexOf('---', 1);
    if (end > 0) {
      for (let i = 0; i <= end; i++) kinds[i] = 'frontmatter';
      index = end + 1;
    }
  }

  const skipped = [];
  let unclosedPre = null;
  let fence = null;
  let pre = false;
  let comment = null;
  let paragraph = null;
  const closeParagraph = () => {
    if (paragraph) paragraphs.push(paragraph);
    paragraph = null;
  };

  for (; index < lines.length; index++) {
    const line = lines[index];
    const number = index + 1;
    if (active.size > 0) disableOn(number, active);

    if (fence) {
      kinds[index] = 'code';
      const closing = FENCE_END.exec(line);
      // A closing fence is indented at most three spaces more than the opening one.
      const closes = closing && closing[2][0] === fence.marker[0] && closing[2].length >= fence.marker.length;
      if (closes && closing[1].replace(/>\s?/g, '').length < fence.indent + 4) {
        fence.block.endLine = number;
        fence.block.closed = true;
        fence = null;
      } else {
        fence.block.content.push(fence.quoted ? line.replace(/^\s*(?:>\s?)+/, '') : line);
      }
      continue;
    }

    if (pre) {
      kinds[index] = 'code';
      if (/<\/pre>/i.test(line)) {
        pre = false;
        unclosedPre = null;
      }
      continue;
    }

    if (comment) {
      kinds[index] = 'comment';
      const end = line.indexOf('-->');
      comment.text += `\n${end >= 0 ? line.slice(0, end) : line}`;
      if (end >= 0) {
        comments.push(comment);
        comment = null;
      }
      continue;
    }

    if (isDense(line)) {
      closeParagraph();
      skipped.push(number);
      continue;
    }

    const opening = FENCE.exec(line);
    if (opening) {
      closeParagraph();
      kinds[index] = 'code';
      const info = opening[3].trim();
      const block = { line: number, endLine: number, info, lang: info.split(/[\s{,]/)[0].toLowerCase(), content: [], closed: false };
      codeBlocks.push(block);
      fence = { marker: opening[2], block, quoted: opening[1].includes('>'), indent: opening[1].replace(/>\s?/g, '').length };
      continue;
    }

    if (/^\s*<pre(\s[^>]*)?>/i.test(line)) {
      closeParagraph();
      kinds[index] = 'code';
      pre = !/<\/pre>/i.test(line);
      if (pre) unclosedPre = number;
      continue;
    }

    const withoutCode = blankInlineCode(line);
    readDirectives(withoutCode, number);
    for (const match of withoutCode.matchAll(/<!--(.*?)-->/g)) comments.push({ line: number, text: match[1] });
    // The Markdown idiom for a comment: a link definition that nothing references.
    const hidden = /^ {0,3}\[[^\]]*\]:\s*(?:#|<>)\s*[("'](.*)[)"']\s*$/.exec(line);
    if (hidden) comments.push({ line: number, text: hidden[1] });
    const text = blankComments(withoutCode);
    const unclosed = text.indexOf('<!--');
    if (unclosed >= 0) {
      comment = { line: number, text: line.slice(unclosed + 4) };
      if (text.slice(0, unclosed).trim() === '') {
        kinds[index] = 'comment';
        closeParagraph();
        continue;
      }
    }
    const shown = unclosed >= 0 ? text.slice(0, unclosed) : text;
    visible[index] = shown;

    for (const match of shown.matchAll(/<[a-z][^>]*\b(?:id|name)\s*=\s*["']([^"']+)["']/gi)) htmlAnchors.add(match[1]);

    // A very long line isn't a heading, and its trailing spaces would cost seconds to scan.
    const heading = line.length < 2000 ? ATX_HEADING.exec(line.trimEnd()) : null;
    if (heading) {
      closeParagraph();
      const title = blankComments(heading[2] ?? '').trim();
      headings.push({ line: number, level: heading[1].length, text: title, plain: plainText(title), slug: slug(title) });
      extractLinks(shown, number, links, images);
      continue;
    }

    // Setext headings: a text line underlined with = or -.
    if (paragraph && paragraph.lines.length === 1 && /^ {0,3}(=+|-+)\s*$/.test(line)) {
      const title = paragraph.lines[0].trim();
      const level = line.trim()[0] === '=' ? 1 : 2;
      headings.push({ line: paragraph.line, level, text: title, plain: plainText(title), slug: slug(title), setext: true });
      paragraph = null;
      continue;
    }

    const definition = /^ {0,3}\[([^\]^][^\]]*)\]:\s*(<[^>]*>|\S+)/.exec(line);
    if (definition) {
      closeParagraph();
      if (!hidden) definitions.set(definition[1].toLowerCase(), { line: number, url: definition[2].replace(/^<|>$/g, '') });
      continue;
    }

    extractLinks(shown, number, links, images);
    // HTML headings, which centered titles with a logo often use.
    const htmlHeading = /<h([1-6])\b[^>]*>(?:(.*?)<\/h\1>)?/i.exec(shown);
    if (htmlHeading) {
      const title = plainText(htmlHeading[2] ?? '');
      headings.push({ line: number, level: Number(htmlHeading[1]), text: title, plain: title, slug: slug(title), html: true });
    }
    for (const match of shown.matchAll(/(!?)\[([^\]]+)\]\[([^\]]*)\]/g)) {
      references.push({ line: number, image: match[1] === '!', text: plainText(match[2]), label: (match[3] || match[2]).toLowerCase() });
    }
    // Shortcut references: [label] alone, resolved later if a definition exists.
    for (const match of shown.matchAll(/(?<![!\]])\[([^\][^][^\][]*)\](?![[(:])/g)) {
      references.push({ line: number, image: false, text: plainText(match[1]), label: match[1].toLowerCase(), shortcut: true });
    }

    const isBlank = shown.trim() === '';
    const isBlock =
      LIST_ITEM.test(line) ||
      /^ {0,3}>/.test(line) ||
      /^\s*\|/.test(line) ||
      /^ {0,3}</.test(line) ||
      /^ {0,3}([-*_])( *\1){2,}\s*$/.test(line) ||
      /^( {4,}|\t)/.test(line);
    if (isBlank || isBlock) {
      closeParagraph();
      continue;
    }
    if (paragraph) {
      paragraph.lines.push(line);
      paragraph.endLine = number;
    } else {
      paragraph = { line: number, endLine: number, lines: [line] };
    }
  }
  closeParagraph();
  if (comment) comments.push(comment);

  for (const reference of references) {
    const target = definitions.get(reference.label);
    if (!target) continue;
    if (reference.image) images.push({ line: reference.line, alt: reference.text, url: target.url, html: false });
    else links.push({ line: reference.line, text: reference.text, url: target.url, kind: 'reference' });
  }
  for (const item of paragraphs) item.text = plainText(item.lines.map((line) => blankComments(blankInlineCode(line))).join(' '));

  const anchors = new Set([...headings.map((heading) => heading.slug), ...htmlAnchors]);
  return { lines, kinds, visible, headings, codeBlocks, links, images, paragraphs, comments, directives, anchors, disabled, fileWide, skipped, unclosedPre };
}

/** Returns what a reader sees of the prose lines of a document, as [number, text] pairs. */
export function proseLines(doc) {
  const result = [];
  doc.lines.forEach((line, index) => {
    if (doc.kinds[index] === 'prose') result.push([index + 1, doc.visible[index]]);
  });
  return result;
}

/** Counts the words of a text. Scripts written without spaces count two characters as a word. */
export function wordCount(text) {
  const unspaced = text.match(/[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Thai}]/gu) ?? [];
  const spaced = text.replace(/[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Thai}]/gu, ' ');
  return (spaced.match(/[\p{L}\p{N}][\p{L}\p{N}'\u2019.-]*/gu) ?? []).length + Math.ceil(unspaced.length / 2);
}
