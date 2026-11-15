// Discovers what a repository contains: its documentation files, the commands its
// manifests declare, and the files it tracks. Rules read this model, never the disk.

import { execFileSync } from 'node:child_process';
import { lstatSync, readFileSync, readdirSync, readlinkSync, statSync } from 'node:fs';
import { dirname, join, normalize, relative, resolve, sep } from 'node:path';

import { parseMarkdown } from './markdown.mjs';

// GitHub displays the first README it finds in this order.
const README_DIRS = ['.github', '', 'docs'];
const CONTRIBUTING_DIRS = ['.github', '', 'docs'];
// Instruction files at fixed paths, which coding agents load for the whole repository.
const ROOT_AGENT_FILES = [
  'AGENTS.md',
  'AGENTS.override.md',
  'CLAUDE.md',
  '.claude/CLAUDE.md',
  'GEMINI.md',
  '.github/copilot-instructions.md',
  '.cursorrules',
  '.windsurfrules',
];
// Folders of rule files, with the file names each tool reads there.
const AGENT_RULE_DIRS = [
  ['.cursor/rules', /\.mdc$/i],
  ['.claude/rules', /\.md$/i],
  ['.github/instructions', /\.instructions\.md$/i],
  ['.windsurf/rules', /\.md$/i],
  ['.devin/rules', /\.md$/i],
];
const NESTED_AGENT_FILE = /(^|\/)(AGENTS|AGENTS\.override|CLAUDE|GEMINI)\.md$/;
const SKIPPED_DIRS = new Set(['node_modules', 'vendor', 'third_party', 'target', 'dist', 'build', 'out', '.git']);
// Folders whose instruction files belong to other projects, or are test data.
const FOREIGN_DIR = /(^|\/)(node_modules|vendor|third_party|fixtures|__fixtures__|testdata|test-data|examples?|templates?)\//;
const LICENSE_FILE = /^(?:[a-z0-9.]+[-_])?(licen[cs]e|copying|unlicense)(?:[-_.][\w.-]*)?$/i;
const CODE_EXTENSION = /\.(c?[jt]sx?|mjs|py|rb|go|rs|sh|json|ya?ml|toml|lock)$/i;

// Recognizes a license from the first lines of its file, as an SPDX identifier.
const LICENSE_SIGNATURES = [
  ['MIT-0', /MIT No Attribution/i],
  ['MIT', /\bMIT License\b|Permission is hereby granted, free of charge/i],
  ['Apache-2.0', /Apache License\s+Version 2\.0/i],
  ['AGPL-3.0', /GNU AFFERO GENERAL PUBLIC LICENSE\s+Version 3/i],
  ['LGPL-3.0', /GNU LESSER GENERAL PUBLIC LICENSE\s+Version 3/i],
  ['LGPL-2.1', /GNU LESSER GENERAL PUBLIC LICENSE\s+Version 2\.1/i],
  ['GPL-3.0', /GNU GENERAL PUBLIC LICENSE\s+Version 3/i],
  ['GPL-2.0', /GNU GENERAL PUBLIC LICENSE\s+Version 2/i],
  ['MPL-2.0', /Mozilla Public License,? Version 2\.0/i],
  ['BSD-3-Clause', /Redistribution and use in source and binary forms[\s\S]*Neither the name/i],
  ['BSD-2-Clause', /Redistribution and use in source and binary forms/i],
  ['ISC', /\bISC License\b|Permission to use, copy, modify, and\/or distribute this software/i],
  ['Unlicense', /This is free and unencumbered software released into the public domain/i],
  ['CC0-1.0', /CC0 1\.0 Universal/i],
  ['BSL-1.0', /Boost Software License - Version 1\.0/i],
  ['EUPL-1.2', /EUROPEAN UNION PUBLIC LICENCE v\. ?1\.2/i],
];

function isFile(path) {
  try {
    return statSync(path).isFile();
  } catch {
    return false; // missing, broken symbolic link, or unreadable
  }
}

function isDir(path) {
  try {
    return statSync(path).isDirectory();
  } catch {
    return false;
  }
}

function listDir(path) {
  try {
    return readdirSync(path);
  } catch {
    return [];
  }
}

function findFile(root, dirs, pattern) {
  for (const dir of dirs) {
    const name = listDir(join(root, dir)).find((entry) => pattern.test(entry) && isFile(join(root, dir, entry)));
    if (name) return join(dir, name);
  }
  return null;
}

function readText(path) {
  try {
    return readFileSync(path, 'utf8');
  } catch {
    return null;
  }
}

function readJson(path) {
  const text = readText(path);
  if (text == null) return null;
  try {
    const value = JSON.parse(text);
    return value && typeof value === 'object' ? value : null;
  } catch {
    return null;
  }
}

// The configuration of a repository can name programs that Git runs, such as a file system
// monitor or hooks: every call turns them off, so reading a repository never runs its code.
const SAFE_GIT = ['-c', 'core.fsmonitor=false', '-c', 'core.hooksPath=/dev/null', '-c', 'core.untrackedCache=false'];

function git(root, args) {
  try {
    return execFileSync('git', [...SAFE_GIT, '-C', root, ...args], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
      maxBuffer: 256 * 1024 * 1024,
      env: { ...process.env, GIT_OPTIONAL_LOCKS: '0', GIT_TERMINAL_PROMPT: '0' },
    });
  } catch {
    return null; // not a Git repository, or Git isn't installed
  }
}

function miseFileTasks(folder, prefix, tasks) {
  if (!isDir(folder)) return;
  for (const entry of listDir(folder)) {
    // A file named `_default` in a folder is the task that carries the name of the folder.
    if (/^_default(\.[^.]+)?$/.test(entry) && prefix) {
      tasks.add(prefix.slice(0, -1));
      continue;
    }
    const name = prefix + entry.replace(/\.[^.]+$/, '');
    if (isDir(join(folder, entry))) miseFileTasks(join(folder, entry), `${name}:`, tasks);
    else tasks.add(name);
  }
}

/** Collects the task names each task runner of the repository declares. */
function readCommands(root) {
  /** @type {Record<string, Set<string>|null>} */
  const commands = { npm: null, make: null, just: null, mise: null, task: null, composer: null, deno: null };
  // Runners whose manifest can declare tasks this scan can't see.
  const lenient = new Set();

  const pkg = readJson(join(root, 'package.json'));
  if (pkg) commands.npm = new Set(Object.keys(pkg.scripts ?? {}));

  const makefile = readText(join(root, 'Makefile')) ?? readText(join(root, 'makefile')) ?? readText(join(root, 'GNUmakefile'));
  if (makefile != null) {
    commands.make = new Set();
    for (const match of makefile.matchAll(/^([A-Za-z0-9_.%/-]+(?:[ \t]+[A-Za-z0-9_.%/-]+)*)[ \t]*:(?!=)/gm)) {
      match[1].split(/\s+/).forEach((target) => commands.make.add(target));
    }
    // Included makefiles, pattern rules, and targets built from variables.
    if (/^-?include\s/m.test(makefile) || /^[^\n#:=]*[%$][^\n:=]*:(?!=)/m.test(makefile)) lenient.add('make');
  }

  const justfile = readText(join(root, 'justfile')) ?? readText(join(root, 'Justfile')) ?? readText(join(root, '.justfile'));
  if (justfile != null) {
    commands.just = new Set();
    for (const match of justfile.matchAll(/^@?([A-Za-z_][A-Za-z0-9_-]*)(?:[ \t]+[^:\n]*)?:(?!=)/gm)) commands.just.add(match[1]);
    for (const match of justfile.matchAll(/^alias[ \t]+([A-Za-z_][A-Za-z0-9_-]*)[ \t]*:=/gm)) commands.just.add(match[1]);
    if (/^(import|mod)\b/m.test(justfile)) lenient.add('just');
  }

  const mise = readText(join(root, 'mise.toml')) ?? readText(join(root, '.mise.toml'));
  const miseTasks = new Set();
  for (const dir of ['mise-tasks', '.mise/tasks', '.mise-tasks', '.config/mise/tasks']) miseFileTasks(join(root, dir), '', miseTasks);
  if (mise != null || miseTasks.size > 0) {
    commands.mise = miseTasks;
    for (const match of (mise ?? '').matchAll(/^\[tasks\.(?:"([^"]+)"|'([^']+)'|([A-Za-z0-9_:-]+))\]/gm)) {
      commands.mise.add(match[1] ?? match[2] ?? match[3]);
    }
    const table = /^\[tasks\]\s*\n((?:(?!\[).*\n?)*)/m.exec(mise ?? '');
    if (table) {
      for (const match of table[1].matchAll(/^(?:"([^"]+)"|'([^']+)'|([A-Za-z0-9_:-]+))\s*=/gm)) {
        commands.mise.add(match[1] ?? match[2] ?? match[3]);
      }
    }
    for (const match of (mise ?? '').matchAll(/^alias\s*=\s*(.+)$/gm)) {
      for (const alias of match[1].matchAll(/["']([^"']+)["']/g)) commands.mise.add(alias[1]);
    }
    if (/^\[task_config\]|^includes\s*=/m.test(mise ?? '')) lenient.add('mise');
  }

  const taskfile = readText(join(root, 'Taskfile.yml')) ?? readText(join(root, 'Taskfile.yaml'));
  if (taskfile != null) {
    commands.task = new Set();
    const tasks = /^tasks:\s*\n((?:(?:[ \t]+.*|\s*)\n?)*)/m.exec(taskfile);
    if (tasks) {
      const indent = /^([ \t]+)\S/m.exec(tasks[1])?.[1] ?? '  ';
      for (const match of tasks[1].matchAll(new RegExp(`^${indent}["']?([A-Za-z0-9_:.-]+)["']?:`, 'gm'))) commands.task.add(match[1]);
      for (const match of tasks[1].matchAll(/^\s+aliases:\s*\[([^\]]*)\]/gm)) {
        match[1].split(',').forEach((alias) => commands.task.add(alias.trim().replace(/^["']|["']$/g, '')));
      }
      if (/^\s+aliases:\s*$/m.test(tasks[1])) lenient.add('task');
    }
    if (/^includes:/m.test(taskfile)) lenient.add('task');
  }

  const composer = readJson(join(root, 'composer.json'));
  if (composer) commands.composer = new Set(Object.keys(composer.scripts ?? {}));

  const deno = readJson(join(root, 'deno.json')) ?? readJson(join(root, 'deno.jsonc'));
  // `deno task` also runs the scripts of package.json.
  if (deno) commands.deno = new Set([...Object.keys(deno.tasks ?? {}), ...(commands.npm ?? [])]);

  return { commands, lenient, pkg };
}

function licenseOfFile(path) {
  const text = readText(path);
  if (!text) return null;
  const head = text.slice(0, 4000);
  return LICENSE_SIGNATURES.find(([, pattern]) => pattern.test(head))?.[0] ?? null;
}

/** Reads the license and the publication target the manifests declare. */
function readManifests(root, pkg) {
  const declared = [];
  let registry = null;
  let isPrivate = false;
  if (pkg) {
    if (typeof pkg.license === 'string') declared.push({ manifest: 'package.json', license: pkg.license });
    // "private" only keeps a package off the npm registry: it says nothing about the license.
    if (pkg.private !== true && pkg.name) registry = 'npm';
  }
  const cargo = readText(join(root, 'Cargo.toml'));
  if (cargo != null) {
    const license = /^license\s*=\s*"([^"]+)"/m.exec(cargo);
    if (license) declared.push({ manifest: 'Cargo.toml', license: license[1] });
    if (/^\[package\]/m.test(cargo) && !/^publish\s*=\s*false/m.test(cargo)) registry = 'crates.io';
  }
  const pyproject = readText(join(root, 'pyproject.toml'));
  if (pyproject != null) {
    const license = /^license\s*=\s*"([^"]+)"/m.exec(pyproject) ?? /^license\s*=\s*\{\s*text\s*=\s*"([^"]+)"/m.exec(pyproject);
    if (license) declared.push({ manifest: 'pyproject.toml', license: license[1] });
    if (/^\[project\]/m.test(pyproject)) registry = 'PyPI';
  }
  const composer = readJson(join(root, 'composer.json'));
  if (composer && typeof composer.license === 'string') declared.push({ manifest: 'composer.json', license: composer.license });
  if (declared.some(({ license }) => /^(UNLICENSED|proprietary)$/i.test(license.trim()))) isPrivate = true;
  return { declared, registry, isPrivate };
}

/** Returns the `owner/name` of the GitHub repository, from the Git remote or the manifest. */
function githubSlug(root, pkg) {
  const manifest = typeof pkg?.repository === 'string' ? pkg.repository : pkg?.repository?.url;
  const url = git(root, ['remote', 'get-url', 'origin'])?.trim() || manifest;
  const match = /github\.com[:/]([^/\s]+)\/([^/\s]+?)(?:\.git)?\/?$/.exec(url ?? '');
  return match ? `${match[1]}/${match[2]}`.toLowerCase() : null;
}

/** Lists the files of the repository that Git doesn't ignore, or walks the tree without Git. */
function listFiles(root) {
  const out = git(root, ['ls-files', '-z', '--cached', '--others', '--exclude-standard']);
  if (out != null) return { files: out.split('\0').filter(Boolean), fromGit: true };
  // Without Git, honor the folders the root .gitignore names, and stay shallow.
  const ignored = new Set(
    (readText(join(root, '.gitignore')) ?? '')
      .split(/\r?\n/)
      .map((line) => line.trim().replace(/^\//, '').replace(/\/$/, ''))
      .filter((line) => line && !line.startsWith('#') && !/[*?!]/.test(line)),
  );
  const files = [];
  const walk = (dir, depth) => {
    for (const entry of listDir(join(root, dir))) {
      const path = dir ? `${dir}/${entry}` : entry;
      if (ignored.has(path) || ignored.has(entry)) continue;
      let stat;
      try {
        stat = lstatSync(join(root, path));
      } catch {
        continue;
      }
      if (stat.isDirectory()) {
        if (depth < 4 && !SKIPPED_DIRS.has(entry)) walk(path, depth + 1);
      } else {
        files.push(path);
      }
    }
  };
  walk('', 0);
  return { files, fromGit: false };
}

function loadDocument(root, path, role) {
  const absolute = join(root, path);
  if (!isFile(absolute)) return null;
  let symlink = null;
  try {
    if (lstatSync(absolute).isSymbolicLink()) symlink = readlinkSync(absolute);
  } catch {
    return null;
  }
  const source = readText(absolute);
  if (source == null) return null;
  const doc = parseMarkdown(source);
  // A final newline doesn't start a line.
  const lineCount = doc.lines.length - (doc.lines.at(-1) === '' ? 1 : 0);
  const target = symlink ? relative(root, resolve(dirname(absolute), symlink)) : null;
  return { path, role, source, symlink, target, alias: false, bytes: Buffer.byteLength(source), lineCount, doc };
}

/**
 * Builds the model of a repository.
 * @param {string} root
 * @param {{include?: string[]}} [options]
 */
export function loadProject(root, options = {}) {
  root = resolve(root);
  const { files, fromGit } = listFiles(root);

  const readmePath = findFile(root, README_DIRS, /^readme(\.(md|markdown|mdown))?$/i);
  const otherReadme = readmePath ? null : findFile(root, README_DIRS, /^readme\.(rst|txt|adoc|asciidoc|org)$/i);
  const contributingPath = findFile(root, CONTRIBUTING_DIRS, /^contributing(\.(md|markdown))?$/i);

  const agentPaths = ROOT_AGENT_FILES.filter((file) => isFile(join(root, file)));
  for (const [dir, pattern] of AGENT_RULE_DIRS) {
    for (const file of files) if (file.startsWith(`${dir}/`) && pattern.test(file)) agentPaths.push(file);
  }
  for (const file of files) {
    if (NESTED_AGENT_FILE.test(file) && file.includes('/') && !FOREIGN_DIR.test(file) && !agentPaths.includes(file)) agentPaths.push(file);
  }

  const guidePaths = [];
  const missingIncludes = [];
  for (const entry of options.include ?? []) {
    const path = normalize(entry).replace(/\/$/, '');
    const absolute = resolve(root, path);
    let isLink = false;
    try {
      isLink = lstatSync(absolute).isSymbolicLink();
    } catch {
      // missing: reported below
    }
    // A symbolic link can lead out of the repository: it's refused like a path that doesn't exist.
    if (isLink || (absolute !== root && !absolute.startsWith(root + sep)) || (!isDir(absolute) && !isFile(absolute))) {
      missingIncludes.push(entry);
    } else if (isDir(join(root, path))) {
      // A folder is read with its subfolders: skills live one level down, in `skills/<name>/SKILL.md`.
      const walk = (dir, depth) => {
        for (const name of listDir(join(root, dir))) {
          const entry = join(dir, name);
          // A symbolic link can loop, or lead to another repository: the walk doesn't follow it.
          let link = true;
          try {
            link = lstatSync(join(root, entry)).isSymbolicLink();
          } catch {
            // unreadable: skipped like a link
          }
          if (link) continue;
          if (isDir(join(root, entry))) {
            if (depth < 4 && !SKIPPED_DIRS.has(name)) walk(entry, depth + 1);
          } else if (/\.(md|markdown)$/i.test(name)) {
            guidePaths.push(entry);
          }
        }
      };
      walk(path, 0);
    } else {
      guidePaths.push(path);
    }
  }

  const documents = new Map();
  const add = (path, role) => {
    if (!path || documents.has(path)) return;
    const document = loadDocument(root, path, role);
    if (document) documents.set(path, document);
  };
  add(readmePath, 'readme');
  add(contributingPath, 'contributing');
  agentPaths.forEach((path) => add(path, 'agent'));
  // A skill is an instruction file too, and so is an agent file of a folder that is skipped by default: once named, both get the rules of agent files.
  guidePaths.forEach((path) => add(path, /(^|\/)(SKILL|AGENTS|AGENTS\.override|CLAUDE|GEMINI)\.md$/.test(path) ? 'agent' : 'guide'));
  // A symbolic link to a file that is checked anyway is an alias: it's read once.
  for (const document of documents.values()) document.alias = Boolean(document.target && documents.has(document.target));

  const { commands, lenient, pkg } = readCommands(root);
  const manifests = readManifests(root, pkg);
  const licenseFiles = listDir(root).filter((entry) => LICENSE_FILE.test(entry) && !CODE_EXTENSION.test(entry) && isFile(join(root, entry)));
  if (isDir(join(root, 'LICENSES'))) licenseFiles.push('LICENSES');

  // Names of each folder, as written on disk: macOS and Windows ignore the case, Linux and GitHub don't.
  const listings = new Map();
  const exists = (path) => {
    const absolute = resolve(root, path);
    if (absolute !== root && !absolute.startsWith(root + sep)) return null; // outside the repository
    let current = root;
    for (const segment of relative(root, absolute).split(sep).filter(Boolean)) {
      if (!listings.has(current)) listings.set(current, new Set(listDir(current)));
      if (!listings.get(current).has(segment)) return false;
      current = join(current, segment);
    }
    return true;
  };

  let ignored = null;
  const asked = new Map();
  const byRole = (role) => [...documents.values()].filter((document) => document.role === role);
  return {
    root,
    readme: readmePath ? (documents.get(readmePath) ?? null) : null,
    otherReadme,
    contributing: contributingPath ? (documents.get(contributingPath) ?? null) : null,
    agents: byRole('agent'),
    get documents() {
      return [...documents.values()].filter((document) => document && document.role !== 'linked');
    },
    missingIncludes,
    readmes: ['.github', ''].map((dir) => findFile(root, [dir], /^readme(\.(md|markdown|mdown|rst|txt|adoc))?$/i)).filter(Boolean),
    contributings: CONTRIBUTING_DIRS.map((dir) => findFile(root, [dir], /^contributing(\.(md|markdown))?$/i)).filter(Boolean),
    licenseFiles,
    licenseFamilies: licenseFiles.map((file) => licenseOfFile(join(root, file))).filter(Boolean),
    declaredLicenses: manifests.declared,
    isPrivate: manifests.isPrivate,
    registry: manifests.registry,
    github: githubSlug(root, pkg),
    // Names under which a reader may have cloned the repository.
    names: new Set([root.split(sep).pop(), pkg?.name, githubSlug(root, pkg)?.split('/')[1]].filter(Boolean).map((name) => name.toLowerCase())),
    hasSecurityPolicy: Boolean(findFile(root, ['', '.github', 'docs'], /^security(\.(md|txt))?$/i)),
    hasAiPolicy: Boolean(findFile(root, ['', '.github', 'docs'], /^ai[-_](policy|usage|contributions?)(\.md)?$/i)),
    commands,
    lenientRunners: lenient,
    pkg,
    files: new Set(files),
    committed: fromGit ? (git(root, ['ls-files', '-z'])?.split('\0').filter(Boolean) ?? null) : null,
    exists,
    isDirectory: (path) => exists(path) === true && isDir(resolve(root, path)),
    /** Tells whether Git ignores a path, which then holds generated or local files. */
    isIgnored(path) {
      if (!fromGit) return false;
      // One call lists what Git ignores, as files and as whole folders.
      ignored ??= (git(root, ['ls-files', '-z', '--others', '--ignored', '--exclude-standard', '--directory']) ?? '').split('\0').filter(Boolean);
      if (ignored.some((entry) => (entry.endsWith('/') ? `${path}/`.startsWith(entry) : entry === path))) return true;
      // A file that doesn't exist isn't listed: ask Git about it, a limited number of times.
      if (!asked.has(path) && asked.size < 50) asked.set(path, git(root, ['check-ignore', '--', path]) != null);
      return asked.get(path) ?? false;
    },
    /** Loads another Markdown file of the repository, to check the anchors a link targets. */
    document(path) {
      const key = relative(root, resolve(root, path));
      if (!documents.has(key)) documents.set(key, loadDocument(root, key, 'linked'));
      return documents.get(key);
    },
  };
}
