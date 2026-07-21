# @saravapos/cli

The `saravapos` command-line interface for the Saravapos Translation Protocol.

## Install

```sh
npm install -g @saravapos/cli
# or use without installing
npx @saravapos/cli --help
```

## Commands

| Command                     | Purpose                                                       |
| --------------------------- | ------------------------------------------------------------- |
| `saravapos translate`       | Translate text between two Saravapos profiles                 |
| `saravapos validate <path>` | Validate a Saravapos profile YAML file against the spec       |
| `saravapos init -o <path>`  | Create a new Saravapos profile YAML file (interactive wizard) |
| `saravapos list-providers`  | List supported LLM providers and their required env vars      |
| `saravapos doctor`          | Check Node, release, and selected-provider readiness          |
| `saravapos version`         | Print the CLI version (same as `--version`)                   |

## Global flags

| Flag                    | Purpose                                          |
| ----------------------- | ------------------------------------------------ |
| `-p, --provider <name>` | LLM provider: `anthropic`, `openai`, or `ollama` |
| `-v, --verbose`         | Enable verbose logging                           |
| `--version`             | Print the CLI version                            |
| `-h, --help`            | Print help                                       |

## `saravapos translate` examples

Translate a chess concept for an F1 fan, with inline text:

```sh
saravapos translate \
  --from profiles/chess-expert.yaml \
  --to   profiles/f1-fan.yaml \
  --text "I sacrificed a pawn for positional advantage"
```

Read the source from a file, write the translation to disk:

```sh
saravapos translate \
  --from profiles/software-engineer.yaml \
  --to   profiles/curious-novice.yaml \
  --input notes.md \
  --output notes.translated.md
```

Pipe input on stdin, switch provider, pick a specific model:

```sh
echo "Recursion is the soul of induction." | saravapos \
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

## `saravapos validate` examples

```sh
saravapos validate profiles/chess-expert.yaml
# ✓ profiles/chess-expert.yaml is valid
#   display_name: Chess Expert
#   expertise:    2
#   analogies:    3
```

On failure, prints field-level errors and exits non-zero:

```sh
saravapos validate bad-profile.yaml
# ✗ bad-profile.yaml is invalid
#   /identity: must have required property 'display_name'
```

## `saravapos init` examples

Interactive wizard — prompts for identity + first expertise entry, then writes a well-commented YAML template:

```sh
saravapos init --output me.yaml
# (prompts) → wrote me.yaml
saravapos validate me.yaml   # the file it just wrote is guaranteed to pass
```

Init refuses to overwrite an existing file unless `--force` is passed:

```sh
saravapos init -o me.yaml --force
```

## `saravapos list-providers` example

```sh
saravapos list-providers
# Supported LLM providers:
#
#   anthropic   env: ANTHROPIC_API_KEY     default: claude-sonnet-4-6
#   openai      env: OPENAI_API_KEY        default: gpt-4o
#   ollama      env: OLLAMA_HOST           default: llama3.1
#
# Select with `--provider <name>` or the SARAVAPOS_PROVIDER env var.
```

## `saravapos doctor` examples

Check the default provider (`SARAVAPOS_PROVIDER`, falling back to Anthropic):

```sh
saravapos doctor
# ✓ Node.js: v20.18.0 (requires >=20)
# ✓ CLI release: v0.1.0
# ✓ Anthropic: ANTHROPIC_API_KEY is set
```

Check another provider explicitly:

```sh
saravapos --provider openai doctor
saravapos --provider ollama doctor
```

For cloud providers, the command confirms that the required API-key variable is present without printing its value or making a paid request. For Ollama, it probes `/api/tags` on `OLLAMA_HOST` (default `http://127.0.0.1:11434`). Any failed check produces a non-zero exit status.

## Development

```sh
pnpm dev:cli -- --help     # run the CLI without building
pnpm --filter @saravapos/cli build
pnpm smoke:cli             # exercise the built CLI without paid API calls
```
