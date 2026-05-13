/** Coarse expertise ranking. Determines acceptable jargon density. */
export const EXPERTISE_LEVELS = ['novice', 'intermediate', 'advanced', 'expert'] as const;
export type ExpertiseLevel = (typeof EXPERTISE_LEVELS)[number];

/**
 * Expertise sub-schema — one entry per domain the persona knows.
 * Translator uses this to decide whether to expand or compress technical terms.
 */
export const expertiseSchema = {
  type: 'object',
  required: ['domain', 'level'],
  properties: {
    /** Domain label (e.g. "chess", "machine-learning"). Free-form. */
    domain: { type: 'string', minLength: 1 },
    /** Self-rated proficiency. See `EXPERTISE_LEVELS`. */
    level: { type: 'string', enum: EXPERTISE_LEVELS },
    /** Optional years of practical exposure. Non-negative. */
    years: { type: 'number', minimum: 0 },
  },
} as const;

export interface Expertise {
  /** Domain label. */
  domain: string;
  /** Self-rated proficiency. */
  level: ExpertiseLevel;
  /** Years of practical exposure. */
  years?: number;
}
