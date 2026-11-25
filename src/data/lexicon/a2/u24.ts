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

interface VerbSpec extends BaseSpec {
  group: '1' | '2a' | '2b' | '4' | 'irreg';
  deponent?: boolean;
  // Every verb carries all five forms explicitly. For -s verbs the "imp" slot
  // repeats the -s form (A1 precedent: finnas -> finns): deponents and passives
  // have no real imperative, so the slot is a placeholder, not a taught form.
  forms: { inf: string; imp: string; pres: string; past: string; supine: string };
}

// None of the seed words exists in Stage A1 or an earlier A2 slice (verb:finna
// in u20 is a different lemma from uppfinna; verb:bygga in u19 is the active
// verb, byggas is the passive lemma). Nouns carry explicit forms.
function noun(spec: NounSpec): LexiconEntry {
  return {
    id: `noun:${spec.lemma}`,
    lemma: spec.lemma,
    en: spec.en,
    pos: 'noun',
    unitId: 'u24',
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

function verb(spec: VerbSpec): LexiconEntry {
  return {
    id: `verb:${spec.lemma}`,
    lemma: spec.lemma,
    en: spec.en,
    pos: 'verb',
    unitId: 'u24',
    stage: 'A2',
    ipa: spec.ipa,
    example: spec.example,
    tags: ['verb-s-passive', ...spec.tags],
    morph: {
      pos: 'verb',
      group: spec.group,
      ...(spec.deponent ? { deponent: true } : {}),
      forms: spec.forms,
    },
  };
}

export const U24_LEXICON: LexiconEntry[] = [
  // Deponent verbs (only exist in -s form)
  verb({
    lemma: 'hoppas', group: '1', deponent: true, en: 'to hope', ipa: '/ˈhɔpːas/',
    example: { sv: 'Jag hoppas att vädret blir fint i morgon.', en: 'I hope that the weather will be nice tomorrow.' },
    tags: ['deponent', 'group-1', 'thinking'],
    forms: { inf: 'hoppas', imp: 'hoppas', pres: 'hoppas', past: 'hoppades', supine: 'hoppats' },
  }),
  verb({
    lemma: 'lyckas', group: '1', deponent: true, en: 'to succeed, to manage', ipa: '/ˈlʏkːas/',
    example: { sv: 'Hon lyckades öppna dörren utan nyckel.', en: 'She managed to open the door without a key.' },
    tags: ['deponent', 'group-1'],
    forms: { inf: 'lyckas', imp: 'lyckas', pres: 'lyckas', past: 'lyckades', supine: 'lyckats' },
  }),
  verb({
    lemma: 'misslyckas', group: '1', deponent: true, en: 'to fail', ipa: '/ˈmɪsˌlʏkːas/',
    example: { sv: 'Det första försöket misslyckades, men det andra fungerade.', en: 'The first attempt failed, but the second one worked.' },
    tags: ['deponent', 'group-1'],
    forms: { inf: 'misslyckas', imp: 'misslyckas', pres: 'misslyckas', past: 'misslyckades', supine: 'misslyckats' },
  }),
  verb({
    lemma: 'låtsas', group: '1', deponent: true, en: 'to pretend', ipa: '/ˈlɔtːsas/',
    example: { sv: 'Barnet låtsas att det sover.', en: 'The child pretends to be asleep.' },
    tags: ['deponent', 'group-1'],
    forms: { inf: 'låtsas', imp: 'låtsas', pres: 'låtsas', past: 'låtsades', supine: 'låtsats' },
  }),
  verb({
    lemma: 'envisas', group: '1', deponent: true, en: 'to insist stubbornly, to persist', ipa: '/ɛnˈviːsas/',
    example: { sv: 'Han envisas med att gå, trots regnet.', en: 'He stubbornly insists on walking, despite the rain.' },
    tags: ['deponent', 'group-1'],
    forms: { inf: 'envisas', imp: 'envisas', pres: 'envisas', past: 'envisades', supine: 'envisats' },
  }),
  verb({
    lemma: 'trivas', group: '2a', deponent: true, en: 'to thrive, to feel at home', ipa: '/ˈtriːvas/',
    example: { sv: 'Jag trivs bra i den nya staden.', en: 'I feel very much at home in the new town.' },
    tags: ['deponent', 'group-2a', 'feelings'],
    forms: { inf: 'trivas', imp: 'trivs', pres: 'trivs', past: 'trivdes', supine: 'trivts' },
  }),
  verb({
    lemma: 'minnas', group: '2a', deponent: true, en: 'to remember', ipa: '/ˈmɪnːas/',
    example: { sv: 'Jag minns inte vad boken heter.', en: 'I do not remember what the book is called.' },
    tags: ['deponent', 'group-2a', 'thinking'],
    forms: { inf: 'minnas', imp: 'minns', pres: 'minns', past: 'mindes', supine: 'mints' },
  }),
  verb({
    lemma: 'skämmas', group: '2a', deponent: true, en: 'to be ashamed', ipa: '/ˈɧɛmːas/',
    example: { sv: 'Hon skäms för att hon glömde namnet.', en: 'She is ashamed that she forgot the name.' },
    tags: ['deponent', 'group-2a', 'feelings'],
    forms: { inf: 'skämmas', imp: 'skäms', pres: 'skäms', past: 'skämdes', supine: 'skämts' },
  }),
  verb({
    lemma: 'synas', group: '2b', deponent: true, en: 'to be visible, to show', ipa: '/ˈsyːnas/',
    example: { sv: 'Stjärnorna syns tydligt i kväll.', en: 'The stars are clearly visible tonight.' },
    tags: ['deponent', 'group-2b'],
    forms: { inf: 'synas', imp: 'syns', pres: 'syns', past: 'syntes', supine: 'synts' },
  }),
  verb({
    lemma: 'tyckas', group: '2b', deponent: true, en: 'to seem (formal)', ipa: '/ˈtʏkːas/',
    example: { sv: 'Det tycks som om ingen är hemma.', en: 'It seems as if nobody is at home.' },
    tags: ['deponent', 'group-2b', 'formal'],
    forms: { inf: 'tyckas', imp: 'tycks', pres: 'tycks', past: 'tycktes', supine: 'tyckts' },
  }),
  verb({
    lemma: 'töras', group: 'irreg', deponent: true, en: 'to dare (somewhat formal)', ipa: '/ˈtøːras/',
    example: { sv: 'Jag törs inte ringa så sent på kvällen.', en: 'I do not dare to call so late in the evening.' },
    tags: ['deponent', 'irregular', 'rare-forms'],
    // The past (torde) and supine (tort) are rare and mostly written; in
    // everyday speech törs or vågar is used instead.
    forms: { inf: 'töras', imp: 'törs', pres: 'törs', past: 'torde', supine: 'tort' },
  }),
  verb({
    lemma: 'umgås', group: '4', deponent: true, en: 'to socialise, to spend time together', ipa: '/ˈɵmːɡoːs/',
    example: { sv: 'Vi umgås ofta med grannarna.', en: 'We often spend time with the neighbours.' },
    tags: ['deponent', 'group-4', 'social'],
    forms: { inf: 'umgås', imp: 'umgås', pres: 'umgås', past: 'umgicks', supine: 'umgåtts' },
  }),
  verb({
    lemma: 'födas', group: 'irreg', deponent: true, en: 'to be born', ipa: '/ˈføːdas/',
    example: { sv: 'Min mormor föddes i Norrland.', en: 'My grandmother was born in Norrland.' },
    tags: ['deponent', 'irregular', 'life'],
    forms: { inf: 'födas', imp: 'föds', pres: 'föds', past: 'föddes', supine: 'fötts' },
  }),
  // -s passives (the active verb has its own entry or is an ordinary verb)
  verb({
    lemma: 'byggas', group: '2a', en: 'to be built', ipa: '/ˈbʏɡːas/',
    example: { sv: 'Huset byggdes på 1800-talet.', en: 'The house was built in the 1800s.' },
    tags: ['passive', 'group-2a'],
    forms: { inf: 'byggas', imp: 'byggas', pres: 'byggs', past: 'byggdes', supine: 'byggts' },
  }),
  verb({
    lemma: 'säljas', group: 'irreg', en: 'to be sold', ipa: '/ˈsɛljas/',
    example: { sv: 'Biljetterna säljs i kiosken vid ingången.', en: 'The tickets are sold at the kiosk by the entrance.' },
    tags: ['passive', 'irregular'],
    forms: { inf: 'säljas', imp: 'säljas', pres: 'säljs', past: 'såldes', supine: 'sålts' },
  }),
  // Ordinary verbs of invention and industry
  verb({
    lemma: 'servera', group: '1', en: 'to serve (food, drink)', ipa: '/sɛrˈveːra/',
    example: { sv: 'Man serverar kaffe och kakor efter mötet.', en: 'Coffee and cakes are served after the meeting.' },
    tags: ['group-1', 'food'],
    forms: { inf: 'servera', imp: 'servera', pres: 'serverar', past: 'serverade', supine: 'serverat' },
  }),
  verb({
    lemma: 'grunda', group: '1', en: 'to found, to establish', ipa: '/ˈɡrɵnda/',
    example: { sv: 'Hon grundade företaget för tio år sedan.', en: 'She founded the company ten years ago.' },
    tags: ['group-1', 'work'],
    forms: { inf: 'grunda', imp: 'grunda', pres: 'grundar', past: 'grundade', supine: 'grundat' },
  }),
  verb({
    lemma: 'uppfinna', group: '4', en: 'to invent', ipa: '/ˈɵpːˌfɪnːa/',
    example: { sv: 'Vem uppfann blixtlåset?', en: 'Who invented the zipper?' },
    tags: ['group-4', 'invention'],
    forms: { inf: 'uppfinna', imp: 'uppfinn', pres: 'uppfinner', past: 'uppfann', supine: 'uppfunnit' },
  }),
  verb({
    lemma: 'patentera', group: '1', en: 'to patent', ipa: '/patɛnˈteːra/',
    example: { sv: 'Han patenterade sin uppfinning år 1888.', en: 'He patented his invention in 1888.' },
    tags: ['group-1', 'invention'],
    forms: { inf: 'patentera', imp: 'patentera', pres: 'patenterar', past: 'patenterade', supine: 'patenterat' },
  }),
  verb({
    lemma: 'lansera', group: '1', en: 'to launch (a product)', ipa: '/lanˈseːra/',
    example: { sv: 'Företaget lanserade produkten i höstas.', en: 'The company launched the product last autumn.' },
    tags: ['group-1', 'work'],
    forms: { inf: 'lansera', imp: 'lansera', pres: 'lanserar', past: 'lanserade', supine: 'lanserat' },
  }),
  verb({
    lemma: 'tillverka', group: '1', en: 'to manufacture', ipa: '/ˈtɪlːˌvɛrka/',
    example: { sv: 'Fabriken tillverkar tvättmaskiner.', en: 'The factory manufactures washing machines.' },
    tags: ['group-1', 'work'],
    forms: { inf: 'tillverka', imp: 'tillverka', pres: 'tillverkar', past: 'tillverkade', supine: 'tillverkat' },
  }),
  verb({
    lemma: 'utveckla', group: '1', en: 'to develop', ipa: '/ˈɵːtˌvɛkːla/',
    example: { sv: 'Ingenjörerna utvecklar en ny propeller.', en: 'The engineers are developing a new propeller.' },
    tags: ['group-1', 'invention'],
    forms: { inf: 'utveckla', imp: 'utveckla', pres: 'utvecklar', past: 'utvecklade', supine: 'utvecklat' },
  }),
  // Nouns
  noun({
    lemma: 'blixtlås', en: 'zipper, zip fastener', ipa: '/ˈblɪkstˌloːs/', gender: 'ett', declension: 6,
    defSg: 'blixtlåset', indefPl: 'blixtlås', defPl: 'blixtlåsen',
    example: { sv: 'Blixtlåset på jackan har gått sönder.', en: 'The zipper on the jacket has broken.' },
    tags: ['invention', 'clothes'],
  }),
  noun({
    lemma: 'dynamit', en: 'dynamite', ipa: '/dynaˈmiːt/', gender: 'en', declension: 'uncount',
    defSg: 'dynamiten',
    example: { sv: 'Dynamiten användes i gruvor och vid vägbyggen.', en: 'The dynamite was used in mines and in road building.' },
    tags: ['invention', 'industry'],
  }),
  noun({
    lemma: 'skiftnyckel', en: 'adjustable spanner', ipa: '/ˈɧɪftˌnʏkːɛl/', gender: 'en', declension: 2,
    defSg: 'skiftnyckeln', indefPl: 'skiftnycklar', defPl: 'skiftnycklarna',
    example: { sv: 'Skiftnyckeln ligger i verktygslådan.', en: 'The adjustable spanner is in the toolbox.' },
    tags: ['invention', 'tools'],
  }),
  noun({
    lemma: 'säkerhetständsticka', en: 'safety match', ipa: '/ˈsɛːkɛrhetsˌtɛndˌtɪkːa/', gender: 'en', declension: 1,
    defSg: 'säkerhetständstickan', indefPl: 'säkerhetständstickor', defPl: 'säkerhetständstickorna',
    example: { sv: 'Säkerhetständstickan tänds mot lådans sida.', en: 'The safety match is lit against the side of the box.' },
    tags: ['invention', 'household'],
  }),
  noun({
    lemma: 'propeller', en: 'propeller', ipa: '/prɔˈpɛlːɛr/', gender: 'en', declension: 2,
    defSg: 'propellern', indefPl: 'propellrar', defPl: 'propellrarna',
    example: { sv: 'Propellern på båten snurrar snabbt.', en: 'The propeller on the boat spins fast.' },
    tags: ['invention', 'transport'],
  }),
  noun({
    lemma: 'gisslan', en: 'hostage', ipa: '/ˈjɪslan/', gender: 'en', declension: 'irreg',
    // Zero-ending noun in -an: the forms below follow the commonly given
    // paradigm (en gisslan, gisslan, gisslan, gisslan); treat as low-priority
    // and do not drill the inflection.
    defSg: 'gisslan', indefPl: 'gisslan', defPl: 'gisslan',
    example: { sv: 'Polisen räddade gisslan oskadd.', en: 'The police rescued the hostage unharmed.' },
    tags: ['news'],
  }),
  noun({
    lemma: 'brandkår', en: 'fire brigade', ipa: '/ˈbrandˌkoːr/', gender: 'en', declension: 3,
    defSg: 'brandkåren', indefPl: 'brandkårer', defPl: 'brandkårerna',
    example: { sv: 'Brandkåren kom efter fem minuter.', en: 'The fire brigade arrived after five minutes.' },
    tags: ['society'],
  }),
  noun({
    lemma: 'tvättmaskin', en: 'washing machine', ipa: '/ˈtvɛtːmaˌɧiːn/', gender: 'en', declension: 3,
    defSg: 'tvättmaskinen', indefPl: 'tvättmaskiner', defPl: 'tvättmaskinerna',
    example: { sv: 'Tvättmaskinen står i källaren.', en: 'The washing machine is in the basement.' },
    tags: ['household'],
  }),
];
