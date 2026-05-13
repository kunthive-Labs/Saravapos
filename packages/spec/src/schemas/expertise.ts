export const EXPERTISE_LEVELS = ['novice', 'intermediate', 'advanced', 'expert'] as const;
export type ExpertiseLevel = (typeof EXPERTISE_LEVELS)[number];

export const expertiseSchema = {
  type: 'object',
  required: ['domain', 'level'],
  properties: {
    domain: { type: 'string', minLength: 1 },
    level: { type: 'string', enum: EXPERTISE_LEVELS },
    years: { type: 'number', minimum: 0 },
  },
} as const;

export interface Expertise {
  domain: string;
  level: ExpertiseLevel;
  years?: number;
}
