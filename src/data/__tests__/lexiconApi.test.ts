import { describe, expect, it } from 'vitest';
import { getLexiconEntry, getLexiconMap, loadAllLexicon, loadStageLexicon } from '../lexicon/index';

describe('Stage-agnostic lexicon API', () => {
  it('getLexiconMap covers every entry from loadAllLexicon', async () => {
    const all = await loadAllLexicon();
    const map = await getLexiconMap();
    expect(map.size).toBe(all.length);
  });

  it('contains A1 entries such as noun:arm', async () => {
    const map = await getLexiconMap();
    expect(map.has('noun:arm')).toBe(true);
    expect((await getLexiconEntry('noun:arm'))?.id).toBe('noun:arm');
  });

  it('has no duplicate ids across stages', async () => {
    const all = await loadAllLexicon();
    expect(new Set(all.map((e) => e.id)).size).toBe(all.length);
  });

  it('loadStageLexicon(A2) resolves to an array', async () => {
    expect(Array.isArray(await loadStageLexicon('A2'))).toBe(true);
  });
});
