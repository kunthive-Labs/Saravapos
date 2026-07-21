import { Command } from 'commander';

type CheckStatus = 'pass' | 'fail';

export interface DoctorCheck {
  name: string;
  status: CheckStatus;
  detail: string;
}

export interface DoctorOptions {
  version: string;
  provider: string;
  nodeVersion?: string;
  env?: NodeJS.ProcessEnv;
  fetch?: typeof fetch;
}

const MINIMUM_NODE_MAJOR = 20;

export async function runDoctor(options: DoctorOptions): Promise<DoctorCheck[]> {
  const nodeVersion = options.nodeVersion ?? process.versions.node;
  const env = options.env ?? process.env;
  const checks: DoctorCheck[] = [
    {
      name: 'Node.js',
      status:
        Number.parseInt(nodeVersion.split('.')[0] ?? '', 10) >= MINIMUM_NODE_MAJOR
          ? 'pass'
          : 'fail',
      detail: `v${nodeVersion} (requires >=${MINIMUM_NODE_MAJOR})`,
    },
    {
      name: 'CLI release',
      status: /^\d+\.\d+\.\d+$/.test(options.version) ? 'pass' : 'fail',
      detail: `v${options.version}`,
    },
  ];

  checks.push(await providerCheck(options.provider, env, options.fetch ?? fetch));
  return checks;
}

async function providerCheck(
  provider: string,
  env: NodeJS.ProcessEnv,
  fetchImpl: typeof fetch,
): Promise<DoctorCheck> {
  if (provider === 'anthropic') {
    return environmentCheck('Anthropic', 'ANTHROPIC_API_KEY', env);
  }
  if (provider === 'openai') {
    return environmentCheck('OpenAI', 'OPENAI_API_KEY', env);
  }
  if (provider === 'ollama') {
    const host = env.OLLAMA_HOST ?? 'http://127.0.0.1:11434';
    try {
      const response = await fetchImpl(`${host.replace(/\/$/, '')}/api/tags`, {
        signal: AbortSignal.timeout(3_000),
      });
      return {
        name: 'Ollama',
        status: response.ok ? 'pass' : 'fail',
        detail: response.ok ? `reachable at ${host}` : `returned HTTP ${response.status}`,
      };
    } catch {
      return { name: 'Ollama', status: 'fail', detail: `unreachable at ${host}` };
    }
  }
  return { name: 'Provider', status: 'fail', detail: `unsupported provider "${provider}"` };
}

function environmentCheck(
  provider: string,
  variable: 'ANTHROPIC_API_KEY' | 'OPENAI_API_KEY',
  env: NodeJS.ProcessEnv,
): DoctorCheck {
  return {
    name: provider,
    status: env[variable] !== undefined && env[variable] !== '' ? 'pass' : 'fail',
    detail:
      env[variable] !== undefined && env[variable] !== ''
        ? `${variable} is set`
        : `${variable} is missing`,
  };
}

export function createDoctorCommand(version: string): Command {
  return new Command('doctor')
    .description('Check runtime and provider readiness')
    .action(async (_options: unknown, command: Command) => {
      const globals = command.optsWithGlobals<{ provider?: string }>();
      const provider = globals.provider ?? process.env.SARAVAPOS_PROVIDER ?? 'anthropic';
      const checks = await runDoctor({ version, provider });
      for (const check of checks) {
        const mark = check.status === 'pass' ? '✓' : '✗';
        process.stdout.write(`${mark} ${check.name}: ${check.detail}\n`);
      }
      if (checks.some((check) => check.status === 'fail')) {
        process.exitCode = 1;
      }
    });
}
