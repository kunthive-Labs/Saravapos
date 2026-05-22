import type { Profile } from '@wv/spec';
import type { LLMAdapter } from '@wv/adapters';
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
  const result = await options.adapter.complete({
    system,
    user,
    model: options.model,
    temperature: options.temperature,
  });
  return result.text;
}
