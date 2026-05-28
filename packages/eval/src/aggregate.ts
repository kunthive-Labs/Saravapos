import type { CaseRunResult } from './runCase.js';

export interface SuiteAggregate {
  /** Number of case results in the aggregate. */
  count: number;
  /** Mean of `overall` across all case results. */
  meanOverall: number;
  /** Lowest `overall` score in the suite, plus the case that produced it. */
  minCase: { id: string; overall: number } | null;
  /** Fraction of cases where lexical checks passed (0-1). */
  lexicalPassRate: number;
}

/** Roll a list of CaseRunResult into the summary the report prints. */
export function aggregate(results: CaseRunResult[]): SuiteAggregate {
  if (results.length === 0) {
    return { count: 0, meanOverall: 0, minCase: null, lexicalPassRate: 0 };
  }
  const overalls = results.map((r) => r.result.overall);
  const meanOverall = overalls.reduce((a, b) => a + b, 0) / results.length;
  const minIdx = overalls.reduce((iMin, v, i, arr) => (v < arr[iMin]! ? i : iMin), 0);
  const minCase = { id: results[minIdx]!.case.id, overall: overalls[minIdx]! };
  const lexicalPassRate = results.filter((r) => r.result.passedLexical).length / results.length;
  return { count: results.length, meanOverall, minCase, lexicalPassRate };
}
