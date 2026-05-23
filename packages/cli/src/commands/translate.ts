import { readFileSync } from 'node:fs';
import { Command } from 'commander';
import { loadProfile } from '@wv/sdk';
import type { Profile } from '@wv/sdk';
import { readStdin } from '../util/stdin.js';

export interface TranslateCliOptions {
  from: string;
  to: string;
  input?: string;
  text?: string;
}

export async function runTranslate(opts: TranslateCliOptions): Promise<number> {
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
  process.stdout.write(
    `translate: ${sourceText.length} chars (${fromProfile.identity.display_name} → ${toProfile.identity.display_name})\n`,
  );
  return 0;
}

export const translateCommand = new Command('translate')
  .description('Translate text between two worldview profiles')
  .requiredOption('--from <path>', 'path to source profile YAML')
  .requiredOption('--to <path>', 'path to destination profile YAML')
  .option('--input <path>', 'read source text from file')
  .option('--text <string>', 'inline source text')
  .action(async (options: TranslateCliOptions) => {
    const code = await runTranslate(options);
    if (code !== 0) process.exit(code);
  });
