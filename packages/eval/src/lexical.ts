import type { GoldenCase } from './types.js';

/**
 * Outcome of the case-insensitive lexical checks for one translation.
 * Used both as a gate (`passed`) and for diagnostic output in the runner.
 */
export interface LexicalResult {
  /** True when all must_include matched and no must_avoid term appeared. */
  passed: boolean;
  /** must_include terms that did NOT appear in the translation. */
  missingIncludes: string[];
  /** must_avoid terms that DID appear in the translation. */
  presentAvoids: string[];
}

/** Run the must_include / must_avoid checks against a candidate translation. */
export function runLexicalChecks(c: GoldenCase, translation: string): LexicalResult {
  const haystack = translation.toLowerCase();
  const missingIncludes = (c.must_include ?? []).filter(
    (term) => !haystack.includes(term.toLowerCase()),
  );
  const presentAvoids = (c.must_avoid ?? []).filter((term) =>
    haystack.includes(term.toLowerCase()),
  );
  return {
    passed: missingIncludes.length === 0 && presentAvoids.length === 0,
    missingIncludes,
    presentAvoids,
  };
}
