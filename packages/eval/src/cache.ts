import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { CompletionOptions, CompletionResult, LLMAdapter } from '@saravapos/adapters';

/** Default on-disk cache root, relative to the runner cwd. */
export const DEFAULT_CACHE_DIR = '.eval-cache';

/**
 * Stable cache key for one completion. The key includes everything the
 * provider sees that could change the output — provider name, model, and the
 * full system + user prompts — so a hit guarantees byte-equivalence with the
 * previous response (temperature is locked to 0 elsewhere).
 */
export function cacheKey(provider: string, options: CompletionOptions): string {
  const model = options.model ?? '';
  const payload = `${provider}\n${model}\n${options.system}\n${options.user}`;
  return createHash('sha256').update(payload).digest('hex');
}

export interface CachedCompleteOptions {
  /** Cache directory. Defaults to DEFAULT_CACHE_DIR. */
  dir?: string;
  /** When true, skip the read step but still write — forces a fresh call. */
  noCache?: boolean;
}

/**
 * Read-through wrapper around an adapter's complete(). On a hit we return
 * the previously written CompletionResult verbatim; on a miss we call the
 * adapter and persist the response keyed by cacheKey().
 */
export async function cachedComplete(
  adapter: LLMAdapter,
  options: CompletionOptions,
  cacheOptions: CachedCompleteOptions = {},
): Promise<CompletionResult> {
  const dir = cacheOptions.dir ?? DEFAULT_CACHE_DIR;
  const key = cacheKey(adapter.name, options);
  const path = join(dir, `${key}.json`);

  if (!cacheOptions.noCache) {
    try {
      const hit = await readFile(path, 'utf-8');
      return JSON.parse(hit) as CompletionResult;
    } catch {
      // miss — fall through to live call
    }
  }

  const fresh = await adapter.complete(options);
  await mkdir(dir, { recursive: true });
  await writeFile(path, JSON.stringify(fresh), 'utf-8');
  return fresh;
}
