import type { Profile } from '@saravapos/spec';

/**
 * A named, swappable way of building the prompts `translate()` sends to an
 * adapter. Strategies let us A/B different prompt designs against the eval
 * corpus without changing call sites — `translate({ strategy })` picks one.
 */
export interface PromptStrategy {
  /** Stable identifier, used on the CLI and in comparison scorecards. */
  name: string;
  /** One-line description of what this variant does differently. */
  description: string;
  /**
   * Build the system prompt from the source and target profiles. The optional
   * `text` is the source input being translated; input-aware strategies (e.g.
   * `dynamicAnalogy`) use it to tailor the prompt. Strategies that don't need
   * it simply omit the parameter.
   */
  buildSystemPrompt(from: Profile, to: Profile, text?: string): string;
  /** Wrap the source text into the user prompt. */
  buildUserPrompt(text: string): string;
}
