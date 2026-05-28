#!/usr/bin/env node
import { writeFile } from 'node:fs/promises';
import { Command } from 'commander';
import { resolveAdapter, type AdapterName } from '@wv/adapters';
import { JudgeParseError } from '../src/errors.js';
import { loadAllCases } from '../src/loadCase.js';
import { runSuite } from '../src/runSuite.js';
import { aggregate } from '../src/aggregate.js';
import { formatSummary, formatTable } from '../src/report.js';

const program = new Command();

program.name('wv-eval').description('Worldview translation eval harness');

program
  .command('run')
  .description('Run the golden-case corpus and print scores')
  .option('--cases <dir>', 'directory of golden case YAML files', 'packages/eval/cases')
  .option('--provider <name>', 'translation provider: anthropic | openai | ollama', 'anthropic')
  .option('--judge-model <model>', 'judge model override')
  .option('--no-cache', 'force fresh adapter calls (still writes responses to disk)')
  .option('--json <file>', 'also write a machine-readable JSON report to <file>')
  .action(
    async (opts: {
      cases: string;
      provider: string;
      judgeModel?: string;
      cache: boolean;
      json?: string;
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
