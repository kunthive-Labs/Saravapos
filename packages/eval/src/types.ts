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
