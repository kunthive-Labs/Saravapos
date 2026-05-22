import { Ajv } from 'ajv';
import { describe, expect, it } from 'vitest';
import { profileSchema } from './schema.js';
import { SCHEMA_VERSION } from './schema_version.js';

const ajv = new Ajv();
const validate = ajv.compile(profileSchema);

describe('profile schema (end-to-end)', () => {
  it('validates a full, well-formed profile', () => {
    const profile = {
      schema_version: SCHEMA_VERSION,
      identity: {
        display_name: 'Jordan',
        languages: ['en'],
        region: 'UK',
      },
      expertise: [
        { domain: 'chess', level: 'expert', years: 12 },
        { domain: 'formula-one', level: 'novice' },
      ],
      analogy_bank: [
        { concept: 'pawn structure', metaphor: 'tire strategy', domain: 'formula-one' },
      ],
      cognitive_style: {
        mode: 'verbal',
        prefers: ['concrete examples'],
        abstraction_tolerance: 'medium',
      },
      cultural_context: {
        references_that_land: ['Premier League', 'cricket'],
        references_to_avoid: ['NFL'],
      },
    };
    expect(validate(profile)).toBe(true);
    expect(validate.errors).toBeNull();
  });

  it('accepts a profile with an empty analogy_bank', () => {
    const profile = {
      schema_version: SCHEMA_VERSION,
      identity: { display_name: 'Empty', languages: ['en'], region: 'XX' },
      analogy_bank: [],
    };
    expect(validate(profile)).toBe(true);
    expect(validate.errors).toBeNull();
  });

  it('rejects an unknown top-level field', () => {
    const profile = {
      schema_version: SCHEMA_VERSION,
      identity: { display_name: 'X', languages: ['en'], region: 'US' },
      not_a_real_field: 42,
    };
    expect(validate(profile)).toBe(false);
  });

  it('rejects a profile missing schema_version', () => {
    const profile = {
      identity: { display_name: 'X', languages: ['en'], region: 'US' },
    };
    expect(validate(profile)).toBe(false);
  });
});
