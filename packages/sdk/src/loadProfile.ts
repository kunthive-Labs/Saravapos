import { readFile } from 'node:fs/promises';
import { parse } from 'yaml';
import { Ajv } from 'ajv';
import { profileSchema } from '@wv/spec';
import type { Profile } from '@wv/spec';
import { ProfileValidationError } from './errors.js';

const ajv = new Ajv({ allErrors: true });
const validateProfile = ajv.compile(profileSchema);

export async function loadProfile(filePath: string): Promise<Profile> {
  const content = await readFile(filePath, 'utf-8');
  const parsed = parse(content) as unknown;
  if (!validateProfile(parsed)) {
    const errors = validateProfile.errors ?? [];
    const first = errors[0];
    const fieldPath =
      first?.instancePath ||
      (first?.params as Record<string, string> | undefined)?.['missingProperty']
        ? `/${(first?.params as Record<string, string>)['missingProperty'] ?? ''}`
        : '/';
    throw new ProfileValidationError(
      `Profile validation failed at "${fieldPath}": ${first?.message ?? 'unknown error'}`,
      fieldPath,
      errors,
    );
  }
  return parsed as Profile;
}
