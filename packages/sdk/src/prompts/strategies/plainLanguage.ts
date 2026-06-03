import type { Profile } from '@saravapos/spec';
import { buildUserPrompt } from '../user.js';
import type { PromptStrategy } from '../types.js';
import { buildStructuredSystemPrompt } from './structured.js';

/**
 * An extra directive aimed at the corpus's hardest lexical cases — the ones
 * whose `must_avoid` lists demand that no source-domain term survive for a
 * low-jargon target (e.g. `swe-to-novice-memleak`, `chess-to-novice-checkmate`).
 * Forces a name-then-replace pass and an everyday-analogy framing.
 */
const PLAIN_LANGUAGE = [
  '# PLAIN-LANGUAGE MODE',
  'The target has low tolerance for jargon. Before writing:',
  '- Name (to yourself) every source-domain term, acronym, or proper noun the',
  '  target would not already know.',
  '- Replace each one with an everyday word or a concrete, familiar comparison.',
  '  None of those terms may survive in the output — not even inside parentheses',
  '  or quotation marks.',
  '- Prefer one vivid everyday analogy over an abstract definition.',
  '- Keep sentences short and use no acronyms.',
].join('\n');

/** Structured system prompt plus the plain-language directive. */
function buildPlainLanguageSystemPrompt(from: Profile, to: Profile): string {
  return [buildStructuredSystemPrompt(from, to), PLAIN_LANGUAGE].join('\n\n');
}

/**
 * The `structured` prompt plus an aggressive de-jargoning directive. Tests
 * whether an explicit strip-and-rephrase instruction lifts the lexical-gate and
 * plain-language cases over the structured prompt alone.
 */
export const plainLanguageStrategy: PromptStrategy = {
  name: 'plainLanguage',
  description: 'Structured prompt plus an aggressive jargon-strip + everyday-analogy directive.',
  buildSystemPrompt: buildPlainLanguageSystemPrompt,
  buildUserPrompt,
};
