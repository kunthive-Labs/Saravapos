import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { runInit } from './init.js';
import { runValidate } from './validate.js';

describe('runInit', () => {
  let workDir: string;

  beforeEach(() => {
    workDir = mkdtempSync(join(tmpdir(), 'wv-init-'));
  });

  afterEach(() => {
    rmSync(workDir, { recursive: true, force: true });
  });

  it('writes a profile that passes validate', async () => {
    const target = join(workDir, 'me.yaml');
    const stdoutSpy = vi.spyOn(process.stdout, 'write').mockImplementation(() => true);
    try {
      const code = await runInit(
        { output: target },
        {
          askIdentity: async () => ({
            display_name: 'Test User',
            languages: ['en'],
            region: 'US',
          }),
          askExpertise: async () => ({ domain: 'chess', level: 'expert', years: 5 }),
        },
      );
      expect(code).toBe(0);
      const validateCode = await runValidate(target);
      expect(validateCode).toBe(0);
    } finally {
      stdoutSpy.mockRestore();
    }
  });

  it('refuses to overwrite an existing file without --force', async () => {
    const target = join(workDir, 'exists.yaml');
    writeFileSync(target, 'old contents', 'utf-8');
    const errSpy = vi.spyOn(process.stderr, 'write').mockImplementation(() => true);
    try {
      const code = await runInit(
        { output: target },
        {
          askIdentity: async () => ({ display_name: 'X', languages: ['en'], region: 'US' }),
          askExpertise: async () => ({ domain: 'x', level: 'novice' }),
        },
      );
      expect(code).toBe(1);
      const combined = errSpy.mock.calls.map((c) => String(c[0])).join('');
      expect(combined).toMatch(/already exists/);
    } finally {
      errSpy.mockRestore();
    }
  });
});
