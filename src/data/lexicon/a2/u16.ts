import type { LexiconEntry } from '../../../types/index';

interface WordSpec {
  lemma: string;
  en: string;
  ipa: string;
  example: { sv: string; en: string };
  tags: string[];
}

interface AdjSpec extends WordSpec {
  neuter: string;
  plDef: string;
}

// Explicit forms for every adjective, so -el/-en/-er stems (mogen -> mogna,
// munter -> muntra) never rely on heuristics.
function adj(spec: AdjSpec): LexiconEntry {
  return {
    id: `adj:${spec.lemma}`,
    lemma: spec.lemma,
    en: spec.en,
    pos: 'adj',
    unitId: 'u16',
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

interface NounSpec extends WordSpec {
  gender: 'en' | 'ett';
  declension: 1 | 2 | 3 | 5 | 6;
  defSg: string;
  indefPl: string;
  defPl: string;
}

function noun(spec: NounSpec): LexiconEntry {
  return {
    id: `noun:${spec.lemma}`,
    lemma: spec.lemma,
    en: spec.en,
    pos: 'noun',
    unitId: 'u16',
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

// 'djup' (deep) already exists in Stage A1 and is reused by id in the unit.
export const U16_LEXICON: LexiconEntry[] = [
  adj({
    lemma: 'trevlig', en: 'nice, pleasant', ipa: '/ˈtreːvlɪɡ/', neuter: 'trevligt', plDef: 'trevliga',
    example: { sv: 'Den trevliga grannen hälsar alltid på mig.', en: 'The nice neighbour always says hello to me.' },
    tags: ['adj-definite', 'people'],
  }),
  adj({
    lemma: 'bekväm', en: 'comfortable', ipa: '/bɛˈkvɛːm/', neuter: 'bekvämt', plDef: 'bekväma',
    example: { sv: 'Jag älskar den bekväma fåtöljen i vardagsrummet.', en: 'I love the comfortable armchair in the living room.' },
    tags: ['adj-definite', 'home'],
  }),
  adj({
    lemma: 'färsk', en: 'fresh', ipa: '/fæʂk/', neuter: 'färskt', plDef: 'färska',
    example: { sv: 'De färska bullarna doftar gott.', en: 'The fresh buns smell good.' },
    tags: ['adj-definite', 'food'],
  }),
  adj({
    lemma: 'mogen', en: 'ripe, mature', ipa: '/ˈmuːɡɛn/', neuter: 'moget', plDef: 'mogna',
    example: { sv: 'Vi plockade de mogna jordgubbarna i trädgården.', en: 'We picked the ripe strawberries in the garden.' },
    tags: ['adj-definite', 'food', 'irregular-stem'],
  }),
  adj({
    lemma: 'tjusig', en: 'smart, stylish', ipa: '/ˈɕʉːsɪɡ/', neuter: 'tjusigt', plDef: 'tjusiga',
    example: { sv: 'Min bror köpte en tjusig kostym till bröllopet.', en: 'My brother bought a smart suit for the wedding.' },
    tags: ['adj-definite', 'clothes'],
  }),
  adj({
    lemma: 'besvärlig', en: 'troublesome, awkward', ipa: '/bɛˈsvæːrlɪɡ/', neuter: 'besvärligt', plDef: 'besvärliga',
    example: { sv: 'Det besvärliga problemet löstes först på fredagen.', en: 'The awkward problem was not solved until Friday.' },
    tags: ['adj-definite', 'work'],
  }),
  adj({
    lemma: 'viktig', en: 'important', ipa: '/ˈvɪktɪɡ/', neuter: 'viktigt', plDef: 'viktiga',
    example: { sv: 'Den viktiga frågan tas upp på måndag.', en: 'The important question will be raised on Monday.' },
    tags: ['adj-definite', 'work'],
  }),
  adj({
    lemma: 'ovanlig', en: 'unusual', ipa: '/ˈuːvanlɪɡ/', neuter: 'ovanligt', plDef: 'ovanliga',
    example: { sv: 'Det ovanliga ljudet kom från källaren.', en: 'The unusual sound came from the cellar.' },
    tags: ['adj-definite', 'descriptive'],
  }),
  adj({
    lemma: 'underbar', en: 'wonderful', ipa: '/ˈɵndɛrˌbɑːr/', neuter: 'underbart', plDef: 'underbara',
    example: { sv: 'Vi hade en underbar semester vid havet.', en: 'We had a wonderful holiday by the sea.' },
    tags: ['adj-definite', 'descriptive'],
  }),
  adj({
    lemma: 'kortfattad', en: 'brief, concise', ipa: '/ˈkɔʈˌfatːad/', neuter: 'kortfattat', plDef: 'kortfattade',
    example: { sv: 'Läraren gav oss en kortfattad förklaring.', en: 'The teacher gave us a concise explanation.' },
    tags: ['adj-definite', 'participle-form', 'work'],
  }),
  adj({
    lemma: 'begagnad', en: 'second-hand, used', ipa: '/bɛˈɡaŋnad/', neuter: 'begagnat', plDef: 'begagnade',
    example: { sv: 'De begagnade möblerna var billiga och fina.', en: 'The second-hand furniture was cheap and nice.' },
    tags: ['adj-definite', 'participle-form', 'shopping'],
  }),
  adj({
    lemma: 'berömd', en: 'famous, renowned', ipa: '/bɛˈrøːmd/', neuter: 'berömt', plDef: 'berömda',
    example: { sv: 'Den berömda sångerskan bor i en liten stad.', en: 'The famous singer lives in a small town.' },
    tags: ['adj-definite', 'participle-form', 'culture'],
  }),
  adj({
    lemma: 'älskad', en: 'beloved', ipa: '/ˈɛlskad/', neuter: 'älskat', plDef: 'älskade',
    example: { sv: 'Den älskade farmodern fyllde nittio år.', en: 'The beloved grandmother turned ninety.' },
    tags: ['adj-definite', 'participle-form', 'people'],
  }),
  adj({
    lemma: 'munter', en: 'cheerful, jolly', ipa: '/ˈmɵntɛr/', neuter: 'muntert', plDef: 'muntra',
    example: { sv: 'Det muntra sällskapet sjöng hela kvällen.', en: 'The cheerful company sang all evening.' },
    tags: ['adj-definite', 'people', 'irregular-stem'],
  }),
  adj({
    lemma: 'bred', en: 'wide, broad', ipa: '/breːd/', neuter: 'brett', plDef: 'breda',
    example: { sv: 'Den breda floden delar staden i två delar.', en: 'The wide river divides the town into two parts.' },
    tags: ['adj-definite', 'descriptive'],
  }),
  adj({
    lemma: 'smal', en: 'narrow, thin', ipa: '/smɑːl/', neuter: 'smalt', plDef: 'smala',
    example: { sv: 'Den smala vägen leder till en gammal gård.', en: 'The narrow road leads to an old farm.' },
    tags: ['adj-definite', 'descriptive'],
  }),
  adj({
    lemma: 'ren', en: 'clean, pure', ipa: '/reːn/', neuter: 'rent', plDef: 'rena',
    example: { sv: 'Jag la de rena handdukarna i skåpet.', en: 'I put the clean towels in the cupboard.' },
    tags: ['adj-definite', 'home'],
  }),
  adj({
    lemma: 'smutsig', en: 'dirty', ipa: '/ˈsmɵtsɪɡ/', neuter: 'smutsigt', plDef: 'smutsiga',
    example: { sv: 'Hunden sprang in med de smutsiga tassarna.', en: 'The dog ran in with its dirty paws.' },
    tags: ['adj-definite', 'home'],
  }),
  adj({
    lemma: 'söt', en: 'sweet, cute', ipa: '/søːt/', neuter: 'sött', plDef: 'söta',
    example: { sv: 'Den söta kakan räckte till alla gäster.', en: 'The sweet cake was enough for all the guests.' },
    tags: ['adj-definite', 'food'],
  }),
  adj({
    lemma: 'sur', en: 'sour; grumpy', ipa: '/sʉːr/', neuter: 'surt', plDef: 'sura',
    example: { sv: 'De sura citronerna passar bra i teet.', en: 'The sour lemons go well in the tea.' },
    tags: ['adj-definite', 'food'],
  }),
  noun({
    lemma: 'kund', en: 'customer', ipa: '/kɵnd/', gender: 'en', declension: 3,
    defSg: 'kunden', indefPl: 'kunder', defPl: 'kunderna',
    example: { sv: 'Den nöjda kunden kom tillbaka dagen efter.', en: 'The satisfied customer came back the next day.' },
    tags: ['work', 'shopping'],
  }),
  noun({
    lemma: 'företag', en: 'company, business', ipa: '/ˈfœːrɛˌtɑːɡ/', gender: 'ett', declension: 6,
    defSg: 'företaget', indefPl: 'företag', defPl: 'företagen',
    example: { sv: 'Det nya företaget har femton anställda.', en: 'The new company has fifteen employees.' },
    tags: ['work'],
  }),
  noun({
    lemma: 'kontor', en: 'office', ipa: '/kɔnˈtuːr/', gender: 'ett', declension: 6,
    defSg: 'kontoret', indefPl: 'kontor', defPl: 'kontoren',
    example: { sv: 'Det stora kontoret ligger på tredje våningen.', en: 'The large office is on the third floor.' },
    tags: ['work', 'places'],
  }),
  noun({
    lemma: 'konto', en: 'account', ipa: '/ˈkɔnto/', gender: 'ett', declension: 5,
    defSg: 'kontot', indefPl: 'konton', defPl: 'kontona',
    example: { sv: 'Jag har två konton i banken.', en: 'I have two accounts at the bank.' },
    tags: ['work', 'money'],
  }),
  noun({
    lemma: 'kostym', en: 'suit (clothing)', ipa: '/kɔˈstyːm/', gender: 'en', declension: 3,
    defSg: 'kostymen', indefPl: 'kostymer', defPl: 'kostymerna',
    example: { sv: 'Han bär alltid den mörka kostymen på möten.', en: 'He always wears the dark suit to meetings.' },
    tags: ['clothes', 'work'],
  }),
  noun({
    lemma: 'granne', en: 'neighbour', ipa: '/ˈɡranːɛ/', gender: 'en', declension: 2,
    defSg: 'grannen', indefPl: 'grannar', defPl: 'grannarna',
    example: { sv: 'Min granne har en stor trädgård.', en: 'My neighbour has a big garden.' },
    tags: ['people', 'home'],
  }),
  noun({
    lemma: 'utmaning', en: 'challenge', ipa: '/ˈʉːtˌmɑːnɪŋ/', gender: 'en', declension: 2,
    defSg: 'utmaningen', indefPl: 'utmaningar', defPl: 'utmaningarna',
    example: { sv: 'Nästa stora utmaning är att lära sig språket.', en: 'The next big challenge is to learn the language.' },
    tags: ['work', 'abstract'],
  }),
  noun({
    lemma: 'sjuksköterska', en: 'nurse', ipa: '/ˈɧʉːkˌɧøːtɛʂka/', gender: 'en', declension: 1,
    defSg: 'sjuksköterskan', indefPl: 'sjuksköterskor', defPl: 'sjuksköterskorna',
    example: { sv: 'Den snälla sjuksköterskan hjälpte patienten.', en: 'The kind nurse helped the patient.' },
    tags: ['work', 'people'],
  }),
  noun({
    lemma: 'drottning', en: 'queen', ipa: '/ˈdrɔtnɪŋ/', gender: 'en', declension: 2,
    defSg: 'drottningen', indefPl: 'drottningar', defPl: 'drottningarna',
    example: { sv: 'Drottningen höll ett kort tal på slottet.', en: 'The queen gave a short speech at the palace.' },
    tags: ['royalty', 'people'],
  }),
];
