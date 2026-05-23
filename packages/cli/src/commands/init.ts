import { existsSync, writeFileSync } from 'node:fs';
import { Command } from 'commander';
import { input, select } from '@inquirer/prompts';
import { EXPERTISE_LEVELS } from '@wv/spec';
import type { ExpertiseLevel } from '@wv/spec';
import { green, red } from '../util/colors.js';

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
  force?: boolean;
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
    `# Worldview profile — describes how this persona thinks and what they know.\n` +
    `# Edit freely; run \`wv validate <this-file>\` to check against the schema.\n` +
    `schema_version: '0.1'\n` +
    `\n` +
    `# Identity: surface-level labels.\n` +
    `identity:\n` +
    `  display_name: ${identity.display_name}\n` +
    `  languages: ${languages}    # ISO 639 codes\n` +
    `  region: ${identity.region}\n` +
    `\n` +
    `# Expertise: domains the persona knows. Add more entries as needed.\n` +
    `# level ∈ { novice, intermediate, advanced, expert }\n` +
    `expertise:\n` +
    `  - domain: ${expertise.domain}\n` +
    `    level: ${expertise.level}\n` +
    yearsLine +
    `\n` +
    `# Optional sections — uncomment and fill in as you learn what helps.\n` +
    `#\n` +
    `# analogy_bank:\n` +
    `#   - concept: <abstract concept this persona finds hard>\n` +
    `#     metaphor: <concrete metaphor from a domain they DO know>\n` +
    `#     domain: <which expertise.domain the metaphor lives in>\n` +
    `#\n` +
    `# cognitive_style:\n` +
    `#   mode: verbal           # verbal | visual | mathematical | mixed\n` +
    `#   abstraction_tolerance: medium  # low | medium | high\n` +
    `#   prefers: []\n` +
    `#\n` +
    `# cultural_context:\n` +
    `#   references_that_land: []\n` +
    `#   references_to_avoid: []\n`
  );
}

export async function runInit(opts: InitCliOptions, deps: InitDeps = {}): Promise<number> {
  if (existsSync(opts.output) && !opts.force) {
    process.stderr.write(red(`✗ ${opts.output} already exists. Pass --force to overwrite.\n`));
    return 1;
  }
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
  .option('-f, --force', 'overwrite the destination if it already exists')
  .action(async (options: InitCliOptions) => {
    const code = await runInit(options);
    process.exitCode = code;
  });
