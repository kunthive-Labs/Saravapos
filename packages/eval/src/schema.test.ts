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

  it('rejects a case missing input', () => {
    const { input: _input, ...withoutInput } = validCase;
    expect(validate(withoutInput)).toBe(false);
    expect(validate.errors?.some((e) => e.params['missingProperty'] === 'input')).toBe(true);
  });

  it('rejects unknown top-level fields', () => {
    expect(validate({ ...validCase, surprise: true })).toBe(false);
  });
});
