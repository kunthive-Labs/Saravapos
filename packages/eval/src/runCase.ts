import type { LLMAdapter } from '@saravapos/adapters';
import { loadProfile, translate, type PromptStrategy } from '@saravapos/sdk';
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
  /** Prompt strategy (name or object) used for the translation step. */
  strategy?: string | PromptStrategy;
}

/**
 * Run one case end to end: load the two profiles, translate the input, then
 * judge the translation. Both completions flow through the disk cache so
 * re-runs of an unchanged corpus are free.
 */
export interface CaseRunResult {
  /** The case that was run, echoed for downstream reporting. */
  case: GoldenCase;
  /** The translator's output text. */
  translation: string;
  /** The judge's structured verdict. */
  result: JudgeResult;
  /** Wall-clock time for the whole case, in milliseconds. */
  ms: number;
}

export async function runCase(c: GoldenCase, opts: RunCaseOptions): Promise<CaseRunResult> {
  const started = Date.now();
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
    ...(opts.strategy !== undefined ? { strategy: opts.strategy } : {}),
  });

  const cachedJudgeAdapter: LLMAdapter = {
    name: opts.judgeAdapter.name,
    defaultModel: opts.judgeAdapter.defaultModel,
    complete: (o) => cachedComplete(opts.judgeAdapter, o, opts.cache),
  };

  const result = await judge(c, translation, cachedJudgeAdapter, opts.judgeOptions);
  return { case: c, translation, result, ms: Date.now() - started };
}
