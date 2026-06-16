/**
 * A small curated English stopword set. Deliberately modest — just the
 * function words that would otherwise dominate token counts and bridge
 * unrelated content words into noise bigrams.
 */
const STOPWORDS: ReadonlySet<string> = new Set([
  'a',
  'an',
  'the',
  'of',
  'for',
  'to',
  'and',
  'or',
  'but',
  'in',
  'on',
  'at',
  'with',
  'from',
  'by',
  'as',
  'is',
  'are',
  'was',
  'were',
  'be',
  'been',
  'being',
  'it',
  'its',
  'this',
  'that',
  'these',
  'those',
  'i',
  'we',
  'you',
  'he',
  'she',
  'they',
  'them',
  'my',
  'our',
  'your',
  'so',
  'if',
  'then',
  'than',
  'into',
  'out',
  'up',
  'down',
  'over',
  'under',
  'about',
  'not',
  'no',
  'do',
  'does',
  'did',
]);

/** Minimum length for a token to survive, and for a stem to be applied. */
const MIN_TOKEN_LENGTH = 3;

/**
 * Light, deterministic suffix stemmer. Reduces a few common English inflections
 * so "advantages" and "advantage" collapse to the same token. It is NOT
 * linguistically correct — it only needs to be *consistent*, since the same
 * function normalizes both the input text and the analogy `concept` fields it
 * is matched against. Each strip is gated so the remaining stem stays
 * meaningful (>= MIN_TOKEN_LENGTH).
 */
function stem(token: string): string {
  const tryStrip = (suffix: string): string | null => {
    if (token.length - suffix.length >= MIN_TOKEN_LENGTH && token.endsWith(suffix)) {
      return token.slice(0, -suffix.length);
    }
    return null;
  };
  // Order matters: longest, most specific suffix first.
  const stemmed =
    tryStrip('ing') ??
    tryStrip('ed') ??
    // Plain plurals only — skip "ss" (e.g. "loss" should not become "los").
    (token.endsWith('ss') ? null : tryStrip('s'));
  return stemmed ?? token;
}

/**
 * Normalise text into *runs* of consecutive content tokens. A run breaks at a
 * stopword, a short token, or sentence punctuation (`. ! ? ; :`) — so adjacent
 * survivors within a run were genuinely next to each other in the source
 * ("pawn sacrifice"), while a removed stopword or sentence end ends the run and
 * prevents spurious cross-boundary phrases ("advantage" + "pawn" across a
 * period). Each token is stemmed. Deterministic.
 */
export function tokenizeRuns(text: string): string[][] {
  const runs: string[][] = [];
  for (const sentence of text.toLowerCase().split(/[.!?;:]+/)) {
    let current: string[] = [];
    for (const raw of sentence.split(/[^a-z0-9]+/)) {
      if (raw.length >= MIN_TOKEN_LENGTH && !STOPWORDS.has(raw)) {
        current.push(stem(raw));
      } else if (current.length > 0) {
        runs.push(current);
        current = [];
      }
    }
    if (current.length > 0) {
      runs.push(current);
    }
  }
  return runs;
}

/**
 * Flatten {@link tokenizeRuns} into a single stream of content tokens. Used by
 * analogy matching, which only needs the bag of tokens, not their grouping.
 */
export function tokenize(text: string): string[] {
  return tokenizeRuns(text).flat();
}
