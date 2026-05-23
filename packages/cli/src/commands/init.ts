import { writeFileSync } from 'node:fs';
import { Command } from 'commander';
import { green } from '../util/colors.js';

const BLANK_PROFILE = `schema_version: '0.1'

identity:
  display_name: Your Name
  languages: [en]
  region: US

expertise: []
`;

export interface InitCliOptions {
  output: string;
}

export async function runInit(opts: InitCliOptions): Promise<number> {
  writeFileSync(opts.output, BLANK_PROFILE, 'utf-8');
  process.stdout.write(green(`✓ wrote ${opts.output}\n`));
  return 0;
}

export const initCommand = new Command('init')
  .description('Create a new worldview profile YAML file interactively')
  .requiredOption('-o, --output <path>', 'destination YAML path')
  .action(async (options: InitCliOptions) => {
    const code = await runInit(options);
    process.exitCode = code;
  });
