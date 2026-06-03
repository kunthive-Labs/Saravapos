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
  /** Rubric criterion names seen across the corpus, in first-seen order. */
  criteria: string[];
  /**
   * Variant name -> criterion name -> mean score for that criterion across the
   * cases that include it. Lets a compare show *which rubric dimension* moved,
   * not just the overall number.
   */
  criterionMeans: Record<string, Record<string, number>>;
  /**
   * Criterion name -> the last variant's mean minus the first's (the same
   * candidate-vs-reference framing as the per-case `delta`), or `null` when one
   * side did not score that criterion or only one variant ran.
   */
  criterionDeltas: Record<string, number | null>;
}

/**
 * Average each rubric criterion's score across a variant's case results, and
 * collect the criterion names in first-seen order. A criterion is averaged only
 * over the cases that actually include it, so rubrics that differ per case
 * still produce a meaningful per-dimension mean.
 */
function criterionMeansForRun(
  run: VariantRun,
  order: string[],
  seen: Set<string>,
): Record<string, number> {
  const sums = new Map<string, { total: number; count: number }>();
  for (const r of run.results) {
    for (const c of r.result.criteria) {
      if (!seen.has(c.name)) {
        seen.add(c.name);
        order.push(c.name);
      }
      const acc = sums.get(c.name) ?? { total: 0, count: 0 };
      acc.total += c.score;
      acc.count += 1;
      sums.set(c.name, acc);
    }
  }
  const means: Record<string, number> = {};
  for (const [name, { total, count }] of sums) {
    means[name] = total / count;
  }
  return means;
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

  const criteria: string[] = [];
  const criteriaSeen = new Set<string>();
  const criterionMeans: Record<string, Record<string, number>> = {};
  for (const run of runs) {
    criterionMeans[run.variant] = criterionMeansForRun(run, criteria, criteriaSeen);
  }

  const criterionDeltas: Record<string, number | null> = {};
  for (const name of criteria) {
    const refMean = reference !== undefined ? criterionMeans[reference]?.[name] : undefined;
    const candMean = candidate !== undefined ? criterionMeans[candidate]?.[name] : undefined;
    criterionDeltas[name] =
      reference !== candidate && refMean !== undefined && candMean !== undefined
        ? candMean - refMean
        : null;
  }

  return { variants, rows, means, criteria, criterionMeans, criterionDeltas };
}

/** The winning variant and its mean. */
export interface Winner {
  variant: string;
  mean: number;
}

/**
 * Pick the variant with the highest mean `overall`. Ties resolve to the variant
 * that appears first in `variants` (the reference), so a candidate must strictly
 * beat the baseline to win. Returns `null` for an empty scorecard.
 */
export function pickWinner(scorecard: Scorecard): Winner | null {
  let best: Winner | null = null;
  for (const variant of scorecard.variants) {
    const mean = scorecard.means[variant];
    if (mean === undefined) {
      continue;
    }
    if (best === null || mean > best.mean) {
      best = { variant, mean };
    }
  }
  return best;
}
