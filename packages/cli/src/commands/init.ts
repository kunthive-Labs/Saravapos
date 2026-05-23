import { writeFileSync } from 'node:fs';
import { Command } from 'commander';
import { input } from '@inquirer/prompts';
import { green } from '../util/colors.js';

export interface IdentityAnswers {
  display_name: string;
  languages: string[];
  region: string;
}

export interface InitCliOptions {
  output: string;
}

export interface InitDeps {
  askIdentity?: () => Promise<IdentityAnswers>;
}

async function defaultAskIdentity(): Promise<IdentityAnswers> {
  const display_name = await input({ message: 'Display name:' });
  const languagesRaw = await input({
    message: 'Languages (comma-separated ISO codes, e.g. en,fr):',
    default: 'en',
  });
  const region = await input({ message: 'Region (e.g. US, UK, IN):' });
  return {
    display_name,
    languages: languagesRaw
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean),
    region,
  };
}

function buildYaml(identity: IdentityAnswers): string {
  const languages = `[${identity.languages.join(', ')}]`;
  return (
    `schema_version: '0.1'\n` +
    `\n` +
    `identity:\n` +
    `  display_name: ${identity.display_name}\n` +
    `  languages: ${languages}\n` +
    `  region: ${identity.region}\n` +
    `\n` +
    `expertise: []\n`
  );
}

export async function runInit(opts: InitCliOptions, deps: InitDeps = {}): Promise<number> {
  const askIdentity = deps.askIdentity ?? defaultAskIdentity;
  const identity = await askIdentity();
  writeFileSync(opts.output, buildYaml(identity), 'utf-8');
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
