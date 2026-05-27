/**
 * JSON Schema for a golden case. Mirrors the GoldenCase type in types.ts.
 * additionalProperties:false everywhere so typos in case files fail loudly.
 */
export const goldenCaseSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['id', 'from', 'to', 'input', 'rubric'],
  properties: {
    id: { type: 'string', minLength: 1 },
    from: { type: 'string', minLength: 1 },
    to: { type: 'string', minLength: 1 },
    input: { type: 'string', minLength: 1 },
    rubric: {
      type: 'array',
      minItems: 1,
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['name', 'description'],
        properties: {
          name: { type: 'string', minLength: 1 },
          description: { type: 'string', minLength: 1 },
          weight: { type: 'number', exclusiveMinimum: 0 },
        },
      },
    },
    must_include: { type: 'array', items: { type: 'string', minLength: 1 } },
    must_avoid: { type: 'array', items: { type: 'string', minLength: 1 } },
  },
} as const;
