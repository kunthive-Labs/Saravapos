import { describe, expect, it, vi } from 'vitest';
import type { LLMAdapter } from '@saravapos/adapters';
import type { Profile } from '@saravapos/spec';
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

  it('handles a 10k-character source text', async () => {
    const adapter = makeAdapter('ok');
    const from = makeProfile('A', 'chess');
    const to = makeProfile('B', 'formula-one');
    const text = 'x'.repeat(10_000);

    await translate({ text, from, to, adapter });

    const call = adapter.complete.mock.calls[0]!;
    const user = (call[0] as unknown as { user: string }).user;
    expect(user).toContain(text);
  });

  it('produces a stable system prompt when source and target profiles are identical', async () => {
    const adapter = makeAdapter('echo');
    const same = makeProfile('Same', 'chess');

    await translate({ text: 'hello', from: same, to: same, adapter });

    const call = adapter.complete.mock.calls[0]!;
    const system = (call[0] as unknown as { system: string }).system;
    expect(system).toMatchSnapshot();
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

  it('routes prompts through a named strategy', async () => {
    const adapter = makeAdapter();
    const from = makeProfile('A', 'chess');
    const to = makeProfile('B', 'formula-one');

    await translate({ text: 'go', from, to, adapter, strategy: 'structured' });

    const call = adapter.complete.mock.calls[0]!;
    const system = (call[0] as unknown as { system: string }).system;
    expect(system).toContain('# TRANSLATION CONTRACT');
  });

  it('defaults to the baseline strategy (no structured sections)', async () => {
    const adapter = makeAdapter();
    const from = makeProfile('A', 'chess');
    const to = makeProfile('B', 'formula-one');

    await translate({ text: 'go', from, to, adapter });

    const call = adapter.complete.mock.calls[0]!;
    const system = (call[0] as unknown as { system: string }).system;
    expect(system).not.toContain('# TRANSLATION CONTRACT');
  });

  it('leaves text-agnostic strategies unchanged by the threaded source text', async () => {
    const from = makeProfile('A', 'chess');
    const to = makeProfile('B', 'formula-one');

    const withText = makeAdapter();
    await translate({ text: 'a long source sentence', from, to, adapter: withText });
    const withEmpty = makeAdapter();
    await translate({ text: '', from, to, adapter: withEmpty });

    const a = (withText.complete.mock.calls[0]![0] as unknown as { system: string }).system;
    const b = (withEmpty.complete.mock.calls[0]![0] as unknown as { system: string }).system;
    expect(a).toBe(b); // baseline ignores the text arg → identical system prompt
  });

  it('accepts a custom strategy object', async () => {
    const adapter = makeAdapter();
    const from = makeProfile('A', 'chess');
    const to = makeProfile('B', 'formula-one');

    await translate({
      text: 'go',
      from,
      to,
      adapter,
      strategy: {
        name: 'custom',
        description: 'test-only',
        buildSystemPrompt: () => 'CUSTOM-SYSTEM',
        buildUserPrompt: (t) => `CUSTOM-${t}`,
      },
    });

    const call = adapter.complete.mock.calls[0]!;
    const sent = call[0] as unknown as { system: string; user: string };
    expect(sent.system).toBe('CUSTOM-SYSTEM');
    expect(sent.user).toBe('CUSTOM-go');
  });
});
