import { describe, expect, it } from 'vitest';
import { SCHEMA_VERSION } from './index.js';

describe('spec package', () => {
  it('exposes SCHEMA_VERSION as semver-style string', () => {
    expect(SCHEMA_VERSION).toMatch(/^\d+\.\d+$/);
  });
});
