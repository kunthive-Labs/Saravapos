import { Ajv } from 'ajv';
import { describe, expect, it } from 'vitest';
import { identitySchema } from './identity.js';

const ajv = new Ajv();
const validate = ajv.compile(identitySchema);

describe('identity schema', () => {
  it('validates a complete identity sample', () => {
    const sample = {
      display_name: 'Alex Chen',
      languages: ['en', 'zh'],
      region: 'US',
    };
    expect(validate(sample)).toBe(true);
    expect(validate.errors).toBeNull();
  });

  it('rejects an identity missing display_name', () => {
    const sample = {
      languages: ['en'],
      region: 'US',
    };
    expect(validate(sample)).toBe(false);
    expect(validate.errors?.[0]?.params).toMatchObject({ missingProperty: 'display_name' });
  });
});
