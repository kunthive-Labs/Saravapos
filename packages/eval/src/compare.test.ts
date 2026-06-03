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

/** A case result with explicit per-criterion scores. */
function makeCriterionResult(id: string, scores: Record<string, number>): CaseRunResult {
  const criteria = Object.entries(scores).map(([name, score]) => ({ name, score, reasoning: '' }));
  const overall = criteria.reduce((a, c) => a + c.score, 0) / criteria.length;
  return {
    case: makeCase(id),
    translation: 't',
    ms: 0,
    result: { overall, criteria, passedLexical: true },
  };
}

function makeCriterionRun(
  variant: string,
  cases: Record<string, Record<string, number>>,
): VariantRun {
  const results = Object.entries(cases).map(([id, scores]) => makeCriterionResult(id, scores));
  return { variant, results, summary: aggregate(results) };
}

describe('buildScorecard per-criterion breakdown', () => {
  const runs = [
    makeCriterionRun('baseline', {
      'c-1': { fidelity: 4, 'plain-language': 2 },
      'c-2': { fidelity: 4, 'lands-for-target': 3 },
    }),
    makeCriterionRun('plainLanguage', {
      'c-1': { fidelity: 4, 'plain-language': 4 },
      'c-2': { fidelity: 3, 'lands-for-target': 3 },
    }),
  ];
  const card = buildScorecard(runs);

  it('collects criterion names in first-seen order', () => {
    expect(card.criteria).toEqual(['fidelity', 'plain-language', 'lands-for-target']);
  });

  it('averages each criterion only over the cases that include it', () => {
    expect(card.criterionMeans.baseline?.fidelity).toBeCloseTo(4); // (4+4)/2
    expect(card.criterionMeans.baseline?.['plain-language']).toBeCloseTo(2); // only c-1
    expect(card.criterionMeans.plainLanguage?.fidelity).toBeCloseTo(3.5); // (4+3)/2
    expect(card.criterionMeans.plainLanguage?.['plain-language']).toBeCloseTo(4);
  });

  it('deltas show which dimension the candidate moved', () => {
    expect(card.criterionDeltas['plain-language']).toBeCloseTo(2); // 4 - 2, the win
    expect(card.criterionDeltas.fidelity).toBeCloseTo(-0.5); // 3.5 - 4, the cost
    expect(card.criterionDeltas['lands-for-target']).toBeCloseTo(0);
  });

  it('leaves criterion deltas null for a single-variant run', () => {
    const solo = buildScorecard([makeCriterionRun('baseline', { 'c-1': { fidelity: 4 } })]);
    expect(solo.criterionDeltas.fidelity).toBeNull();
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
