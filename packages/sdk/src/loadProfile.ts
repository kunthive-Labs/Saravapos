import { readFile } from 'node:fs/promises';
import { parse } from 'yaml';
import type { Profile } from '@wv/spec';
import { ProfileValidationError } from './errors.js';
import { validateProfile } from './validator.js';

export function loadProfileFromString(yamlContent: string): Profile {
  const parsed = parse(yamlContent) as unknown;
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

export async function loadProfile(filePath: string): Promise<Profile> {
  const content = await readFile(filePath, 'utf-8');
  return loadProfileFromString(content);
}
