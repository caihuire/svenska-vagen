import type { LexiconEntry } from '../../../types/index';

interface BaseSpec {
  lemma: string;
  en: string;
  ipa: string;
  example: { sv: string; en: string };
  tags: string[];
}

interface AdjSpec extends BaseSpec {
  neuter: string;
  plDef: string;
  indeclinable?: boolean;
}

// Every adjective carries explicit forms. Comparatives are indeclinable
// (en större bil, ett större hus, större hus). Superlatives keep the
// predicate form (-st) in common/neuter and the definite -a form in plDef
// (den största älgen). The mer/mest adjectives have no -are/-ast forms.
function adj(spec: AdjSpec): LexiconEntry {
  return {
    id: `adj:${spec.lemma}`,
    lemma: spec.lemma,
    en: spec.en,
    pos: 'adj',
    unitId: 'u17',
    stage: 'A2',
    ipa: spec.ipa,
    example: spec.example,
    tags: spec.tags,
    morph: {
      pos: 'adj',
      ...(spec.indeclinable ? { indeclinable: true } : {}),
      forms: { common: spec.lemma, neuter: spec.neuter, plDef: spec.plDef },
    },
  };
}

// Base adjective of an irregular pair: explicit comp/sup on top of the three forms.
function baseAdj(spec: AdjSpec & { comp: string; sup: string }): LexiconEntry {
  const entry = adj(spec);
  if (entry.morph?.pos === 'adj' && entry.morph.forms) {
    entry.morph.forms.comp = spec.comp;
    entry.morph.forms.sup = spec.sup;
  }
  return entry;
}

function comparative(lemma: string, en: string, ipa: string, example: { sv: string; en: string }): LexiconEntry {
  return adj({ lemma, en, ipa, example, neuter: lemma, plDef: lemma, indeclinable: true, tags: ['adj-comparison', 'comparative', 'irregular'] });
}

function superlative(lemma: string, definite: string, en: string, ipa: string, example: { sv: string; en: string }): LexiconEntry {
  return adj({ lemma, en, ipa, example, neuter: lemma, plDef: definite, tags: ['adj-comparison', 'superlative', 'irregular'] });
}

interface NounSpec extends BaseSpec {
  gender: 'en' | 'ett';
  declension: 1 | 2 | 3 | 'uncount';
  defSg: string;
  indefPl?: string;
  defPl?: string;
}

function noun(spec: NounSpec): LexiconEntry {
  return {
    id: `noun:${spec.lemma}`,
    lemma: spec.lemma,
    en: spec.en,
    pos: 'noun',
    unitId: 'u17',
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

// Reused from Stage A1 by id (not redefined here): bra, god, liten, gammal,
// stor, lång, ung, hög, låg (their comp/sup forms live on the A1 entries).
export const U17_LEXICON: LexiconEntry[] = [
  // Irregular comparatives and superlatives (separate entries).
  comparative('bättre', 'better', '/ˈbɛtːrɛ/', { sv: 'Min syster simmar bättre än jag.', en: 'My sister swims better than I do.' }),
  superlative('bäst', 'bästa', 'best', '/bɛst/', { sv: 'Av alla lag är vårt lag bäst.', en: 'Of all the teams, our team is the best.' }),
  comparative('sämre', 'worse', '/ˈsɛmːrɛ/', { sv: 'Vädret är sämre i dag än i går.', en: 'The weather is worse today than yesterday.' }),
  superlative('sämst', 'sämsta', 'worst', '/sɛmst/', { sv: 'Han var sämst på matte i klassen.', en: 'He was the worst at maths in the class.' }),
  comparative('äldre', 'older; elderly', '/ˈɛldrɛ/', { sv: 'Min bror är två år äldre än jag.', en: 'My brother is two years older than I am.' }),
  superlative('äldst', 'äldsta', 'oldest', '/ɛldst/', { sv: 'Hon är äldst av syskonen.', en: 'She is the oldest of the siblings.' }),
  comparative('mindre', 'smaller; less', '/ˈmɪndrɛ/', { sv: 'Vår lägenhet är mindre än deras.', en: 'Our flat is smaller than theirs.' }),
  superlative('minst', 'minsta', 'smallest; least', '/mɪnst/', { sv: 'Katten är minst av djuren på gården.', en: 'The cat is the smallest of the animals on the farm.' }),
  comparative('större', 'bigger, larger', '/ˈstøːrɛ/', { sv: 'Älgen är större än hjorten.', en: 'The moose is bigger than the red deer.' }),
  superlative('störst', 'största', 'biggest, largest', '/stœʂt/', { sv: 'Vilken sjö är störst i Sverige?', en: 'Which lake is the largest in Sweden?' }),
  comparative('längre', 'longer; taller; further', '/ˈlɛŋːrɛ/', { sv: 'Vägen hem blev längre än jag trodde.', en: 'The way home turned out longer than I thought.' }),
  superlative('längst', 'längsta', 'longest; tallest; furthest', '/lɛŋst/', { sv: 'Vem har längst hår i klassen?', en: 'Who has the longest hair in the class?' }),
  comparative('yngre', 'younger', '/ˈʏŋːrɛ/', { sv: 'Hennes yngre bror går på dagis.', en: 'Her younger brother goes to nursery.' }),
  superlative('yngst', 'yngsta', 'youngest', '/ʏŋst/', { sv: 'Jag är yngst av tre syskon.', en: 'I am the youngest of three siblings.' }),
  comparative('tyngre', 'heavier', '/ˈtʏŋːrɛ/', { sv: 'Den här väskan är tyngre än min.', en: 'This bag is heavier than mine.' }),
  superlative('tyngst', 'tyngsta', 'heaviest', '/tʏŋst/', { sv: 'Stenen var tyngst av alla.', en: 'The stone was the heaviest of all.' }),
  comparative('högre', 'higher; taller; louder', '/ˈhøːɡrɛ/', { sv: 'Berget i norr är högre än kullen här.', en: 'The mountain in the north is higher than the hill here.' }),
  superlative('högst', 'högsta', 'highest; tallest; loudest', '/høkst/', { sv: 'Vilket berg är högst i Sverige?', en: 'Which mountain is the highest in Sweden?' }),
  comparative('lägre', 'lower', '/ˈlɛːɡrɛ/', { sv: 'Priserna är lägre i butiken på hörnet.', en: 'The prices are lower in the shop on the corner.' }),
  superlative('lägst', 'lägsta', 'lowest', '/lɛkst/', { sv: 'Temperaturen var lägst i januari.', en: 'The temperature was lowest in January.' }),

  // Base adjectives of irregular pairs that A1 does not contain.
  baseAdj({
    lemma: 'dålig', en: 'bad, poor', ipa: '/ˈdoːlɪɡ/', neuter: 'dåligt', plDef: 'dåliga', comp: 'sämre', sup: 'sämst',
    example: { sv: 'Det är dålig sikt i dimman.', en: 'Visibility is poor in the fog.' },
    tags: ['adj-comparison', 'irregular'],
  }),
  baseAdj({
    lemma: 'tung', en: 'heavy', ipa: '/tɵŋ/', neuter: 'tungt', plDef: 'tunga', comp: 'tyngre', sup: 'tyngst',
    example: { sv: 'Älgen är ett tungt djur.', en: 'The moose is a heavy animal.' },
    tags: ['adj-comparison', 'irregular'],
  }),

  // mer/mest adjectives: no -are/-ast forms (comparison is made with mer/mest).
  adj({
    lemma: 'intressant', en: 'interesting', ipa: '/ɪntrɛˈsant/', neuter: 'intressant', plDef: 'intressanta',
    example: { sv: 'Den här boken är mer intressant än filmen.', en: 'This book is more interesting than the film.' },
    tags: ['adj-comparison', 'mer-mest'],
  }),
  adj({
    lemma: 'intelligent', en: 'intelligent', ipa: '/ɪntɛlɪˈɡɛnt/', neuter: 'intelligent', plDef: 'intelligenta',
    example: { sv: 'Hennes hund är mycket intelligent.', en: 'Her dog is very intelligent.' },
    tags: ['adj-comparison', 'mer-mest'],
  }),
  adj({
    lemma: 'modern', en: 'modern', ipa: '/mɔˈdɛːɳ/', neuter: 'modernt', plDef: 'moderna',
    example: { sv: 'Vi bor i ett modernt hus nära stationen.', en: 'We live in a modern house near the station.' },
    tags: ['adj-comparison', 'mer-mest'],
  }),
  adj({
    lemma: 'populär', en: 'popular', ipa: '/pɔpʉˈlɛːr/', neuter: 'populärt', plDef: 'populära',
    example: { sv: 'Fotboll är en populär sport i hela landet.', en: 'Football is a popular sport all over the country.' },
    tags: ['adj-comparison', 'mer-mest'],
  }),
  adj({
    lemma: 'praktisk', en: 'practical', ipa: '/ˈpraktɪsk/', neuter: 'praktiskt', plDef: 'praktiska',
    example: { sv: 'En ryggsäck är praktisk på en lång resa.', en: 'A backpack is practical on a long trip.' },
    tags: ['adj-comparison', 'mer-mest'],
  }),
  adj({
    lemma: 'typisk', en: 'typical', ipa: '/ˈtyːpɪsk/', neuter: 'typiskt', plDef: 'typiska',
    example: { sv: 'Köttbullar är en typisk svensk maträtt.', en: 'Meatballs are a typical Swedish dish.' },
    tags: ['adj-comparison', 'mer-mest'],
  }),
  adj({
    lemma: 'demokratisk', en: 'democratic', ipa: '/dɛmɔˈkrɑːtɪsk/', neuter: 'demokratiskt', plDef: 'demokratiska',
    example: { sv: 'Sverige är ett demokratiskt land.', en: 'Sweden is a democratic country.' },
    tags: ['adj-comparison', 'mer-mest'],
  }),
  adj({
    lemma: 'kritisk', en: 'critical', ipa: '/ˈkriːtɪsk/', neuter: 'kritiskt', plDef: 'kritiska',
    example: { sv: 'Hon är kritisk mot förslaget.', en: 'She is critical of the proposal.' },
    tags: ['adj-comparison', 'mer-mest'],
  }),
  adj({
    lemma: 'spännande', en: 'exciting', ipa: '/ˈspɛnːandɛ/', neuter: 'spännande', plDef: 'spännande', indeclinable: true,
    example: { sv: 'Boken var så spännande att jag läste hela natten.', en: 'The book was so exciting that I read all night.' },
    tags: ['adj-comparison', 'mer-mest', 'indeclinable'],
  }),
  adj({
    lemma: 'komplicerad', en: 'complicated', ipa: '/kɔmplɪˈseːrad/', neuter: 'komplicerat', plDef: 'komplicerade',
    example: { sv: 'Reglerna är lite för komplicerade för mig.', en: 'The rules are a bit too complicated for me.' },
    tags: ['adj-comparison', 'mer-mest'],
  }),

  // Nouns for the reading and the unit examples.
  noun({
    lemma: 'älg', en: 'moose, elk', ipa: '/ɛlj/', gender: 'en', declension: 2,
    defSg: 'älgen', indefPl: 'älgar', defPl: 'älgarna',
    example: { sv: 'Vi såg en älg vid skogsbrynet.', en: 'We saw a moose at the edge of the forest.' },
    tags: ['animals', 'culture'],
  }),
  noun({
    lemma: 'skylt', en: 'sign', ipa: '/ɧʏlt/', gender: 'en', declension: 2,
    defSg: 'skylten', indefPl: 'skyltar', defPl: 'skyltarna',
    example: { sv: 'Skylten vid vägen varnar för vilda djur.', en: 'The sign by the road warns about wild animals.' },
    tags: ['traffic'],
  }),
  noun({
    lemma: 'trafik', en: 'traffic', ipa: '/traˈfiːk/', gender: 'en', declension: 'uncount',
    defSg: 'trafiken',
    example: { sv: 'Trafiken är tät på morgonen.', en: 'The traffic is dense in the morning.' },
    tags: ['traffic'],
  }),
  noun({
    lemma: 'jakt', en: 'hunt, hunting', ipa: '/jakt/', gender: 'en', declension: 3,
    defSg: 'jakten', indefPl: 'jakter', defPl: 'jakterna',
    example: { sv: 'Jakten börjar tidigt på morgonen.', en: 'The hunt starts early in the morning.' },
    tags: ['animals', 'culture'],
  }),
];
