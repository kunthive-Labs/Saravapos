import { describe, expect, it } from 'vitest';
import type { Profile } from '@saravapos/spec';
import { buildSystemPrompt } from '../system.js';
import { buildUserPrompt } from '../user.js';
import { baselineStrategy } from './baseline.js';

function makeProfile(name: string, domain: string): Profile {
  return {
    schema_version: '0.1',
    identity: { display_name: name, languages: ['en'], region: 'XX' },
    expertise: [{ domain, level: 'expert' }],
  };
}

describe('baselineStrategy', () => {
  const from = makeProfile('Chess Expert', 'chess');
  const to = makeProfile('F1 Fan', 'formula-one');

  it('is named baseline', () => {
    expect(baselineStrategy.name).toBe('baseline');
  });

  it('reproduces the current system prompt byte-for-byte', () => {
    expect(baselineStrategy.buildSystemPrompt(from, to)).toBe(buildSystemPrompt(from, to));
  });

  it('reproduces the current user prompt byte-for-byte', () => {
    expect(baselineStrategy.buildUserPrompt('hello')).toBe(buildUserPrompt('hello'));
  });
});
