export type CefrStage = 'A1' | 'A2' | 'B1' | 'B2';

export type Pos =
  | 'noun'
  | 'verb'
  | 'adj'
  | 'adv'
  | 'pron'
  | 'prep'
  | 'conj'
  | 'num'
  | 'interj'
  | 'phrase';

export interface UnitSummary {
  id: string;
  number: number;
  stage: CefrStage;
  title: string;
  grammarFocus: string;
  culturalTheme?: string;
  available: boolean;
}

export interface GrammarCard {
  id: string;
  kind: 'rule' | 'table' | 'examples' | 'trap';
  title: string;
  body: string;
  table?: {
    headers: string[];
    rows: string[][];
  };
  examples?: {
    sv: string;
    en: string;
    note?: string;
  }[];
  highlight?: string;
}

export interface NounMorph {
  pos: 'noun';
  gender: 'en' | 'ett';
  declension: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 'irreg' | 'uncount' | 'pl';
  forms?: {
    indefSg?: string;
    defSg?: string;
    indefPl?: string;
    defPl?: string;
  };
}

export interface VerbMorph {
  pos: 'verb';
  group: '1' | '2a' | '2b' | '3' | '4' | 'irreg';
  particle?: string;
  deponent?: boolean;
  reflexive?: boolean;
  forms?: {
    inf?: string;
    imp?: string;
    pres?: string;
    past?: string;
    supine?: string;
    pastPart?: string;
  };
}

export interface AdjMorph {
  pos: 'adj';
  indeclinable?: boolean;
  forms?: {
    common?: string;
    neuter?: string;
    plDef?: string;
    comp?: string;
    sup?: string;
  };
}

export interface LexiconEntry {
  id: string;
  lemma: string;
  en: string;
  pos: Pos;
  unitId: string;
  stage: CefrStage;
  ipa?: string;
  example?: {
    sv: string;
    en: string;
  };
  tags?: string[];
  morph?: NounMorph | VerbMorph | AdjMorph;
}

export interface ExerciseBase {
  id: string;
  unitId: string;
  grammarTag: string;
  explanation: string;
  ttsText?: string;
}

export interface ClassifierExercise extends ExerciseBase {
  type: 'classifier';
  prompt: string;
  target: string;
  en?: string;
  options: string[];
  correctOption: string;
  ipa?: string;
}

export interface MorphFillExercise extends ExerciseBase {
  type: 'morph-fill';
  prompt: string;
  baseForm: string;
  sentence?: string;
  en?: string;
  accepted: string[];
  hint?: string;
}

export interface WordOrderExercise extends ExerciseBase {
  type: 'word-order';
  prompt: string;
  triggerCue?: string;
  slotHints?: string[];
  chunks: string[];
  correctOrder: string[];
  acceptedOrders?: string[][];
}

export interface ClozeExercise extends ExerciseBase {
  type: 'cloze';
  prompt: string;
  sentence: string;
  mode: 'choice' | 'typed';
  options?: string[];
  accepted: string[];
  hint?: string;
}

export interface ErrorSpottingExercise extends ExerciseBase {
  type: 'error-spotting';
  prompt: string;
  tokens: string[];
  errorIndex: number;
  options: string[];
  correctCorrection: string;
}

export interface ListeningExercise extends ExerciseBase {
  type: 'listening';
  prompt: string;
  audioText: string;
  fallbackText: string;
  ipa?: string;
  options: string[];
  correctOption: string;
}

export type Exercise =
  | ClassifierExercise
  | MorphFillExercise
  | WordOrderExercise
  | ClozeExercise
  | ErrorSpottingExercise
  | ListeningExercise;

export interface TextToken {
  surface: string;
  lexId?: string;
  gloss?: string;
  spanGroup?: string;
  isPunct?: boolean;
}

export interface CulturalText {
  title: string;
  subtitle?: string;
  markup: string;
  englishSummary: string;
  comprehension: Exercise[];
}

export interface UnitContent extends UnitSummary {
  grammarCards: GrammarCard[];
  lexiconIds: string[];
  exercises: Exercise[];
  culturalText: CulturalText;
}

export type SrsGrade = 'again' | 'good' | 'easy';

export interface SrsCardState {
  lexId: string;
  intervalDays: number;
  ease: number;
  reps: number;
  lapses: number;
  dueAt: number;
  lastReviewedAt: number;
  enrolledAt: number;
}

export interface UnitProgress {
  practiceBestScore: number;
  practiceAttempts: number;
  readerPassed: boolean;
  lastStudiedAt: number;
}

export interface WeakSkillRecord {
  tag: string;
  recentResults: boolean[];
  updatedAt: number;
}

export interface UserSettings {
  dailyXpGoal: number;
  srsNewCap: number;
  srsReviewCap: number;
  autoAdvance: boolean;
  darkMode: boolean;
  freeBrowse: boolean;
  iosInstallDismissed: boolean;
}

export interface UserProgress {
  schemaVersion: 1;
  xp: number;
  streak: number;
  freezes: number;
  activeDates: string[];
  lastStreakCheckDate?: string;
  unitProgress: Record<string, UnitProgress>;
  srsCards: Record<string, SrsCardState>;
  weakSkills: Record<string, WeakSkillRecord>;
  settings: UserSettings;
  updatedAt: number;
}

export interface SyncDiff {
  newSrsCards: number;
  updatedSrsCards: number;
  updatedUnits: number;
  xpDelta: number;
  newActiveDates: number;
}

export type DrillCategory =
  | 'gender'
  | 'plurals'
  | 'definite'
  | 'verbs'
  | 'adjectives'
  | 'comparison'
  | 'passive'
  | 'word-order'
  | 'weak-spots';
