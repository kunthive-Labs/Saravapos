import { writeFileSync } from 'node:fs';
import { Command } from 'commander';
import { input, select } from '@inquirer/prompts';
import { EXPERTISE_LEVELS } from '@wv/spec';
import type { ExpertiseLevel } from '@wv/spec';
import { green } from '../util/colors.js';

export interface IdentityAnswers {
  display_name: string;
  languages: string[];
  region: string;
}

export interface ExpertiseAnswer {
  domain: string;
  level: ExpertiseLevel;
  years?: number;
}

export interface InitCliOptions {
  output: string;
}

export interface InitDeps {
  askIdentity?: () => Promise<IdentityAnswers>;
  askExpertise?: () => Promise<ExpertiseAnswer>;
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

async function defaultAskExpertise(): Promise<ExpertiseAnswer> {
  const domain = await input({ message: 'Primary domain (e.g. chess, machine-learning):' });
  const level = (await select({
    message: 'Level:',
    choices: EXPERTISE_LEVELS.map((l) => ({ name: l, value: l })),
  })) as ExpertiseLevel;
  const yearsRaw = await input({ message: 'Years of practice (blank to skip):', default: '' });
  const trimmed = yearsRaw.trim();
  const years = trimmed === '' ? undefined : Number(trimmed);
  return years === undefined ? { domain, level } : { domain, level, years };
}

function buildYaml(identity: IdentityAnswers, expertise: ExpertiseAnswer): string {
  const languages = `[${identity.languages.join(', ')}]`;
  const yearsLine = expertise.years !== undefined ? `    years: ${expertise.years}\n` : '';
  return (
    `schema_version: '0.1'\n` +
    `\n` +
    `identity:\n` +
    `  display_name: ${identity.display_name}\n` +
    `  languages: ${languages}\n` +
    `  region: ${identity.region}\n` +
    `\n` +
    `expertise:\n` +
    `  - domain: ${expertise.domain}\n` +
    `    level: ${expertise.level}\n` +
    yearsLine
  );
}

export async function runInit(opts: InitCliOptions, deps: InitDeps = {}): Promise<number> {
  const askIdentity = deps.askIdentity ?? defaultAskIdentity;
  const askExpertise = deps.askExpertise ?? defaultAskExpertise;
  const identity = await askIdentity();
  const expertise = await askExpertise();
  writeFileSync(opts.output, buildYaml(identity, expertise), 'utf-8');
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
