import { readFile } from 'node:fs/promises';
import { parse } from 'yaml';
import { Ajv } from 'ajv';
import { goldenCaseSchema } from './schema.js';
import type { GoldenCase } from './types.js';

const ajv = new Ajv({ allErrors: true });
const validate = ajv.compile(goldenCaseSchema);

export function loadCaseFromString(yamlContent: string): GoldenCase {
  const parsed = parse(yamlContent) as unknown;
  if (!validate(parsed)) {
    throw new Error(`Golden case validation failed: ${ajv.errorsText(validate.errors)}`);
  }
  return parsed as GoldenCase;
}

export async function loadCase(filePath: string): Promise<GoldenCase> {
  const content = await readFile(filePath, 'utf-8');
  return loadCaseFromString(content);
}
