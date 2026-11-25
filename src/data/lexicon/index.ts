import type { CefrStage, LexiconEntry } from '../../types/index';

let cachedA1: LexiconEntry[] | null = null;
let cachedA2: LexiconEntry[] | null = null;
let cachedAll: LexiconEntry[] | null = null;
let cachedA1Map: Map<string, LexiconEntry> | null = null;
let cachedAllMap: Map<string, LexiconEntry> | null = null;

export async function loadStageLexicon(stage: CefrStage): Promise<LexiconEntry[]> {
  if (stage === 'A1') {
    if (!cachedA1) {
      const mod = await import('./stage-a1');
      cachedA1 = mod.STAGE_A1_LEXICON;
    }
    return cachedA1;
  }
  if (stage === 'A2') {
    if (!cachedA2) {
      const mod = await import('./stage-a2');
      cachedA2 = mod.STAGE_A2_LEXICON;
    }
    return cachedA2;
  }
  return [];
}

export async function loadAllLexicon(): Promise<LexiconEntry[]> {
  if (!cachedAll) {
    const [a1, a2] = await Promise.all([loadStageLexicon('A1'), loadStageLexicon('A2')]);
    cachedAll = [...a1, ...a2];
  }
  return cachedAll;
}

export function buildLexiconMap(entries: LexiconEntry[]): Map<string, LexiconEntry> {
  const map = new Map<string, LexiconEntry>();
  for (const entry of entries) {
    map.set(entry.id, entry);
  }
  return map;
}

export async function getLexiconMap(): Promise<Map<string, LexiconEntry>> {
  if (!cachedAllMap) {
    cachedAllMap = buildLexiconMap(await loadAllLexicon());
  }
  return cachedAllMap;
}

export async function getLexiconEntry(id: string): Promise<LexiconEntry | undefined> {
  const map = await getLexiconMap();
  return map.get(id);
}

export async function getA1LexiconMap(): Promise<Map<string, LexiconEntry>> {
  if (!cachedA1Map) {
    const entries = await loadStageLexicon('A1');
    cachedA1Map = buildLexiconMap(entries);
  }
  return cachedA1Map;
}

export async function getA1LexiconEntry(id: string): Promise<LexiconEntry | undefined> {
  const map = await getA1LexiconMap();
  return map.get(id);
}
