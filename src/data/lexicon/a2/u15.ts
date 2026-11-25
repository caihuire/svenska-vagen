import type { LexiconEntry } from '../../../types/index';

interface WordSpec {
  lemma: string;
  en: string;
  ipa: string;
  example: { sv: string; en: string };
  tags: string[];
}

// Closed-class words (prepositions and compass adverbs) carry no morphology.
function closed(pos: 'prep' | 'adv', spec: WordSpec): LexiconEntry {
  return {
    id: `${pos}:${spec.lemma}`,
    lemma: spec.lemma,
    en: spec.en,
    pos,
    unitId: 'u15',
    stage: 'A2',
    ipa: spec.ipa,
    example: spec.example,
    tags: spec.tags,
  };
}

interface NounSpec extends WordSpec {
  gender: 'en' | 'ett';
  declension: 2 | 3 | 6;
  defSg: string;
  indefPl: string;
  defPl: string;
}

// Explicit forms for every noun, so definite forms never rely on heuristics.
function noun(spec: NounSpec): LexiconEntry {
  return {
    id: `noun:${spec.lemma}`,
    lemma: spec.lemma,
    en: spec.en,
    pos: 'noun',
    unitId: 'u15',
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

export const U15_LEXICON: LexiconEntry[] = [
  closed('prep', {
    lemma: 'på', en: 'on, at (surface, open place, institution)', ipa: '/poː/',
    example: { sv: 'Nycklarna ligger på hyllan i hallen.', en: 'The keys are on the shelf in the hall.' },
    tags: ['prep-place', 'core'],
  }),
  closed('prep', {
    lemma: 'i', en: 'in, inside (volume, enclosed space)', ipa: '/iː/',
    example: { sv: 'Mjölken står i kylskåpet.', en: 'The milk is in the fridge.' },
    tags: ['prep-place', 'core'],
  }),
  closed('prep', {
    lemma: 'vid', en: 'by, beside, at (close to, along)', ipa: '/viːd/',
    example: { sv: 'Hon sitter vid fönstret och dricker te.', en: 'She sits by the window drinking tea.' },
    tags: ['prep-place'],
  }),
  closed('prep', {
    lemma: 'hos', en: "at (someone's home or workplace)", ipa: '/huːs/',
    example: { sv: 'Jag bor hos min moster i sommar.', en: 'I am staying with my aunt this summer.' },
    tags: ['prep-place', 'people'],
  }),
  closed('prep', {
    lemma: 'bakom', en: 'behind', ipa: '/ˈbɑːkɔm/',
    example: { sv: 'Katten gömmer sig bakom fåtöljen.', en: 'The cat is hiding behind the armchair.' },
    tags: ['prep-place'],
  }),
  closed('prep', {
    lemma: 'bland', en: 'among', ipa: '/blant/',
    example: { sv: 'Det fanns en gammal bild bland breven.', en: 'There was an old picture among the letters.' },
    tags: ['prep-place'],
  }),
  closed('prep', {
    lemma: 'bredvid', en: 'next to, beside', ipa: '/ˈbreːdˌviːd/',
    example: { sv: 'Posten ligger bredvid apoteket.', en: 'The post office is next to the pharmacy.' },
    tags: ['prep-place'],
  }),
  closed('prep', {
    lemma: 'framför', en: 'in front of', ipa: '/ˈframˌføːr/',
    example: { sv: 'Bussen stannar framför hotellet.', en: 'The bus stops in front of the hotel.' },
    tags: ['prep-place'],
  }),
  closed('prep', {
    lemma: 'genom', en: 'through', ipa: '/ˈjeːnɔm/',
    example: { sv: 'Vägen går genom en stor skog.', en: 'The road goes through a big forest.' },
    tags: ['prep-place', 'direction'],
  }),
  closed('prep', {
    lemma: 'längs', en: 'along', ipa: '/lɛŋs/',
    example: { sv: 'Vi cyklade längs kusten hela dagen.', en: 'We cycled along the coast all day.' },
    tags: ['prep-place', 'direction'],
  }),
  closed('prep', {
    lemma: 'mellan', en: 'between', ipa: '/ˈmɛlan/',
    example: { sv: 'Parken ligger mellan skolan och kyrkan.', en: 'The park is between the school and the church.' },
    tags: ['prep-place'],
  }),
  closed('prep', {
    lemma: 'mittemot', en: 'opposite, across from', ipa: '/ˈmɪtɛˌmuːt/',
    example: { sv: 'Caféet ligger mittemot biblioteket.', en: 'The café is across from the library.' },
    tags: ['prep-place'],
  }),
  closed('prep', {
    lemma: 'mot', en: 'towards, against', ipa: '/muːt/',
    example: { sv: 'Han lutade ryggen mot väggen.', en: 'He leaned his back against the wall.' },
    tags: ['prep-place', 'direction'],
  }),
  closed('prep', {
    lemma: 'under', en: 'under, beneath', ipa: '/ˈɵndɛr/',
    example: { sv: 'Skorna står under bänken i hallen.', en: 'The shoes are under the bench in the hall.' },
    tags: ['prep-place'],
  }),
  closed('prep', {
    lemma: 'utanför', en: 'outside', ipa: '/ˈɵːtanˌføːr/',
    example: { sv: 'Vi väntar utanför biografen.', en: 'We are waiting outside the cinema.' },
    tags: ['prep-place'],
  }),
  closed('prep', {
    lemma: 'över', en: 'over, above', ipa: '/ˈøːvɛr/',
    example: { sv: 'Lampan hänger över matbordet.', en: 'The lamp hangs over the dining table.' },
    tags: ['prep-place'],
  }),
  closed('prep', {
    lemma: 'från', en: 'from', ipa: '/froːn/',
    example: { sv: 'Tåget från Göteborg är försenat.', en: 'The train from Gothenburg is delayed.' },
    tags: ['prep-place', 'direction'],
  }),
  closed('prep', {
    lemma: 'till', en: 'to, towards (destination)', ipa: '/tɪl/',
    example: { sv: 'Vi åker till kusten på lördag.', en: 'We are going to the coast on Saturday.' },
    tags: ['prep-place', 'direction'],
  }),
  closed('adv', {
    lemma: 'norr', en: 'north', ipa: '/nɔrː/',
    example: { sv: 'Kiruna ligger långt norr om Stockholm.', en: 'Kiruna is far north of Stockholm.' },
    tags: ['compass', 'prep-place'],
  }),
  closed('adv', {
    lemma: 'söder', en: 'south', ipa: '/ˈsøːdɛr/',
    example: { sv: 'Malmö ligger i söder, nära Danmark.', en: 'Malmö is in the south, close to Denmark.' },
    tags: ['compass', 'prep-place'],
  }),
  closed('adv', {
    lemma: 'öster', en: 'east', ipa: '/ˈœstɛr/',
    example: { sv: 'Solen går upp i öster.', en: 'The sun rises in the east.' },
    tags: ['compass', 'prep-place'],
  }),
  closed('adv', {
    lemma: 'väster', en: 'west', ipa: '/ˈvɛstɛr/',
    example: { sv: 'Göteborg ligger vid kusten i väster.', en: 'Gothenburg lies on the coast in the west.' },
    tags: ['compass', 'prep-place'],
  }),
  noun({
    lemma: 'vägg', en: 'wall', ipa: '/vɛɡː/', gender: 'en', declension: 2,
    defSg: 'väggen', indefPl: 'väggar', defPl: 'väggarna',
    example: { sv: 'Tavlan hänger på väggen över soffan.', en: 'The painting hangs on the wall above the sofa.' },
    tags: ['home', 'prep-place'],
  }),
  noun({
    lemma: 'fåtölj', en: 'armchair', ipa: '/fɔˈtœlj/', gender: 'en', declension: 3,
    defSg: 'fåtöljen', indefPl: 'fåtöljer', defPl: 'fåtöljerna',
    example: { sv: 'Farfar sitter i fåtöljen och läser tidningen.', en: 'Grandpa sits in the armchair reading the newspaper.' },
    tags: ['home', 'furniture'],
  }),
  noun({
    lemma: 'sjukhus', en: 'hospital', ipa: '/ˈɧɵːkˌhɵːs/', gender: 'ett', declension: 6,
    defSg: 'sjukhuset', indefPl: 'sjukhus', defPl: 'sjukhusen',
    example: { sv: 'Min syster arbetar på sjukhuset i Uppsala.', en: 'My sister works at the hospital in Uppsala.' },
    tags: ['places', 'institutions'],
  }),
  noun({
    lemma: 'flygplats', en: 'airport', ipa: '/ˈflyːɡˌplats/', gender: 'en', declension: 3,
    defSg: 'flygplatsen', indefPl: 'flygplatser', defPl: 'flygplatserna',
    example: { sv: 'Flygplatsen ligger en halvtimme från centrum.', en: 'The airport is half an hour from the centre.' },
    tags: ['places', 'travel'],
  }),
  noun({
    lemma: 'hotell', en: 'hotel', ipa: '/hʊˈtɛl/', gender: 'ett', declension: 6,
    defSg: 'hotellet', indefPl: 'hotell', defPl: 'hotellen',
    example: { sv: 'Hotellet har utsikt över hela hamnen.', en: 'The hotel has a view over the whole harbour.' },
    tags: ['places', 'travel'],
  }),
  noun({
    lemma: 'kust', en: 'coast', ipa: '/kɵst/', gender: 'en', declension: 3,
    defSg: 'kusten', indefPl: 'kuster', defPl: 'kusterna',
    example: { sv: 'Längs kusten finns många små fiskelägen.', en: 'Along the coast there are many small fishing villages.' },
    tags: ['geography', 'nature'],
  }),
  noun({
    lemma: 'flod', en: 'river', ipa: '/fluːd/', gender: 'en', declension: 3,
    defSg: 'floden', indefPl: 'floder', defPl: 'floderna',
    example: { sv: 'Floden är bred och djup vid bron.', en: 'The river is wide and deep by the bridge.' },
    tags: ['geography', 'nature'],
  }),
  noun({
    lemma: 'gräns', en: 'border, limit', ipa: '/ɡrɛns/', gender: 'en', declension: 3,
    defSg: 'gränsen', indefPl: 'gränser', defPl: 'gränserna',
    example: { sv: 'Gränsen mellan de två länderna ligger i skogen.', en: 'The border between the two countries lies in the forest.' },
    tags: ['geography', 'prep-place'],
  }),
];
