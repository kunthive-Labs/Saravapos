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

## `wv translate` examples

Translate a chess concept for an F1 fan, with inline text:

```sh
wv translate \
  --from profiles/chess-expert.yaml \
  --to   profiles/f1-fan.yaml \
  --text "I sacrificed a pawn for positional advantage"
```

Read the source from a file, write the translation to disk:

```sh
wv translate \
  --from profiles/software-engineer.yaml \
  --to   profiles/curious-novice.yaml \
  --input notes.md \
  --output notes.translated.md
```

Pipe input on stdin, switch provider, pick a specific model:

```sh
echo "Recursion is the soul of induction." | wv \
  --provider openai \
  translate \
  --from profiles/software-engineer.yaml \
  --to   profiles/curious-novice.yaml \
  --model gpt-4o
```

Translate flags reference:

| Flag              | Purpose                                              |
| ----------------- | ---------------------------------------------------- |
| `--from <path>`   | Source profile YAML (required)                       |
| `--to <path>`     | Destination profile YAML (required)                  |
| `--input <path>`  | Read source text from a file                         |
| `--text <string>` | Inline source text                                   |
| `--output <path>` | Write translated output to a file (otherwise stdout) |
| `--model <name>`  | Override the LLM model                               |

If neither `--input` nor `--text` is provided, source text is read from stdin.

## Development

```sh
pnpm dev:cli -- --help     # run the CLI without building
pnpm --filter @wv/cli build
```
