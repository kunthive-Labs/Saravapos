import { describe, expect, it } from 'vitest';
import type { Profile } from '@saravapos/spec';
import { dynamicAnalogyStrategy } from './dynamicAnalogy.js';

const FROM: Profile = {
  schema_version: '0.1',
  identity: { display_name: 'Chess Expert', languages: ['en'], region: 'US' },
  expertise: [{ domain: 'chess', level: 'expert' }],
  analogy_bank: [
    {
      concept: 'pawn sacrifice',
      metaphor: 'burning fresh tyres to gain track position',
      domain: 'formula-one',
    },
    {
      concept: 'positional advantage',
      metaphor: 'controlling the undercut window',
      domain: 'formula-one',
    },
  ],
};

const TO: Profile = {
  schema_version: '0.1',
  identity: { display_name: 'F1 Fan', languages: ['en'], region: 'GB' },
  expertise: [{ domain: 'formula-one', level: 'intermediate' }],
  analogy_bank: [
    { concept: 'undercut', metaphor: 'pitting early to jump a rival', domain: 'formula-one' },
  ],
};

const NO_BANK: Profile = {
  schema_version: '0.1',
  identity: { display_name: 'Plain', languages: ['en'], region: 'XX' },
  expertise: [{ domain: 'general', level: 'novice' }],
};

describe('dynamicAnalogyStrategy', () => {
  it('is named dynamicAnalogy and builds on the structured sections', () => {
    const system = dynamicAnalogyStrategy.buildSystemPrompt(FROM, TO, 'anything');
    expect(dynamicAnalogyStrategy.name).toBe('dynamicAnalogy');
    expect(system).toContain('# TRANSLATION CONTRACT');
    expect(system).toContain('# FIDELITY CHECKLIST');
  });

  it('injects only the analogies that match the input concepts', () => {
    const system = dynamicAnalogyStrategy.buildSystemPrompt(
      FROM,
      TO,
      'I sacrificed a pawn for a positional advantage',
    );
    expect(system).toContain('# RELEVANT ANALOGIES');
    expect(system).toContain('controlling the undercut window'); // positional advantage (full match)
    expect(system).toContain('burning fresh tyres to gain track position'); // pawn sacrifice (partial)
    expect(system).not.toContain('pitting early to jump a rival'); // undercut — not in the input
  });

  it('suppresses the static analogy dump (no double-listing)', () => {
    const system = dynamicAnalogyStrategy.buildSystemPrompt(FROM, TO, 'positional advantage');
    expect(system).not.toContain('Analogy bank:'); // the describeProfile static dump label
  });

  it('falls back gracefully when no input text is available', () => {
    const system = dynamicAnalogyStrategy.buildSystemPrompt(FROM, TO, '');
    expect(system).toContain('# RELEVANT ANALOGIES');
    expect(system).toContain('No input text was available');
  });

  it('reports when nothing matched (no banks)', () => {
    const system = dynamicAnalogyStrategy.buildSystemPrompt(NO_BANK, NO_BANK, 'some input text');
    expect(system).toContain('None of the available analogy-bank entries matched');
  });
});
