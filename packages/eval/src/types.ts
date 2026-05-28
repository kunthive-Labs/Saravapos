/**
 * A single golden case: one input translated from one profile to another,
 * scored against a rubric. Cases live as YAML files in `cases/`.
 */
export interface GoldenCase {
  /** Stable, unique identifier. Doubles as the sort key and report label. */
  id: string;
  /** Path to the source profile, relative to the repo root. */
  from: string;
  /** Path to the target profile, relative to the repo root. */
  to: string;
  /** The source text to translate. */
  input: string;
  /** Named criteria the judge scores the translation against. */
  rubric: RubricCriterion[];
  /** Substrings that MUST appear in the translation (lexical check). */
  must_include?: string[];
  /** Substrings that must NOT appear in the translation (lexical check). */
  must_avoid?: string[];
}

/** One dimension the judge scores a translation against. */
export interface RubricCriterion {
  /** Short label, e.g. "fidelity" or "lands-for-target". */
  name: string;
  /** What a high score on this criterion means — fed verbatim to the judge. */
  description: string;
  /** Relative weight in the overall score. Defaults to 1 when omitted. */
  weight?: number;
}

/** The judge's verdict for a single rubric criterion. */
export interface CriterionScore {
  /** Criterion name, matching the rubric entry it scores. */
  name: string;
  /** Integer score from 1 (poor) to 5 (excellent). */
  score: number;
  /** One-line justification from the judge. */
  reasoning: string;
}

/** Structured result of judging one translation against a case rubric. */
export interface JudgeResult {
  /** Weight-adjusted mean of the criterion scores, on the 1-5 scale. */
  overall: number;
  /** Per-criterion scores, one entry per rubric criterion. */
  criteria: CriterionScore[];
  /** Whether all must_include / must_avoid lexical checks passed. */
  passedLexical: boolean;
}
