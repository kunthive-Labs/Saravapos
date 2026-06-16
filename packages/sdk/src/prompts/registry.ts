import type { PromptStrategy } from './types.js';
import { baselineStrategy } from './strategies/baseline.js';
import { structuredStrategy } from './strategies/structured.js';
import { fewShotStrategy } from './strategies/fewShot.js';
import { plainLanguageStrategy } from './strategies/plainLanguage.js';
import { plannedStrategy } from './strategies/planned.js';
import { analogyFirstStrategy } from './strategies/analogyFirst.js';
import { dynamicAnalogyStrategy } from './strategies/dynamicAnalogy.js';

/** Strategy used when a caller does not name one. */
export const DEFAULT_STRATEGY = 'baseline';

/** Every built-in prompt strategy, keyed by name. */
export const promptStrategies: Record<string, PromptStrategy> = {
  [baselineStrategy.name]: baselineStrategy,
  [structuredStrategy.name]: structuredStrategy,
  [fewShotStrategy.name]: fewShotStrategy,
  [plainLanguageStrategy.name]: plainLanguageStrategy,
  [plannedStrategy.name]: plannedStrategy,
  [analogyFirstStrategy.name]: analogyFirstStrategy,
  [dynamicAnalogyStrategy.name]: dynamicAnalogyStrategy,
};

/**
 * Look up a strategy by name, defaulting to `baseline`. Throws with the list of
 * known names if the name is unrecognised, so CLI typos fail loudly.
 */
export function resolveStrategy(name: string = DEFAULT_STRATEGY): PromptStrategy {
  const strategy = promptStrategies[name];
  if (strategy === undefined) {
    const known = Object.keys(promptStrategies).join(', ');
    throw new Error(`unknown prompt strategy "${name}" (known: ${known})`);
  }
  return strategy;
}
