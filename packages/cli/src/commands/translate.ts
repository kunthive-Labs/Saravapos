import { readFileSync, writeFileSync } from 'node:fs';
import { Command } from 'commander';
import { loadProfile, translate } from '@wv/sdk';
import type { Profile } from '@wv/sdk';
import { resolveAdapter } from '@wv/adapters';
import type { LLMAdapter } from '@wv/adapters';
import { readStdin } from '../util/stdin.js';

export interface TranslateCliOptions {
  from: string;
  to: string;
  input?: string;
  text?: string;
  output?: string;
  provider?: string;
}

export interface TranslateDeps {
  adapter?: LLMAdapter;
}

export async function runTranslate(
  opts: TranslateCliOptions,
  deps: TranslateDeps = {},
): Promise<number> {
  if (opts.input !== undefined && opts.text !== undefined) {
    process.stderr.write('Error: provide at most one of --input or --text\n');
    return 1;
  }
  let sourceText: string;
  if (opts.text !== undefined) {
    sourceText = opts.text;
  } else if (opts.input !== undefined) {
    sourceText = readFileSync(opts.input, 'utf-8');
  } else {
    sourceText = await readStdin();
  }
  const fromProfile: Profile = await loadProfile(opts.from);
  const toProfile: Profile = await loadProfile(opts.to);
  const providerName = opts.provider ?? process.env.WV_PROVIDER ?? 'anthropic';
  const adapter = deps.adapter ?? resolveAdapter(providerName);
  const result = await translate({
    text: sourceText,
    from: fromProfile,
    to: toProfile,
    adapter,
  });
  if (opts.output !== undefined) {
    writeFileSync(opts.output, result, 'utf-8');
  } else {
    process.stdout.write(result + '\n');
  }
  return 0;
}

export const translateCommand = new Command('translate')
  .description('Translate text between two worldview profiles')
  .requiredOption('--from <path>', 'path to source profile YAML')
  .requiredOption('--to <path>', 'path to destination profile YAML')
  .option('--input <path>', 'read source text from file')
  .option('--text <string>', 'inline source text')
  .option('--output <path>', 'write translated output to file')
  .action(async (options: TranslateCliOptions, cmd: Command) => {
    const globals = cmd.optsWithGlobals<{ provider?: string }>();
    const merged: TranslateCliOptions = {
      ...options,
      ...(globals.provider !== undefined ? { provider: globals.provider } : {}),
    };
    const code = await runTranslate(merged);
    if (code !== 0) process.exit(code);
  });
