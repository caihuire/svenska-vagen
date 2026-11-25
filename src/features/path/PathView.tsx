import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Award,
  BookOpen,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Flame,
  Lock,
  Shield,
  Sparkles,
  Target,
  Zap,
} from 'lucide-react';
import { IosInstallBanner } from '../../components/IosInstallBanner';
import { CURRICULUM_MANIFEST } from '../../data/curriculum/manifest';
import { loadStageLexicon } from '../../data/lexicon/index';
import { computeUnitMastery, getWeakGrammarTags } from '../../engine/mastery/tracker';
import { getDueSrsQueue } from '../../engine/srs/scheduler';
import { useApp } from '../../store/AppContext';
import type { CefrStage, UnitSummary } from '../../types/index';

const STAGES: { stage: CefrStage; label: string; subtitle: string }[] = [
  { stage: 'A1', label: 'Stage A1 — Foundations', subtitle: 'Units 1–13 · Wave 1' },
  { stage: 'A2', label: 'Stage A2 — Core Grammar', subtitle: 'Units 14–25 · Wave 2 Preview' },
  { stage: 'B1', label: 'Stage B1 — Intermediate Nuance', subtitle: 'Units 26–38 · Wave 3 Preview' },
  { stage: 'B2', label: 'Stage B2 — Mastery & Fluency', subtitle: 'Units 39–51 · Wave 4 Preview' },
];

export function PathView() {
  const { progress, updateSettings } = useApp();
  const [expandedStages, setExpandedStages] = useState<Record<CefrStage, boolean>>({
    A1: true,
    A2: false,
    B1: false,
    B2: false,
  });
  const [unitLexMap, setUnitLexMap] = useState<Record<string, string[]>>({});

  useEffect(() => {
    let cancelled = false;
    loadStageLexicon('A1')
      .then((entries) => {
        if (cancelled) return;
        const grouped: Record<string, string[]> = {};
        for (const entry of entries) {
          if (!grouped[entry.unitId]) {
            grouped[entry.unitId] = [];
          }
          grouped[entry.unitId].push(entry.id);
        }
        setUnitLexMap(grouped);
      })
      .catch(() => {
        // Ignore if lexicon fails to load for tier 3 check
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const nowMs = Date.now();

  const dueSrsCount = useMemo(
    () =>
      getDueSrsQueue(
        progress.srsCards,
        nowMs,
        progress.settings.srsNewCap,
        progress.settings.srsReviewCap
      ).length,
    [progress.srsCards, progress.settings.srsNewCap, progress.settings.srsReviewCap, nowMs]
  );

  const weakTags = useMemo(() => getWeakGrammarTags(progress), [progress]);

  const availableUnits = useMemo(
    () => CURRICULUM_MANIFEST.filter((u) => u.available),
    []
  );

  const continueUnit: UnitSummary = useMemo(() => {
    const nextIncomplete = availableUnits.find((u) => {
      const p = progress.unitProgress[u.id];
      return !p || p.practiceBestScore < 80;
    });
    return nextIncomplete ?? availableUnits[availableUnits.length - 1] ?? CURRICULUM_MANIFEST[0];
  }, [availableUnits, progress.unitProgress]);

  const isUnitUnlocked = (unit: UnitSummary): boolean => {
    if (!unit.available) return false;
    if (progress.settings.freeBrowse || unit.number === 1) return true;
    const prevId = `u${String(unit.number - 1).padStart(2, '0')}`;
    const prevProg = progress.unitProgress[prevId];
    return Boolean(prevProg && prevProg.practiceBestScore >= 80);
  };

  const toggleStage = (stage: CefrStage) => {
    setExpandedStages((prev) => ({ ...prev, [stage]: !prev[stage] }));
  };

  const tierBadge = (tier: 0 | 1 | 2 | 3) => {
    if (tier === 0) return null;
    if (tier === 1) {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-[var(--text-primary)]/10 px-2 py-0.5 text-micro font-bold text-[var(--text-primary)]">
          <Award className="h-3 w-3" aria-hidden="true" />
          Bronze
        </span>
      );
    }
    if (tier === 2) {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-[var(--brand)]/12 px-2 py-0.5 text-micro font-bold text-[var(--brand)]">
          <Award className="h-3 w-3" aria-hidden="true" />
          Silver
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-[var(--accent)]/18 px-2 py-0.5 text-micro font-bold text-[var(--accent-text)]">
        <Award className="h-3 w-3" aria-hidden="true" />
        Gold
      </span>
    );
  };

  return (
    <div className="min-h-dvh pb-24">
      <header className="pt-safe border-b border-[var(--border)] bg-[var(--bg-card)] px-4 py-3">
        <div className="mx-auto max-w-lg space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h1 className="text-xl font-extrabold tracking-tight text-[var(--brand)]">
                Svenska Vägen
              </h1>
              <p className="text-xs font-medium text-[var(--text-muted)]">
                Swedish A0 → B2 Skill Path
              </p>
            </div>

            <div className="flex items-center gap-1.5">
              <div
                className="inline-flex items-center gap-1 rounded-full border border-[var(--border)] bg-[var(--bg-surface)] px-2.5 py-1 text-xs font-bold text-[var(--text-primary)]"
                aria-label={`${progress.streak} day streak and ${progress.freezes} freeze shields`}
              >
                <Flame className="h-3.5 w-3.5 text-[var(--accent-text)]" aria-hidden="true" />
                <span>{progress.streak}d</span>
                <Shield className="ml-1 h-3.5 w-3.5 text-[var(--brand)]" aria-hidden="true" />
                <span>{progress.freezes}</span>
              </div>

              <div
                className="inline-flex items-center gap-1 rounded-full border border-[var(--border)] bg-[var(--bg-surface)] px-2.5 py-1 text-xs font-bold text-[var(--brand)]"
                aria-label={`${progress.xp} total XP`}
              >
                <Zap className="h-3.5 w-3.5" aria-hidden="true" />
                <span>{progress.xp} XP</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-medium text-[var(--text-muted)]">
              {progress.settings.freeBrowse
                ? 'Free-Browse: all A1 units open'
                : 'Guided: score 80%+ to unlock next'}
            </span>
            <button
              type="button"
              onClick={() =>
                updateSettings({ freeBrowse: !progress.settings.freeBrowse })
              }
              aria-pressed={progress.settings.freeBrowse}
              className={`min-h-[48px] rounded-xl border px-3 text-xs font-bold transition-colors select-none touch-manipulation ${
                progress.settings.freeBrowse
                  ? 'border-[var(--brand)] bg-[var(--brand)] text-[var(--on-brand)]'
                  : 'border-[var(--border)] bg-[var(--bg-surface)] text-[var(--text-primary)]'
              }`}
            >
              {progress.settings.freeBrowse ? 'Free-Browse: ON' : 'Guided Mode'}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-lg px-4 py-4 space-y-5">
        <IosInstallBanner />

        {/* Home Daily Hub (max 3 conditional rows) */}
        <section
          aria-label="Daily Hub"
          className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-4 shadow-sm space-y-2.5"
        >
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-[var(--text-muted)]">
            <Sparkles className="h-3.5 w-3.5 text-[var(--accent-text)]" aria-hidden="true" />
            <span>Today&apos;s Focus</span>
          </div>

          {/* Row 1: Continue Unit */}
          <div className="flex items-center justify-between gap-3 rounded-xl bg-[var(--bg-surface)] p-3">
            <div className="min-w-0">
              <p className="text-xs font-semibold text-[var(--text-muted)]">
                Continue · Unit {continueUnit.number}
              </p>
              <p className="truncate text-sm font-extrabold text-[var(--text-primary)]">
                {continueUnit.title}
              </p>
            </div>
            <Link
              to={`/unit/${continueUnit.id}`}
              className="inline-flex min-h-[48px] shrink-0 items-center gap-1 rounded-xl bg-[var(--brand)] px-3.5 text-xs font-bold text-[var(--on-brand)] hover:opacity-95"
            >
              <span>Practice</span>
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>

          {/* Row 2: Due SRS Reviews (hidden if 0) */}
          {dueSrsCount > 0 && (
            <div className="flex items-center justify-between gap-3 rounded-xl bg-[var(--bg-surface)] p-3">
              <div className="flex items-center gap-2 min-w-0">
                <BookOpen className="h-4 w-4 shrink-0 text-[var(--brand)]" aria-hidden="true" />
                <p className="truncate text-sm font-bold text-[var(--text-primary)]">
                  {dueSrsCount} SRS {dueSrsCount === 1 ? 'card' : 'cards'} due
                </p>
              </div>
              <Link
                to="/vocab"
                className="inline-flex min-h-[48px] shrink-0 items-center rounded-xl border border-[var(--brand)] bg-[var(--bg-card)] px-3.5 text-xs font-bold text-[var(--brand)]"
              >
                Review
              </Link>
            </div>
          )}

          {/* Row 3: Weak spots (hidden if none <75%) */}
          {weakTags.length > 0 && (
            <div className="flex items-center justify-between gap-3 rounded-xl bg-[var(--accent)]/10 p-3">
              <div className="flex items-center gap-2 min-w-0">
                <Target className="h-4 w-4 shrink-0 text-[var(--accent-text)]" aria-hidden="true" />
                <p className="truncate text-sm font-bold text-[var(--text-primary)]">
                  🎯 Fix weak spots: {weakTags[0].tag} (
                  {Math.round(weakTags[0].accuracy * 100)}%)
                </p>
              </div>
              <Link
                to="/drills?category=weak-spots"
                className="inline-flex min-h-[48px] shrink-0 items-center rounded-xl bg-[var(--accent)] px-3.5 text-xs font-bold text-[var(--on-accent)]"
              >
                Fix
              </Link>
            </div>
          )}
        </section>

        {/* 4 Collapsible CEFR Stages (All 51 Units) */}
        <div className="space-y-3">
          {STAGES.map(({ stage, label, subtitle }) => {
            const units = CURRICULUM_MANIFEST.filter((u) => u.stage === stage);
            const isExpanded = expandedStages[stage];

            return (
              <section
                key={stage}
                aria-label={label}
                className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] overflow-hidden shadow-sm"
              >
                <button
                  type="button"
                  onClick={() => toggleStage(stage)}
                  aria-expanded={isExpanded}
                  className="flex min-h-[56px] w-full items-center justify-between gap-3 px-4 py-3 text-left hover:bg-[var(--bg-surface)]/70 select-none touch-manipulation"
                >
                  <div>
                    <h2 className="text-base font-extrabold text-[var(--text-primary)]">
                      {label}
                    </h2>
                    <p className="text-xs font-medium text-[var(--text-muted)]">
                      {subtitle}
                    </p>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="h-5 w-5 shrink-0 text-[var(--text-muted)]" aria-hidden="true" />
                  ) : (
                    <ChevronDown className="h-5 w-5 shrink-0 text-[var(--text-muted)]" aria-hidden="true" />
                  )}
                </button>

                {isExpanded && (
                  <ul className="divide-y divide-[var(--border)] border-t border-[var(--border)]">
                    {units.map((unit) => {
                      const unlocked = isUnitUnlocked(unit);
                      const unitProg = progress.unitProgress[unit.id];
                      const lexIds = unitLexMap[unit.id] ?? [];
                      const mastery = computeUnitMastery(
                        unit.id,
                        lexIds,
                        progress,
                        nowMs
                      );

                      if (!unit.available) {
                        return (
                          <li key={unit.id}>
                            <Link
                              to={`/unit/${unit.id}`}
                              className="flex min-h-[56px] items-start justify-between gap-3 px-4 py-3.5 opacity-80 hover:bg-[var(--bg-surface)]/60"
                            >
                              <div className="min-w-0 space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-bold text-[var(--text-muted)]">
                                    Unit {unit.number}
                                  </span>
                                  <span className="rounded-full bg-[var(--bg-surface)] px-2 py-0.5 text-micro font-bold text-[var(--text-muted)]">
                                    Preview
                                  </span>
                                </div>
                                <p className="text-sm font-bold text-[var(--text-primary)]">
                                  {unit.title}
                                </p>
                                <p className="line-clamp-2 text-xs text-[var(--text-muted)]">
                                  {unit.grammarFocus}
                                </p>
                              </div>
                              <Lock
                                className="mt-1 h-4 w-4 shrink-0 text-[var(--text-muted)]"
                                aria-hidden="true"
                              />
                            </Link>
                          </li>
                        );
                      }

                      return (
                        <li key={unit.id}>
                          {unlocked ? (
                            <Link
                              to={`/unit/${unit.id}`}
                              className="flex min-h-[56px] items-center justify-between gap-3 px-4 py-3.5 hover:bg-[var(--bg-surface)]/70"
                            >
                              <div className="min-w-0 space-y-1">
                                <div className="flex flex-wrap items-center gap-1.5">
                                  <span className="text-xs font-bold text-[var(--brand)]">
                                    Unit {unit.number}
                                  </span>
                                  {tierBadge(mastery.tier)}
                                  {mastery.needsRefresh && (
                                    <span
                                      className="inline-flex items-center gap-1 rounded-full bg-[var(--accent)]/15 px-2 py-0.5 text-micro font-bold text-[var(--accent-text)]"
                                      title="Unreviewed for over 45 days"
                                    >
                                      <span
                                        className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]"
                                        aria-hidden="true"
                                      />
                                      Refresh
                                    </span>
                                  )}
                                </div>
                                <p className="text-sm font-extrabold text-[var(--text-primary)]">
                                  {unit.title}
                                </p>
                                <p className="line-clamp-2 text-xs text-[var(--text-muted)]">
                                  {unit.culturalTheme
                                    ? `Reader: ${unit.culturalTheme}`
                                    : unit.grammarFocus}
                                </p>
                                {unitProg && (
                                  <p className="text-micro font-semibold text-[var(--text-muted)]">
                                    Best practice: {unitProg.practiceBestScore}%
                                  </p>
                                )}
                              </div>
                              <ChevronRight
                                className="h-5 w-5 shrink-0 text-[var(--text-muted)]"
                                aria-hidden="true"
                              />
                            </Link>
                          ) : (
                            <div className="flex min-h-[56px] items-center justify-between gap-3 px-4 py-3.5 opacity-60">
                              <div className="min-w-0 space-y-0.5">
                                <span className="text-xs font-bold text-[var(--text-muted)]">
                                  Unit {unit.number} · Locked
                                </span>
                                <p className="text-sm font-bold text-[var(--text-primary)]">
                                  {unit.title}
                                </p>
                                <p className="text-xs text-[var(--text-muted)]">
                                  Score 80%+ on Unit {unit.number - 1} or enable Free-Browse
                                </p>
                              </div>
                              <Lock
                                className="h-4 w-4 shrink-0 text-[var(--text-muted)]"
                                aria-hidden="true"
                              />
                            </div>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </section>
            );
          })}
        </div>
      </main>
    </div>
  );
}
