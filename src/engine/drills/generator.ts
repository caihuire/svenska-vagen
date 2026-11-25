import type {
  CefrStage,
  ClassifierExercise,
  DrillCategory,
  Exercise,
  LexiconEntry,
  MorphFillExercise,
} from '../../types/index.ts';
import { inflectAdj, inflectNoun, inflectVerb } from '../morphology/inflector.ts';

function createRng(seed?: number): () => number {
  if (seed === undefined) {
    return () => Math.random();
  }
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffleWithRng<T>(items: T[], rng: () => number): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function buildGenderExercise(entry: LexiconEntry, idx: number): ClassifierExercise | null {
  if (entry.morph?.pos !== 'noun' || entry.morph.declension === 'pl') {
    return null;
  }
  const { gender } = entry.morph;
  return {
    id: `drill-gender-${entry.id}-${idx}`,
    unitId: entry.unitId,
    grammarTag: 'noun-gender',
    type: 'classifier',
    prompt: 'Choose the grammatical gender (en or ett)',
    target: entry.lemma,
    en: entry.en,
    options: ['en', 'ett'],
    correctOption: gender,
    ...(entry.ipa ? { ipa: entry.ipa } : {}),
    explanation: `${gender} ${entry.lemma} ("${entry.en}")`,
    ttsText: `${gender} ${entry.lemma}`,
  };
}

function buildPluralExercise(entry: LexiconEntry, idx: number): MorphFillExercise | null {
  if (
    entry.morph?.pos !== 'noun' ||
    entry.morph.declension === 'uncount' ||
    entry.morph.declension === 'pl'
  ) {
    return null;
  }
  const forms = inflectNoun(entry);
  if (!forms.indefPl) return null;

  return {
    id: `drill-plurals-${entry.id}-${idx}`,
    unitId: entry.unitId,
    grammarTag: 'noun-plurals',
    type: 'morph-fill',
    prompt: `Write the indefinite plural of "${entry.morph.gender} ${entry.lemma}"`,
    baseForm: `${entry.morph.gender} ${entry.lemma}`,
    en: entry.en,
    accepted: [forms.indefPl],
    hint: `Declension ${entry.morph.declension}`,
    explanation: `${entry.morph.gender} ${entry.lemma} → ${forms.indefPl} (def. pl: ${forms.defPl})`,
    ttsText: forms.indefPl,
  };
}

function buildDefiniteExercise(
  entry: LexiconEntry,
  idx: number,
  rng: () => number
): MorphFillExercise | null {
  if (entry.morph?.pos !== 'noun') return null;
  const forms = inflectNoun(entry);
  const candidates: Array<{ kind: 'sg' | 'pl'; answer: string; label: string }> = [];

  if (forms.defSg) {
    candidates.push({
      kind: 'sg',
      answer: forms.defSg,
      label: `Write the definite singular ("the ...") of "${entry.morph.gender} ${entry.lemma}"`,
    });
  }
  if (forms.defPl) {
    candidates.push({
      kind: 'pl',
      answer: forms.defPl,
      label: `Write the definite plural ("the ...s") of "${entry.morph.gender} ${entry.lemma}"`,
    });
  }
  if (candidates.length === 0) return null;

  const chosen = candidates[Math.floor(rng() * candidates.length)];
  const baseLabel =
    chosen.kind === 'sg'
      ? `${entry.morph.gender} ${entry.lemma}`
      : `${forms.indefPl || entry.lemma} (pl.)`;

  return {
    id: `drill-definite-${entry.id}-${chosen.kind}-${idx}`,
    unitId: entry.unitId,
    grammarTag: 'noun-definite',
    type: 'morph-fill',
    prompt: chosen.label,
    baseForm: baseLabel,
    en: entry.en,
    accepted: [chosen.answer],
    hint: `${entry.morph.gender}-noun`,
    explanation: `${baseLabel} → ${chosen.answer}`,
    ttsText: chosen.answer,
  };
}

function isSVerb(forms: { inf: string; pres: string }): boolean {
  return /s$/i.test(forms.inf) && /s$/i.test(forms.pres);
}

function isBlankForm(value: string | undefined): boolean {
  return !value || /^[—-]+$/.test(value.trim());
}

function buildVerbExercise(
  entry: LexiconEntry,
  idx: number,
  rng: () => number
): MorphFillExercise | null {
  if (entry.morph?.pos !== 'verb') return null;
  const forms = inflectVerb(entry);

  const slots: Array<{ key: string; prompt: string; answer: string }> = [
    { key: 'pres', prompt: `Write the present tense of "${forms.inf}"`, answer: forms.pres },
    { key: 'past', prompt: `Write the past tense (preteritum) of "${forms.inf}"`, answer: forms.past },
    { key: 'supine', prompt: `Write the supine (used after "har") of "${forms.inf}"`, answer: forms.supine },
    { key: 'imp', prompt: `Write the imperative of "${forms.inf}"`, answer: forms.imp },
  ].filter((s) => Boolean(s.answer) && !/^[—-]+$/.test(s.answer.trim()));

  // -s verbs (deponents/passives) have a placeholder imperative slot and a
  // present identical to the infinitive: never drill those.
  const sVerb = isSVerb(forms);
  const usable = sVerb ? slots.filter((s) => s.key !== 'imp' && s.answer !== forms.inf) : slots;

  if (usable.length === 0) return null;
  const chosen = usable[Math.floor(rng() * usable.length)];

  return {
    id: `drill-verbs-${entry.id}-${chosen.key}-${idx}`,
    unitId: entry.unitId,
    grammarTag: 'verb-tenses',
    type: 'morph-fill',
    prompt: chosen.prompt,
    baseForm: forms.inf,
    en: entry.en,
    accepted: [chosen.answer],
    hint: `Group ${entry.morph.group}`,
    explanation: `${forms.inf} → ${forms.pres} / ${forms.past} / har ${forms.supine}`,
    ttsText: chosen.answer,
  };
}

function buildAdjExercise(
  entry: LexiconEntry,
  idx: number,
  rng: () => number
): MorphFillExercise | null {
  if (entry.morph?.pos !== 'adj') return null;
  const forms = inflectAdj(entry);

  const slots: Array<{ key: string; prompt: string; answer: string }> = [
    {
      key: 'neuter',
      prompt: `Inflect "${forms.common}" for an ett-noun (neuter singular)`,
      answer: forms.neuter,
    },
    {
      key: 'plDef',
      prompt: `Inflect "${forms.common}" for plural or definite nouns`,
      answer: forms.plDef,
    },
  ].filter((s) => Boolean(s.answer) && s.answer !== forms.common);

  if (slots.length === 0) return null;
  const chosen = slots[Math.floor(rng() * slots.length)];

  return {
    id: `drill-adj-${entry.id}-${chosen.key}-${idx}`,
    unitId: entry.unitId,
    grammarTag: 'adj-agreement',
    type: 'morph-fill',
    prompt: chosen.prompt,
    baseForm: forms.common,
    en: entry.en,
    accepted: [chosen.answer],
    hint: entry.morph.indeclinable ? 'Indeclinable' : 'Adjective agreement',
    explanation: `${forms.common} (en) / ${forms.neuter} (ett) / ${forms.plDef} (pl./def.)`,
    ttsText: chosen.answer,
  };
}

function comparisonSlots(entry: LexiconEntry): Array<'comp' | 'sup'> {
  if (entry.morph?.pos !== 'adj' || entry.tags?.includes('mer-mest')) return [];
  const forms = inflectAdj(entry);
  const slots: Array<'comp' | 'sup'> = [];
  for (const key of ['comp', 'sup'] as const) {
    const answer = forms[key];
    if (!isBlankForm(answer) && answer !== forms.common) slots.push(key);
  }
  return slots;
}

function buildComparisonExercise(
  entry: LexiconEntry,
  slot: 'comp' | 'sup',
  idx: number
): MorphFillExercise | null {
  if (!comparisonSlots(entry).includes(slot)) return null;
  const forms = inflectAdj(entry);
  const answer = forms[slot] as string;
  const label = slot === 'comp' ? 'comparative ("more ...")' : 'superlative ("most ...")';
  return {
    id: `drill-comparison-${entry.id}-${slot}-${idx}`,
    unitId: entry.unitId,
    grammarTag: 'adj-comparison',
    type: 'morph-fill',
    prompt: `Write the ${label} of "${forms.common}"`,
    baseForm: forms.common,
    en: entry.en,
    accepted: [answer],
    hint: 'Comparison',
    explanation: `${forms.common} → ${forms.comp} → ${forms.sup}`,
    ttsText: answer,
  };
}

function buildPassiveExercise(
  entry: LexiconEntry,
  idx: number,
  rng: () => number
): MorphFillExercise | null {
  if (entry.morph?.pos !== 'verb' || entry.tags?.includes('rare-forms')) return null;
  const forms = inflectVerb(entry);
  if (!isSVerb(forms)) return null;

  const slots = [
    { key: 'past', prompt: `Write the past tense (preteritum) of "${forms.inf}"`, answer: forms.past },
    { key: 'supine', prompt: `Write the supine (used after "har") of "${forms.inf}"`, answer: forms.supine },
  ].filter((s) => !isBlankForm(s.answer) && /s$/i.test(s.answer) && s.answer !== forms.inf);

  if (slots.length === 0) return null;
  const chosen = slots[Math.floor(rng() * slots.length)];

  return {
    id: `drill-passive-${entry.id}-${chosen.key}-${idx}`,
    unitId: entry.unitId,
    grammarTag: 'verb-s-passive',
    type: 'morph-fill',
    prompt: chosen.prompt,
    baseForm: forms.inf,
    en: entry.en,
    accepted: [chosen.answer],
    hint: entry.morph.deponent ? 'Deponent (-s verb)' : '-s passive',
    explanation: `${forms.inf} → ${forms.past} / har ${forms.supine}`,
    ttsText: chosen.answer,
  };
}

export function filterLexiconByStage(
  lexicon: LexiconEntry[],
  stage: CefrStage | 'all'
): LexiconEntry[] {
  return stage === 'all' ? lexicon : lexicon.filter((e) => e.stage === stage);
}

/** Filtered pool when it can fill a session, otherwise the full pool. */
export function selectDrillPool(
  allLexicon: LexiconEntry[],
  stage: CefrStage | 'all',
  category: DrillCategory,
  sessionLength: number,
  seed?: number
): LexiconEntry[] {
  if (stage === 'all') return allLexicon;
  const filtered = filterLexiconByStage(allLexicon, stage);
  const produced = generateMorphologyDrills(category, filtered, sessionLength, seed).length;
  return produced >= sessionLength ? filtered : allLexicon;
}

export function generateMorphologyDrills(
  category: DrillCategory,
  lexicon: LexiconEntry[],
  count: number,
  seed?: number
): Exercise[] {
  if (count <= 0 || lexicon.length === 0) return [];

  const rng = createRng(seed);
  const pool = shuffleWithRng(lexicon, rng);
  const exercises: Exercise[] = [];
  const seenPrompts = new Set<string>();

  if (category === 'comparison') {
    const candidates = shuffleWithRng(
      pool.flatMap((entry) => comparisonSlots(entry).map((slot) => ({ entry, slot }))),
      rng
    );
    for (const { entry, slot } of candidates) {
      if (exercises.length >= count) break;
      const ex = buildComparisonExercise(entry, slot, exercises.length);
      if (!ex) continue;
      const key = `${ex.prompt}:${ex.baseForm}`;
      if (seenPrompts.has(key)) continue;
      seenPrompts.add(key);
      exercises.push(ex);
    }
    return exercises;
  }

  const morphCategories: Array<'gender' | 'plurals' | 'definite' | 'verbs' | 'adjectives'> = [
    'gender',
    'plurals',
    'definite',
    'verbs',
    'adjectives',
  ];

  for (let i = 0; i < pool.length && exercises.length < count; i++) {
    const entry = pool[i];
    const targetCategory =
      category === 'weak-spots' || category === 'word-order'
        ? morphCategories[i % morphCategories.length]
        : category;

    let exercise: Exercise | null = null;
    switch (targetCategory) {
      case 'gender':
        exercise = buildGenderExercise(entry, exercises.length);
        break;
      case 'plurals':
        exercise = buildPluralExercise(entry, exercises.length);
        break;
      case 'definite':
        exercise = buildDefiniteExercise(entry, exercises.length, rng);
        break;
      case 'verbs':
        exercise = buildVerbExercise(entry, exercises.length, rng);
        break;
      case 'adjectives':
        exercise = buildAdjExercise(entry, exercises.length, rng);
        break;
      case 'passive':
        exercise = buildPassiveExercise(entry, exercises.length, rng);
        break;
    }

    if (!exercise) continue;

    const dedupeKey =
      exercise.type === 'classifier'
        ? `${exercise.type}:${exercise.prompt}:${exercise.target}`
        : `${exercise.type}:${exercise.prompt}:${exercise.baseForm}`;

    if (seenPrompts.has(dedupeKey)) continue;
    seenPrompts.add(dedupeKey);
    exercises.push(exercise);
  }

  return exercises;
}
