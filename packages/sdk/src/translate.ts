import type { Profile } from '@wv/spec';
import type { CompletionResult, LLMAdapter } from '@wv/adapters';
import { buildSystemPrompt, buildUserPrompt } from './prompts/index.js';

export interface TranslateOptions {
  text: string;
  from: Profile;
  to: Profile;
  adapter: LLMAdapter;
}

export async function translate(options: TranslateOptions): Promise<CompletionResult> {
  const system = buildSystemPrompt(options.from, options.to);
  const user = buildUserPrompt(options.text);
  return options.adapter.complete({ system, user });
}
