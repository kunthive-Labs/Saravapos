import { describe, expect, it } from 'vitest';
import type { Profile } from '@saravapos/spec';
import { fewShotStrategy } from './fewShot.js';

function makeProfile(name: string, domain: string): Profile {
  return {
    schema_version: '0.1',
    identity: { display_name: name, languages: ['en'], region: 'XX' },
    expertise: [{ domain, level: 'expert' }],
  };
}

describe('fewShotStrategy', () => {
  const from = makeProfile('Chess Expert', 'chess');
  const to = makeProfile('F1 Fan', 'formula-one');
  const system = fewShotStrategy.buildSystemPrompt(from, to);

  it('is named fewShot', () => {
    expect(fewShotStrategy.name).toBe('fewShot');
  });

  it('includes an examples section with worked translation pairs', () => {
    expect(system).toContain('# EXAMPLES');
    expect(system).toContain('SOURCE');
    expect(system).toContain('TARGET');
  });

  it('still carries the structured sections it builds on', () => {
    expect(system).toContain('# TRANSLATION CONTRACT');
    expect(system).toContain('# FIDELITY CHECKLIST');
  });
});
