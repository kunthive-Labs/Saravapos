import type { Profile } from '@saravapos/spec';
import { buildUserPrompt } from '../user.js';
import type { PromptStrategy } from '../types.js';
import { buildStructuredSystemPrompt } from './structured.js';

/**
 * A plan-then-write directive aimed at fidelity: on multi-claim inputs the
 * model can quietly drop or merge a claim while swapping framings. Forcing a
 * private inventory of claims and unfamiliar terms before writing keeps every
 * claim accounted for. The plan itself is never emitted.
 */
const METHOD = [
  '# METHOD',
  'Work in two private steps, then output only the result of the second:',
  '1. PLAN (do not output): list each distinct claim in the source, and list',
  '   every term the target would not recognize.',
  '2. WRITE: produce a translation that carries every claim from step 1 and',
  '   replaces every flagged term with a target-native equivalent.',
  'Output only the step-2 translation. Never show the plan, headings, or step',
  'labels.',
].join('\n');

/** Structured system prompt plus the plan-then-write method. */
function buildPlannedSystemPrompt(from: Profile, to: Profile): string {
  return [buildStructuredSystemPrompt(from, to), METHOD].join('\n\n');
}

/**
 * The `structured` prompt plus an explicit plan-then-write method. Tests
 * whether forcing a silent claim/term inventory before writing lifts fidelity
 * on multi-claim inputs over instructions alone.
 */
export const plannedStrategy: PromptStrategy = {
  name: 'planned',
  description: 'Structured prompt plus a private plan-then-write method (claim + term inventory).',
  buildSystemPrompt: buildPlannedSystemPrompt,
  buildUserPrompt,
};
