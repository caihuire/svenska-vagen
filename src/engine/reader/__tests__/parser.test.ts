import { describe, expect, it } from 'vitest';
import { extractSentences, parseCulturalMarkup } from '../parser.ts';

describe('parseCulturalMarkup', () => {
  it('parses lexicon links, split spanGroups, inline glosses, and punctuation', () => {
    const markup =
      'Hon [tycker|g1:verb:tycka_om] mycket [om|g1] [kaffe|noun:kaffe] i [Stockholm|gloss:Capital of Sweden].';
    const paragraphs = parseCulturalMarkup(markup);

    expect(paragraphs).toHaveLength(1);
    const tokens = paragraphs[0];
    expect(tokens).toEqual([
      { surface: 'Hon' },
      { surface: 'tycker', spanGroup: 'g1', lexId: 'verb:tycka_om' },
      { surface: 'mycket' },
      { surface: 'om', spanGroup: 'g1', lexId: 'verb:tycka_om' },
      { surface: 'kaffe', lexId: 'noun:kaffe' },
      { surface: 'i' },
      { surface: 'Stockholm', gloss: 'Capital of Sweden' },
      { surface: '.', isPunct: true },
    ]);
  });

  it('splits multiple paragraphs and handles punctuation attached to plain words', () => {
    const markup =
      '"Hej, [vän|noun:van]!"\n\nVi dricker [te|noun:te], inte [kaffe|noun:kaffe].';
    const paragraphs = parseCulturalMarkup(markup);

    expect(paragraphs).toHaveLength(2);
    expect(paragraphs[0]).toEqual([
      { surface: '"', isPunct: true },
      { surface: 'Hej' },
      { surface: ',', isPunct: true },
      { surface: 'vän', lexId: 'noun:van' },
      { surface: '!', isPunct: true },
      { surface: '"', isPunct: true },
    ]);
    expect(paragraphs[1]).toEqual([
      { surface: 'Vi' },
      { surface: 'dricker' },
      { surface: 'te', lexId: 'noun:te' },
      { surface: ',', isPunct: true },
      { surface: 'inte' },
      { surface: 'kaffe', lexId: 'noun:kaffe' },
      { surface: '.', isPunct: true },
    ]);
  });

  it('supports gloss inside a spanGroup', () => {
    const markup = 'De går [till|g2:gloss:to the store] [affären|g2].';
    const paragraphs = parseCulturalMarkup(markup);
    expect(paragraphs[0]).toEqual([
      { surface: 'De' },
      { surface: 'går' },
      { surface: 'till', spanGroup: 'g2', gloss: 'to the store' },
      { surface: 'affären', spanGroup: 'g2', gloss: 'to the store' },
      { surface: '.', isPunct: true },
    ]);
  });
});

describe('extractSentences', () => {
  it('strips markup and splits sentences on ., !, ?', () => {
    const markup =
      'Hon [tycker|g1:verb:tycka_om] mycket [om|g1] [kaffe|noun:kaffe]. Dricker du te?\n\nJa, varje dag!';
    expect(extractSentences(markup)).toEqual([
      'Hon tycker mycket om kaffe.',
      'Dricker du te?',
      'Ja, varje dag!',
    ]);
  });
});
