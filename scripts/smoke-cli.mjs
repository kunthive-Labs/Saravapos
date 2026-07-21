import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const cli = resolve(root, 'packages/cli/dist/cli.js');
const manifest = JSON.parse(readFileSync(resolve(root, 'packages/cli/package.json'), 'utf-8'));

const version = run(['--version']).trim();
assert(version === manifest.version, `expected CLI v${manifest.version}, received v${version}`);

const help = run(['--help']);
assert(help.includes('doctor'), 'help output does not list the doctor command');

const validation = run(['validate', resolve(root, 'profiles/chess-expert.yaml')]);
assert(validation.includes('is valid'), 'sample profile validation did not succeed');

const doctor = run(['--provider', 'anthropic', 'doctor'], {
  ...process.env,
  ANTHROPIC_API_KEY: 'smoke-test-placeholder',
});
assert(
  doctor.includes(`CLI release: v${manifest.version}`),
  'doctor did not confirm stable release metadata',
);
assert(
  doctor.includes('Anthropic: ANTHROPIC_API_KEY is set'),
  'doctor did not confirm provider setup',
);

process.stdout.write('✓ built CLI help, version, validation, and doctor smoke checks passed\n');

function run(args, env = process.env) {
  return execFileSync(process.execPath, [cli, ...args], { cwd: root, encoding: 'utf-8', env });
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}
