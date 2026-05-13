import { Ajv } from 'ajv';
import { describe, expect, it } from 'vitest';
import { profileSchema } from './schema.js';
import type { Profile } from './types.js';

const ajv = new Ajv();
const validate = ajv.compile(profileSchema);

function expectValid(profile: unknown): void {
  const result = validate(profile);
  expect(result, JSON.stringify(validate.errors)).toBe(true);
}

const chessExpert: Profile = {
  schema_version: '0.1',
  identity: { display_name: 'Chess Expert', languages: ['en'], region: 'UK' },
  expertise: [
    { domain: 'chess', level: 'expert', years: 15 },
    { domain: 'formula-one', level: 'novice' },
  ],
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
  cognitive_style: {
    mode: 'verbal',
    prefers: ['precise terminology', 'concrete positions'],
    abstraction_tolerance: 'high',
  },
  cultural_context: {
    references_that_land: ['Magnus Carlsen', 'Kasparov', 'Sicilian Defence'],
    references_to_avoid: ['Premier League', 'NASCAR'],
  },
};

describe('chess-expert profile', () => {
  it('validates against schema', () => {
    expectValid(chessExpert);
  });
});
