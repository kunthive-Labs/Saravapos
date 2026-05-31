import type { CaseRunResult } from './runCase.js';
import type { SuiteAggregate } from './aggregate.js';
import type { GateReport, RegressionReport } from './gate.js';

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
