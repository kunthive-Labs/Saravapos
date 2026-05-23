# @wv/cli

The `wv` command-line interface for the Worldview Translation Protocol.

## Install

```sh
npm install -g @wv/cli
# or use without installing
npx @wv/cli --help
```

## Commands

| Command        | Purpose                                                       |
| -------------- | ------------------------------------------------------------- |
| `wv translate` | Translate text between two worldview profiles                 |
| `wv validate`  | Validate a worldview profile YAML file against the spec       |
| `wv init`      | Create a new worldview profile YAML file (interactive wizard) |

## Global flags

| Flag                    | Purpose                                          |
| ----------------------- | ------------------------------------------------ |
| `-p, --provider <name>` | LLM provider: `anthropic`, `openai`, or `ollama` |
| `-v, --verbose`         | Enable verbose logging                           |
| `--version`             | Print the CLI version                            |
| `-h, --help`            | Print help                                       |

## Development

```sh
pnpm dev:cli -- --help     # run the CLI without building
pnpm --filter @wv/cli build
```
