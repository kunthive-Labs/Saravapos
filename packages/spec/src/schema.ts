import { SCHEMA_VERSION } from './schema_version.js';
import { analogyBankSchema } from './schemas/analogy_bank.js';
import { cognitiveStyleSchema } from './schemas/cognitive_style.js';
import { culturalContextSchema } from './schemas/cultural_context.js';
import { expertiseSchema } from './schemas/expertise.js';
import { identitySchema } from './schemas/identity.js';

/** Canonical `$id` for the profile schema. */
export const PROFILE_SCHEMA_ID = 'https://worldview.dev/schemas/profile.json';

/**
 * Top-level worldview profile schema (JSON Schema draft-07).
 *
 * Composes identity, expertise, analogy_bank, cognitive_style, and
 * cultural_context. Only `schema_version` and `identity` are required —
 * authors can grow a profile incrementally.
 */
export const profileSchema = {
  $id: PROFILE_SCHEMA_ID,
  $schema: 'http://json-schema.org/draft-07/schema#',
  type: 'object',
  additionalProperties: false,
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
