import type { LexiconEntry } from '../../../types/index';

interface AdvSpec {
  lemma: string;
  en: string;
  ipa: string;
  example: { sv: string; en: string };
  tags: string[];
}

// Adverbs are closed-class here: no morph block is needed. None of the 30 seed
// words of this unit exists in Stage A1. The comparison partners (fortare,
// fortast, oftare, oftast, mer, mest, mindre, minst, längre, längst, nära) are
// added as separate entries so that every degree series can be learned word by
// word. The A1 adverbs ofta, gärna, snabbt and långsamt are reused by id in the
// unit and are not redefined here.
function adv(spec: AdvSpec): LexiconEntry {
  return {
    id: `adv:${spec.lemma}`,
    lemma: spec.lemma,
    en: spec.en,
    pos: 'adv',
    unitId: 'u21',
    stage: 'A2',
    ipa: spec.ipa,
    example: spec.example,
    tags: spec.tags,
  };
}

export const U21_LEXICON: LexiconEntry[] = [
  // Derived with -ligen / -tvis / -t
  adv({
    lemma: 'verkligen', en: 'really, truly', ipa: '/ˈvɛrkːlɪɡɛn/',
    example: { sv: 'Det var verkligen kallt i går.', en: 'It was really cold yesterday.' },
    tags: ['adv-form', 'degree', 'ligen'],
  }),
  adv({
    lemma: 'naturligtvis', en: 'of course, naturally', ipa: '/naˈtʉːrlɪtˌviːs/',
    example: { sv: 'Naturligtvis hjälper jag dig med flytten.', en: 'Of course I will help you with the move.' },
    tags: ['adv-form', 'clausal-adverbial', 'tvis'],
  }),
  adv({
    lemma: 'lyckligtvis', en: 'luckily, fortunately', ipa: '/ˈlʏkːlɪtˌviːs/',
    example: { sv: 'Lyckligtvis hade vi paraplyer med oss.', en: 'Luckily we had umbrellas with us.' },
    tags: ['adv-form', 'clausal-adverbial', 'tvis'],
  }),
  adv({
    lemma: 'möjligen', en: 'possibly', ipa: '/ˈmœjlɪɡɛn/',
    example: { sv: 'Han kommer möjligen med tåget i kväll.', en: 'He is possibly coming by train this evening.' },
    tags: ['adv-form', 'clausal-adverbial', 'ligen'],
  }),
  adv({
    lemma: 'särskilt', en: 'especially, particularly', ipa: '/ˈsæːʂkɪlt/',
    example: { sv: 'Jag gillar särskilt kanelbullar.', en: 'I especially like cinnamon buns.' },
    tags: ['adv-form', 'degree'],
  }),
  adv({
    lemma: 'otroligt', en: 'incredibly, unbelievably', ipa: '/ʊˈtruːlɪt/',
    example: { sv: 'Maten var otroligt god.', en: 'The food was incredibly good.' },
    tags: ['adv-form', 'degree'],
  }),
  adv({
    lemma: 'oerhört', en: 'enormously, extremely', ipa: '/ˈuːɛrˌhøːʈ/',
    example: { sv: 'Det är oerhört viktigt att sova.', en: 'It is extremely important to sleep.' },
    tags: ['adv-form', 'degree'],
  }),
  adv({
    lemma: 'väldigt', en: 'very, really', ipa: '/ˈvɛldɪt/',
    example: { sv: 'Hon är väldigt trött i dag.', en: 'She is very tired today.' },
    tags: ['adv-form', 'degree'],
  }),
  adv({
    lemma: 'ganska', en: 'fairly, quite', ipa: '/ˈɡanska/',
    example: { sv: 'Filmen var ganska lång.', en: 'The film was fairly long.' },
    tags: ['adv-form', 'degree'],
  }),
  adv({
    lemma: 'alldeles', en: 'completely, quite', ipa: '/ˈaldɛlɛs/',
    example: { sv: 'Gatan var alldeles tom.', en: 'The street was completely empty.' },
    tags: ['adv-form', 'degree'],
  }),
  adv({
    lemma: 'oväntat', en: 'unexpectedly', ipa: '/ˈuːvɛnˌtɑːt/',
    example: { sv: 'Min gamla lärare dök oväntat upp.', en: 'My old teacher turned up unexpectedly.' },
    tags: ['adv-form', 'manner'],
  }),

  // Degree and quantity: lite / mycket and their comparison partners
  adv({
    lemma: 'lite', en: 'a little, a bit', ipa: '/ˈliːtɛ/',
    example: { sv: 'Jag talar lite svenska.', en: 'I speak a little Swedish.' },
    tags: ['adv-comparison', 'degree', 'irregular-comparison'],
  }),
  adv({
    lemma: 'mindre', en: 'less', ipa: '/ˈmɪndrɛ/',
    example: { sv: 'Jag äter mindre socker nu än förr.', en: 'I eat less sugar now than before.' },
    tags: ['adv-comparison', 'degree', 'irregular-comparison'],
  }),
  adv({
    lemma: 'minst', en: 'least; at least', ipa: '/mɪnst/',
    example: { sv: 'Min bror äter minst av oss.', en: 'My brother eats the least of us.' },
    tags: ['adv-comparison', 'degree', 'irregular-comparison'],
  }),
  adv({
    lemma: 'mycket', en: 'much, very', ipa: '/ˈmʏkɛ/',
    example: { sv: 'Han äter mycket frukt.', en: 'He eats a lot of fruit.' },
    tags: ['adv-comparison', 'degree', 'irregular-comparison'],
  }),
  adv({
    lemma: 'mer', en: 'more', ipa: '/meːr/',
    example: { sv: 'Hon arbetar mer än sin bror.', en: 'She works more than her brother.' },
    tags: ['adv-comparison', 'degree', 'irregular-comparison'],
  }),
  adv({
    lemma: 'mest', en: 'most', ipa: '/mɛst/',
    example: { sv: 'Han arbetar mest hemma.', en: 'He mostly works at home.' },
    tags: ['adv-comparison', 'degree', 'irregular-comparison'],
  }),

  // Time and manner, non-derived, with their series
  adv({
    lemma: 'fort', en: 'fast, quickly', ipa: '/fɔʈ/',
    example: { sv: 'Cykla inte så fort i backen!', en: 'Do not cycle so fast on the hill!' },
    tags: ['adv-comparison', 'manner'],
  }),
  adv({
    lemma: 'fortare', en: 'faster, more quickly', ipa: '/ˈfɔʈarɛ/',
    example: { sv: 'Kan du gå lite fortare, tack?', en: 'Can you walk a bit faster, please?' },
    tags: ['adv-comparison', 'manner'],
  }),
  adv({
    lemma: 'fortast', en: 'fastest, most quickly', ipa: '/ˈfɔʈast/',
    example: { sv: 'Vem springer fortast i klassen?', en: 'Who runs fastest in the class?' },
    tags: ['adv-comparison', 'manner'],
  }),
  adv({
    lemma: 'sakta', en: 'slowly, softly', ipa: '/ˈsɑːkta/',
    example: { sv: 'Gå sakta nerför trappan.', en: 'Walk slowly down the stairs.' },
    tags: ['adv-form', 'manner'],
  }),
  adv({
    lemma: 'oftare', en: 'more often', ipa: '/ˈɔftarɛ/',
    example: { sv: 'Jag borde träna oftare.', en: 'I ought to exercise more often.' },
    tags: ['adv-comparison', 'time'],
  }),
  adv({
    lemma: 'oftast', en: 'most often, usually', ipa: '/ˈɔftast/',
    example: { sv: 'Vi äter oftast klockan sex.', en: "We usually eat at six o'clock." },
    tags: ['adv-comparison', 'time'],
  }),
  adv({
    lemma: 'tidigt', en: 'early', ipa: '/ˈtiːdɪt/',
    example: { sv: 'Bagaren går upp tidigt varje morgon.', en: 'The baker gets up early every morning.' },
    tags: ['adv-form', 'time'],
  }),
  adv({
    lemma: 'sent', en: 'late', ipa: '/seːnt/',
    example: { sv: 'Vi kom sent till mötet.', en: 'We arrived late for the meeting.' },
    tags: ['adv-form', 'time'],
  }),
  adv({
    lemma: 'länge', en: 'for a long time', ipa: '/ˈlɛŋɛ/',
    example: { sv: 'Har du bott här länge?', en: 'Have you lived here for a long time?' },
    tags: ['adv-comparison', 'time', 'irregular-comparison'],
  }),
  adv({
    lemma: 'längre', en: 'longer; any more', ipa: '/ˈlɛŋrɛ/',
    example: { sv: 'Vi stannar inte längre i dag.', en: 'We are not staying any longer today.' },
    tags: ['adv-comparison', 'time', 'irregular-comparison'],
  }),
  adv({
    lemma: 'längst', en: 'longest', ipa: '/lɛŋst/',
    example: { sv: 'Vem har bott här längst?', en: 'Who has lived here the longest?' },
    tags: ['adv-comparison', 'time', 'irregular-comparison'],
  }),
  adv({
    lemma: 'redan', en: 'already', ipa: '/ˈreːdan/',
    example: { sv: 'Tåget har redan gått.', en: 'The train has already left.' },
    tags: ['adv-form', 'time'],
  }),
  adv({
    lemma: 'strax', en: 'shortly, in a moment', ipa: '/strɑks/',
    example: { sv: 'Middagen är strax klar.', en: 'Dinner will be ready shortly.' },
    tags: ['adv-form', 'time'],
  }),
  adv({
    lemma: 'igen', en: 'again', ipa: '/ɪˈjɛn/',
    example: { sv: 'Kan du säga det igen?', en: 'Can you say that again?' },
    tags: ['adv-form', 'time'],
  }),
  adv({
    lemma: 'fortfarande', en: 'still', ipa: '/ˈfɔʈˌfɑːrandɛ/',
    example: { sv: 'Det regnar fortfarande ute.', en: 'It is still raining outside.' },
    tags: ['adv-form', 'time'],
  }),

  // Place and distance
  adv({
    lemma: 'långt', en: 'far', ipa: '/lɔŋt/',
    example: { sv: 'Det är inte långt till stationen.', en: 'It is not far to the station.' },
    tags: ['adv-form', 'place'],
  }),
  adv({
    lemma: 'nära', en: 'near, close', ipa: '/ˈnæːra/',
    example: { sv: 'Vi bor nära havet.', en: 'We live near the sea.' },
    tags: ['adv-comparison', 'place', 'irregular-comparison'],
  }),
  adv({
    lemma: 'närmare', en: 'nearer, closer', ipa: '/ˈnæːrmarɛ/',
    example: { sv: 'Biblioteket ligger närmare än simhallen.', en: 'The library is nearer than the swimming pool.' },
    tags: ['adv-comparison', 'place', 'irregular-comparison'],
  }),
  adv({
    lemma: 'närmast', en: 'nearest, closest', ipa: '/ˈnæːrmast/',
    example: { sv: 'Vilken butik ligger närmast?', en: 'Which shop is nearest?' },
    tags: ['adv-comparison', 'place', 'irregular-comparison'],
  }),

  // Focus and attitude: bara, också, kanske and the gärna series
  adv({
    lemma: 'bara', en: 'only, just', ipa: '/ˈbɑːra/',
    example: { sv: 'Jag har bara en syster.', en: 'I only have one sister.' },
    tags: ['adv-form', 'focus'],
  }),
  adv({
    lemma: 'också', en: 'also, too', ipa: '/ˈɔksoː/',
    example: { sv: 'Hon talar också tyska.', en: 'She also speaks German.' },
    tags: ['adv-form', 'focus'],
  }),
  adv({
    lemma: 'kanske', en: 'maybe, perhaps', ipa: '/ˈkanɧɛ/',
    example: { sv: 'Vi kanske går på bio i kväll.', en: 'We might go to the cinema tonight.' },
    tags: ['adv-form', 'clausal-adverbial'],
  }),
  adv({
    lemma: 'hellre', en: 'rather, preferably (comparative of gärna)', ipa: '/ˈhɛlrɛ/',
    example: { sv: 'Jag dricker hellre te än kaffe.', en: 'I would rather drink tea than coffee.' },
    tags: ['adv-comparison', 'irregular-comparison'],
  }),
  adv({
    lemma: 'helst', en: 'preferably, most of all (superlative of gärna)', ipa: '/hɛlst/',
    example: { sv: 'Helst vill jag sova hela dagen.', en: 'Most of all I want to sleep all day.' },
    tags: ['adv-comparison', 'irregular-comparison'],
  }),
];
