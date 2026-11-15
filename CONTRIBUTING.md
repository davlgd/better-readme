# Contributing guidelines

This document explains how to change Better README: its rules, its checker, and its skill. People and coding agents follow it. The [README](./README.md#requirements) gives the requirements, and [`RULES.md`](./RULES.md) the rules.

## Propose a change

A rule earns its place when it's precise, and when a source or a real repository shows the problem it prevents. Before you add one, decide its kind:

- A checked rule, when a script can decide it without a false positive on a correct file
- A reviewed rule, when it needs to read the repository or to run a command

Prefer a missed problem to a false alarm: a checker that's wrong once gets turned off. Keep each change small, with one rule or one fix.

## Change a rule

A checked rule has four parts, which change together:

1. Its definition, in one of the three files of [`src/rules/`](./src/rules/)
2. Its row in [`RULES.md`](./RULES.md), with its reason in the paragraph under the table
3. Its cases in [`test/check.test.mjs`](./test/check.test.mjs)
4. Its option, when the rule has a threshold

The definition holds an identifier, a default level, a one-line summary, and a `check` function. The function reports a file, a line, and a message that tells what's wrong and how to fix it. Choose the file from what the rule reads:

- `readme.mjs`: the README
- `content.mjs`: any document
- `repository.mjs`: the documents and the repository together

A rule receives the model of the repository that [`src/project.mjs`](./src/project.mjs) builds, the options, and a `report` function. Read a neighboring rule for the details.

The row repeats the identifier, the level, and the summary of the code, word for word.

The tests need two kinds of cases:

- In `CASES`, a change to the clean repository of the tests that this rule alone reports
- In `ACCEPTED`, each correct text that the rule could report by mistake

The option goes in `DEFAULT_OPTIONS` of [`src/engine.mjs`](./src/engine.mjs), and in the [README](./README.md#thresholds).

Three properties of the checker never change:

- It has no dependency
- It never uses the network
- It never runs a command that the checked repository documents or defines

It calls Git through one function, which turns off the hooks and the file monitor of the repository.

## Check your change

Run the tests:

```bash
npm test
```

They also verify two documents:

- `RULES.md` lists every rule as the code defines it
- The README gives the right number of rules

Then run the checker on the repository itself, which follows its own rules:

```bash
npm run check
```

Before you add or change a checked rule, run it on several real repositories. Read each finding: a false positive is a bug of the rule. Clone these repositories in `sources/`, which Git ignores.

The tests don't prove that a rule is useful, only that it reports what it claims.

When you change a document, read it on GitHub too, as [`review/rendering`](./RULES.md#all-documents) asks.

## Commit messages

Write the subject as a lowercase imperative sentence, without a full stop, in 72 characters at most. Name the rule when the change concerns one:

```text
add the consistency/license-matches rule
skip bun file runs in consistency/commands-exist
document the wrap option
```

## Submit a change

Open a pull request on [the repository](https://github.com/davlgd/better-readme/pulls). Describe it briefly: its reason, and how you verified it. For a rule, give the repositories you ran it on, and what it found there. The maintainer reviews every change.

Ask the maintainer before you:

- Change the default level of an existing rule
- Remove a rule
- Add a dependency

## Contributions made with AI tools

Contributions made with AI tools are welcome. Their author answers for every line, has run the checks above, and can explain the change during the review.
