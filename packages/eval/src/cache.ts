import { createHash } from 'node:crypto';
import type { CompletionOptions } from '@wv/adapters';

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
