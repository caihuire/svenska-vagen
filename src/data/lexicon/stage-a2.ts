import type { LexiconEntry } from '../../types/index';
import { U14_LEXICON } from './a2/u14';
import { U15_LEXICON } from './a2/u15';
import { U16_LEXICON } from './a2/u16';
import { U17_LEXICON } from './a2/u17';
import { U18_LEXICON } from './a2/u18';

export const STAGE_A2_LEXICON: LexiconEntry[] = [...U14_LEXICON, ...U15_LEXICON, ...U16_LEXICON, ...U17_LEXICON, ...U18_LEXICON];
