import { describe, expect, it } from 'vitest';
import type { Profile } from '@saravapos/spec';
import { plannedStrategy } from './planned.js';

function makeProfile(name: string, domain: string): Profile {
  return {
    schema_version: '0.1',
    identity: { display_name: name, languages: ['en'], region: 'XX' },
    expertise: [{ domain, level: 'expert' }],
  };
}

describe('plannedStrategy', () => {
  const from = makeProfile('Software Engineer', 'software');
  const to = makeProfile('F1 Fan', 'formula-one');
  const system = plannedStrategy.buildSystemPrompt(from, to);

  it('is named planned', () => {
    expect(plannedStrategy.name).toBe('planned');
  });

  it('instructs a private plan before writing, kept out of the output', () => {
    expect(system).toContain('# METHOD');
    expect(system).toContain('PLAN (do not output)');
    expect(system).toMatch(/Never show the plan/i);
  });

  it('builds on the structured prompt sections', () => {
    expect(system).toContain('# TRANSLATION CONTRACT');
    expect(system).toContain('# FIDELITY CHECKLIST');
  });
});
