import type { LexiconEntry } from '../../../types/index';

interface BaseSpec {
  lemma: string;
  en: string;
  ipa: string;
  example: { sv: string; en: string };
  tags: string[];
}

// Conjunctions are closed-class words and carry no morphology. Stage A1 has no
// conjunction entries, so every conjunction of this unit is new. Words that
// A1/A2 already hold under another part of speech (adv:när, adv:sedan) are
// reused by id in the unit and are not redefined here.
function conj(spec: BaseSpec): LexiconEntry {
  return {
    id: `conj:${spec.lemma}`,
    lemma: spec.lemma,
    en: spec.en,
    pos: 'conj',
    unitId: 'u18',
    stage: 'A2',
    ipa: spec.ipa,
    example: spec.example,
    tags: spec.tags,
  };
}

interface NounSpec extends BaseSpec {
  gender: 'en' | 'ett';
  declension: 2 | 3 | 6 | 'uncount';
  defSg: string;
  indefPl?: string;
  defPl?: string;
}

// Explicit forms for every noun, so definite forms never rely on heuristics.
function noun(spec: NounSpec): LexiconEntry {
  return {
    id: `noun:${spec.lemma}`,
    lemma: spec.lemma,
    en: spec.en,
    pos: 'noun',
    unitId: 'u18',
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
        ...(spec.indefPl !== undefined ? { indefPl: spec.indefPl } : {}),
        ...(spec.defPl !== undefined ? { defPl: spec.defPl } : {}),
      },
    },
  };
}

interface AdjSpec extends BaseSpec {
  neuter: string;
  plDef: string;
}

function adj(spec: AdjSpec): LexiconEntry {
  return {
    id: `adj:${spec.lemma}`,
    lemma: spec.lemma,
    en: spec.en,
    pos: 'adj',
    unitId: 'u18',
    stage: 'A2',
    ipa: spec.ipa,
    example: spec.example,
    tags: spec.tags,
    morph: {
      pos: 'adj',
      forms: { common: spec.lemma, neuter: spec.neuter, plDef: spec.plDef },
    },
  };
}

export const U18_LEXICON: LexiconEntry[] = [
  // Subordinators (conjunction + subject + verb).
  conj({
    lemma: 'att', en: 'that', ipa: '/at/',
    example: { sv: 'Jag tycker att sillen smakar gott.', en: 'I think that the herring tastes good.' },
    tags: ['clause-order', 'conjunctions', 'subordinator'],
  }),
  conj({
    lemma: 'om', en: 'if, whether', ipa: '/ɔm/',
    example: { sv: 'Hon frågar om middagen är klar.', en: 'She asks whether dinner is ready.' },
    tags: ['clause-order', 'conjunctions', 'subordinator'],
  }),
  conj({
    lemma: 'eftersom', en: 'because, since', ipa: '/ˈɛftɛˌʂɔm/',
    example: { sv: 'Eftersom det regnar äter vi inne.', en: 'Because it is raining, we eat indoors.' },
    tags: ['clause-order', 'conjunctions', 'subordinator', 'reason'],
  }),
  conj({
    lemma: 'därför att', en: 'because', ipa: '/ˈdɛːrˌføːr ˈat/',
    example: { sv: 'Vi stannar hemma därför att barnet är sjukt.', en: 'We are staying at home because the child is ill.' },
    tags: ['clause-order', 'conjunctions', 'subordinator', 'reason'],
  }),
  conj({
    lemma: 'innan', en: 'before', ipa: '/ˈɪnan/',
    example: { sv: 'Tvätta händerna innan du äter.', en: 'Wash your hands before you eat.' },
    tags: ['clause-order', 'conjunctions', 'subordinator', 'time'],
  }),
  conj({
    lemma: 'medan', en: 'while, whereas', ipa: '/ˈmeːdan/',
    example: { sv: 'Medan pappa lagar maten dukar jag bordet.', en: 'While dad is cooking, I set the table.' },
    tags: ['clause-order', 'conjunctions', 'subordinator', 'time'],
  }),
  conj({
    lemma: 'fast', en: 'although, even though (informal)', ipa: '/fast/',
    example: { sv: 'Jag är hungrig fast jag nyss åt.', en: 'I am hungry even though I ate a moment ago.' },
    tags: ['clause-order', 'conjunctions', 'subordinator', 'concession'],
  }),
  conj({
    lemma: 'fastän', en: 'although', ipa: '/fastˈɛn/',
    example: { sv: 'Fastän det är kallt går vi ut.', en: 'Although it is cold, we are going out.' },
    tags: ['clause-order', 'conjunctions', 'subordinator', 'concession'],
  }),
  conj({
    lemma: 'trots att', en: 'despite the fact that, although', ipa: '/ˈtrɔts ˈat/',
    example: { sv: 'Hon gick på promenad trots att det regnade.', en: 'She went for a walk even though it was raining.' },
    tags: ['clause-order', 'conjunctions', 'subordinator', 'concession'],
  }),
  conj({
    lemma: 'ifall', en: 'in case, if', ipa: '/ɪˈfal/',
    example: { sv: 'Ta med en jacka ifall det blir kallt.', en: 'Bring a jacket in case it gets cold.' },
    tags: ['clause-order', 'conjunctions', 'subordinator', 'condition'],
  }),
  conj({
    lemma: 'även om', en: 'even if, even though', ipa: '/ˈɛːvɛn ˈɔm/',
    example: { sv: 'Jag äter gärna sill även om min bror inte gör det.', en: 'I like eating herring even if my brother does not.' },
    tags: ['clause-order', 'conjunctions', 'subordinator', 'concession'],
  }),
  conj({
    lemma: 'så att', en: 'so that', ipa: '/ˈsoː ˈat/',
    example: { sv: 'Ställ fisken i kylskåpet så att den håller sig fräsch.', en: 'Put the fish in the fridge so that it stays fresh.' },
    tags: ['clause-order', 'conjunctions', 'subordinator', 'purpose'],
  }),
  conj({
    lemma: 'för att', en: 'in order to; because', ipa: '/ˈføːr ˈat/',
    example: { sv: 'Hon kokar kaffe för att gästerna ska få något varmt.', en: 'She makes coffee so that the guests get something warm.' },
    tags: ['clause-order', 'conjunctions', 'subordinator', 'purpose'],
  }),

  // Coordinators (main clause + main clause, no change of word order).
  conj({
    lemma: 'och', en: 'and', ipa: '/ɔ/',
    example: { sv: 'Vi äter köttbullar och potatis.', en: 'We eat meatballs and potatoes.' },
    tags: ['clause-order', 'conjunctions', 'coordinator'],
  }),
  conj({
    lemma: 'men', en: 'but', ipa: '/mɛn/',
    example: { sv: 'Sillen är salt, men jag tycker om den.', en: 'The herring is salty, but I like it.' },
    tags: ['clause-order', 'conjunctions', 'coordinator'],
  }),
  conj({
    lemma: 'eller', en: 'or', ipa: '/ˈɛlɛr/',
    example: { sv: 'Vill du ha kaffe eller te?', en: 'Would you like coffee or tea?' },
    tags: ['clause-order', 'conjunctions', 'coordinator'],
  }),
  conj({
    lemma: 'utan', en: 'but (rather); without', ipa: '/ˈɵːtan/',
    example: { sv: 'Hon dricker inte kaffe, utan te.', en: 'She does not drink coffee, but tea.' },
    tags: ['clause-order', 'conjunctions', 'coordinator'],
  }),
  conj({
    lemma: 'för', en: 'for, because (coordinator)', ipa: '/føːr/',
    example: { sv: 'Vi åker hem nu, för det börjar bli sent.', en: 'We are going home now, for it is getting late.' },
    tags: ['clause-order', 'conjunctions', 'coordinator', 'reason'],
  }),
  conj({
    lemma: 'så', en: 'so (coordinator)', ipa: '/soː/',
    example: { sv: 'Det regnade, så vi stannade inne.', en: 'It was raining, so we stayed indoors.' },
    tags: ['clause-order', 'conjunctions', 'coordinator', 'result'],
  }),

  // Adjectives.
  adj({
    lemma: 'oskyldig', en: 'innocent', ipa: '/ˈuːˌɧʏldɪɡ/', neuter: 'oskyldigt', plDef: 'oskyldiga',
    example: { sv: 'Den misstänkte säger att han är oskyldig.', en: 'The suspect says that he is innocent.' },
    tags: ['character'],
  }),
  adj({
    lemma: 'självisk', en: 'selfish', ipa: '/ˈɧɛlvɪsk/', neuter: 'själviskt', plDef: 'själviska',
    example: { sv: 'Det var själviskt att äta alla bullarna själv.', en: 'It was selfish to eat all the buns yourself.' },
    tags: ['character'],
  }),
  adj({
    lemma: 'framgångsrik', en: 'successful', ipa: '/ˈframɡɔŋsˌriːk/', neuter: 'framgångsrikt', plDef: 'framgångsrika',
    example: { sv: 'Hon driver ett framgångsrikt bageri i stan.', en: 'She runs a successful bakery in town.' },
    tags: ['character', 'work'],
  }),
  adj({
    lemma: 'arg', en: 'angry', ipa: '/arj/', neuter: 'argt', plDef: 'arga',
    example: { sv: 'Min bror blev arg eftersom jag åt hans bulle.', en: 'My brother got angry because I ate his bun.' },
    tags: ['character', 'feelings'],
  }),

  // Food and everyday nouns.
  noun({
    lemma: 'promenad', en: 'walk, stroll', ipa: '/prɔmɛˈnɑːd/', gender: 'en', declension: 3,
    defSg: 'promenaden', indefPl: 'promenader', defPl: 'promenaderna',
    example: { sv: 'Vi tar en promenad när middagen är klar.', en: 'We take a walk when dinner is finished.' },
    tags: ['activities'],
  }),
  noun({
    lemma: 'maträtt', en: 'dish (of food)', ipa: '/ˈmɑːtˌrɛt/', gender: 'en', declension: 3,
    defSg: 'maträtten', indefPl: 'maträtter', defPl: 'maträtterna',
    example: { sv: 'Köttbullar är en klassisk svensk maträtt.', en: 'Meatballs are a classic Swedish dish.' },
    tags: ['food'],
  }),
  noun({
    lemma: 'köttbulle', en: 'meatball', ipa: '/ˈɕœtˌbɵlɛ/', gender: 'en', declension: 2,
    defSg: 'köttbullen', indefPl: 'köttbullar', defPl: 'köttbullarna',
    example: { sv: 'Han åt tio köttbullar med lingonsylt.', en: 'He ate ten meatballs with lingonberry jam.' },
    tags: ['food'],
  }),
  noun({
    lemma: 'knäckebröd', en: 'crispbread', ipa: '/ˈknɛkɛˌbrøːd/', gender: 'ett', declension: 6,
    defSg: 'knäckebrödet', indefPl: 'knäckebröd', defPl: 'knäckebröden',
    example: { sv: 'Jag äter knäckebröd med ost till frukost.', en: 'I eat crispbread with cheese for breakfast.' },
    tags: ['food'],
  }),
  noun({
    lemma: 'sill', en: 'herring', ipa: '/sɪl/', gender: 'en', declension: 'uncount',
    defSg: 'sillen',
    example: { sv: 'Till midsommar äter många sill med potatis.', en: 'Many people eat herring with potatoes at midsummer.' },
    tags: ['food', 'fish'],
  }),
  noun({
    lemma: 'lax', en: 'salmon', ipa: '/laks/', gender: 'en', declension: 2,
    defSg: 'laxen', indefPl: 'laxar', defPl: 'laxarna',
    example: { sv: 'Vi åt rökt lax med dill till middag.', en: 'We had smoked salmon with dill for dinner.' },
    tags: ['food', 'fish'],
  }),
  noun({
    lemma: 'svamp', en: 'mushroom; fungus', ipa: '/svamp/', gender: 'en', declension: 2,
    defSg: 'svampen', indefPl: 'svampar', defPl: 'svamparna',
    example: { sv: 'Hon hittade en stor svamp under granen.', en: 'She found a big mushroom under the spruce.' },
    tags: ['food', 'nature'],
  }),
  noun({
    lemma: 'bär', en: 'berry', ipa: '/bɛːr/', gender: 'ett', declension: 6,
    defSg: 'bäret', indefPl: 'bär', defPl: 'bären',
    example: { sv: 'Barnen plockade bär hela eftermiddagen.', en: 'The children picked berries all afternoon.' },
    tags: ['food', 'nature'],
  }),
  noun({
    lemma: 'kylskåp', en: 'fridge, refrigerator', ipa: '/ˈɕyːlˌskoːp/', gender: 'ett', declension: 6,
    defSg: 'kylskåpet', indefPl: 'kylskåp', defPl: 'kylskåpen',
    example: { sv: 'Mjölken står i kylskåpet.', en: 'The milk is in the fridge.' },
    tags: ['food', 'home'],
  }),
];
