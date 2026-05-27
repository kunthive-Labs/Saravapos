import { readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { parse } from 'yaml';
import { Ajv } from 'ajv';
import { goldenCaseSchema } from './schema.js';
import { CaseValidationError } from './errors.js';
import type { GoldenCase } from './types.js';

const ajv = new Ajv({ allErrors: true });
const validate = ajv.compile(goldenCaseSchema);

export function loadCaseFromString(yamlContent: string): GoldenCase {
  const parsed = parse(yamlContent) as unknown;
  if (!validate(parsed)) {
    const errors = validate.errors ?? [];
    const first = errors[0];
    const missing = (first?.params as Record<string, string> | undefined)?.['missingProperty'];
    const fieldPath = first?.instancePath || (missing ? `/${missing}` : '/');
    throw new CaseValidationError(
      `Golden case validation failed at "${fieldPath}": ${first?.message ?? 'unknown error'}`,
      fieldPath,
      errors,
    );
  }
  return parsed as GoldenCase;
}

export async function loadCase(filePath: string): Promise<GoldenCase> {
  const content = await readFile(filePath, 'utf-8');
  return loadCaseFromString(content);
}

export async function loadAllCases(dir: string): Promise<GoldenCase[]> {
  const entries = await readdir(dir);
  const files = entries.filter((f) => f.endsWith('.yaml') || f.endsWith('.yml')).sort();
  const cases = await Promise.all(files.map((f) => loadCase(join(dir, f))));
  return cases.sort((a, b) => a.id.localeCompare(b.id));
}
