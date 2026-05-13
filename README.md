# worldview

> Translate ideas between mental models. An open protocol for worldview-aware communication.

[![CI](https://github.com/8harath/Context/actions/workflows/ci.yml/badge.svg)](https://github.com/8harath/Context/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![npm (placeholder)](https://img.shields.io/badge/npm-%40wv%2Fcli-blue)](https://www.npmjs.com/package/@wv/cli)

**Status:** alpha — pre-0.1, schema unstable, breaking changes expected.

## What is this?

A chess expert explains "sacrificing a pawn for positional advantage" — but if your audience only knows Formula 1, that metaphor lands wrong. `worldview` lets you describe a person's mental model (their expertise, analogies, cognitive style, cultural context) as a portable profile, and translates content between profiles using LLMs.

- **Protocol-first:** JSON Schema spec for profiles. Anyone can implement.
- **Local-first:** profiles are YAML files you own. No accounts, no servers.
- **Multi-provider:** bring your own LLM key (Anthropic, OpenAI, Ollama).
- **CLI today:** SDK + library coming alongside.

## Quickstart

> Pre-alpha. The commands below describe the target shape — not all subcommands exist yet.

```bash
# install (planned)
pnpm add -g @wv/cli

# author a profile
wv init --output me.yaml

# translate
wv translate \
  --from profiles/chess-expert.yaml \
  --to profiles/f1-fan.yaml \
  --text "I sacrificed a pawn for positional advantage"
```

## Spec

The profile schema and field semantics live in [`docs/spec.md`](./docs/spec.md). Read it in under 10 minutes to understand what a profile is and how a translator should consume one.

## Roadmap

See [PLAN.md](./PLAN.md) for the 14-day MVP build plan.

## License

MIT. See [LICENSE](./LICENSE).
