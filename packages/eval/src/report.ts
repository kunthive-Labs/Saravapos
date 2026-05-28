import type { CaseRunResult } from './runCase.js';
import type { SuiteAggregate } from './aggregate.js';

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
