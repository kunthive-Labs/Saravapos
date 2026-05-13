export const analogyEntrySchema = {
  type: 'object',
  required: ['concept', 'metaphor', 'domain'],
  properties: {
    concept: { type: 'string', minLength: 1 },
    metaphor: { type: 'string', minLength: 1 },
    domain: { type: 'string', minLength: 1 },
  },
} as const;

export const analogyBankSchema = {
  type: 'array',
  items: analogyEntrySchema,
} as const;

export interface AnalogyEntry {
  concept: string;
  metaphor: string;
  domain: string;
}

export type AnalogyBank = AnalogyEntry[];
