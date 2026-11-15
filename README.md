# Better README

Better README helps maintainers and their coding agents write the README, CONTRIBUTING, and `AGENTS.md` files of a repository. It provides rules, a checker, and an agent skill.

These files have four readers: users, developers, contributors, and coding agents.

The project provides:

- [`RULES.md`](./RULES.md): 55 rules a script checks, and 27 rules to review by hand
- [`bin/betterreadme.mjs`](./bin/betterreadme.mjs): the checker, which reports each finding with a file and a line
- [`SKILL.md`](./SKILL.md): an [agent skill](https://agentskills.io/) to audit, fix, or write these files
- [`templates/`](./templates/): the outline of each file

## Status

Better README is at version 0.1.0. It has no package on a registry: clone [its repository](https://github.com/davlgd/better-readme) to use it.

It has no automatic fix, no hook, and no action for a continuous integration service.

## What it adds, and what it doesn't

A handful of checked rules compare the documentation with the repository, which Markdown linters don't do:

- A documented task exists in its manifest
- A path written in the text exists
- The license named is the license held
- A paragraph isn't copied between files

About fifteen more tell whether the files a reader looks up exist, with the expected sections. The reviewed rules are the other half: questions for what only a reader can judge, with the evidence each answer needs.

The other checked rules overlap with tools that do more:

- [markdownlint](https://github.com/DavidAnson/markdownlint) for the syntax
- [lychee](https://lychee.cli.rs/) for the links and the anchors
- [Vale](https://vale.sh/) for the style
- [agnix](https://github.com/agent-sh/agnix) and [skillsaw](https://github.com/stbenjam/skillsaw) for agent files

They're here so that one command gives a first answer without a toolchain. Keep these tools when a project has them. [`RULES.md`](./RULES.md#out-of-scope) lists what Better README leaves to them.

The checker reads the form of a command and never runs it. It can't tell whether a sentence is true. A repository that passes is free of the mistakes a script can see: that doesn't make it well documented.

On ten repositories tried during the reviews, the rules that compare text and repository found little. Most findings were about missing files and sections.

## Requirements

The checker needs [Node.js](https://nodejs.org/) 22 or later, and no dependency.

It calls Git, when the repository uses it, to list the files and to know which ones are committed or ignored. It turns off the hooks and the file monitor of the repository for these calls.

## Installation

Clone the repository:

```bash
git clone https://github.com/davlgd/better-readme.git
cd better-readme
```

## Usage

Run the checker from this folder. With a dot, it checks Better README itself:

```bash
node bin/betterreadme.mjs .
```

This run reads the README, CONTRIBUTING, `AGENTS.md`, and `SKILL.md`. It leaves out `RULES.md`, the outlines, and `research/`, which quote what the rules forbid.

Replace the dot with the path of another repository to check it. The checker prints the findings by file, with their line, their level, and their rule. For example, for a repository with three problems:

```text
CONTRIBUTING.md
   12  error    `npm run check` runs "check", which package.json doesn't declare  consistency/commands-exist

README.md
    9  warning  Remove the `$` prompt so the block can be pasted and run, and move any output to a separate `text` block  code/no-prompt
   31  error    `./docs/setup.md` targets a file that doesn't exist: check the path and its letter case  links/relative-exists

Checked README.md, CONTRIBUTING.md, AGENTS.md: 2 error(s), 1 warning(s), 0 info(s)
```

The checker reads the README, the CONTRIBUTING file, and the agent instruction files of the repository. [`RULES.md`](./RULES.md#agent-instruction-files) lists these files, in the root, in subfolders, and in the rule folders of each tool.

The checker never:

- Changes a file
- Uses the network
- Runs a command that the repository documents or defines

A first run on an existing repository reports what it lacks before what's wrong in its text: a CONTRIBUTING file, a security policy. Decide once which of these the project wants, and turn the others off in the [configuration](#configuration).

### Options

| Option | Effect |
| --- | --- |
| `--format json` | Prints a JSON report on the standard output, for scripts and agents |
| `--fail-on warning` | Sets the lowest level that fails the run: `error`, the default, `warning`, or `info` |
| `--config ci.json` | Reads the configuration from this file, relative to the current folder |
| `--list-rules` | Prints every checked rule with its default level |
| `--version` | Prints the version |

Without `--config`, the checker reads the `.betterreadme.json` of the checked repository. With `--format json`, `--list-rules` also prints the reviewed rules and the options.

The exit code tells the result:

- `0`: no finding reaches the failing level
- `1`: a finding reaches it
- `2`: the invocation or the configuration is wrong, or the checker itself fails

In a continuous integration job, run the checker with `--fail-on warning` to block a change that adds one.

The JSON report holds the version of the checker, the files it read, and the findings. Each finding has a `rule`, a `level`, a `file`, a `line`, and a `message`. A finding about a missing file names the file to create, with line 1.

### Use it from a coding agent

The repository is an agent skill named `better-readme`. Its [`SKILL.md`](./SKILL.md) tells an agent how to:

- Investigate a repository
- Write its entry documents
- Audit them with the checker
- Review what a script can't decide

Link the folder into the skills folder of the agent, under the name of the skill. A clone already has this name.

For Claude Code:

```bash
mkdir -p "$HOME/.claude/skills" && ln -sfn "$PWD" "$HOME/.claude/skills/better-readme"
```

For Codex, which reads the skills of `~/.agents/skills/`:

```bash
mkdir -p "$HOME/.agents/skills" && ln -sfn "$PWD" "$HOME/.agents/skills/better-readme"
```

Then ask the agent to audit or write the README of a project. An agent without skills can follow [`RULES.md`](./RULES.md) and run the checker itself. Other agents aren't documented here.

One agent tried the skill on two repositories, twice:

- Most of what it wrote came from reading the code, not from the skill
- The reviewed rules found the errors the checker couldn't
- `review/accuracy` confirmed few commands when the agent wasn't allowed to run them

## Configuration

A `.betterreadme.json` file at the root of the checked repository sets three things:

- `rules`: the level of a rule, or `off`
- `options`: the thresholds
- `include`: other files to check

```json
{
  "rules": {
    "structure/line-wrap": "off",
    "agents/size": "error"
  },
  "options": {
    "maxAgentLines": 150
  },
  "include": ["docs/contributing"]
}
```

The checker rejects a configuration that holds:

- An unknown key other than `$schema`
- An unknown rule, or a value of the wrong type
- An `include` path that doesn't exist in the repository, or is a symbolic link

### Check other files

`include` lists Markdown files, or folders. The checker reads every Markdown file of a folder, subfolders included, and doesn't follow symbolic links. The last line of the output lists the files it read.

These files get the rules about structure, code blocks, links, consistency, secrets, hidden characters, and style. A comment addressed to an agent is reported there too.

Five file names also get the rules of agent instruction files, such as `security/unsafe-instruction`: `SKILL.md`, `AGENTS.md`, `AGENTS.override.md`, `CLAUDE.md`, and `GEMINI.md`.

### Thresholds

| Option | Default | Meaning |
| --- | --- | --- |
| `maxAgentLines` | `200` | Lines an agent instruction file can hold |
| `maxCallouts` | `2` | Callouts, such as `> [!NOTE]`, a file can hold |
| `maxEmphasis` | `3` | Words in capitals, such as `IMPORTANT`, an agent instruction file can hold |
| `maxHeadingLength` | `60` | Characters a heading can hold |
| `maxParagraphWords` | `80` | Words a paragraph can hold |
| `maxReadmeLines` | `500` | Lines a README can hold |
| `maxSentenceWords` | `25` | Words a sentence can hold |
| `minDescriptionWords` | `5` | Words the description under the README title needs |
| `wrap` | `none` | `none` keeps a paragraph on one line, `any` accepts wrapped prose |

### Silence a rule

A comment silences a rule where the text is right as it stands.

It applies to the next line, to a range, or to the whole file:

```markdown
<!-- betterreadme-disable-next-line style/time-bound -->
The API is currently in beta.

<!-- betterreadme-disable code/no-placeholder -->
<!-- betterreadme-enable code/no-placeholder -->

<!-- betterreadme-disable-file structure/line-wrap -->
```

Three limits apply:

- Without a rule name, a comment silences every rule it can, errors included: name the rules
- A comment that names an unknown rule, or uses another word than these four, is an error
- A comment can't silence a `security/` rule: only the configuration turns one off

## How the rules were built

The rules draw on about 105 sources:

- Specifications
- Platform documentation
- Empirical studies
- Policies of open source projects

The notes in [`research/`](./research/) summarize them.

Several rounds of adversarial reviews then tested the rules, the checker, and the facts.

## Support

Ask a question or report a problem in the [issues](https://github.com/davlgd/better-readme/issues) of the repository.

## Contributing

Read the [contributing guidelines](./CONTRIBUTING.md) before you change a rule or the checker. Coding agents follow [AGENTS.md](./AGENTS.md).

## License

Better README is available under the [Apache License 2.0](./LICENSE).
