import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { runValidate } from './validate.js';

const repoRoot = resolve(fileURLToPath(import.meta.url), '..', '..', '..', '..', '..');
const chessProfile = resolve(repoRoot, 'profiles', 'chess-expert.yaml');

describe('runValidate', () => {
  let workDir: string;

  beforeEach(() => {
    workDir = mkdtempSync(join(tmpdir(), 'saravapos-validate-'));
  });

  afterEach(() => {
    rmSync(workDir, { recursive: true, force: true });
  });

  it('returns 0 and prints a summary on a valid profile', async () => {
    const writeSpy = vi.spyOn(process.stdout, 'write').mockImplementation(() => true);
    try {
      const code = await runValidate(chessProfile);
      expect(code).toBe(0);
      const combined = writeSpy.mock.calls.map((c) => String(c[0])).join('');
      expect(combined).toMatch(/is valid/);
      expect(combined).toMatch(/Chess Expert/);
    } finally {
      writeSpy.mockRestore();
    }
  });

  it('returns 1 and prints field-level errors on an invalid profile', async () => {
    const badPath = join(workDir, 'bad.yaml');
    writeFileSync(badPath, "schema_version: '0.1'\nidentity:\n  languages: [en]\n", 'utf-8');
    const errSpy = vi.spyOn(process.stderr, 'write').mockImplementation(() => true);
    try {
      const code = await runValidate(badPath);
      expect(code).toBe(1);
      const combined = errSpy.mock.calls.map((c) => String(c[0])).join('');
      expect(combined).toMatch(/is invalid/);
      expect(combined).toMatch(/display_name/);
    } finally {
      errSpy.mockRestore();
    }
  });
});
