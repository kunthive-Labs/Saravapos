import type { LLMAdapter } from '@wv/adapters';
import type { CriterionScore, GoldenCase, JudgeResult } from './types.js';
import { buildJudgeSystemPrompt, buildJudgeUserPrompt } from './judgePrompts.js';

export interface JudgeOptions {
  model?: string;
}

interface RawJudgeResponse {
  criteria: { name: string; score: number; reasoning: string }[];
}

/**
 * Run the judge on one (case, translation) pair. Forces temperature 0 so
 * scores are reproducible across runs and the disk cache stays meaningful.
 */
export async function judge(
  c: GoldenCase,
  translation: string,
  adapter: LLMAdapter,
  options: JudgeOptions = {},
): Promise<JudgeResult> {
  const system = buildJudgeSystemPrompt(c);
  const user = buildJudgeUserPrompt(c.input, translation);
  const completion = await adapter.complete({
    system,
    user,
    ...(options.model !== undefined ? { model: options.model } : {}),
    temperature: 0,
  });
  // Minimal parse for now — hardened in a follow-up commit (parseJudgeResponse).
  const raw = JSON.parse(completion.text) as RawJudgeResponse;
  const criteria: CriterionScore[] = raw.criteria.map((cr) => ({
    name: cr.name,
    score: cr.score,
    reasoning: cr.reasoning,
  }));
  const overall =
    criteria.length === 0 ? 0 : criteria.reduce((sum, s) => sum + s.score, 0) / criteria.length;
  return { overall, criteria, passedLexical: true };
}
