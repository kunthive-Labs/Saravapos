import type { GoldenCase } from './types.js';

/**
 * Build the system prompt the judge model sees. Describes the source and
 * target profiles, lists the rubric criteria verbatim, and demands a strict
 * JSON-only response so the parser can be deterministic.
 */
export function buildJudgeSystemPrompt(c: GoldenCase): string {
  const criteriaList = c.rubric.map((r) => `- ${r.name}: ${r.description}`).join('\n');
  return [
    'You are a strict evaluator of worldview translations.',
    `The source text was written for the reader described by the profile at "${c.from}".`,
    `It was translated for the reader described by the profile at "${c.to}".`,
    'Score the translation against each criterion below on an integer scale of 1 (poor) to 5 (excellent):',
    criteriaList,
    'Respond with JSON ONLY. No prose, no markdown, no code fences. Match exactly this shape:',
    '{"criteria":[{"name":"<criterion-name>","score":<1-5>,"reasoning":"<one line>"}]}',
    'Include exactly one entry per criterion, using the criterion names above verbatim.',
  ].join('\n\n');
}

/**
 * Wrap the source text and the candidate translation with unambiguous markers
 * so the judge can never confuse one for the other.
 */
export function buildJudgeUserPrompt(input: string, output: string): string {
  return ['<source>', input, '</source>', '<translation>', output, '</translation>'].join('\n');
}
