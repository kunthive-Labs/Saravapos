import { describe, expect, it } from 'vitest';
import { aggregate } from './aggregate.js';
import { buildScorecard, pickWinner, type VariantRun } from './compare.js';
import { formatCriterionBreakdown, formatScorecard } from './report.js';
import type { CaseRunResult } from './runCase.js';
import type { GoldenCase } from './types.js';

function makeCase(id: string): GoldenCase {
  return { id, from: 'profiles/a.yaml', to: 'profiles/b.yaml', input: 'i', rubric: [] };
}

function makeResult(id: string, scores: Record<string, number>): CaseRunResult {
  const criteria = Object.entries(scores).map(([name, score]) => ({ name, score, reasoning: '' }));
  const overall = criteria.reduce((a, c) => a + c.score, 0) / criteria.length;
  return {
    case: makeCase(id),
    translation: 't',
    ms: 0,
    result: { overall, criteria, passedLexical: true },
  };
}

function makeRun(variant: string, cases: Record<string, Record<string, number>>): VariantRun {
  const results = Object.entries(cases).map(([id, scores]) => makeResult(id, scores));
  return { variant, results, summary: aggregate(results) };
}

const runs = [
  makeRun('baseline', { 'c-1': { fidelity: 4, 'plain-language': 2 } }),
  makeRun('plainLanguage', { 'c-1': { fidelity: 4, 'plain-language': 4 } }),
];
const card = buildScorecard(runs);

describe('formatCriterionBreakdown', () => {
  it('lists each criterion with per-variant means and a signed delta', () => {
    const lines = formatCriterionBreakdown(card);
    const text = lines.join('\n');
    expect(text).toContain('per-criterion means:');
    expect(text).toMatch(/fidelity/);
    expect(text).toMatch(/plain-language.*\+2\.0/s);
  });

  it('is empty when no criteria were recorded', () => {
    const empty = buildScorecard([{ variant: 'baseline', results: [], summary: aggregate([]) }]);
    expect(formatCriterionBreakdown(empty)).toEqual([]);
  });
});

describe('formatScorecard', () => {
  it('embeds the per-criterion breakdown above the winner line', () => {
    const out = formatScorecard(card, pickWinner(card));
    expect(out).toContain('per-criterion means:');
    expect(out.indexOf('per-criterion means:')).toBeLessThan(out.indexOf('winner:'));
  });
});
