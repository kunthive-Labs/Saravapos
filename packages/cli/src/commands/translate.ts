import { Command } from 'commander';

export const translateCommand = new Command('translate')
  .description('Translate text between two worldview profiles')
  .action(() => {
    console.log('translate: not yet implemented');
  });
