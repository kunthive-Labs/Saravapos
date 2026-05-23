import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it, vi } from 'vitest';
import type { CompletionOptions, CompletionResult, LLMAdapter } from '@wv/adapters';
import { runTranslate, translateCommand } from './translate.js';

const repoRoot = resolve(fileURLToPath(import.meta.url), '..', '..', '..', '..', '..');
const chessProfile = resolve(repoRoot, 'profiles', 'chess-expert.yaml');
const f1Profile = resolve(repoRoot, 'profiles', 'f1-fan.yaml');

class MockAdapter implements LLMAdapter {
  readonly name = 'mock';
  readonly defaultModel = 'mock-model';
  readonly calls: CompletionOptions[] = [];
  constructor(private readonly reply: string) {}
  async complete(options: CompletionOptions): Promise<CompletionResult> {
    this.calls.push(options);
    return { text: this.reply, model: this.defaultModel, provider: this.name };
  }
}

describe('runTranslate', () => {
  it('fails with a helpful message when --from is missing', async () => {
    let captured = '';
    const cmd = translateCommand
      .exitOverride()
      .configureOutput({ writeErr: (s) => (captured += s) });
    await expect(cmd.parseAsync(['--to', f1Profile], { from: 'user' })).rejects.toMatchObject({
      code: 'commander.missingMandatoryOptionValue',
    });
    expect(captured).toMatch(/--from/);
  });

  it('writes translated text to stdout on the happy path', async () => {
    const adapter = new MockAdapter('Translated for F1 fans.');
    const writeSpy = vi.spyOn(process.stdout, 'write').mockImplementation(() => true);
    try {
      const code = await runTranslate(
        {
          from: chessProfile,
          to: f1Profile,
          text: 'I sacrificed a pawn for positional advantage.',
        },
        { adapter },
      );
      expect(code).toBe(0);
      expect(adapter.calls).toHaveLength(1);
      expect(writeSpy).toHaveBeenCalledWith('Translated for F1 fans.\n');
    } finally {
      writeSpy.mockRestore();
    }
  });
});
