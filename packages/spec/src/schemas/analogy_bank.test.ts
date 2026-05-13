import { Ajv } from 'ajv';
import { describe, expect, it } from 'vitest';
import { analogyBankSchema } from './analogy_bank.js';

const ajv = new Ajv();
const validate = ajv.compile(analogyBankSchema);

describe('analogy_bank schema', () => {
  it('accepts an empty array', () => {
    expect(validate([])).toBe(true);
    expect(validate.errors).toBeNull();
  });
});
