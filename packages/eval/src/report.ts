import type { CaseRunResult } from './runCase.js';
import type { SuiteAggregate } from './aggregate.js';
import type { GateReport, RegressionReport } from './gate.js';
import type { Scorecard, Winner } from './compare.js';

/** Format one case row: id, overall (1 decimal), lexical pass/fail, ms. */
function formatRow(r: CaseRunResult): string {
  const overall = r.result.overall.toFixed(1);
  const lex = r.result.passedLexical ? 'pass' : 'FAIL';
  return `${r.case.id.padEnd(32)}  ${overall.padStart(4)}  ${lex.padEnd(4)}  ${r.ms}ms`;
}

/** Pretty per-case table for the terminal. */
export function formatTable(results: CaseRunResult[]): string {
  const header = `${'case'.padEnd(32)}  ${'over'.padStart(4)}  ${'lex'.padEnd(4)}  time`;
  const sep = '-'.repeat(header.length);
  return [header, sep, ...results.map(formatRow)].join('\n');
}

/** Two-line summary appended below the per-case table. */
export function formatSummary(a: SuiteAggregate): string {
  const min = a.minCase ? `${a.minCase.id} (${a.minCase.overall.toFixed(1)})` : 'n/a';
  return [
    `mean=${a.meanOverall.toFixed(2)}  min=${min}  lexical=${(a.lexicalPassRate * 100).toFixed(0)}%`,
    `cases=${a.count}`,
  ].join('\n');
}

/** One line on PASS, or FAIL plus an indented line per violated floor. */
export function formatGate(report: GateReport): string {
  if (report.passed) {
    return 'gate: PASS';
  }
  const lines = report.violations.map((v) =>
    v.kind === 'mean'
      ? `  mean ${v.actual.toFixed(2)} below threshold ${v.floor}`
      : `  ${v.id ?? '?'} ${v.actual.toFixed(1)} below min-case ${v.floor}`,
  );
  return [`gate: FAIL (${report.violations.length} violation(s))`, ...lines].join('\n');
}

/** Summarise a baseline comparison: regressions, plus any missing/added cases. */
export function formatRegressions(r: RegressionReport): string {
  const lines: string[] = [];
  if (r.regressions.length === 0) {
    lines.push('baseline: no regressions');
  } else {
    lines.push(`baseline: ${r.regressions.length} regression(s)`);
    for (const reg of r.regressions) {
      lines.push(
        `  ${reg.id} ${reg.baseline.toFixed(1)} -> ${reg.current.toFixed(1)} (${reg.delta.toFixed(1)})`,
      );
    }
  }
  if (r.missing.length > 0) {
    lines.push(`  missing vs baseline: ${r.missing.join(', ')}`);
  }
  if (r.added.length > 0) {
    lines.push(`  new since baseline: ${r.added.join(', ')}`);
  }
  return lines.join('\n');
}

const ID_COL = 32;
// Wide enough for the longest built-in variant name ("plainLanguage", 13) plus
// a separating space, so per-variant column headers never abut.
const NUM_COL = 14;
const DELTA_COL = 8;

function signed(n: number): string {
  return `${n >= 0 ? '+' : ''}${n.toFixed(1)}`;
}

/** Render an A/B scorecard: a per-case table, a means row, and the winner. */
export function formatScorecard(card: Scorecard, winner: Winner | null): string {
  const header = [
    'case'.padEnd(ID_COL),
    ...card.variants.map((v) => v.padStart(NUM_COL)),
    'Δ'.padStart(DELTA_COL),
  ].join('');
  const sep = '-'.repeat(header.length);

  const rows = card.rows.map((row) => {
    const cells = card.variants.map((v) => {
      const score = row.scores[v];
      return (score === undefined ? '-' : score.toFixed(1)).padStart(NUM_COL);
    });
    const delta = (row.delta === null ? '' : signed(row.delta)).padStart(DELTA_COL);
    return [row.id.padEnd(ID_COL), ...cells, delta].join('');
  });

  const meansRow = [
    'mean'.padEnd(ID_COL),
    ...card.variants.map((v) => {
      const mean = card.means[v];
      return (mean === undefined ? '-' : mean.toFixed(2)).padStart(NUM_COL);
    }),
  ].join('');

  const reference = card.variants[0];
  const refMean = reference !== undefined ? card.means[reference] : undefined;
  const winnerLine =
    winner === null
      ? 'winner: n/a'
      : `winner: ${winner.variant} (mean ${winner.mean.toFixed(2)}` +
        (refMean !== undefined && reference !== winner.variant
          ? `, ${signed(winner.mean - refMean)} vs ${reference})`
          : ')');

  return [
    header,
    sep,
    ...rows,
    sep,
    meansRow,
    ...formatCriterionBreakdown(card),
    '',
    winnerLine,
  ].join('\n');
}

/**
 * Per-criterion section of the scorecard: one row per rubric dimension, showing
 * each variant's mean for that dimension and the candidate-vs-reference delta.
 * This is what tells you *why* a variant won — e.g. it lifted `plain-language`
 * while costing a little `fidelity`. Empty when no criteria were recorded.
 */
export function formatCriterionBreakdown(card: Scorecard): string[] {
  if (card.criteria.length === 0) {
    return [];
  }
  const header = [
    'criterion'.padEnd(ID_COL),
    ...card.variants.map((v) => v.padStart(NUM_COL)),
    'Δ'.padStart(DELTA_COL),
  ].join('');

  const rows = card.criteria.map((name) => {
    const cells = card.variants.map((v) => {
      const mean = card.criterionMeans[v]?.[name];
      return (mean === undefined ? '-' : mean.toFixed(2)).padStart(NUM_COL);
    });
    const delta = card.criterionDeltas[name];
    const deltaCell = (delta === null || delta === undefined ? '' : signed(delta)).padStart(
      DELTA_COL,
    );
    return [name.padEnd(ID_COL), ...cells, deltaCell].join('');
  });

  return ['', 'per-criterion means:', header, ...rows];
}
