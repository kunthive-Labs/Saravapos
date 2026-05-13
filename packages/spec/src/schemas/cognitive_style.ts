/** Dominant input channel the persona thinks in. */
export const COGNITIVE_MODES = ['visual', 'verbal', 'kinesthetic', 'mixed'] as const;
export type CognitiveMode = (typeof COGNITIVE_MODES)[number];

/** How much abstract / symbolic phrasing the persona tolerates. */
export const ABSTRACTION_TOLERANCE = ['low', 'medium', 'high'] as const;
export type AbstractionTolerance = (typeof ABSTRACTION_TOLERANCE)[number];

/**
 * Cognitive style — shapes phrasing choices: diagrams vs prose,
 * concrete examples vs general principles, density of abstraction.
 */
export const cognitiveStyleSchema = {
  type: 'object',
  required: ['mode'],
  properties: {
    /** Primary thinking modality. See `COGNITIVE_MODES`. */
    mode: { type: 'string', enum: COGNITIVE_MODES },
    /** Specific phrasing preferences (e.g. "step-by-step", "bullet lists"). */
    prefers: { type: 'array', items: { type: 'string' } },
    /** Tolerance for abstract language. See `ABSTRACTION_TOLERANCE`. */
    abstraction_tolerance: { type: 'string', enum: ABSTRACTION_TOLERANCE },
  },
} as const;

export interface CognitiveStyle {
  /** Primary thinking modality. */
  mode: CognitiveMode;
  /** Specific phrasing preferences. */
  prefers?: string[];
  /** Tolerance for abstract language. */
  abstraction_tolerance?: AbstractionTolerance;
}
