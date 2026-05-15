import { Ajv } from 'ajv';
import { profileSchema } from '@wv/spec';

const ajv = new Ajv({ allErrors: true });
export const validateProfile = ajv.compile(profileSchema);
