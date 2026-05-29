import { Command } from 'commander';

interface ProviderInfo {
  name: string;
  envVar: string;
  defaultModel: string;
}

const PROVIDERS: ProviderInfo[] = [
  { name: 'anthropic', envVar: 'ANTHROPIC_API_KEY', defaultModel: 'claude-sonnet-4-6' },
  { name: 'openai', envVar: 'OPENAI_API_KEY', defaultModel: 'gpt-4o' },
  { name: 'ollama', envVar: 'OLLAMA_HOST', defaultModel: 'llama3.1' },
];

export function runListProviders(): number {
  process.stdout.write('Supported LLM providers:\n\n');
  for (const p of PROVIDERS) {
    process.stdout.write(
      `  ${p.name.padEnd(10)} env: ${p.envVar.padEnd(20)} default: ${p.defaultModel}\n`,
    );
  }
  process.stdout.write('\nSelect with `--provider <name>` or the SARAVAPOS_PROVIDER env var.\n');
  return 0;
}

export const listProvidersCommand = new Command('list-providers')
  .description('List supported LLM providers and their required env vars')
  .action(() => {
    process.exitCode = runListProviders();
  });
