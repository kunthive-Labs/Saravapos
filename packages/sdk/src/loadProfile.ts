import { readFile } from 'node:fs/promises';
import { parse } from 'yaml';
import { Ajv } from 'ajv';
import { profileSchema } from '@wv/spec';
import type { Profile } from '@wv/spec';

const ajv = new Ajv({ allErrors: true });
const validateProfile = ajv.compile(profileSchema);

export async function loadProfile(filePath: string): Promise<Profile> {
  const content = await readFile(filePath, 'utf-8');
  const parsed = parse(content) as unknown;
  if (!validateProfile(parsed)) {
    throw new Error('profile validation failed');
  }
  return parsed as Profile;
}
