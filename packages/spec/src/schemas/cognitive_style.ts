export const COGNITIVE_MODES = ['visual', 'verbal', 'kinesthetic', 'mixed'] as const;
export type CognitiveMode = (typeof COGNITIVE_MODES)[number];

export const ABSTRACTION_TOLERANCE = ['low', 'medium', 'high'] as const;
export type AbstractionTolerance = (typeof ABSTRACTION_TOLERANCE)[number];

export const cognitiveStyleSchema = {
  type: 'object',
  required: ['mode'],
  properties: {
    mode: { type: 'string', enum: COGNITIVE_MODES },
    prefers: { type: 'array', items: { type: 'string' } },
    abstraction_tolerance: { type: 'string', enum: ABSTRACTION_TOLERANCE },
  },
} as const;

export interface CognitiveStyle {
  mode: CognitiveMode;
  prefers?: string[];
  abstraction_tolerance?: AbstractionTolerance;
}
