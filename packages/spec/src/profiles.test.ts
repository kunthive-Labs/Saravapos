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

const f1Fan: Profile = {
  schema_version: '0.1',
  identity: { display_name: 'F1 Fan', languages: ['en'], region: 'UK' },
  expertise: [
    { domain: 'formula-one', level: 'expert', years: 10 },
    { domain: 'chess', level: 'novice' },
  ],
  analogy_bank: [
    {
      concept: 'strategic sacrifice',
      metaphor: 'pitting early to jump rivals on fresh rubber',
      domain: 'formula-one',
    },
    {
      concept: 'opening theory',
      metaphor: 'pre-race strategy briefing before lights out',
      domain: 'formula-one',
    },
  ],
  cognitive_style: {
    mode: 'visual',
    prefers: ['real-world race scenarios', 'lap time comparisons'],
    abstraction_tolerance: 'low',
  },
  cultural_context: {
    references_that_land: ['Hamilton', 'Verstappen', 'DRS', 'safety car', 'undercut'],
    references_to_avoid: ['algebraic notation', 'endgame tablebase'],
  },
};

describe('chess-expert profile', () => {
  it('validates against schema', () => {
    expectValid(chessExpert);
  });
});

describe('f1-fan profile', () => {
  it('validates against schema', () => {
    expectValid(f1Fan);
  });
});
