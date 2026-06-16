# @saravapos/sdk

Saravapos SDK: load profiles, rewrite text between worldviews.

## Install

```bash
pnpm add @saravapos/sdk @saravapos/adapters
```

## Usage

```ts
import { loadProfile, translate } from '@saravapos/sdk';
import { resolveAdapter } from '@saravapos/adapters';

const from = await loadProfile('./profiles/chess-expert.yaml');
const to = await loadProfile('./profiles/f1-fan.yaml');
const adapter = resolveAdapter('anthropic'); // reads ANTHROPIC_API_KEY

const out = await translate({
  text: 'I sacrificed a pawn for positional advantage.',
  from,
  to,
  adapter,
});

console.log(out);
```

`translate` accepts optional `model` and `temperature` overrides.

## Prompt strategies

`translate` builds its prompt from a named **strategy**. Pass `strategy` (a name or a
custom `PromptStrategy` object) to switch; the default is `baseline`.

```ts
await translate({ text, from, to, adapter, strategy: 'dynamicAnalogy' });
```

| Strategy         | What it does                                                               |
| ---------------- | -------------------------------------------------------------------------- |
| `baseline`       | The original v0 prompt: profile descriptions + translation rules.          |
| `structured`     | Sectioned system prompt (role / profiles / contract / checklist / output). |
| `fewShot`        | `structured` plus two worked, domain-neutral examples.                     |
| `plainLanguage`  | `structured` plus an aggressive jargon-strip + everyday-analogy directive. |
| `planned`        | `structured` plus a private plan-then-write method.                        |
| `analogyFirst`   | `structured` plus a directive to lean on the target's analogy bank.        |
| `dynamicAnalogy` | `structured` plus only the analogy-bank entries **relevant to the input**. |

### Dynamic analogy injection

`dynamicAnalogy` is input-aware. Instead of dumping the whole analogy bank, it extracts the
input text's salient concepts, matches them against both profiles' `analogy_bank` entries, and
injects only the entries that actually apply — narrowing the model's attention to the metaphors
that fit this specific text. Matching is fully deterministic and needs no LLM call. With the
example above it surfaces the chess→F1 mappings for "pawn sacrifice" and "positional advantage"
while leaving unrelated entries out.

To choose a strategy by measured quality, see the `eval compare` A/B harness and the
prompt-tuning loop in [`CONTRIBUTING.md`](../../CONTRIBUTING.md#evals).

See `examples/basic.ts` for a runnable end-to-end script.
