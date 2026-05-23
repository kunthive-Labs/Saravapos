import { Command } from 'commander';

export const translateCommand = new Command('translate')
  .description('Translate text between two worldview profiles')
  .requiredOption('--from <path>', 'path to source profile YAML')
  .action(() => {
    console.log('translate: not yet implemented');
  });
