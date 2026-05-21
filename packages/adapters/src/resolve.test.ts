import { describe, expect, it } from 'vitest';
import { resolveAdapter } from './resolve.js';
import { AnthropicAdapter } from './anthropic.js';
import { OpenAIAdapter } from './openai.js';
import { OllamaAdapter } from './ollama.js';
import { AdapterError } from './errors.js';

describe('resolveAdapter', () => {
  it('returns AnthropicAdapter for "anthropic"', () => {
    const a = resolveAdapter('anthropic', { anthropic: { apiKey: 'x' } });
    expect(a).toBeInstanceOf(AnthropicAdapter);
    expect(a.name).toBe('anthropic');
  });

  it('returns OpenAIAdapter for "openai"', () => {
    const a = resolveAdapter('openai', { openai: { apiKey: 'x' } });
    expect(a).toBeInstanceOf(OpenAIAdapter);
    expect(a.name).toBe('openai');
  });

  it('returns OllamaAdapter for "ollama"', () => {
    const a = resolveAdapter('ollama');
    expect(a).toBeInstanceOf(OllamaAdapter);
    expect(a.name).toBe('ollama');
  });

  it('throws AdapterError for unknown adapter names', () => {
    expect(() => resolveAdapter('gemini')).toThrow(AdapterError);
  });
});
