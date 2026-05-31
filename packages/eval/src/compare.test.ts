import { describe, expect, it } from 'vitest';
import { aggregate } from './aggregate.js';
import { buildScorecard, pickWinner, type VariantRun } from './compare.js';
import type { CaseRunResult } from './runCase.js';
import type { GoldenCase } from './types.js';

function makeCase(id: string): GoldenCase {
  return {
    id,
    from: 'profiles/a.yaml',
    to: 'profiles/b.yaml',
    input: 'i',
    rubric: [{ name: 'fidelity', description: 'f' }],
  };
}

function makeResult(id: string, overall: number): CaseRunResult {
  return {
    case: makeCase(id),
    translation: 't',
    ms: 0,
    result: {
      overall,
      criteria: [{ name: 'fidelity', score: Math.round(overall), reasoning: '' }],
      passedLexical: true,
    },
  };
}

function makeRun(variant: string, scores: Record<string, number>): VariantRun {
  const results = Object.entries(scores).map(([id, overall]) => makeResult(id, overall));
  return { variant, results, summary: aggregate(results) };
}

describe('buildScorecard', () => {
  const runs = [
    makeRun('baseline', { 'c-1': 3, 'c-2': 4 }),
    makeRun('structured', { 'c-1': 4, 'c-2': 3.5 }),
  ];
  const card = buildScorecard(runs);

  it('lists variants in run order and per-variant means', () => {
    expect(card.variants).toEqual(['baseline', 'structured']);
    expect(card.means.baseline).toBeCloseTo(3.5);
    expect(card.means.structured).toBeCloseTo(3.75);
  });

  it('records each variant score per case', () => {
    const c1 = card.rows.find((r) => r.id === 'c-1');
    expect(c1?.scores).toEqual({ baseline: 3, structured: 4 });
  });

  it('computes delta as candidate minus reference', () => {
    const c1 = card.rows.find((r) => r.id === 'c-1');
    const c2 = card.rows.find((r) => r.id === 'c-2');
    expect(c1?.delta).toBeCloseTo(1); // 4 - 3
    expect(c2?.delta).toBeCloseTo(-0.5); // 3.5 - 4
  });

  it('leaves delta null when a single variant is compared', () => {
    const card1 = buildScorecard([makeRun('baseline', { 'c-1': 3 })]);
    expect(card1.rows[0]?.delta).toBeNull();
  });
});

describe('pickWinner', () => {
  it('selects the variant with the highest mean', () => {
    const card = buildScorecard([
      makeRun('baseline', { 'c-1': 3 }),
      makeRun('structured', { 'c-1': 4 }),
    ]);
    expect(pickWinner(card)).toEqual({ variant: 'structured', mean: 4 });
  });

  it('breaks ties toward the reference (first) variant', () => {
    const card = buildScorecard([
      makeRun('baseline', { 'c-1': 4 }),
      makeRun('structured', { 'c-1': 4 }),
    ]);
    expect(pickWinner(card)?.variant).toBe('baseline');
  });

  it('returns null for an empty scorecard', () => {
    expect(pickWinner(buildScorecard([]))).toBeNull();
  });
});
