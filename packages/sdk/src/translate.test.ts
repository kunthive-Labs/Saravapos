import { describe, expect, it, vi } from 'vitest';
import type { LLMAdapter } from '@wv/adapters';
import type { Profile } from '@wv/spec';
import { translate } from './translate.js';

function makeProfile(name: string, domain: string): Profile {
  return {
    schema_version: '0.1',
    identity: { display_name: name, languages: ['en'], region: 'XX' },
    expertise: [{ domain, level: 'expert' }],
  };
}

function makeAdapter(text = 'translated'): LLMAdapter & {
  complete: ReturnType<typeof vi.fn>;
} {
  const complete = vi.fn().mockResolvedValue({
    text,
    model: 'mock-model',
    provider: 'mock',
  });
  return {
    name: 'mock',
    defaultModel: 'mock-model',
    complete,
  };
}

describe('translate', () => {
  it('calls adapter with a system prompt that mentions both profiles', async () => {
    const adapter = makeAdapter();
    const from = makeProfile('Chess Expert', 'chess');
    const to = makeProfile('F1 Fan', 'formula-one');

    await translate({ text: 'hello', from, to, adapter });

    expect(adapter.complete).toHaveBeenCalledTimes(1);
    const call = adapter.complete.mock.calls[0]!;
    const system = (call[0] as unknown as { system: string }).system;
    expect(system).toContain('SOURCE WORLDVIEW');
    expect(system).toContain('TARGET WORLDVIEW');
    expect(system).toContain('Chess Expert');
    expect(system).toContain('F1 Fan');
  });

  it('returns the adapter response text', async () => {
    const adapter = makeAdapter('lights out and away we go');
    const from = makeProfile('A', 'chess');
    const to = makeProfile('B', 'formula-one');

    const result = await translate({ text: 'go', from, to, adapter });

    expect(result).toBe('lights out and away we go');
  });

  it('handles empty text without throwing and still calls the adapter', async () => {
    const adapter = makeAdapter('');
    const from = makeProfile('A', 'chess');
    const to = makeProfile('B', 'formula-one');

    const result = await translate({ text: '', from, to, adapter });

    expect(result).toBe('');
    expect(adapter.complete).toHaveBeenCalledTimes(1);
  });

  it('passes the source text verbatim inside the user prompt', async () => {
    const adapter = makeAdapter();
    const from = makeProfile('A', 'chess');
    const to = makeProfile('B', 'formula-one');
    const text = 'I sacrificed a pawn for positional advantage.';

    await translate({ text, from, to, adapter });

    const call = adapter.complete.mock.calls[0]!;
    const user = (call[0] as unknown as { user: string }).user;
    expect(user).toContain(text);
  });
});
