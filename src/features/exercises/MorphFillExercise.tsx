import { useState } from 'react';
import { HelpCircle } from 'lucide-react';
import { evaluateTypedAnswer } from '../../engine/morphology/normalizer';
import { SwedishInput } from '../../components/SwedishInput';
import type { MorphFillExercise as MorphFillExerciseType } from '../../types/index';
import type { ExerciseGradeResult } from './ClassifierExercise';

interface Props {
  exercise: MorphFillExerciseType;
  locked: boolean;
  value: string;
  onChange: (next: string) => void;
  onSubmitResult: (result: ExerciseGradeResult) => void;
}

export function MorphFillExercise({
  exercise,
  locked,
  value,
  onChange,
  onSubmitResult,
}: Props) {
  const [showHint, setShowHint] = useState(false);

  const handleSubmit = () => {
    if (locked || !value.trim()) return;
    const evalResult = evaluateTypedAnswer(value, exercise.accepted);
    if (evalResult.status === 'exact') {
      onSubmitResult({
        correct: true,
        expected: evalResult.matched ?? exercise.accepted[0],
        status: 'correct',
      });
    } else if (evalResult.status === 'diacritic-retry') {
      onSubmitResult({
        correct: false,
        expected: evalResult.matched ?? exercise.accepted[0],
        status: 'diacritic-retry',
      });
    } else {
      onSubmitResult({
        correct: false,
        expected: exercise.accepted[0],
        status: 'incorrect',
      });
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-sm font-semibold text-[var(--text-muted)]">
        {exercise.prompt}
      </p>

      <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-4 shadow-sm space-y-2">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <span className="inline-flex items-center rounded-lg bg-[var(--brand)]/10 px-2.5 py-1 text-sm font-bold text-[var(--brand)]">
            {exercise.baseForm}
          </span>
          {exercise.hint && (
            <button
              type="button"
              onClick={() => setShowHint((prev) => !prev)}
              aria-expanded={showHint}
              className="inline-flex min-h-[48px] items-center gap-1.5 rounded-xl px-2.5 text-xs font-semibold text-[var(--text-muted)] hover:bg-[var(--bg-surface)] select-none touch-manipulation"
            >
              <HelpCircle className="h-4 w-4" aria-hidden="true" />
              <span>{showHint ? 'Hide hint' : 'Hint'}</span>
            </button>
          )}
        </div>

        {exercise.sentence && (
          <p className="text-lg font-semibold leading-relaxed text-[var(--text-primary)]">
            {exercise.sentence}
          </p>
        )}

        {exercise.en && (
          <p className="text-sm text-[var(--text-muted)]">{exercise.en}</p>
        )}

        {showHint && exercise.hint && (
          <p className="rounded-xl bg-[var(--bg-surface)] px-3 py-2 text-xs font-medium text-[var(--text-muted)]">
            Hint: {exercise.hint}
          </p>
        )}
      </div>

      <SwedishInput
        value={value}
        onChange={onChange}
        onSubmit={handleSubmit}
        disabled={locked}
        placeholder="Type the Swedish form..."
        autoFocus
      />
    </div>
  );
}
