# Saravapos

> An open protocol for worldview-aware communication. Translate ideas between mental models — explain a chess concept to a Formula 1 fan, or compress a software talk for a novice — using a portable persona profile and an LLM.

[![CI](https://github.com/kunthive-Labs/Saravapos/actions/workflows/ci.yml/badge.svg)](https://github.com/kunthive-Labs/Saravapos/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![npm](https://img.shields.io/npm/v/@saravapos/cli/alpha)](https://www.npmjs.com/package/@saravapos/cli)

**Status:** `0.1.0-alpha.0` — schema unstable, breaking changes expected before `0.1.0` stable.

## What is this?

Every explanation rides on shared metaphors. A chess coach says "sacrifice a pawn for positional advantage" and another chess player nods — but a Formula 1 fan hears empty noise. The information is sound; the **mental model** behind it is missing.

Saravapos closes that gap. You describe a person's worldview — their expertise, preferred analogies, cognitive style, cultural references — as a small YAML profile. Given a `from` profile and a `to` profile, Saravapos rewrites content so the metaphors land while the facts stay intact.

- **Protocol-first.** A JSON Schema defines what a profile is. Anyone can implement against it.
- **Local-first.** Profiles are plain YAML files you own. No accounts, no servers, no telemetry.
- **Multi-provider.** Bring your own LLM key — Anthropic, OpenAI, or Ollama (local).
- **CLI + SDK.** Use `saravapos` from the terminal, or `@saravapos/sdk` from a Node app.

## Install

```bash
# global CLI
npm install -g @saravapos/cli@alpha

# or per-project
pnpm add @saravapos/sdk @saravapos/adapters
```

Requires Node 20+.

## Quickstart

```bash
# author a profile interactively
saravapos init --output me.yaml

# validate it against the schema
saravapos validate me.yaml

# translate something
export ANTHROPIC_API_KEY=sk-...
saravapos translate \
  --from profiles/chess-expert.yaml \
  --to   profiles/f1-fan.yaml \
  --text "I sacrificed a pawn for a positional advantage"
```

See [`packages/cli/README.md`](./packages/cli/README.md) for the full command reference, including stdin piping, file I/O, and provider/model overrides.

## SDK usage

```ts
import { loadProfile, translate } from '@saravapos/sdk';
import { resolveAdapter } from '@saravapos/adapters';

const from = await loadProfile('profiles/chess-expert.yaml');
const to = await loadProfile('profiles/f1-fan.yaml');
const adapter = resolveAdapter('anthropic');

const out = await translate({
  text: 'I sacrificed a pawn for a positional advantage',
  from,
  to,
  adapter,
});
console.log(out);
```

## Packages

| Package                                      | What it does                                   |
| -------------------------------------------- | ---------------------------------------------- |
| [`@saravapos/spec`](./packages/spec)         | Profile JSON Schema + TypeScript types         |
| [`@saravapos/sdk`](./packages/sdk)           | `loadProfile`, `translate` — the core library  |
| [`@saravapos/adapters`](./packages/adapters) | LLM backends: Anthropic, OpenAI, Ollama        |
| [`@saravapos/cli`](./packages/cli)           | The `saravapos` command                        |
| `@saravapos/eval` (private)                  | Eval harness for translation quality + CI gate |

## Spec

The profile schema, field semantics, and versioning policy live in [`docs/spec.md`](./docs/spec.md). It's a ~10-minute read that defines what a profile is and how a conforming translator should consume one.

## Sample profiles

The [`profiles/`](./profiles) directory ships hand-authored personas — chess expert, F1 fan, software engineer, curious novice — used in tests, examples, and the eval harness. Use them as templates for your own.

## Roadmap

- ✅ Weeks 1–2: protocol, SDK, three adapters, CLI, alpha release (this).
- ✅ Week 3: eval harness — golden cases, LLM judge, lexical checks, quality gate (`--threshold` / `--min-case`), baseline regression tracking, and a non-blocking CI eval job.
- Week 4: prompt engineering driven by eval signal.
- Week 5: `analogy_bank` injection — concept extraction → metaphor lookup → enriched prompt.
- Week 6: `0.1.0` stable, public announce.

The CI eval gate expects a corpus mean ≥ `3.5` with no single case below `3`, and flags regressions against [`eval-baseline.json`](./eval-baseline.json). See the [Evals section in CONTRIBUTING](./CONTRIBUTING.md#evals) for how to add a case or refresh the baseline.

See [`PLAN.md`](./PLAN.md) for the build plan and [`CHANGELOG.md`](./CHANGELOG.md) for what shipped.

## Contributing

See [`CONTRIBUTING.md`](./CONTRIBUTING.md). The schema shape and the prompt design are the highest-leverage areas to push back on right now.

## License

MIT. See [LICENSE](./LICENSE).
