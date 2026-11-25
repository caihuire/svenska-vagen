import type { ClassifierExercise as ClassifierExerciseType } from '../../types/index';
import { AudioButton } from '../../components/AudioButton';

export interface ExerciseGradeResult {
  correct: boolean;
  expected: string;
  status: 'correct' | 'incorrect' | 'diacritic-retry';
}

interface Props {
  exercise: ClassifierExerciseType;
  muted: boolean;
  locked: boolean;
  selectedOption: string | null;
  onSelect: (option: string, result: ExerciseGradeResult) => void;
}

export function ClassifierExercise({
  exercise,
  muted,
  locked,
  selectedOption,
  onSelect,
}: Props) {
  const handlePick = (option: string) => {
    if (locked) return;
    const correct = option === exercise.correctOption;
    onSelect(option, {
      correct,
      expected: exercise.correctOption,
      status: correct ? 'correct' : 'incorrect',
    });
  };

  return (
    <div className="space-y-5">
      <p className="text-sm font-semibold text-[var(--text-muted)]">
        {exercise.prompt}
      </p>

      <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-5 text-center shadow-sm space-y-2">
        <p className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">
          {exercise.target}
        </p>
        {exercise.en && (
          <p className="text-sm text-[var(--text-muted)]">{exercise.en}</p>
        )}
        {exercise.ipa && (
          <p className="text-xs font-mono text-[var(--text-muted)]">
            {exercise.ipa}
          </p>
        )}
        {exercise.ttsText && (
          <div className="pt-2 flex justify-center">
            <AudioButton
              text={exercise.ttsText}
              muted={muted}
              label="Hear word"
              showSlowToggle={false}
            />
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        {exercise.options.map((option) => {
          const isChosen = selectedOption === option;
          const isCorrectChoice = option === exercise.correctOption;

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
              onClick={() => handlePick(option)}
              className={`min-h-[52px] w-full rounded-xl border-2 px-4 py-3 text-base font-bold transition-colors select-none touch-manipulation active:scale-[0.99] ${btnStyle}`}
            >
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
}
