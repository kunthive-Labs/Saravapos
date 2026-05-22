# @wv/sdk

Worldview translation SDK: load profiles, rewrite text between worldviews.

## Install

```bash
pnpm add @wv/sdk @wv/adapters
```

## Usage

```ts
import { loadProfile, translate } from '@wv/sdk';
import { resolveAdapter } from '@wv/adapters';

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

See `examples/basic.ts` for a runnable end-to-end script.
