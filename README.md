# worldview

> Translate ideas between mental models. An open protocol for worldview-aware communication.

[![CI](https://github.com/8harath/Context/actions/workflows/ci.yml/badge.svg)](https://github.com/8harath/Context/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![npm](https://img.shields.io/npm/v/@wv/cli/alpha)](https://www.npmjs.com/package/@wv/cli)

**Status:** `0.1.0-alpha.0` — schema unstable, breaking changes expected before `0.1.0` stable.

## What is this?

A chess expert explains "sacrificing a pawn for positional advantage" — but if your audience only knows Formula 1, that metaphor lands wrong. `worldview` lets you describe a person's mental model (their expertise, analogies, cognitive style, cultural context) as a portable YAML profile, then translates content between profiles using an LLM.

- **Protocol-first.** A JSON Schema for profiles. Anyone can implement.
- **Local-first.** Profiles are YAML files you own. No accounts, no servers.
- **Multi-provider.** Bring your own LLM key — Anthropic, OpenAI, or Ollama.
- **CLI + SDK.** Use `wv` from the terminal, or `@wv/sdk` from a Node app.

## Install

```bash
# global CLI
npm install -g @wv/cli@alpha

# or per-project
pnpm add @wv/sdk @wv/adapters
```

Requires Node 20+.

## Quickstart

```bash
# author a profile interactively
wv init --output me.yaml

# validate it
wv validate me.yaml

# translate something
export ANTHROPIC_API_KEY=sk-...
wv translate \
  --from profiles/chess-expert.yaml \
  --to   profiles/f1-fan.yaml \
  --text "I sacrificed a pawn for a positional advantage"
```

See [`packages/cli/README.md`](./packages/cli/README.md) for the full command reference.

## SDK usage

```ts
import { loadProfile, translate } from '@wv/sdk';
import { resolveAdapter } from '@wv/adapters';

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

| Package                               | What it does                           |
| ------------------------------------- | -------------------------------------- |
| [`@wv/spec`](./packages/spec)         | Profile JSON Schema + TypeScript types |
| [`@wv/sdk`](./packages/sdk)           | `loadProfile`, `translate`             |
| [`@wv/adapters`](./packages/adapters) | Anthropic, OpenAI, Ollama backends     |
| [`@wv/cli`](./packages/cli)           | The `wv` command                       |

## Spec

The profile schema and field semantics live in [`docs/spec.md`](./docs/spec.md). Read it in under 10 minutes to understand what a profile is and how a translator should consume one.

## Roadmap

- ✅ Weeks 1–2: protocol, SDK, three adapters, CLI, alpha release (this).
- Week 3: eval harness — golden cases, LLM-judge, CI gate.
- Week 4: prompt engineering driven by eval signal.
- Week 5: `analogy_bank` injection — concept extraction → metaphor lookup → enriched prompt.
- Week 6: `0.1.0` stable, public announce.

See [`PLAN.md`](./PLAN.md) for the build plan and [`CHANGELOG.md`](./CHANGELOG.md) for what shipped.

## Contributing

See [`CONTRIBUTING.md`](./CONTRIBUTING.md). The schema and prompt shape are the highest-leverage areas to push back on right now.

## License

MIT. See [LICENSE](./LICENSE).
