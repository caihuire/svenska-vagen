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
  declension: 1 | 2 | 3 | 6 | 'irreg' | 'uncount';
  defSg: string;
  indefPl?: string;
  defPl?: string;
}

interface AdjSpec extends BaseSpec {
  neuter: string;
  plDef: string;
}

interface VerbSpec extends BaseSpec {
  forms: { inf: string; imp: string; pres: string; past: string; supine: string };
}

// Seed words already in Stage A1 / earlier A2 slices (reused by id in the unit,
// not duplicated here): hemsida, bio, vägg, trafik, bil, skola, bok, flicka, läkare,
// lampa, skärm, hand, arbete, stad, kust, turist, fri, lycklig. The first four
// nouns below (lärare, lön, trädgård, hus) are extra component words that the
// grammar cards use to explain compounds. Every noun carries explicit forms.
function noun(spec: NounSpec): LexiconEntry {
  return {
    id: `noun:${spec.lemma}`,
    lemma: spec.lemma,
    en: spec.en,
    pos: 'noun',
    unitId: 'u25',
    stage: 'A2',
    ipa: spec.ipa,
    example: spec.example,
    tags: ['word-formation', ...spec.tags],
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

function adj(spec: AdjSpec): LexiconEntry {
  return {
    id: `adj:${spec.lemma}`,
    lemma: spec.lemma,
    en: spec.en,
    pos: 'adj',
    unitId: 'u25',
    stage: 'A2',
    ipa: spec.ipa,
    example: spec.example,
    tags: ['word-formation', ...spec.tags],
    morph: {
      pos: 'adj',
      forms: { common: spec.lemma, neuter: spec.neuter, plDef: spec.plDef },
    },
  };
}

function verb(spec: VerbSpec): LexiconEntry {
  return {
    id: `verb:${spec.lemma}`,
    lemma: spec.lemma,
    en: spec.en,
    pos: 'verb',
    unitId: 'u25',
    stage: 'A2',
    ipa: spec.ipa,
    example: spec.example,
    tags: ['word-formation', ...spec.tags],
    morph: { pos: 'verb', group: '1', forms: spec.forms },
  };
}

export const U25_LEXICON: LexiconEntry[] = [
  // Component words used to explain compounds
  noun({
    lemma: 'lärare', en: 'teacher', ipa: '/ˈlæːrarɛ/', gender: 'en', declension: 6,
    defSg: 'läraren', indefPl: 'lärare', defPl: 'lärarna',
    example: { sv: 'Läraren rättar proven i kväll.', en: 'The teacher is marking the tests this evening.' },
    tags: ['people', 'work'],
  }),
  noun({
    lemma: 'lön', en: 'salary, wage', ipa: '/løːn/', gender: 'en', declension: 3,
    defSg: 'lönen', indefPl: 'löner', defPl: 'lönerna',
    example: { sv: 'Lönen kommer den tjugofemte varje månad.', en: 'The salary arrives on the 25th of every month.' },
    tags: ['work', 'money'],
  }),
  noun({
    lemma: 'trädgård', en: 'garden', ipa: '/ˈtrɛːɡoːɖ/', gender: 'en', declension: 2,
    defSg: 'trädgården', indefPl: 'trädgårdar', defPl: 'trädgårdarna',
    example: { sv: 'Det växer många blommor i trädgården.', en: 'Many flowers grow in the garden.' },
    tags: ['home'],
  }),
  noun({
    lemma: 'hus', en: 'house, building', ipa: '/hʉːs/', gender: 'ett', declension: 6,
    defSg: 'huset', indefPl: 'hus', defPl: 'husen',
    example: { sv: 'Huset ligger nära stranden.', en: 'The house is close to the beach.' },
    tags: ['home'],
  }),

  // Seed words
  noun({
    lemma: 'blogg', en: 'blog', ipa: '/ˈblɔɡː/', gender: 'en', declension: 2,
    defSg: 'bloggen', indefPl: 'bloggar', defPl: 'bloggarna',
    example: { sv: 'Hon skriver en blogg om resor.', en: 'She writes a blog about travel.' },
    tags: ['borrowing', 'technology'],
  }),
  noun({
    lemma: 'app', en: 'app', ipa: '/ˈapː/', gender: 'en', declension: 2,
    defSg: 'appen', indefPl: 'appar', defPl: 'apparna',
    example: { sv: 'Jag laddar ner en ny app till telefonen.', en: 'I am downloading a new app for the phone.' },
    tags: ['borrowing', 'abbreviation', 'technology'],
  }),
  noun({
    lemma: 'brandvägg', en: 'firewall', ipa: '/ˈbrandˌvɛɡː/', gender: 'en', declension: 2,
    defSg: 'brandväggen', indefPl: 'brandväggar', defPl: 'brandväggarna',
    example: { sv: 'Brandväggen skyddar datorn mot virus.', en: 'The firewall protects the computer against viruses.' },
    tags: ['compound', 'technology'],
  }),
  noun({
    lemma: 'krockkudde', en: 'airbag', ipa: '/ˈkrɔkˌkɵdːɛ/', gender: 'en', declension: 2,
    defSg: 'krockkudden', indefPl: 'krockkuddar', defPl: 'krockkuddarna',
    example: { sv: 'Alla nya bilar har en krockkudde.', en: 'All new cars have an airbag.' },
    tags: ['compound', 'traffic'],
  }),
  noun({
    lemma: 'nolltolerans', en: 'zero tolerance', ipa: '/ˈnɔlːtʊlɛˌrɑns/', gender: 'en', declension: 'uncount',
    defSg: 'nolltoleransen',
    example: { sv: 'Skolan har nolltolerans mot mobbning.', en: 'The school has zero tolerance for bullying.' },
    tags: ['compound', 'society'],
  }),
  noun({
    lemma: 'radhus', en: 'terraced house', ipa: '/ˈrɑːdˌhʉːs/', gender: 'ett', declension: 6,
    defSg: 'radhuset', indefPl: 'radhus', defPl: 'radhusen',
    example: { sv: 'Vi bor i ett radhus i utkanten av staden.', en: 'We live in a terraced house on the edge of town.' },
    tags: ['compound', 'home'],
  }),
  noun({
    lemma: 'storstadstrafik', en: 'big-city traffic', ipa: '/ˈstuːrstɑːdstraˌfiːk/', gender: 'en', declension: 'uncount',
    defSg: 'storstadstrafiken',
    example: { sv: 'Storstadstrafiken är ofta tung på morgonen.', en: 'Big-city traffic is often heavy in the morning.' },
    tags: ['compound', 'traffic'],
  }),
  noun({
    lemma: 'lärarlön', en: "teacher's salary", ipa: '/ˈlæːrarˌløːn/', gender: 'en', declension: 3,
    defSg: 'lärarlönen', indefPl: 'lärarlöner', defPl: 'lärarlönerna',
    example: { sv: 'Lärarlönen har höjts i år.', en: "The teachers' salary has been raised this year." },
    tags: ['compound', 'work'],
  }),
  noun({
    lemma: 'trapphus', en: 'stairwell', ipa: '/ˈtrapˌhʉːs/', gender: 'ett', declension: 6,
    defSg: 'trapphuset', indefPl: 'trapphus', defPl: 'trapphusen',
    example: { sv: 'Det luktar kaffe i trapphuset.', en: 'There is a smell of coffee in the stairwell.' },
    tags: ['compound', 'home'],
  }),
  noun({
    lemma: 'frihet', en: 'freedom', ipa: '/ˈfriːˌheːt/', gender: 'en', declension: 3,
    defSg: 'friheten', indefPl: 'friheter', defPl: 'friheterna',
    example: { sv: 'Många unga människor längtar efter frihet.', en: 'Many young people long for freedom.' },
    tags: ['affix', 'abstract'],
  }),
  adj({
    lemma: 'olycklig', en: 'unhappy', ipa: '/ˈuːˌlʏkːlɪɡ/', neuter: 'olyckligt', plDef: 'olyckliga',
    example: { sv: 'Han såg olycklig ut efter matchen.', en: 'He looked unhappy after the match.' },
    tags: ['affix', 'feelings'],
  }),
  verb({
    lemma: 'bila', en: 'to travel by car (informal)', ipa: '/ˈbiːla/',
    example: { sv: 'Vi brukar bila till Dalarna på sommaren.', en: 'We usually go by car to Dalarna in the summer.' },
    tags: ['affix', 'informal', 'travel'],
    forms: { inf: 'bila', imp: 'bila', pres: 'bilar', past: 'bilade', supine: 'bilat' },
  }),
  noun({
    lemma: 'skolflicka', en: 'schoolgirl', ipa: '/ˈskuːlˌflɪkːa/', gender: 'en', declension: 1,
    defSg: 'skolflickan', indefPl: 'skolflickor', defPl: 'skolflickorna',
    example: { sv: 'Skolflickan går till bussen varje morgon.', en: 'The schoolgirl walks to the bus every morning.' },
    tags: ['compound', 'school'],
  }),
  noun({
    lemma: 'trädgårdsmästare', en: 'gardener (professional)', ipa: '/ˈtrɛːɡoːdsˌmɛstarɛ/', gender: 'en', declension: 6,
    defSg: 'trädgårdsmästaren', indefPl: 'trädgårdsmästare', defPl: 'trädgårdsmästarna',
    example: { sv: 'Trädgårdsmästaren planterar tulpaner i april.', en: 'The gardener plants tulips in April.' },
    tags: ['compound', 'work'],
  }),
  noun({
    lemma: 'läkarmottagning', en: "doctor's surgery, clinic", ipa: '/ˈlɛːkarˌmuːtɑɡnɪŋ/', gender: 'en', declension: 2,
    defSg: 'läkarmottagningen', indefPl: 'läkarmottagningar', defPl: 'läkarmottagningarna',
    example: { sv: 'Läkarmottagningen öppnar klockan åtta.', en: "The doctor's surgery opens at eight o'clock." },
    tags: ['compound', 'health'],
  }),
  noun({
    lemma: 'lampskärm', en: 'lampshade', ipa: '/ˈlampˌɧærm/', gender: 'en', declension: 2,
    defSg: 'lampskärmen', indefPl: 'lampskärmar', defPl: 'lampskärmarna',
    example: { sv: 'Lampskärmen i vardagsrummet är gul.', en: 'The lampshade in the living room is yellow.' },
    tags: ['compound', 'home'],
  }),
  noun({
    lemma: 'arbetsledare', en: 'supervisor, foreman', ipa: '/ˈarbɛtsˌleːdarɛ/', gender: 'en', declension: 6,
    defSg: 'arbetsledaren', indefPl: 'arbetsledare', defPl: 'arbetsledarna',
    example: { sv: 'Arbetsledaren berättar vad vi ska göra i dag.', en: 'The supervisor tells us what we are going to do today.' },
    tags: ['compound', 'work'],
  }),
  noun({
    lemma: 'handduk', en: 'towel', ipa: '/ˈhanˌdʉːk/', gender: 'en', declension: 2,
    defSg: 'handduken', indefPl: 'handdukar', defPl: 'handdukarna',
    example: { sv: 'Jag har glömt handduken på stranden.', en: 'I have forgotten the towel on the beach.' },
    tags: ['compound', 'home'],
  }),
  noun({
    lemma: 'järnvägskorsning', en: 'railway crossing', ipa: '/ˈjæːrnvɛːɡsˌkɔʂnɪŋ/', gender: 'en', declension: 2,
    defSg: 'järnvägskorsningen', indefPl: 'järnvägskorsningar', defPl: 'järnvägskorsningarna',
    example: { sv: 'Bilen stannar vid järnvägskorsningen.', en: 'The car stops at the railway crossing.' },
    tags: ['compound', 'traffic'],
  }),
  noun({
    lemma: 'skolbok', en: 'school book, textbook', ipa: '/ˈskuːlˌbuːk/', gender: 'en', declension: 'irreg',
    defSg: 'skolboken', indefPl: 'skolböcker', defPl: 'skolböckerna',
    example: { sv: 'Skolboken ligger kvar i väskan.', en: 'The school book is still in the bag.' },
    tags: ['compound', 'school', 'irregular-plural'],
  }),
  noun({
    lemma: 'förlag', en: 'publishing house', ipa: '/ˈføːrˌlɑːɡ/', gender: 'ett', declension: 6,
    defSg: 'förlaget', indefPl: 'förlag', defPl: 'förlagen',
    example: { sv: 'Förlaget ger ut tio nya böcker varje år.', en: 'The publishing house publishes ten new books every year.' },
    tags: ['culture', 'work'],
  }),
  noun({
    lemma: 'biograf', en: 'cinema (full form of bio)', ipa: '/bɪʊˈɡrɑːf/', gender: 'en', declension: 3,
    defSg: 'biografen', indefPl: 'biografer', defPl: 'biograferna',
    example: { sv: 'Biografen visar en ny film i kväll.', en: 'The cinema is showing a new film this evening.' },
    tags: ['abbreviation', 'culture'],
  }),
  noun({
    lemma: 'blyertspenna', en: 'pencil', ipa: '/ˈblyːæʈsˌpɛnːa/', gender: 'en', declension: 1,
    defSg: 'blyertspennan', indefPl: 'blyertspennor', defPl: 'blyertspennorna',
    example: { sv: 'Skriv med blyertspenna, så kan du sudda.', en: 'Write with a pencil, then you can erase it.' },
    tags: ['compound', 'school'],
  }),
  noun({
    lemma: 'flextid', en: 'flexible working hours, flexitime', ipa: '/ˈflɛksˌtiːd/', gender: 'en', declension: 'uncount',
    defSg: 'flextiden',
    example: { sv: 'Med flextid kan man börja jobba lite senare.', en: 'With flexitime you can start work a little later.' },
    tags: ['compound', 'abbreviation', 'work'],
  }),
  noun({
    lemma: 'moms', en: 'VAT, sales tax', ipa: '/ˈmɔmːs/', gender: 'en', declension: 'uncount',
    defSg: 'momsen',
    example: { sv: 'Priset på menyn inkluderar moms.', en: 'The price on the menu includes VAT.' },
    tags: ['abbreviation', 'money'],
  }),
  noun({
    lemma: 'rea', en: 'sale (reduced prices)', ipa: '/ˈreːa/', gender: 'en', declension: 1,
    defSg: 'rean', indefPl: 'reor', defPl: 'reorna',
    example: { sv: 'Kappan kostar bara halva priset på rean.', en: 'The coat costs only half price in the sale.' },
    tags: ['abbreviation', 'money'],
  }),
  noun({
    lemma: 'dialekt', en: 'dialect', ipa: '/dɪaˈlɛkt/', gender: 'en', declension: 3,
    defSg: 'dialekten', indefPl: 'dialekter', defPl: 'dialekterna',
    example: { sv: 'Gotlänningarna har en egen dialekt.', en: 'The people of Gotland have a dialect of their own.' },
    tags: ['borrowing', 'language'],
  }),
  noun({
    lemma: 'ringmur', en: 'ring wall, town wall', ipa: '/ˈrɪŋˌmʉːr/', gender: 'en', declension: 2,
    defSg: 'ringmuren', indefPl: 'ringmurar', defPl: 'ringmurarna',
    example: { sv: 'En gammal ringmur omger staden.', en: 'An old ring wall surrounds the town.' },
    tags: ['compound', 'history'],
  }),
  noun({
    lemma: 'sandstrand', en: 'sandy beach', ipa: '/ˈsandˌstrand/', gender: 'en', declension: 'irreg',
    defSg: 'sandstranden', indefPl: 'sandstränder', defPl: 'sandstränderna',
    example: { sv: 'Det finns många fina sandstränder på ön.', en: 'There are many fine sandy beaches on the island.' },
    tags: ['compound', 'nature', 'irregular-plural'],
  }),
];
