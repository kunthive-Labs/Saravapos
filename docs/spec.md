# worldview profile spec

**Schema version:** `0.1` (alpha — unstable)

## Motivation

Every explanation rides on shared metaphors. A chess coach says "sacrifice a pawn for positional advantage" and another chess player nods — but a Formula 1 fan hears empty noise. The information is sound; the **mental model** behind it is missing.

Today the fix is ad-hoc: the speaker rewrites by hand, or the listener gives up. LLMs can translate between languages, codebases, even tones — but there is no portable, declarative way to say _"render this idea for someone whose mental world looks like **this**."_

The worldview protocol fills that gap. A profile is a small YAML/JSON document that describes a persona's expertise, preferred analogies, cognitive style, and cultural reference points. Given a `from` profile and a `to` profile, a translator can rewrite content so it lands — preserving the **semantic** payload while swapping the **metaphor** layer.

Profiles are:

- **Authored once, reused everywhere** — not regenerated per session.
- **Portable** — plain text, vendor-neutral, version-controllable.
- **Composable** — a profile is just data; tooling can diff, merge, lint, and validate it.

The spec exists so multiple SDKs, CLIs, and editor plugins can agree on the same shape.

## Scope

The spec defines:

- A JSON Schema for **profile documents** (the structural contract).
- A canonical **field semantics** section (how a translator should interpret each field — see below).
- A **versioning policy** for evolving the schema without breaking existing profiles.

It deliberately stops at the data layer. How a given SDK or CLI implements translation — prompt design, model choice, caching, evaluation — is out of scope for the spec.

## Non-goals

Explicitly **out of scope** for v0.x:

- **Session portability.** Profiles describe a persona, not a conversation. There is no notion of dialogue state, memory, or per-turn context in this spec.
- **Hosted service.** No central registry, no profile sync server, no accounts. Profiles are local files. A future companion spec _may_ describe a registry; this document will not.
- **GUI / authoring tooling.** Authoring UX (forms, wizards, web editors) is left to implementations.
- **Identity verification.** A profile is self-asserted. Nothing here authenticates that the person described actually exists or holds the stated expertise.
- **Prescribing a prompt format.** Translators decide how to lower a profile into model prompts. The spec only fixes the data, not the prompt template.

## Schema

Top level keys (only `schema_version` and `identity` are required):

| Field              | Type     | Required | Description                                     |
| ------------------ | -------- | -------- | ----------------------------------------------- |
| `schema_version`   | `string` | yes      | Pinned to the spec version (currently `"0.1"`). |
| `identity`         | object   | yes      | Who the persona is at a surface level.          |
| `expertise`        | array    | no       | One entry per domain the persona knows.         |
| `analogy_bank`     | array    | no       | Preferred metaphors for translating concepts.   |
| `cognitive_style`  | object   | no       | How the persona prefers ideas to be phrased.    |
| `cultural_context` | object   | no       | References that land and references to avoid.   |

### identity

Required. Describes the persona at the surface so translators can pick language and addressing conventions.

| Field          | Type       | Required | Description                                                                  |
| -------------- | ---------- | -------- | ---------------------------------------------------------------------------- |
| `display_name` | `string`   | yes      | Human-readable label for the persona. Used in logs and CLI output.           |
| `languages`    | `string[]` | yes      | BCP-47-ish language tags ordered by preference. Must contain at least one.   |
| `region`       | `string`   | yes      | Coarse geographic or cultural region (e.g. `"US"`, `"Tokyo"`, `"South-EU"`). |

### expertise

_TODO_

### analogy_bank

_TODO_

### cognitive_style

_TODO_

### cultural_context

_TODO_

## Semantics

_TODO_

## Examples

_TODO_

## Versioning

_TODO_
