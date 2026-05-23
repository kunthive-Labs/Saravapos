import { Command } from 'commander';
import { loadProfile, ProfileValidationError } from '@wv/sdk';

export async function runValidate(path: string): Promise<number> {
  try {
    await loadProfile(path);
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
