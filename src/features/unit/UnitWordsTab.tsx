import { useMemo } from 'react';
import { Check, Plus } from 'lucide-react';
import { AudioButton } from '../../components/AudioButton';
import { GenderBadge } from '../../components/GenderBadge';
import { useApp } from '../../store/AppContext';
import type { LexiconEntry, UnitContent } from '../../types/index';

interface UnitWordsTabProps {
  unit: UnitContent;
  lexMap: Map<string, LexiconEntry>;
}

export function UnitWordsTab({ unit, lexMap }: UnitWordsTabProps) {
  const { progress, enrollWords } = useApp();

  const entries = useMemo(() => {
    return unit.lexiconIds
      .map((id) => lexMap.get(id))
      .filter((e): e is LexiconEntry => Boolean(e));
  }, [unit.lexiconIds, lexMap]);

  const unenrolledIds = useMemo(
    () =>
      entries
        .filter((e) => !progress.srsCards[e.id])
        .map((e) => e.id),
    [entries, progress.srsCards]
  );

  const enrolledCount = entries.length - unenrolledIds.length;

  return (
    <div className="space-y-4 pb-8">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-4 shadow-sm">
        <div>
          <p className="text-sm font-extrabold text-[var(--text-primary)]">
            Unit Vocabulary ({entries.length} words)
          </p>
          <p className="text-xs text-[var(--text-muted)]">
            {enrolledCount} of {entries.length} queued in SRS
          </p>
        </div>

        <button
          type="button"
          disabled={unenrolledIds.length === 0}
          onClick={() => enrollWords(unenrolledIds)}
          className={`inline-flex min-h-[48px] items-center gap-1.5 rounded-xl px-4 text-sm font-bold select-none touch-manipulation ${
            unenrolledIds.length === 0
              ? 'border border-[var(--success)]/40 bg-[var(--success-bg)] text-[var(--success)]'
              : 'bg-[var(--brand)] text-[var(--on-brand)] hover:opacity-95'
          }`}
        >
          {unenrolledIds.length === 0 ? (
            <>
              <Check className="h-4 w-4" aria-hidden="true" />
              <span>All Queued</span>
            </>
          ) : (
            <>
              <Plus className="h-4 w-4" aria-hidden="true" />
              <span>Queue All for SRS ({unenrolledIds.length})</span>
            </>
          )}
        </button>
      </div>

      <ul className="space-y-2.5">
        {entries.map((entry) => {
          const enrolled = Boolean(progress.srsCards[entry.id]);

          return (
            <li
              key={entry.id}
              className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-3.5 shadow-sm space-y-2"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-base font-extrabold text-[var(--text-primary)]">
                      {entry.lemma}
                    </span>
                    {entry.morph?.pos === 'noun' && (
                      <GenderBadge gender={entry.morph.gender} />
                    )}
                    <span className="rounded-md bg-[var(--bg-surface)] px-2 py-0.5 text-micro font-semibold text-[var(--text-muted)]">
                      {entry.pos}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-[var(--text-muted)]">
                    {entry.en}
                  </p>
                  {entry.ipa && (
                    <p className="text-xs font-mono text-[var(--text-muted)]">
                      {entry.ipa}
                    </p>
                  )}
                </div>

                <div className="flex shrink-0 items-center gap-1.5">
                  <AudioButton
                    text={entry.lemma}
                    compact
                    showSlowToggle={false}
                    label={`Pronounce ${entry.lemma}`}
                  />
                  <button
                    type="button"
                    disabled={enrolled}
                    onClick={() => enrollWords([entry.id])}
                    aria-label={enrolled ? `${entry.lemma} is in SRS` : `Add ${entry.lemma} to SRS`}
                    className={`inline-flex min-h-[48px] min-w-[48px] items-center justify-center gap-1 rounded-xl border px-3 text-xs font-bold select-none touch-manipulation ${
                      enrolled
                        ? 'border-[var(--success)]/40 bg-[var(--success-bg)] text-[var(--success)]'
                        : 'border-[var(--brand)]/40 bg-[var(--brand)]/10 text-[var(--brand)] hover:bg-[var(--brand)] hover:text-[var(--on-brand)]'
                    }`}
                  >
                    {enrolled ? (
                      <>
                        <Check className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>SRS</span>
                      </>
                    ) : (
                      <>
                        <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>SRS</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {entry.example && (
                <div className="rounded-xl bg-[var(--bg-surface)] px-3 py-2 text-xs space-y-0.5">
                  <p className="font-semibold text-[var(--text-primary)]">
                    {entry.example.sv}
                  </p>
                  <p className="text-[var(--text-muted)]">{entry.example.en}</p>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
