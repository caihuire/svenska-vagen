import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ArrowRight, Dumbbell, Target } from 'lucide-react';
import { CURRICULUM_MANIFEST } from '../../data/curriculum/manifest';
import { loadUnit } from '../../data/curriculum/loader';
import { loadStageLexicon } from '../../data/lexicon/index';
import { generateMorphologyDrills } from '../../engine/drills/generator';
import { getWeakGrammarTags } from '../../engine/mastery/tracker';
import { useApp } from '../../store/AppContext';
import type { DrillCategory, Exercise } from '../../types/index';
import { ExerciseSession } from '../exercises/ExerciseSession';

interface DrillCategoryOption {
  id: DrillCategory;
  title: string;
  description: string;
}

const DRILL_CATEGORIES: DrillCategoryOption[] = [
  {
    id: 'gender',
    title: 'en / ett Gender',
    description: 'Rapid-fire common vs. neuter noun classification',
  },
  {
    id: 'plurals',
    title: 'Noun Plurals',
    description: 'Inflect all 7 Swedish plural declensions & irregulars',
  },
  {
    id: 'definite',
    title: 'Definite Forms',
    description: 'End articles (-en, -et, -na, -a, -en) singular & plural',
  },
  {
    id: 'verbs',
    title: 'Verb Present / Past / Supine',
    description: 'Groups I–IV & irregular verb principal parts',
  },
  {
    id: 'adjectives',
    title: 'Adjective Agreement',
    description: 'Indefinite en/ett & plural/definite inflection',
  },
  {
    id: 'word-order',
    title: 'V2 / SIV Word Order',
    description: 'Fronting inversion, questions & clausal adverbials',
  },
  {
    id: 'weak-spots',
    title: 'Weak Spots',
    description: 'Targeted repair for grammar tags below 75% accuracy',
  },
];

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function DrillArenaView() {
  const { progress } = useApp();
  const [searchParams] = useSearchParams();
  const [sessionLength, setSessionLength] = useState<10 | 20>(10);
  const [loadingCategory, setLoadingCategory] = useState<DrillCategory | null>(
    null
  );
  const [activeDrill, setActiveDrill] = useState<{
    title: string;
    exercises: Exercise[];
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const weakTags = useMemo(() => getWeakGrammarTags(progress), [progress]);

  const startDrill = async (category: DrillCategory) => {
    setError(null);
    setLoadingCategory(category);
    try {
      const a1Lexicon = await loadStageLexicon('A1');
      let exercises: Exercise[] = [];

      if (category === 'word-order') {
        const availableIds = CURRICULUM_MANIFEST.filter((u) => u.available).map(
          (u) => u.id
        );
        const units = await Promise.all(availableIds.map((id) => loadUnit(id)));
        const wordOrderPool = units.flatMap((u) =>
          u.exercises.filter((ex) => ex.type === 'word-order')
        );
        exercises = shuffle(wordOrderPool).slice(0, sessionLength);
        if (exercises.length < sessionLength) {
          const extra = generateMorphologyDrills(
            'word-order',
            a1Lexicon,
            sessionLength - exercises.length
          );
          exercises = [...exercises, ...extra];
        }
      } else if (category === 'weak-spots') {
        const availableIds = CURRICULUM_MANIFEST.filter((u) => u.available).map(
          (u) => u.id
        );
        const units = await Promise.all(availableIds.map((id) => loadUnit(id)));
        const weakTagSet = new Set(weakTags.map((w) => w.tag));
        const unitExercises = units.flatMap((u) => u.exercises);
        const matchingCurated = unitExercises.filter((ex) =>
          weakTagSet.has(ex.grammarTag)
        );
        exercises = shuffle(matchingCurated).slice(0, sessionLength);
        if (exercises.length < sessionLength) {
          const extra = generateMorphologyDrills(
            'weak-spots',
            a1Lexicon,
            sessionLength - exercises.length
          );
          exercises = [...exercises, ...extra];
        }
      } else {
        exercises = generateMorphologyDrills(category, a1Lexicon, sessionLength);
      }

      const meta = DRILL_CATEGORIES.find((c) => c.id === category);
      setActiveDrill({
        title: meta?.title ?? 'Drill Session',
        exercises,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to prepare drills');
    } finally {
      setLoadingCategory(null);
    }
  };

  // Support deep link /drills?category=weak-spots
  useEffect(() => {
    const paramCat = searchParams.get('category') as DrillCategory | null;
    if (
      paramCat &&
      DRILL_CATEGORIES.some((c) => c.id === paramCat) &&
      !activeDrill &&
      !loadingCategory
    ) {
      void startDrill(paramCat);
    }
    // Only check initial URL param on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (activeDrill) {
    return (
      <ExerciseSession
        title={activeDrill.title}
        subtitle="Drill Arena"
        exercises={activeDrill.exercises}
        xpPerCorrect={5}
        passBonusXp={0}
        awardXpOnAttempt
        onComplete={() => {
          // XP and weak-skill attempts already recorded per attempt
        }}
        onExit={() => setActiveDrill(null)}
      />
    );
  }

  return (
    <div className="min-h-dvh pb-24">
      <header className="pt-safe border-b border-[var(--border)] bg-[var(--bg-card)] px-4 py-4">
        <div className="mx-auto max-w-lg space-y-3">
          <div className="flex items-center gap-2">
            <Dumbbell className="h-5 w-5 text-[var(--brand)]" aria-hidden="true" />
            <h1 className="text-xl font-extrabold text-[var(--text-primary)]">
              Drill Arena
            </h1>
          </div>
          <p className="text-xs text-[var(--text-muted)]">
            High-volume Swedish inflection and word-order practice. Auto-advance is{' '}
            {progress.settings.autoAdvance ? 'ON' : 'OFF'}.
          </p>

          <div className="flex items-center justify-between gap-2 rounded-xl bg-[var(--bg-surface)] p-2">
            <span className="px-2 text-xs font-bold text-[var(--text-muted)]">
              Session length
            </span>
            <div className="flex gap-1.5">
              {([10, 20] as const).map((len) => (
                <button
                  key={len}
                  type="button"
                  onClick={() => setSessionLength(len)}
                  aria-pressed={sessionLength === len}
                  className={`min-h-[48px] min-w-[64px] rounded-xl px-3 text-sm font-bold transition-colors select-none touch-manipulation ${
                    sessionLength === len
                      ? 'bg-[var(--brand)] text-[var(--on-brand)]'
                      : 'border border-[var(--border)] bg-[var(--bg-card)] text-[var(--text-primary)]'
                  }`}
                >
                  {len} items
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-lg px-4 py-4 space-y-2.5">
        {error && (
          <div className="rounded-xl border border-[var(--error)]/40 bg-[var(--error-bg)] p-3 text-sm font-semibold text-[var(--error)] ">
            {error}
          </div>
        )}

        {DRILL_CATEGORIES.map((cat) => {
          const isWeak = cat.id === 'weak-spots';
          const isBusy = loadingCategory === cat.id;

          return (
            <button
              key={cat.id}
              type="button"
              disabled={loadingCategory !== null}
              onClick={() => void startDrill(cat.id)}
              className="flex min-h-[68px] w-full items-center justify-between gap-3 rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-4 text-left shadow-sm transition-colors hover:border-[var(--brand)] disabled:opacity-60 select-none touch-manipulation"
            >
              <div className="min-w-0 space-y-1">
                <div className="flex items-center gap-2">
                  {isWeak && (
                    <Target
                      className="h-4 w-4 shrink-0 text-[var(--accent-text)]"
                      aria-hidden="true"
                    />
                  )}
                  <span className="text-base font-extrabold text-[var(--text-primary)]">
                    {cat.title}
                  </span>
                  {isWeak && weakTags.length > 0 && (
                    <span className="rounded-full bg-[var(--accent)]/15 px-2 py-0.5 text-micro font-bold text-[var(--accent-text)]">
                      {weakTags.length} weak
                    </span>
                  )}
                </div>
                <p className="text-xs text-[var(--text-muted)]">
                  {cat.description}
                </p>
              </div>
              <ArrowRight
                className="h-5 w-5 shrink-0 text-[var(--brand)]"
                aria-hidden="true"
              />
              {isBusy && <span className="sr-only">Loading drills</span>}
            </button>
          );
        })}
      </main>
    </div>
  );
}
