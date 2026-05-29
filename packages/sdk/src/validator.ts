import { Ajv } from 'ajv';
import { profileSchema } from '@saravapos/spec';

const ajv = new Ajv({ allErrors: true });
export const validateProfile = ajv.compile(profileSchema);
