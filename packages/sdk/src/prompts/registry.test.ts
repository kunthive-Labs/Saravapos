import { describe, expect, it } from 'vitest';
import { DEFAULT_STRATEGY, promptStrategies, resolveStrategy } from './registry.js';

describe('resolveStrategy', () => {
  it('registers the baseline, structured, and candidate variants', () => {
    expect(Object.keys(promptStrategies).sort()).toEqual([
      'analogyFirst',
      'baseline',
      'fewShot',
      'plainLanguage',
      'planned',
      'structured',
    ]);
  });

  it('defaults to the baseline strategy', () => {
    expect(resolveStrategy().name).toBe(DEFAULT_STRATEGY);
    expect(DEFAULT_STRATEGY).toBe('baseline');
  });

  it('returns each named strategy', () => {
    expect(resolveStrategy('structured').name).toBe('structured');
    expect(resolveStrategy('fewShot').name).toBe('fewShot');
    expect(resolveStrategy('plainLanguage').name).toBe('plainLanguage');
    expect(resolveStrategy('planned').name).toBe('planned');
    expect(resolveStrategy('analogyFirst').name).toBe('analogyFirst');
  });

  it('throws with the known names on an unknown strategy', () => {
    expect(() => resolveStrategy('nope')).toThrow(/unknown prompt strategy "nope"/);
    expect(() => resolveStrategy('nope')).toThrow(/baseline/);
  });
});
