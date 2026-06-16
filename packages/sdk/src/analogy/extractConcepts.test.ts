import { describe, expect, it } from 'vitest';
import { extractConcepts } from './extractConcepts.js';

describe('extractConcepts', () => {
  it('extracts unigrams and adjacent bigrams', () => {
    const concepts = extractConcepts('positional advantage');
    expect(concepts).toContain('positional');
    expect(concepts).toContain('advantage');
    expect(concepts).toContain('positional advantage');
  });

  it('does not bridge a bigram across a stopword', () => {
    // "pawn" and "advantage" are separated by the stopword "for".
    const concepts = extractConcepts('pawn for advantage');
    expect(concepts).toContain('pawn');
    expect(concepts).toContain('advantage');
    expect(concepts).not.toContain('pawn advantage');
  });

  it('does not bridge a bigram across sentence punctuation', () => {
    const concepts = extractConcepts('advantage. Pawn structure');
    expect(concepts).not.toContain('advantage pawn');
    expect(concepts).toContain('pawn structure');
  });

  it('ranks a repeated bigram above a single unigram', () => {
    const concepts = extractConcepts('pawn sacrifice pawn sacrifice lone');
    expect(concepts.indexOf('pawn sacrifice')).toBeLessThan(concepts.indexOf('lone'));
  });

  it('respects the maxConcepts cap', () => {
    const concepts = extractConcepts('alpha beta gamma delta epsilon', { maxConcepts: 2 });
    expect(concepts).toHaveLength(2);
  });

  it('returns an empty array for empty or stopword-only input', () => {
    expect(extractConcepts('')).toEqual([]);
    expect(extractConcepts('I am in the it')).toEqual([]);
  });

  it('handles a single content word with no bigram', () => {
    expect(extractConcepts('checkmate')).toEqual(['checkmate']);
  });
});
