import Anthropic from '@anthropic-ai/sdk';
import { AdapterError } from './errors.js';
import type { CompletionOptions, CompletionResult, LLMAdapter } from './types.js';

export interface AnthropicAdapterOptions {
  apiKey?: string;
  defaultModel?: string;
  client?: Anthropic;
}

export class AnthropicAdapter implements LLMAdapter {
  readonly name = 'anthropic';
  readonly defaultModel: string;
  private readonly client: Anthropic;

  constructor(options: AnthropicAdapterOptions = {}) {
    const apiKey = options.apiKey ?? process.env['ANTHROPIC_API_KEY'];
    if (!options.client && !apiKey) {
      throw new AdapterError(
        'ANTHROPIC_API_KEY not set; pass apiKey in options or set the env var',
        this.name,
      );
    }
    this.defaultModel = options.defaultModel ?? 'claude-sonnet-4-6';
    this.client = options.client ?? new Anthropic({ apiKey: apiKey! });
  }

  async complete(options: CompletionOptions): Promise<CompletionResult> {
    const model = options.model ?? this.defaultModel;
    try {
      const response = await this.client.messages.create({
        model,
        max_tokens: 4096,
        system: options.system,
        messages: [{ role: 'user', content: options.user }],
        ...(options.temperature !== undefined ? { temperature: options.temperature } : {}),
      });
      const text = extractText(response.content);
      return { text, model, provider: this.name };
    } catch (err) {
      if (err instanceof AdapterError) throw err;
      const status =
        typeof err === 'object' && err !== null && 'status' in err
          ? (err as { status?: number }).status
          : undefined;
      const message = err instanceof Error ? err.message : String(err);
      throw new AdapterError(`Anthropic API error: ${message}`, 'anthropic', {
        ...(status !== undefined ? { status } : {}),
        cause: err,
      });
    }
  }
}

type ContentBlock = { type: string; text?: string };

function extractText(content: unknown): string {
  if (!Array.isArray(content)) return '';
  return (content as ContentBlock[])
    .filter((b) => b.type === 'text' && typeof b.text === 'string')
    .map((b) => b.text as string)
    .join('');
}
