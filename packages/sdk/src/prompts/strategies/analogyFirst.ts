import type { Profile } from '@saravapos/spec';
import { buildUserPrompt } from '../user.js';
import type { PromptStrategy } from '../types.js';
import { buildStructuredSystemPrompt } from './structured.js';

/**
 * An anchoring directive aimed at cross-domain cases (e.g. `chess-to-f1-pawn`,
 * `swe-to-f1-hotpath`), where a translation can stay faithful yet still not
 * "land" because it never reaches for the target's own world. Pushes the model
 * to lead with a target-native analogy, drawn from the analogy bank when it fits.
 */
const ANCHORING = [
  '# ANCHORING',
  "Anchor the explanation in the TARGET worldview's own world:",
  "- Prefer an analogy or reference drawn from the target's analogy bank and",
  '  "references that land" when one fits the source idea.',
  '- Lead with that target-native framing, then carry the source claims through it.',
  "- If nothing in the bank fits, build a fresh analogy from the target's",
  '  expertise domain rather than explaining in source-domain terms.',
].join('\n');

/** Structured system prompt plus the analogy-anchoring directive. */
function buildAnalogyFirstSystemPrompt(from: Profile, to: Profile): string {
  return [buildStructuredSystemPrompt(from, to), ANCHORING].join('\n\n');
}

/**
 * The `structured` prompt plus a directive to anchor in a target-native analogy.
 * Tests whether leaning on the target's analogy bank lifts the "lands-for-target"
 * dimension on cross-domain cases over the structured prompt alone.
 */
export const analogyFirstStrategy: PromptStrategy = {
  name: 'analogyFirst',
  description: "Structured prompt plus a directive to anchor in the target's analogy bank.",
  buildSystemPrompt: buildAnalogyFirstSystemPrompt,
  buildUserPrompt,
};
