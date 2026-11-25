import { useState } from 'react';
import { HelpCircle } from 'lucide-react';
import { evaluateTypedAnswer } from '../../engine/morphology/normalizer';
import { SwedishInput } from '../../components/SwedishInput';
import type { ClozeExercise as ClozeExerciseType } from '../../types/index';
import type { ExerciseGradeResult } from './ClassifierExercise';

interface Props {
  exercise: ClozeExerciseType;
  locked: boolean;
  value: string;
  onChange: (next: string) => void;
  onSubmitResult: (result: ExerciseGradeResult) => void;
}

export function ClozeExercise({
  exercise,
  locked,
  value,
  onChange,
  onSubmitResult,
}: Props) {
  const [showHint, setShowHint] = useState(false);

  const parts = exercise.sentence.split('___');

  const handleChoice = (option: string) => {
    if (locked) return;
    onChange(option);
    const evalResult = evaluateTypedAnswer(option, exercise.accepted);
    const correct = evalResult.status === 'exact';
    onSubmitResult({
      correct,
      expected: exercise.accepted[0],
      status: correct ? 'correct' : 'incorrect',
    });
  };

  const handleTypedSubmit = () => {
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
        <p className="text-lg font-semibold leading-relaxed text-[var(--text-primary)]">
          {parts[0]}
          <span className="mx-1 inline-block min-w-[64px] rounded-lg border-b-2 border-[var(--brand)] bg-[var(--brand)]/10 px-2.5 py-0.5 text-center font-bold text-[var(--brand)]">
            {value.trim() ? value : '___'}
          </span>
          {parts.slice(1).join('___')}
        </p>

        {exercise.hint && (
          <div className="pt-1">
            <button
              type="button"
              onClick={() => setShowHint((prev) => !prev)}
              aria-expanded={showHint}
              className="inline-flex min-h-[48px] items-center gap-1.5 rounded-xl px-2 text-xs font-semibold text-[var(--text-muted)] hover:bg-[var(--bg-surface)] select-none touch-manipulation"
            >
              <HelpCircle className="h-4 w-4" aria-hidden="true" />
              <span>{showHint ? 'Hide hint' : 'Hint'}</span>
            </button>
            {showHint && (
              <p className="mt-1 rounded-xl bg-[var(--bg-surface)] px-3 py-2 text-xs font-medium text-[var(--text-muted)]">
                Hint: {exercise.hint}
              </p>
            )}
          </div>
        )}
      </div>

      {exercise.mode === 'choice' ? (
        <div className="grid grid-cols-1 gap-2.5">
          {(exercise.options ?? []).map((option) => {
            const isChosen = value === option;
            const isCorrectChoice =
              evaluateTypedAnswer(option, exercise.accepted).status === 'exact';

            let btnStyle =
              'border-[var(--border)] bg-[var(--bg-card)] text-[var(--text-primary)] hover:border-[var(--brand)]';
            if (locked) {
              if (isCorrectChoice) {
                btnStyle =
                  'border-[var(--success)] bg-[var(--success-bg)] text-[var(--success)]';
              } else if (isChosen) {
                btnStyle =
                  'border-[var(--error)] bg-[var(--error-bg)] text-[var(--error)] ';
              } else {
                btnStyle =
                  'border-[var(--border)] bg-[var(--bg-card)] text-[var(--text-muted)] opacity-60';
              }
            }

            return (
              <button
                key={option}
                type="button"
                disabled={locked}
                onClick={() => handleChoice(option)}
                className={`min-h-[48px] w-full rounded-xl border-2 px-4 py-2.5 text-base font-bold transition-colors select-none touch-manipulation active:scale-[0.99] ${btnStyle}`}
              >
                {option}
              </button>
            );
          })}
        </div>
      ) : (
        <SwedishInput
          value={value}
          onChange={onChange}
          onSubmit={handleTypedSubmit}
          disabled={locked}
          placeholder="Fill in the blank..."
          autoFocus
        />
      )}
    </div>
  );
}
