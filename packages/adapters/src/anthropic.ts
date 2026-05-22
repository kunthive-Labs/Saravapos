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
    const request = {
      model,
      max_tokens: 4096,
      system: options.system,
      messages: [{ role: 'user' as const, content: options.user }],
      ...(options.temperature !== undefined ? { temperature: options.temperature } : {}),
    };
    try {
      const response = await this.callWithRetry(request);
      const text = extractText(response.content);
      return { text, model, provider: this.name };
    } catch (err) {
      if (err instanceof AdapterError) throw err;
      const status = statusOf(err);
      const message = err instanceof Error ? err.message : String(err);
      throw new AdapterError(`Anthropic API error: ${message}`, 'anthropic', {
        ...(status !== undefined ? { status } : {}),
        cause: err,
      });
    }
  }

  private async callWithRetry(
    request: Parameters<Anthropic['messages']['create']>[0],
  ): Promise<{ content: unknown }> {
    try {
      return (await this.client.messages.create(request)) as { content: unknown };
    } catch (err) {
      if (statusOf(err) !== 429) throw err;
      await sleep(this.retryDelayMs);
      return (await this.client.messages.create(request)) as { content: unknown };
    }
  }

  private readonly retryDelayMs: number = 250;
}

function statusOf(err: unknown): number | undefined {
  if (typeof err === 'object' && err !== null && 'status' in err) {
    return (err as { status?: number }).status;
  }
  return undefined;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

type ContentBlock = { type: string; text?: string };

function extractText(content: unknown): string {
  if (!Array.isArray(content)) return '';
  return (content as ContentBlock[])
    .filter((b) => b.type === 'text' && typeof b.text === 'string')
    .map((b) => b.text as string)
    .join('');
}
