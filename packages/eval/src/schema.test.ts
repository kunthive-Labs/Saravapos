import { describe, expect, it } from 'vitest';
import { Ajv } from 'ajv';
import { goldenCaseSchema } from './schema.js';

const validate = new Ajv({ allErrors: true }).compile(goldenCaseSchema);

const validCase = {
  id: 'sample',
  from: 'profiles/chess-expert.yaml',
  to: 'profiles/f1-fan.yaml',
  input: 'I sacrificed a pawn for a positional advantage.',
  rubric: [{ name: 'fidelity', description: 'Preserves the original meaning.' }],
};

describe('goldenCaseSchema', () => {
  it('validates a well-formed case', () => {
    expect(validate(validCase)).toBe(true);
  });
});
