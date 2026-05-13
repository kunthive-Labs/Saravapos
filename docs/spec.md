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

_TODO_

## Non-goals

_TODO_

## Schema

_TODO_

### identity

_TODO_

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
