import { describe, expect, it, vi } from 'vitest';
import { runDoctor } from './doctor.js';

describe('runDoctor', () => {
  it('passes for a supported runtime, stable release, and configured Anthropic key', async () => {
    const checks = await runDoctor({
      version: '0.1.0',
      provider: 'anthropic',
      nodeVersion: '20.18.0',
      env: { ANTHROPIC_API_KEY: 'configured' },
    });

    expect(checks).toEqual([
      { name: 'Node.js', status: 'pass', detail: 'v20.18.0 (requires >=20)' },
      { name: 'CLI release', status: 'pass', detail: 'v0.1.0' },
      { name: 'Anthropic', status: 'pass', detail: 'ANTHROPIC_API_KEY is set' },
    ]);
  });

  it('reports unsupported runtimes, prereleases, and missing keys', async () => {
    const checks = await runDoctor({
      version: '0.1.0-alpha.0',
      provider: 'openai',
      nodeVersion: '18.20.0',
      env: {},
    });

    expect(checks.every((check) => check.status === 'fail')).toBe(true);
    expect(checks[2]?.detail).toBe('OPENAI_API_KEY is missing');
  });

  it('probes the configured Ollama host', async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(new Response('{}', { status: 200 }));

    const checks = await runDoctor({
      version: '0.1.0',
      provider: 'ollama',
      nodeVersion: '22.0.0',
      env: { OLLAMA_HOST: 'http://ollama.test/' },
      fetch: fetchMock,
    });

    expect(fetchMock).toHaveBeenCalledWith(
      'http://ollama.test/api/tags',
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    );
    expect(checks[2]).toEqual({
      name: 'Ollama',
      status: 'pass',
      detail: 'reachable at http://ollama.test/',
    });
  });

  it('reports an unreachable Ollama host without throwing', async () => {
    const fetchMock = vi.fn<typeof fetch>().mockRejectedValue(new Error('connection refused'));

    const checks = await runDoctor({
      version: '0.1.0',
      provider: 'ollama',
      nodeVersion: '22.0.0',
      env: {},
      fetch: fetchMock,
    });

    expect(checks[2]).toEqual({
      name: 'Ollama',
      status: 'fail',
      detail: 'unreachable at http://127.0.0.1:11434',
    });
  });

  it('rejects unknown provider names', async () => {
    const checks = await runDoctor({
      version: '0.1.0',
      provider: 'unknown',
      nodeVersion: '22.0.0',
      env: {},
    });

    expect(checks[2]).toEqual({
      name: 'Provider',
      status: 'fail',
      detail: 'unsupported provider "unknown"',
    });
  });
});
