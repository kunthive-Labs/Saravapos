import { describe, expect, it } from 'vitest';
import { runLexicalChecks } from './lexical.js';
import type { GoldenCase } from './types.js';

const baseCase: GoldenCase = {
  id: 'lex',
  from: 'profiles/chess-expert.yaml',
  to: 'profiles/f1-fan.yaml',
  input: 'src',
  rubric: [{ name: 'fidelity', description: 'meaning' }],
};

describe('runLexicalChecks: must_avoid', () => {
  it('fails when a banned term appears in the translation', () => {
    const result = runLexicalChecks(
      { ...baseCase, must_avoid: ['pawn'] },
      'He gave up a Pawn to gain track position.',
    );
    expect(result.passed).toBe(false);
    expect(result.presentAvoids).toEqual(['pawn']);
  });

  it('passes when no banned term is present', () => {
    const result = runLexicalChecks(
      { ...baseCase, must_avoid: ['zugzwang'] },
      'He gave up something small to gain track position.',
    );
    expect(result.passed).toBe(true);
    expect(result.presentAvoids).toEqual([]);
  });
});

describe('runLexicalChecks: must_include', () => {
  it('passes when every required term appears (case-insensitive)', () => {
    const result = runLexicalChecks(
      { ...baseCase, must_include: ['Initiative', 'tempo'] },
      'White held the initiative thanks to superior tempo.',
    );
    expect(result.passed).toBe(true);
    expect(result.missingIncludes).toEqual([]);
  });

  it('fails and lists every term that did not appear', () => {
    const result = runLexicalChecks(
      { ...baseCase, must_include: ['pit', 'undercut'] },
      'He stayed out a lap longer for fresh tyres.',
    );
    expect(result.passed).toBe(false);
    expect(result.missingIncludes).toEqual(['pit', 'undercut']);
  });
});
