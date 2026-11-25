import type { LexiconEntry } from '../../types/index';
import { U14_LEXICON } from './a2/u14';
import { U15_LEXICON } from './a2/u15';

export const STAGE_A2_LEXICON: LexiconEntry[] = [...U14_LEXICON, ...U15_LEXICON];
