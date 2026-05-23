import { Command } from 'commander';

export const validateCommand = new Command('validate')
  .description('Validate a worldview profile YAML file')
  .argument('[path]', 'path to profile YAML')
  .action(() => {
    console.log('validate: not yet implemented');
  });
