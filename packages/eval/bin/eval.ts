#!/usr/bin/env node
import { readFile, writeFile } from 'node:fs/promises';
import { Command } from 'commander';
import { resolveAdapter, type AdapterName } from '@saravapos/adapters';
import { JudgeParseError } from '../src/errors.js';
import { loadAllCases } from '../src/loadCase.js';
import { runSuite } from '../src/runSuite.js';
import { aggregate } from '../src/aggregate.js';
import { compareToBaseline, evaluateGate, type Baseline } from '../src/gate.js';
import { formatGate, formatRegressions, formatSummary, formatTable } from '../src/report.js';

const program = new Command();

program.name('saravapos-eval').description('Saravapos translation eval harness');

/** Parse a CLI floor value, rejecting anything that is not a finite number. */
function toFloor(value: string): number {
  const n = Number(value);
  if (!Number.isFinite(n)) {
    throw new Error(`expected a number, got "${value}"`);
  }
  return n;
}

program
  .command('run')
  .description('Run the golden-case corpus and print scores')
  .option('--cases <dir>', 'directory of golden case YAML files', 'packages/eval/cases')
  .option('--provider <name>', 'translation provider: anthropic | openai | ollama', 'anthropic')
  .option('--judge-model <model>', 'judge model override')
  .option('--no-cache', 'force fresh adapter calls (still writes responses to disk)')
  .option('--json <file>', 'also write a machine-readable JSON report to <file>')
  .option('--threshold <n>', 'fail if the mean overall falls below this floor', toFloor)
  .option('--min-case <n>', 'fail if any single case falls below this floor', toFloor)
  .option('--baseline <file>', 'compare scores against a saved baseline and report regressions')
  .action(
    async (opts: {
      cases: string;
      provider: string;
      judgeModel?: string;
      cache: boolean;
      json?: string;
      threshold?: number;
      minCase?: number;
      baseline?: string;
    }) => {
      const cases = await loadAllCases(opts.cases);
      const adapter = resolveAdapter(opts.provider as AdapterName);
      const results = await runSuite(cases, {
        translateAdapter: adapter,
        judgeAdapter: adapter,
        cache: { noCache: !opts.cache },
        ...(opts.judgeModel !== undefined ? { judgeOptions: { model: opts.judgeModel } } : {}),
      });
      const summary = aggregate(results);
      process.stdout.write(`${formatTable(results)}\n\n`);
      process.stdout.write(`${formatSummary(summary)}\n`);
      if (opts.json !== undefined) {
        const payload = {
          summary,
          results: results.map((r) => ({
            id: r.case.id,
            translation: r.translation,
            result: r.result,
            ms: r.ms,
          })),
        };
        await writeFile(opts.json, `${JSON.stringify(payload, null, 2)}\n`, 'utf-8');
      }

      if (opts.baseline !== undefined) {
        const baseline = JSON.parse(await readFile(opts.baseline, 'utf-8')) as Baseline;
        process.stdout.write(`\n${formatRegressions(compareToBaseline(results, baseline))}\n`);
      }

      if (opts.threshold !== undefined || opts.minCase !== undefined) {
        const gate = evaluateGate(results, summary, {
          ...(opts.threshold !== undefined ? { threshold: opts.threshold } : {}),
          ...(opts.minCase !== undefined ? { minCase: opts.minCase } : {}),
        });
        process.stdout.write(`\n${formatGate(gate)}\n`);
        if (!gate.passed) {
          // Quality failure (exit 1) is distinct from infra failure (exit 2).
          process.exitCode = 1;
        }
      }
    },
  );

program.parseAsync().catch((err: unknown) => {
  if (err instanceof JudgeParseError) {
    process.stderr.write(`infra: judge output unparseable — ${err.message}\n`);
    process.stderr.write(`raw response (truncated):\n${err.raw.slice(0, 500)}\n`);
    process.exit(2);
  }
  process.stderr.write(`${err instanceof Error ? err.message : String(err)}\n`);
  process.exit(1);
});
