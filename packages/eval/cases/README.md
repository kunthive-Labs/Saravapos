# Golden cases

Each `*.yaml` file here is one **golden case** — a fixed input translated from one
profile to another, scored by the eval harness. Cases are the regression suite for
translation _quality_.

## Format

```yaml
id: chess-to-f1-pawn # unique, stable; sort + report key
from: profiles/chess-expert.yaml # source profile, path relative to repo root
to: profiles/f1-fan.yaml # target profile
input: I sacrificed a pawn for a positional advantage.
rubric: # at least one criterion
  - name: fidelity
    description: Preserves the original strategic meaning.
    weight: 2 # optional, defaults to 1
  - name: lands-for-target
    description: Uses F1 framing the target audience would recognise.
must_include: [tyre] # optional lexical asserts (substring match)
must_avoid: [zugzwang] # optional: jargon that must not survive
```

The harness translates `input` `from` → `to`, then an LLM judge scores the result
against each `rubric` criterion (1–5) and runs the lexical checks. See the package
README for how to run.

## Naming

`<from>-to-<to>-<topic>.yaml`, e.g. `chess-to-f1-pawn.yaml`. The `id` field should
match the filename stem.

## Current corpus

| id                          | from → to      | What it probes                           |
| --------------------------- | -------------- | ---------------------------------------- |
| `chess-to-f1-pawn`          | chess → f1     | Seed case: cross-domain sacrifice        |
| `chess-to-f1-initiative`    | chess → f1     | `must_include` gate (lead the race)      |
| `chess-to-novice-endgame`   | chess → novice | Jargon stripping for a lay audience      |
| `chess-to-novice-checkmate` | chess → novice | Edge case: single-word input             |
| `f1-to-chess-undercut`      | f1 → chess     | Reverse direction (undercut → tempo)     |
| `swe-to-novice-refactor`    | swe → novice   | Abstraction lowering                     |
| `swe-to-novice-memleak`     | swe → novice   | `must_avoid` gate (drop all acronyms)    |
| `swe-to-f1-hotpath`         | swe → f1       | Hardest: no shared domain, build analogy |
| `novice-to-swe-backup`      | novice → swe   | Abstraction raising (backup → rollback)  |

Both translation directions and all four sample profiles are represented, plus
dedicated cases for each lexical gate and a minimal-input edge case.
