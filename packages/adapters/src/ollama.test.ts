import { describe, expect, it, vi } from 'vitest';
import { OllamaAdapter } from './ollama.js';

function jsonResponse(body: unknown, init: { status?: number; ok?: boolean } = {}): Response {
  const ok = init.ok ?? (init.status ?? 200) < 400;
  return {
    ok,
    status: init.status ?? 200,
    json: async () => body,
  } as unknown as Response;
}

describe('OllamaAdapter', () => {
  it('POSTs /api/chat and returns message content', async () => {
    const fetchImpl = vi.fn(async () =>
      jsonResponse({ message: { role: 'assistant', content: 'hello from llama' } }),
    );
    const adapter = new OllamaAdapter({ fetchImpl: fetchImpl as unknown as typeof fetch });
    const result = await adapter.complete({ system: 'sys', user: 'usr' });

    expect(result.text).toBe('hello from llama');
    expect(result.model).toBe('llama3.1');
    expect(result.provider).toBe('ollama');

    const call = fetchImpl.mock.calls[0] as unknown as [string, RequestInit] | undefined;
    expect(call).toBeDefined();
    const [url, init] = call!;
    expect(url).toBe('http://localhost:11434/api/chat');
    const body = JSON.parse(init.body as string);
    expect(body).toMatchObject({
      model: 'llama3.1',
      stream: false,
      messages: [
        { role: 'system', content: 'sys' },
        { role: 'user', content: 'usr' },
      ],
    });
  });

  it('throws AdapterError on non-OK response', async () => {
    const fetchImpl = vi.fn(async () => jsonResponse({}, { status: 500, ok: false }));
    const adapter = new OllamaAdapter({ fetchImpl: fetchImpl as unknown as typeof fetch });
    await expect(adapter.complete({ system: 's', user: 'u' })).rejects.toMatchObject({
      name: 'AdapterError',
      provider: 'ollama',
      status: 500,
    });
  });

  it('throws AdapterError when fetch itself fails', async () => {
    const fetchImpl = vi.fn(async () => {
      throw new Error('ECONNREFUSED');
    });
    const adapter = new OllamaAdapter({ fetchImpl: fetchImpl as unknown as typeof fetch });
    await expect(adapter.complete({ system: 's', user: 'u' })).rejects.toMatchObject({
      name: 'AdapterError',
      provider: 'ollama',
    });
  });
});
