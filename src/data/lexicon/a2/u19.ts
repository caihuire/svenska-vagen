import type { LexiconEntry, VerbMorph } from '../../../types/index';

interface VerbSpec {
  lemma: string;
  group: VerbMorph['group'];
  en: string;
  ipa: string;
  example: { sv: string; en: string };
  tags: string[];
  // Every verb carries all five forms explicitly, so no past or supine ever
  // relies on a derivation heuristic.
  forms: { inf: string; imp: string; pres: string; past: string; supine: string };
}

function verb(spec: VerbSpec): LexiconEntry {
  return {
    id: `verb:${spec.lemma}`,
    lemma: spec.lemma,
    en: spec.en,
    pos: 'verb',
    unitId: 'u19',
    stage: 'A2',
    ipa: spec.ipa,
    example: spec.example,
    tags: ['verb-weak-past', ...spec.tags],
    morph: { pos: 'verb', group: spec.group, forms: spec.forms },
  };
}

// None of the 30 seed verbs exists in Stage A1 or in an earlier A2 slice, so all
// are new. frysa is listed under IIb in the seed list but is a strong verb
// (frös, frusit); it is filed as group 4 with its correct forms.
export const U19_LEXICON: LexiconEntry[] = [
  // Group I: -ar, -ade, -at
  verb({
    lemma: 'spela', group: '1', en: 'to play (a game, an instrument)', ipa: '/ˈspeːla/',
    example: { sv: 'Barnen spelade kort hela kvällen.', en: 'The children played cards all evening.' },
    tags: ['group-1', 'leisure'],
    forms: { inf: 'spela', imp: 'spela', pres: 'spelar', past: 'spelade', supine: 'spelat' },
  }),
  verb({
    lemma: 'lämna', group: '1', en: 'to leave, to hand over', ipa: '/ˈlɛmna/',
    example: { sv: 'Hon har lämnat nyckeln på bordet.', en: 'She has left the key on the table.' },
    tags: ['group-1'],
    forms: { inf: 'lämna', imp: 'lämna', pres: 'lämnar', past: 'lämnade', supine: 'lämnat' },
  }),
  verb({
    lemma: 'träffa', group: '1', en: 'to meet, to hit', ipa: '/ˈtrɛfa/',
    example: { sv: 'Vi träffade honom på tåget i går.', en: 'We met him on the train yesterday.' },
    tags: ['group-1', 'social'],
    forms: { inf: 'träffa', imp: 'träffa', pres: 'träffar', past: 'träffade', supine: 'träffat' },
  }),
  verb({
    lemma: 'skratta', group: '1', en: 'to laugh', ipa: '/ˈskrata/',
    example: { sv: 'Publiken skrattade högt åt skämtet.', en: 'The audience laughed loudly at the joke.' },
    tags: ['group-1'],
    forms: { inf: 'skratta', imp: 'skratta', pres: 'skrattar', past: 'skrattade', supine: 'skrattat' },
  }),
  verb({
    lemma: 'upprepa', group: '1', en: 'to repeat', ipa: '/ˈɵpːˌreːpa/',
    example: { sv: 'Läraren upprepade frågan två gånger.', en: 'The teacher repeated the question twice.' },
    tags: ['group-1', 'school'],
    forms: { inf: 'upprepa', imp: 'upprepa', pres: 'upprepar', past: 'upprepade', supine: 'upprepat' },
  }),
  verb({
    lemma: 'svara', group: '1', en: 'to answer, to reply', ipa: '/ˈsvɑːra/',
    example: { sv: 'Han har inte svarat på brevet än.', en: 'He has not answered the letter yet.' },
    tags: ['group-1'],
    forms: { inf: 'svara', imp: 'svara', pres: 'svarar', past: 'svarade', supine: 'svarat' },
  }),
  verb({
    lemma: 'älska', group: '1', en: 'to love', ipa: '/ˈɛlska/',
    example: { sv: 'Kungen älskade sitt nya skepp.', en: 'The king loved his new ship.' },
    tags: ['group-1', 'feelings'],
    forms: { inf: 'älska', imp: 'älska', pres: 'älskar', past: 'älskade', supine: 'älskat' },
  }),
  verb({
    lemma: 'packa', group: '1', en: 'to pack', ipa: '/ˈpaka/',
    example: { sv: 'Vi packade väskorna redan i går kväll.', en: 'We packed the bags as early as last night.' },
    tags: ['group-1', 'travel'],
    forms: { inf: 'packa', imp: 'packa', pres: 'packar', past: 'packade', supine: 'packat' },
  }),
  verb({
    lemma: 'vattna', group: '1', en: 'to water (plants)', ipa: '/ˈvatna/',
    example: { sv: 'Jag har vattnat blommorna i dag.', en: 'I have watered the flowers today.' },
    tags: ['group-1', 'home'],
    forms: { inf: 'vattna', imp: 'vattna', pres: 'vattnar', past: 'vattnade', supine: 'vattnat' },
  }),

  // Group IIa: voiced stem, -er, -de, -t
  verb({
    lemma: 'bygga', group: '2a', en: 'to build', ipa: '/ˈbʏɡa/',
    example: { sv: 'Man byggde skeppet på 1620-talet.', en: 'They built the ship in the 1620s.' },
    tags: ['group-2a', 'history'],
    forms: { inf: 'bygga', imp: 'bygg', pres: 'bygger', past: 'byggde', supine: 'byggt' },
  }),
  verb({
    lemma: 'leva', group: '2a', en: 'to live, to be alive', ipa: '/ˈleːva/',
    example: { sv: 'Hon har levt i Sverige i tio år.', en: 'She has lived in Sweden for ten years.' },
    tags: ['group-2a'],
    forms: { inf: 'leva', imp: 'lev', pres: 'lever', past: 'levde', supine: 'levt' },
  }),
  verb({
    lemma: 'sända', group: '2a', en: 'to send, to broadcast', ipa: '/ˈsɛnda/',
    example: { sv: 'Kungen sände ett brev till staden.', en: 'The king sent a letter to the town.' },
    tags: ['group-2a', 'nd-stem'],
    forms: { inf: 'sända', imp: 'sänd', pres: 'sänder', past: 'sände', supine: 'sänt' },
  }),
  verb({
    lemma: 'hända', group: '2a', en: 'to happen', ipa: '/ˈhɛnda/',
    example: { sv: 'Vad hände med skeppet?', en: 'What happened to the ship?' },
    tags: ['group-2a', 'nd-stem'],
    forms: { inf: 'hända', imp: 'händ', pres: 'händer', past: 'hände', supine: 'hänt' },
  }),
  verb({
    lemma: 'vända', group: '2a', en: 'to turn', ipa: '/ˈvɛnda/',
    example: { sv: 'Hon vände sig om och log.', en: 'She turned around and smiled.' },
    tags: ['group-2a', 'nd-stem'],
    forms: { inf: 'vända', imp: 'vänd', pres: 'vänder', past: 'vände', supine: 'vänt' },
  }),
  verb({
    lemma: 'påminna', group: '2a', en: 'to remind', ipa: '/ˈpoːˌmɪna/',
    example: { sv: 'Klockan påminde mig om mötet.', en: 'The clock reminded me of the meeting.' },
    tags: ['group-2a', 'nn-stem'],
    forms: { inf: 'påminna', imp: 'påminn', pres: 'påminner', past: 'påminde', supine: 'påmint' },
  }),
  verb({
    lemma: 'leda', group: '2a', en: 'to lead', ipa: '/ˈleːda/',
    example: { sv: 'Läraren ledde barnen genom museet.', en: 'The teacher led the children through the museum.' },
    tags: ['group-2a', 'long-vowel-d'],
    forms: { inf: 'leda', imp: 'led', pres: 'leder', past: 'ledde', supine: 'lett' },
  }),
  verb({
    lemma: 'betyda', group: '2a', en: 'to mean', ipa: '/beˈtyːda/',
    example: { sv: 'Vad betydde det gamla ordet?', en: 'What did the old word mean?' },
    tags: ['group-2a', 'long-vowel-d'],
    forms: { inf: 'betyda', imp: 'betyd', pres: 'betyder', past: 'betydde', supine: 'betytt' },
  }),
  verb({
    lemma: 'tömma', group: '2a', en: 'to empty', ipa: '/ˈtœma/',
    example: { sv: 'Hon tömde väskan på bordet.', en: 'She emptied the bag onto the table.' },
    tags: ['group-2a', 'mm-stem'],
    forms: { inf: 'tömma', imp: 'töm', pres: 'tömmer', past: 'tömde', supine: 'tömt' },
  }),

  // Group IIb: voiceless stem, -er, -te, -t
  verb({
    lemma: 'leka', group: '2b', en: 'to play (as children do)', ipa: '/ˈleːka/',
    example: { sv: 'Barnen lekte i parken hela dagen.', en: 'The children played in the park all day.' },
    tags: ['group-2b'],
    forms: { inf: 'leka', imp: 'lek', pres: 'leker', past: 'lekte', supine: 'lekt' },
  }),
  verb({
    lemma: 'byta', group: '2b', en: 'to change, to swap', ipa: '/ˈbyːta/',
    example: { sv: 'Vi har bytt plats med varandra.', en: 'We have swapped places with each other.' },
    tags: ['group-2b', 'tt-supine'],
    forms: { inf: 'byta', imp: 'byt', pres: 'byter', past: 'bytte', supine: 'bytt' },
  }),
  verb({
    lemma: 'möta', group: '2b', en: 'to meet, to encounter', ipa: '/ˈmøːta/',
    example: { sv: 'Jag mötte min granne i trappan.', en: 'I met my neighbour on the stairs.' },
    tags: ['group-2b', 'tt-supine'],
    forms: { inf: 'möta', imp: 'möt', pres: 'möter', past: 'mötte', supine: 'mött' },
  }),
  verb({
    lemma: 'röka', group: '2b', en: 'to smoke', ipa: '/ˈrøːka/',
    example: { sv: 'Min morfar rökte aldrig.', en: 'My grandfather never smoked.' },
    tags: ['group-2b'],
    forms: { inf: 'röka', imp: 'rök', pres: 'röker', past: 'rökte', supine: 'rökt' },
  }),
  verb({
    lemma: 'låsa', group: '2b', en: 'to lock', ipa: '/ˈloːsa/',
    example: { sv: 'Har du låst dörren?', en: 'Have you locked the door?' },
    tags: ['group-2b', 'home'],
    forms: { inf: 'låsa', imp: 'lås', pres: 'låser', past: 'låste', supine: 'låst' },
  }),
  // Strong, not weak: the seed list files frysa under IIb, but the past is frös.
  verb({
    lemma: 'frysa', group: '4', en: 'to freeze, to be cold', ipa: '/ˈfryːsa/',
    example: { sv: 'Det frös hårt i natt.', en: 'It froze hard last night.' },
    tags: ['group-4', 'strong', 'weather'],
    forms: { inf: 'frysa', imp: 'frys', pres: 'fryser', past: 'frös', supine: 'frusit' },
  }),

  // Group III: long vowel, -r, -dde, -tt
  verb({
    lemma: 'ske', group: '3', en: 'to happen, to take place', ipa: '/ɧeː/',
    example: { sv: 'Det har skett en olycka.', en: 'An accident has happened.' },
    tags: ['group-3'],
    forms: { inf: 'ske', imp: 'ske', pres: 'sker', past: 'skedde', supine: 'skett' },
  }),
  verb({
    lemma: 'tro', group: '3', en: 'to believe, to think', ipa: '/truː/',
    example: { sv: 'Jag trodde att skeppet var starkare.', en: 'I thought the ship was stronger.' },
    tags: ['group-3'],
    forms: { inf: 'tro', imp: 'tro', pres: 'tror', past: 'trodde', supine: 'trott' },
  }),
  verb({
    lemma: 'sy', group: '3', en: 'to sew', ipa: '/syː/',
    example: { sv: 'Hon sydde en kjol åt mig.', en: 'She sewed a skirt for me.' },
    tags: ['group-3'],
    forms: { inf: 'sy', imp: 'sy', pres: 'syr', past: 'sydde', supine: 'sytt' },
  }),
  verb({
    lemma: 'nå', group: '3', en: 'to reach', ipa: '/noː/',
    example: { sv: 'Vi nådde toppen före lunch.', en: 'We reached the top before lunch.' },
    tags: ['group-3'],
    forms: { inf: 'nå', imp: 'nå', pres: 'når', past: 'nådde', supine: 'nått' },
  }),
  verb({
    lemma: 'fly', group: '3', en: 'to flee', ipa: '/flyː/',
    example: { sv: 'Folket flydde från staden.', en: 'The people fled from the town.' },
    tags: ['group-3'],
    forms: { inf: 'fly', imp: 'fly', pres: 'flyr', past: 'flydde', supine: 'flytt' },
  }),
  verb({
    lemma: 'bero', group: '3', en: 'to depend (on: på)', ipa: '/beˈruː/',
    example: { sv: 'Resultatet berodde på vädret.', en: 'The result depended on the weather.' },
    tags: ['group-3'],
    forms: { inf: 'bero', imp: 'bero', pres: 'beror', past: 'berodde', supine: 'berott' },
  }),
];
