import { AdapterError } from './errors.js';
import { AnthropicAdapter, type AnthropicAdapterOptions } from './anthropic.js';
import { OpenAIAdapter, type OpenAIAdapterOptions } from './openai.js';
import { OllamaAdapter, type OllamaAdapterOptions } from './ollama.js';
import type { LLMAdapter } from './types.js';

export type AdapterName = 'anthropic' | 'openai' | 'ollama';

export interface ResolveAdapterOptions {
  anthropic?: AnthropicAdapterOptions;
  openai?: OpenAIAdapterOptions;
  ollama?: OllamaAdapterOptions;
}

export function resolveAdapter(name: string, options: ResolveAdapterOptions = {}): LLMAdapter {
  switch (name) {
    case 'anthropic':
      return new AnthropicAdapter(options.anthropic);
    case 'openai':
      return new OpenAIAdapter(options.openai);
    case 'ollama':
      return new OllamaAdapter(options.ollama);
    default:
      throw new AdapterError(
        `Unknown adapter "${name}". Supported: anthropic, openai, ollama`,
        name,
      );
  }
}
