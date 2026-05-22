import { describe, expect, it } from 'vitest';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadProfile, loadProfileFromString } from './loadProfile.js';
import { ProfileValidationError } from './errors.js';

const PROFILES_DIR = join(fileURLToPath(new URL('.', import.meta.url)), '../../../profiles');

describe('loadProfile', () => {
  it('happy path: loads chess-expert.yaml', async () => {
    const profile = await loadProfile(join(PROFILES_DIR, 'chess-expert.yaml'));
    expect(profile.identity.display_name).toBe('Chess Expert');
    expect(profile.identity.languages).toContain('en');
  });

  it('throws on missing file', async () => {
    await expect(loadProfile('/nonexistent/path/profile.yaml')).rejects.toThrow();
  });

  it('throws ProfileValidationError on bad schema', async () => {
    const bad = `schema_version: '0.1'\n`;
    const tmp = join(PROFILES_DIR, '../.tmp-bad-profile.yaml');
    const { writeFile, unlink } = await import('node:fs/promises');
    await writeFile(tmp, bad);
    try {
      await expect(loadProfile(tmp)).rejects.toBeInstanceOf(ProfileValidationError);
    } finally {
      await unlink(tmp);
    }
  });

  it('error message includes failing field path', async () => {
    const bad = `schema_version: '0.1'\n`;
    const tmp = join(PROFILES_DIR, '../.tmp-bad-profile2.yaml');
    const { writeFile, unlink } = await import('node:fs/promises');
    await writeFile(tmp, bad);
    try {
      await loadProfile(tmp);
      expect.fail('should throw');
    } catch (e) {
      expect(e).toBeInstanceOf(ProfileValidationError);
      const err = e as ProfileValidationError;
      expect(err.fieldPath).toBeTruthy();
      expect(err.message).toContain('"');
    } finally {
      await unlink(tmp);
    }
  });
});

describe('loadProfileFromString', () => {
  it('round-trips a profile from YAML string', async () => {
    const { readFile } = await import('node:fs/promises');
    const yaml = await readFile(join(PROFILES_DIR, 'chess-expert.yaml'), 'utf-8');
    const profile = loadProfileFromString(yaml);
    expect(profile.identity.display_name).toBe('Chess Expert');
    expect(profile.schema_version).toBe('0.1');
  });

  it('rejects YAML whose root is not an object', () => {
    expect(() => loadProfileFromString('- just\n- a\n- list\n')).toThrow(ProfileValidationError);
    expect(() => loadProfileFromString('"a bare string"\n')).toThrow(ProfileValidationError);
  });

  it('handles a UTF-8 BOM at the start of the YAML', async () => {
    const yaml =
      '﻿' +
      [
        "schema_version: '0.1'",
        'identity:',
        '  display_name: BOM Carrier',
        '  languages: [en]',
        '  region: ZZ',
      ].join('\n');
    const profile = loadProfileFromString(yaml);
    expect(profile.identity.display_name).toBe('BOM Carrier');
  });
});
