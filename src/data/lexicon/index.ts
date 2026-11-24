import type { CefrStage, LexiconEntry } from '../../types/index';

let cachedA1: LexiconEntry[] | null = null;
let cachedA1Map: Map<string, LexiconEntry> | null = null;

export async function loadStageLexicon(stage: CefrStage): Promise<LexiconEntry[]> {
  if (stage === 'A1') {
    if (!cachedA1) {
      const mod = await import('./stage-a1');
      cachedA1 = mod.STAGE_A1_LEXICON;
    }
    return cachedA1;
  }
  return [];
}

export function buildLexiconMap(entries: LexiconEntry[]): Map<string, LexiconEntry> {
  const map = new Map<string, LexiconEntry>();
  for (const entry of entries) {
    map.set(entry.id, entry);
  }
  return map;
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
