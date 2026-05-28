import { describe, expect, it } from 'vitest';
import { aggregate } from './aggregate.js';
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

function makeResult(id: string, overall: number, lexical: boolean): CaseRunResult {
  return {
    case: makeCase(id),
    translation: 't',
    ms: 0,
    result: {
      overall,
      criteria: [{ name: 'fidelity', score: Math.round(overall), reasoning: '' }],
      passedLexical: lexical,
    },
  };
}

describe('aggregate', () => {
  it('returns zeroed summary for an empty suite', () => {
    const a = aggregate([]);
    expect(a.count).toBe(0);
    expect(a.minCase).toBeNull();
  });

  it('computes mean, min case, and lexical pass rate', () => {
    const a = aggregate([
      makeResult('c-1', 5, true),
      makeResult('c-2', 3, false),
      makeResult('c-3', 4, true),
    ]);
    expect(a.count).toBe(3);
    expect(a.meanOverall).toBeCloseTo(4);
    expect(a.minCase).toEqual({ id: 'c-2', overall: 3 });
    expect(a.lexicalPassRate).toBeCloseTo(2 / 3);
  });
});
