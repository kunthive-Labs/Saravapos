import { readFile } from 'node:fs/promises';
import { parse } from 'yaml';
import type { Profile } from '@wv/spec';

export async function loadProfile(filePath: string): Promise<Profile> {
  const content = await readFile(filePath, 'utf-8');
  const parsed = parse(content) as unknown;
  void parsed;
  throw new Error('not implemented');
}
