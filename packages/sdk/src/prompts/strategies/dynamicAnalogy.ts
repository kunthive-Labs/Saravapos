import type { AnalogyEntry, Profile } from '@saravapos/spec';
import { buildUserPrompt } from '../user.js';
import type { PromptStrategy } from '../types.js';
import { buildStructuredSystemPrompt } from './structured.js';
import { extractConcepts, matchAnalogies, type AnalogyMatch } from '../../analogy/index.js';

const HEADER = '# RELEVANT ANALOGIES';

/** Combine both profiles' banks, dropping exact duplicates, preserving order. */
function combinedBank(from: Profile, to: Profile): AnalogyEntry[] {
  const seen = new Set<string>();
  const out: AnalogyEntry[] = [];
  for (const entry of [...(from.analogy_bank ?? []), ...(to.analogy_bank ?? [])]) {
    const key = `${entry.concept}|${entry.metaphor}|${entry.domain}`;
    if (!seen.has(key)) {
      seen.add(key);
      out.push(entry);
    }
  }
  return out;
}

/** Render the matched analogies (or a graceful fallback when there are none). */
export function buildMatchedAnalogyBlock(matches: AnalogyMatch[]): string {
  if (matches.length === 0) {
    return [
      HEADER,
      'None of the available analogy-bank entries matched the input; build a fresh',
      "target-native analogy from the target's expertise if one is needed.",
    ].join('\n');
  }
  const list = matches
    .map((m) => `- ${m.entry.concept} -> ${m.entry.metaphor} [${m.entry.domain}]`)
    .join('\n');
  return [HEADER, 'The input touches these analogies — prefer them when they fit:', list].join(
    '\n',
  );
}

/**
 * Structured base (with the static analogy dumps suppressed) plus a focused
 * block of only the analogy-bank entries that match the input text's concepts.
 */
export function buildDynamicAnalogySystemPrompt(from: Profile, to: Profile, text?: string): string {
  const base = buildStructuredSystemPrompt(from, to, { includeAnalogyBanks: false });
  if (text === undefined || text.trim() === '') {
    const fallback = [
      HEADER,
      "No input text was available to match; consult the target's analogy bank where it fits.",
    ].join('\n');
    return [base, fallback].join('\n\n');
  }
  const matches = matchAnalogies(extractConcepts(text), combinedBank(from, to));
  return [base, buildMatchedAnalogyBlock(matches)].join('\n\n');
}

/**
 * Input-aware analogy injection. Instead of dumping the whole analogy bank
 * (what `analogyFirst` leans on), this extracts the input's concepts, matches
 * them against both profiles' banks, and injects ONLY the relevant entries —
 * narrowing the model's attention to the metaphors that actually apply here.
 */
export const dynamicAnalogyStrategy: PromptStrategy = {
  name: 'dynamicAnalogy',
  description: 'Structured prompt plus only the analogy-bank entries relevant to the input text.',
  buildSystemPrompt: buildDynamicAnalogySystemPrompt,
  buildUserPrompt,
};
