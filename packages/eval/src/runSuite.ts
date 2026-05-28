import type { GoldenCase } from './types.js';
import { runCase, type CaseRunResult, type RunCaseOptions } from './runCase.js';

/**
 * Run every case in `cases` sequentially. Sequential rather than parallel
 * so that rate limits, cache writes, and report ordering stay predictable.
 */
export async function runSuite(
  cases: GoldenCase[],
  opts: RunCaseOptions,
): Promise<CaseRunResult[]> {
  const results: CaseRunResult[] = [];
  for (const c of cases) {
    results.push(await runCase(c, opts));
  }
  return results;
}
