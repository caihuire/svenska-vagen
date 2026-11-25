import { describe, expect, it } from 'vitest';
import { CURRICULUM_MANIFEST } from '../curriculum/manifest';
import { isUnitLoadable, loadUnit } from '../curriculum/loader';
import { getLexiconMap, loadStageLexicon } from '../lexicon/index';
import { inflectAdj, inflectNoun, inflectVerb } from '../../engine/morphology/inflector';
import { extractSentences, parseCulturalMarkup } from '../../engine/reader/parser';
import type { Exercise, LexiconEntry, UnitContent } from '../../types/index';

describe('Content Integrity Gate', () => {
  it('defines all 51 units numbered 1..51 across A1, A2, B1, and B2', () => {
    expect(CURRICULUM_MANIFEST).toHaveLength(51);

    const expectedIds = Array.from({ length: 51 }, (_, i) => `u${String(i + 1).padStart(2, '0')}`);
    expect(CURRICULUM_MANIFEST.map((u) => u.id)).toEqual(expectedIds);
    expect(CURRICULUM_MANIFEST.map((u) => u.number)).toEqual(
      Array.from({ length: 51 }, (_, i) => i + 1),
    );

    const a1 = CURRICULUM_MANIFEST.filter((u) => u.stage === 'A1');
    const a2 = CURRICULUM_MANIFEST.filter((u) => u.stage === 'A2');
    const b1 = CURRICULUM_MANIFEST.filter((u) => u.stage === 'B1');
    const b2 = CURRICULUM_MANIFEST.filter((u) => u.stage === 'B2');

    expect(a1).toHaveLength(13);
    expect(a2).toHaveLength(12);
    expect(b1).toHaveLength(13);
    expect(b2).toHaveLength(13);

    for (const unit of a1) {
      expect(unit.available).toBe(true);
      expect(isUnitLoadable(unit.id)).toBe(true);
    }
    for (const unit of CURRICULUM_MANIFEST) {
      expect(unit.available).toBe(isUnitLoadable(unit.id));
    }
    for (const unit of CURRICULUM_MANIFEST) {
      expect(unit.title.trim().length).toBeGreaterThan(0);
      expect(unit.grammarFocus.trim().length).toBeGreaterThan(0);
      expect(unit.culturalTheme?.trim().length).toBeGreaterThan(0);
    }
  });

  it('loads Stage A1 lexicon with >= 325 unique entries and no duplicate IDs', async () => {
    const a1 = await loadStageLexicon('A1');
    const map = await getLexiconMap();

    expect(a1.length).toBeGreaterThanOrEqual(325);
    expect(a1).toHaveLength(389);
    expect(map.has('noun:arm')).toBe(true);

    expect(await loadStageLexicon('B1')).toEqual([]);
    expect(await loadStageLexicon('B2')).toEqual([]);

    const seenIds = new Set<string>();
    for (const entry of a1) {
      expect(seenIds.has(entry.id)).toBe(false);
      seenIds.add(entry.id);
      expect(entry.lemma.trim().length).toBeGreaterThan(0);
      expect(entry.en.trim().length).toBeGreaterThan(0);
      expect(entry.stage).toBe('A1');
      expect(entry.example?.sv.trim().length).toBeGreaterThan(0);
      expect(entry.example?.en.trim().length).toBeGreaterThan(0);
    }
  });

  const assertInflectable = (entries: LexiconEntry[]): void => {
    for (const entry of entries) {
      if (entry.pos === 'noun') {
        expect(entry.morph?.pos).toBe('noun');
        if (entry.morph?.pos === 'noun') {
          if (entry.morph.declension === 'irreg' || entry.morph.declension === 'pl') {
            expect(entry.morph.forms?.indefSg).toBeTruthy();
            expect(entry.morph.forms?.defSg).toBeTruthy();
            expect(entry.morph.forms?.indefPl).toBeTruthy();
            expect(entry.morph.forms?.defPl).toBeTruthy();
          }
          const inflected = inflectNoun(entry);
          expect(inflected.indefSg.length).toBeGreaterThan(0);
          expect(inflected.defSg.length).toBeGreaterThan(0);
          if (entry.morph.declension !== 'uncount') {
            expect(inflected.indefPl.length).toBeGreaterThan(0);
            expect(inflected.defPl.length).toBeGreaterThan(0);
          }
        }
      } else if (entry.pos === 'verb') {
        expect(entry.morph?.pos).toBe('verb');
        if (entry.morph?.pos === 'verb') {
          if (entry.morph.group === '4' || entry.morph.group === 'irreg' || entry.morph.deponent) {
            expect(entry.morph.forms?.inf).toBeTruthy();
            expect(entry.morph.forms?.imp).toBeTruthy();
            expect(entry.morph.forms?.pres).toBeTruthy();
            expect(entry.morph.forms?.past).toBeTruthy();
            expect(entry.morph.forms?.supine).toBeTruthy();
          }
          const inflected = inflectVerb(entry);
          expect(inflected.inf.length).toBeGreaterThan(0);
          expect(inflected.imp.length).toBeGreaterThan(0);
          expect(inflected.pres.length).toBeGreaterThan(0);
          expect(inflected.past.length).toBeGreaterThan(0);
          expect(inflected.supine.length).toBeGreaterThan(0);
        }
      } else if (entry.pos === 'adj') {
        expect(entry.morph?.pos).toBe('adj');
        const inflected = inflectAdj(entry);
        expect(inflected.common.length).toBeGreaterThan(0);
        expect(inflected.neuter.length).toBeGreaterThan(0);
        expect(inflected.plDef.length).toBeGreaterThan(0);
        // suppletive/regular comparison forms, when declared, must be real and differ from common
        if (entry.morph?.pos === 'adj') {
          const f = entry.morph.forms;
          if (f && (f.comp !== undefined || f.sup !== undefined)) {
            expect(typeof f.comp === 'string' && f.comp.trim().length > 0).toBe(true);
            expect(typeof f.sup === 'string' && f.sup.trim().length > 0).toBe(true);
            expect(f.comp).not.toBe(inflected.common);
            expect(f.sup).not.toBe(inflected.common);
          }
        }
      }
    }
  };

  it('provides explicit forms overrides and valid non-empty inflections for all Stage A1 nouns, verbs, and adjectives', async () => {
    const entries: LexiconEntry[] = await loadStageLexicon('A1');
    expect(entries.length).toBeGreaterThan(0);
    assertInflectable(entries);
  });

  it('Stage A2 lexicon has unique, well-formed entries', async () => {
    const a2: LexiconEntry[] = await loadStageLexicon('A2');
    expect(a2.length).toBeGreaterThan(0);

    const a1Ids = new Set((await loadStageLexicon('A1')).map((e) => e.id));
    const a2UnitIds = new Set(Array.from({ length: 12 }, (_, i) => `u${i + 14}`));
    const seenIds = new Set<string>();
    for (const entry of a2) {
      expect(seenIds.has(entry.id)).toBe(false);
      seenIds.add(entry.id);
      expect(a1Ids.has(entry.id)).toBe(false);
      expect(entry.id).toBe(`${entry.pos}:${entry.lemma}`);
      expect(entry.stage).toBe('A2');
      expect(a2UnitIds.has(entry.unitId)).toBe(true);
      expect(entry.example?.sv.trim().length).toBeGreaterThan(0);
      expect(entry.example?.en.trim().length).toBeGreaterThan(0);
      expect(entry.ipa?.trim().length).toBeGreaterThan(0);
    }
    assertInflectable(a2);
  });

  it('A2 lexicon totals', async () => {
    const a2 = await loadStageLexicon('A2');
    expect(a2.length).toBeGreaterThanOrEqual(330);
    expect(a2.length).toBeLessThanOrEqual(400);
    expect(a2).toHaveLength(379);

    const a2Units = CURRICULUM_MANIFEST.filter((u) => u.stage === 'A2');
    expect(a2Units).toHaveLength(12);
    expect(a2Units.map((u) => u.id)).toEqual(Array.from({ length: 12 }, (_, i) => `u${i + 14}`));
    for (const unit of a2Units) {
      expect(unit.available).toBe(true);
      expect(isUnitLoadable(unit.id)).toBe(true);
    }
  });

  it('no available unit has literal [surface|lexId] token markup in exercise text fields', async () => {
    const markupRe = /\[[^\]|]+\|[^\]]+\]/;
    const fields = ['target', 'prompt', 'sentence', 'explanation', 'ttsText', 'fallbackText', 'audioText', 'options', 'chunks', 'tokens'];
    const offenders: string[] = [];
    for (const summary of CURRICULUM_MANIFEST.filter((u) => isUnitLoadable(u.id))) {
      const unit: UnitContent = await loadUnit(summary.id);
      const all: Exercise[] = [...unit.exercises, ...unit.culturalText.comprehension];
      for (const ex of all) {
        const record = ex as unknown as Record<string, unknown>;
        for (const field of fields) {
          const value = record[field];
          if (value === undefined) continue;
          const text = Array.isArray(value) ? value.join(' ') : String(value);
          if (markupRe.test(text)) offenders.push(`${ex.id}.${field}`);
        }
      }
    }
    expect(offenders).toEqual([]);
  });

  it('loads all available units across the whole curriculum with valid thresholds, unique exercise IDs, and resolvable lexicon & markup references', async () => {
    const lexMap = await getLexiconMap();
    const availableUnits = CURRICULUM_MANIFEST.filter((u) => isUnitLoadable(u.id));
    expect(availableUnits.length).toBeGreaterThanOrEqual(13);

    const seenExerciseIds = new Set<string>();

    const checkExercise = (ex: Exercise, expectedUnitId: string) => {
      expect(seenExerciseIds.has(ex.id)).toBe(false);
      seenExerciseIds.add(ex.id);
      expect(ex.unitId).toBe(expectedUnitId);
      expect(ex.prompt.trim().length).toBeGreaterThan(0);
      expect(ex.explanation.trim().length).toBeGreaterThan(0);
      expect(ex.grammarTag.trim().length).toBeGreaterThan(0);

      switch (ex.type) {
        case 'classifier':
          expect(ex.options.length).toBeGreaterThanOrEqual(2);
          expect(ex.options).toContain(ex.correctOption);
          break;
        case 'morph-fill':
          expect(ex.accepted.length).toBeGreaterThan(0);
          break;
        case 'word-order':
          expect(ex.chunks.length).toBeGreaterThanOrEqual(3);
          expect([...ex.chunks].sort()).toEqual([...ex.correctOrder].sort());
          for (const order of ex.acceptedOrders ?? []) {
            expect([...order].sort(), `${ex.id} acceptedOrders must permute chunks`).toEqual(
              [...ex.chunks].sort()
            );
          }
          break;
        case 'cloze':
          expect(ex.accepted.length).toBeGreaterThan(0);
          expect(ex.sentence).toContain('___');
          if (ex.mode === 'choice') {
            expect(ex.options).toBeDefined();
            expect(ex.options).toContain(ex.accepted[0]);
          }
          break;
        case 'error-spotting':
          expect(ex.errorIndex).toBeGreaterThanOrEqual(0);
          expect(ex.errorIndex).toBeLessThan(ex.tokens.length);
          expect(ex.options).toContain(ex.correctCorrection);
          break;
        case 'listening':
          expect(ex.audioText.trim().length).toBeGreaterThan(0);
          expect(ex.fallbackText.trim().length).toBeGreaterThan(0);
          expect(ex.options).toContain(ex.correctOption);
          break;
      }
    };

    for (const summary of availableUnits) {
      const unit: UnitContent = await loadUnit(summary.id);
      expect(unit.id).toBe(summary.id);
      expect(unit.number).toBe(summary.number);
      expect(unit.stage).toBe(summary.stage);
      expect(unit.title).toBe(summary.title);
      expect(unit.culturalTheme).toBe(summary.culturalTheme);
      expect(unit.available).toBe(true);

      expect(unit.grammarCards.length).toBeGreaterThanOrEqual(3);
      expect(unit.grammarCards.length).toBeLessThanOrEqual(4);
      expect(unit.lexiconIds.length).toBeGreaterThanOrEqual(15);
      expect(unit.exercises.length).toBeGreaterThanOrEqual(10);
      expect(unit.culturalText.comprehension.length).toBeGreaterThanOrEqual(2);
      expect(unit.culturalText.title.trim().length).toBeGreaterThan(0);
      expect(unit.culturalText.englishSummary.trim().length).toBeGreaterThan(0);

      for (const lexId of unit.lexiconIds) {
        expect(lexMap.has(lexId)).toBe(true);
      }

      for (const ex of unit.exercises) {
        checkExercise(ex, unit.id);
      }
      for (const comp of unit.culturalText.comprehension) {
        checkExercise(comp, unit.id);
      }

      const paragraphs = parseCulturalMarkup(unit.culturalText.markup);
      expect(paragraphs.length).toBeGreaterThan(0);
      for (const paragraph of paragraphs) {
        expect(paragraph.length).toBeGreaterThan(0);
        for (const token of paragraph) {
          if (token.lexId) {
            expect(lexMap.has(token.lexId)).toBe(true);
          }
        }
      }

      const sentences = extractSentences(unit.culturalText.markup);
      expect(sentences.length).toBeGreaterThanOrEqual(2);
      for (const s of sentences) {
        expect(s.trim().length).toBeGreaterThan(0);
        expect(s).not.toContain('[');
        expect(s).not.toContain(']');
      }
    }
  });
});
