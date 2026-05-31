import { describe, expect, it } from 'vitest';
import { DEFAULT_STRATEGY, promptStrategies, resolveStrategy } from './registry.js';

describe('resolveStrategy', () => {
  it('registers baseline, structured, and fewShot', () => {
    expect(Object.keys(promptStrategies).sort()).toEqual(['baseline', 'fewShot', 'structured']);
  });

  it('defaults to the baseline strategy', () => {
    expect(resolveStrategy().name).toBe(DEFAULT_STRATEGY);
    expect(DEFAULT_STRATEGY).toBe('baseline');
  });

  it('returns each named strategy', () => {
    expect(resolveStrategy('structured').name).toBe('structured');
    expect(resolveStrategy('fewShot').name).toBe('fewShot');
  });

  it('throws with the known names on an unknown strategy', () => {
    expect(() => resolveStrategy('nope')).toThrow(/unknown prompt strategy "nope"/);
    expect(() => resolveStrategy('nope')).toThrow(/baseline/);
  });
});
