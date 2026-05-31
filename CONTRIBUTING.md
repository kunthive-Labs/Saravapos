# Contributing to Saravapos

Thank you for considering a contribution. This guide covers dev setup, commit conventions, and the PR flow.

## Dev setup

**Prerequisites:** Node 20+, pnpm 10+.

```bash
# clone and install
git clone git@github.com:kunthive-Labs/Saravapos.git
cd Saravapos
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
  cli/        # saravapos command-line tool
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
pnpm --filter @saravapos/spec test
pnpm --filter @saravapos/sdk build
```

## Running tests

The repo uses [Vitest](https://vitest.dev/) with a single root config that
discovers tests across all packages.

```bash
# Run the full test suite once.
pnpm test

# Watch mode — reruns affected tests on save.
pnpm test:watch

# Coverage with text + lcov + html reporters. Output lands in ./coverage/.
pnpm test:coverage

# Run a single test file or pattern.
pnpm vitest run packages/sdk/src/translate.test.ts
pnpm vitest run -t "retries once on 429"
```

Coverage gates are configured per package in `vitest.config.ts`. CI uploads the
`coverage/` directory as an artifact on every run; if Codecov is enabled for
the repo, it will also post a PR comment per `codecov.yml`.

Snapshot tests live next to their source under `__snapshots__/`. Update them
intentionally with `pnpm vitest run --update` after reviewing the diff.

## Evals

The `@saravapos/eval` harness scores translation quality against a corpus of
golden cases. It gives Weeks 4–5 (prompt tuning, analogy injection) a data
signal instead of vibes. The harness needs an `ANTHROPIC_API_KEY`; runs are
cached on disk in `.eval-cache/`, so re-running an unchanged corpus is free.

```bash
# Score the whole corpus and print a table + summary.
ANTHROPIC_API_KEY=sk-... pnpm eval run

# Enforce quality floors (non-zero exit on failure).
pnpm eval run --threshold 3.5 --min-case 3

# Compare against the checked-in baseline and report regressions.
pnpm eval run --baseline eval-baseline.json
```

### Adding a case

1. Add a YAML file under `packages/eval/cases/` — see `cases/README.md` for the
   schema (`id`, `from`, `to`, `input`, `rubric[]`, optional
   `must_include` / `must_avoid`).
2. Give it a unique, descriptive `id` (e.g. `swe-to-novice-memleak`); the id is
   the sort key and report label.
3. `pnpm --filter @saravapos/eval test` to confirm it validates.

### Updating the baseline

`eval-baseline.json` is the regression reference. The committed file is a
**placeholder seed** (all-zero scores) — regenerate it from a real run before
relying on regression detection:

```bash
ANTHROPIC_API_KEY=sk-... pnpm eval run --write-baseline eval-baseline.json
```

Commit the regenerated baseline in the same PR as any intended score change, so
reviewers can see the delta. CI runs the eval job only when the
`ANTHROPIC_API_KEY` secret is present (fork PRs skip it), and it is
`continue-on-error` for now — report-only, never blocking.

## Questions

Open a GitHub Discussion or file an issue using the question template.
