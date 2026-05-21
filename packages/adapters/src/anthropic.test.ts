import { describe, expect, it, vi } from 'vitest';
import type Anthropic from '@anthropic-ai/sdk';
import { AnthropicAdapter } from './anthropic.js';
import { AdapterError } from './errors.js';

type FakeClient = {
  messages: {
    create: ReturnType<typeof vi.fn>;
  };
};

function makeFakeClient(impl: (args: unknown) => unknown): FakeClient {
  return { messages: { create: vi.fn(impl) } };
}

describe('AnthropicAdapter', () => {
  it('returns extracted text from content blocks', async () => {
    const client = makeFakeClient(() => ({
      content: [
        { type: 'text', text: 'hello ' },
        { type: 'text', text: 'world' },
      ],
    }));
    const adapter = new AnthropicAdapter({
      apiKey: 'test',
      client: client as unknown as Anthropic,
    });
    const result = await adapter.complete({ system: 'sys', user: 'usr' });
    expect(result.text).toBe('hello world');
    expect(result.provider).toBe('anthropic');
    expect(result.model).toBe('claude-sonnet-4-6');
    expect(client.messages.create).toHaveBeenCalledWith(
      expect.objectContaining({
        model: 'claude-sonnet-4-6',
        system: 'sys',
        messages: [{ role: 'user', content: 'usr' }],
      }),
    );
  });

  it('uses overridden model when provided', async () => {
    const client = makeFakeClient(() => ({ content: [{ type: 'text', text: 'ok' }] }));
    const adapter = new AnthropicAdapter({
      apiKey: 'test',
      client: client as unknown as Anthropic,
    });
    await adapter.complete({ system: 's', user: 'u', model: 'claude-haiku-4-5-20251001' });
    expect(client.messages.create).toHaveBeenCalledWith(
      expect.objectContaining({ model: 'claude-haiku-4-5-20251001' }),
    );
  });

  it('surfaces API errors as AdapterError', async () => {
    const apiErr = Object.assign(new Error('rate limited'), { status: 429 });
    const client = makeFakeClient(() => {
      throw apiErr;
    });
    const adapter = new AnthropicAdapter({
      apiKey: 'test',
      client: client as unknown as Anthropic,
    });
    await expect(adapter.complete({ system: 's', user: 'u' })).rejects.toMatchObject({
      name: 'AdapterError',
      provider: 'anthropic',
      status: 429,
    });
  });

  it('throws AdapterError when no API key and no client', () => {
    const prev = process.env['ANTHROPIC_API_KEY'];
    delete process.env['ANTHROPIC_API_KEY'];
    try {
      expect(() => new AnthropicAdapter()).toThrow(AdapterError);
    } finally {
      if (prev !== undefined) process.env['ANTHROPIC_API_KEY'] = prev;
    }
  });
});
