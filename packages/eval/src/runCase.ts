import type { LLMAdapter } from '@wv/adapters';
import { loadProfile, translate } from '@wv/sdk';
import type { GoldenCase, JudgeResult } from './types.js';
import { judge, type JudgeOptions } from './judge.js';
import { cachedComplete, type CachedCompleteOptions } from './cache.js';

export interface RunCaseOptions {
  /** Adapter used for the translation step. */
  translateAdapter: LLMAdapter;
  /** Adapter used for the judge step. Often the same instance, often not. */
  judgeAdapter: LLMAdapter;
  /** Optional model override for the judge. */
  judgeOptions?: JudgeOptions;
  /** Cache settings passed to both completions. */
  cache?: CachedCompleteOptions;
}

/**
 * Run one case end to end: load the two profiles, translate the input, then
 * judge the translation. Both completions flow through the disk cache so
 * re-runs of an unchanged corpus are free.
 */
export async function runCase(
  c: GoldenCase,
  opts: RunCaseOptions,
): Promise<{ translation: string; result: JudgeResult }> {
  const [fromProfile, toProfile] = await Promise.all([loadProfile(c.from), loadProfile(c.to)]);

  // Route the translation step through the cache by wrapping the adapter.
  const cachedTranslateAdapter: LLMAdapter = {
    name: opts.translateAdapter.name,
    defaultModel: opts.translateAdapter.defaultModel,
    complete: (o) => cachedComplete(opts.translateAdapter, o, opts.cache),
  };

  const translation = await translate({
    text: c.input,
    from: fromProfile,
    to: toProfile,
    adapter: cachedTranslateAdapter,
    temperature: 0,
  });

  const cachedJudgeAdapter: LLMAdapter = {
    name: opts.judgeAdapter.name,
    defaultModel: opts.judgeAdapter.defaultModel,
    complete: (o) => cachedComplete(opts.judgeAdapter, o, opts.cache),
  };

  const result = await judge(c, translation, cachedJudgeAdapter, opts.judgeOptions);
  return { translation, result };
}
