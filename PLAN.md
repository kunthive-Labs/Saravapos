# Worldview Translation Protocol — 14-Day Build Plan

> Codename: **`wv`** (worldview). Rename pre-launch.
> Cadence: 1-2 hrs/day. 10-25 commits/day. Conventional Commits.
> Stack: TypeScript / Node, pnpm workspaces. License: MIT.
> MVP scope: bidirectional worldview translation CLI. Local-first profiles.

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

End-of-day check: `import { profileSchema, Profile } from '@wv/spec'` works in sdk pkg.

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

End-of-day check: switch provider via `WV_PROVIDER` env var works end-to-end with mocks.

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

Goal: `wv --help` works. Subcommand structure.

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

End-of-day check: `pnpm --filter @wv/cli build && node packages/cli/dist/cli.js --help` shows help.

---

## Day 12 — `wv translate` command (16 commits)

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

End-of-day check: `wv translate --from profiles/chess-expert.yaml --to profiles/f1-fan.yaml --text "I sacrificed a pawn for a positional advantage"` produces F1-flavored explanation.

---

## Day 13 — `wv validate` + `wv init` (14 commits)

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
12. `feat(cli): add `wv list-providers` command — prints supported adapters + env vars`.
13. `feat(cli): add `wv version` alongside --version`.
14. `docs(cli): expand README with full command reference`.

End-of-day check: `wv init -o me.yaml` interactive flow produces a file that `wv validate me.yaml` passes.

---

## Day 14 — Alpha release prep (12 commits)

Goal: published to npm under `@wv/*` (or chosen scope), tagged `alpha`, announced internally.

1. `chore: set package versions to 0.1.0-alpha.0` (all publishable packages).
2. `chore: set publishConfig.access=public in each package.json`.
3. `chore: add `files` field to package.json (dist/, README.md, LICENSE only)`.
4. `chore: add prepublishOnly script — build + test`.
5. `feat(spec): freeze schema_version "0.1" — add deprecation policy comment`.
6. `docs: write CHANGELOG.md — 0.1.0-alpha.0 entry`.
7. `docs: write top-level README — pitch, install, quickstart, links`.
8. `chore: dry-run pnpm publish on each package, verify tarball contents`.
9. `chore: publish @wv/spec` (manual or `pnpm -r publish --tag alpha`).
10. `chore: publish @wv/sdk`.
11. `chore: publish @wv/adapters + @wv/cli`.
12. `chore: tag v0.1.0-alpha.0 + push tag` — creates GitHub release auto-draft.

End-of-day check: `npx @wv/cli@alpha --help` works on a fresh machine.

---

## Open items to resolve before Day 1

These block nothing but must be answered:

- **Final or codename name?** Default to `wv` if undecided. If renamed, search-replace before Day 14.
- **GitHub org/handle for repo URL** — needed Day 1 to push.
- **Primary LLM provider** you hold a key for — sets which adapter to integration-test against (Day 7 vs Day 8).
- **Dev-log channel** — Twitter/X, dev.to, Mastodon, none. Affects nothing before Day 14 announce.

---

## Beyond Day 14 (preview, not detailed)

- Week 3 (Days 15-19): eval harness — golden cases, LLM judge, CI gate.
- Week 4 (Days 20-25): prompt engineering loop driven by eval signal.
- Week 5 (Days 26-30): analogy_bank injection — concept extraction → metaphor lookup → prompt enrichment.
- Week 6 (Days 31-35): v0.1 stable release, announce externally (HN Show, dev.to, r/LocalLLaMA).

Re-plan in detail after Day 14 retrospective.
