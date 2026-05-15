import { describe, expect, it } from 'vitest';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadProfile } from './loadProfile.js';
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
});
