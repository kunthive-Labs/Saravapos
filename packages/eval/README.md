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

## Exit codes

- `0` — suite ran cleanly.
- `1` — generic failure (bad flag, missing file, adapter error).
- `2` — judge returned unparseable output. Treated as **infra failure**, not
  a quality failure — the truncated raw response prints to stderr so you can
  see what the model actually said.

## Adding a case

See [`cases/README.md`](./cases/README.md) for the YAML format. Day 19 will
add `--write-baseline` and a CI gate; until then, tune prompts freely and
re-run.
