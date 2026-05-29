import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { loadProfile } from '@saravapos/sdk';
import { loadAllCases } from './loadCase.js';

const casesDir = fileURLToPath(new URL('../cases', import.meta.url));
const repoRoot = fileURLToPath(new URL('../../..', import.meta.url));

describe('golden-case corpus', () => {
  it('every case in cases/ loads and validates', async () => {
    const cases = await loadAllCases(casesDir);
    expect(cases.length).toBeGreaterThanOrEqual(8);
  });

  it('case ids are unique', async () => {
    const cases = await loadAllCases(casesDir);
    const ids = cases.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('every case references profile paths under profiles/', async () => {
    const cases = await loadAllCases(casesDir);
    for (const c of cases) {
      expect(c.from.startsWith('profiles/')).toBe(true);
      expect(c.to.startsWith('profiles/')).toBe(true);
    }
  });

  it('every referenced profile exists and is valid', async () => {
    const cases = await loadAllCases(casesDir);
    for (const c of cases) {
      await expect(loadProfile(join(repoRoot, c.from))).resolves.toBeDefined();
      await expect(loadProfile(join(repoRoot, c.to))).resolves.toBeDefined();
    }
  });
});
