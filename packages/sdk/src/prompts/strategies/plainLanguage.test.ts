import { describe, expect, it } from 'vitest';
import type { Profile } from '@saravapos/spec';
import { plainLanguageStrategy } from './plainLanguage.js';

function makeProfile(name: string, domain: string): Profile {
  return {
    schema_version: '0.1',
    identity: { display_name: name, languages: ['en'], region: 'XX' },
    expertise: [{ domain, level: 'expert' }],
  };
}

describe('plainLanguageStrategy', () => {
  const from = makeProfile('Software Engineer', 'software');
  const to = makeProfile('Curious Novice', 'general');
  const system = plainLanguageStrategy.buildSystemPrompt(from, to);

  it('is named plainLanguage', () => {
    expect(plainLanguageStrategy.name).toBe('plainLanguage');
  });

  it('adds a plain-language directive that forbids surviving jargon', () => {
    expect(system).toContain('# PLAIN-LANGUAGE MODE');
    expect(system).toMatch(/may survive in the output/i);
  });

  it('builds on the structured prompt sections', () => {
    expect(system).toContain('# TRANSLATION CONTRACT');
    expect(system).toContain('# FIDELITY CHECKLIST');
    expect(system).toContain('SOURCE WORLDVIEW');
    expect(system).toContain('TARGET WORLDVIEW');
  });
});
