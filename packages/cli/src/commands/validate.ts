import { Command } from 'commander';
import { loadProfile, ProfileValidationError } from '@wv/sdk';
import { green } from '../util/colors.js';

export async function runValidate(path: string): Promise<number> {
  try {
    const profile = await loadProfile(path);
    const expertiseCount = profile.expertise?.length ?? 0;
    const analogyCount = profile.analogy_bank?.length ?? 0;
    process.stdout.write(green(`✓ ${path} is valid\n`));
    process.stdout.write(
      `  display_name: ${profile.identity.display_name}\n` +
        `  expertise:    ${expertiseCount}\n` +
        `  analogies:    ${analogyCount}\n`,
    );
    return 0;
  } catch (err) {
    if (err instanceof ProfileValidationError) {
      return 1;
    }
    throw err;
  }
}

export const validateCommand = new Command('validate')
  .description('Validate a worldview profile YAML file')
  .argument('<path>', 'path to profile YAML')
  .action(async (path: string) => {
    const code = await runValidate(path);
    if (code !== 0) process.exit(code);
  });
