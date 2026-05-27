import { describe, expect, it } from 'vitest';
import { loadCaseFromString } from './loadCase.js';
import { CaseValidationError } from './errors.js';

const validYaml = `
id: sample
from: profiles/chess-expert.yaml
to: profiles/f1-fan.yaml
input: I sacrificed a pawn for a positional advantage.
rubric:
  - name: fidelity
    description: Preserves the original meaning.
`;

describe('loadCaseFromString', () => {
  it('parses and returns a typed case', () => {
    const c = loadCaseFromString(validYaml);
    expect(c.id).toBe('sample');
    expect(c.rubric[0]?.name).toBe('fidelity');
  });

  it('throws CaseValidationError with field path on bad schema', () => {
    const bad = 'id: x\nfrom: a\nto: b\nrubric: []';
    expect(() => loadCaseFromString(bad)).toThrow(CaseValidationError);
  });

  it('reports the missing field in the error', () => {
    const bad = 'id: x\nfrom: a\nto: b\nrubric:\n  - name: n\n    description: d';
    try {
      loadCaseFromString(bad);
      expect.unreachable('should have thrown');
    } catch (err) {
      expect(err).toBeInstanceOf(CaseValidationError);
      expect((err as CaseValidationError).fieldPath).toBe('/input');
    }
  });
});
