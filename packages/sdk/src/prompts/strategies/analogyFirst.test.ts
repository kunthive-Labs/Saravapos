import { describe, expect, it } from 'vitest';
import type { Profile } from '@saravapos/spec';
import { analogyFirstStrategy } from './analogyFirst.js';

function makeProfile(name: string, domain: string): Profile {
  return {
    schema_version: '0.1',
    identity: { display_name: name, languages: ['en'], region: 'XX' },
    expertise: [{ domain, level: 'expert' }],
  };
}

describe('analogyFirstStrategy', () => {
  const from = makeProfile('Chess Expert', 'chess');
  const to = makeProfile('F1 Fan', 'formula-one');
  const system = analogyFirstStrategy.buildSystemPrompt(from, to);

  it('is named analogyFirst', () => {
    expect(analogyFirstStrategy.name).toBe('analogyFirst');
  });

  it('directs anchoring in the target analogy bank', () => {
    expect(system).toContain('# ANCHORING');
    expect(system).toMatch(/analogy bank/i);
    expect(system).toMatch(/references that land/i);
  });

  it('builds on the structured prompt sections', () => {
    expect(system).toContain('# TRANSLATION CONTRACT');
    expect(system).toContain('# FIDELITY CHECKLIST');
  });
});
