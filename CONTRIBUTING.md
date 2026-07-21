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

## Release verification

Run both built-artifact checks before tagging a release:

```bash
pnpm verify:release
pnpm smoke:cli
```

`verify:release` rejects version drift across publishable packages, prerelease versions, missing changelog headings, and stale CLI version output. `smoke:cli` exercises help, version reporting, profile validation, and `doctor` against the compiled executable. CI runs both checks after building.

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

### Tuning prompts (the variant → compare → promote loop)

Translation prompts are swappable **strategies** (`packages/sdk/src/prompts/strategies/`).
The loop for improving them is data-driven, not by feel:

1. **Add a candidate.** Export a new `PromptStrategy` (reuse `buildStructuredSystemPrompt`
   so the A/B isolates only your instruction change), register it in
   `packages/sdk/src/prompts/registry.ts`, and export it from `prompts/index.ts`. It is now
   available to both `translate({ strategy })` and `eval compare`. Add a unit test plus run
   `vitest run -u` to record its entry in the prompt snapshot guard
   (`prompts/__snapshots__/promptSnapshots.test.ts.snap`).

2. **Compare (needs a key).** Run the corpus across the variants and read the scorecard —
   the per-criterion breakdown shows _which_ rubric dimension each variant moved:

   ```bash
   ANTHROPIC_API_KEY=sk-... pnpm build   # the eval CLI imports the SDK's built dist/
   ANTHROPIC_API_KEY=sk-... pnpm eval compare \
     --variants baseline,structured,fewShot,plainLanguage,planned,analogyFirst,dynamicAnalogy
   ```

3. **Promote the winner.** When a variant clearly beats `baseline`, make it the default:
   - Change `DEFAULT_STRATEGY` in `packages/sdk/src/prompts/registry.ts` to the winner's name.
   - Update the expectation in `prompts/registry.test.ts` and the two default-strategy
     assertions in `translate.test.ts` (the "defaults to baseline" tests).
   - Refresh the snapshot in `translate.test.ts` with `vitest run -u` (the default system
     prompt changed — review the diff). The byte-for-byte `baseline.test.ts` is unaffected
     (it pins `baseline`, not the default).
   - Record the score lift in `CHANGELOG.md`.

4. **Re-baseline.** Promoting changes the default prompt, so regenerate the baseline (below)
   in the same PR so reviewers see the corpus-wide delta.

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
