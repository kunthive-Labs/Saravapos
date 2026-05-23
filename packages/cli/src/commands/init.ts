import { Command } from 'commander';

export const initCommand = new Command('init')
  .description('Create a new worldview profile YAML file interactively')
  .action(() => {
    console.log('init: not yet implemented');
  });
