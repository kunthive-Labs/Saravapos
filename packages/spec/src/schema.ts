import { SCHEMA_VERSION } from './schema_version.js';
import { analogyBankSchema } from './schemas/analogy_bank.js';
import { cognitiveStyleSchema } from './schemas/cognitive_style.js';
import { culturalContextSchema } from './schemas/cultural_context.js';
import { expertiseSchema } from './schemas/expertise.js';
import { identitySchema } from './schemas/identity.js';

export const PROFILE_SCHEMA_ID = 'https://worldview.dev/schemas/profile.json';

export const profileSchema = {
  $id: PROFILE_SCHEMA_ID,
  $schema: 'http://json-schema.org/draft-07/schema#',
  type: 'object',
  required: ['schema_version', 'identity'],
  properties: {
    schema_version: { type: 'string', const: SCHEMA_VERSION },
    identity: identitySchema,
    expertise: { type: 'array', items: expertiseSchema },
    analogy_bank: analogyBankSchema,
    cognitive_style: cognitiveStyleSchema,
    cultural_context: culturalContextSchema,
  },
} as const;

export const profileSchemaJson: string = JSON.stringify(profileSchema, null, 2);
