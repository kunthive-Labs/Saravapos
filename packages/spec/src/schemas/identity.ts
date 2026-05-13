export const identitySchema = {
  type: 'object',
  required: ['display_name', 'languages', 'region'],
  properties: {
    display_name: { type: 'string', minLength: 1 },
    languages: { type: 'array', items: { type: 'string' }, minItems: 1 },
    region: { type: 'string', minLength: 1 },
  },
} as const;

export interface Identity {
  display_name: string;
  languages: string[];
  region: string;
}
