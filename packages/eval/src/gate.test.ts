import { describe, expect, it } from 'vitest';
import { aggregate } from './aggregate.js';
import { buildBaseline, compareToBaseline, evaluateGate, type Baseline } from './gate.js';
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

describe('evaluateGate', () => {
  const results = [makeResult('c-1', 5), makeResult('c-2', 3), makeResult('c-3', 4)];
  const summary = aggregate(results); // mean = 4, min case = c-2 (3)

  it('passes when no floors are set', () => {
    const report = evaluateGate(results, summary, {});
    expect(report.passed).toBe(true);
    expect(report.violations).toHaveLength(0);
  });

  it('passes when mean clears the threshold', () => {
    expect(evaluateGate(results, summary, { threshold: 4 }).passed).toBe(true);
  });

  it('fails when the mean falls below the threshold', () => {
    const report = evaluateGate(results, summary, { threshold: 4.5 });
    expect(report.passed).toBe(false);
    expect(report.violations).toEqual([{ kind: 'mean', actual: 4, floor: 4.5 }]);
  });

  it('passes when every case clears the per-case floor', () => {
    expect(evaluateGate(results, summary, { minCase: 3 }).passed).toBe(true);
  });

  it('fails and names each case below the per-case floor', () => {
    const report = evaluateGate(results, summary, { minCase: 3.5 });
    expect(report.passed).toBe(false);
    expect(report.violations).toEqual([{ kind: 'case', id: 'c-2', actual: 3, floor: 3.5 }]);
  });

  it('reports mean and per-case violations together, mean first', () => {
    const report = evaluateGate(results, summary, { threshold: 4.5, minCase: 3.5 });
    expect(report.violations.map((v) => v.kind)).toEqual(['mean', 'case']);
  });
});

describe('buildBaseline', () => {
  it('snapshots per-case overalls and the corpus mean', () => {
    const results = [makeResult('c-1', 5), makeResult('c-2', 3)];
    const baseline = buildBaseline(results, aggregate(results));
    expect(baseline.version).toBe(1);
    expect(baseline.meanOverall).toBeCloseTo(4);
    expect(baseline.cases).toEqual({ 'c-1': 5, 'c-2': 3 });
  });
});

describe('compareToBaseline', () => {
  const baseline: Baseline = {
    version: 1,
    meanOverall: 4,
    cases: { 'c-1': 5, 'c-2': 4, 'c-3': 3 },
  };

  it('flags a case that dropped beyond the delta', () => {
    const report = compareToBaseline(
      [makeResult('c-1', 5), makeResult('c-2', 3), makeResult('c-3', 3)],
      baseline,
    );
    expect(report.regressions).toEqual([{ id: 'c-2', baseline: 4, current: 3, delta: -1 }]);
  });

  it('tolerates a drop exactly equal to the delta', () => {
    const report = compareToBaseline([makeResult('c-2', 3.5)], baseline, 0.5);
    expect(report.regressions).toHaveLength(0);
  });

  it('reports cases missing from the run and new cases since the baseline', () => {
    const report = compareToBaseline([makeResult('c-1', 5), makeResult('c-9', 4)], baseline);
    expect(report.missing).toEqual(['c-2', 'c-3']);
    expect(report.added).toEqual(['c-9']);
  });
});
