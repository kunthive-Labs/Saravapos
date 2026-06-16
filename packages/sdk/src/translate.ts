import type { Profile } from '@saravapos/spec';
import type { CompletionOptions, LLMAdapter } from '@saravapos/adapters';
import { resolveStrategy } from './prompts/registry.js';
import type { PromptStrategy } from './prompts/types.js';

export interface TranslateOptions {
  text: string;
  from: Profile;
  to: Profile;
  adapter: LLMAdapter;
  model?: string;
  temperature?: number;
  /** Prompt strategy by name or object. Defaults to `baseline`. */
  strategy?: string | PromptStrategy;
}

/** Resolve the `strategy` option (name, object, or absent) to a PromptStrategy. */
function asStrategy(strategy: string | PromptStrategy | undefined): PromptStrategy {
  if (strategy === undefined || typeof strategy === 'string') {
    return resolveStrategy(strategy);
  }
  return strategy;
}

export async function translate(options: TranslateOptions): Promise<string> {
  const strategy = asStrategy(options.strategy);
  // Pass the source text so input-aware strategies (e.g. dynamicAnalogy) can
  // tailor the system prompt. Strategies that ignore it are unaffected.
  const system = strategy.buildSystemPrompt(options.from, options.to, options.text);
  const user = strategy.buildUserPrompt(options.text);
  const completion: CompletionOptions = { system, user };
  if (options.model !== undefined) completion.model = options.model;
  if (options.temperature !== undefined) completion.temperature = options.temperature;
  const result = await options.adapter.complete(completion);
  return result.text;
}
