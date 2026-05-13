/**
 * Cultural context — references the translator should reach for or avoid.
 * Both lists are free-form strings; matching is by literal phrase.
 */
export const culturalContextSchema = {
  type: 'object',
  properties: {
    /** References the persona is likely to recognise (e.g. "Premier League"). */
    references_that_land: { type: 'array', items: { type: 'string' } },
    /** References to skip — unfamiliar, sensitive, or actively disliked. */
    references_to_avoid: { type: 'array', items: { type: 'string' } },
  },
} as const;

export interface CulturalContext {
  /** References the persona is likely to recognise. */
  references_that_land?: string[];
  /** References to skip. */
  references_to_avoid?: string[];
}
