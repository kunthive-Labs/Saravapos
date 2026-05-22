/**
 * One analogy mapping: a concept from any domain rephrased as a metaphor
 * the persona will readily understand.
 */
export const analogyEntrySchema = {
  type: 'object',
  additionalProperties: false,
  required: ['concept', 'metaphor', 'domain'],
  properties: {
    /** Source concept being explained (e.g. "pawn structure"). */
    concept: { type: 'string', minLength: 1 },
    /** Metaphor that lands for this persona (e.g. "tire strategy"). */
    metaphor: { type: 'string', minLength: 1 },
    /** Domain the metaphor lives in (e.g. "formula-one"). */
    domain: { type: 'string', minLength: 1 },
  },
} as const;

/**
 * Analogy bank — ordered list of preferred metaphors.
 * Translator consults this first before inventing new analogies.
 */
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
