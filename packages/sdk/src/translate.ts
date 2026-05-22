import type { Profile } from '@wv/spec';
import type { CompletionOptions, LLMAdapter } from '@wv/adapters';
import { buildSystemPrompt, buildUserPrompt } from './prompts/index.js';

export interface TranslateOptions {
  text: string;
  from: Profile;
  to: Profile;
  adapter: LLMAdapter;
  model?: string;
  temperature?: number;
}

export async function translate(options: TranslateOptions): Promise<string> {
  const system = buildSystemPrompt(options.from, options.to);
  const user = buildUserPrompt(options.text);
  const completion: CompletionOptions = { system, user };
  if (options.model !== undefined) completion.model = options.model;
  if (options.temperature !== undefined) completion.temperature = options.temperature;
  const result = await options.adapter.complete(completion);
  return result.text;
}
