import { describe, expect, it } from 'vitest';
import type { Profile } from '@saravapos/spec';
import { promptStrategies } from './registry.js';

/**
 * Regression guard for the prompt surface. Every registered strategy's system
 * prompt is snapshotted against a fixed, content-rich profile pair, so any
 * accidental drift in a shared renderer (`describeProfile`, the structured
 * sections, a directive) shows up as a reviewable snapshot diff. Promoting a
 * strategy or intentionally editing a prompt means updating these with
 * `vitest run -u` — never silently.
 */
const FROM: Profile = {
  schema_version: '0.1',
  identity: { display_name: 'Chess Expert', languages: ['en'], region: 'US' },
  expertise: [{ domain: 'chess', level: 'expert', years: 20 }],
  analogy_bank: [
    {
      concept: 'pawn sacrifice',
      metaphor: 'burning fresh tyres to gain track position',
      domain: 'formula-one',
    },
    {
      concept: 'positional advantage',
      metaphor: 'controlling the undercut window',
      domain: 'formula-one',
    },
  ],
  cognitive_style: { mode: 'verbal', prefers: ['precise terms'], abstraction_tolerance: 'high' },
  cultural_context: { references_that_land: ['grandmaster games'], references_to_avoid: ['poker'] },
};

const TO: Profile = {
  schema_version: '0.1',
  identity: { display_name: 'F1 Fan', languages: ['en'], region: 'GB' },
  expertise: [{ domain: 'formula-one', level: 'intermediate' }],
  analogy_bank: [
    { concept: 'undercut', metaphor: 'pitting early to jump a rival', domain: 'formula-one' },
  ],
  cognitive_style: { mode: 'visual', prefers: ['vivid imagery'], abstraction_tolerance: 'low' },
  cultural_context: {
    references_that_land: ['race weekends'],
    references_to_avoid: ['chess openings'],
  },
};

describe('prompt strategy system prompts', () => {
  // Sorted so the snapshot order is stable regardless of registry insertion order.
  const names = Object.keys(promptStrategies).sort();

  it.each(names)('%s renders a stable system prompt', (name) => {
    const strategy = promptStrategies[name]!;
    expect(strategy.buildSystemPrompt(FROM, TO)).toMatchSnapshot();
  });
});
