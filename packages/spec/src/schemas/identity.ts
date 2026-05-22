/**
 * Identity sub-schema — who the speaker is at a surface level.
 * Drives default language choice and basic addressing conventions.
 */
export const identitySchema = {
  type: 'object',
  additionalProperties: false,
  required: ['display_name', 'languages', 'region'],
  properties: {
    /** Human-readable name for the persona. Used in logs and CLI output. */
    display_name: { type: 'string', minLength: 1 },
    /** BCP-47-ish language tags this persona speaks, ordered by preference. */
    languages: { type: 'array', items: { type: 'string' }, minItems: 1 },
    /** Coarse geographic or cultural region (e.g. "US", "Tokyo"). */
    region: { type: 'string', minLength: 1 },
  },
} as const;

export interface Identity {
  /** Human-readable name for the persona. */
  display_name: string;
  /** Language tags ordered by preference. */
  languages: string[];
  /** Coarse geographic or cultural region. */
  region: string;
}
