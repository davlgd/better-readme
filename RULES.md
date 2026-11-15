# Better README rules

These rules describe what the entry documents of a repository hold: its README, its CONTRIBUTING file, and its agent instruction files, such as `AGENTS.md`. They serve four readers: users, developers, contributors, and coding agents.

The rules come in two kinds:

- A script decides the [checked rules](#checked-rules): the [checker](./README.md#usage) reports each of them with a file and a line
- A person or an agent answers the [reviewed rules](#reviewed-rules) with evidence, because they need to read the repository or to run a command

Each rule has an identifier, to name it in a report, a configuration, or a review. What the rules leave out is listed under [out of scope](#out-of-scope).

## Scope

The rules assume a public repository with one project at its root. They assume GitHub, or a forge that renders Markdown the same way. Outside this frame, four limits apply.

**Proprietary projects.** A project needs no license file and no security policy when its manifest declares the license `UNLICENSED` or `proprietary`. The `private` field of `package.json` doesn't count: it only keeps a package off the npm registry.

**Languages.** The rules that look for a section or a subject read English words:

- `readme/quick-start`, which also knows a few words of French, Spanish, German, Italian, and Portuguese
- `readme/contributing` and `readme/license`
- The four `contributing/` rules about content
- The four `style/` rules

`readme/quick-start` stays silent on headings written in another script. On a project documented in another language, these rules give false alarms: turn them off in the configuration.

**Kinds of project.** The rules don't adapt to the kind of project. A library, a command-line tool, an application, and a list of links don't need the same sections. The levels in the configuration are the way to say so.

**Other markups.** A README written in reStructuredText, AsciiDoc, or plain text isn't checked. The checker reads Markdown only, and says so in an `info`.

## Principles

The rules follow seven principles. When no rule covers a case, apply them.

**1. Each reader has an entry point.** A user starts from the README, a contributor from CONTRIBUTING, an agent from `AGENTS.md`. Each file links to the others, so a reader who lands on the wrong one finds the right one.

**2. A fact lives in one file.** The others link to it. Two copies of a command or a convention end up telling different things, and a reader can't know which one is right.

**3. The repository can prove what the documentation says.** A documented task exists in a manifest, a documented path exists in the tree, and a link resolves. Markdown linters and link checkers leave most of this ground to the author.

**4. A command runs as written.** A reader pastes it, and an agent copies it. A prompt, a placeholder, or a missing step breaks it for both.

**5. The text is visible.** What a reviewer can't see in the rendered page, some agents still read. Nothing hides in a comment, an invisible character, or an image without a text equivalent.

**6. The text describes the current state.** Announcements and history belong to a changelog or to release notes. A sentence that says "soon" or "currently" ages with the project, and nothing tells the reader when it stopped being true.

**7. Every line earns its place.** A README is an entry point, not a manual, and agents load their instruction files in every session. What counts is that each line tells something the repository doesn't.

Three measurements stand behind principles 4 and 7.

**Agents copy the documentation.** Vercel and Ora measured it in 2026, on 25 websites. Of the agent answers that held code, 61% reused lines of the documentation they fetched: 73 of 119 runs.

**The evidence on instruction files is thin and mixed.** One controlled study, on Python repositories, found that an instruction file raised the cost of a task by about a fifth. It found no significant change in success, and no measurable effect of the length of the file. Another study, on ten repositories, associates these files with shorter runs. Neither shows that a long file helps.

**An instruction file can be wrong, and agents tend to trust it.** A preprint of October 2026 tried it on 40 synthetic projects. Two agents followed an outdated instruction file rather than the code in 649 of 720 choices. The figure is fragile, the direction is plausible: keep these files short enough to stay true, and check them against the code when it changes.

The preprint also tests a remedy: a sentence that gives precedence to the code. It tests it in the personal file of a user only, so these rules don't ask for it in the file of a project.

## What belongs where

A cell that says "link" means that the file points to the one that holds the content. Projects without a CONTRIBUTING file keep its content in a README section.

| Content | README | CONTRIBUTING | `AGENTS.md` |
| --- | --- | --- | --- |
| What the project is, for whom, and why | Yes | No | No |
| Status, limits, and when not to use it | Yes | No | No |
| Requirements and their versions | Yes | Link | Link |
| Installation, first use, expected result | Yes | Link | Link |
| Local build and tests | Link, or yes without a CONTRIBUTING | Yes, with commands | Link |
| Checks to run before submitting | No | Yes, with commands | Link |
| Commit, sign-off, and pull request conventions | No | Yes | Link |
| Policy on contributions made with AI tools | No | Yes | What applies to the agent itself, or a link |
| What proves a change is done | No | The checks | Yes |
| What the code doesn't tell: generated files, traps | No | Yes when people need it too | Yes, or a link |
| What needs a maintainer's agreement first | No | Yes | Link, plus what is specific to agents |
| Where to ask a question | Yes | The channel for contributors | No |
| How to report a vulnerability | Link to `SECURITY.md` | Link | No |
| Changes between versions | Link to the changelog | No | No |
| License | Yes | No | No |

Two rows are choices of this project, not a consensus.

**Build and test commands.** AGENTS.md's own site suggests keeping them in the agent file, like the documentation of several tools. The table keeps them where people read them too, and has the agent file link there.

**A CONTRIBUTING file.** Some guides want a "Contributing" section in the README instead of a separate file. Both satisfy `readme/contributing`. `contributing/exists` still asks for the file, because GitHub links to it by name when someone opens an issue or a pull request. Turn that rule off in a project that keeps the section.

## Checked rules

The checker reports these rules. A level tells what a finding means:

- `error`: the file is wrong or misleading, and the check fails
- `warning`: a reader loses time or misses information
- `info`: a suggestion to review, which the text can decline

Thresholds, such as 200 lines or 80 words, are defaults that the [configuration](./README.md#thresholds) changes. They're conventions, not measured optimums:

- 200 lines is the target Anthropic gives for `CLAUDE.md`
- 500 KiB and 32 KiB are limits of GitHub and Codex
- The others, such as 25 words a sentence and 80 words a paragraph, are choices of this project

A rule that looks for a section reads its headings. It proves that the section exists, not that it's right: the [reviewed rules](#reviewed-rules) cover the substance.

### README

| Rule | Level | Requirement |
| --- | --- | --- |
| `readme/exists` | error | The repository has a Markdown README at its root, in `.github/`, or in `docs/`: a README in another markup is reported as an `info`, since it isn't read |
| `readme/shadowed` | warning | The repository has one README between `.github/` and its root: GitHub displays the one in `.github/` and hides the other |
| `readme/title` | error | The README starts with one level-1 heading, its title, and has no other |
| `readme/description` | error | A sentence of at least five words, between the title and the first section, says what the project is |
| `readme/quick-start` | warning | The README has a section to install, run, or use the project, and at least one command in a shell code block |
| `readme/contributing` | warning | The README links to CONTRIBUTING, or has a section explaining how to contribute |
| `readme/license` | warning | The README has a sentence or a section about the license of the project |
| `readme/agent-instructions` | info | The README or CONTRIBUTING links to the agent instruction file when the repository has one |
| `readme/size` | info | The README holds at most 500 lines, and less than 500 KiB, beyond which GitHub truncates it |

The guides differ on the order and the names of the sections. Most ask for the same content: what the project does, how to start, how to contribute, and under which license.

A study of 393 READMEs found the purpose of the project in a quarter of them, and its status in a fifth. The review asks for both.

### Structure

| Rule | Level | Requirement |
| --- | --- | --- |
| `structure/heading-levels` | warning | Heading levels go down one at a time: a level 2 is followed by a level 3, never a level 4 |
| `structure/heading-unique` | warning | Two headings of a file never share the same text, so each anchor stays stable |
| `structure/heading-text` | info | A heading is short plain text: no trailing punctuation, no emoji, and at most 60 characters |
| `structure/line-wrap` | info | A paragraph stays on one line: the editor wraps it, and editing a sentence never reflows the lines around it |
| `structure/callouts` | info | A file holds at most two callouts, such as `> [!NOTE]`: beyond that, readers stop noticing them |
| `structure/final-newline` | warning | A file ends with exactly one newline character |
| `content/no-placeholder` | warning | No leftover placeholder outside headings: `TBD`, a `TODO` or `FIXME` that stands for the content, or a phrase such as "coming soon" or "lorem ipsum" |

Headings are the navigation of a file. Readers scan them, GitHub builds its outline from them, and links target their anchors. An emoji or a duplicate changes an anchor in a way nobody guesses.

`structure/line-wrap` reports once per file. It follows a convention that not every project shares: set the `wrap` option to `any` in a project that wraps its prose.

### Code blocks

| Rule | Level | Requirement |
| --- | --- | --- |
| `code/fence-closed` | error | Every fenced code block is closed |
| `code/unread` | warning | The checker can read every line: no `<pre>` block left open, and no line of more than 20,000 characters, 600 backticks, or 600 opening brackets |
| `code/language` | warning | Every fenced code block declares its language: `bash` for commands, `text` for output, or the format of a file |
| `code/no-prompt` | warning | A `bash`, `sh`, `shell`, or `zsh` block holds commands only, without a `$` prompt, so it runs when pasted |
| `code/no-placeholder` | warning | A `bash`, `sh`, `shell`, or `zsh` block runs as written: no `<placeholder>`, which the shell reads as a redirection, and no `[optional]` argument |

A shell reads `<name>` as a redirection, and fails or overwrites a file. Use a realistic value, or an environment variable the text explains.

A block that mixes a prompt, commands, and their output is a transcript. Give it the `console` language, which `code/no-prompt` and `code/no-placeholder` skip. Or split it into a `bash` block and a `text` block.

These rules check the form of a command, not that it works: `review/accuracy` does.

`code/unread` tells where the checker stopped reading. A block left open or a line of data then never hides text from the other rules.

### Links and images

| Rule | Level | Requirement |
| --- | --- | --- |
| `links/relative-exists` | error | Every relative link and image targets a file that exists in the repository, with the same letter case |
| `links/anchor-exists` | error | Every link to a section targets a heading that exists, in the same file or in the Markdown file it names |
| `links/image-alt` | warning | Every image has an alternative text, which screen readers and agents read instead of the image |
| `links/text` | warning | A link text names its destination: never "here", "this link", or a bare "link" |
| `links/https` | warning | External links use HTTPS, except for local addresses |
| `links/relative-in-repository` | info | A link to a file of the repository is relative, unless the README is published on PyPI, which shows it without the repository |

The checker works offline, and doesn't fetch external links: run a link checker such as [lychee](https://lychee.cli.rs/) for them.

It computes anchors the way GitHub does for most headings: on 16 real READMEs, 384 of 394 anchors matched. It can differ on a heading that ends with a comment, or holds an image or a badge. Silence the rule on that line when it does.

It compares paths with their letter case, as GitHub and Linux do, even on a system that ignores it.

### Consistency with the repository

| Rule | Level | Requirement |
| --- | --- | --- |
| `consistency/commands-exist` | error | Every task the documentation runs, such as `npm run lint` or `make test`, is declared in the manifest of its runner |
| `consistency/paths-exist` | info | A path written as inline code, whose first folder exists in the repository, exists too, unless the text says to create it or Git ignores it |
| `consistency/license-matches` | error | The license that a manifest declares, and the one the README names, is a license of the license files |
| `consistency/no-duplication` | warning | A paragraph of 25 words or more lives in one file: the others link to it instead of copying it |
| `project/license` | error | The repository has a license file at its root, such as `LICENSE`, `COPYING`, or a `LICENSES/` folder, unless a manifest declares it `UNLICENSED` or proprietary |
| `project/security-policy` | info | The repository has a `SECURITY.md` telling how to report a vulnerability privately, unless a manifest declares it `UNLICENSED` or proprietary |

**Task runners.** The checker knows the tasks of npm, pnpm, Yarn, Bun, Make, just, Mise, Task, Composer, and Deno, in their `run` form. It doesn't read shorthands such as `yarn lint`.

**Skipped commands.** `consistency/commands-exist` skips:

- A command that targets another package or folder
- The commands that follow a `cd` to another folder than the clone, until the next heading
- A runner that has no manifest at the root

The clone is the folder that a `git clone` of the same block names, or one named after the repository. A folder that doesn't exist also counts as the clone, when the `cd` opens the block.

**Commands in a sentence.** `make`, `just`, and `task` are read as commands only after a verb such as "run" or "use".

**Paths.** `consistency/paths-exist` skips a line that says the path is created, generated, or written.

**License.** `consistency/license-matches` takes the first line of the License section that names a license as the license of the project.

**Duplication.** `consistency/no-duplication` sees word-for-word copies. `review/single-source` covers a fact written twice.

### CONTRIBUTING

| Rule | Level | Requirement |
| --- | --- | --- |
| `contributing/exists` | warning | The repository has a `CONTRIBUTING.md` at its root, in `.github/`, or in `docs/` |
| `contributing/shadowed` | warning | The repository has one CONTRIBUTING file among `.github/`, its root, and `docs/`: GitHub links to the first it finds, in this order |
| `contributing/checks` | warning | CONTRIBUTING has a section about checking a change, with the commands to run in a shell code block |
| `contributing/submit` | warning | CONTRIBUTING has a section about submitting a change: pull request, merge request, or patch |
| `contributing/commits` | info | CONTRIBUTING states the commit message convention |
| `contributing/ai-policy` | info | CONTRIBUTING, or an `AI_POLICY.md` file, has a sentence or a section on contributions made with AI tools: accepted or not, and on which conditions |

Projects disagree on contributions made with AI tools, from a ban to plain acceptance. They disagree on the trailers a commit carries too.

No rule here picks a side. The rule is that the project states its own, because a contributor and their agent can't guess it. `contributing/ai-policy` finds a sentence or a section on the subject, and `review/ai-policy` judges what it says.

### Agent instruction files

These rules apply to the files agents load by themselves:

- `AGENTS.md`, `AGENTS.override.md`, `CLAUDE.md`, and `GEMINI.md`, at the root and in subfolders
- `.claude/CLAUDE.md` and `.github/copilot-instructions.md`
- The rule files in `.claude/rules/`, `.cursor/rules/`, `.github/instructions/`, and `.devin/rules/`
- The rule files in `.windsurf/rules/`, the former name of `.devin/rules/`

Agent settings, hooks, and skills aren't read: see [out of scope](#out-of-scope).

| Rule | Level | Requirement |
| --- | --- | --- |
| `agents/exists` | info | The repository has an `AGENTS.md` at its root, the instruction file most coding agents read |
| `agents/single-source` | warning | A root `CLAUDE.md` or `GEMINI.md` is a symbolic link to `AGENTS.md`, or imports it with `@AGENTS.md`: a mention in a sentence loads nothing |
| `agents/legacy-file` | info | The repository has no `.cursorrules` or `.windsurfrules`: both tools replaced these files with a rules folder, and read `AGENTS.md` |
| `agents/size` | warning | An `AGENTS.md`, `CLAUDE.md`, or `GEMINI.md` holds at most 200 lines, and an `AGENTS.md` weighs less than 32 KiB with those of its parent folders, the default budget of Codex |
| `agents/emphasis` | info | An agent instruction file states its rules plainly: at most three words in capitals such as `IMPORTANT`, `NEVER`, or `MUST` |
| `agents/personal-files` | warning | Personal instruction files, such as `CLAUDE.local.md`, `AGENTS.local.md`, or `.claude/settings.local.json`, aren't committed |
| `agents/checks` | warning | `AGENTS.md` gives the commands that check a change, or links to the CONTRIBUTING section that does |

Tools load these files differently:

- Claude Code, in its recent versions, reads `AGENTS.md` only when no `CLAUDE.md` or `CLAUDE.local.md` exists
- A `CLAUDE.md` that mentions `AGENTS.md` in a sentence loads nothing: it takes an `@AGENTS.md` import, or a symbolic link
- Codex concatenates the files from the root to the working folder, within a budget of 32 KiB by default
- A committed `AGENTS.override.md` replaces the `AGENTS.md` of its folder, for Codex only
- Copilot uses the nearest `AGENTS.md`
- Cursor combines the files of a folder and its parents

No behavior is common to all. A file in a subfolder therefore adds to the root file, and never contradicts it.

An instruction file guides an agent, it doesn't constrain it. A rule that must never break needs a control that enforces it: a hook, a permission, or a check of the continuous integration.

### Security

| Rule | Level | Requirement |
| --- | --- | --- |
| `security/hidden-characters` | error | No invisible or bidirectional Unicode character, except where a script or an emoji needs it: it can hide instructions from reviewers but not from agents |
| `security/hidden-comment` | warning | An agent instruction file has no HTML comment, and no other file has a comment addressed to an agent: some agents read what the rendered page hides |
| `security/unsafe-instruction` | warning | An agent instruction file never asks to bypass approvals or sandboxing, redirect an API endpoint, or pipe a download to a shell |
| `security/secret` | error | No access token, private key, or password in the address of a remote service, even in an example: use a variable name, or a value that is visibly fake |

Instruction files are an attack surface: published attacks hide instructions in them with invisible characters.

**Hidden characters.** The checker reports zero-width characters, except those that Arabic and Indic scripts and emoji sequences need.

**Comments.** Tools differ. Claude Code strips block HTML comments from `CLAUDE.md` before it loads it, and documents them as a place for notes to maintainers. Codex reads them. A file that several tools load can't count on a comment being hidden or read, hence the rule. Turn it off in a project whose instruction files only Claude Code loads.

**Unsafe instructions.** `security/unsafe-instruction` judges each unsafe pattern of a line on its own clause. It exempts one only when a prohibition is tied to it by position:

- A negative verb that runs up to it, as in "never use"
- A word such as "forbidden", right before or after it

**Secrets.** `security/secret` judges each value of a line, so a placeholder doesn't hide a real one. It accepts a value that is visibly fake, and the default credentials of a local or internal service.

**Limits.** These rules catch known patterns, not intent:

- A sentence asking an agent to do harm in plain words passes
- An unsafe option in a sentence built like a prohibition passes
- Link titles and HTML attributes aren't read, only comments and visible text

**Skipped folders.** The rules skip the instruction files of vendored code, test data, examples, and templates. These live in folders such as `vendor/`, `node_modules/`, `fixtures/`, `examples/`, and `templates/`. Naming such a folder in `include` brings them back, with the rules of agent files.

Review a change to these files as a change to the code, and list them in `CODEOWNERS` when the project has one. A comment in the checked file can't silence a `security/` rule: only the configuration can.

### Style

| Rule | Level | Requirement |
| --- | --- | --- |
| `style/filler` | info | No filler or word that judges the difficulty for the reader, such as "simply", "obviously", or "please note" |
| `style/time-bound` | info | The text describes the current state, without words that expire, such as "soon", "currently", or "not yet" |
| `style/sentence-length` | info | A sentence of a paragraph or of a list item holds at most 25 words, an inline code span counting as one |
| `style/paragraph-length` | info | A paragraph holds at most 80 words, inline code aside |

A reader scans a page before reading it. Short sentences and short paragraphs survive the scan. An enumeration reads better as a list than as a long sentence.

These rules don't see the rendered page: `review/rendering` does. For a complete editorial style, add a prose linter such as [Vale](https://vale.sh/).

### Directives

| Rule | Level | Requirement |
| --- | --- | --- |
| `meta/directive` | error | A `betterreadme` directive is one of the four that exist, and names rules that exist, never a `security/` rule, which only the configuration turns off |

## Reviewed rules

A script can't decide these rules. Answer each question with evidence: a line, a command and its result, or the file that contradicts the text.

"Yes" without evidence isn't an answer. "Couldn't verify", with the reason, is one.

### All documents

| Rule | Question | Evidence |
| --- | --- | --- |
| `review/rendering` | On GitHub, does each list item stay on one line, and does no paragraph end with a line of one or two words? | The page measured at a content width of 838 pixels for a README or a CONTRIBUTING, and 1,012 pixels for the other files |
| `review/single-source` | Is each fact written once across the README, CONTRIBUTING, and the instruction files? | Each command or convention that appears in two files, and which one keeps it |

On the page of a repository, GitHub shows the README and the CONTRIBUTING in a column of 838 pixels. It shows a file on its own page in a column of 1,012 pixels. Narrower screens wrap lines differently: measure at these desktop widths.

### README review

| Rule | Question | Evidence |
| --- | --- | --- |
| `review/accuracy` | Does every documented command do what the text says? | Each command compared with the manifests, the workflows, and the code, then run in a clean clone when its owner allows it, with its result |
| `review/unattended` | Does each documented command run without asking a question, or say which answer to give? | Each command that prompts, and the option or the answer that avoids it |
| `review/purpose` | Do the title and the first paragraph tell what the project does, for whom, and why it exists rather than an alternative, in terms a newcomer knows or can look up? | The sentences that answer each of the three, and each term left unexplained |
| `review/first-result` | Does the shortest path lead to a visible result, and does the text show what to expect? | The steps from a clean machine to the result, and the documented output |
| `review/requirements` | Are the required tools named with versions that match the manifests and the continuous integration? | Each version, and the file that declares it |
| `review/names` | Do the title and the install commands use the name under which the project is published, and does the description match the manifest? | The name and the description in the manifest and on the registry |
| `review/status` | Does the README tell the truth about the state of the project: experimental, maintained, deprecated, open to contributions or not? | The stated status, against the date of the last release and the open issues |
| `review/limits` | Does the README say what the project doesn't do, and when not to use it? | The sentence, or the known limit that's missing |
| `review/scope` | Is the README an entry point, with the public interface documented or linked, a link to the full documentation, and the reference material in dedicated pages? | The sections that belong elsewhere, and where |
| `review/support` | Does a reader know who maintains the project, where to ask a question, report a bug, and find the fix of a common problem? | The links |
| `review/text-equivalent` | Is every instruction available as text, never only in an image or a video, and does each alternative text say what the image shows? | Each image that carries information, and the text that repeats it |
| `review/examples` | Do the examples use realistic names and values, and do they run? | The examples run, and any `foo`, `bar`, or `example` to replace |
| `review/community-files` | Does the repository have the files its readers expect, and does the README link to them: changelog, code of conduct, issue and pull request templates, and a `CODEOWNERS` that covers the instruction files? | Each file, or the reason the project does without it |

### CONTRIBUTING review

| Rule | Question | Evidence |
| --- | --- | --- |
| `review/newcomer-path` | Can a newcomer go from a clone to a mergeable pull request with this file and the README alone, and does the file say at its top what must happen first, such as an accepted issue? | The step where they would get stuck |
| `review/checks-match-ci` | Are the documented checks the ones the continuous integration runs, with the same commands? | Each job of the workflows, and the documented command that matches it |
| `review/conventions` | Are the commit, branch, and pull request conventions the ones the history shows? | The last 20 commit subjects and branch names against the stated convention |
| `review/ai-policy` | Does the policy say whether AI-assisted contributions are accepted, what to disclose and where, which commit trailers and sign-off it expects or forbids, who answers for the change, and whether it covers issues, reviews, and security reports? | The sentence for each, or the point the maintainers left open |
| `review/expectations` | Does a contributor know what happens after they submit: who reviews, and when? | The sentence |

### Agent instructions review

| Rule | Question | Evidence |
| --- | --- | --- |
| `review/agents-non-obvious` | Does the file hold only what an agent can't infer from the repository? | Each generic advice, restated README section, or directory listing to remove |
| `review/agents-done` | Does the file tell what proves a change is done? | The list of commands or links |
| `review/agents-boundaries` | Does the file tell what an agent does freely, what it asks first, and what it never does, including on real accounts and with credentials, and the rules of the AI policy that bind the agent itself? | The three lists, and the sentence of the policy each rule comes from |
| `review/agents-current` | Does every instruction still match the code? | Each instruction checked against the file or the command it names |
| `review/agents-enforced` | Is each rule that must never break backed by a control that enforces it? | The hook, the permission, or the job for each of them |
| `review/agents-reviewed` | Has a person verified every line, including those a tool generated? | The author of the last change to the file |
| `review/agents-nested` | Do the instruction files of subfolders add to the root file without contradicting it? | Each pair of statements that conflict |

## Out of scope

The research notes in [`research/`](./research/) list about 120 candidate rules. The table below says, by family, what became of the others.

| Family | Decision | Reason |
| --- | --- | --- |
| External links | Delegated to a link checker | Needs the network; lychee does it well |
| Markdown syntax: list markers, table alignment, bare URLs, inline HTML | Delegated to markdownlint | It has the rules and the fixes |
| Editorial style: voice, tense, word lists, punctuation, spelling | Delegated to Vale | The four `style/` rules are a minimum without a tool, in English only |
| Commit messages | Delegated to commitlint | The rules ask that the convention is stated, not that commits follow it |
| Running the documented commands | Reviewed, `review/accuracy` and `review/unattended` | A checker that runs the commands of a repository it doesn't trust is a risk |
| Line breaks of the rendered page | Reviewed, `review/rendering` | A script doesn't see the page that GitHub renders |
| Tool versions, package name, and description against the manifests | Reviewed, `review/requirements` and `review/names` | Not attempted in this version: each ecosystem writes versions and install commands differently |
| The title against the name of the project | Reviewed, `review/names` | A project name and its title differ legitimately |
| The length of the description, a description that leads with the value for the user | Declined | Not attempted in this version |
| A README left as its generator wrote it | Declined | Would need the text of each generator: `content/no-placeholder` only knows the outlines of this project |
| The license of the README as an SPDX identifier, a restrictive license stated near the top | Partly: `consistency/license-matches` | The rule compares names, and doesn't ask for a format or a position |
| Fixed section names and order, steps written as numbered imperatives | Declined | Guides disagree, and real READMEs use thousands of distinct headings |
| File name in capitals, a README in another markup | Declined | GitHub accepts both; the checker reads Markdown only, and says so |
| Table of contents | Declined | GitHub generates an outline from the headings |
| Badges: number, position, freshness | Declined | Sources disagree, and checking a badge needs the network |
| Screenshots and demos, images hosted outside the repository | Declined | Depends on the kind of project |
| Quality of alternative texts, default ones such as "image" | Reviewed, `review/text-equivalent` | `links/image-alt` checks that the text exists, not what it says |
| Callouts that follow each other or nest, emoji used as bullets, a link text over two lines | Declined | `structure/callouts` counts callouts; the rest wasn't attempted |
| Plain-text readability of the source | Declined | No measure that holds |
| Rendering on npm, PyPI, and crates.io | Partly: `links/relative-in-repository` | Only the relative links of PyPI are handled; markup validity is the job of `twine check` |
| HTML that GitHub strips, images for dark mode | Declined | Not attempted in this version |
| Translations and one README per folder | Declined | No rule that holds across projects |
| Changelog, code of conduct, issue and pull request templates, `CODEOWNERS` | Reviewed, `review/community-files` | The checker asks by name for the three files that GitHub or agents look up to act: CONTRIBUTING, `AGENTS.md`, and `SECURITY.md`. The others inform |
| Maintainers and their contact | Reviewed, `review/support` | No file name that holds across projects |
| Links from the README to the license and the security policy | Partly: `readme/license`, and `review/support` | The rule asks that the license is mentioned, not linked |
| Dates, versions, and model names in instruction files | Partly: `style/time-bound` | The rule knows words, not dates or version numbers |
| Kind of project: library, command line, application, list | Declined | One set of rules, with levels to adjust in the configuration |
| Freshness against releases, documentation linted in the continuous integration, a README written before the code | Declined | Needs the history and the forge, or describes a process that the files don't show |
| Guides linked from the entry documents | Opt-in, with the `include` option | Following links by default wasn't tried: the option names the guides, or their folders, instead |
| Imports in instruction files, such as `@docs/setup.md`: target, depth, files outside the repository | Declined | Only the import of `AGENTS.md` is checked, by `agents/single-source` |
| Procedures that belong in a skill rather than in the instruction file | Reviewed, `review/agents-non-obvious` | A judgment on content |
| Agent settings and hooks, such as `.claude/settings.json` | Declined | Configuration, not documentation, though an attack surface too: dedicated linters such as agnix read them |
| Agent Skills: `SKILL.md` files | Declined | A specification and validators exist for their format. The checker doesn't discover them: a `SKILL.md` named in `include`, or found in a folder named there, gets the rules of agent instruction files, the `security/` ones included. The walk of a folder doesn't follow symbolic links |
| Directives that silence nothing, or a `disable` without its `enable` | Declined | Not attempted in this version: only a directive that names an unknown rule is reported |
| A fix applied by the checker, a baseline of accepted findings, a report in SARIF | Declined | Not attempted in this version |
| `llms.txt` and documentation sites | Declined | Site level, needs the network |
| Trailers, sign-off, and disclosure format of AI-assisted commits, rules of the policy that bind the agent | Reviewed, `review/ai-policy` and `review/agents-boundaries` | Projects forbid what others require |
| Commands that wait for an answer | Reviewed, `review/unattended` | Needs to know each tool |
| A level for each rule that follows the measured effect of breaking it | Declined | No such measure exists: the levels are the judgment of this project |

## Sources

These rules build on the sources below.

The research notes in [`research/`](./research/) hold the full list, about 105 sources, with what each one says and where they disagree.

**The content of a README**

- [standard-readme](https://github.com/RichardLitt/standard-readme/blob/main/spec.md)
- [Make a README](https://www.makeareadme.com/)
- The [Google documentation guide](https://google.github.io/styleguide/docguide/READMEs.html)
- The [README template of the Good Docs Project](https://gitlab.com/tgdp/templates/-/blob/main/readme/template_readme.md)
- Art of README, whose repository is gone and was read from an archive

**What GitHub does with these files**

- [About READMEs](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-readmes), for the lookup order and the truncation
- [Basic writing and formatting syntax](https://docs.github.com/en/get-started/writing-on-github/getting-started-with-writing-and-formatting-on-github/basic-writing-and-formatting-syntax#section-links), for the anchors

**What a project documents**

- The [OpenSSF Best Practices criteria](https://www.bestpractices.dev/en/criteria/0)
- The [Open Source Guides](https://opensource.guide/starting-a-project/)
- [Categorizing the content of GitHub README files](https://arxiv.org/abs/1802.06997), a study of 393 READMEs
- [Linting style and substance in READMEs](https://arxiv.org/abs/2603.00331), for what linters don't check

**Agent instruction files**

- [AGENTS.md](https://agents.md/)
- The documentation of [Claude Code](https://code.claude.com/docs/en/memory) and [Codex](https://learn.chatgpt.com/docs/agent-configuration/agents-md), for how each tool loads them
- [Evaluating AGENTS.md](https://arxiv.org/abs/2602.11988), which measures success and cost on Python repositories
- [On the impact of AGENTS.md files on the efficiency of AI coding agents](https://arxiv.org/abs/2601.20404), which measures run time on ten repositories
- [Stale instruction files override the code in coding agents](https://arxiv.org/abs/2610.30571), a preprint on synthetic projects that isn't peer reviewed
- [Rules file backdoor](https://www.pillar.security/blog/new-vulnerability-in-github-copilot-and-cursor-how-hackers-can-weaponize-code-agents), for the attacks that hide instructions with invisible characters

**Agents as readers, and as contributors**

- [Make your site readable by AI agents](https://vercel.com/kb/guide/make-your-site-readable-by-ai-agents), for how agents reuse the documentation they fetch
- [AI policy, disclosure, and human in the loop](https://arxiv.org/abs/2605.16706), for the policies of projects on contributions made with AI tools
