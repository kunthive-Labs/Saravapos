import type { Profile } from '@saravapos/spec';
import { buildUserPrompt } from '../user.js';
import type { PromptStrategy } from '../types.js';
import { buildStructuredSystemPrompt } from './structured.js';

/**
 * Two worked translations, kept domain-neutral relative to any single case so
 * they teach the *move* (swap the metaphor, keep the claim) without leaking a
 * golden answer. Appended to the structured prompt.
 */
const EXAMPLES = [
  '# EXAMPLES',
  'Each example keeps the underlying claim and only swaps the worldview-specific framing.',
  '',
  'SOURCE (chess): "I sacrificed a pawn for a positional advantage."',
  'TARGET (F1 fan): "I gave up a little track position early to set up a much stronger line through the next sequence of corners."',
  '',
  'SOURCE (software): "We cache the result to avoid recomputing it on the hot path."',
  'TARGET (novice): "We save the answer the first time so we don\'t have to redo the slow work every time it\'s needed."',
].join('\n');

/** Structured system prompt plus a short block of worked translation examples. */
function buildFewShotSystemPrompt(from: Profile, to: Profile): string {
  return [buildStructuredSystemPrompt(from, to), EXAMPLES].join('\n\n');
}

/**
 * The `structured` prompt plus two worked examples that demonstrate the
 * swap-the-framing-keep-the-claim move. Tests whether in-context examples lift
 * fidelity over instructions alone.
 */
export const fewShotStrategy: PromptStrategy = {
  name: 'fewShot',
  description: 'Structured prompt plus two worked translation examples.',
  buildSystemPrompt: buildFewShotSystemPrompt,
  buildUserPrompt,
};
