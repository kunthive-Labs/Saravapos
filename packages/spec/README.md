# @saravapos/spec

Profile JSON Schema and TypeScript types for the Saravapos protocol.

## Install

```bash
pnpm add @saravapos/spec
```

## Usage

```ts
import { profileSchema, SCHEMA_VERSION, type Profile } from '@saravapos/spec';

console.log(SCHEMA_VERSION); // '0.1'

const profile: Profile = {
  schema_version: '0.1',
  identity: { display_name: 'Alex', languages: ['en'], region: 'US' },
  expertise: [{ domain: 'chess', level: 'expert', years: 12 }],
  analogy_bank: [],
  cognitive_style: { mode: 'analytical', prefers: 'concrete', abstraction_tolerance: 'medium' },
  cultural_context: { references_that_land: [], references_to_avoid: [] },
};
```

`profileSchema` is exported as a JSON Schema string ready to feed to Ajv or any other validator. See [`docs/spec.md`](../../docs/spec.md) in the repo for the full field reference.

## Versioning

`SCHEMA_VERSION` follows semver applied to the schema shape, decoupled from the npm package version. Breaking changes to field semantics require a major bump; additive optional fields stay within 0.x.
