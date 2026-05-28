#!/usr/bin/env node
import { Command } from 'commander';
import { resolveAdapter, type AdapterName } from '@wv/adapters';
import { loadAllCases } from '../src/loadCase.js';
import { runSuite } from '../src/runSuite.js';
import { aggregate } from '../src/aggregate.js';

const program = new Command();

program.name('wv-eval').description('Worldview translation eval harness');

program
  .command('run')
  .description('Run the golden-case corpus and print scores')
  .option('--cases <dir>', 'directory of golden case YAML files', 'packages/eval/cases')
  .option('--provider <name>', 'translation provider: anthropic | openai | ollama', 'anthropic')
  .option('--judge-model <model>', 'judge model override')
  .option('--no-cache', 'force fresh adapter calls (still writes responses to disk)')
  .action(
    async (opts: { cases: string; provider: string; judgeModel?: string; cache: boolean }) => {
      const cases = await loadAllCases(opts.cases);
      const adapter = resolveAdapter(opts.provider as AdapterName);
      const results = await runSuite(cases, {
        translateAdapter: adapter,
        judgeAdapter: adapter,
        cache: { noCache: !opts.cache },
        ...(opts.judgeModel !== undefined ? { judgeOptions: { model: opts.judgeModel } } : {}),
      });
      const summary = aggregate(results);
      process.stdout.write(`${JSON.stringify(summary, null, 2)}\n`);
    },
  );

program.parseAsync().catch((err: unknown) => {
  process.stderr.write(`${err instanceof Error ? err.message : String(err)}\n`);
  process.exit(1);
});
