import { describe, expect, it } from 'vitest';
import type { LexiconEntry } from '../../../types/index.ts';
import { inflectAdj, inflectNoun, inflectVerb } from '../inflector.ts';
import { evaluateTypedAnswer } from '../normalizer.ts';

function noun(
  lemma: string,
  gender: 'en' | 'ett',
  declension: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 'irreg' | 'uncount' | 'pl',
  forms?: NonNullable<Extract<LexiconEntry['morph'], { pos: 'noun' }>['forms']>
): LexiconEntry {
  return {
    id: `noun:${lemma}`,
    lemma,
    en: lemma,
    pos: 'noun',
    unitId: 'u01',
    stage: 'A1',
    morph: { pos: 'noun', gender, declension, forms },
  };
}

function verb(
  lemma: string,
  group: '1' | '2a' | '2b' | '3' | '4' | 'irreg',
  opts?: {
    particle?: string;
    deponent?: boolean;
    reflexive?: boolean;
    forms?: NonNullable<Extract<LexiconEntry['morph'], { pos: 'verb' }>['forms']>;
  }
): LexiconEntry {
  return {
    id: `verb:${lemma}`,
    lemma,
    en: lemma,
    pos: 'verb',
    unitId: 'u01',
    stage: 'A1',
    morph: { pos: 'verb', group, ...opts },
  };
}

function adj(
  lemma: string,
  opts?: {
    indeclinable?: boolean;
    forms?: NonNullable<Extract<LexiconEntry['morph'], { pos: 'adj' }>['forms']>;
  }
): LexiconEntry {
  return {
    id: `adj:${lemma}`,
    lemma,
    en: lemma,
    pos: 'adj',
    unitId: 'u01',
    stage: 'A1',
    morph: { pos: 'adj', ...opts },
  };
}

describe('inflectNoun', () => {
  it('handles declension 1 (-or)', () => {
    expect(inflectNoun(noun('flicka', 'en', 1))).toEqual({
      indefSg: 'flicka',
      defSg: 'flickan',
      indefPl: 'flickor',
      defPl: 'flickorna',
    });
  });

  it('handles declension 2 (-ar) regular, -e drop, and -el/-en/-er e-drop', () => {
    expect(inflectNoun(noun('bil', 'en', 2))).toEqual({
      indefSg: 'bil',
      defSg: 'bilen',
      indefPl: 'bilar',
      defPl: 'bilarna',
    });
    expect(inflectNoun(noun('tidning', 'en', 2))).toEqual({
      indefSg: 'tidning',
      defSg: 'tidningen',
      indefPl: 'tidningar',
      defPl: 'tidningarna',
    });
    expect(inflectNoun(noun('pojke', 'en', 2))).toEqual({
      indefSg: 'pojke',
      defSg: 'pojken',
      indefPl: 'pojkar',
      defPl: 'pojkarna',
    });
    expect(inflectNoun(noun('fågel', 'en', 2))).toEqual({
      indefSg: 'fågel',
      defSg: 'fågeln',
      indefPl: 'fåglar',
      defPl: 'fåglarna',
    });
    expect(inflectNoun(noun('vinter', 'en', 2))).toEqual({
      indefSg: 'vinter',
      defSg: 'vintern',
      indefPl: 'vintrar',
      defPl: 'vintrarna',
    });
    // Monosyllabic -en must NOT drop e
    expect(inflectNoun(noun('sten', 'en', 2))).toEqual({
      indefSg: 'sten',
      defSg: 'stenen',
      indefPl: 'stenar',
      defPl: 'stenarna',
    });
  });

  it('handles declension 3 (-er)', () => {
    expect(inflectNoun(noun('park', 'en', 3))).toEqual({
      indefSg: 'park',
      defSg: 'parken',
      indefPl: 'parker',
      defPl: 'parkerna',
    });
    expect(inflectNoun(noun('studie', 'en', 3))).toEqual({
      indefSg: 'studie',
      defSg: 'studien',
      indefPl: 'studier',
      defPl: 'studierna',
    });
    expect(inflectNoun(noun('bageri', 'ett', 3))).toEqual({
      indefSg: 'bageri',
      defSg: 'bageriet',
      indefPl: 'bagerier',
      defPl: 'bagerierna',
    });
  });

  it('handles declension 4 (-r)', () => {
    expect(inflectNoun(noun('ko', 'en', 4))).toEqual({
      indefSg: 'ko',
      defSg: 'kon',
      indefPl: 'kor',
      defPl: 'korna',
    });
  });

  it('handles declension 5 (-n)', () => {
    expect(inflectNoun(noun('äpple', 'ett', 5))).toEqual({
      indefSg: 'äpple',
      defSg: 'äpplet',
      indefPl: 'äpplen',
      defPl: 'äpplena',
    });
  });

  it('handles declension 6 (zero plural), -are, and neuter -el/-en/-er e-drop', () => {
    expect(inflectNoun(noun('hus', 'ett', 6))).toEqual({
      indefSg: 'hus',
      defSg: 'huset',
      indefPl: 'hus',
      defPl: 'husen',
    });
    expect(inflectNoun(noun('lärare', 'en', 6))).toEqual({
      indefSg: 'lärare',
      defSg: 'läraren',
      indefPl: 'lärare',
      defPl: 'lärarna',
    });
    expect(inflectNoun(noun('fönster', 'ett', 6))).toEqual({
      indefSg: 'fönster',
      defSg: 'fönstret',
      indefPl: 'fönster',
      defPl: 'fönstren',
    });
    expect(inflectNoun(noun('exempel', 'ett', 6))).toEqual({
      indefSg: 'exempel',
      defSg: 'exemplet',
      indefPl: 'exempel',
      defPl: 'exemplen',
    });
  });

  it('handles declension 7 (-s)', () => {
    expect(inflectNoun(noun('fan', 'en', 7))).toEqual({
      indefSg: 'fan',
      defSg: 'fanen',
      indefPl: 'fans',
      defPl: 'fansen',
    });
  });

  it('handles uncountable, plural-only, and irregular overrides', () => {
    expect(inflectNoun(noun('mjölk', 'en', 'uncount'))).toEqual({
      indefSg: 'mjölk',
      defSg: 'mjölken',
      indefPl: '',
      defPl: '',
    });
    expect(inflectNoun(noun('pengar', 'en', 'pl'))).toEqual({
      indefSg: '',
      defSg: '',
      indefPl: 'pengar',
      defPl: 'pengarna',
    });
    expect(inflectNoun(noun('kläder', 'en', 'pl'))).toEqual({
      indefSg: '',
      defSg: '',
      indefPl: 'kläder',
      defPl: 'kläderna',
    });
    expect(
      inflectNoun(
        noun('bok', 'en', 'irreg', {
          defSg: 'boken',
          indefPl: 'böcker',
          defPl: 'böckerna',
        })
      )
    ).toEqual({
      indefSg: 'bok',
      defSg: 'boken',
      indefPl: 'böcker',
      defPl: 'böckerna',
    });
  });
});

describe('inflectVerb', () => {
  it('handles group 1', () => {
    expect(inflectVerb(verb('arbeta', '1'))).toMatchObject({
      inf: 'arbeta',
      imp: 'arbeta',
      pres: 'arbetar',
      past: 'arbetade',
      supine: 'arbetat',
    });
  });

  it('handles group 2a including r-stem assimilation and mm/nd stems', () => {
    expect(inflectVerb(verb('ringa', '2a'))).toMatchObject({
      inf: 'ringa',
      imp: 'ring',
      pres: 'ringer',
      past: 'ringde',
      supine: 'ringt',
    });
    expect(inflectVerb(verb('köra', '2a'))).toMatchObject({
      inf: 'köra',
      imp: 'kör',
      pres: 'kör',
      past: 'körde',
      supine: 'kört',
    });
    expect(inflectVerb(verb('glömma', '2a'))).toMatchObject({
      inf: 'glömma',
      imp: 'glöm',
      pres: 'glömmer',
      past: 'glömde',
      supine: 'glömt',
    });
    expect(inflectVerb(verb('vända', '2a'))).toMatchObject({
      inf: 'vända',
      imp: 'vänd',
      pres: 'vänder',
      past: 'vände',
      supine: 'vänt',
    });
  });

  it('handles group 2b including voiceless -t stems', () => {
    expect(inflectVerb(verb('köpa', '2b'))).toMatchObject({
      inf: 'köpa',
      imp: 'köp',
      pres: 'köper',
      past: 'köpte',
      supine: 'köpt',
    });
    expect(inflectVerb(verb('möta', '2b'))).toMatchObject({
      inf: 'möta',
      imp: 'möt',
      pres: 'möter',
      past: 'mötte',
      supine: 'mött',
    });
  });

  it('handles group 3', () => {
    expect(inflectVerb(verb('bo', '3'))).toMatchObject({
      inf: 'bo',
      imp: 'bo',
      pres: 'bor',
      past: 'bodde',
      supine: 'bott',
    });
  });

  it('handles group 4 / irregular overrides, deponent, particle, and reflexive verbs', () => {
    expect(
      inflectVerb(
        verb('dricka', '4', {
          forms: {
            inf: 'dricka',
            imp: 'drick',
            pres: 'dricker',
            past: 'drack',
            supine: 'druckit',
          },
        })
      )
    ).toMatchObject({
      inf: 'dricka',
      imp: 'drick',
      pres: 'dricker',
      past: 'drack',
      supine: 'druckit',
    });

    expect(
      inflectVerb(
        verb('vara', 'irreg', {
          forms: {
            inf: 'vara',
            imp: 'var',
            pres: 'är',
            past: 'var',
            supine: 'varit',
          },
        })
      )
    ).toMatchObject({
      inf: 'vara',
      imp: 'var',
      pres: 'är',
      past: 'var',
      supine: 'varit',
    });

    expect(inflectVerb(verb('hoppas', '1', { deponent: true }))).toMatchObject({
      inf: 'hoppas',
      imp: 'hoppas',
      pres: 'hoppas',
      past: 'hoppades',
      supine: 'hoppats',
    });
    expect(inflectVerb(verb('trivas', '2a', { deponent: true }))).toMatchObject({
      inf: 'trivas',
      imp: 'trivs',
      pres: 'trivs',
      past: 'trivdes',
      supine: 'trivts',
    });
    expect(
      inflectVerb(
        verb('finnas', '4', {
          deponent: true,
          forms: {
            inf: 'finnas',
            imp: 'finns',
            pres: 'finns',
            past: 'fanns',
            supine: 'funnits',
          },
        })
      )
    ).toMatchObject({
      inf: 'finnas',
      pres: 'finns',
      past: 'fanns',
      supine: 'funnits',
    });

    expect(inflectVerb(verb('tycka om', '2b', { particle: 'om' }))).toMatchObject({
      inf: 'tycka om',
      imp: 'tyck om',
      pres: 'tycker om',
      past: 'tyckte om',
      supine: 'tyckt om',
    });

    expect(inflectVerb(verb('skynda sig', '1', { reflexive: true }))).toMatchObject({
      inf: 'skynda sig',
      imp: 'skynda sig',
      pres: 'skyndar sig',
      past: 'skyndade sig',
      supine: 'skyndat sig',
    });
  });
});

describe('inflectAdj', () => {
  it('handles regular, long vowel, vowel+d, consonant+d, -el/-en/-er e-drop, indeclinable, and irregular overrides', () => {
    expect(inflectAdj(adj('stor'))).toEqual({
      common: 'stor',
      neuter: 'stort',
      plDef: 'stora',
    });
    expect(inflectAdj(adj('ny'))).toEqual({
      common: 'ny',
      neuter: 'nytt',
      plDef: 'nya',
    });
    expect(inflectAdj(adj('röd'))).toEqual({
      common: 'röd',
      neuter: 'rött',
      plDef: 'röda',
    });
    expect(inflectAdj(adj('hård'))).toEqual({
      common: 'hård',
      neuter: 'hårt',
      plDef: 'hårda',
    });
    expect(inflectAdj(adj('enkel'))).toEqual({
      common: 'enkel',
      neuter: 'enkelt',
      plDef: 'enkla',
    });
    expect(inflectAdj(adj('öppen'))).toEqual({
      common: 'öppen',
      neuter: 'öppet',
      plDef: 'öppna',
    });
    expect(inflectAdj(adj('bra', { indeclinable: true }))).toEqual({
      common: 'bra',
      neuter: 'bra',
      plDef: 'bra',
    });
    expect(
      inflectAdj(
        adj('liten', {
          forms: {
            common: 'liten',
            neuter: 'litet',
            plDef: 'små',
            comp: 'mindre',
            sup: 'minst',
          },
        })
      )
    ).toEqual({
      common: 'liten',
      neuter: 'litet',
      plDef: 'små',
      comp: 'mindre',
      sup: 'minst',
    });
  });
});

describe('evaluateTypedAnswer', () => {
  it('returns exact ignoring case, extra spaces, and trailing punctuation', () => {
    expect(evaluateTypedAnswer('  Böcker! ', ['böcker'])).toEqual({
      status: 'exact',
      matched: 'böcker',
    });
    expect(evaluateTypedAnswer('de   röda  husen.', ['de röda husen'])).toEqual({
      status: 'exact',
      matched: 'de röda husen',
    });
  });

  it('returns diacritic-retry when å/ä/ö vs a/o differs', () => {
    expect(evaluateTypedAnswer('bocker', ['böcker'])).toEqual({
      status: 'diacritic-retry',
      matched: 'böcker',
    });
    expect(evaluateTypedAnswer('ag', ['äg'])).toEqual({
      status: 'diacritic-retry',
      matched: 'äg',
    });
    expect(evaluateTypedAnswer('fågel', ['fagel'])).toEqual({
      status: 'diacritic-retry',
      matched: 'fagel',
    });
  });

  it('returns wrong on genuine spelling mistakes', () => {
    expect(evaluateTypedAnswer('bilar', ['böcker'])).toEqual({
      status: 'wrong',
    });
    expect(evaluateTypedAnswer('', ['böcker'])).toEqual({
      status: 'wrong',
    });
  });
});
