import type { LLMAdapter } from '@wv/adapters';
import type { CriterionScore, GoldenCase, JudgeResult } from './types.js';
import { buildJudgeSystemPrompt, buildJudgeUserPrompt } from './judgePrompts.js';
import { JudgeParseError } from './errors.js';

export interface JudgeOptions {
  model?: string;
}

interface RawJudgeResponse {
  criteria: { name: string; score: number; reasoning: string }[];
}

/**
 * Strictly parse the judge's text into the expected shape. Anything that
 * is not valid JSON or is missing the `criteria` array becomes a typed
 * JudgeParseError so the runner can mark this as an infra failure, not a
 * quality failure.
 */
export function parseJudgeResponse(text: string): RawJudgeResponse {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new JudgeParseError('Judge response was not valid JSON', text);
  }
  if (typeof parsed !== 'object' || parsed === null || !('criteria' in parsed)) {
    throw new JudgeParseError('Judge response missing criteria field', text);
  }
  const { criteria } = parsed as { criteria: unknown };
  if (!Array.isArray(criteria)) {
    throw new JudgeParseError('Judge response criteria must be an array', text);
  }
  return parsed as RawJudgeResponse;
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
  const raw = parseJudgeResponse(completion.text);
  const criteria: CriterionScore[] = raw.criteria.map((cr) => ({
    name: cr.name,
    score: cr.score,
    reasoning: cr.reasoning,
  }));
  const overall =
    criteria.length === 0 ? 0 : criteria.reduce((sum, s) => sum + s.score, 0) / criteria.length;
  return { overall, criteria, passedLexical: true };
}
