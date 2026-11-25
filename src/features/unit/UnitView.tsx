import { useEffect, useMemo, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Award, BookOpen, Dumbbell, FileText, Layers, Lock } from 'lucide-react';
import { IosInstallBanner } from '../../components/IosInstallBanner';
import { CURRICULUM_MANIFEST } from '../../data/curriculum/manifest';
import { isUnitLoadable, loadUnit } from '../../data/curriculum/loader';
import { getA1LexiconMap } from '../../data/lexicon/index';
import { computeUnitMastery } from '../../engine/mastery/tracker';
import { useApp } from '../../store/AppContext';
import type { LexiconEntry, UnitContent } from '../../types/index';
import { ExerciseSession } from '../exercises/ExerciseSession';
import { CulturalReaderTab } from './CulturalReaderTab';
import { LearnTab } from './LearnTab';
import { UnitWordsTab } from './UnitWordsTab';

type UnitTabKey = 'learn' | 'practice' | 'reader' | 'words';

const TABS: { key: UnitTabKey; label: string; icon: typeof Layers }[] = [
  { key: 'learn', label: 'Learn', icon: Layers },
  { key: 'practice', label: 'Practice', icon: Dumbbell },
  { key: 'reader', label: 'Reader', icon: FileText },
  { key: 'words', label: 'Words', icon: BookOpen },
];

export function UnitView() {
  const { unitId = '' } = useParams<{ unitId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = (searchParams.get('tab') as UnitTabKey | null) ?? 'learn';
  const [activeTab, setActiveTab] = useState<UnitTabKey>(
    TABS.some((t) => t.key === initialTab) ? initialTab : 'learn'
  );

  const { progress, completeUnitPractice, completeUnitReader } = useApp();
  const [unit, setUnit] = useState<UnitContent | null>(null);
  const [lexMap, setLexMap] = useState<Map<string, LexiconEntry>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [practiceOpen, setPracticeOpen] = useState(false);

  const summary = useMemo(
    () => CURRICULUM_MANIFEST.find((u) => u.id === unitId),
    [unitId]
  );

  useEffect(() => {
    const paramTab = searchParams.get('tab') as UnitTabKey | null;
    if (paramTab && TABS.some((t) => t.key === paramTab)) {
      setActiveTab(paramTab);
    }
  }, [searchParams]);

  useEffect(() => {
    let cancelled = false;
    setUnit(null);
    setError(null);

    if (!unitId || !isUnitLoadable(unitId)) {
      setLoading(false);
      return;
    }

    setLoading(true);
    Promise.all([loadUnit(unitId), getA1LexiconMap()])
      .then(([loadedUnit, loadedLexMap]) => {
        if (cancelled) return;
        setUnit(loadedUnit);
        setLexMap(loadedLexMap);
        setLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : 'Failed to load unit');
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [unitId]);

  const handleSelectTab = (tab: UnitTabKey) => {
    setActiveTab(tab);
    setSearchParams({ tab }, { replace: true });
  };

  if (!summary) {
    return (
      <main className="mx-auto max-w-lg px-4 py-8 space-y-4">
        <Link
          to="/"
          className="inline-flex min-h-[48px] items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] px-4 text-sm font-bold text-[var(--text-primary)]"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          <span>Back to Path</span>
        </Link>
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-6 text-center">
          <p className="text-base font-bold text-[var(--text-primary)]">
            Unit not found
          </p>
        </div>
      </main>
    );
  }

  if (!summary.available || !isUnitLoadable(summary.id)) {
    return (
      <main className="mx-auto max-w-lg px-4 py-6 pb-24 space-y-4">
        <Link
          to="/"
          className="inline-flex min-h-[48px] items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] px-4 text-sm font-bold text-[var(--text-primary)]"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          <span>Back to Path</span>
        </Link>

        <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-6 space-y-3 shadow-sm">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-[var(--bg-surface)] px-3 py-1 text-xs font-bold text-[var(--text-muted)]">
            <Lock className="h-3.5 w-3.5" aria-hidden="true" />
            <span>
              Stage {summary.stage} · Unit {summary.number} (Wave 2–4 Preview)
            </span>
          </div>
          <h1 className="text-xl font-extrabold text-[var(--text-primary)]">
            {summary.title}
          </h1>
          <p className="text-sm leading-relaxed text-[var(--text-muted)]">
            {summary.grammarFocus}
          </p>
          {summary.culturalTheme && (
            <p className="text-xs font-semibold text-[var(--brand)]">
              Cultural Reader Theme: {summary.culturalTheme}
            </p>
          )}
        </div>
      </main>
    );
  }

  if (loading || !unit) {
    return (
      <main className="mx-auto max-w-lg px-4 py-8 pb-24 space-y-4">
        <div className="h-12 w-32 animate-pulse rounded-xl bg-[var(--border)]" />
        <div className="h-44 animate-pulse rounded-2xl bg-[var(--border)]" />
        {error && (
          <p className="text-sm font-semibold text-[var(--error)]">{error}</p>
        )}
      </main>
    );
  }

  const unitProg = progress.unitProgress[unit.id];
  const mastery = computeUnitMastery(unit.id, unit.lexiconIds, progress, Date.now());
  const tierLabels = ['Unstarted', 'Tier 1 · Bronze', 'Tier 2 · Silver', 'Tier 3 · Gold'];

  if (practiceOpen) {
    return (
      <ExerciseSession
        title={`Unit ${unit.number}: ${unit.title}`}
        subtitle={`Unit ${unit.number} Practice`}
        exercises={unit.exercises}
        onComplete={(res) => {
          completeUnitPractice(unit.id, res.scorePercent, res.xpEarned);
        }}
        onExit={() => setPracticeOpen(false)}
      />
    );
  }

  return (
    <div className="min-h-dvh pb-24">
      <header className="pt-safe border-b border-[var(--border)] bg-[var(--bg-card)] px-4 py-3">
        <div className="mx-auto max-w-lg space-y-3">
          <div className="flex items-center gap-2">
            <Link
              to="/"
              aria-label="Back to Skill Path"
              className="flex min-h-[48px] min-w-[48px] shrink-0 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] text-[var(--text-primary)] hover:border-[var(--brand)]"
            >
              <ArrowLeft className="h-5 w-5" aria-hidden="true" />
            </Link>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wide text-[var(--brand)]">
                  {unit.stage} · Unit {unit.number}
                </span>
                {mastery.tier > 0 && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-[var(--accent)]/15 px-2 py-0.5 text-micro font-bold text-[var(--accent-text)]">
                    <Award className="h-3 w-3" aria-hidden="true" />
                    {tierLabels[mastery.tier]}
                  </span>
                )}
              </div>
              <h1 className="truncate text-lg font-extrabold text-[var(--text-primary)]">
                {unit.title}
              </h1>
            </div>
          </div>

          {/* 4-Tab Bar */}
          <div
            role="tablist"
            aria-label="Unit sections"
            className="grid grid-cols-4 gap-1.5"
          >
            {TABS.map(({ key, label, icon: Icon }) => {
              const selected = activeTab === key;
              return (
                <button
                  key={key}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  onClick={() => handleSelectTab(key)}
                  className={`flex min-h-[48px] items-center justify-center gap-1.5 rounded-xl border px-2 text-xs font-bold transition-colors select-none touch-manipulation ${
                    selected
                      ? 'border-[var(--brand)] bg-[var(--brand)] text-[var(--on-brand)]'
                      : 'border-[var(--border)] bg-[var(--bg-surface)] text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span>{label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-lg px-4 py-4 space-y-4">
        <IosInstallBanner />

        {activeTab === 'learn' && (
          <LearnTab
            cards={unit.grammarCards}
            onStartPractice={() => handleSelectTab('practice')}
          />
        )}

        {activeTab === 'practice' && (
          <div className="space-y-4">
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-5 shadow-sm space-y-4">
              <div className="space-y-1">
                <h2 className="text-lg font-extrabold text-[var(--text-primary)]">
                  Unit {unit.number} Practice
                </h2>
                <p className="text-sm text-[var(--text-muted)]">
                  {unit.exercises.length} mixed exercises covering grammar, word order, listening, and inflection. Score{' '}
                  <strong className="text-[var(--text-primary)]">80%+</strong> to unlock the next unit in Guided Mode.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="rounded-xl bg-[var(--bg-surface)] p-3">
                  <p className="text-xs font-semibold text-[var(--text-muted)]">
                    Best Score
                  </p>
                  <p className="mt-0.5 text-xl font-extrabold text-[var(--brand)]">
                    {unitProg ? `${unitProg.practiceBestScore}%` : '—'}
                  </p>
                </div>
                <div className="rounded-xl bg-[var(--bg-surface)] p-3">
                  <p className="text-xs font-semibold text-[var(--text-muted)]">
                    Attempts
                  </p>
                  <p className="mt-0.5 text-xl font-extrabold text-[var(--text-primary)]">
                    {unitProg?.practiceAttempts ?? 0}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setPracticeOpen(true)}
                className="min-h-[48px] w-full rounded-xl bg-[var(--brand)] px-4 text-base font-bold text-[var(--on-brand)] shadow-sm hover:opacity-95 select-none touch-manipulation"
              >
                {unitProg?.practiceAttempts ? 'Practice Again' : 'Start Practice'}
              </button>
            </div>
          </div>
        )}

        {activeTab === 'reader' && (
          <CulturalReaderTab
            unit={unit}
            lexMap={lexMap}
            onCompleteReader={(xp) => completeUnitReader(unit.id, xp)}
          />
        )}

        {activeTab === 'words' && (
          <UnitWordsTab unit={unit} lexMap={lexMap} />
        )}
      </main>
    </div>
  );
}
