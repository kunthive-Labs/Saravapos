import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { createProgram } from './program.js';

const packageJson = JSON.parse(
  readFileSync(new URL('../package.json', import.meta.url), 'utf-8'),
) as { version: string };

describe('createProgram', () => {
  it('reports the release version from package metadata', () => {
    const program = createProgram(packageJson.version);

    expect(packageJson.version).toMatch(/^\d+\.\d+\.\d+$/);
    expect(program.version()).toBe(packageJson.version);
  });

  it('registers every supported top-level command', () => {
    const commandNames = createProgram(packageJson.version).commands.map((command) =>
      command.name(),
    );

    expect(commandNames).toEqual(['translate', 'validate', 'init', 'list-providers', 'version']);
  });
});
