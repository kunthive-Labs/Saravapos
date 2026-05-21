# @wv/adapters

LLM provider adapters for worldview translation. Bring your own key (BYOK) — no provider is hardcoded into the SDK or CLI; you choose one at runtime via `resolveAdapter('<name>')` or the CLI `--provider` flag.

## Supported providers

| Provider  | `name`      | Env var              | Default model       | Notes                                       |
| --------- | ----------- | -------------------- | ------------------- | ------------------------------------------- |
| Anthropic | `anthropic` | `ANTHROPIC_API_KEY`  | `claude-sonnet-4-6` | Uses `@anthropic-ai/sdk`                    |
| OpenAI    | `openai`    | `OPENAI_API_KEY`     | `gpt-4o`            | Uses `openai`                               |
| Ollama    | `ollama`    | `OLLAMA_HOST` (opt.) | `llama3.1`          | Local; defaults to `http://localhost:11434` |

## Usage

```ts
import { resolveAdapter } from '@wv/adapters';

const adapter = resolveAdapter('anthropic'); // reads ANTHROPIC_API_KEY
const result = await adapter.complete({
  system: 'You translate between mental models.',
  user: 'Explain a pawn sacrifice to an F1 fan.',
});
console.log(result.text);
```

You can also instantiate a specific adapter directly:

```ts
import { AnthropicAdapter, OpenAIAdapter, OllamaAdapter } from '@wv/adapters';

const a = new AnthropicAdapter({ apiKey: '...', defaultModel: 'claude-opus-4-7' });
const o = new OpenAIAdapter({ apiKey: '...' });
const l = new OllamaAdapter({ baseUrl: 'http://localhost:11434' });
```

## Errors

All adapter failures throw `AdapterError`, which carries `provider`, optional `status` (HTTP), and `cause`. The constructors also throw `AdapterError` synchronously if a required API key is missing.
