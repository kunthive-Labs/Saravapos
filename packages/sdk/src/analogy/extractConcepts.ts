import { tokenizeRuns } from './tokenize.js';

export interface ExtractOptions {
  /** Maximum number of concepts to return. Default 20. */
  maxConcepts?: number;
}

/** A bigram counts for more than a unigram — multiword phrases match concepts better. */
const UNIGRAM_WEIGHT = 1;
const BIGRAM_WEIGHT = 1.5;
const DEFAULT_MAX_CONCEPTS = 20;

/**
 * Extract salient candidate concepts from raw text — the unigrams and adjacent
 * bigrams of its content tokens, scored by weighted frequency. Deterministic
 * and key-free: no LLM, no randomness. Bigrams only form within a
 * {@link tokenizeRuns} run, so they never bridge a stopword or sentence break.
 *
 * Returns distinct phrase strings ordered by score (desc) then first
 * appearance (asc), capped at `maxConcepts`. These feed analogy matching.
 */
export function extractConcepts(text: string, opts: ExtractOptions = {}): string[] {
  const maxConcepts = opts.maxConcepts ?? DEFAULT_MAX_CONCEPTS;
  const scores = new Map<string, number>();
  const firstSeen = new Map<string, number>();
  let position = 0;

  const bump = (phrase: string, weight: number): void => {
    scores.set(phrase, (scores.get(phrase) ?? 0) + weight);
    if (!firstSeen.has(phrase)) {
      firstSeen.set(phrase, position);
    }
    position += 1;
  };

  for (const run of tokenizeRuns(text)) {
    run.forEach((token, i) => {
      bump(token, UNIGRAM_WEIGHT);
      if (i < run.length - 1) {
        bump(`${token} ${run[i + 1]}`, BIGRAM_WEIGHT);
      }
    });
  }

  return [...scores.keys()]
    .sort((a, b) => {
      const byScore = scores.get(b)! - scores.get(a)!;
      return byScore !== 0 ? byScore : firstSeen.get(a)! - firstSeen.get(b)!;
    })
    .slice(0, maxConcepts);
}
