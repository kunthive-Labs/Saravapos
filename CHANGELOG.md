# Changelog

All notable changes to this project are documented here. The format is loosely based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/); versioning follows [SemVer](https://semver.org/) with `-alpha.N` pre-release tags while the schema is unstable.

## [Unreleased]

### Added — `@saravapos/sdk`

- Swappable prompt **strategies**: `baseline` (the original v0 prompt), `structured`,
  `fewShot`, plus three candidate variants — `plainLanguage`, `planned`, and `analogyFirst`.
  `translate({ strategy })` selects one; the default remains `baseline` until a keyed
  `eval compare` names a winner.
- **Dynamic analogy injection** (`dynamicAnalogy` strategy): extracts the input text's concepts,
  matches them against both profiles' `analogy_bank` entries, and injects only the relevant
  metaphors instead of dumping the whole bank. Fully deterministic, no extra LLM call.

### Added — `@saravapos/eval`

- `eval compare --variants a,b,…` runs the corpus per prompt variant and prints an A/B
  scorecard with a winner, including a **per-criterion breakdown** that shows which rubric
  dimension each variant moved.

### Internal

- Prompt regression guard: a vitest snapshot pins every strategy's system prompt, so prompt
  drift is caught in review.

## [0.1.0-alpha.0] — 2026-05-26

First publishable alpha. Schema is frozen at `0.1` for this release but may break before `0.1.0` stable.

### Added — `@saravapos/spec`

- Profile JSON Schema v0.1: `identity`, `expertise[]`, `analogy_bank[]`, `cognitive_style`, `cultural_context`.
- `additionalProperties: false` on every sub-schema.
- TypeScript `Profile` type exported alongside the JSON Schema string.
- `SCHEMA_VERSION = "0.1"` with deprecation policy documented in source.

### Added — `@saravapos/sdk`

- `loadProfile(path)` / `loadProfileFromString(yaml)` — reads YAML, validates against the schema, throws `ProfileValidationError` with the failing field path.
- `translate({ text, from, to, adapter, model?, temperature? })` — builds a system prompt from both profiles and delegates to the adapter.

### Added — `@saravapos/adapters`

- Pluggable `LLMAdapter` interface (`name`, `complete`).
- `AnthropicAdapter` (default `claude-sonnet-4-6`), `OpenAIAdapter` (default `gpt-4o`), `OllamaAdapter` (default `llama3.1`, talks to `localhost:11434`).
- `resolveAdapter(name)` factory, single-retry backoff on 429.

### Added — `@saravapos/cli`

- `saravapos init [-o me.yaml]` — interactive profile authoring with inquirer prompts.
- `saravapos validate <path>` — green check on success, field-level red errors on failure, non-zero exit.
- `saravapos translate --from <p> --to <p> [--text | --input | stdin]` — end-to-end translation with `--output`, `--model`, `--provider` overrides.
- `saravapos list-providers`, `saravapos version` / `--version`.

### Known limitations

- `analogy_bank` is parsed but not yet injected into prompts — translation is naive prompt-only.
- No eval harness yet (planned for Week 3).
- Schema may change before `0.1.0` stable.

[0.1.0-alpha.0]: https://github.com/kunthive-Labs/Saravapos/releases/tag/v0.1.0-alpha.0
