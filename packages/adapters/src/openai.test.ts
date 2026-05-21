import { describe, expect, it, vi } from 'vitest';
import type OpenAI from 'openai';
import { OpenAIAdapter } from './openai.js';
import { AdapterError } from './errors.js';

type FakeClient = {
  chat: { completions: { create: ReturnType<typeof vi.fn> } };
};

function makeFakeClient(impl: (args: unknown) => unknown): FakeClient {
  return { chat: { completions: { create: vi.fn(impl) } } };
}

describe('OpenAIAdapter', () => {
  it('returns text from first choice', async () => {
    const client = makeFakeClient(() => ({
      choices: [{ message: { role: 'assistant', content: 'hi there' } }],
    }));
    const adapter = new OpenAIAdapter({
      apiKey: 'test',
      client: client as unknown as OpenAI,
    });
    const result = await adapter.complete({ system: 'sys', user: 'usr' });
    expect(result.text).toBe('hi there');
    expect(result.model).toBe('gpt-4o');
    expect(result.provider).toBe('openai');
    expect(client.chat.completions.create).toHaveBeenCalledWith(
      expect.objectContaining({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: 'sys' },
          { role: 'user', content: 'usr' },
        ],
      }),
    );
  });

  it('surfaces API errors as AdapterError', async () => {
    const apiErr = Object.assign(new Error('bad request'), { status: 400 });
    const client = makeFakeClient(() => {
      throw apiErr;
    });
    const adapter = new OpenAIAdapter({
      apiKey: 'test',
      client: client as unknown as OpenAI,
    });
    await expect(adapter.complete({ system: 's', user: 'u' })).rejects.toMatchObject({
      name: 'AdapterError',
      provider: 'openai',
      status: 400,
    });
  });

  it('throws AdapterError when no API key', () => {
    const prev = process.env['OPENAI_API_KEY'];
    delete process.env['OPENAI_API_KEY'];
    try {
      expect(() => new OpenAIAdapter()).toThrow(AdapterError);
    } finally {
      if (prev !== undefined) process.env['OPENAI_API_KEY'] = prev;
    }
  });
});
