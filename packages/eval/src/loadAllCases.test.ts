import { mkdtemp, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { loadAllCases } from './loadCase.js';

const caseYaml = (id: string) => `
id: ${id}
from: profiles/a.yaml
to: profiles/b.yaml
input: hello
rubric:
  - name: fidelity
    description: Preserves meaning.
`;

let dir: string;

beforeAll(async () => {
  dir = await mkdtemp(join(tmpdir(), 'saravapos-eval-'));
  // Write filenames whose lexical order differs from id order.
  await writeFile(join(dir, 'zzz.yaml'), caseYaml('alpha'));
  await writeFile(join(dir, 'aaa.yaml'), caseYaml('zeta'));
  await writeFile(join(dir, 'notes.txt'), 'ignored');
});

afterAll(async () => {
  await rm(dir, { recursive: true, force: true });
});

describe('loadAllCases', () => {
  it('returns cases sorted by id, ignoring non-yaml files', async () => {
    const cases = await loadAllCases(dir);
    expect(cases.map((c) => c.id)).toEqual(['alpha', 'zeta']);
  });
});
