import { describe, expect, it } from 'vitest';
import type { CompletionOptions, CompletionResult, LLMAdapter } from './types.js';

class MockAdapter implements LLMAdapter {
  readonly name = 'mock';
  readonly defaultModel = 'mock-1';
  async complete(options: CompletionOptions): Promise<CompletionResult> {
    return {
      text: `system=${options.system}|user=${options.user}`,
      model: options.model ?? this.defaultModel,
      provider: this.name,
    };
  }
}

describe('LLMAdapter interface', () => {
  it('a mock implementation satisfies the contract', async () => {
    const adapter: LLMAdapter = new MockAdapter();
    const result = await adapter.complete({ system: 's', user: 'u' });
    expect(result.text).toBe('system=s|user=u');
    expect(result.model).toBe('mock-1');
    expect(result.provider).toBe('mock');
  });

  it('honours model override', async () => {
    const adapter: LLMAdapter = new MockAdapter();
    const result = await adapter.complete({ system: 's', user: 'u', model: 'custom' });
    expect(result.model).toBe('custom');
  });
});
