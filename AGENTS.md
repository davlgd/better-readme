# AGENTS.md

The rules of this repository apply to coding agents. Before you change anything, read [CONTRIBUTING.md](./CONTRIBUTING.md). Read [`RULES.md`](./RULES.md) too when the change concerns a rule.

[`SKILL.md`](./SKILL.md) isn't an instruction file for this repository. It's the skill that Better README provides to the agents of its users.

## Before you report a change as done

- Run the [checks](./CONTRIBUTING.md#check-your-change), in their order
- Keep the [four parts of a rule](./CONTRIBUTING.md#change-a-rule) together
- Run a new or changed rule on real repositories
- Report what the rule found there, including the false positives

## What the code doesn't tell

- The checker has no dependency: don't add a package
- The checker never uses the network: don't fetch a URL
- `sources/` holds clones of other repositories, which Git ignores: never edit or commit them
- A test fails when a row of `RULES.md` differs from the summary of its rule in the code
- A test fails when the README gives another number of rules than the code

## Boundaries

Ask before the changes that [CONTRIBUTING.md](./CONTRIBUTING.md#submit-a-change) leaves to the maintainer. Ask too before you choose or change a license.
