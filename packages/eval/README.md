# @saravapos/eval

Eval harness for Saravapos translation quality. Private workspace package — never
published. Drives prompt-tuning and the CI quality gate from real numbers
instead of vibes.

## What it does

For every YAML golden case in `cases/`:

1. Loads the `from` and `to` profiles.
2. Runs `@saravapos/sdk`'s `translate()` at `temperature: 0`.
3. Asks an LLM judge to score the translation against the case's rubric and
   returns strict JSON.
4. Runs `must_include` / `must_avoid` lexical checks against the translation.
5. Aggregates everything into a single report.

Both adapter calls go through a disk cache keyed by
`sha256(provider + model + system + user)`, so re-running an unchanged corpus
is free.

## Running

From the repo root:

```bash
ANTHROPIC_API_KEY=sk-… pnpm eval run
```

### Flags

| Flag                    | Default               | What it does                                                          |
| ----------------------- | --------------------- | --------------------------------------------------------------------- |
| `--cases <dir>`         | `packages/eval/cases` | Directory of golden case YAML files to load.                          |
| `--provider <name>`     | `anthropic`           | Translation provider — `anthropic`, `openai`, or `ollama`.            |
| `--judge-model <model>` | `claude-sonnet-4-6`   | Override the judge model. The default lives in `judge.ts`.            |
| `--no-cache`            | off                   | Force fresh adapter calls. Responses still write back to disk.        |
| `--json <file>`         | _none_                | Also write a machine-readable report to `<file>` (summary + results). |

### Env vars

Set whichever your chosen provider needs:

- `ANTHROPIC_API_KEY` — Anthropic adapter.
- `OPENAI_API_KEY` — OpenAI adapter.
- (Ollama uses `http://localhost:11434`; no key required.)

## Reading the report

Stdout looks like:

```
case                              over  lex   time
--------------------------------------------------
chess-to-f1-pawn                   4.0  pass  812ms
chess-to-novice-checkmate          3.5  pass  640ms
...

mean=3.94  min=swe-to-novice-memleak (3.0)  lexical=89%
cases=9
```

- **over** — weighted overall score on the 1–5 rubric scale.
- **lex** — `pass` when every `must_include` matched and no `must_avoid` term
  appeared, otherwise `FAIL`.
- **mean / min** — used by the Day 19 CI gate (`--threshold`, `--min-case`).

## Comparing prompt variants (A/B)

`eval compare` runs the corpus once per prompt strategy and prints a scorecard,
so prompt changes are chosen by score rather than by eye. The first variant is
the reference; `Δ` is the last variant's score minus the reference's.

```bash
ANTHROPIC_API_KEY=sk-… pnpm eval compare --variants baseline,structured
```

```
case                                  baseline structured       Δ
----------------------------------------------------------------
chess-to-f1-pawn                           3.4        4.1    +0.7
swe-to-novice-memleak                      3.0        3.5    +0.5
...
----------------------------------------------------------------
mean                                      3.50       3.85

per-criterion means:
criterion                             baseline structured       Δ
fidelity                                  3.80       3.90    +0.1
plain-language                            3.10       3.95    +0.9
lands-for-target                          3.40       3.70    +0.3

winner: structured (mean 3.85, +0.35 vs baseline)
```

The **per-criterion means** block (Day 22) breaks the overall down by rubric
dimension, so you can see _which_ dimension a variant moved — e.g. a prompt that
lifts `plain-language` while costing a little `fidelity`. Each criterion is
averaged only over the cases whose rubric includes it. `Δ` is the last variant's
per-criterion mean minus the reference's.

`--variants`, `--cases`, `--provider`, `--judge-model`, `--no-cache`, and
`--json <file>` (writes `{ scorecard, winner }`, including the per-criterion
means and deltas) are all accepted. Because the disk cache keys on the system
prompt, each variant caches independently — so re-comparing an unchanged variant
is free.

### Prompt variants

Strategies live in `@saravapos/sdk` (`prompts/strategies/`). Every variant renders
the profiles identically, so a comparison isolates the instruction change. The
candidate variants (Day 21) each build on `structured` and target a weak spot the
golden corpus is designed to probe.

| Variant         | What it does                                                          | Targets                                   |
| --------------- | --------------------------------------------------------------------- | ----------------------------------------- |
| `baseline`      | The original v0 prompt: profile descriptions + translation rules.     | reference                                 |
| `structured`    | Sectioned system prompt: role / profiles / contract / checklist.      | structure vs. prose                       |
| `fewShot`       | `structured` plus two worked, domain-neutral translation examples.    | swap-framing-keep-claim move              |
| `plainLanguage` | `structured` plus an aggressive jargon-strip + everyday-analogy rule. | `must_avoid` lexical gate, plain-language |
| `planned`       | `structured` plus a private plan-then-write (claim + term inventory). | claim-preservation fidelity               |
| `analogyFirst`  | `structured` plus a directive to anchor in the target's analogy bank. | cross-domain "lands-for-target"           |

Add a variant by exporting a new `PromptStrategy` and registering it in
`prompts/registry.ts`; it becomes available to both `translate()` and `compare`.

## Exit codes

- `0` — suite ran cleanly.
- `1` — generic failure (bad flag, missing file, adapter error).
- `2` — judge returned unparseable output. Treated as **infra failure**, not
  a quality failure — the truncated raw response prints to stderr so you can
  see what the model actually said.

## Adding a case

See [`cases/README.md`](./cases/README.md) for the YAML format. The quality gate
(`--threshold` / `--min-case`) and baseline tracking (`--baseline` /
`--write-baseline`) shipped in Day 19; use `eval compare` (above) to pick the
prompt that scores best across the corpus.
