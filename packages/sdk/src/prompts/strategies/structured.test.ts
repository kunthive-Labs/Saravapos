import { describe, expect, it } from 'vitest';
import type { Profile } from '@saravapos/spec';
import { buildStructuredSystemPrompt, structuredStrategy } from './structured.js';

function makeProfile(name: string, domain: string): Profile {
  return {
    schema_version: '0.1',
    identity: { display_name: name, languages: ['en'], region: 'XX' },
    expertise: [{ domain, level: 'expert' }],
  };
}

describe('structuredStrategy', () => {
  const from = makeProfile('Chess Expert', 'chess');
  const to = makeProfile('F1 Fan', 'formula-one');
  const system = structuredStrategy.buildSystemPrompt(from, to);

  it('is named structured', () => {
    expect(structuredStrategy.name).toBe('structured');
  });

  it('emits the role, contract, checklist, and output sections', () => {
    expect(system).toContain('# ROLE');
    expect(system).toContain('# TRANSLATION CONTRACT');
    expect(system).toContain('# FIDELITY CHECKLIST');
    expect(system).toContain('# OUTPUT');
  });

  it('still describes both profiles', () => {
    expect(system).toContain('SOURCE WORLDVIEW');
    expect(system).toContain('TARGET WORLDVIEW');
    expect(system).toContain('Chess Expert');
    expect(system).toContain('F1 Fan');
  });

  it('dumps the analogy banks by default but can omit them', () => {
    const withBank: Profile = {
      ...from,
      analogy_bank: [{ concept: 'pawn', metaphor: 'tyre', domain: 'formula-one' }],
    };
    expect(structuredStrategy.buildSystemPrompt(withBank, to)).toContain('Analogy bank:');
    expect(buildStructuredSystemPrompt(withBank, to, { includeAnalogyBanks: false })).not.toContain(
      'Analogy bank:',
    );
  });
});
