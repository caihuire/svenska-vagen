import type { LexiconEntry } from '../../../types/index';

type NounDecl = 1 | 2 | 3 | 4 | 5 | 6 | 'uncount';

interface NounSpec {
  lemma: string;
  en: string;
  ipa: string;
  gender: 'en' | 'ett';
  declension: NounDecl;
  defSg: string;
  indefPl?: string;
  defPl?: string;
  example: { sv: string; en: string };
  tags: string[];
}

// Every noun carries explicit forms so the definite forms (including the
// -el/-en/-er stem reduction in neuter nouns) never depend on heuristics.
function noun(spec: NounSpec): LexiconEntry {
  return {
    id: `noun:${spec.lemma}`,
    lemma: spec.lemma,
    en: spec.en,
    pos: 'noun',
    unitId: 'u14',
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

export const U14_LEXICON: LexiconEntry[] = [
  noun({
    lemma: 'bibel', en: 'bible', ipa: '/ˈbiːbɛl/', gender: 'en', declension: 2,
    defSg: 'bibeln', indefPl: 'biblar', defPl: 'biblarna',
    example: { sv: 'Bibeln på hyllan är över hundra år gammal.', en: 'The Bible on the shelf is over a hundred years old.' },
    tags: ['culture', 'definite'],
  }),
  noun({
    lemma: 'cirkel', en: 'circle', ipa: '/ˈsɪrkɛl/', gender: 'en', declension: 2,
    defSg: 'cirkeln', indefPl: 'cirklar', defPl: 'cirklarna',
    example: { sv: 'Barnen sitter i en cirkel på golvet.', en: 'The children sit in a circle on the floor.' },
    tags: ['shapes', 'definite'],
  }),
  noun({
    lemma: 'doktor', en: 'doctor', ipa: '/ˈdɔkˌtɔr/', gender: 'en', declension: 3,
    defSg: 'doktorn', indefPl: 'doktorer', defPl: 'doktorerna',
    example: { sv: 'Min moster är doktor och arbetar på ett sjukhus.', en: 'My aunt is a doctor and works at a hospital.' },
    tags: ['professions', 'article-usage'],
  }),
  noun({
    lemma: 'professor', en: 'professor', ipa: '/prʊˈfɛsɔr/', gender: 'en', declension: 3,
    defSg: 'professorn', indefPl: 'professorer', defPl: 'professorerna',
    example: { sv: 'Hennes pappa är professor i historia.', en: 'Her father is a professor of history.' },
    tags: ['professions', 'article-usage'],
  }),
  noun({
    lemma: 'motor', en: 'engine, motor', ipa: '/ˈmuːtɔr/', gender: 'en', declension: 3,
    defSg: 'motorn', indefPl: 'motorer', defPl: 'motorerna',
    example: { sv: 'Motorn startade direkt trots kylan.', en: 'The engine started right away despite the cold.' },
    tags: ['technology', 'definite'],
  }),
  noun({
    lemma: 'segel', en: 'sail', ipa: '/ˈseːɡɛl/', gender: 'ett', declension: 6,
    defSg: 'seglet', indefPl: 'segel', defPl: 'seglen',
    example: { sv: 'Seglet fylldes av vinden och båten tog fart.', en: 'The sail filled with wind and the boat picked up speed.' },
    tags: ['neuter-drop-e', 'definite'],
  }),
  noun({
    lemma: 'tecken', en: 'sign, symbol', ipa: '/ˈtɛkɛn/', gender: 'ett', declension: 6,
    defSg: 'tecknet', indefPl: 'tecken', defPl: 'tecknen',
    example: { sv: 'Tecknet på dörren betyder att rummet är upptaget.', en: 'The sign on the door means that the room is occupied.' },
    tags: ['neuter-drop-e', 'definite'],
  }),
  noun({
    lemma: 'lager', en: 'warehouse, stock', ipa: '/ˈlɑːɡɛr/', gender: 'ett', declension: 6,
    defSg: 'lagret', indefPl: 'lager', defPl: 'lagren',
    example: { sv: 'Lagret ligger utanför stan och är fullt av kartonger.', en: 'The warehouse is outside town and is full of boxes.' },
    tags: ['neuter-drop-e', 'work'],
  }),
  noun({
    lemma: 'mönster', en: 'pattern', ipa: '/ˈmœnstɛr/', gender: 'ett', declension: 6,
    defSg: 'mönstret', indefPl: 'mönster', defPl: 'mönstren',
    example: { sv: 'Mönstret på tapeten är grönt och gult.', en: 'The pattern on the wallpaper is green and yellow.' },
    tags: ['neuter-drop-e', 'definite'],
  }),
  noun({
    lemma: 'yrke', en: 'profession, trade', ipa: '/ˈyrkɛ/', gender: 'ett', declension: 5,
    defSg: 'yrket', indefPl: 'yrken', defPl: 'yrkena',
    example: { sv: 'Vilket yrke har din granne?', en: 'What profession does your neighbour have?' },
    tags: ['professions', 'work'],
  }),
  noun({
    lemma: 'bibliotek', en: 'library', ipa: '/bɪblɪʊˈteːk/', gender: 'ett', declension: 6,
    defSg: 'biblioteket', indefPl: 'bibliotek', defPl: 'biblioteken',
    example: { sv: 'Biblioteket stänger tidigt på lördagar.', en: 'The library closes early on Saturdays.' },
    tags: ['places', 'institutions'],
  }),
  noun({
    lemma: 'rykte', en: 'rumour, reputation', ipa: '/ˈrʏktɛ/', gender: 'ett', declension: 5,
    defSg: 'ryktet', indefPl: 'rykten', defPl: 'ryktena',
    example: { sv: 'Ryktet om den nya butiken spreds snabbt i kvarteret.', en: 'The rumour about the new shop spread quickly in the neighbourhood.' },
    tags: ['communication', 'definite'],
  }),
  noun({
    lemma: 'minne', en: 'memory', ipa: '/ˈmɪnɛ/', gender: 'ett', declension: 5,
    defSg: 'minnet', indefPl: 'minnen', defPl: 'minnena',
    example: { sv: 'Minnet av den sommaren gör mig alltid glad.', en: 'The memory of that summer always makes me happy.' },
    tags: ['abstract', 'definite'],
  }),
  noun({
    lemma: 'ansikte', en: 'face', ipa: '/ˈanˌsɪktɛ/', gender: 'ett', declension: 5,
    defSg: 'ansiktet', indefPl: 'ansikten', defPl: 'ansiktena',
    example: { sv: 'Ansiktet på bilden var lätt att känna igen.', en: 'The face in the picture was easy to recognise.' },
    tags: ['body', 'definite'],
  }),
  noun({
    lemma: 'vapen', en: 'weapon', ipa: '/ˈvɑːpɛn/', gender: 'ett', declension: 6,
    defSg: 'vapnet', indefPl: 'vapen', defPl: 'vapnen',
    example: { sv: 'Vapnet i museets samling är från medeltiden.', en: 'The weapon in the museum collection is from the Middle Ages.' },
    tags: ['neuter-drop-e', 'history'],
  }),
  noun({
    lemma: 'kärlek', en: 'love', ipa: '/ˈɕæːrlɛk/', gender: 'en', declension: 'uncount',
    defSg: 'kärleken',
    example: { sv: 'Kärleken till musik fanns i hela familjen.', en: 'The love of music was present in the whole family.' },
    tags: ['abstract', 'article-usage'],
  }),
  noun({
    lemma: 'liv', en: 'life', ipa: '/liːv/', gender: 'ett', declension: 6,
    defSg: 'livet', indefPl: 'liv', defPl: 'liven',
    example: { sv: 'Livet på landet är lugnare än livet i stan.', en: 'Life in the countryside is calmer than life in the city.' },
    tags: ['abstract', 'article-usage'],
  }),
  noun({
    lemma: 'natur', en: 'nature', ipa: '/naˈtʉːr/', gender: 'en', declension: 3,
    defSg: 'naturen', indefPl: 'naturer', defPl: 'naturerna',
    example: { sv: 'Naturen är som vackrast i slutet av maj.', en: 'Nature is at its most beautiful at the end of May.' },
    tags: ['abstract', 'article-usage'],
  }),
  noun({
    lemma: 'konst', en: 'art', ipa: '/kɔnst/', gender: 'en', declension: 3,
    defSg: 'konsten', indefPl: 'konster', defPl: 'konsterna',
    example: { sv: 'Konsten på museet lockar många besökare varje vecka.', en: 'The art at the museum attracts many visitors every week.' },
    tags: ['abstract', 'culture'],
  }),
  noun({
    lemma: 'död', en: 'death', ipa: '/døːd/', gender: 'en', declension: 'uncount',
    defSg: 'döden',
    example: { sv: 'Döden är ett svårt ämne för många barn.', en: 'Death is a difficult subject for many children.' },
    tags: ['abstract', 'article-usage'],
  }),
  noun({
    lemma: 'feber', en: 'fever', ipa: '/ˈfeːbɛr/', gender: 'en', declension: 'uncount',
    defSg: 'febern',
    example: { sv: 'Febern gick ned efter två dagar i sängen.', en: 'The fever went down after two days in bed.' },
    tags: ['health', 'definite'],
  }),
  noun({
    lemma: 'gitarr', en: 'guitar', ipa: '/ɡɪˈtarː/', gender: 'en', declension: 3,
    defSg: 'gitarren', indefPl: 'gitarrer', defPl: 'gitarrerna',
    example: { sv: 'Min bror spelar gitarr i ett band.', en: 'My brother plays guitar in a band.' },
    tags: ['instruments', 'article-usage'],
  }),
  noun({
    lemma: 'piano', en: 'piano', ipa: '/pɪˈɑːnʊ/', gender: 'ett', declension: 5,
    defSg: 'pianot', indefPl: 'pianon', defPl: 'pianona',
    example: { sv: 'Hon spelar piano varje kväll efter middagen.', en: 'She plays the piano every evening after dinner.' },
    tags: ['instruments', 'article-usage'],
  }),
  noun({
    lemma: 'flöjt', en: 'flute', ipa: '/flœjt/', gender: 'en', declension: 3,
    defSg: 'flöjten', indefPl: 'flöjter', defPl: 'flöjterna',
    example: { sv: 'Flickan lär sig spela flöjt i skolan.', en: 'The girl is learning to play the flute at school.' },
    tags: ['instruments', 'article-usage'],
  }),
  noun({
    lemma: 'bio', en: 'cinema', ipa: '/ˈbiːʊ/', gender: 'en', declension: 3,
    defSg: 'bion', indefPl: 'biografer', defPl: 'biograferna',
    example: { sv: 'Vi går på bio varje fredag.', en: 'We go to the cinema every Friday.' },
    tags: ['places', 'institutions'],
  }),
  noun({
    lemma: 'teater', en: 'theatre', ipa: '/teˈɑːtɛr/', gender: 'en', declension: 2,
    defSg: 'teatern', indefPl: 'teatrar', defPl: 'teatrarna',
    example: { sv: 'Teatern ligger bredvid stationen.', en: 'The theatre is next to the station.' },
    tags: ['places', 'culture'],
  }),
  noun({
    lemma: 'mynt', en: 'coin', ipa: '/mʏnt/', gender: 'ett', declension: 6,
    defSg: 'myntet', indefPl: 'mynt', defPl: 'mynten',
    example: { sv: 'Myntet föll ned bakom soffan.', en: 'The coin fell down behind the sofa.' },
    tags: ['money', 'definite'],
  }),
  noun({
    lemma: 'sedel', en: 'banknote', ipa: '/ˈseːdɛl/', gender: 'en', declension: 2,
    defSg: 'sedeln', indefPl: 'sedlar', defPl: 'sedlarna',
    example: { sv: 'Sedeln var så ny att den nästan lyste.', en: 'The banknote was so new that it almost shone.' },
    tags: ['money', 'definite'],
  }),
  noun({
    lemma: 'valuta', en: 'currency', ipa: '/vaˈlʉːta/', gender: 'en', declension: 1,
    defSg: 'valutan', indefPl: 'valutor', defPl: 'valutorna',
    example: { sv: 'Vilken valuta använder man i Norge?', en: 'Which currency do people use in Norway?' },
    tags: ['money', 'definite'],
  }),
  noun({
    lemma: 'gaffel', en: 'fork', ipa: '/ˈɡafɛl/', gender: 'en', declension: 2,
    defSg: 'gaffeln', indefPl: 'gafflar', defPl: 'gafflarna',
    example: { sv: 'Gaffeln ligger till vänster om tallriken.', en: 'The fork is to the left of the plate.' },
    tags: ['household', 'definite'],
  }),
];
