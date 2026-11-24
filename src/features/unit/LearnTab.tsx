import { useState, type TouchEvent } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { AudioButton } from '../../components/AudioButton';
import type { GrammarCard } from '../../types/index';

interface LearnTabProps {
  cards: GrammarCard[];
  onStartPractice: () => void;
}

const KIND_LABELS: Record<GrammarCard['kind'], { label: string; style: string }> = {
  rule: {
    label: 'Grammar Rule',
    style: 'bg-[var(--brand)]/12 text-[var(--brand)]',
  },
  table: {
    label: 'Pattern Table',
    style: 'bg-[var(--brand)]/12 text-[var(--brand)]',
  },
  examples: {
    label: 'Examples',
    style: 'bg-[var(--success)]/12 text-[var(--success)]',
  },
  trap: {
    label: 'English Trap',
    style: 'bg-[var(--accent)]/15 text-[#8A4F04] dark:text-[var(--accent)]',
  },
};

export function LearnTab({ cards, onStartPractice }: LearnTabProps) {
  const [index, setIndex] = useState(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  if (cards.length === 0) {
    return (
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-6 text-center text-sm text-[var(--text-muted)]">
        No grammar cards in this unit.
      </div>
    );
  }

  const safeIndex = Math.min(index, cards.length - 1);
  const card = cards[safeIndex];
  const badge = KIND_LABELS[card.kind];
  const isFirst = safeIndex === 0;
  const isLast = safeIndex === cards.length - 1;

  const handleTouchStart = (e: TouchEvent<HTMLDivElement>) => {
    setTouchStartX(e.touches[0]?.clientX ?? null);
  };

  const handleTouchEnd = (e: TouchEvent<HTMLDivElement>) => {
    if (touchStartX === null) return;
    const endX = e.changedTouches[0]?.clientX ?? touchStartX;
    const delta = endX - touchStartX;
    setTouchStartX(null);
    if (Math.abs(delta) < 48) return;
    if (delta < 0 && !isLast) {
      setIndex((prev) => Math.min(cards.length - 1, prev + 1));
    } else if (delta > 0 && !isFirst) {
      setIndex((prev) => Math.max(0, prev - 1));
    }
  };

  return (
    <div className="space-y-4">
      {/* Card progress dots */}
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-semibold text-[var(--text-muted)]">
          Card {safeIndex + 1} of {cards.length}
        </span>
        <div className="flex items-center gap-0.5" role="tablist" aria-label="Grammar cards">
          {cards.map((c, idx) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setIndex(idx)}
              aria-label={`Go to card ${idx + 1}: ${c.title}`}
              aria-selected={idx === safeIndex}
              role="tab"
              className="flex min-h-[48px] min-w-[48px] items-center justify-center px-1"
            >
              <span
                className={`block h-2.5 rounded-full transition-all ${
                  idx === safeIndex
                    ? 'w-6 bg-[var(--brand)]'
                    : 'w-2.5 bg-[var(--border)]'
                }`}
              />
            </button>
          ))}
        </div>
      </div>

      {/* Micro-card */}
      <article
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className={`rounded-2xl border bg-[var(--bg-card)] p-4 shadow-sm space-y-3 ${
          card.kind === 'trap'
            ? 'border-[var(--accent)]/40'
            : 'border-[var(--border)]'
        }`}
      >
        <div className="space-y-1.5">
          <span
            className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-bold ${badge.style}`}
          >
            {badge.label}
          </span>
          <h2 className="text-lg font-extrabold leading-snug text-[var(--text-primary)]">
            {card.title}
          </h2>
        </div>

        <p className="text-sm leading-relaxed text-[var(--text-primary)]">
          {card.body}
        </p>

        {card.highlight && (
          <div className="rounded-xl border border-[var(--brand)]/25 bg-[var(--bg-surface)] px-3.5 py-2.5 text-sm font-bold text-[var(--brand)]">
            {card.highlight}
          </div>
        )}

        {card.table && (
          <div className="overflow-x-auto rounded-xl border border-[var(--border)]">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-[var(--border)] bg-[var(--bg-surface)]">
                  {card.table.headers.map((h) => (
                    <th
                      key={h}
                      className="px-2.5 py-2 font-bold text-[var(--text-muted)]"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {card.table.rows.map((row, rIdx) => (
                  <tr
                    key={rIdx}
                    className="border-b border-[var(--border)] last:border-b-0"
                  >
                    {row.map((cell, cIdx) => (
                      <td
                        key={cIdx}
                        className={`px-2.5 py-2 ${
                          cIdx === 0
                            ? 'font-semibold text-[var(--text-primary)]'
                            : 'text-[var(--text-primary)]'
                        }`}
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {card.examples && card.examples.length > 0 && (
          <div className="space-y-2.5">
            {card.examples.map((ex, idx) => (
              <div
                key={idx}
                className="flex items-start justify-between gap-2 rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] p-3"
              >
                <div className="min-w-0 space-y-0.5">
                  <p className="text-sm font-bold text-[var(--text-primary)]">
                    {ex.sv}
                  </p>
                  <p className="text-xs text-[var(--text-muted)]">{ex.en}</p>
                  {ex.note && (
                    <p className="text-[11px] font-medium text-[var(--brand)]">
                      {ex.note}
                    </p>
                  )}
                </div>
                <AudioButton
                  text={ex.sv}
                  compact
                  showSlowToggle={false}
                  label={`Play example: ${ex.sv}`}
                />
              </div>
            ))}
          </div>
        )}
      </article>

      {/* Prev / Next Navigation */}
      <div className="flex items-center gap-2.5">
        <button
          type="button"
          disabled={isFirst}
          onClick={() => setIndex((prev) => Math.max(0, prev - 1))}
          className="inline-flex min-h-[48px] flex-1 items-center justify-center gap-1.5 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] px-4 text-sm font-bold text-[var(--text-primary)] disabled:opacity-40 select-none touch-manipulation"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          <span>Previous</span>
        </button>

        {isLast ? (
          <button
            type="button"
            onClick={onStartPractice}
            className="inline-flex min-h-[48px] flex-[1.4] items-center justify-center gap-1.5 rounded-xl bg-[var(--brand)] px-4 text-sm font-bold text-white hover:opacity-95 select-none touch-manipulation"
          >
            <span>Start Practice</span>
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setIndex((prev) => Math.min(cards.length - 1, prev + 1))}
            className="inline-flex min-h-[48px] flex-1 items-center justify-center gap-1.5 rounded-xl bg-[var(--brand)] px-4 text-sm font-bold text-white hover:opacity-95 select-none touch-manipulation"
          >
            <span>Next</span>
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
      </div>
    </div>
  );
}
