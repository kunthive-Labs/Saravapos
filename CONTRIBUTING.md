# Contributing to worldview

Thank you for considering a contribution. This guide covers dev setup, commit conventions, and the PR flow.

## Dev setup

**Prerequisites:** Node 20+, pnpm 10+.

```bash
# clone and install
git clone git@github.com:8harath/Context.git
cd Context
pnpm install

# build all packages
pnpm build

# run tests
pnpm test

# lint + format check
pnpm lint
pnpm format:check
```

## Repository layout

```
packages/
  spec/       # JSON Schema + TypeScript types for profiles
  sdk/        # loadProfile, translate — core library
  adapters/   # LLM backends (Anthropic, OpenAI, Ollama)
  cli/        # wv command-line tool
  eval/       # eval harness (future)
profiles/     # hand-authored sample profiles
docs/         # spec doc and references
```

## Commit style

We use [Conventional Commits](https://www.conventionalcommits.org/) enforced by commitlint.

```
type(scope): subject
```

Types: `feat`, `fix`, `chore`, `docs`, `test`, `refactor`, `build`, `ci`, `style`.
Scopes: `spec`, `sdk`, `adapters`, `cli`, `eval`, `profiles`.

Subject: present tense, lowercase, no period. ≤72 chars.

Examples:

- `feat(sdk): add loadProfile function`
- `fix(adapters): handle 429 rate limit with backoff`
- `docs(spec): clarify analogy_bank field semantics`

## PR flow

1. Fork the repo and create a branch from `main`.
2. Keep each PR focused — one logical change.
3. Ensure `pnpm test`, `pnpm lint`, and `pnpm typecheck` all pass locally.
4. Fill in the PR template (what / why / how to test).
5. Request review from a maintainer.

PRs that touch the schema (`packages/spec`) must include a test.

## Running a specific package

```bash
pnpm --filter @wv/spec test
pnpm --filter @wv/sdk build
```

## Questions

Open a GitHub Discussion or file an issue using the question template.
