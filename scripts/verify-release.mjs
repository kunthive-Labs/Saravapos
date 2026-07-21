import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const packageNames = ['spec', 'adapters', 'sdk', 'cli'];
const failures = [];

const packages = packageNames.map((name) => ({
  name,
  manifest: readJson(resolve(root, 'packages', name, 'package.json')),
}));
const versions = new Set(packages.map(({ manifest }) => manifest.version));

if (versions.size !== 1) {
  failures.push(
    `publishable package versions differ: ${packages
      .map(({ name, manifest }) => `${name}@${manifest.version}`)
      .join(', ')}`,
  );
}

const version = packages[0]?.manifest.version;
if (typeof version !== 'string' || !/^\d+\.\d+\.\d+$/.test(version)) {
  failures.push(`release version must be stable semver, received ${String(version)}`);
}

const changelog = readFileSync(resolve(root, 'CHANGELOG.md'), 'utf-8');
if (typeof version === 'string' && !changelog.includes(`## [${version}]`)) {
  failures.push(`CHANGELOG.md has no ${version} release heading`);
}

try {
  const reportedVersion = execFileSync(
    process.execPath,
    [resolve(root, 'packages/cli/dist/cli.js'), '--version'],
    { encoding: 'utf-8' },
  ).trim();
  if (reportedVersion !== version) {
    failures.push(
      `built CLI reports ${reportedVersion}; package metadata reports ${String(version)}`,
    );
  }
} catch (error) {
  failures.push(
    `built CLI could not run: ${error instanceof Error ? error.message : String(error)}`,
  );
}

if (failures.length > 0) {
  for (const failure of failures) process.stderr.write(`✗ ${failure}\n`);
  process.exit(1);
}

process.stdout.write(`✓ release metadata is consistent at v${version}\n`);
process.stdout.write('✓ built CLI version matches package metadata\n');

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf-8'));
}
