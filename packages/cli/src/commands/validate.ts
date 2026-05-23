import { Command } from 'commander';
import { loadProfile, ProfileValidationError } from '@wv/sdk';
import { green, red } from '../util/colors.js';

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
      process.stderr.write(red(`✗ ${path} is invalid\n`));
      for (const e of err.validationErrors) {
        const field = e.instancePath || '(root)';
        process.stderr.write(red(`  ${field}: ${e.message ?? 'invalid'}\n`));
      }
      return 1;
    }
    const msg = err instanceof Error ? err.message : String(err);
    process.stderr.write(red(`✗ could not read ${path}: ${msg}\n`));
    return 1;
  }
}

export const validateCommand = new Command('validate')
  .description('Validate a worldview profile YAML file')
  .argument('<path>', 'path to profile YAML')
  .action(async (path: string) => {
    const code = await runValidate(path);
    process.exitCode = code;
  });
