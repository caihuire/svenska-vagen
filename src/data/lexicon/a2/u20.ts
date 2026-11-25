import type { LexiconEntry } from '../../../types/index';

interface VerbSpec {
  lemma: string;
  en: string;
  ipa: string;
  example: { sv: string; en: string };
  tags: string[];
  // Every strong verb carries all five forms explicitly; nothing is derived.
  forms: { inf: string; imp: string; pres: string; past: string; supine: string };
}

function verb(spec: VerbSpec): LexiconEntry {
  return {
    id: `verb:${spec.lemma}`,
    lemma: spec.lemma,
    en: spec.en,
    pos: 'verb',
    unitId: 'u20',
    stage: 'A2',
    ipa: spec.ipa,
    example: spec.example,
    tags: ['verb-strong', ...spec.tags],
    morph: { pos: 'verb', group: '4', forms: spec.forms },
  };
}

// Of the 30 seed verbs, frysa already exists in the u19 slice (filed there as a
// strong verb), so it is reused by id and not redefined. The remaining 29 are new.
// flyta (flöt, flutit) follows the y/u-ö-u pattern together with flyga and njuta.
export const U20_LEXICON: LexiconEntry[] = [
  // Series 1: i - e - i
  verb({
    lemma: 'driva', en: 'to drive (forward), to run (a business)', ipa: '/ˈdriːva/',
    example: { sv: 'Hon drev en liten affär i många år.', en: 'She ran a small shop for many years.' },
    tags: ['series-ie-i'],
    forms: { inf: 'driva', imp: 'driv', pres: 'driver', past: 'drev', supine: 'drivit' },
  }),
  verb({
    lemma: 'gripa', en: 'to seize, to grab, to arrest', ipa: '/ˈɡriːpa/',
    example: { sv: 'Vakten grep tjuven vid dörren.', en: 'The guard seized the thief by the door.' },
    tags: ['series-ie-i'],
    forms: { inf: 'gripa', imp: 'grip', pres: 'griper', past: 'grep', supine: 'gripit' },
  }),
  verb({
    lemma: 'riva', en: 'to tear, to pull down', ipa: '/ˈriːva/',
    example: { sv: 'De rev det gamla huset i fjol.', en: 'They pulled down the old house last year.' },
    tags: ['series-ie-i'],
    forms: { inf: 'riva', imp: 'riv', pres: 'river', past: 'rev', supine: 'rivit' },
  }),
  verb({
    lemma: 'skina', en: 'to shine', ipa: '/ˈɧiːna/',
    example: { sv: 'Solen sken hela dagen.', en: 'The sun shone all day.' },
    tags: ['series-ie-i'],
    forms: { inf: 'skina', imp: 'skin', pres: 'skiner', past: 'sken', supine: 'skinit' },
  }),
  verb({
    lemma: 'skrika', en: 'to shout, to scream', ipa: '/ˈskriːka/',
    example: { sv: 'Barnet skrek högt i natt.', en: 'The child screamed loudly last night.' },
    tags: ['series-ie-i'],
    forms: { inf: 'skrika', imp: 'skrik', pres: 'skriker', past: 'skrek', supine: 'skrikit' },
  }),
  verb({
    lemma: 'stiga', en: 'to rise, to step, to climb', ipa: '/ˈstiːɡa/',
    example: { sv: 'Priset har stigit sedan i våras.', en: 'The price has risen since last spring.' },
    tags: ['series-ie-i'],
    forms: { inf: 'stiga', imp: 'stig', pres: 'stiger', past: 'steg', supine: 'stigit' },
  }),
  verb({
    lemma: 'rida', en: 'to ride (a horse)', ipa: '/ˈriːda/',
    example: { sv: 'Vi red genom skogen i går.', en: 'We rode through the forest yesterday.' },
    tags: ['series-ie-i'],
    forms: { inf: 'rida', imp: 'rid', pres: 'rider', past: 'red', supine: 'ridit' },
  }),
  verb({
    lemma: 'bita', en: 'to bite', ipa: '/ˈbiːta/',
    example: { sv: 'Hunden bet mig i handen.', en: 'The dog bit me on the hand.' },
    tags: ['series-ie-i'],
    forms: { inf: 'bita', imp: 'bit', pres: 'biter', past: 'bet', supine: 'bitit' },
  }),
  verb({
    lemma: 'lida', en: 'to suffer', ipa: '/ˈliːda/',
    example: { sv: 'Landet led av ett långt krig.', en: 'The country suffered from a long war.' },
    tags: ['series-ie-i'],
    forms: { inf: 'lida', imp: 'lid', pres: 'lider', past: 'led', supine: 'lidit' },
  }),
  // Series 2: y/u - ö - u
  verb({
    lemma: 'flyga', en: 'to fly', ipa: '/ˈflyːɡa/',
    example: { sv: 'Fåglarna flög söderut i september.', en: 'The birds flew south in September.' },
    tags: ['series-yu-o-u'],
    forms: { inf: 'flyga', imp: 'flyg', pres: 'flyger', past: 'flög', supine: 'flugit' },
  }),
  verb({
    lemma: 'njuta', en: 'to enjoy', ipa: '/ˈnjʉːta/',
    example: { sv: 'Vi njöt av solen på bryggan.', en: 'We enjoyed the sun on the jetty.' },
    tags: ['series-yu-o-u'],
    forms: { inf: 'njuta', imp: 'njut', pres: 'njuter', past: 'njöt', supine: 'njutit' },
  }),
  verb({
    lemma: 'bjuda', en: 'to offer, to invite', ipa: '/ˈbjʉːda/',
    example: { sv: 'Hon har bjudit oss på middag.', en: 'She has invited us to dinner.' },
    tags: ['series-yu-o-u'],
    forms: { inf: 'bjuda', imp: 'bjud', pres: 'bjuder', past: 'bjöd', supine: 'bjudit' },
  }),
  verb({
    lemma: 'ljuga', en: 'to lie, to tell a lie', ipa: '/ˈljʉːɡa/',
    example: { sv: 'Han ljög om var han hade varit.', en: 'He lied about where he had been.' },
    tags: ['series-yu-o-u'],
    forms: { inf: 'ljuga', imp: 'ljug', pres: 'ljuger', past: 'ljög', supine: 'ljugit' },
  }),
  verb({
    lemma: 'flyta', en: 'to float', ipa: '/ˈflyːta/',
    example: { sv: 'Lådan flöt på vattnet hela natten.', en: 'The box floated on the water all night.' },
    tags: ['series-yu-o-u'],
    forms: { inf: 'flyta', imp: 'flyt', pres: 'flyter', past: 'flöt', supine: 'flutit' },
  }),
  // Series 3: i - a - u
  verb({
    lemma: 'sjunka', en: 'to sink, to fall', ipa: '/ˈɧɵŋka/',
    example: { sv: 'Skeppet sjönk på några minuter.', en: 'The ship sank in a few minutes.' },
    tags: ['series-i-a-u'],
    forms: { inf: 'sjunka', imp: 'sjunk', pres: 'sjunker', past: 'sjönk', supine: 'sjunkit' },
  }),
  verb({
    lemma: 'binda', en: 'to tie, to bind', ipa: '/ˈbɪnda/',
    example: { sv: 'Hon band ett rött band runt paketet.', en: 'She tied a red ribbon around the parcel.' },
    tags: ['series-i-a-u'],
    forms: { inf: 'binda', imp: 'bind', pres: 'binder', past: 'band', supine: 'bundit' },
  }),
  verb({
    lemma: 'brinna', en: 'to burn, to be on fire', ipa: '/ˈbrɪnːa/',
    example: { sv: 'Det brann i ett hus i går kväll.', en: 'A house was on fire last night.' },
    tags: ['series-i-a-u'],
    forms: { inf: 'brinna', imp: 'brinn', pres: 'brinner', past: 'brann', supine: 'brunnit' },
  }),
  verb({
    lemma: 'finna', en: 'to find', ipa: '/ˈfɪnːa/',
    example: { sv: 'Man fann ett gammalt mynt i trädgården.', en: 'An old coin was found in the garden.' },
    tags: ['series-i-a-u'],
    forms: { inf: 'finna', imp: 'finn', pres: 'finner', past: 'fann', supine: 'funnit' },
  }),
  verb({
    lemma: 'försvinna', en: 'to disappear', ipa: '/fœˈʂvɪnːa/',
    example: { sv: 'Nyckeln har försvunnit igen.', en: 'The key has disappeared again.' },
    tags: ['series-i-a-u'],
    forms: { inf: 'försvinna', imp: 'försvinn', pres: 'försvinner', past: 'försvann', supine: 'försvunnit' },
  }),
  verb({
    lemma: 'hinna', en: 'to have time to, to make it', ipa: '/ˈhɪnːa/',
    example: { sv: 'Hon hann med tåget i sista stund.', en: 'She made the train at the last moment.' },
    tags: ['series-i-a-u'],
    forms: { inf: 'hinna', imp: 'hinn', pres: 'hinner', past: 'hann', supine: 'hunnit' },
  }),
  verb({
    lemma: 'spricka', en: 'to crack, to burst', ipa: '/ˈsprɪkːa/',
    example: { sv: 'Koppen sprack när jag hällde i hett vatten.', en: 'The cup cracked when I poured in hot water.' },
    tags: ['series-i-a-u'],
    forms: { inf: 'spricka', imp: 'sprick', pres: 'spricker', past: 'sprack', supine: 'spruckit' },
  }),
  verb({
    lemma: 'vinna', en: 'to win', ipa: '/ˈvɪnːa/',
    example: { sv: 'Vårt lag har vunnit alla matcher i år.', en: 'Our team has won all its matches this year.' },
    tags: ['series-i-a-u'],
    forms: { inf: 'vinna', imp: 'vinn', pres: 'vinner', past: 'vann', supine: 'vunnit' },
  }),
  // Series 4: a - o - a
  verb({
    lemma: 'ta', en: 'to take', ipa: '/tɑː/',
    example: { sv: 'Han tog bussen till jobbet.', en: 'He took the bus to work.' },
    tags: ['series-a-o-a', 'short-verb'],
    forms: { inf: 'ta', imp: 'ta', pres: 'tar', past: 'tog', supine: 'tagit' },
  }),
  verb({
    lemma: 'dra', en: 'to pull, to draw', ipa: '/drɑː/',
    example: { sv: 'Vi drog båten upp på stranden.', en: 'We pulled the boat up onto the beach.' },
    tags: ['series-a-o-a', 'short-verb'],
    forms: { inf: 'dra', imp: 'dra', pres: 'drar', past: 'drog', supine: 'dragit' },
  }),
  verb({
    lemma: 'föredra', en: 'to prefer', ipa: '/ˈføːrɛˌdrɑː/',
    example: { sv: 'Hon föredrog att stanna hemma.', en: 'She preferred to stay at home.' },
    tags: ['series-a-o-a', 'short-verb'],
    forms: { inf: 'föredra', imp: 'föredra', pres: 'föredrar', past: 'föredrog', supine: 'föredragit' },
  }),
  verb({
    lemma: 'anta', en: 'to assume, to accept', ipa: '/ˈanˌtɑː/',
    example: { sv: 'Jag antar att du är trött efter resan.', en: 'I assume you are tired after the journey.' },
    tags: ['series-a-o-a', 'short-verb'],
    forms: { inf: 'anta', imp: 'anta', pres: 'antar', past: 'antog', supine: 'antagit' },
  }),
  // Series 5: ä - a - u
  verb({
    lemma: 'bära', en: 'to carry, to wear', ipa: '/ˈbæːra/',
    example: { sv: 'Hon bar en tung väska hem.', en: 'She carried a heavy bag home.' },
    tags: ['series-ae-a-u'],
    forms: { inf: 'bära', imp: 'bär', pres: 'bär', past: 'bar', supine: 'burit' },
  }),
  verb({
    lemma: 'skära', en: 'to cut, to slice', ipa: '/ˈɧæːra/',
    example: { sv: 'Han skar brödet i tunna skivor.', en: 'He cut the bread into thin slices.' },
    tags: ['series-ae-a-u'],
    forms: { inf: 'skära', imp: 'skär', pres: 'skär', past: 'skar', supine: 'skurit' },
  }),
  verb({
    lemma: 'stjäla', en: 'to steal', ipa: '/ˈɧɛːla/',
    example: { sv: 'Någon har stulit min cykel.', en: 'Someone has stolen my bicycle.' },
    tags: ['series-ae-a-u'],
    forms: { inf: 'stjäla', imp: 'stjäl', pres: 'stjäl', past: 'stal', supine: 'stulit' },
  }),
];
