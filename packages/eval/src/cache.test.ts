import { describe, expect, it } from 'vitest';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { CompletionOptions, CompletionResult, LLMAdapter } from '@wv/adapters';
import { cachedComplete, cacheKey } from './cache.js';

class CountingAdapter implements LLMAdapter {
  readonly name = 'mock';
  readonly defaultModel = 'mock-1';
  calls = 0;
  async complete(options: CompletionOptions): Promise<CompletionResult> {
    this.calls += 1;
    return {
      text: `text-${this.calls}`,
      model: options.model ?? this.defaultModel,
      provider: this.name,
    };
  }
}

async function withTempDir<T>(fn: (dir: string) => Promise<T>): Promise<T> {
  const dir = await mkdtemp(join(tmpdir(), 'wv-eval-cache-'));
  try {
    return await fn(dir);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

describe('cachedComplete', () => {
  it('cache hit returns stored result without calling the adapter again', async () => {
    await withTempDir(async (dir) => {
      const adapter = new CountingAdapter();
      const opts: CompletionOptions = { system: 's', user: 'u', model: 'm' };
      const first = await cachedComplete(adapter, opts, { dir });
      const second = await cachedComplete(adapter, opts, { dir });
      expect(adapter.calls).toBe(1);
      expect(second).toEqual(first);
    });
  });

  it('different prompts produce different cache keys', () => {
    const a = cacheKey('mock', { system: 's1', user: 'u', model: 'm' });
    const b = cacheKey('mock', { system: 's2', user: 'u', model: 'm' });
    expect(a).not.toBe(b);
  });

  it('noCache forces a fresh adapter call even when a hit exists', async () => {
    await withTempDir(async (dir) => {
      const adapter = new CountingAdapter();
      const opts: CompletionOptions = { system: 's', user: 'u' };
      await cachedComplete(adapter, opts, { dir });
      await cachedComplete(adapter, opts, { dir, noCache: true });
      expect(adapter.calls).toBe(2);
    });
  });
});
