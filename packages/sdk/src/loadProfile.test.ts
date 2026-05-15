import { describe, expect, it } from 'vitest';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadProfile } from './loadProfile.js';

const PROFILES_DIR = join(fileURLToPath(new URL('.', import.meta.url)), '../../../profiles');

describe('loadProfile', () => {
  it('happy path: loads chess-expert.yaml', async () => {
    const profile = await loadProfile(join(PROFILES_DIR, 'chess-expert.yaml'));
    expect(profile.identity.display_name).toBe('Chess Expert');
    expect(profile.identity.languages).toContain('en');
  });
});
