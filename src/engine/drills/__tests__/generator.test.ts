import { describe, expect, it } from 'vitest';
import type { LexiconEntry } from '../../../types/index.ts';
import { generateMorphologyDrills } from '../generator.ts';

const SAMPLE_LEXICON: LexiconEntry[] = [
  {
    id: 'noun:flicka',
    lemma: 'flicka',
    en: 'girl',
    pos: 'noun',
    unitId: 'u03',
    stage: 'A1',
    morph: { pos: 'noun', gender: 'en', declension: 1 },
  },
  {
    id: 'noun:bil',
    lemma: 'bil',
    en: 'car',
    pos: 'noun',
    unitId: 'u03',
    stage: 'A1',
    morph: { pos: 'noun', gender: 'en', declension: 2 },
  },
  {
    id: 'noun:hus',
    lemma: 'hus',
    en: 'house',
    pos: 'noun',
    unitId: 'u03',
    stage: 'A1',
    morph: { pos: 'noun', gender: 'ett', declension: 6 },
  },
  {
    id: 'noun:äpple',
    lemma: 'äpple',
    en: 'apple',
    pos: 'noun',
    unitId: 'u03',
    stage: 'A1',
    morph: { pos: 'noun', gender: 'ett', declension: 5 },
  },
  {
    id: 'noun:mjölk',
    lemma: 'mjölk',
    en: 'milk',
    pos: 'noun',
    unitId: 'u03',
    stage: 'A1',
    morph: { pos: 'noun', gender: 'en', declension: 'uncount' },
  },
  {
    id: 'verb:arbeta',
    lemma: 'arbeta',
    en: 'work',
    pos: 'verb',
    unitId: 'u04',
    stage: 'A1',
    morph: { pos: 'verb', group: '1' },
  },
  {
    id: 'verb:köra',
    lemma: 'köra',
    en: 'drive',
    pos: 'verb',
    unitId: 'u04',
    stage: 'A1',
    morph: { pos: 'verb', group: '2a' },
  },
  {
    id: 'verb:köpa',
    lemma: 'köpa',
    en: 'buy',
    pos: 'verb',
    unitId: 'u04',
    stage: 'A1',
    morph: { pos: 'verb', group: '2b' },
  },
  {
    id: 'adj:stor',
    lemma: 'stor',
    en: 'big',
    pos: 'adj',
    unitId: 'u13',
    stage: 'A1',
    morph: { pos: 'adj' },
  },
  {
    id: 'adj:röd',
    lemma: 'röd',
    en: 'red',
    pos: 'adj',
    unitId: 'u13',
    stage: 'A1',
    morph: { pos: 'adj' },
  },
  {
    id: 'adj:bra',
    lemma: 'bra',
    en: 'good',
    pos: 'adj',
    unitId: 'u13',
    stage: 'A1',
    morph: { pos: 'adj', indeclinable: true },
  },
];

describe('generateMorphologyDrills', () => {
  it('generates gender classifier drills with no duplicate prompts and deterministic seeding', () => {
    const a = generateMorphologyDrills('gender', SAMPLE_LEXICON, 10, 42);
    const b = generateMorphologyDrills('gender', SAMPLE_LEXICON, 10, 42);

    expect(a).toEqual(b);
    expect(a).toHaveLength(5); // 5 singular nouns in SAMPLE_LEXICON
    for (const ex of a) {
      expect(ex.type).toBe('classifier');
      if (ex.type === 'classifier') {
        expect(ex.options).toEqual(['en', 'ett']);
        expect(['en', 'ett']).toContain(ex.correctOption);
      }
    }
    const keys = a.map((e) => (e.type === 'classifier' ? e.target : e.prompt));
    expect(new Set(keys).size).toBe(keys.length);
  });

  it('generates plurals excluding uncountables', () => {
    const drills = generateMorphologyDrills('plurals', SAMPLE_LEXICON, 10, 7);
    expect(drills).toHaveLength(4);
    for (const ex of drills) {
      expect(ex.type).toBe('morph-fill');
      if (ex.type === 'morph-fill') {
        expect(ex.baseForm).not.toContain('mjölk');
        expect(ex.accepted[0].length).toBeGreaterThan(0);
      }
    }
  });

  it('generates definite noun drills', () => {
    const drills = generateMorphologyDrills('definite', SAMPLE_LEXICON, 5, 99);
    expect(drills).toHaveLength(5);
    const prompts = drills.map((d) => d.prompt);
    expect(new Set(prompts).size).toBe(5);
    for (const ex of drills) {
      expect(ex.type).toBe('morph-fill');
      if (ex.type === 'morph-fill') {
        expect(ex.accepted[0].length).toBeGreaterThan(0);
      }
    }
  });

  it('generates verb drills using inflectVerb', () => {
    const drills = generateMorphologyDrills('verbs', SAMPLE_LEXICON, 3, 12);
    expect(drills).toHaveLength(3);
    for (const ex of drills) {
      expect(ex.type).toBe('morph-fill');
      if (ex.type === 'morph-fill') {
        expect(ex.accepted[0].length).toBeGreaterThan(0);
      }
    }
  });

  it('generates adjective agreement drills using inflectAdj', () => {
    const drills = generateMorphologyDrills('adjectives', SAMPLE_LEXICON, 3, 21);
    expect(drills).toHaveLength(3);
    for (const ex of drills) {
      expect(ex.type).toBe('morph-fill');
      if (ex.type === 'morph-fill') {
        expect(ex.accepted[0].length).toBeGreaterThan(0);
      }
    }
  });
});
