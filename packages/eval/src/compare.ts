import type { SuiteAggregate } from './aggregate.js';
import type { CaseRunResult } from './runCase.js';

/** One prompt variant's full run over the corpus. */
export interface VariantRun {
  /** Strategy name this run used. */
  variant: string;
  /** Per-case results for this variant. */
  results: CaseRunResult[];
  /** Aggregate for this variant's results. */
  summary: SuiteAggregate;
}

/** One row of the comparison scorecard: a case and its score per variant. */
export interface ScorecardRow {
  /** Case id. */
  id: string;
  /** Variant name -> `overall` for this case (absent if the case wasn't run). */
  scores: Record<string, number>;
  /**
   * Signed change of the last variant relative to the first (the reference),
   * or `null` when fewer than two variants scored this case.
   */
  delta: number | null;
}

/** The full A/B comparison: variants, per-case rows, and per-variant means. */
export interface Scorecard {
  /** Variant names, in the order they were run (first = reference). */
  variants: string[];
  /** One row per case, in first-seen order. */
  rows: ScorecardRow[];
  /** Variant name -> mean `overall`. */
  means: Record<string, number>;
}

/**
 * Fold a set of per-variant runs into a scorecard. The first variant is the
 * reference; each row's `delta` is the last variant's score minus the first's,
 * which for the common two-variant case is `candidate - baseline`.
 */
export function buildScorecard(runs: VariantRun[]): Scorecard {
  const variants = runs.map((r) => r.variant);
  const byVariant = new Map<string, Map<string, number>>(
    runs.map((run) => [
      run.variant,
      new Map(run.results.map((r) => [r.case.id, r.result.overall])),
    ]),
  );

  const ids: string[] = [];
  const seen = new Set<string>();
  for (const run of runs) {
    for (const r of run.results) {
      if (!seen.has(r.case.id)) {
        seen.add(r.case.id);
        ids.push(r.case.id);
      }
    }
  }

  const reference = variants[0];
  const candidate = variants[variants.length - 1];

  const rows: ScorecardRow[] = ids.map((id) => {
    const scores: Record<string, number> = {};
    for (const v of variants) {
      const score = byVariant.get(v)?.get(id);
      if (score !== undefined) {
        scores[v] = score;
      }
    }
    const refScore = reference !== undefined ? scores[reference] : undefined;
    const candScore = candidate !== undefined ? scores[candidate] : undefined;
    const delta =
      reference !== candidate && refScore !== undefined && candScore !== undefined
        ? candScore - refScore
        : null;
    return { id, scores, delta };
  });

  const means: Record<string, number> = {};
  for (const run of runs) {
    means[run.variant] = run.summary.meanOverall;
  }

  return { variants, rows, means };
}
