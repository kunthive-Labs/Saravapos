import { describe, expect, it } from 'vitest';
import type { AnalogyEntry } from '@saravapos/spec';
import { extractConcepts } from './extractConcepts.js';
import { matchAnalogies, scoreEntry } from './matchAnalogies.js';

const BANK: AnalogyEntry[] = [
  {
    concept: 'pawn sacrifice',
    metaphor: 'burning fresh tyres to gain track position',
    domain: 'formula-one',
  },
  {
    concept: 'positional advantage',
    metaphor: 'controlling the undercut window',
    domain: 'formula-one',
  },
  {
    concept: 'endgame technique',
    metaphor: 'managing tyre deg in the final stint',
    domain: 'formula-one',
  },
];

describe('scoreEntry', () => {
  it('scores a full phrase hit highest (overlap + coverage + phrase bonus)', () => {
    const concepts = extractConcepts('I gained a positional advantage');
    // overlap 2 + 2*(2/2) coverage + 2 phrase bonus = 6
    expect(scoreEntry(concepts, BANK[1]!)).toBeCloseTo(6);
  });

  it('scores a partial token overlap below a full hit', () => {
    const concepts = extractConcepts('I sacrificed a pawn');
    // matches "pawn" only (sacrificed stems to sacrific): overlap 1 + 2*(1/2) + 0 = 2
    expect(scoreEntry(concepts, BANK[0]!)).toBeCloseTo(2);
  });

  it('scores zero when nothing overlaps', () => {
    expect(scoreEntry(extractConcepts('lights out and away we go'), BANK[2]!)).toBe(0);
  });

  it('scores a concept that tokenizes to nothing as zero (no NaN)', () => {
    expect(scoreEntry(['pawn'], { concept: 'as is the', metaphor: 'm', domain: 'd' })).toBe(0);
  });

  it('dedupes repeated concept tokens so they do not inflate the score', () => {
    // "advantages advantage" stems to ['advantage','advantage'] -> distinct ['advantage'].
    const dup = scoreEntry(['advantage'], {
      concept: 'advantages advantage',
      metaphor: 'm',
      domain: 'd',
    });
    const single = scoreEntry(['advantage'], { concept: 'advantage', metaphor: 'm', domain: 'd' });
    expect(dup).toBeCloseTo(single);
  });
});

describe('matchAnalogies', () => {
  it('returns the most relevant entry first', () => {
    const concepts = extractConcepts('I sacrificed a pawn for a positional advantage');
    const matches = matchAnalogies(concepts, BANK);
    expect(matches[0]!.entry.concept).toBe('positional advantage');
    expect(matches.map((m) => m.entry.concept)).toContain('pawn sacrifice');
  });

  it('returns an empty array for an undefined or empty bank', () => {
    expect(matchAnalogies(['pawn'], undefined)).toEqual([]);
    expect(matchAnalogies(['pawn'], [])).toEqual([]);
  });

  it('drops entries below minScore (no shared tokens)', () => {
    expect(matchAnalogies(extractConcepts('lights out and away we go'), BANK)).toEqual([]);
  });

  it('caps results at topN', () => {
    const concepts = extractConcepts('pawn positional endgame');
    expect(matchAnalogies(concepts, BANK, { topN: 1 })).toHaveLength(1);
  });

  it('caps at the default topN of 5', () => {
    // "chess" is stem-stable (no -ing/-ed/-s suffix), so the raw concept token matches.
    const big: AnalogyEntry[] = Array.from({ length: 7 }, (_, i) => ({
      concept: `chess topic${i}`,
      metaphor: `m${i}`,
      domain: 'd',
    }));
    expect(matchAnalogies(['chess'], big)).toHaveLength(5);
  });

  it('honours an explicit minScore', () => {
    const concepts = extractConcepts('I sacrificed a pawn for a positional advantage');
    // Only the full-phrase hit (score 6) clears minScore 3; the partial "pawn" (2) is dropped.
    expect(matchAnalogies(concepts, BANK, { minScore: 3 }).map((m) => m.entry.concept)).toEqual([
      'positional advantage',
    ]);
  });

  it('breaks score ties on original bank order', () => {
    const tied: AnalogyEntry[] = [
      { concept: 'alpha', metaphor: 'm1', domain: 'd' },
      { concept: 'alpha', metaphor: 'm2', domain: 'd' },
    ];
    const matches = matchAnalogies(['alpha'], tied);
    expect(matches.map((m) => m.entry.metaphor)).toEqual(['m1', 'm2']);
  });
});
