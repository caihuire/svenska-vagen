import type { LexiconEntry } from '../../../types/index';

interface BaseSpec {
  lemma: string;
  en: string;
  ipa: string;
  example: { sv: string; en: string };
  tags: string[];
}

interface NounSpec extends BaseSpec {
  gender: 'en' | 'ett';
  declension: 1 | 2 | 3 | 6 | 'pl';
  defSg: string;
  indefPl: string;
  defPl: string;
}

interface VerbSpec extends BaseSpec {
  group: '1' | 'irreg';
  particle?: string;
  // Every verb carries all five forms explicitly (irregular påstå and the
  // particle verb hälsa på never rely on a derivation heuristic).
  forms: { inf: string; imp: string; pres: string; past: string; supine: string };
}

// None of the 30 seed words exists in Stage A1 or in an earlier A2 slice, so all
// are new. 'som' is a closed-class pronoun and needs no morph block. byxor is a
// plural-only noun and mirrors the A1 pengar/kläder convention: its singular
// slots repeat the plural forms. The noun 'visa' (song) does not clash with any
// verb, because the A1 slice holds no verb:visa.
function noun(spec: NounSpec): LexiconEntry {
  return {
    id: `noun:${spec.lemma}`,
    lemma: spec.lemma,
    en: spec.en,
    pos: 'noun',
    unitId: 'u23',
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

function verb(spec: VerbSpec): LexiconEntry {
  return {
    id: `verb:${spec.lemma}`,
    lemma: spec.lemma,
    en: spec.en,
    pos: 'verb',
    unitId: 'u23',
    stage: 'A2',
    ipa: spec.ipa,
    example: spec.example,
    tags: ['siv-order', ...spec.tags],
    morph: {
      pos: 'verb',
      group: spec.group,
      ...(spec.particle ? { particle: spec.particle } : {}),
      forms: spec.forms,
    },
  };
}

export const U23_LEXICON: LexiconEntry[] = [
  {
    id: 'pron:som',
    lemma: 'som',
    en: 'who, which, that (relative pronoun); as, like',
    pos: 'pron',
    unitId: 'u23',
    stage: 'A2',
    ipa: '/sɔm/',
    example: { sv: 'Jag känner en man som skriver visor.', en: 'I know a man who writes songs.' },
    tags: ['relative-clauses', 'relative'],
  },
  // Verbs that introduce a subordinate clause
  verb({
    lemma: 'tvivla', group: '1', en: 'to doubt', ipa: '/ˈtvɪvla/',
    example: { sv: 'Jag tvivlar på att hon kommer i tid.', en: 'I doubt that she will come on time.' },
    tags: ['group-1', 'thinking'],
    forms: { inf: 'tvivla', imp: 'tvivla', pres: 'tvivlar', past: 'tvivlade', supine: 'tvivlat' },
  }),
  verb({
    lemma: 'undra', group: '1', en: 'to wonder', ipa: '/ˈɵndra/',
    example: { sv: 'Jag undrar varför hon inte svarar.', en: 'I wonder why she does not answer.' },
    tags: ['group-1', 'thinking'],
    forms: { inf: 'undra', imp: 'undra', pres: 'undrar', past: 'undrade', supine: 'undrat' },
  }),
  verb({
    lemma: 'påstå', group: 'irreg', en: 'to claim, to assert', ipa: '/pɔˈstoː/',
    example: { sv: 'Han påstod att han aldrig hade hört visan.', en: 'He claimed that he had never heard the song.' },
    tags: ['irregular', 'speaking'],
    forms: { inf: 'påstå', imp: 'påstå', pres: 'påstår', past: 'påstod', supine: 'påstått' },
  }),
  verb({
    lemma: 'förklara', group: '1', en: 'to explain, to declare', ipa: '/fœrˈklɑːra/',
    example: { sv: 'Läraren förklarade att eleverna inte behövde komma.', en: 'The teacher explained that the pupils did not need to come.' },
    tags: ['group-1', 'speaking'],
    forms: { inf: 'förklara', imp: 'förklara', pres: 'förklarar', past: 'förklarade', supine: 'förklarat' },
  }),
  verb({
    lemma: 'hälsa på', group: '1', particle: 'på', en: 'to visit, to call on', ipa: '/ˈhɛlsa ˌpoː/',
    example: { sv: 'Vi hälsar på min moster i skärgården varje sommar.', en: 'We visit my aunt in the archipelago every summer.' },
    tags: ['group-1', 'particle-verb', 'social'],
    forms: { inf: 'hälsa på', imp: 'hälsa på', pres: 'hälsar på', past: 'hälsade på', supine: 'hälsat på' },
  }),
  // Nouns
  noun({
    lemma: 'sommarstuga', en: 'summer cottage', ipa: '/ˈsɔmarˌstʉːɡa/', gender: 'en', declension: 1,
    defSg: 'sommarstugan', indefPl: 'sommarstugor', defPl: 'sommarstugorna',
    example: { sv: 'Familjen har en sommarstuga som ligger nära havet.', en: 'The family has a summer cottage that lies close to the sea.' },
    tags: ['home', 'summer'],
  }),
  noun({
    lemma: 'semester', en: 'holiday, paid vacation', ipa: '/sɛˈmɛstɛr/', gender: 'en', declension: 2,
    defSg: 'semestern', indefPl: 'semestrar', defPl: 'semestrarna',
    example: { sv: 'Jag hoppas att jag får semester i juli.', en: 'I hope that I get a holiday in July.' },
    tags: ['summer', 'work'],
  }),
  noun({
    lemma: 'present', en: 'present, gift', ipa: '/prɛˈsɛnt/', gender: 'en', declension: 3,
    defSg: 'presenten', indefPl: 'presenter', defPl: 'presenterna',
    example: { sv: 'Hon sa att hon redan hade köpt en present.', en: 'She said that she had already bought a present.' },
    tags: ['celebration'],
  }),
  noun({
    lemma: 'salong', en: 'salon, drawing room, hall', ipa: '/saˈlɔŋ/', gender: 'en', declension: 3,
    defSg: 'salongen', indefPl: 'salonger', defPl: 'salongerna',
    example: { sv: 'Gästerna väntade i salongen medan musiken spelades.', en: 'The guests waited in the salon while the music was played.' },
    tags: ['home', 'culture'],
  }),
  noun({
    lemma: 'moster', en: 'aunt (mother’s sister)', ipa: '/ˈmɔstɛr/', gender: 'en', declension: 2,
    defSg: 'mostern', indefPl: 'mostrar', defPl: 'mostrarna',
    example: { sv: 'Min moster, som bor i Stockholm, är konstnär.', en: 'My aunt, who lives in Stockholm, is an artist.' },
    tags: ['family'],
  }),
  noun({
    lemma: 'strumpa', en: 'sock, stocking', ipa: '/ˈstrɵmpa/', gender: 'en', declension: 1,
    defSg: 'strumpan', indefPl: 'strumpor', defPl: 'strumporna',
    example: { sv: 'Jag hittar aldrig den andra strumpan.', en: 'I never find the other sock.' },
    tags: ['clothes'],
  }),
  noun({
    lemma: 'fordon', en: 'vehicle', ipa: '/ˈfuːɖɔn/', gender: 'ett', declension: 6,
    defSg: 'fordonet', indefPl: 'fordon', defPl: 'fordonen',
    example: { sv: 'Fordonet som står utanför är inte mitt.', en: 'The vehicle that is parked outside is not mine.' },
    tags: ['transport'],
  }),
  noun({
    lemma: 'frukt', en: 'fruit', ipa: '/frɵkt/', gender: 'en', declension: 3,
    defSg: 'frukten', indefPl: 'frukter', defPl: 'frukterna',
    example: { sv: 'Frukten som jag gillar mest är päron.', en: 'The fruit that I like best is pears.' },
    tags: ['food'],
  }),
  noun({
    lemma: 'potatis', en: 'potato', ipa: '/pɔˈtɑːtɪs/', gender: 'en', declension: 2,
    defSg: 'potatisen', indefPl: 'potatisar', defPl: 'potatisarna',
    example: { sv: 'Vi äter potatis som vi har odlat själva.', en: 'We eat potatoes that we have grown ourselves.' },
    tags: ['food'],
  }),
  noun({
    lemma: 'päron', en: 'pear', ipa: '/ˈpæːrɔn/', gender: 'ett', declension: 6,
    defSg: 'päronet', indefPl: 'päron', defPl: 'päronen',
    example: { sv: 'Jag tycker att päronet inte är moget än.', en: 'I think the pear is not ripe yet.' },
    tags: ['food'],
  }),
  noun({
    lemma: 'gurka', en: 'cucumber', ipa: '/ˈɡɵrka/', gender: 'en', declension: 1,
    defSg: 'gurkan', indefPl: 'gurkor', defPl: 'gurkorna',
    example: { sv: 'Hon skär gurkan som hon har köpt på torget.', en: 'She cuts the cucumber that she bought at the market.' },
    tags: ['food'],
  }),
  noun({
    lemma: 'ost', en: 'cheese', ipa: '/ʊst/', gender: 'en', declension: 2,
    defSg: 'osten', indefPl: 'ostar', defPl: 'ostarna',
    example: { sv: 'Osten som ligger i kylen är från Norrland.', en: 'The cheese that is in the fridge is from Norrland.' },
    tags: ['food'],
  }),
  noun({
    lemma: 'korv', en: 'sausage', ipa: '/kɔrv/', gender: 'en', declension: 2,
    defSg: 'korven', indefPl: 'korvar', defPl: 'korvarna',
    example: { sv: 'Barnen vill grilla korv när det inte regnar.', en: 'The children want to grill sausages when it is not raining.' },
    tags: ['food'],
  }),
  noun({
    lemma: 'tallrik', en: 'plate', ipa: '/ˈtalrɪk/', gender: 'en', declension: 2,
    defSg: 'tallriken', indefPl: 'tallrikar', defPl: 'tallrikarna',
    example: { sv: 'Tallriken som du håller i är väldigt gammal.', en: 'The plate that you are holding is very old.' },
    tags: ['home', 'food'],
  }),
  noun({
    lemma: 'skjorta', en: 'shirt', ipa: '/ˈɧʊʈa/', gender: 'en', declension: 1,
    defSg: 'skjortan', indefPl: 'skjortor', defPl: 'skjortorna',
    example: { sv: 'Han bar en vit skjorta som hans mamma hade strukit.', en: 'He wore a white shirt that his mother had ironed.' },
    tags: ['clothes'],
  }),
  noun({
    lemma: 'byxor', en: 'trousers, pants', ipa: '/ˈbyksɔr/', gender: 'en', declension: 'pl',
    defSg: 'byxorna', indefPl: 'byxor', defPl: 'byxorna',
    example: { sv: 'Jag behöver nya byxor som inte är för korta.', en: 'I need new trousers that are not too short.' },
    tags: ['clothes', 'plural-only'],
  }),
  noun({
    lemma: 'blus', en: 'blouse', ipa: '/blʉːs/', gender: 'en', declension: 2,
    defSg: 'blusen', indefPl: 'blusar', defPl: 'blusarna',
    example: { sv: 'Blusen som hänger på stolen är min.', en: 'The blouse that is hanging on the chair is mine.' },
    tags: ['clothes'],
  }),
  noun({
    lemma: 'stämning', en: 'mood, atmosphere', ipa: '/ˈstɛmnɪŋ/', gender: 'en', declension: 2,
    defSg: 'stämningen', indefPl: 'stämningar', defPl: 'stämningarna',
    example: { sv: 'Stämningen var god, fast det regnade hela kvällen.', en: 'The atmosphere was good, although it rained all evening.' },
    tags: ['culture', 'feelings'],
  }),
  noun({
    lemma: 'författare', en: 'author, writer', ipa: '/fœrˈfatːarɛ/', gender: 'en', declension: 6,
    defSg: 'författaren', indefPl: 'författare', defPl: 'författarna',
    example: { sv: 'Författaren vars bok jag läser bor i Skåne.', en: 'The author whose book I am reading lives in Skåne.' },
    tags: ['culture', 'profession'],
  }),
  noun({
    lemma: 'konstnär', en: 'artist', ipa: '/ˈkɔnstˌnæːr/', gender: 'en', declension: 3,
    defSg: 'konstnären', indefPl: 'konstnärer', defPl: 'konstnärerna',
    example: { sv: 'Konstnären som målar skärgården säljer sina tavlor på sommaren.', en: 'The artist who paints the archipelago sells her paintings in the summer.' },
    tags: ['culture', 'profession'],
  }),
  noun({
    lemma: 'kompositör', en: 'composer', ipa: '/kɔmpɔsɪˈtøːr/', gender: 'en', declension: 3,
    defSg: 'kompositören', indefPl: 'kompositörer', defPl: 'kompositörerna',
    example: { sv: 'Kompositören skrev en melodi som alla kunde sjunga.', en: 'The composer wrote a melody that everyone could sing.' },
    tags: ['culture', 'profession'],
  }),
  noun({
    lemma: 'skärgård', en: 'archipelago', ipa: '/ˈɧæːrˌɡoːɖ/', gender: 'en', declension: 2,
    defSg: 'skärgården', indefPl: 'skärgårdar', defPl: 'skärgårdarna',
    example: { sv: 'Vi åker till skärgården så fort det blir varmt.', en: 'We go to the archipelago as soon as it gets warm.' },
    tags: ['nature', 'summer'],
  }),
  noun({
    lemma: 'invånare', en: 'inhabitant, resident', ipa: '/ˈɪnˌvoːnarɛ/', gender: 'en', declension: 6,
    defSg: 'invånaren', indefPl: 'invånare', defPl: 'invånarna',
    example: { sv: 'Öns invånare vet att färjan inte går på söndagar.', en: 'The inhabitants of the island know that the ferry does not run on Sundays.' },
    tags: ['society', 'place'],
  }),
  noun({
    lemma: 'visa', en: 'song, ballad (sung poem)', ipa: '/ˈviːsa/', gender: 'en', declension: 1,
    defSg: 'visan', indefPl: 'visor', defPl: 'visorna',
    example: { sv: 'Visan som hon sjunger handlar om havet.', en: 'The song that she is singing is about the sea.' },
    tags: ['culture', 'music'],
  }),
];
