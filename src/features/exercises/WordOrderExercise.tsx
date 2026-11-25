import { RotateCcw } from 'lucide-react';
import type { WordOrderExercise as WordOrderExerciseType } from '../../types/index';
import type { ExerciseGradeResult } from './ClassifierExercise';

interface Props {
  exercise: WordOrderExerciseType;
  locked: boolean;
  selectedIndices: number[];
  onChangeSelected: (next: number[]) => void;
  onSubmitResult: (result: ExerciseGradeResult) => void;
}

function arraysEqual(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

export function WordOrderExercise({
  exercise,
  locked,
  selectedIndices,
  onChangeSelected,
  onSubmitResult,
}: Props) {
  const placedSet = new Set(selectedIndices);
  const allPlaced = selectedIndices.length === exercise.chunks.length;

  const handleAddTile = (chunkIndex: number) => {
    if (locked || placedSet.has(chunkIndex)) return;
    onChangeSelected([...selectedIndices, chunkIndex]);
  };

  const handleRemovePosition = (posIndex: number) => {
    if (locked) return;
    onChangeSelected(selectedIndices.filter((_, idx) => idx !== posIndex));
  };

  const handleCheck = () => {
    if (locked || !allPlaced) return;
    const built = selectedIndices.map((idx) => exercise.chunks[idx]);
    const validOrders = [
      exercise.correctOrder,
      ...(exercise.acceptedOrders ?? []),
    ];
    const correct = validOrders.some((order) => arraysEqual(built, order));
    onSubmitResult({
      correct,
      expected: exercise.correctOrder.join(' '),
      status: correct ? 'correct' : 'incorrect',
    });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <p className="text-sm font-semibold text-[var(--text-muted)]">
          {exercise.prompt}
        </p>
        {exercise.triggerCue && (
          <div className="inline-block rounded-xl border border-[var(--accent)]/40 bg-[var(--accent)]/12 px-3 py-1.5 text-xs font-bold text-[#8A4F04] dark:text-[var(--accent)]">
            {exercise.triggerCue}
          </div>
        )}
      </div>

      {exercise.slotHints && exercise.slotHints.length > 0 && (
        <div className="flex flex-wrap gap-1.5" aria-label="Syntactic slot hints">
          {exercise.slotHints.map((slot, idx) => (
            <span
              key={`${slot}-${idx}`}
              className={`rounded-lg border px-2 py-0.5 text-[11px] font-semibold ${
                idx < selectedIndices.length
                  ? 'border-[var(--brand)]/40 bg-[var(--brand)]/10 text-[var(--brand)]'
                  : 'border-[var(--border)] bg-[var(--bg-card)] text-[var(--text-muted)]'
              }`}
            >
              {idx + 1}. {slot}
            </span>
          ))}
        </div>
      )}

      {/* Answer tray */}
      <div className="min-h-[104px] rounded-2xl border-2 border-dashed border-[var(--border)] bg-[var(--bg-card)] p-3">
        {selectedIndices.length === 0 ? (
          <div className="flex min-h-[76px] items-center justify-center text-sm text-[var(--text-muted)]">
            Tap phrase tiles below in Swedish word order
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {selectedIndices.map((chunkIdx, posIdx) => (
              <button
                key={`placed-${chunkIdx}-${posIdx}`}
                type="button"
                disabled={locked}
                onClick={() => handleRemovePosition(posIdx)}
                className="inline-flex min-h-[48px] min-w-[48px] items-center justify-center rounded-xl border-2 border-[var(--brand)] bg-[var(--brand)]/10 px-3.5 py-2 text-sm font-bold text-[var(--brand)] transition-transform active:scale-[0.97] select-none touch-manipulation disabled:opacity-90"
              >
                {exercise.chunks[chunkIdx]}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Tile bank */}
      <div className="flex flex-wrap gap-2">
        {exercise.chunks.map((chunk, idx) => {
          const used = placedSet.has(idx);
          return (
            <button
              key={`bank-${idx}-${chunk}`}
              type="button"
              disabled={locked || used}
              onClick={() => handleAddTile(idx)}
              className={`inline-flex min-h-[48px] min-w-[48px] items-center justify-center rounded-xl border-2 px-3.5 py-2 text-sm font-bold transition-all select-none touch-manipulation ${
                used
                  ? 'border-dashed border-[var(--border)] bg-transparent text-transparent select-none'
                  : 'border-[var(--border)] bg-[var(--bg-card)] text-[var(--text-primary)] shadow-sm hover:border-[var(--brand)] active:scale-[0.97]'
              }`}
            >
              {chunk}
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-2 pt-1">
        {selectedIndices.length > 0 && !locked && (
          <button
            type="button"
            onClick={() => onChangeSelected([])}
            aria-label="Clear placed tiles"
            className="inline-flex min-h-[48px] min-w-[48px] items-center justify-center gap-1.5 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] px-3 text-sm font-semibold text-[var(--text-muted)] hover:border-[var(--brand)] select-none touch-manipulation"
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            <span>Reset</span>
          </button>
        )}
        <button
          type="button"
          disabled={locked || !allPlaced}
          onClick={handleCheck}
          className="min-h-[48px] flex-1 rounded-xl bg-[var(--brand)] px-4 text-base font-bold text-white transition-opacity hover:opacity-95 disabled:opacity-45 select-none touch-manipulation"
        >
          Check Order
        </button>
      </div>
    </div>
  );
}
