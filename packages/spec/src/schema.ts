import { SCHEMA_VERSION } from './schema_version.js';
import { analogyBankSchema } from './schemas/analogy_bank.js';
import { cognitiveStyleSchema } from './schemas/cognitive_style.js';
import { culturalContextSchema } from './schemas/cultural_context.js';
import { expertiseSchema } from './schemas/expertise.js';
import { identitySchema } from './schemas/identity.js';

export const profileSchema = {
  $id: 'https://worldview.dev/schemas/profile.json',
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
