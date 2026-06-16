import type { AnalogyEntry } from '@saravapos/spec';
import { tokenize } from './tokenize.js';

/** One scored analogy-bank entry. */
export interface AnalogyMatch {
  entry: AnalogyEntry;
  score: number;
}

export interface MatchOptions {
  /** Maximum matches to return, highest score first. Default 5. */
  topN?: number;
  /** Drop entries scoring below this. Default 1 (at least one shared token). */
  minScore?: number;
}

/** Weight of how *fully* an entry's concept is covered by the input. */
const COVERAGE_WEIGHT = 2;
/** Bonus when every token of the entry's concept is present in the input. */
const PHRASE_BONUS = 2;
const DEFAULT_TOP_N = 5;
const DEFAULT_MIN_SCORE = 1;

/** Flatten extracted concept phrases into the set of distinct tokens they contain. */
function buildTokenSet(concepts: string[]): Set<string> {
  const tokens = new Set<string>();
  for (const concept of concepts) {
    for (const token of concept.split(' ')) {
      if (token.length > 0) {
        tokens.add(token);
      }
    }
  }
  return tokens;
}

function scoreAgainstTokens(tokens: Set<string>, entry: AnalogyEntry): number {
  // Distinct tokens, so a concept repeating a word can't inflate overlap/coverage.
  const conceptTokens = [...new Set(tokenize(entry.concept))];
  if (conceptTokens.length === 0) {
    return 0;
  }
  const overlap = conceptTokens.filter((t) => tokens.has(t)).length;
  const coverage = overlap / conceptTokens.length;
  // Whole-phrase bonus: every token of the entry's concept is present. Keyed on
  // full coverage rather than a literal phrase hit because extractConcepts only
  // emits unigrams/bigrams — a 3+ token concept could never match by phrase
  // string alone, so the bonus would be dead for the most specific entries.
  const phraseBonus = overlap === conceptTokens.length ? PHRASE_BONUS : 0;
  return overlap + COVERAGE_WEIGHT * coverage + phraseBonus;
}

/**
 * Score one analogy entry against a list of extracted concepts. Exported as a
 * pure, directly-testable unit. Score = `overlap + 2·coverage + phraseBonus`,
 * where overlap is the count of the entry's distinct (stemmed) concept tokens
 * present in the concepts, coverage is the fraction of them covered, and
 * phraseBonus rewards a fully-covered concept (every token present).
 */
export function scoreEntry(concepts: string[], entry: AnalogyEntry): number {
  return scoreAgainstTokens(buildTokenSet(concepts), entry);
}

/**
 * Rank a target profile's `analogy_bank` by relevance to the extracted concepts
 * of the input text. Entries below `minScore` are dropped; the rest are sorted
 * by score (desc) with a deterministic tiebreak on original bank order (so
 * authored priority is preserved and output is stable). Returns the top `topN`.
 * An undefined or empty bank yields `[]`.
 */
export function matchAnalogies(
  concepts: string[],
  bank: AnalogyEntry[] | undefined,
  opts: MatchOptions = {},
): AnalogyMatch[] {
  if (bank === undefined || bank.length === 0) {
    return [];
  }
  const topN = opts.topN ?? DEFAULT_TOP_N;
  const minScore = opts.minScore ?? DEFAULT_MIN_SCORE;
  const tokens = buildTokenSet(concepts);

  return bank
    .map((entry, idx) => ({ entry, score: scoreAgainstTokens(tokens, entry), idx }))
    .filter((m) => m.score >= minScore)
    .sort((a, b) => (b.score !== a.score ? b.score - a.score : a.idx - b.idx))
    .slice(0, topN)
    .map(({ entry, score }) => ({ entry, score }));
}
