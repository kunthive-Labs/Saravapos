import { Command } from 'commander';

export const translateCommand = new Command('translate')
  .description('Translate text between two worldview profiles')
  .requiredOption('--from <path>', 'path to source profile YAML')
  .requiredOption('--to <path>', 'path to destination profile YAML')
  .option('--input <path>', 'read source text from file')
  .option('--text <string>', 'inline source text')
  .action(() => {
    console.log('translate: not yet implemented');
  });
