# Saravapos Translation Protocol — 14-Day Build Plan

> Project: **Saravapos** (formerly internal codename `worldview` / `wv`).
> Cadence: 1-2 hrs/day. 10-25 commits/day. Conventional Commits.
> Stack: TypeScript / Node, pnpm workspaces. License: MIT.
> MVP scope: bidirectional worldview-aware translation CLI. Local-first profiles.

---

## How to use this file

Each day = section. Each commit = checkbox with conventional-commit subject + body hint.
When user says **"run Day N"**, agent executes that day's commits sequentially. One commit per logical change. Do not batch.

Commit format: `type(scope): subject` — types: `feat`, `fix`, `chore`, `docs`, `test`, `refactor`, `build`, `ci`, `style`.

---

## Day 1 — Repo init + skeleton (12 commits)

Goal: empty monorepo public on GitHub, pnpm workspaces wired, lint/format ready.

1. `chore: init pnpm workspace` — `package.json` root, `pnpm-workspace.yaml`, `.nvmrc` (node 20).
2. `chore: add .gitignore` — node_modules, dist, .env, .DS_Store.
3. `docs: add MIT LICENSE` — year 2026, holder = user.
4. `docs: add README stub` — project name, one-line pitch, status: alpha.
5. `chore: add tsconfig.base.json` — strict, esnext, nodenext modules.
6. `chore: add prettier config` — `.prettierrc` + `.prettierignore`.
7. `chore: add eslint config` — flat config, typescript-eslint recommended.
8. `chore: scaffold packages/spec` — empty package.json + src/index.ts.
9. `chore: scaffold packages/sdk` — empty package.json + src/index.ts.
10. `chore: scaffold packages/cli` — empty package.json + src/index.ts + bin entry.
11. `chore: scaffold packages/adapters + packages/eval` — empty package skeletons.
12. `chore: add EditorConfig` — 2-space, LF, UTF-8.

End-of-day check: `pnpm install` clean. `pnpm -r build` no-op succeeds.

---

## Day 2 — CI + dev tooling (14 commits)

Goal: GitHub Actions runs lint + typecheck + test on PR. Husky pre-commit.

1. `ci: add github actions workflow ci.yml` — node 20, pnpm cache, runs install.
2. `ci: add lint step` — `pnpm -r lint`.
3. `ci: add typecheck step` — `pnpm -r typecheck`.
4. `ci: add test step` — `pnpm -r test` (vitest).
5. `build: add vitest to workspace` — root devDep, shared config.
6. `build: add typecheck script per package` — `tsc --noEmit`.
7. `chore: add husky` — pre-commit hook.
8. `chore: add lint-staged config` — prettier+eslint on staged.
9. `chore: add commitlint` — conventional commits enforced.
10. `chore: add issue templates` — bug, feature, question in `.github/ISSUE_TEMPLATE`.
11. `chore: add PR template` — what/why/testing checklist.
12. `chore: add CODE_OF_CONDUCT.md` — contributor covenant.
13. `chore: add CONTRIBUTING.md` — dev setup, commit style, PR flow.
14. `docs: add badges to README` — CI status, license, npm (placeholder).

End-of-day check: open dummy PR, all checks green.

---

## Day 3 — Schema spec (15 commits)

Goal: profile JSON Schema v0.1 drafted + validated against samples.

1. `feat(spec): add schema_version field constant` — `SCHEMA_VERSION = "0.1"`.
2. `feat(spec): define identity sub-schema` — display_name, languages, region.
3. `test(spec): identity schema validates valid sample` — vitest + ajv.
4. `test(spec): identity schema rejects missing display_name`.
5. `feat(spec): define expertise sub-schema` — domain, level enum, years.
6. `test(spec): expertise rejects bad level value`.
7. `feat(spec): define analogy_bank sub-schema` — concept, metaphor, domain.
8. `test(spec): analogy_bank accepts empty array`.
9. `feat(spec): define cognitive_style sub-schema` — mode enum, prefers, abstraction_tolerance.
10. `feat(spec): define cultural_context sub-schema` — references_that_land[], references_to_avoid[].
11. `feat(spec): compose top-level profile schema` — combines all sub-schemas, schema_version required.
12. `test(spec): full profile validates end-to-end`.
13. `feat(spec): export schema as JSON + TypeScript type` — ts-json-schema-generator or hand-write types.
14. `docs(spec): inline JSDoc on each schema field`.
15. `chore(spec): export schema from package index`.

End-of-day check: `import { profileSchema, Profile } from '@saravapos/spec'` works in sdk pkg.

---

## Day 4 — Spec doc + rationale (12 commits)

Goal: human-readable spec doc devs can read in 10 min.

1. `docs: create docs/spec.md skeleton` — headings: motivation, scope, schema, semantics, examples, non-goals.
2. `docs(spec): write motivation section` — worldview translation problem statement.
3. `docs(spec): write scope + non-goals` — explicitly OUT: session portability, hosted, GUI.
4. `docs(spec): document identity fields` — table.
5. `docs(spec): document expertise fields + level definitions`.
6. `docs(spec): document analogy_bank with example`.
7. `docs(spec): document cognitive_style options`.
8. `docs(spec): document cultural_context`.
9. `docs(spec): add full profile YAML example inline`.
10. `docs(spec): add semantics section` — how translator consumes each field.
11. `docs(spec): add versioning policy` — semver on schema_version.
12. `docs: link spec.md from README`.

End-of-day check: spec doc renders cleanly on GitHub.

---

## Day 5 — Sample profiles (10 commits)

Goal: 4 hand-authored profiles to drive eval + dogfood.

1. `feat(profiles): add profiles/ directory + README`.
2. `feat(profiles): add chess-expert.yaml` — strong chess, weak F1.
3. `test(profiles): chess-expert validates against schema`.
4. `feat(profiles): add f1-fan.yaml` — strong F1, weak chess.
5. `test(profiles): f1-fan validates`.
6. `feat(profiles): add software-engineer.yaml` — technical, abstraction-tolerant.
7. `feat(profiles): add curious-novice.yaml` — generalist, low jargon tolerance.
8. `test(profiles): all sample profiles validate in one suite`.
9. `docs(profiles): add profiles/README explaining each`.
10. `chore: add npm script `pnpm validate:profiles` for CI`.

End-of-day check: CI runs profile validation, all green.

---

## Day 6 — SDK: loadProfile + types (15 commits)

Goal: load YAML from disk, validate, return typed object. Strict errors.

1. `feat(sdk): add yaml dependency` — `yaml` package.
2. `feat(sdk): add ajv dependency` — JSON Schema validator.
3. `feat(sdk): scaffold loadProfile signature` — `loadProfile(path: string): Promise<Profile>`.
4. `feat(sdk): read file via fs/promises`.
5. `feat(sdk): parse YAML to object`.
6. `feat(sdk): validate parsed object against profileSchema`.
7. `feat(sdk): throw ProfileValidationError with field path on invalid`.
8. `test(sdk): loadProfile happy path with chess-expert.yaml`.
9. `test(sdk): loadProfile throws on missing file`.
10. `test(sdk): loadProfile throws ProfileValidationError on bad schema`.
11. `test(sdk): error message includes failing field path`.
12. `feat(sdk): add loadProfileFromString variant` — for tests + URL fetches later.
13. `test(sdk): loadProfileFromString round-trips`.
14. `refactor(sdk): extract validator into separate module`.
15. `chore(sdk): export loadProfile + types from index`.

End-of-day check: load all 4 sample profiles in a test, no errors.

---

## Day 7 — LLM adapter interface + Anthropic adapter (16 commits)

Goal: pluggable LLM backends. First adapter: Anthropic.

1. `feat(adapters): define LLMAdapter interface` — `name`, `complete({system, user, model?}) => Promise<string>`.
2. `feat(adapters): define CompletionOptions + CompletionResult types`.
3. `test(adapters): mock adapter implements interface` — sanity test.
4. `feat(adapters): scaffold AnthropicAdapter class`.
5. `feat(adapters): add @anthropic-ai/sdk dependency`.
6. `feat(adapters): AnthropicAdapter constructor reads ANTHROPIC_API_KEY from env or opts`.
7. `feat(adapters): AnthropicAdapter.complete calls messages.create`.
8. `feat(adapters): default model = claude-sonnet-4-6`.
9. `feat(adapters): extract text from response content blocks`.
10. `feat(adapters): handle API errors with typed AdapterError`.
11. `test(adapters): AnthropicAdapter with mocked SDK returns expected text`.
12. `test(adapters): AnthropicAdapter surfaces API error as AdapterError`.
13. `feat(adapters): add resolveAdapter(name) factory function`.
14. `test(adapters): resolveAdapter('anthropic') returns AnthropicAdapter`.
15. `docs(adapters): README explaining BYOK + supported providers`.
16. `chore(adapters): export interface + adapters from index`.

End-of-day check: integration test (gated on `ANTHROPIC_API_KEY`) hits real API once.

---

## Day 8 — OpenAI + Ollama adapters (14 commits)

Goal: 2 more adapters. Provider parity for v1.

1. `feat(adapters): add openai dependency`.
2. `feat(adapters): scaffold OpenAIAdapter`.
3. `feat(adapters): OpenAIAdapter reads OPENAI_API_KEY`.
4. `feat(adapters): OpenAIAdapter default model = gpt-4o`.
5. `feat(adapters): OpenAIAdapter.complete uses chat.completions.create`.
6. `test(adapters): OpenAIAdapter mocked returns text`.
7. `feat(adapters): scaffold OllamaAdapter` — uses fetch to localhost:11434.
8. `feat(adapters): OllamaAdapter default model = llama3.1`.
9. `feat(adapters): OllamaAdapter.complete POSTs /api/chat`.
10. `test(adapters): OllamaAdapter with fetch mock returns text`.
11. `feat(adapters): extend resolveAdapter to handle 'openai' + 'ollama'`.
12. `test(adapters): resolveAdapter throws for unknown name`.
13. `docs(adapters): document each adapter's env vars + default model`.
14. `chore(adapters): export OpenAIAdapter + OllamaAdapter`.

End-of-day check: switch provider via `SARAVAPOS_PROVIDER` env var works end-to-end with mocks.

---

## Day 9 — `translate()` v0 (18 commits)

Goal: end-to-end translate function. Naive prompt, no analogy injection yet.

1. `feat(sdk): scaffold translate signature` — `translate({text, from, to, adapter}) => Promise<string>`.
2. `feat(sdk): create prompts/ directory in sdk`.
3. `feat(sdk): add buildSystemPrompt(from, to) function`.
4. `feat(sdk): system prompt describes from-profile context`.
5. `feat(sdk): system prompt describes to-profile context`.
6. `feat(sdk): system prompt instructs faithful semantic translation`.
7. `feat(sdk): buildUserPrompt wraps source text with markers`.
8. `feat(sdk): translate() calls adapter.complete with built prompts`.
9. `feat(sdk): translate() returns raw text response`.
10. `test(sdk): translate calls adapter with expected system prompt` — mock adapter.
11. `test(sdk): translate passes user text unchanged in user prompt`.
12. `test(sdk): translate returns adapter response`.
13. `feat(sdk): add optional model + temperature overrides`.
14. `feat(sdk): export translate from index`.
15. `feat(examples): add examples/basic.ts` — chess concept → f1-fan profile.
16. `docs(examples): add examples/README walking through basic.ts`.
17. `chore: add `pnpm example:basic` script`.
18. `docs(sdk): add usage snippet to packages/sdk/README`.

End-of-day check: run `pnpm example:basic` with real API key, produces translated output.

---

## Day 10 — Unit tests + coverage (15 commits)

Goal: harden SDK before CLI work. Coverage > 80% on sdk + spec.

1. `test(spec): add edge case — empty analogy_bank`.
2. `test(spec): unknown top-level field rejected (additionalProperties: false)`.
3. `feat(spec): set additionalProperties: false on all sub-schemas`.
4. `test(sdk): loadProfile handles BOM in YAML`.
5. `test(sdk): loadProfile rejects non-object root`.
6. `test(sdk): translate handles empty text`.
7. `test(sdk): translate handles 10k-char text`.
8. `test(sdk): translate same-profile returns sensible output (snapshot via mock)`.
9. `test(adapters): AnthropicAdapter retries on 429 with backoff` (if implementing) OR doc as future work.
10. `feat(adapters): add basic retry-on-429 with single retry` — small + tested.
11. `test(adapters): retry logic mocked`.
12. `build: add coverage reporter to vitest config`.
13. `ci: upload coverage artifact in CI`.
14. `chore: add codecov.yml (optional, can skip if not wiring service)`.
15. `docs: add "running tests" section to CONTRIBUTING`.

End-of-day check: `pnpm -r test --coverage` shows >80% on sdk + spec.

---

## Day 11 — CLI scaffold (12 commits)

Goal: `saravapos --help` works. Subcommand structure.

1. `feat(cli): add commander dependency`.
2. `feat(cli): create src/cli.ts entry`.
3. `feat(cli): add shebang + bin entry in package.json`.
4. `feat(cli): version flag reads from package.json`.
5. `feat(cli): add `translate` subcommand stub` — prints "not yet implemented".
6. `feat(cli): add `validate` subcommand stub`.
7. `feat(cli): add `init` subcommand stub`.
8. `feat(cli): add global --provider flag` (anthropic|openai|ollama).
9. `feat(cli): add global --verbose flag`.
10. `build(cli): add tsup or esbuild bundling config`.
11. `chore(cli): add `pnpm dev:cli` script for local linking`.
12. `docs(cli): packages/cli/README with subcommand table`.

End-of-day check: `pnpm --filter @saravapos/cli build && node packages/cli/dist/cli.js --help` shows help.

---

## Day 12 — `saravapos translate` command (16 commits)

Goal: working translate command end-to-end from terminal.

1. `feat(cli): translate --from <path> required flag`.
2. `feat(cli): translate --to <path> required flag`.
3. `feat(cli): translate --input <path> flag (file)`.
4. `feat(cli): translate --text <string> flag (inline)`.
5. `feat(cli): translate reads stdin if no --input/--text`.
6. `feat(cli): translate validates exactly one input source provided`.
7. `feat(cli): translate loads both profiles via sdk.loadProfile`.
8. `feat(cli): translate resolves adapter via --provider or env`.
9. `feat(cli): translate calls sdk.translate and writes to stdout`.
10. `feat(cli): translate --output <path> writes to file`.
11. `feat(cli): translate --model override`.
12. `feat(cli): friendly error on ProfileValidationError (red, field path)`.
13. `feat(cli): friendly error on AdapterError (red, hint about API key)`.
14. `test(cli): translate happy path with mock adapter (integration test)`.
15. `test(cli): translate fails with helpful message when --from missing`.
16. `docs(cli): add translate examples to packages/cli/README`.

End-of-day check: `saravapos translate --from profiles/chess-expert.yaml --to profiles/f1-fan.yaml --text "I sacrificed a pawn for a positional advantage"` produces F1-flavored explanation.

---

## Day 13 — `saravapos validate` + `saravapos init` (14 commits)

Goal: profile lifecycle commands. Authoring UX baseline.

1. `feat(cli): validate <path> loads + validates profile`.
2. `feat(cli): validate prints green checkmark + summary on success`.
3. `feat(cli): validate prints field-level errors on failure (red)`.
4. `feat(cli): validate exits non-zero on invalid`.
5. `test(cli): validate command success + failure paths`.
6. `feat(cli): init --output <path> writes blank profile YAML`.
7. `feat(cli): init prompts (inquirer) for display_name + languages + region`.
8. `feat(cli): init prompts for at least 1 expertise entry`.
9. `feat(cli): init writes well-commented YAML template`.
10. `feat(cli): init refuses to overwrite without --force`.
11. `test(cli): init writes valid profile that passes validate`.
12. `feat(cli): add `saravapos list-providers` command — prints supported adapters + env vars`.
13. `feat(cli): add `saravapos version` alongside --version`.
14. `docs(cli): expand README with full command reference`.

End-of-day check: `saravapos init -o me.yaml` interactive flow produces a file that `saravapos validate me.yaml` passes.

---

## Day 14 — Alpha release prep (12 commits)

Goal: published to npm under `@saravapos/*` (or chosen scope), tagged `alpha`, announced internally.

1. `chore: set package versions to 0.1.0-alpha.0` (all publishable packages).
2. `chore: set publishConfig.access=public in each package.json`.
3. `chore: add `files` field to package.json (dist/, README.md, LICENSE only)`.
4. `chore: add prepublishOnly script — build + test`.
5. `feat(spec): freeze schema_version "0.1" — add deprecation policy comment`.
6. `docs: write CHANGELOG.md — 0.1.0-alpha.0 entry`.
7. `docs: write top-level README — pitch, install, quickstart, links`.
8. `chore: dry-run pnpm publish on each package, verify tarball contents`.
9. `chore: publish @saravapos/spec` (manual or `pnpm -r publish --tag alpha`).
10. `chore: publish @saravapos/sdk`.
11. `chore: publish @saravapos/adapters + @saravapos/cli`.
12. `chore: tag v0.1.0-alpha.0 + push tag` — creates GitHub release auto-draft.

End-of-day check: `npx @saravapos/cli@alpha --help` works on a fresh machine.

---

## Open items to resolve before Day 1

These block nothing but must be answered:

- **Final or codename name?** Default to `saravapos` if undecided. If renamed, search-replace before Day 14.
- **GitHub org/handle for repo URL** — needed Day 1 to push.
- **Primary LLM provider** you hold a key for — sets which adapter to integration-test against (Day 7 vs Day 8).
- **Dev-log channel** — Twitter/X, dev.to, Mastodon, none. Affects nothing before Day 14 announce.

---

## Week 3 — Eval harness (Days 15-19)

> Goal: a repeatable signal on translation _quality_, so Weeks 4-5 (prompt
> tuning, analogy injection) are driven by data instead of vibes. Lives in the
> existing `packages/eval` (stays `private: true` — never published). Depends on
> `@saravapos/sdk`, `@saravapos/adapters`, `@saravapos/spec`.
>
> Design decisions baked in:
>
> - **Golden case** = one YAML file: `from`/`to` profile paths, `input` text, a
>   `rubric` (named criteria), optional `must_include`/`must_avoid` lexical
>   checks. Cases live in `packages/eval/cases/`.
> - **Judge** = an `LLMAdapter` call with a scoring system prompt that returns
>   strict JSON: per-criterion 1-5 score + one-line reasoning. Default judge
>   model `claude-sonnet-4-6`, `temperature: 0`.
> - **Determinism + cost**: translate + judge both run at `temperature: 0`;
>   responses cached on disk keyed by a hash of (prompt + model) so re-runs are
>   free. `--no-cache` to force.
> - **CI gate**: mean score >= threshold AND no single case below a floor.
>   Gated on `ANTHROPIC_API_KEY` so fork PRs skip rather than fail.

---

## Day 15 — Eval scaffold + golden-case format (14 commits)

Goal: a typed golden-case loader + the case schema. No LLM calls yet.

1. `feat(eval): add dependencies` — `@saravapos/sdk`, `@saravapos/adapters`, `@saravapos/spec` (workspace:\*), `yaml`, `ajv`.
2. `feat(eval): define GoldenCase type` — `id`, `from`, `to`, `input`, `rubric[]`, `must_include?`, `must_avoid?`.
3. `feat(eval): define Rubric criterion type` — `name`, `description`, `weight?` (default 1).
4. `feat(eval): add goldenCaseSchema (ajv)` — `additionalProperties: false`.
5. `test(eval): schema validates a sample case`.
6. `test(eval): schema rejects case missing input`.
7. `feat(eval): loadCase(path) — read YAML, validate, return typed GoldenCase`.
8. `feat(eval): loadCase throws CaseValidationError with field path`.
9. `test(eval): loadCase happy path + bad-schema path`.
10. `feat(eval): loadAllCases(dir) — glob cases/*.yaml, sorted by id`.
11. `test(eval): loadAllCases returns cases in stable order`.
12. `feat(eval): add cases/ directory + cases/README explaining the format`.
13. `feat(eval): add one seed case` — chess-expert → f1-fan, the pawn-sacrifice line.
14. `chore(eval): export types + loaders from index`.

End-of-day check: `loadAllCases('cases')` returns the seed case, fully typed.

---

## Day 16 — Golden-case corpus (10 commits)

Goal: enough cases to make the score meaningful across profile pairs + directions.

1. `feat(eval): case — chess-expert → curious-novice (jargon stripping)`.
2. `feat(eval): case — f1-fan → chess-expert (reverse direction)`.
3. `feat(eval): case — software-engineer → curious-novice (abstraction lowering)`.
4. `feat(eval): case — curious-novice → software-engineer (abstraction raising)`.
5. `feat(eval): case — software-engineer → f1-fan (cross-domain analogy)`.
6. `feat(eval): case with must_avoid` — assert a jargon term does NOT survive.
7. `feat(eval): case with must_include` — assert a target-domain anchor appears.
8. `feat(eval): edge case — empty-ish input (single word)`.
9. `test(eval): every case in cases/ validates against schema (one suite)`.
10. `docs(eval): cases/README — table of cases, what each probes`.

End-of-day check: `pnpm --filter @saravapos/eval test` validates the whole corpus, green.

---

## Day 17 — LLM judge (16 commits)

Goal: score one (case, translation) pair into structured JSON.

1. `feat(eval): define JudgeResult type` — `overall` (1-5), `criteria[] {name, score, reasoning}`, `passedLexical` (bool).
2. `feat(eval): buildJudgeSystemPrompt(case)` — describes profiles + rubric, demands JSON-only output.
3. `feat(eval): buildJudgeUserPrompt(input, output)` — wraps source + translation with markers.
4. `feat(eval): judge(case, translation, adapter) — calls adapter at temperature 0`.
5. `feat(eval): parseJudgeResponse — strict JSON parse, throw JudgeParseError on malformed`.
6. `feat(eval): clamp + validate scores into 1-5, reject out-of-range`.
7. `feat(eval): runLexicalChecks(case, translation) — must_include / must_avoid`.
8. `feat(eval): fold lexical result into JudgeResult.passedLexical`.
9. `test(eval): judge with mock adapter returns parsed result`.
10. `test(eval): judge surfaces JudgeParseError on non-JSON`.
11. `test(eval): lexical must_avoid fails when banned term present`.
12. `test(eval): lexical must_include passes/fails correctly`.
13. `feat(eval): weighted overall score from per-criterion weights`.
14. `test(eval): weighted score math`.
15. `feat(eval): default judge model = claude-sonnet-4-6, overridable`.
16. `chore(eval): export judge from index`.

End-of-day check: unit suite green with mocks; no real API needed to test judge logic.

---

## Day 18 — Runner + caching + report (16 commits)

Goal: `eval run` executes the full corpus end-to-end and prints a report.

1. `feat(eval): add disk cache — key = sha256(provider+model+system+user)`.
2. `feat(eval): cachedComplete(adapter, opts) — read-through cache in .eval-cache/`.
3. `test(eval): cache hit skips adapter call (mock)`.
4. `feat(eval): runCase(case, translateAdapter, judgeAdapter) — translate then judge`.
5. `feat(eval): runCase returns {case, translation, result, ms}`.
6. `feat(eval): runSuite(cases, ...) — runs all, collects results`.
7. `feat(eval): aggregate — mean overall, min case, lexical pass rate`.
8. `feat(eval): scaffold bin/eval.ts CLI (commander)` — `eval run`.
9. `feat(eval): run --cases <dir> --provider <p> --judge-model <m> flags`.
10. `feat(eval): run --no-cache flag`.
11. `feat(eval): table report to stdout — per-case overall + pass/fail`.
12. `feat(eval): summary line — mean, min, lexical pass rate`.
13. `feat(eval): --json flag writes machine-readable report`.
14. `feat(eval): exit non-zero if any JudgeParseError (infra failure ≠ quality)`.
15. `feat(eval): add pnpm eval script at root` — `tsx packages/eval/bin/eval.ts run`.
16. `docs(eval): README — how to run, env vars, reading the report`.

End-of-day check: `pnpm eval run` with real key scores the corpus and prints a table.

---

## Day 19 — CI gate + baseline (12 commits)

Goal: eval score becomes a checked-in baseline and an optional CI gate.

1. `feat(eval): run --threshold <n> (mean floor) + --min-case <n> (per-case floor)`.
2. `feat(eval): run exits non-zero when below threshold or any case below floor`.
3. `test(eval): threshold logic — pass/fail boundaries (mock results)`.
4. `feat(eval): run --baseline <file> compares against saved scores`.
5. `feat(eval): report regressions (case dropped > delta vs baseline)`.
6. `feat(eval): run --write-baseline saves current scores`.
7. `chore(eval): commit eval-baseline.json from one real run`.
8. `ci: add eval job to ci.yml — runs only if ANTHROPIC_API_KEY secret present`.
9. `ci: eval job uses cache, runs eval run --threshold 3.5 --min-case 3`.
10. `ci: eval job is non-blocking (continue-on-error) for now — report only`.
11. `docs: add "Evals" section to CONTRIBUTING — how to add a case, update baseline`.
12. `docs: link eval results expectations from README roadmap`.

End-of-day check: CI eval job runs on a PR (when key present), prints scores, doesn't block. Re-plan Week 4 prompt-tuning against this baseline.

---

## Week 4 — Prompt engineering (Days 20-25)

> Goal: turn translation prompts from a single hand-written string into a set of
> named, swappable **strategies**, and give the eval harness an A/B **compare**
> mode so prompt changes are chosen by score, not vibes. Depends on the Day 19
> eval gate + baseline.
>
> Design decisions baked in:
>
> - A **PromptStrategy** is `{ name, description, buildSystemPrompt, buildUserPrompt }`.
>   `translate()` takes an optional `strategy` (name or object); default stays
>   `baseline`, so existing callers are unchanged.
> - Three seed variants: `baseline` (today's prompt, verbatim), `structured`
>   (sectioned system prompt + fidelity checklist), `fewShot` (structured plus
>   worked translation examples). All share the same profile rendering so the
>   A/B isolates the instruction change.
> - The eval harness threads a strategy through `runCase`, and a new
>   `eval compare --variants a,b` runs the corpus per variant, builds a
>   **scorecard** (per-case scores + delta), and names a winner by mean overall.
> - No live-API work is required to land the machinery: every strategy builder,
>   the registry, the scorecard, and the winner pick are pure + unit-tested. The
>   actual score measurement is a real-key `pnpm eval compare` run.

---

## Day 20 — Prompt strategies + eval A/B compare (20 commits)

Goal: swappable prompt strategies in the SDK and a `compare` command in eval.

1. `docs: detail Week 4 prompt-engineering plan (Days 20-25)` — this section.
2. `feat(sdk): define PromptStrategy interface` — name, description, builders.
3. `refactor(sdk): extract current prompts into the baseline strategy`.
4. `test(sdk): baseline strategy reproduces the current prompt`.
5. `feat(sdk): add structured prompt strategy` — sectioned system + fidelity checklist.
6. `test(sdk): structured strategy emits a sectioned system prompt`.
7. `feat(sdk): add few-shot prompt strategy` — structured plus worked examples.
8. `test(sdk): few-shot strategy includes worked examples`.
9. `feat(sdk): add prompt strategy registry and resolveStrategy`.
10. `test(sdk): resolveStrategy returns each variant and rejects unknown`.
11. `feat(sdk): translate() accepts an optional prompt strategy`.
12. `test(sdk): translate routes prompts through the chosen strategy`.
13. `chore(sdk): export prompt strategies from package index`.
14. `feat(eval): thread a prompt strategy through runCase and runSuite`.
15. `feat(eval): buildScorecard computes per-variant means and per-case deltas`.
16. `feat(eval): pickWinner selects the best variant by mean overall`.
17. `test(eval): scorecard deltas and winner selection`.
18. `feat(eval): formatScorecard renders a per-case comparison table`.
19. `feat(eval): add eval compare command across prompt variants`.
20. `docs(eval): document the compare command and prompt variants`.

End-of-day check: `pnpm eval compare --variants baseline,structured` (real key)
prints a scorecard and names a winner; SDK unit suite green without a key.

---

## Days 21-25 (outline, detail when Day 20 lands)

- Day 21: author 2-3 more candidate strategies from the Day 20 scorecard's weak cases.
- Day 22: per-criterion (not just overall) deltas in the scorecard; spot which rubric dimension each variant moves.
- Day 23: promote the winning strategy to default; record the score lift in CHANGELOG.
- Day 24: regression-guard the chosen prompt — snapshot its system prompt + re-baseline the corpus.
- Day 25: document the prompt-tuning loop in CONTRIBUTING (add a variant → compare → promote).

---

## Beyond Week 4 (preview, not detailed)

- Week 5 (Days 26-30): analogy_bank injection — concept extraction → metaphor lookup → prompt enrichment.
- Week 6 (Days 31-35): v0.1 stable release, announce externally (HN Show, dev.to, r/LocalLLaMA).

Re-plan Weeks 5-6 in detail after the Week 4 prompt work lands.
