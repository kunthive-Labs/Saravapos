import { describe, expect, it } from 'vitest';
import type { CompletionOptions, CompletionResult, LLMAdapter } from '@wv/adapters';
import { judge, weightedOverall } from './judge.js';
import { JudgeParseError } from './errors.js';
import type { GoldenCase } from './types.js';

const sampleCase: GoldenCase = {
  id: 'sample',
  from: 'profiles/chess-expert.yaml',
  to: 'profiles/f1-fan.yaml',
  input: 'I sacrificed a pawn for a positional advantage.',
  rubric: [
    { name: 'fidelity', description: 'Preserves the original meaning.' },
    { name: 'lands-for-target', description: 'Uses F1 framing the target recognises.' },
  ],
};

class FixedAdapter implements LLMAdapter {
  readonly name = 'mock';
  readonly defaultModel = 'mock-1';
  lastOptions: CompletionOptions | undefined;
  constructor(private readonly text: string) {}
  async complete(options: CompletionOptions): Promise<CompletionResult> {
    this.lastOptions = options;
    return { text: this.text, model: options.model ?? this.defaultModel, provider: this.name };
  }
}

describe('judge', () => {
  it('returns a parsed JudgeResult with per-criterion scores', async () => {
    const adapter = new FixedAdapter(
      JSON.stringify({
        criteria: [
          { name: 'fidelity', score: 4, reasoning: 'meaning intact' },
          { name: 'lands-for-target', score: 5, reasoning: 'great F1 framing' },
        ],
      }),
    );
    const result = await judge(sampleCase, 'a translation', adapter);
    expect(result.criteria).toHaveLength(2);
    expect(result.criteria[0]).toMatchObject({ name: 'fidelity', score: 4 });
    expect(result.criteria[1]?.score).toBe(5);
    expect(result.overall).toBeCloseTo(4.5);
  });

  it('surfaces JudgeParseError when the model returns non-JSON', async () => {
    const adapter = new FixedAdapter('not json at all, sorry');
    await expect(judge(sampleCase, 'x', adapter)).rejects.toBeInstanceOf(JudgeParseError);
  });

  it('surfaces JudgeParseError when criteria field is absent', async () => {
    const adapter = new FixedAdapter(JSON.stringify({ overall: 4 }));
    await expect(judge(sampleCase, 'x', adapter)).rejects.toBeInstanceOf(JudgeParseError);
  });

  it('computes a weighted overall score', () => {
    // weights: fidelity=2, lands-for-target=1 → (4*2 + 2*1) / 3 = 10/3
    const weighted: GoldenCase = {
      ...sampleCase,
      rubric: [
        { name: 'fidelity', description: 'f', weight: 2 },
        { name: 'lands-for-target', description: 'l' },
      ],
    };
    const overall = weightedOverall(weighted, [
      { name: 'fidelity', score: 4, reasoning: '' },
      { name: 'lands-for-target', score: 2, reasoning: '' },
    ]);
    expect(overall).toBeCloseTo(10 / 3);
  });

  it('forces temperature 0 on the adapter call', async () => {
    const adapter = new FixedAdapter(
      JSON.stringify({ criteria: [{ name: 'fidelity', score: 3, reasoning: 'ok' }] }),
    );
    await judge(sampleCase, 'x', adapter);
    expect(adapter.lastOptions?.temperature).toBe(0);
  });
});
