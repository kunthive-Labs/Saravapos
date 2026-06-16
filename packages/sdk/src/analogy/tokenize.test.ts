import { describe, expect, it } from 'vitest';
import { tokenize } from './tokenize.js';

describe('tokenize', () => {
  it('lowercases and splits on punctuation and whitespace', () => {
    expect(tokenize('Pawn, advantage!')).toEqual(['pawn', 'advantage']);
  });

  it('drops stopwords and tokens shorter than three characters', () => {
    expect(tokenize('I am in the')).toEqual([]);
    expect(tokenize('go to it')).toEqual([]); // "go"/"to"/"it" all dropped
  });

  it('collapses regular plurals onto their singular stem', () => {
    expect(tokenize('advantage advantages')).toEqual(['advantage', 'advantage']);
  });

  it('stems -ing and -ed inflections', () => {
    expect(tokenize('sacrificed')).toEqual(['sacrific']);
    expect(tokenize('sacrificing')).toEqual(['sacrific']);
  });

  it('does not strip the final s from -ss words', () => {
    expect(tokenize('loss progress')).toEqual(['loss', 'progress']);
  });

  it('does not over-stem when the remaining stem would be too short', () => {
    expect(tokenize('sing')).toEqual(['sing']); // -ing strip would leave "s"
    expect(tokenize('tied')).toEqual(['tied']); // -ed strip would leave "ti"
  });

  it('keeps digits and splits on hyphens and apostrophes', () => {
    expect(tokenize('formula-one')).toEqual(['formula', 'one']);
    expect(tokenize('grid123')).toEqual(['grid123']);
    expect(tokenize("player's move")).toEqual(['player', 'move']);
  });

  it('is deterministic across repeated calls', () => {
    const input = 'Controlling the undercut window for positional advantage';
    expect(tokenize(input)).toEqual(tokenize(input));
  });

  it('returns an empty array for empty or whitespace-only input', () => {
    expect(tokenize('')).toEqual([]);
    expect(tokenize('   \n\t ')).toEqual([]);
  });
});
