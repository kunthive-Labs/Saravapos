/**
 * examples/basic.ts
 *
 * Translate a chess-flavored sentence into terms that land for an F1 fan.
 *
 * Run: SARAVAPOS_PROVIDER=anthropic ANTHROPIC_API_KEY=... pnpm example:basic
 */
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { loadProfile, translate } from '@saravapos/sdk';
import { resolveAdapter, type AdapterName } from '@saravapos/adapters';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const profiles = resolve(__dirname, '..', 'profiles');

async function main(): Promise<void> {
  const providerName = (process.env.SARAVAPOS_PROVIDER ?? 'anthropic') as AdapterName;
  const adapter = resolveAdapter(providerName);

  const from = await loadProfile(resolve(profiles, 'chess-expert.yaml'));
  const to = await loadProfile(resolve(profiles, 'f1-fan.yaml'));

  const text = 'I sacrificed a pawn for a positional advantage in the middlegame.';
  const translated = await translate({ text, from, to, adapter });

  console.log('--- source ---');
  console.log(text);
  console.log('--- translated ---');
  console.log(translated);
}

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
