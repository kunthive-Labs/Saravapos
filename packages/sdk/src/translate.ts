import type { Profile } from '@wv/spec';

export interface TranslateOptions {
  text: string;
  from: Profile;
  to: Profile;
  adapter: unknown;
}

export async function translate(_options: TranslateOptions): Promise<string> {
  throw new Error('translate: not yet implemented');
}
