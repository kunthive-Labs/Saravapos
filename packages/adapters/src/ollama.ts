import { AdapterError } from './errors.js';
import type { CompletionOptions, CompletionResult, LLMAdapter } from './types.js';

export interface OllamaAdapterOptions {
  baseUrl?: string;
  defaultModel?: string;
  fetchImpl?: typeof fetch;
}

interface OllamaChatResponse {
  message?: { role: string; content: string };
  error?: string;
}

export class OllamaAdapter implements LLMAdapter {
  readonly name = 'ollama';
  readonly defaultModel: string;
  private readonly baseUrl: string;
  private readonly fetchImpl: typeof fetch;

  constructor(options: OllamaAdapterOptions = {}) {
    this.baseUrl = (
      options.baseUrl ??
      process.env['OLLAMA_HOST'] ??
      'http://localhost:11434'
    ).replace(/\/$/, '');
    this.defaultModel = options.defaultModel ?? 'llama3.1';
    this.fetchImpl = options.fetchImpl ?? fetch;
  }

  async complete(options: CompletionOptions): Promise<CompletionResult> {
    const model = options.model ?? this.defaultModel;
    const url = `${this.baseUrl}/api/chat`;
    const body = {
      model,
      stream: false,
      messages: [
        { role: 'system', content: options.system },
        { role: 'user', content: options.user },
      ],
      ...(options.temperature !== undefined
        ? { options: { temperature: options.temperature } }
        : {}),
    };

    let response: Response;
    try {
      response = await this.fetchImpl(url, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body),
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      throw new AdapterError(`Ollama request failed: ${message}`, 'ollama', { cause: err });
    }

    if (!response.ok) {
      throw new AdapterError(`Ollama API error: HTTP ${response.status}`, 'ollama', {
        status: response.status,
      });
    }

    const data = (await response.json()) as OllamaChatResponse;
    if (data.error) {
      throw new AdapterError(`Ollama API error: ${data.error}`, 'ollama');
    }
    const text = data.message?.content ?? '';
    return { text, model, provider: this.name };
  }
}
