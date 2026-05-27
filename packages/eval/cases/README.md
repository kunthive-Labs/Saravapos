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
