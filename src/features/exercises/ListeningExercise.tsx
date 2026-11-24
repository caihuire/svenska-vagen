import { useEffect, useState } from 'react';
import { AudioButton } from '../../components/AudioButton';
import { ttsService } from '../../services/tts/speech';
import type { ListeningExercise as ListeningExerciseType } from '../../types/index';
import type { ExerciseGradeResult } from './ClassifierExercise';

interface Props {
  exercise: ListeningExerciseType;
  muted: boolean;
  locked: boolean;
  selectedOption: string | null;
  onSelect: (option: string, result: ExerciseGradeResult) => void;
}

export function ListeningExercise({
  exercise,
  muted,
  locked,
  selectedOption,
  onSelect,
}: Props) {
  const [revealText, setRevealText] = useState(false);
  const supported = ttsService.isSupported();
  const showFallback = muted || !supported || revealText;

  useEffect(() => {
    setRevealText(false);
  }, [exercise.id]);

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
    <div className="space-y-4">
      <p className="text-sm font-semibold text-[var(--text-muted)]">
        {exercise.prompt}
      </p>

      <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-5 shadow-sm space-y-3 text-center">
        <div className="flex justify-center">
          <AudioButton
            text={exercise.audioText}
            muted={muted}
            label="Play Swedish"
          />
        </div>

        {showFallback ? (
          <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] p-3 space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
              {muted ? 'Silent mode transcript' : 'Transcript'}
            </p>
            <p className="text-lg font-bold text-[var(--text-primary)]">
              {exercise.fallbackText}
            </p>
            {exercise.ipa && (
              <p className="text-xs font-mono text-[var(--text-muted)]">
                {exercise.ipa}
              </p>
            )}
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setRevealText(true)}
            className="min-h-[48px] rounded-xl px-3 text-xs font-semibold text-[var(--text-muted)] underline decoration-dotted hover:text-[var(--text-primary)] select-none touch-manipulation"
          >
            Show transcript / IPA
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-2.5">
        {exercise.options.map((option) => {
          const isChosen = selectedOption === option;
          const isCorrectChoice = option === exercise.correctOption;

          let btnStyle =
            'border-[var(--border)] bg-[var(--bg-card)] text-[var(--text-primary)] hover:border-[var(--brand)]';
          if (locked) {
            if (isCorrectChoice) {
              btnStyle =
                'border-[var(--success)] bg-[#ECFDF5] text-[var(--success)] dark:bg-[#0D2E22]';
            } else if (isChosen) {
              btnStyle =
                'border-[var(--error)] bg-[#FEF2F2] text-[var(--error)] dark:bg-[#331414]';
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
              className={`min-h-[48px] w-full rounded-xl border-2 px-4 py-2.5 text-left text-base font-bold transition-colors select-none touch-manipulation active:scale-[0.99] ${btnStyle}`}
            >
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
}
