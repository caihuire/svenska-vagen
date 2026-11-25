import type { LexiconEntry } from '../../../types/index';

interface AdvSpec {
  lemma: string;
  en: string;
  ipa: string;
  example: { sv: string; en: string };
  tags: string[];
}

interface NounSpec {
  lemma: string;
  en: string;
  ipa: string;
  gender: 'en' | 'ett';
  declension: 1 | 2 | 3;
  defSg: string;
  indefPl: string;
  defPl: string;
  example: { sv: string; en: string };
  tags: string[];
}

// Adverbs of location and direction are closed-class here: no morph block is
// needed. The A1 adverbs var, hemma and varifrån are reused by id in the unit
// and are not redefined here. The three adverb series are tagged 'location'
// (where?), 'towards' (to where?) and 'from' (from where?).
function adv(spec: AdvSpec): LexiconEntry {
  return {
    id: `adv:${spec.lemma}`,
    lemma: spec.lemma,
    en: spec.en,
    pos: 'adv',
    unitId: 'u22',
    stage: 'A2',
    ipa: spec.ipa,
    example: spec.example,
    tags: spec.tags,
  };
}

function noun(spec: NounSpec): LexiconEntry {
  return {
    id: `noun:${spec.lemma}`,
    lemma: spec.lemma,
    en: spec.en,
    pos: 'noun',
    unitId: 'u22',
    stage: 'A2',
    ipa: spec.ipa,
    example: spec.example,
    tags: spec.tags,
    morph: {
      pos: 'noun',
      gender: spec.gender,
      declension: spec.declension,
      forms: {
        indefSg: spec.lemma,
        defSg: spec.defSg,
        indefPl: spec.indefPl,
        defPl: spec.defPl,
      },
    },
  };
}

export const U22_LEXICON: LexiconEntry[] = [
  // här / hit / härifrån, där / dit / därifrån
  adv({
    lemma: 'här', en: 'here (location)', ipa: '/hæːr/',
    example: { sv: 'Här är det alltid lugnt på morgonen.', en: 'Here it is always calm in the morning.' },
    tags: ['location', 'place'],
  }),
  adv({
    lemma: 'hit', en: 'here (to this place)', ipa: '/hiːt/',
    example: { sv: 'Kom hit, så ska jag visa dig bilderna.', en: 'Come here, and I will show you the pictures.' },
    tags: ['towards', 'direction'],
  }),
  adv({
    lemma: 'härifrån', en: 'from here', ipa: '/ˈhæːrɪˌfroːn/',
    example: { sv: 'Det är tio minuter härifrån till hamnen.', en: 'It is ten minutes from here to the harbour.' },
    tags: ['from', 'direction'],
  }),
  adv({
    lemma: 'där', en: 'there (location)', ipa: '/dæːr/',
    example: { sv: 'Mina farföräldrar bor där, i det gula huset.', en: 'My grandparents live there, in the yellow house.' },
    tags: ['location', 'place'],
  }),
  adv({
    lemma: 'dit', en: 'there (to that place)', ipa: '/diːt/',
    example: { sv: 'Vi tar bussen dit på lördag.', en: 'We are taking the bus there on Saturday.' },
    tags: ['towards', 'direction'],
  }),
  adv({
    lemma: 'därifrån', en: 'from there', ipa: '/ˈdæːrɪˌfroːn/',
    example: { sv: 'Vi åkte därifrån klockan åtta.', en: 'We left from there at eight o’clock.' },
    tags: ['from', 'direction'],
  }),
  // inne / in / inifrån
  adv({
    lemma: 'inne', en: 'inside, indoors (location)', ipa: '/ˈɪnːɛ/',
    example: { sv: 'Det är varmt inne i bageriet.', en: 'It is warm inside the bakery.' },
    tags: ['location', 'place'],
  }),
  adv({
    lemma: 'in', en: 'in, inside (motion)', ipa: '/ɪn/',
    example: { sv: 'Gå in, dörren är öppen.', en: 'Go in, the door is open.' },
    tags: ['towards', 'direction'],
  }),
  adv({
    lemma: 'inifrån', en: 'from inside', ipa: '/ˈɪnɪˌfroːn/',
    example: { sv: 'Jag hörde en röst inifrån huset.', en: 'I heard a voice from inside the house.' },
    tags: ['from', 'direction'],
  }),
  // ute / ut / utifrån
  adv({
    lemma: 'ute', en: 'outside, out (location)', ipa: '/ˈʉːtɛ/',
    example: { sv: 'Barnen leker ute i trädgården.', en: 'The children are playing outside in the garden.' },
    tags: ['location', 'place'],
  }),
  adv({
    lemma: 'ut', en: 'out (motion)', ipa: '/ʉːt/',
    example: { sv: 'Ska vi gå ut och titta på stjärnorna?', en: 'Shall we go out and look at the stars?' },
    tags: ['towards', 'direction'],
  }),
  adv({
    lemma: 'utifrån', en: 'from outside', ipa: '/ˈʉːtɪˌfroːn/',
    example: { sv: 'Kylan kom utifrån när dörren öppnades.', en: 'The cold came in from outside when the door opened.' },
    tags: ['from', 'direction'],
  }),
  // uppe / upp / uppifrån
  adv({
    lemma: 'uppe', en: 'up, upstairs, above (location)', ipa: '/ˈɵpːɛ/',
    example: { sv: 'Katten sitter uppe på skåpet.', en: 'The cat is sitting up on the cupboard.' },
    tags: ['location', 'place'],
  }),
  adv({
    lemma: 'upp', en: 'up (motion)', ipa: '/ɵp/',
    example: { sv: 'Hon klättrade upp på berget.', en: 'She climbed up onto the rock.' },
    tags: ['towards', 'direction'],
  }),
  adv({
    lemma: 'uppifrån', en: 'from above', ipa: '/ˈɵpɪˌfroːn/',
    example: { sv: 'Vi såg staden uppifrån berget.', en: 'We saw the town from the top of the hill.' },
    tags: ['from', 'direction'],
  }),
  // nere / ner / nerifrån
  adv({
    lemma: 'nere', en: 'down, downstairs, below (location)', ipa: '/ˈneːrɛ/',
    example: { sv: 'Cyklarna står nere i källaren.', en: 'The bikes are down in the cellar.' },
    tags: ['location', 'place'],
  }),
  adv({
    lemma: 'ner', en: 'down (motion)', ipa: '/neːr/',
    example: { sv: 'Han gick ner i källaren efter vin.', en: 'He went down to the cellar for some wine.' },
    tags: ['towards', 'direction'],
  }),
  adv({
    lemma: 'nerifrån', en: 'from below', ipa: '/ˈneːrɪˌfroːn/',
    example: { sv: 'Det luktade gott nerifrån bageriet.', en: 'It smelled good from down in the bakery.' },
    tags: ['from', 'direction'],
  }),
  // hem / hemifrån (hemma is reused from A1)
  adv({
    lemma: 'hem', en: 'home (motion)', ipa: '/hɛm/',
    example: { sv: 'Vi åker hem efter middagen.', en: 'We are going home after dinner.' },
    tags: ['towards', 'direction'],
  }),
  adv({
    lemma: 'hemifrån', en: 'from home', ipa: '/ˈhɛmɪˌfroːn/',
    example: { sv: 'Hon flyttade hemifrån när hon var arton år.', en: 'She moved out of her parents’ home when she was eighteen.' },
    tags: ['from', 'direction'],
  }),
  // framme / fram / framifrån
  adv({
    lemma: 'framme', en: 'there, arrived, at the front (location)', ipa: '/ˈframːɛ/',
    example: { sv: 'Nu är vi framme vid hamnen.', en: 'Now we have arrived at the harbour.' },
    tags: ['location', 'place'],
  }),
  adv({
    lemma: 'fram', en: 'forward, to the front (motion)', ipa: '/fram/',
    example: { sv: 'Båten kom sakta fram till kajen.', en: 'The boat slowly came up to the quay.' },
    tags: ['towards', 'direction'],
  }),
  adv({
    lemma: 'framifrån', en: 'from the front', ipa: '/ˈframɪˌfroːn/',
    example: { sv: 'Bilen kom framifrån och svängde in.', en: 'The car came from the front and turned in.' },
    tags: ['from', 'direction'],
  }),
  // borta / bort / bortifrån
  adv({
    lemma: 'borta', en: 'away, gone, over there (location)', ipa: '/ˈbɔʈːa/',
    example: { sv: 'Min bror är borta hela veckan.', en: 'My brother is away all week.' },
    tags: ['location', 'place'],
  }),
  adv({
    lemma: 'bort', en: 'away (motion)', ipa: '/bɔʈ/',
    example: { sv: 'Hon åkte bort över helgen.', en: 'She went away for the weekend.' },
    tags: ['towards', 'direction'],
  }),
  adv({
    lemma: 'bortifrån', en: 'from over there, from a distance', ipa: '/ˈbɔʈɪˌfroːn/',
    example: { sv: 'Ett rop hördes bortifrån skogen.', en: 'A shout was heard from over by the forest.' },
    tags: ['from', 'direction'],
  }),
  // question word for direction
  adv({
    lemma: 'vart', en: 'where to', ipa: '/vaʈ/',
    example: { sv: 'Vart ska du åka i sommar?', en: 'Where are you going this summer?' },
    tags: ['question', 'towards'],
  }),
  // Nouns
  noun({
    lemma: 'trappa', en: 'staircase, steps', ipa: '/ˈtrapːa/', gender: 'en', declension: 1,
    defSg: 'trappan', indefPl: 'trappor', defPl: 'trapporna',
    example: { sv: 'Vi satt på trappan och åt glass.', en: 'We sat on the steps and ate ice cream.' },
    tags: ['building', 'place'],
  }),
  noun({
    lemma: 'bageri', en: 'bakery', ipa: '/baɡɛˈriː/', gender: 'ett', declension: 3,
    defSg: 'bageriet', indefPl: 'bagerier', defPl: 'bagerierna',
    example: { sv: 'Vi köper alltid bröd på ett litet bageri.', en: 'We always buy bread at a small bakery.' },
    tags: ['shop', 'place'],
  }),
  noun({
    lemma: 'hamn', en: 'harbour, port', ipa: '/hamn/', gender: 'en', declension: 2,
    defSg: 'hamnen', indefPl: 'hamnar', defPl: 'hamnarna',
    example: { sv: 'Fartyget ligger i hamnen över natten.', en: 'The ship lies in the harbour overnight.' },
    tags: ['sea', 'place'],
  }),
];
