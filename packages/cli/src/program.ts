import { Command } from 'commander';
import { translateCommand } from './commands/translate.js';
import { validateCommand } from './commands/validate.js';
import { initCommand } from './commands/init.js';
import { listProvidersCommand } from './commands/list-providers.js';

export function createProgram(version: string): Command {
  const program = new Command();

  program
    .name('saravapos')
    .description('Saravapos translation CLI — translate ideas between mental models')
    .version(version)
    .option('-p, --provider <name>', 'LLM provider: anthropic | openai | ollama')
    .option('-v, --verbose', 'enable verbose logging');

  program.addCommand(translateCommand);
  program.addCommand(validateCommand);
  program.addCommand(initCommand);
  program.addCommand(listProvidersCommand);

  program
    .command('version')
    .description('Print the CLI version (same as --version)')
    .action(() => {
      process.stdout.write(`${version}\n`);
    });

  return program;
}
