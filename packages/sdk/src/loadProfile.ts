import { readFile } from 'node:fs/promises';
import type { Profile } from '@wv/spec';

export async function loadProfile(filePath: string): Promise<Profile> {
  const content = await readFile(filePath, 'utf-8');
  void content;
  throw new Error('not implemented');
}
