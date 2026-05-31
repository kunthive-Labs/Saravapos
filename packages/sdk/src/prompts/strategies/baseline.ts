import { buildSystemPrompt } from '../system.js';
import { buildUserPrompt } from '../user.js';
import type { PromptStrategy } from '../types.js';

/**
 * The original v0 prompt, unchanged: profile descriptions followed by the
 * faithful-translation rules. This is the default strategy and the reference
 * every other variant is compared against.
 */
export const baselineStrategy: PromptStrategy = {
  name: 'baseline',
  description: 'Original v0 prompt: profile descriptions + faithful-translation rules.',
  buildSystemPrompt,
  buildUserPrompt,
};
