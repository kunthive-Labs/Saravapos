import OpenAI from 'openai';
import { AdapterError } from './errors.js';
import type { CompletionOptions, CompletionResult, LLMAdapter } from './types.js';

export interface OpenAIAdapterOptions {
  apiKey?: string;
  defaultModel?: string;
  client?: OpenAI;
}

export class OpenAIAdapter implements LLMAdapter {
  readonly name = 'openai';
  readonly defaultModel: string;
  private readonly client: OpenAI;

  constructor(options: OpenAIAdapterOptions = {}) {
    const apiKey = options.apiKey ?? process.env['OPENAI_API_KEY'];
    if (!options.client && !apiKey) {
      throw new AdapterError(
        'OPENAI_API_KEY not set; pass apiKey in options or set the env var',
        this.name,
      );
    }
    this.defaultModel = options.defaultModel ?? 'gpt-4o';
    this.client = options.client ?? new OpenAI({ apiKey: apiKey! });
  }

  async complete(options: CompletionOptions): Promise<CompletionResult> {
    const model = options.model ?? this.defaultModel;
    try {
      const response = await this.client.chat.completions.create({
        model,
        messages: [
          { role: 'system', content: options.system },
          { role: 'user', content: options.user },
        ],
        ...(options.temperature !== undefined ? { temperature: options.temperature } : {}),
      });
      const text = response.choices[0]?.message?.content ?? '';
      return { text, model, provider: this.name };
    } catch (err) {
      if (err instanceof AdapterError) throw err;
      const status =
        typeof err === 'object' && err !== null && 'status' in err
          ? (err as { status?: number }).status
          : undefined;
      const message = err instanceof Error ? err.message : String(err);
      throw new AdapterError(`OpenAI API error: ${message}`, 'openai', {
        ...(status !== undefined ? { status } : {}),
        cause: err,
      });
    }
  }
}
