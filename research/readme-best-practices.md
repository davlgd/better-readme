# README best practices: body of knowledge and candidate rules

Research date: 2026-11-15. Every source below was fetched and read on that date unless marked **unverified**. Findings are paraphrased. "Unverified" means the page could not be fetched, or the claim comes only from a search snippet or secondary source.

## 1. Source list

### Specifications, guides and templates

| # | Source | URL | Why it matters | Date / version |
|---|---|---|---|---|
| S1 | standard-readme spec (Richard Littauer) | https://github.com/RichardLitt/standard-readme/blob/main/spec.md | The only widely used formal README spec: fixed section order, required sections, measurable limits | No version in the spec; repo last pushed 2026-09-29 |
| S2 | Make a README (Danny Guo) | https://www.makeareadme.com/ | Most-cited practical checklist of sections | Undated, living page |
| S3 | Art of README (Kira, a.k.a. noffle / hackergrrl) | https://github.com/hackergrrl/art-of-readme | Origin of "cognitive funneling" and of a 10-item README checklist | Written 2016. **The original repo and account return 404 as of 2026-11-15.** Read through the Wayback Machine snapshot of 2026-06-15 (https://web.archive.org/web/20260615180708/https://github.com/hackergrrl/art-of-readme) and a 2016 copy (https://github.com/bradparks/art-of-readme) |
| S4 | awesome-readme (Matias Singers) | https://github.com/matiassingers/awesome-readme | Curated corpus of admired READMEs; shows what practitioners reward | Living list, pushed 2026-11-10 |
| S5 | GitHub Docs, "About READMEs" | https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-readmes | Authoritative platform behavior: lookup order, truncation, links | Living page |
| S6 | GitHub Docs, "Basic writing and formatting syntax" | https://docs.github.com/en/get-started/writing-on-github/getting-started-with-writing-and-formatting-on-github/basic-writing-and-formatting-syntax | Anchor generation, relative links, alt text, alerts | Living page |
| S7 | Readme Driven Development (Tom Preston-Werner) | https://tom.preston-werner.com/2010/08/23/readme-driven-development | Process argument: write the README first | 2010-08-23 |
| S8 | Google documentation guide, READMEs | https://google.github.io/styleguide/docguide/READMEs.html | Minimal, strict rule set from a large engineering org, including per-directory READMEs | Living page |
| S9 | Diátaxis (Daniele Procida) | https://diataxis.fr/ and https://diataxis.fr/start-here/ | Framework of four documentation types; explains why a README must not try to be all of them | Living site |
| S10 | Write the Docs, "A beginner's guide to writing documentation" | https://www.writethedocs.org/guide/writing/beginners-guide-to-docs/ | Community consensus on minimum README content, with a template | Living page |
| S11 | Write the Docs, "Docs as Code" | https://www.writethedocs.org/guide/docs-as-code/ | Justifies linting and CI for docs | Living page |
| S12 | The Good Docs Project, README template and guide | https://gitlab.com/tgdp/templates/-/blob/main/readme/template_readme.md and https://gitlab.com/tgdp/templates/-/blob/main/readme/guide_readme.md | Technical-writer-authored template with audience and troubleshooting sections | Templates release 1.4 dated 2025-06-13 (release date from a search snippet, **unverified**); project moved from GitHub to GitLab |
| S13 | thoughtbot, "How to write a great README" (Caleb Hearth) | https://thoughtbot.com/blog/how-to-write-a-great-readme | Frequently cited practitioner article, listed in S4 | 2013-05-19, updated 2020-03-31 |
| S14 | Open Source Guides, "Starting an Open Source Project" | https://opensource.guide/starting-a-project/ | GitHub-backed guidance: the four questions a README answers, pre-launch checklist | Living page |
| S15 | AGENTS.md | https://agents.md/ | The emerging convention for agent-facing instructions and how it divides content with the README | Living page; stewarded by the Agentic AI Foundation (Linux Foundation) |

### Standards, badges and health checklists

| # | Source | URL | Why it matters | Date / version |
|---|---|---|---|---|
| S16 | OpenSSF Best Practices badge, passing criteria | https://www.bestpractices.dev/en/criteria/0 | MUST/SHOULD criteria on what a project must document | Living criteria |
| S17 | OpenSSF Scorecard checks | https://github.com/ossf/scorecard/blob/main/docs/checks.md | Automated heuristics for License and Security-Policy files | Living doc |
| S18 | GitHub community profile ("community standards") | https://docs.github.com/en/communities/setting-up-your-project-for-healthy-contributions/about-community-profiles-for-public-repositories ; API: https://docs.github.com/en/rest/metrics/community | The checklist GitHub itself shows to maintainers; has an API | Living pages |
| S19 | GitHub Docs, default community health files | https://docs.github.com/en/communities/setting-up-your-project-for-healthy-contributions/creating-a-default-community-health-file | Lookup locations and order for CONTRIBUTING, SECURITY, SUPPORT, etc. | Living page |
| S20 | CHAOSS metric, Documentation Usability | https://chaoss.community/kb/metric-documentation-usability/ | Defines usability dimensions (jargon, structure, readability, inclusion) | Living page |
| S21 | CNCF CLOMonitor checks | https://github.com/cncf/clomonitor/blob/main/docs/checks.md | Exact regexes CNCF uses to detect README sections and links | Living doc |
| S22 | CNCF maintainer templates | https://contribute.cncf.io/maintainers/templates/ | CNCF repo document templates | **Unverified**: the page returned a redirect loop |

### Empirical research

| # | Source | URL | Why it matters | Date / venue |
|---|---|---|---|---|
| S23 | Prana, Treude, Thung, Atapattu, Lo, "Categorizing the Content of GitHub README Files" | https://arxiv.org/abs/1802.06997 | Reference taxonomy of README content and measured frequencies | arXiv 2018; Empirical Software Engineering 24(3) (venue from a bibliographic listing) |
| S24 | Liu, Noei, Lyons, "How ReadMe files are structured in open source Java projects" | https://enoei.github.io/papers/liu2022readme.pdf | Links individual sections to star counts with effect sizes | Preprint "submitted to Elsevier", PDF created 2021-11; published in Information and Software Technology 2022 (venue **unverified**) |
| S25 | Venigalla, Chimalakonda, "An Empirical Study On Correlation between Readme Content and Project Popularity" | https://arxiv.org/abs/2206.10772 | README features of popular projects across ten languages | arXiv, 2022-06-21 |
| S26 | Fan, Xia, Lo, Hassan, Li, "What Makes a Popular Academic AI Repository?" | https://arxiv.org/abs/2010.02472 | README features among the top predictors of popularity | arXiv 2020; Empirical Software Engineering 2021 |
| S27 | Wang, Wang, Chen, "Study the correlation between the README file of GitHub projects and their popularity" | DOI 10.1016/j.jss.2023.111806 | Controls for repository factors, 5,000 repos | Journal of Systems and Software 2023. **Findings unverified** (only metadata was reachable) |
| S28 | Mynampaty, Josephine, Isaacs, McNutt, "Linting Style and Substance in READMEs" (LintMe) | https://arxiv.org/abs/2603.00331 | The most recent academic work on README linting; maps the gap in existing linters | CHI '26, arXiv v2 2026-03-18 |

### Linters and checkers

| # | Source | URL | What it is | Status |
|---|---|---|---|---|
| L1 | standard-readme-preset | https://github.com/RichardLitt/standard-readme-preset | remark preset enforcing part of S1 | Active (pushed 2026-10-15), described upstream as work in progress |
| L2 | remark-lint and presets | https://github.com/remarkjs/remark-lint | Markdown AST linter, 80 rule packages | Active |
| L3 | markdownlint (David Anson) | https://github.com/DavidAnson/markdownlint | 53 Markdown rules, all on by default | Active; v0.42.1 appears in the README's sample output |
| L4 | markdownlint-github | https://github.com/github/markdownlint-github | GitHub's accessibility rules for markdownlint | Active |
| L5 | Vale | https://docs.vale.sh/checks/ | Prose linter framework with pluggable styles | Active (v3) |
| L6 | lychee | https://github.com/lycheeverse/lychee | Async link checker | Active |
| L7 | markdown-link-check | https://github.com/tcort/markdown-link-check | Link checker for Markdown | Active |
| L8 | alex | https://github.com/get-alex/alex | Insensitive-language checker | Last pushed 2024-11 |
| L9 | write-good | https://github.com/btford/write-good | Naive prose-style linter | Last pushed 2025-03 |
| L10 | repolinter (TODO Group) | https://github.com/todogroup/repolinter | Repository-level file and content rules | **Archived** on GitHub (last push 2026-02-06) |
| L11 | awesome-lint (Sindre Sorhus) | https://github.com/sindresorhus/awesome-lint | Linter for "awesome list" READMEs | Active |
| L12 | readme-score | https://www.npmjs.com/package/readme-score | Section-presence scorer, 0 to 100 | v1.0.0, 2026-03-22 (read through the npm registry API; the npmjs.com page returned 403) |
| L13 | readme-doctor | npm package `readme-doctor` | Section-presence scorer and fixer | **Unverified** (search snippet only) |
| L14 | twine check | https://packaging.python.org/en/latest/guides/making-a-pypi-friendly-readme/ | Validates that a README will render on PyPI | Requires twine 1.12.0 or later |

### Rendering and accessibility

| # | Source | URL | Why it matters |
|---|---|---|---|
| R1 | github/markup README | https://github.com/github/markup | Rendering pipeline, supported formats, sanitization |
| R2 | GitHub Docs, "Quickstart for writing on GitHub" | https://docs.github.com/en/get-started/writing-on-github/getting-started-with-writing-and-formatting-on-github/quickstart-for-writing-on-github | Light and dark images, collapsed sections |
| R3 | GitHub Blog, "5 tips for making your GitHub profile page accessible" (Annie Streater) | https://github.blog/developer-skills/github/5-tips-for-making-your-github-profile-page-accessible/ | GitHub's own accessibility rules for README content; 2023-10-26 |
| R4 | npm Docs, "About package README files" | https://docs.npmjs.com/about-package-readme-files | npm display rules |
| R5 | PyPA, "Making a PyPI-friendly README" | https://packaging.python.org/en/latest/guides/making-a-pypi-friendly-readme/ | PyPI formats and failure modes |
| R6 | Cargo manifest reference | https://doc.rust-lang.org/cargo/reference/manifest.html | crates.io README detection |
| R7 | Rust forum PSA, "Please use absolute URLs in crate READMEs" (kornel) | https://users.rust-lang.org/t/psa-please-use-absolute-urls-in-crate-readmes/45136 | Why relative links break in registries; 2020-06-29 |

## 2. Findings per source

### S1. standard-readme

- File must be named `README` (capitalized) plus the extension of its format (`.md`, `.org`, `.html`), and must be valid in that format.
- Translations use a BCP 47 tag (`README.de.md`). When several languages exist, `README.md` is reserved for English. Section titles are translated.
- No broken links. Code examples should be linted like the project's code.
- Sections must appear in this order, with these titles: Title (required), Banner, Badges, Short Description (required), Long Description, Table of Contents (required, optional under 100 lines), Security, Background, Install (required), Usage (required), extra sections, API, Maintainers, Thanks, Contributing (required), License (required, must be last). Install and Usage are optional for documentation-only repositories.
- Title must match the repository, folder and package-manager name, or show that name in italics and parentheses next to a different title.
- Banner must be a local image in the repository, placed directly after the title.
- Badges are newline-delimited. Suggested: host static badges locally to avoid external requests and tracking.
- Short description: under 120 characters, on its own line, must not start with `> `, and must match the package manager `description` field and the GitHub repository description.
- Table of contents must link to every level-two heading, starting with the section that follows it.
- Install must contain a code block. A `Dependencies` subsection is required when there are unusual dependencies or manual steps.
- Usage must contain a code block. A `CLI` subsection is required if the project has a CLI. Importable modules show the import as well as the call.
- API (optional) covers signatures, return types, callbacks and events, or links to an external API document.
- Maintainers must list at least one way to contact each maintainer.
- Contributing must say where to ask questions, whether pull requests are accepted, and any requirements such as sign-off.
- License must state the SPDX identifier or name, and the owner. Use `UNLICENSED` or `SEE LICENSE IN <file>` where relevant.

### S2. Make a README

- Name the file `README.md` in the top-level directory. Uppercase is traditional; lowercase is tolerated.
- Write it before the project goes public, ideally as the first file.
- Suggested sections, in order: Name, Description, Badges, Visuals, Installation, Usage, Support, Roadmap, Contributing, Authors and acknowledgment, License, Project status.
- Description should be specific, give context, link unfamiliar references, and say how the project differs from alternatives.
- Installation should be explicit, step by step, written for a possible novice, with a Requirements subsection when a specific runtime, OS or manual dependency is needed.
- Usage should show examples with expected output, starting with the smallest useful one, and link to longer examples.
- Contributing should document commands for linting and running tests, and any setup scripts or environment variables.
- If development has slowed or stopped, say so at the top.
- On length: too long is better than too short. When it grows, move detail to other documentation instead of deleting it.

### S3. Art of README

- The README must let a reader use the module without reading its source.
- Its job, in order: say what it is with context, show what it looks like in action, show how to use it, give other relevant details.
- Brevity: as short as possible without being shorter. Detailed documentation goes on separate pages.
- Ordering ("cognitive funneling"): broadest, most disqualifying information first, increasing detail further down, background and credits last. The order is Name, One-liner, Usage, API, Installation, License.
- The order should let a reader rule the project out as fast as possible. The goal is evaluation, not selling.
- A predictable format across projects matters more than this exact format.
- A non-permissive license should be stated at the very top.
- Background section: define abstractions the reader needs, and explain motivation when similar modules exist.
- Link aggressively to referenced modules, ideas, people and specialized terms.
- Keep the usage example as a runnable file in the repository.
- For a CLI, show invocations with their output.
- Be judicious with badges: they add visual noise and only work online. Ask what value each badge gives a typical reader.
- API section: mark optional parameters and defaults, give types where not obvious, list every accepted option key.
- Inline anything essential, because the repository outlives its host and its hyperlinks, especially images.
- Checklist (10 items): one-liner explaining the purpose; necessary background context and links; unfamiliar terms linked to informative sources; clear, runnable usage example; installation instructions; extensive API documentation; performs cognitive funneling; caveats and limitations mentioned up front; does not rely on images to relay critical information; license.

### S4. awesome-readme

- The introduction names images, screenshots, GIFs and text formatting as the elements of a beautiful README.
- Features most often praised in the annotations of listed examples (rough counts produced by a model reading the page, so approximate): project logo, badges, installation instructions, GIF or demo, table of contents or navigation, screenshots, contributor sections, contribution guidelines.
- This is a popularity signal from curators, not a rule set. It skews toward visual polish.

### S5 and S6. GitHub Docs

- A README should say what the project does, why it is useful, how to get started, where to get help, and who maintains and contributes to it.
- It should contain only what developers need to start using and contributing. Longer documentation belongs in a wiki.
- Lookup locations: `.github/`, repository root, `docs/`. If several exist, GitHub shows the first found in that order. A stray `.github/README.md` therefore shadows the root README.
- Content beyond 500 KiB is truncated.
- GitHub auto-generates an outline (table of contents) from headings in the rendered view.
- Relative links and image paths are recommended over absolute ones, because absolute links may break in clones. Paths starting with `/` resolve from the repository root. GitHub rewrites relative paths for the current branch.
- Link text must stay on a single line or the link breaks.
- Heading anchors: lowercased, spaces become hyphens, other punctuation and whitespace removed, formatting stripped, duplicates get `-1`, `-2` and so on. Renaming or reordering headings changes anchors.
- Images take alt text in the brackets, defined as a short text equivalent of the image.
- Five alert types exist (`NOTE`, `TIP`, `IMPORTANT`, `WARNING`, `CAUTION`). Use at most one or two per document, never consecutively, never nested.
- HTML comments hide content from the rendered view. Color swatches do not render in READMEs.
- Precedence between `README.md`, `README.rst` and `README` inside one directory is **unverified**. The only evidence found is a 2014 github/markup maintainer comment saying formatted files are preferred over plain text and then sorted alphabetically.

### S7. Readme Driven Development

- Write the README before code, tests or stories.
- Benefits claimed: cheaper design iteration on the public interface, documentation written while motivation is high, teammates can build against the described interface, a concrete text to discuss.
- The README is positioned as a middle ground between heavy specifications and no documentation. Keeping it to one short file discourages over-specification.

### S8. Google docguide

- File must be named `README.md`, case-sensitive.
- It lives in the top-level directory of the code, not inside a documentation directory.
- Every top-level directory of a package should have an up-to-date README.
- A top-level README must at least link to user-facing and team-facing documentation.
- A package README should give or point to: what the package contains and is for, points of contact, status (for example deprecated or not for general release), how to use it (examples, copyable commands), and links to relevant documentation.

### S9. Diátaxis

- Four documentation types, each for one need: tutorial (learning), how-to guide (task), reference (information), explanation (understanding).
- Blurring the boundaries between types is presented as the root of many documentation problems.
- Diátaxis does not mention README files. The following mapping is **my inference, not a claim of the source**: a README is a landing page that necessarily touches all four types, so it should hold a minimal slice of each (one-paragraph explanation of what and why, one shortest-path tutorial as the quick start, a pointer to reference) and link out for the rest. This matches S5 and S3, and conflicts with S2's tolerance for long READMEs.

### S10 and S11. Write the Docs

- Minimum content: what problem the project solves, a small code example, a link to the code and issue tracker, how to get support, how to contribute, install instructions kept to a couple of lines, the license.
- Template sections: project name, introduction with a usage snippet, features (short bullet list), installation, contribute, support, license.
- Explain why the project exists, not only how to use it.
- The README must read well as plain text. Link to longer pages for caveats.
- Docs as code: keep the README in version control, review it like code, and run automated checks on it.

### S12. The Good Docs Project

- Template order: logo and badges (optional), project name, table of contents (optional), project description, who this project is for, project dependencies, instructions (install, configure, run, troubleshoot), contributing guidelines, additional documentation, how to get help, terms of use (license). Sections may be reordered or removed.
- The description is the most critical part. State what the project does and why the reader should care before naming the languages and tools it is built with.
- Suggested sentence patterns: "With X you can ...", "X helps you ...", "Unlike Y, X ...".
- State limitations, including when a user should not use the project.
- State the target audience explicitly.
- List prerequisites with the reason for each and links to their install instructions.
- Instructions are ordered lists, each step starting with a verb.
- Troubleshooting uses an issue and solution table.
- Assets referenced by the README should exist in the repository.
- Style: approachable voice, strong verbs, succinct, no passive voice, all-caps file name.
- Revisit the README regularly as the project evolves.

### S13. thoughtbot

- Library name as the H1. A strong opening paragraph, with a bolded short description.
- Two or three heading levels under the title.
- Syntax-highlighted code samples.
- A dedicated section for known problems with workarounds.
- Badges cut both ways: a failing build badge deters readers.

### S14. Open Source Guides

- A README answers four questions: what does the project do, why is it useful, how do I get started, where can I get more help.
- It can also say how contributions are handled, the project's goals, and license information. If the project does not accept contributions or is not production-ready, the README should say so.
- LICENSE is mandatory for an open source launch. CONTRIBUTING and CODE_OF_CONDUCT should be linked from the README.
- Pre-launch checklist: LICENSE file present; README, CONTRIBUTING and CODE_OF_CONDUCT present; a name that is memorable, hints at function and does not clash with an existing project or trademark.

### S15. AGENTS.md

- AGENTS.md is described as a README for agents: a Markdown file at the repository root, with no required fields.
- Division of content: the README is for humans (quick start, description, contribution guidelines). AGENTS.md carries detail agents need that would clutter a README: build steps, test commands, code style, security considerations, commit and pull request conventions.
- Nested AGENTS.md files are allowed in monorepos; the closest one wins.
- The site claims use by over 60,000 open source projects (the site's own figure, not independently checked).

### S16. OpenSSF Best Practices badge (passing level)

- `description_good` (MUST): the project website briefly says what the software does and what problem it solves.
- `interact` (MUST): it explains how to obtain the software, give feedback (bugs, enhancements) and contribute.
- `contribution` (MUST): contribution information explains the process, for example whether pull requests are used.
- `contribution_requirements` (SHOULD): requirements for acceptable contributions are stated, for example a coding standard.
- `license_location` (MUST): the license is in a standard location in the source repository.
- `documentation_basics` (MUST): basic documentation exists.
- `documentation_interface` (MUST): reference documentation describes external inputs and outputs.
- `report_process` (MUST): a process for bug reports exists.
- `vulnerability_report_process` (MUST): the vulnerability reporting process is published. `vulnerability_report_private` (MUST if supported): how to report privately.
- `test` (MUST): the project shows or documents how to run its test suite, for example in README.md or CONTRIBUTING.md.
- `release_notes` (MUST): human-readable release notes per release, not raw commit logs.
- `english` (SHOULD): documentation available in English.

### S17. OpenSSF Scorecard

- No check evaluates the README.
- License: looks for `LICENSE`, `LICENCE`, `COPYING` or `COPYRIGHT` (common extensions) at top level or in `LICENSES/`. Score: 6 for a detected file, 3 for top-level placement, 1 for an FSF or OSI license.
- Security-Policy: looks for `SECURITY.md` in well-known directories. Score: 6 for an email or http(s) link, 3 for free text beyond links, 1 for disclosure vocabulary ("vuln", "disclos") plus a time expectation such as 30 or 90 days.
- CII-Best-Practices: queries the badge API (gold 10, silver 7, passing 5, in progress 2).

### S18 and S19. GitHub community profile

- Checklist items documented: README, CODE_OF_CONDUCT, LICENSE, CONTRIBUTING, issue templates. Issue templates must be in `.github/ISSUE_TEMPLATE` with valid `name` and `about` (Markdown) or `name` and `description` (YAML forms) keys. Whether the description, security policy and pull request template count toward the checklist is **unverified** from the docs pages read.
- REST endpoint `GET /repos/{owner}/{repo}/community/profile` returns `health_percentage` (share of recommended community health files present; formula not documented), `description`, `documentation`, and `files` (`code_of_conduct`, `license`, `contributing`, `readme`, `issue_template`, `pull_request_template`). Not available for forks.
- Health files (CONTRIBUTING, CODE_OF_CONDUCT, SECURITY, SUPPORT and others) are looked up in `.github/`, then root, then `docs/`, then the organization's `.github` repository. A license cannot be supplied as an organization default.

### S20. CHAOSS Documentation Usability

- Dimensions: appropriate and explained jargon, structural clarity, readability (plain language, no shorthand, friendly to non-native readers), inclusive language, availability in several languages, content broken into sections manageable for readers with little time.
- Scannability signals to measure: headings, code and text blocks, bulleted lists, anchors.
- Collection methods are mostly human: newcomer interviews, observed walkthroughs, friction logs.

### S21. CNCF CLOMonitor

- README existence: `README*`, `.github/README*`, `docs/README*` (case-sensitive).
- For adopters, changelog, code of conduct, contributing, governance, maintainers and roadmap, a check passes if a matching file exists **or** the README has a heading containing the word (`(?im)^#+.*contributing.*$`) or a link whose text contains it (`(?i)\[.*contributing.*\]\(.*\)`).
- README regexes also detect the OpenSSF Best Practices badge, the Scorecard badge, license scanning links (FOSSA, Snyk), community meeting mentions and Slack links.

### S23. Prana et al.

- 393 randomly sampled READMEs, 4,226 sections, manually coded into eight categories.
- Share of READMEs containing each category: What 97.0%, How 88.5%, References 60.8%, Who 52.9%, Contribution 27.8%, Why 25.7%, When (status, versions, roadmap) 21.4%, Other 6.9%.
- Share of sections: How 58.4%, References 20.3%, What 16.7%, Who 7.6%, When 4.3%, Contribution 2.9%, Why 2.7%.
- Main gap: purpose (Why) and status (When) are missing from roughly three quarters of READMEs.
- Median of seven sections per file. 3,080 distinct headings for 4,226 sections, so heading wording is not standardized in practice.
- A classifier reached F1 0.746. In a survey of 20 professionals, 12 preferred READMEs with category labels, 6 were neutral, 2 preferred unlabeled.

### S24. Liu et al.

- 14,901 Java repositories; 11,594 English READMEs analyzed against the seven sections GitHub recommended at the time (description, table of contents, installation, usage, contributing, credits, license).
- Presence: description 41%, usage 31%, installation 21%, license 13%, contributing 5%, credits 4%, table of contents 2%. On average 83.47% of READMEs do not align with the guidelines.
- Each section is associated with significantly more stars (Mann-Whitney U, p ≤ 0.05). Effect sizes (Cohen's d): license 0.416, contributing 0.415, usage 0.314, installation 0.311, credits 0.287, table of contents 0.219, description 0.039.
- Median stars: 9 with a contributing section, 2 without.
- Shape of the corpus: 4.32 headings on average, 1,090 READMEs with no heading; 9,165 of 14,901 with no code block; 0.80 images on average; about two thirds of READMEs have 20 tokens or fewer.
- Code snippets and links to images are also associated with more stars. The most frequent README structures belong to the least popular repositories.
- Correlational only. Stars are a proxy.

### S25. Venigalla and Chimalakonda

- 1,950 READMEs across ten languages.
- READMEs of popular projects tend to be organized with lists and images, link to external sources, and include contribution guidelines and references. The abstract gives no coefficients.

### S26. Fan et al.

- 1,149 academic AI repositories. Of 21 features, 11 differ significantly between popular and unpopular repositories.
- The three most important: number of links to other GitHub repositories in the README, number of images in the README, presence of a license.

### S27. Wang, Wang, Chen

- 5,000 repositories, more than 20 languages, controls for repository factors. Per a search snippet, the practical implication is to organize the README with proper Markdown and keep it up to date. **Unverified.**

### S28. LintMe (CHI '26)

- A README linter built as a design probe: rules are pipelines of composable operators in YAML, mixing programmatic operators (extract, count, threshold, regex, compare, fetch from GitHub, execute inline commands) with LLM evaluation and LLM fixes.
- Example rules: emoji limit, consistent list format, code block consistency, readability at a target grade level, README updated within the last year, neutral or objective tone, alt text required, table of contents, section completeness, BibTeX citation present (dataset preset).
- Presets by repository kind: software library, interactive system, dataset repository.
- Rule taxonomy adapted from Tang and Nadi (2023): accuracy, consistency, security, timeliness, conciseness, accessibility, availability, objectivity, reputation, quality, appearance.
- Finding: existing tools work at the level of Markdown syntax, style and prose, and address substance only superficially. Fixed, opinionated rule sets (standard-readme is cited) do not adapt to community norms.
- On five well-known READMEs, the rule-based tool flagged a mean of 25.4 issues per run against 9.6 for free-prompted LLMs and 7.25 for LLMs given the rules. The authors argue LLMs alone lack adjustability and line-level blame.
- User study (N=11): positive, with a learning curve around YAML; some participants felt presets carried undue authority.

### L1. standard-readme-preset

- Seven rules: `appropriate-heading` (H1 matches directory name, or ends with a parenthesized alias), `file-extension` (`.md`), `file-stem` (`README`, allows language tags), `require-file-extension`, `no-unknown-sections` (outside the extra-sections slot), `require-sections` (`contributing`, `license`; table of contents when the file exceeds 100 lines excluding the ToC; `install` and `usage` only when `installable: true`), `section-order`.
- Not checked (by absence from the rule list): short description length and equality with package or repository description, ToC completeness, code blocks in Install and Usage, banner locality, badge layout, license owner, maintainer contact, contributing content, broken links.

### L2. remark-lint

- 80 rule packages covering Markdown syntax and style consistency.
- `remark-preset-lint-recommended` (13 rules): final newline, list item bullet indent, list item indent, no blockquote without marker, no literal URLs, ordered list marker style, hard break spaces, no duplicate definitions, no heading content indent, no shortcut reference image, no shortcut reference link, no undefined references, no unused definitions.
- Other presets: `consistent` (consistency) and `markdown-style-guide`.
- Rules relevant to READMEs outside the recommended preset: `heading-increment`, `first-heading-level`, `no-multiple-toplevel-headings`, `no-duplicate-headings`, `fenced-code-flag`, `no-shell-dollars`, `no-html`, `maximum-line-length`, `no-empty-url`.

### L3 and L4. markdownlint and markdownlint-github

- 53 rules, all on by default. Relevant to READMEs: MD001 heading increment, MD013 line length, MD024 no duplicate heading, MD025 single H1, MD033 no inline HTML, MD034 no bare URLs, MD040 fenced code language, MD041 first line is an H1, MD042 no empty links, MD043 required heading structure (configurable list), MD044 proper names capitalization, MD045 images have alt text, MD051 link fragments valid, MD052 and MD053 reference definitions, MD056 table column count, MD059 descriptive link text, MD014 `$` prompts only when output is shown.
- markdownlint-github adds GH001 `no-default-alt-text`, GH002 `no-generic-link-text`, GH003 `no-empty-alt-text` (rule names verified; behavior inferred from the names).

### L5. Vale

- A framework, not a rule set. Check types: existence, substitution, occurrence, repetition, consistency, conditional, capitalization, metric, readability, spelling, sequence, script.
- Rules come from style packages. Which packages exist (Google, Microsoft, write-good, proselint, alex, Readability) is **unverified** in this session.

### L6 and L7. Link checkers

- lychee: checks http(s) links, local file links, and mail addresses (opt-in). Handles Markdown, HTML and plain text. `--include-fragments` validates anchors. `--base-url` and `--root-dir` resolve relative and root-relative links. Offline mode checks only local files. Supports caching, GitHub token, exclusions, accepted status codes, retries. Links inside code blocks are skipped unless `--include-verbatim`.
- markdown-link-check: checks http(s) links for an alive status and validates `mailto:`. Config: `ignorePatterns`, `replacementPatterns`, `aliveStatusCodes`, `retryOn429`, disable comments. Anchor checking is not described in its README (**unverified**).

### L8 and L9. Prose checkers

- alex: flags gendered, ableist, condescending, race-related and profane wording through `retext-equality` and `retext-profanities`. Its own README warns about false positives and misses.
- write-good: passive voice, lexical illusions (repeated word), sentences starting with "So" or "There is/are", weasel words, adverbs, wordy phrases, clichés, optional E-Prime.

### L10. repolinter (archived)

- Rule types: file existence, directory existence, file contents regex, file not contents, file starts with, file hash, large file, no broken links (through github-markup), license detectable by licensee, Best Practices badge present, git history greps.
- Default ruleset touching documentation: `README*` exists; README contains the word "license" (case-insensitive); `LICENSE*` or `COPYING*` exists; `CONTRIB*`, code of conduct (which must contain an email address), `CHANGELOG*`, `SECURITY.md`, `SUPPORT*` exist in root, `docs/` or `.github/`; issue and pull request templates exist; a test directory and CI configuration exist.

### L11. awesome-lint

- Custom rules (file names in `rules/`): badge, balanced punctuation, code of conduct, contributing, double link (duplicate URLs), git repo age, GitHub metadata, heading, license, list item format, no CI badge, no repeated item name in description, spell check, table of contents.
- Plus about 40 configured remark-lint rules (fenced code only, ATX headings, single H1, no heading punctuation, no shell dollars, no undefined references and others).
- Specific to curated lists, but it shows that item-format and ToC rules are implementable on the Markdown AST.

### L12 and L13. Section scorers

- readme-score: 14 checks, 100 points, letter grade. Categories: title and description (H1 present; prose paragraph of at least 30 characters), badges (at least one), installation, usage, API or reference section, contributing, license, extras such as changelog. `--min` threshold for CI. It measures presence only.
- readme-doctor: per a search snippet, scores presence of badges, quick start, usage, configuration, CI, security, contributing, license, ToC, roadmap, FAQ. **Unverified.**

### R1 to R7. Rendering and registries

- GitHub rendering pipeline: convert markup to HTML, sanitize, highlight code, apply filters (emoji, task lists, anchors, image proxy caching, autolinks). Sanitization removes `script` tags, inline styles, and `class` and `id` attributes. Formats: Markdown, Textile, RDoc, Org, Creole, MediaWiki, reStructuredText, AsciiDoc, Pod.
- Light and dark images: use `<picture>` with `prefers-color-scheme` sources and a default `<img>`. Collapsed content: `<details>` with `<summary>`.
- Accessibility (R3): descriptive, unique link text instead of "click here"; succinct alt text that includes any text shown in the image and does not start with "image of"; one H1, no skipped heading levels; real list markup instead of emoji bullets; no runs of consecutive emoji; plain language.
- npm (R4): shows `README.md` from the package root, rendered as GitHub Flavored Markdown. The page updates only when a new version is published.
- PyPI (R5): accepts plain text, reStructuredText without Sphinx extensions, and Markdown (GFM by default, or CommonMark). The content type must be declared or inferable from `.md` or `.rst`. Invalid reStructuredText is shown as raw source. `twine check dist/*` validates before upload. The official guide is silent on relative links; community reports say they break because PyPI has no repository context (**partly verified**, from search results only).
- crates.io (R6, R7): Cargo picks `README.md`, `README.txt` or `README` from the package root unless `readme` is set; crates.io renders it as Markdown. `description` is required to publish. Crates ship as archives without per-file URLs, so relative links are technically broken; crates.io rewrites common GitHub cases only, and a README in a workspace subdirectory resolves against the repository root. Advice: absolute URLs.

## 3. Synthesis: candidate rules

Tags: `deterministic` means a script can decide it (method given); `judgment` means a human or LLM is needed; `hybrid` means a script can detect presence and a human or LLM must assess quality. "Needs network" and "needs repo" flag inputs beyond the README text.

### File and placement

| ID | Rule | Tag and how | Sources |
|---|---|---|---|
| F1 | A README exists at the repository root | deterministic: glob `README*` in root | S5, S8, S14, S18, S21, L10 |
| F2 | The file stem is `README` in capitals with a format extension | deterministic: filename regex | S1, S8, S12, L1; S2 tolerates lowercase |
| F3 | No shadowing README: if `.github/README*` exists, it is the one GitHub displays instead of root | deterministic: check `.github/`, root, `docs/` in order and warn when more than one exists | S5 |
| F4 | The README is under 500 KiB | deterministic: file size | S5 |
| F5 | The file parses as valid markup for its extension | deterministic: parse with a CommonMark or GFM parser; for PyPI run `twine check` | S1, R5 |
| F6 | Translations are named `README.<bcp47>.md` and `README.md` is the English one | deterministic: filename regex; language detection for the second half | S1; S16 `english` |
| F7 | Sub-packages or top-level directories that expose an interface have their own README | hybrid: detect package manifests in subdirectories without a sibling README; whether one is warranted is judgment | S8, S12 |

### Opening: identity and purpose

| ID | Rule | Tag and how | Sources |
|---|---|---|---|
| O1 | The document starts with exactly one H1, and it is the project name | deterministic: AST (MD041, MD025); compare to directory, repo or manifest `name` | S1, S13, R3, L1, L3 |
| O2 | A one-line description follows the title, before any second-level heading | deterministic: first paragraph node after H1 (skipping badges and banner) exists | S1, S3, S10, S13 |
| O3 | The one-liner is short (S1: under 120 characters) | deterministic: character count | S1 |
| O4 | The one-liner equals the package manifest description and the repository description | deterministic, needs repo: compare with `package.json`, `Cargo.toml`, `pyproject.toml` `description`, and the GitHub API | S1; crates.io requires `description` (R6) |
| O5 | The opening says what the project does and what problem it solves | judgment | S5, S10, S12, S14, S16 `description_good` |
| O6 | The opening says why the project is useful or why it exists (motivation, difference from alternatives) | judgment | S2, S3, S10, S12, S14; S23 finds it missing in about 74% of READMEs |
| O7 | The description leads with user value, not with the technology stack | judgment | S12 |
| O8 | The intended audience is stated | hybrid: look for an audience heading or phrase; adequacy is judgment | S12 |
| O9 | Project status is stated when relevant (experimental, deprecated, unmaintained, not accepting contributions), near the top | hybrid: keyword and badge detection, cross-check with the repository's archived flag and last commit date; adequacy is judgment | S2, S8, S14; S23 finds status missing in about 79% |
| O10 | Caveats and limitations, including when not to use the project, appear early | judgment | S3, S12, S13 |
| O11 | Unfamiliar terms and referenced projects are linked or defined | judgment (an LLM can list undefined jargon) | S2, S3, S13, S20 |

### Getting started

| ID | Rule | Tag and how | Sources |
|---|---|---|---|
| G1 | Installation instructions exist and contain a code block | deterministic: heading matches install, setup, getting started, quick start; section contains fenced code | S1, S2, S3, S10, S12, S16 `interact`, S24 (d = 0.311), L12 |
| G2 | Prerequisites are listed (runtime versions, OS, manual dependencies) | hybrid: heading or keyword detection; completeness needs the repo (compare with manifest `engines`, `python_requires`, `rust-version`) | S1, S2, S12 |
| G3 | A usage section exists with at least one code example | deterministic: heading match plus fenced code | S1, S2, S3, S8, S10, S24 (d = 0.314), L12 |
| G4 | The first example is the smallest useful one, and expected output is shown | judgment | S2, S3 |
| G5 | A CLI project shows command invocations with output; a library shows the import and the call | hybrid: detect a `bin` entry or CLI manifest field, then look for a shell block; the rest is judgment | S1, S3 |
| G6 | Usage examples are runnable and correct | hybrid, needs repo: extract blocks and execute or type-check them, or check that they mirror an example file in the repo | S1 (lint examples), S3, S28 (`execute` operator) |
| G7 | Commands in the README match the repository (scripts, binary names, package name, flags) | deterministic, needs repo: cross-check `npm run x` against `package.json` scripts, `make x` against the Makefile, install command against the published name | implied by S1 and S3; no source states it as a rule |
| G8 | Fenced code blocks declare a language | deterministic: MD040, `fenced-code-flag` | S13, L2, L3 |
| G9 | Instructions are ordered steps, each starting with a verb | hybrid: ordered-list detection is deterministic; imperative mood is judgment | S12 |
| G10 | Common problems are documented with a fix | hybrid: heading detection for troubleshooting, FAQ, known issues | S12, S13 |

### Reference and navigation

| ID | Rule | Tag and how | Sources |
|---|---|---|---|
| N1 | The README links to fuller documentation when it exists | hybrid, needs repo: if `docs/`, a homepage field or a wiki exists, a link to it must be present | S2, S8, S10, S12, S16 `documentation_basics` |
| N2 | The public interface is documented in the README or linked from it | hybrid: heading match for API, reference, configuration, options, or a link to generated docs | S1, S3, S16 `documentation_interface`, L12 |
| N3 | Long READMEs have a table of contents covering every H2 | deterministic: line count above a threshold (S1: 100 lines), then compare ToC link targets to the H2 slugs | S1, L1, L11; S24 (d = 0.219) |
| N4 | Heading levels do not skip, and heading texts are unique | deterministic: MD001, MD024 | R3, L2, L3 |
| N5 | Sections are ordered from general to specific | hybrid: order against a configured list is deterministic; whether the order serves the reader is judgment | S1, S3 |

### Help, contribution, governance

| ID | Rule | Tag and how | Sources |
|---|---|---|---|
| C1 | The README says where to get help or ask questions | hybrid: heading or link detection (support, help, issues, discussions, chat) | S1, S2, S5, S10, S12, S14, S16 `report_process` |
| C2 | The README says how to contribute, or links to CONTRIBUTING | deterministic: heading regex or link text regex, as in S21, plus existence of the linked file | S1, S2, S10, S12, S14, S16 `contribution`, S21, S24 (d = 0.415), S25, L10 |
| C3 | The README states whether contributions are accepted at all | judgment | S1, S14 |
| C4 | How to run the tests is documented in README or CONTRIBUTING | hybrid: keyword and code-block detection, cross-checked with the manifest's test script | S2, S16 `test` |
| C5 | Maintainers or points of contact are identified, with a contact method | hybrid: heading or link detection; `CODEOWNERS` or `MAINTAINERS` existence | S1, S5, S8, S21 |
| C6 | Security reporting is documented in `SECURITY.md` or the README | deterministic: file existence in the standard locations; content heuristics as in S17 | S16, S17, S19, L10 |
| C7 | A code of conduct exists and is linked from the README | deterministic: file existence plus link detection | S14, S18, S21, L10 |
| C8 | Release notes or a changelog exist and are reachable from the README | deterministic: `CHANGELOG*` existence or README heading or link, as in S21 | S2, S16 `release_notes`, S21, L10 |

### License

| ID | Rule | Tag and how | Sources |
|---|---|---|---|
| X1 | A license file exists in a standard location | deterministic: glob as in S17 | S14, S16 `license_location`, S17, S18, L10 |
| X2 | The README names the license (SPDX identifier preferred) and links to the file | deterministic: regex for "license" plus an SPDX list match plus a link whose target exists | S1, S2, S3, S10, S12, L10; S24 (d = 0.416), S26 |
| X3 | The license named in the README matches the license file and the manifest | deterministic, needs repo: compare SPDX identifiers from README, licensee-style detection on the file, and the manifest `license` field | S1 (consistency principle); no source states it explicitly |
| X4 | A non-permissive license is stated near the top | hybrid: SPDX classification is deterministic; "near the top" needs a threshold | S3 |

### Links, images, rendering

| ID | Rule | Tag and how | Sources |
|---|---|---|---|
| K1 | No broken external links | deterministic, needs network: lychee or equivalent | S1, L6, L7, L10 |
| K2 | No broken relative links or image paths | deterministic, needs repo: resolve against the working tree | S1, S5, S12, L6 |
| K3 | No broken in-page anchors | deterministic: compute GitHub slugs (lowercase, hyphens, punctuation stripped, `-N` suffix for duplicates) and compare; MD051 | S6, L3, L6 |
| K4 | In-repo targets use relative links, not absolute URLs to the same repository | deterministic: flag URLs that point to the repo's own `blob` or `tree` paths | S5, S6 |
| K5 | If the README is published to a registry (npm, PyPI, crates.io), relative links and images are absolute or rewritten at build time | deterministic, needs repo: detect a publishable manifest, then flag relative targets; for PyPI also check the declared content type | R5, R6, R7 |
| K6 | Every image has alt text that is not empty, not a filename, and not a default | deterministic: MD045 plus GH001 and GH003-style patterns | S6, R2, R3, L3, L4 |
| K7 | Alt text is a meaningful equivalent and repeats text shown in the image | judgment (a vision model can check) | R3 |
| K8 | No critical information is conveyed only by an image, GIF or video | judgment (vision model; or flag READMEs whose install or usage section contains an image and no code block) | S3 |
| K9 | Link text is descriptive: no "here", "click here", "link", or bare URL | deterministic: word list (MD059, GH002) and MD034 | R3, L3, L4 |
| K10 | Link text does not span lines | deterministic: regex on raw source | S5 |
| K11 | No HTML that the host strips: `script`, `style` attributes, `class`, `id` | deterministic: scan HTML nodes | R1 |
| K12 | Essential assets are stored in the repository, not hotlinked | deterministic: classify image hosts; whether the image is essential is judgment | S1 (banner), S3, S12 |
| K13 | Images that depend on theme provide light and dark variants | hybrid: detect `<picture>` with `prefers-color-scheme`; whether a given image needs it requires rendering | R2 |
| K14 | Alerts are used sparingly: at most two, never consecutive, never nested | deterministic: count and position of `> [!TYPE]` blocks | S6 |
| K15 | Lists use list markup, not emoji or symbols as bullets; no runs of consecutive emoji | deterministic: regex on line starts and emoji sequences | R3, S28 |

### Badges and visuals

| ID | Rule | Tag and how | Sources |
|---|---|---|---|
| B1 | Badges sit directly under the title, one per line | deterministic: position and layout of image links to known badge hosts | S1, S12 |
| B2 | Badges are few and each is useful to a reader | hybrid: count against a threshold; usefulness is judgment | S3, S13 |
| B3 | Badges resolve and are not stale (no dead CI service, no failing or "unknown" status) | deterministic, needs network: fetch the badge SVG and read its text; flag retired services | S13; no source defines the check |
| B4 | A screenshot, GIF or demo is present for projects with a visual interface | hybrid: image presence is deterministic; whether the project is visual is judgment | S2, S4, S12; S24, S25, S26 link images to popularity |

### Style and prose

| ID | Rule | Tag and how | Sources |
|---|---|---|---|
| P1 | Markdown is consistent and portable (heading style, list markers, no undefined references) | deterministic: markdownlint or remark presets | L2, L3 |
| P2 | The README is concise and moves depth to linked docs | hybrid: length and section-length thresholds are deterministic; what should move is judgment | S3, S5, S7, S12; S2 dissents |
| P3 | Plain language: readable sentences, no unexplained jargon or shorthand | hybrid: readability metrics are deterministic (Vale `readability`); jargon is judgment | S12, S20, R3, S28 |
| P4 | Inclusive, neutral, non-promotional tone | hybrid: word lists (alex, write-good weasel words) are deterministic; tone is judgment | S3 ("evaluate, not sell"), S20, L8, L9, S28 |
| P5 | Active voice, strong verbs | hybrid: passive detection (write-good) is heuristic | S12, L9 |
| P6 | Reads acceptably as plain text | judgment (proxy: ratio of raw HTML to text) | S10 |
| P7 | No template placeholders or generator boilerplate left in (`{Project Name}`, "TODO", lorem ipsum, default framework README) | deterministic: pattern list and hashes of known scaffolds | implied by S12's placeholder convention and S24's finding that trivial auto-generated READMEs dominate; no source states it |

### Freshness and process

| ID | Rule | Tag and how | Sources |
|---|---|---|---|
| T1 | The README is kept current with the code | hybrid, needs repo: compare README last-modified date to recent releases or manifest changes; mentioned versions against the latest tag | S8, S12, S27 (unverified), S28 |
| T2 | The README is reviewed and linted in CI like code | deterministic, needs repo: detect a docs lint step in CI config | S11 |
| T3 | The README is written first, before the implementation | not checkable after the fact | S2, S7 |

### Agent readiness

No source in this survey other than S15 addresses README quality for AI coding agents. The rules below are derived and should be validated before adoption.

| ID | Rule | Tag and how | Sources |
|---|---|---|---|
| A1 | Build, test and lint commands are stated as copyable commands in a fenced block, in README, CONTRIBUTING or AGENTS.md | deterministic: search those files for fenced shell blocks under matching headings | S2, S15, S16 `test` |
| A2 | If AGENTS.md exists, the README does not duplicate it at length, and the two do not contradict each other | hybrid: text similarity is deterministic; contradiction is judgment | S15 |
| A3 | Key facts are in text, not only in images or collapsed HTML | hybrid: same check as K8 | S3, S10 |

### Where sources disagree

- **Length.** S2 says too long is better than too short. S3 says as short as possible, S5 says only what is needed to start using and contributing, S12 says be succinct. All four agree on the remedy: move detail to linked documents rather than delete it. A linter should warn on missing essentials and separately on excessive depth, not enforce a single length.
- **Section order.** S1 puts Install before Usage and requires License last. S3 puts Usage and API before Installation, on the grounds that the reader decides before installing, and wants a restrictive license at the top. S2, S10 and S12 follow install-then-use. S23 shows real READMEs use thousands of distinct headings, so strict title matching (L1's `no-unknown-sections`) produces many false positives.
- **Fixed format versus adaptable.** S1 mandates exact titles and order. S12 says reorder and remove freely. S3 values predictability but not a specific format. S28 reports that fixed presets are perceived as carrying undue authority and argues for community-tunable rules.
- **Badges.** S4, S12 and L12 treat badges as a positive; L12 gives points for having one. S3 warns against them, S13 notes a failing badge harms the project, L11 bans CI badges in lists, and S1 suggests self-hosting to avoid tracking.
- **Table of contents.** S1 requires one above 100 lines. S12 calls it optional and notes that GitHub now generates an outline (S5). S24 finds it in only 2% of READMEs, with a small positive association with stars. A hand-written ToC is also a maintenance and broken-anchor risk (S6).
- **Relative versus absolute links.** S5 and S6 recommend relative links so clones and branches work. R7 and community reports on PyPI recommend absolute URLs because registries have no repository context. Both are right for their host; the rule must depend on whether the README is published to a registry (K4 and K5).
- **Images.** S4 and the popularity studies (S24, S25, S26) favor images. S3 says not to rely on images for critical information and to inline anything essential. R3 requires alt text. These combine into "images as a supplement, never the only carrier".
- **File name.** S8 requires exactly `README.md`. S1 allows any format extension. S2 tolerates lowercase. npm requires `README.md` (R4); Cargo also accepts `README.txt` and `README` (R6).
- **Contributing content.** S1 requires a Contributing section in the README. S2, S12 and S14 prefer a separate CONTRIBUTING file linked from the README. S21 accepts either a file, a heading or a link.
- **Agent content.** S15 says to keep build and test detail out of the README and in AGENTS.md. S16 says to document how to run tests in README.md or CONTRIBUTING.md, and S2 puts test and lint commands in the README's Contributing section.
- **Shell prompts in code blocks.** remark's `no-shell-dollars` bans a leading `$`. markdownlint MD014 allows it when output is shown, which is what S2 and S3 recommend for usage examples.
- **Inline HTML.** markdownlint MD033 and remark `no-html` discourage it. GitHub's own guidance (R2) relies on `<picture>` and `<details>`.
- **Popularity evidence.** S24, S25 and S26 are correlational and use stars as the outcome. S24's own caveat is that popular repositories exist without the recommended sections. None of the studies measures onboarding time or successful first use. No empirical study measuring onboarding outcomes was found in this survey.

## 4. What existing linters do not cover

What is covered today:

- **Markdown syntax and style** (L2, L3): thoroughly.
- **Link liveness** (L6, L7, L10): thoroughly, including anchors and local files in lychee.
- **Section presence by heading keyword** (L1, L12, L13, S21, L10): shallow. A heading named "Usage" with no content passes.
- **File presence at repository level** (S17, S18, L10, S21): LICENSE, CONTRIBUTING, SECURITY and similar. Scorecard has no README check at all. repolinter, the main general-purpose tool here, is archived.
- **Word-level prose** (L5, L8, L9): passive voice, weasel words, insensitive terms, readability scores.
- **Accessibility basics** (L3, L4): alt text present, generic link text.

The gap:

1. **Consistency between the README and the repository.** No tool checks that the install command uses the published package name, that `npm run` or `make` targets exist, that documented flags and environment variables exist in the code, that the stated license matches the LICENSE file and manifest, that the short description matches the manifest and host description (S1 requires it; L1 does not check it), or that stated version requirements match the manifest. This is deterministic and unaddressed.
2. **Executable examples.** S1 and S3 want examples that run. Only the LintMe research probe has an `execute` operator. Language-specific doctest tools exist but nothing README-oriented and cross-language was found.
3. **Substance of sections.** Presence checkers do not test that Install contains a command, that Usage contains an example with output, or that Contributing says whether pull requests are accepted. L1 skips the content requirements of its own spec.
4. **Purpose, status, audience, limitations.** The content most often missing according to S23 (Why in 26% of READMEs, When in 21%) is exactly what no linter looks for. Status can be partly cross-checked against the archived flag and commit activity.
5. **Ordering by reader need.** L1 checks order against fixed titles only. Nothing measures how far a reader must scroll to reach the description, the first command, or the first example (for example, lines or rendered screens before the first code block).
6. **Host-specific rendering.** No tool models the differences between GitHub, npm, PyPI and crates.io: relative links that break in registries, stripped HTML, README shadowing by `.github/README.md`, the 500 KiB cut-off, the npm page updating only on publish. `twine check` covers PyPI markup validity only.
7. **Accessibility beyond alt-text presence.** Alt text quality, information carried only by images or GIFs, theme-dependent images that vanish in dark mode, emoji used as bullets, and alert overuse are not checked by mainstream linters.
8. **Badge health.** Stale, broken or failing badges, retired CI services, and badge overload are unchecked.
9. **Freshness.** Only LintMe has a "README updated in the last year" rule. Nothing compares README changes with releases or API changes.
10. **Leftover scaffolding.** Template placeholders and untouched generator READMEs are not detected, although S24 shows near-empty READMEs are the most common case.
11. **Project-type awareness.** Requirements differ for a library, CLI, application, dataset or documentation repository. S1 has one switch (documentation repositories); LintMe has three presets. Mainstream tools have none.
12. **Audience coverage.** No tool reports whether each audience is served: a user (install, use, get help), a contributor (build, test, submit), a maintainer or evaluator (status, license, security), and an AI agent (copyable commands, text rather than images, consistency with AGENTS.md).
13. **Graded, explainable output combining both kinds of checks.** Existing tools are either deterministic and shallow, or LLM-only and non-reproducible. S28 argues, with a small evaluation, that the combination with line-level blame and tunable rules is the missing piece; it exists only as a research prototype.
14. **Evidence weighting.** No tool ties rule severity to evidence. The effect sizes in S24 and the frequencies in S23 could rank rules, with the caveat that they are correlational.

## 5. Verification notes

- Art of README: original URL dead on the research date; content verified from an archive snapshot and a fork.
- Could not fetch: CNCF maintainer templates (redirect loop), npmjs.com package page for readme-score (403; registry API used instead), the JSS 2023 paper body.
- Not verified from a primary source: README filename precedence within one directory on GitHub; exact contents of the GitHub community standards checklist beyond the five items in the docs; PyPI behavior for relative links; markdown-link-check anchor checking; Vale style package list; readme-doctor; the venue of S24; the release date of the Good Docs templates 1.4.
- The awesome-readme feature counts and the markdownlint-github rule behaviors are model-derived readings, not figures stated by the sources.
- Diátaxis says nothing about READMEs; the mapping in S9 is an inference.
