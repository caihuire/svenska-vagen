import { useState } from 'react';
import { X } from 'lucide-react';
import type { ErrorSpottingExercise as ErrorSpottingExerciseType } from '../../types/index';
import type { ExerciseGradeResult } from './ClassifierExercise';

interface Props {
  exercise: ErrorSpottingExerciseType;
  locked: boolean;
  onSubmitResult: (result: ExerciseGradeResult) => void;
}

export function ErrorSpottingExercise({
  exercise,
  locked,
  onSubmitResult,
}: Props) {
  const [selectedTokenIndex, setSelectedTokenIndex] = useState<number | null>(
    null
  );
  const [chosenCorrection, setChosenCorrection] = useState<string | null>(null);

  const handlePickToken = (index: number) => {
    if (locked) return;
    setSelectedTokenIndex(index);
  };

  const handlePickCorrection = (option: string) => {
    if (locked || selectedTokenIndex === null) return;
    setChosenCorrection(option);
    const correct =
      selectedTokenIndex === exercise.errorIndex &&
      option === exercise.correctCorrection;
    onSubmitResult({
      correct,
      expected: `"${exercise.tokens[exercise.errorIndex]}" → "${exercise.correctCorrection}"`,
      status: correct ? 'correct' : 'incorrect',
    });
  };

  return (
    <div className="space-y-4">
      <p className="text-sm font-semibold text-[var(--text-muted)]">
        {exercise.prompt}
      </p>

      <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-4 shadow-sm">
        <div className="flex flex-wrap gap-2">
          {exercise.tokens.map((token, idx) => {
            const isSelected = selectedTokenIndex === idx;
            const isActualError = idx === exercise.errorIndex;

            let tokenStyle =
              'border-[var(--border)] bg-[var(--bg-surface)] text-[var(--text-primary)] hover:border-[var(--brand)]';

            if (locked) {
              if (isActualError) {
                tokenStyle =
                  'border-[var(--success)] bg-[#ECFDF5] text-[var(--success)] dark:bg-[#0D2E22]';
              } else if (isSelected) {
                tokenStyle =
                  'border-[var(--error)] bg-[#FEF2F2] text-[var(--error)] dark:bg-[#331414]';
              }
            } else if (isSelected) {
              tokenStyle =
                'border-[var(--brand)] bg-[var(--brand)]/15 text-[var(--brand)]';
            }

            return (
              <button
                key={`${idx}-${token}`}
                type="button"
                disabled={locked}
                onClick={() => handlePickToken(idx)}
                className={`min-h-[48px] rounded-xl border-2 px-3 py-2 text-base font-semibold transition-colors select-none touch-manipulation ${tokenStyle}`}
              >
                {token}
              </button>
            );
          })}
        </div>
      </div>

      {!locked && selectedTokenIndex === null && (
        <p className="text-center text-xs font-medium text-[var(--text-muted)]">
          Tap the word or phrase that looks wrong in the sentence above.
        </p>
      )}

      {!locked && selectedTokenIndex !== null && (
        <div
          role="dialog"
          aria-label="Choose correction"
          className="rounded-2xl border-2 border-[var(--brand)]/30 bg-[var(--bg-card)] p-4 shadow-md space-y-3"
        >
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-bold text-[var(--text-primary)]">
              Replace{' '}
              <span className="text-[var(--brand)]">
                &ldquo;{exercise.tokens[selectedTokenIndex]}&rdquo;
              </span>{' '}
              with:
            </p>
            <button
              type="button"
              onClick={() => setSelectedTokenIndex(null)}
              aria-label="Pick a different word"
              className="flex min-h-[48px] min-w-[48px] items-center justify-center rounded-xl text-[var(--text-muted)] hover:bg-[var(--bg-surface)]"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-2">
            {exercise.options.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => handlePickCorrection(option)}
                className={`min-h-[48px] w-full rounded-xl border-2 px-4 py-2.5 text-left text-sm font-bold transition-colors select-none touch-manipulation ${
                  chosenCorrection === option
                    ? 'border-[var(--brand)] bg-[var(--brand)]/10 text-[var(--brand)]'
                    : 'border-[var(--border)] bg-[var(--bg-surface)] text-[var(--text-primary)] hover:border-[var(--brand)]'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
