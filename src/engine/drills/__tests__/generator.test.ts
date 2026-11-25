import { describe, expect, it } from 'vitest';
import type { LexiconEntry } from '../../../types/index.ts';
import { loadAllLexicon } from '../../../data/lexicon/index.ts';
import { inflectAdj } from '../../morphology/inflector.ts';
import { filterLexiconByStage, generateMorphologyDrills, selectCuratedByStage, selectDrillPool } from '../generator.ts';

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
    // indeclinable "bra" (all forms identical) is a trivial drill and is skipped
    const drills = generateMorphologyDrills('adjectives', SAMPLE_LEXICON, 3, 21);
    expect(drills).toHaveLength(2);
    for (const ex of drills) {
      expect(ex.type).toBe('morph-fill');
      if (ex.type === 'morph-fill') {
        expect(ex.accepted[0].length).toBeGreaterThan(0);
      }
    }
  });

  it('still drills the neuter slot of -t adjectives whose neuter equals common (kort)', () => {
    const kort: LexiconEntry = {
      id: 'adj:kort', lemma: 'kort', en: 'short', pos: 'adj', unitId: 'u13', stage: 'A1',
      morph: { pos: 'adj', forms: { common: 'kort', neuter: 'kort', plDef: 'korta' } },
    };
    const neuterSeen = new Set<string>();
    for (let seed = 1; seed <= 30; seed++) {
      const drills = generateMorphologyDrills('adjectives', [kort], 1, seed);
      expect(drills).toHaveLength(1);
      const ex = drills[0];
      if (ex.type === 'morph-fill') neuterSeen.add(ex.id.includes('-neuter-') ? 'neuter' : 'plDef');
    }
    expect(neuterSeen.has('neuter')).toBe(true);
    expect(neuterSeen.has('plDef')).toBe(true);
  });

  it('verbs category skips rare-forms verbs such as töras', () => {
    const toras: LexiconEntry = {
      id: 'verb:töras', lemma: 'töras', en: 'dare', pos: 'verb', unitId: 'u24', stage: 'A2',
      tags: ['deponent', 'rare-forms'],
      morph: { pos: 'verb', group: 'irreg', deponent: true, forms: { inf: 'töras', imp: 'törs', pres: 'törs', past: 'tordes', supine: 'torts' } },
    };
    expect(generateMorphologyDrills('verbs', [toras], 5, 1)).toEqual([]);
  });

  it('selectCuratedByStage restricts to the stage and falls back when too small', () => {
    const stages = { u01: 'A1', u02: 'A1', u14: 'A2' } as const;
    const exs = [
      { unitId: 'u01', id: 'a' }, { unitId: 'u02', id: 'b' }, { unitId: 'u14', id: 'c' },
    ];
    expect(selectCuratedByStage(exs, stages, 'A1', 2).map((e) => e.id)).toEqual(['a', 'b']);
    expect(selectCuratedByStage(exs, stages, 'A2', 2)).toBe(exs);
    expect(selectCuratedByStage(exs, stages, 'all', 2)).toBe(exs);
  });

  it('never generates imperative drills with placeholder dashes for modal verbs', () => {
    const modalLexicon: LexiconEntry[] = [
      {
        id: 'verb:kunna',
        lemma: 'kunna',
        en: 'can',
        pos: 'verb',
        unitId: 'u11',
        stage: 'A1',
        tags: ['modal'],
        morph: {
          pos: 'verb',
          group: 'irreg',
          forms: { inf: 'kunna', imp: '—', pres: 'kan', past: 'kunde', supine: 'kunnat' },
        },
      },
      {
        id: 'verb:måste',
        lemma: 'måste',
        en: 'must',
        pos: 'verb',
        unitId: 'u11',
        stage: 'A1',
        tags: ['modal'],
        morph: {
          pos: 'verb',
          group: 'irreg',
          forms: { inf: 'måste', imp: '—', pres: 'måste', past: 'måste', supine: 'måst' },
        },
      },
    ];

    for (let seed = 1; seed <= 30; seed++) {
      const drills = generateMorphologyDrills('verbs', modalLexicon, 10, seed);
      expect(drills.length).toBeGreaterThan(0);
      for (const ex of drills) {
        expect(ex.type).toBe('morph-fill');
        if (ex.type === 'morph-fill') {
          expect(ex.accepted[0]).not.toMatch(/^[—-]+$/);
          expect(ex.prompt.toLowerCase()).not.toContain('imperative');
        }
      }
    }
  });
});

describe('A2 drills: comparison, passive, stage filter', () => {
  const adjEntry = (
    lemma: string,
    forms: Record<string, string>,
    extra: Partial<LexiconEntry> = {},
    indeclinable = false
  ): LexiconEntry => ({
    id: `adj:${lemma}`,
    lemma,
    en: lemma,
    pos: 'adj',
    unitId: 'u17',
    stage: 'A2',
    morph: { pos: 'adj', ...(indeclinable ? { indeclinable: true } : {}), forms: { common: lemma, ...forms } },
    ...extra,
  });

  const adjPool: LexiconEntry[] = [
    adjEntry('stor', { neuter: 'stort', plDef: 'stora', comp: 'större', sup: 'störst' }),
    adjEntry('tung', { neuter: 'tungt', plDef: 'tunga', comp: 'tyngre', sup: 'tyngst' }),
    adjEntry('dålig', { neuter: 'dåligt', plDef: 'dåliga', comp: 'sämre', sup: 'sämst' }),
    adjEntry('bättre', { neuter: 'bättre', plDef: 'bättre' }, { tags: ['comparative'] }, true),
    adjEntry('intressant', { neuter: 'intressant', plDef: 'intressanta' }, { tags: ['mer-mest'] }),
  ];

  it('comparison yields comp/sup morph-fill, never from degenerate or mer-mest entries', () => {
    const drills = generateMorphologyDrills('comparison', adjPool, 5, 1);
    expect(drills).toHaveLength(5);
    for (const ex of drills) {
      expect(ex.type).toBe('morph-fill');
      if (ex.type !== 'morph-fill') continue;
      const entry = adjPool.find((e) => ex.id.includes(e.id))!;
      const f = inflectAdj(entry);
      expect([f.comp, f.sup]).toContain(ex.accepted[0]);
      expect(ex.accepted[0]).toBeTruthy();
      expect(ex.accepted[0]).not.toBe(entry.lemma);
      expect(['adj:bättre', 'adj:intressant']).not.toContain(entry.id);
    }
  });

  it('passive yields -s forms of deponents/passives only', () => {
    const verb = (lemma: string, tags: string[], forms: Record<string, string>, deponent = true): LexiconEntry => ({
      id: `verb:${lemma}`, lemma, en: lemma, pos: 'verb', unitId: 'u24', stage: 'A2', tags,
      morph: { pos: 'verb', group: '1', ...(deponent ? { deponent: true } : {}), forms },
    });
    const pool: LexiconEntry[] = [
      verb('hoppas', ['deponent'], { inf: 'hoppas', imp: 'hoppas', pres: 'hoppas', past: 'hoppades', supine: 'hoppats' }),
      verb('byggas', ['passive'], { inf: 'byggas', imp: 'byggs', pres: 'byggs', past: 'byggdes', supine: 'byggts' }, false),
      verb('töras', ['deponent', 'rare-forms'], { inf: 'töras', imp: 'törs', pres: 'törs', past: 'tordes', supine: 'torts' }),
      verb('tala', [], { inf: 'tala', imp: 'tala', pres: 'talar', past: 'talade', supine: 'talat' }, false),
    ];
    const drills = generateMorphologyDrills('passive', pool, 2, 3);
    expect(drills.length).toBe(2);
    for (const ex of drills) {
      expect(ex.type).toBe('morph-fill');
      if (ex.type !== 'morph-fill') continue;
      expect(ex.accepted[0]).toMatch(/s$/);
      expect(ex.accepted[0]).not.toBe(ex.baseForm);
      expect(ex.id).not.toContain('töras');
      expect(ex.id).not.toContain('tala');
      expect(ex.prompt.toLowerCase()).not.toContain('imperative');
    }
  });

  it('verbs category never drills imperative or trivial slots of -s verbs', () => {
    const pool: LexiconEntry[] = [
      { id: 'verb:hoppas', lemma: 'hoppas', en: 'hope', pos: 'verb', unitId: 'u24', stage: 'A2',
        morph: { pos: 'verb', group: '1', deponent: true, forms: { inf: 'hoppas', imp: 'hoppas', pres: 'hoppas', past: 'hoppades', supine: 'hoppats' } } },
    ];
    for (let seed = 1; seed <= 20; seed++) {
      for (const ex of generateMorphologyDrills('verbs', pool, 3, seed)) {
        if (ex.type !== 'morph-fill') continue;
        expect(ex.prompt.toLowerCase()).not.toContain('imperative');
        expect(ex.accepted[0]).not.toBe(ex.baseForm);
      }
    }
  });

  it('filterLexiconByStage filters and passes through', () => {
    const mixed = [...SAMPLE_LEXICON, ...adjPool];
    const a2 = filterLexiconByStage(mixed, 'A2');
    expect(a2.length).toBe(adjPool.length);
    expect(a2.every((e) => e.stage === 'A2')).toBe(true);
    expect(filterLexiconByStage(mixed, 'A1').every((e) => e.stage === 'A1')).toBe(true);
    expect(filterLexiconByStage(mixed, 'all')).toHaveLength(mixed.length);
  });

  it('selectDrillPool falls back to the full pool when the filtered pool is too small', () => {
    const mixed = [...SAMPLE_LEXICON, ...adjPool];
    expect(selectDrillPool(mixed, 'A2', 'plurals', 5)).toBe(mixed);
    expect(selectDrillPool(mixed, 'B2', 'plurals', 5)).toBe(mixed);
    expect(selectDrillPool(mixed, 'A2', 'comparison', 5)).toEqual(filterLexiconByStage(mixed, 'A2'));
    expect(selectDrillPool(mixed, 'all', 'plurals', 5)).toBe(mixed);
  });

  it('empty lexicon still yields nothing', () => {
    expect(generateMorphologyDrills('verbs', [], 5)).toEqual([]);
    expect(generateMorphologyDrills('comparison', [], 5)).toEqual([]);
    expect(generateMorphologyDrills('passive', [], 5)).toEqual([]);
  });

  it('new and adjective categories on the real lexicon are full, unique and non-trivial', async () => {
    const all = await loadAllLexicon();
    for (const category of ['comparison', 'passive', 'adjectives', 'verbs'] as const) {
      const drills = generateMorphologyDrills(category, all, 10, 42);
      expect(drills).toHaveLength(10);
      const keys = new Set<string>();
      for (const ex of drills) {
        expect(ex.type).toBe('morph-fill');
        if (ex.type !== 'morph-fill') continue;
        keys.add(`${ex.prompt}|${ex.baseForm}`);
        expect(ex.accepted[0]).toBeTruthy();
        // -t adjectives such as kort legitimately drill "neuter = common"
        if (category !== 'adjectives') expect(ex.accepted[0]).not.toBe(ex.baseForm);
        expect(ex.accepted[0]).not.toMatch(/^[—-]+$/);
      }
      expect(keys.size).toBe(10);
    }
    for (let seed = 1; seed <= 15; seed++) {
      for (const ex of generateMorphologyDrills('adjectives', all, 20, seed)) {
        if (ex.type === 'morph-fill') expect(ex.accepted[0]).toBeTruthy();
      }
    }
  });
});
