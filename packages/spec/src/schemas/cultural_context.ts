export const culturalContextSchema = {
  type: 'object',
  properties: {
    references_that_land: { type: 'array', items: { type: 'string' } },
    references_to_avoid: { type: 'array', items: { type: 'string' } },
  },
} as const;

export interface CulturalContext {
  references_that_land?: string[];
  references_to_avoid?: string[];
}
