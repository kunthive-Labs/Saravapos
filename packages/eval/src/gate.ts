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

/** A saved snapshot of suite scores, used to detect regressions over time. */
export interface Baseline {
  /** Baseline file format version. */
  version: number;
  /** Corpus mean `overall` when the baseline was written. */
  meanOverall: number;
  /** Per-case `overall`, keyed by case id. */
  cases: Record<string, number>;
}

/** Default score drop (on the 1-5 scale) that counts as a regression. */
export const DEFAULT_REGRESSION_DELTA = 0.5;

/** One case whose score dropped beyond the allowed delta versus the baseline. */
export interface Regression {
  /** Case id. */
  id: string;
  /** The baseline score. */
  baseline: number;
  /** The score in the current run. */
  current: number;
  /** Signed change (current - baseline); negative for a regression. */
  delta: number;
}

/** Result of comparing a finished run against a saved baseline. */
export interface RegressionReport {
  /** Cases in both runs whose drop exceeded the delta. */
  regressions: Regression[];
  /** Case ids in the baseline but absent from the current run. */
  missing: string[];
  /** Case ids new in the current run, absent from the baseline. */
  added: string[];
}

/**
 * Compare a finished run against a saved baseline. A case regresses when its
 * `overall` dropped by more than `delta` from the baseline value; an exact
 * `delta` drop is tolerated. Cases present on only one side are reported as
 * `missing` (baseline-only) or `added` (run-only) rather than as regressions.
 */
export function compareToBaseline(
  results: CaseRunResult[],
  baseline: Baseline,
  delta: number = DEFAULT_REGRESSION_DELTA,
): RegressionReport {
  const current = new Map(results.map((r) => [r.case.id, r.result.overall]));
  const regressions: Regression[] = [];
  const missing: string[] = [];
  for (const [id, base] of Object.entries(baseline.cases)) {
    const cur = current.get(id);
    if (cur === undefined) {
      missing.push(id);
      continue;
    }
    if (base - cur > delta) {
      regressions.push({ id, baseline: base, current: cur, delta: cur - base });
    }
  }
  const added = results.map((r) => r.case.id).filter((id) => !(id in baseline.cases));
  return { regressions, missing, added };
}
