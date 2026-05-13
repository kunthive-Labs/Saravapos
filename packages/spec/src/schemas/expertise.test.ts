import Ajv from 'ajv';
import { describe, expect, it } from 'vitest';
import { expertiseSchema } from './expertise.js';

const ajv = new Ajv();
const validate = ajv.compile(expertiseSchema);

describe('expertise schema', () => {
  it('rejects an invalid level enum value', () => {
    const sample = {
      domain: 'chess',
      level: 'grandmaster',
    };
    expect(validate(sample)).toBe(false);
    expect(validate.errors?.[0]?.keyword).toBe('enum');
    expect(validate.errors?.[0]?.instancePath).toBe('/level');
  });
});
