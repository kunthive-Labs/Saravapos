#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Command } from 'commander';
import { translateCommand } from './commands/translate.js';
import { validateCommand } from './commands/validate.js';
import { initCommand } from './commands/init.js';

const pkgPath = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'package.json');
const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8')) as { version: string };

const program = new Command();

program
  .name('wv')
  .description('Worldview translation CLI')
  .version(pkg.version)
  .option('-p, --provider <name>', 'LLM provider: anthropic | openai | ollama')
  .option('-v, --verbose', 'enable verbose logging');

program.addCommand(translateCommand);
program.addCommand(validateCommand);
program.addCommand(initCommand);

program.parse();
