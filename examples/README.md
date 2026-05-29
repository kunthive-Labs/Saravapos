# Examples

Runnable scripts that exercise the Saravapos SDK end-to-end.

## basic.ts

Translates a chess-flavored sentence into terms that land for an F1 fan, using
the bundled sample profiles in `../profiles/`.

### Run

```bash
# Anthropic (default)
ANTHROPIC_API_KEY=sk-ant-... pnpm example:basic

# OpenAI
SARAVAPOS_PROVIDER=openai OPENAI_API_KEY=sk-... pnpm example:basic

# Ollama (local)
SARAVAPOS_PROVIDER=ollama pnpm example:basic
```

### What it does

1. Resolves an LLM adapter from `SARAVAPOS_PROVIDER` (`anthropic` | `openai` | `ollama`).
2. Loads `profiles/chess-expert.yaml` (source) and `profiles/f1-fan.yaml` (target).
3. Calls `translate({ text, from, to, adapter })`.
4. Prints the source and the translated rewrite side by side.

The translator never invents facts — it just rewrites jargon, analogies, and
cognitive framings so the target reader recognizes the content.
