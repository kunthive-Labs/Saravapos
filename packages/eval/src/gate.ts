import type { SuiteAggregate } from './aggregate.js';
import type { CaseRunResult } from './runCase.js';

/** Quality floors the gate enforces. Either may be omitted (= not enforced). */
export interface GateThresholds {
  /** Minimum acceptable mean `overall` across the whole corpus. */
  threshold?: number;
  /** Minimum acceptable `overall` for any single case. */
  minCase?: number;
}

/** A single floor that the run failed to clear. */
export interface GateViolation {
  /** `mean` = corpus mean fell short; `case` = one case fell short. */
  kind: 'mean' | 'case';
  /** Case id, present only for `kind: 'case'`. */
  id?: string;
  /** The score that was observed. */
  actual: number;
  /** The floor it failed to reach. */
  floor: number;
}

/** Outcome of applying the floors to a finished run. */
export interface GateReport {
  /** True when there are no violations (or no floors were set). */
  passed: boolean;
  /** Every floor the run failed, in report order (mean first, then cases). */
  violations: GateViolation[];
}

/**
 * Apply the mean and per-case floors to a finished run. A floor that is
 * `undefined` is not enforced. The mean floor is checked first, then each
 * case in suite order, so the report reads top-down.
 */
export function evaluateGate(
  results: CaseRunResult[],
  summary: SuiteAggregate,
  thresholds: GateThresholds,
): GateReport {
  const violations: GateViolation[] = [];
  if (thresholds.threshold !== undefined && summary.meanOverall < thresholds.threshold) {
    violations.push({ kind: 'mean', actual: summary.meanOverall, floor: thresholds.threshold });
  }
  if (thresholds.minCase !== undefined) {
    for (const r of results) {
      if (r.result.overall < thresholds.minCase) {
        violations.push({
          kind: 'case',
          id: r.case.id,
          actual: r.result.overall,
          floor: thresholds.minCase,
        });
      }
    }
  }
  return { passed: violations.length === 0, violations };
}
