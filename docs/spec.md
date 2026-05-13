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

Optional array. Each entry is a `{domain, level, years?}` tuple. The translator uses `level` to decide jargon density: an `expert` audience tolerates compressed technical phrasing; a `novice` requires expanded explanation.

Each entry:

| Field    | Type     | Required | Description                                                                  |
| -------- | -------- | -------- | ---------------------------------------------------------------------------- |
| `domain` | `string` | yes      | Free-form domain label (e.g. `"chess"`, `"machine-learning"`, `"baroque"`).  |
| `level`  | `enum`   | yes      | One of `novice`, `intermediate`, `advanced`, `expert`. See below.            |
| `years`  | `number` | no       | Years of practical exposure. Non-negative. Informational; not used for math. |

Level definitions:

| Level          | Rough meaning                                                                                             |
| -------------- | --------------------------------------------------------------------------------------------------------- |
| `novice`       | Has heard of the domain. Recognises a handful of named concepts. Needs expanded definitions.              |
| `intermediate` | Practises occasionally. Can follow standard jargon if context is given.                                   |
| `advanced`     | Practises regularly. Reads and writes about the domain fluently. Tolerates compressed technical phrasing. |
| `expert`       | Lives in the domain. Notices when phrasing is imprecise. Prefers terse, exact language.                   |

### analogy_bank

Optional array of preferred metaphor mappings. Each entry expresses "when you need to explain `concept`, reach for `metaphor` from `domain`." Translators consult this list **before** inventing new analogies, which is what makes a profile feel personal.

Each entry:

| Field      | Type     | Required | Description                                                            |
| ---------- | -------- | -------- | ---------------------------------------------------------------------- |
| `concept`  | `string` | yes      | Source concept being explained (e.g. `"pawn structure"`).              |
| `metaphor` | `string` | yes      | Phrase the persona will readily grasp (e.g. `"tire strategy"`).        |
| `domain`   | `string` | yes      | Domain the metaphor lives in (e.g. `"formula-one"`). Free-form string. |

Example:

```yaml
analogy_bank:
  - concept: 'sacrificing a pawn for positional advantage'
    metaphor: 'burning an extra pit stop to undercut the leader'
    domain: 'formula-one'
  - concept: 'opening theory'
    metaphor: 'qualifying setup'
    domain: 'formula-one'
```

An empty array (`analogy_bank: []`) is valid and means "no curated metaphors — translator may improvise freely."

### cognitive_style

Optional object. Shapes phrasing choices that are orthogonal to expertise: diagrams vs prose, concrete examples vs general principles, density of abstraction.

| Field                   | Type       | Required | Description                                                                           |
| ----------------------- | ---------- | -------- | ------------------------------------------------------------------------------------- |
| `mode`                  | `enum`     | yes      | Primary thinking modality. One of `visual`, `verbal`, `kinesthetic`, `mixed`.         |
| `prefers`               | `string[]` | no       | Free-form phrasing preferences (e.g. `"step-by-step"`, `"bullet lists"`).             |
| `abstraction_tolerance` | `enum`     | no       | How much abstract / symbolic phrasing the persona tolerates: `low`, `medium`, `high`. |

`mode` guidance:

| Mode          | Reach for                                                              |
| ------------- | ---------------------------------------------------------------------- |
| `visual`      | Diagrams, spatial layouts, "imagine…" phrasing, ASCII sketches.        |
| `verbal`      | Prose, definitions, narrative flow, explicit transitions.              |
| `kinesthetic` | Hands-on framing, "first you do X, then Y", physical-action verbs.     |
| `mixed`       | No strong preference — translator may pick whichever fits the content. |

`abstraction_tolerance` guidance:

- `low` — prefer concrete, specific, named examples. Avoid symbolic generalities.
- `medium` — mix examples with light generalisation.
- `high` — comfortable with abstract principles, formal definitions, type-level reasoning.

### cultural_context

Optional object. Two free-form string lists that steer reference selection. Matching is by literal phrase — translators may do case-insensitive substring matching, but the spec does not mandate fuzzy semantics.

| Field                  | Type       | Required | Description                                                                        |
| ---------------------- | ---------- | -------- | ---------------------------------------------------------------------------------- |
| `references_that_land` | `string[]` | no       | Cultural touchstones the persona is likely to recognise (e.g. `"Premier League"`). |
| `references_to_avoid`  | `string[]` | no       | Touchstones to skip — unfamiliar, sensitive, or actively disliked (e.g. `"NFL"`).  |

Guidance:

- Use specific, concrete phrases. `"cricket"` lands better than `"sports"`.
- The lists are advisory, not exhaustive. A translator may use references that appear in neither list; the lists only express _preferences_.
- `references_to_avoid` is a soft filter, not a content-safety mechanism. It is meant for "unfamiliar to this persona," not "dangerous to discuss."

## Semantics

This section describes **how a conforming translator should consume each field**. The schema fixes _what_ a profile says; this section fixes _how it should be acted on_.

A translation call always takes two profiles: a `from` (the source author's worldview) and a `to` (the target reader's worldview). For each field the translator considers both sides.

### identity

- `languages[0]` of the `to` profile defines the **output language**. If the `to` persona has no overlap with the `from` languages, the translator must still produce output in `to.languages[0]`.
- `region` is advisory. It is _not_ used to alter facts; it may bias examples and idioms (e.g. units of measurement, holidays).

### expertise

- The translator compares `from.expertise` and `to.expertise` by `domain` label.
- For each domain present in the source content:
  - If `to`'s level is **lower** than `from`'s, the translator must **expand**: replace jargon with definitions, slow the pace, add concrete examples.
  - If `to`'s level is **higher** or equal, the translator may **compress**: use shorthand, omit definitions of well-known terms, increase information density.
  - If the domain is absent from `to.expertise` entirely, treat as `novice`.
- `years` is informational only. It does not modify behaviour in this version.

### analogy_bank

- Translators must **prefer** entries from `to.analogy_bank` over inventing new analogies.
- Lookup is by `concept` string. Matching is case-insensitive substring; the spec does not mandate fuzzy/embedding-based search but does not forbid it.
- If a concept has no entry, the translator may freely invent an analogy — preferably drawn from a `domain` the `to` persona has expertise in.
- `from.analogy_bank` is informational. It can help the translator recognise that the source text already uses a metaphor (vs. a literal claim).

### cognitive_style

- `mode` and `prefers` jointly shape **format** decisions: prose vs. bullets, diagrams vs. paragraphs.
- `abstraction_tolerance` shapes **phrasing**: a `low` reader gets concrete examples; a `high` reader can be given the general principle directly.
- `from.cognitive_style` is informational.

### cultural_context

- `to.references_that_land` is a **shortlist** of touchstones the translator may reach for when an analogy is needed.
- `to.references_to_avoid` is a **filter**: the translator should not surface these phrases or close variants in the output.
- Both lists are advisory — there is no requirement to use them, and no requirement to avoid references that are absent from either list.

### Open questions

- How translators _verify_ they followed the profile (eval harness) is left to implementations.
- Whether to expose a "trace" of which profile fields influenced which spans of output is an open design question for v0.2+.

## Examples

A complete profile for a Formula 1 fan who knows little about chess:

```yaml
schema_version: '0.1'

identity:
  display_name: 'Jordan'
  languages: ['en']
  region: 'UK'

expertise:
  - domain: 'formula-one'
    level: 'expert'
    years: 15
  - domain: 'chess'
    level: 'novice'

analogy_bank:
  - concept: 'sacrificing a pawn for positional advantage'
    metaphor: 'burning an extra pit stop to undercut the leader'
    domain: 'formula-one'
  - concept: 'opening theory'
    metaphor: 'qualifying setup'
    domain: 'formula-one'

cognitive_style:
  mode: 'verbal'
  prefers:
    - 'concrete examples'
    - 'step-by-step'
  abstraction_tolerance: 'medium'

cultural_context:
  references_that_land:
    - 'Premier League'
    - 'cricket'
    - 'BBC'
  references_to_avoid:
    - 'NFL'
    - 'NASCAR'
```

A **minimal** profile (only the required fields):

```yaml
schema_version: '0.1'
identity:
  display_name: 'Anon'
  languages: ['en']
  region: 'global'
```

Both validate against the schema. The minimal form is useful for tests and quick experiments.

## Versioning

_TODO_
