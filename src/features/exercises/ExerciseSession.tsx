import { useCallback, useEffect, useRef, useState } from 'react';
import { Award, Volume2, VolumeX, X } from 'lucide-react';
import { FeedbackBanner, type FeedbackStatus } from '../../components/FeedbackBanner';
import { ttsService } from '../../services/tts/speech';
import { useApp } from '../../store/AppContext';
import type { Exercise } from '../../types/index';
import { ClassifierExercise, type ExerciseGradeResult } from './ClassifierExercise';
import { ClozeExercise } from './ClozeExercise';
import { ErrorSpottingExercise } from './ErrorSpottingExercise';
import { ListeningExercise } from './ListeningExercise';
import { MorphFillExercise } from './MorphFillExercise';
import { WordOrderExercise } from './WordOrderExercise';

export interface ExerciseSessionResult {
  correctCount: number;
  totalCount: number;
  scorePercent: number;
  xpEarned: number;
}

interface ExerciseSessionProps {
  title: string;
  subtitle?: string;
  exercises: Exercise[];
  xpPerCorrect?: number;
  passBonusXp?: number;
  awardXpOnAttempt?: boolean;
  onComplete: (result: ExerciseSessionResult) => void;
  onExit: () => void;
}

interface FeedbackState {
  status: FeedbackStatus;
  expected: string;
  explanation: string;
  ttsText?: string;
}

export function ExerciseSession({
  title,
  subtitle,
  exercises,
  xpPerCorrect = 5,
  passBonusXp = 10,
  awardXpOnAttempt = false,
  onComplete,
  onExit,
}: ExerciseSessionProps) {
  const { progress, recordAttempt } = useApp();
  const [index, setIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [muted, setMuted] = useState(false);
  const [confirmExit, setConfirmExit] = useState(false);
  const [finished, setFinished] = useState(false);

  // Per-question input state
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [typedValue, setTypedValue] = useState('');
  const [wordOrderIndices, setWordOrderIndices] = useState<number[]>([]);
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);

  const completedRef = useRef(false);
  const autoAdvanceTimerRef = useRef<number | null>(null);

  const currentExercise = exercises[index] as Exercise | undefined;
  const isLocked = feedback !== null && feedback.status !== 'diacritic-retry';

  useEffect(() => {
    return () => {
      ttsService.stop();
      if (autoAdvanceTimerRef.current !== null) {
        window.clearTimeout(autoAdvanceTimerRef.current);
      }
    };
  }, []);

  const resetQuestionState = () => {
    setSelectedOption(null);
    setTypedValue('');
    setWordOrderIndices([]);
    setFeedback(null);
  };

  const advance = useCallback(() => {
    ttsService.stop();
    if (autoAdvanceTimerRef.current !== null) {
      window.clearTimeout(autoAdvanceTimerRef.current);
      autoAdvanceTimerRef.current = null;
    }

    if (index + 1 >= exercises.length) {
      setFinished(true);
      return;
    }
    setIndex((prev) => prev + 1);
    resetQuestionState();
  }, [index, exercises.length]);

  useEffect(() => {
    if (!finished || completedRef.current || exercises.length === 0) return;
    completedRef.current = true;
    const scorePercent = Math.round((correctCount / exercises.length) * 100);
    const xpEarned =
      correctCount * xpPerCorrect + (scorePercent >= 80 ? passBonusXp : 0);
    onComplete({
      correctCount,
      totalCount: exercises.length,
      scorePercent,
      xpEarned,
    });
  }, [
    finished,
    correctCount,
    exercises.length,
    xpPerCorrect,
    passBonusXp,
    onComplete,
  ]);

  const handleToggleMute = () => {
    setMuted((prev) => {
      const next = !prev;
      if (next) {
        ttsService.stop();
      }
      return next;
    });
  };

  const handleGrade = (result: ExerciseGradeResult) => {
    if (!currentExercise) return;

    if (result.status === 'diacritic-retry') {
      setFeedback({
        status: 'diacritic-retry',
        expected: result.expected,
        explanation: currentExercise.explanation,
      });
      return;
    }

    recordAttempt(
      currentExercise.grammarTag,
      result.correct,
      awardXpOnAttempt && result.correct ? xpPerCorrect : 0
    );
    if (result.correct) {
      setCorrectCount((prev) => prev + 1);
    }

    setFeedback({
      status: result.correct ? 'correct' : 'incorrect',
      expected: result.expected,
      explanation: currentExercise.explanation,
      ttsText: currentExercise.ttsText,
    });

    if (result.correct && progress.settings.autoAdvance) {
      if (autoAdvanceTimerRef.current !== null) {
        window.clearTimeout(autoAdvanceTimerRef.current);
      }
      autoAdvanceTimerRef.current = window.setTimeout(() => {
        advance();
      }, 950);
    }
  };

  const handleRequestExit = () => {
    if (finished || (index === 0 && !isLocked)) {
      ttsService.stop();
      onExit();
      return;
    }
    setConfirmExit(true);
  };

  if (exercises.length === 0) {
    return (
      <div className="fixed inset-0 z-40 flex min-h-dvh flex-col items-center justify-center bg-[var(--bg-surface)] p-6 text-center">
        <p className="text-base font-semibold text-[var(--text-primary)]">
          No exercises available for this selection.
        </p>
        <button
          type="button"
          onClick={onExit}
          className="mt-4 min-h-[48px] rounded-xl bg-[var(--brand)] px-6 text-sm font-bold text-white"
        >
          Back
        </button>
      </div>
    );
  }

  if (finished) {
    const scorePercent = Math.round((correctCount / exercises.length) * 100);
    const xpEarned =
      correctCount * xpPerCorrect + (scorePercent >= 80 ? passBonusXp : 0);

    return (
      <div className="fixed inset-0 z-40 flex min-h-dvh flex-col items-center justify-center overflow-y-auto bg-[var(--bg-surface)] p-6">
        <div className="w-full max-w-md rounded-3xl border border-[var(--border)] bg-[var(--bg-card)] p-6 text-center shadow-md space-y-5">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--accent)]/15 text-[var(--accent)]">
            <Award className="h-9 w-9" aria-hidden="true" />
          </div>
          <div className="space-y-1">
            <h2 className="text-2xl font-extrabold text-[var(--text-primary)]">
              {scorePercent >= 80 ? 'Bra jobbat!' : 'Session Complete'}
            </h2>
            <p className="text-sm text-[var(--text-muted)]">{title}</p>
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            <div className="rounded-2xl bg-[var(--bg-surface)] p-3">
              <p className="text-xs font-semibold text-[var(--text-muted)]">Score</p>
              <p className="mt-0.5 text-xl font-extrabold text-[var(--brand)]">
                {scorePercent}%
              </p>
            </div>
            <div className="rounded-2xl bg-[var(--bg-surface)] p-3">
              <p className="text-xs font-semibold text-[var(--text-muted)]">Correct</p>
              <p className="mt-0.5 text-xl font-extrabold text-[var(--success)]">
                {correctCount}/{exercises.length}
              </p>
            </div>
            <div className="rounded-2xl bg-[var(--bg-surface)] p-3">
              <p className="text-xs font-semibold text-[var(--text-muted)]">XP</p>
              <p className="mt-0.5 text-xl font-extrabold text-[var(--accent)]">
                +{xpEarned}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              ttsService.stop();
              onExit();
            }}
            className="min-h-[48px] w-full rounded-xl bg-[var(--brand)] px-4 text-base font-bold text-white transition-opacity hover:opacity-95 select-none touch-manipulation"
          >
            Done
          </button>
        </div>
      </div>
    );
  }

  const progressRatio = ((index + (isLocked ? 1 : 0)) / exercises.length) * 100;

  return (
    <div className="fixed inset-0 z-40 flex min-h-dvh flex-col bg-[var(--bg-surface)]">
      {/* Header */}
      <header className="pt-safe border-b border-[var(--border)] bg-[var(--bg-card)] px-3 py-2">
        <div className="mx-auto flex max-w-lg items-center gap-2">
          <button
            type="button"
            onClick={handleRequestExit}
            aria-label="Exit session"
            className="flex min-h-[48px] min-w-[48px] shrink-0 items-center justify-center rounded-xl text-[var(--text-muted)] hover:bg-[var(--bg-surface)] select-none touch-manipulation"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>

          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex items-center justify-between text-xs font-semibold text-[var(--text-muted)]">
              <span className="truncate">{subtitle ?? title}</span>
              <span className="shrink-0 tabular-nums">
                {index + 1}/{exercises.length}
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--border)]">
              <div
                className="h-full rounded-full bg-[var(--brand)] transition-all duration-300"
                style={{ width: `${progressRatio}%` }}
              />
            </div>
          </div>

          <button
            type="button"
            onClick={handleToggleMute}
            aria-pressed={muted}
            aria-label={muted ? "Turn audio back on" : "Can't listen now"}
            className={`inline-flex min-h-[48px] shrink-0 items-center gap-1.5 rounded-xl border px-2.5 text-xs font-bold transition-colors select-none touch-manipulation ${
              muted
                ? 'border-[var(--accent)] bg-[var(--accent)]/15 text-[var(--accent)]'
                : 'border-[var(--border)] bg-[var(--bg-surface)] text-[var(--text-muted)]'
            }`}
          >
            {muted ? (
              <VolumeX className="h-4 w-4 shrink-0" aria-hidden="true" />
            ) : (
              <Volume2 className="h-4 w-4 shrink-0" aria-hidden="true" />
            )}
            <span className="hidden xs:inline sm:inline">
              {muted ? 'Muted' : "Can't listen"}
            </span>
          </button>
        </div>
      </header>

      {/* Main exercise canvas */}
      <main className="flex-1 overflow-y-auto px-4 py-5">
        <div className="mx-auto max-w-lg pb-6">
          {currentExercise?.type === 'classifier' && (
            <ClassifierExercise
              key={currentExercise.id}
              exercise={currentExercise}
              muted={muted}
              locked={isLocked}
              selectedOption={selectedOption}
              onSelect={(opt, res) => {
                setSelectedOption(opt);
                handleGrade(res);
              }}
            />
          )}

          {currentExercise?.type === 'morph-fill' && (
            <MorphFillExercise
              key={currentExercise.id}
              exercise={currentExercise}
              locked={isLocked}
              value={typedValue}
              onChange={setTypedValue}
              onSubmitResult={handleGrade}
            />
          )}

          {currentExercise?.type === 'word-order' && (
            <WordOrderExercise
              key={currentExercise.id}
              exercise={currentExercise}
              locked={isLocked}
              selectedIndices={wordOrderIndices}
              onChangeSelected={setWordOrderIndices}
              onSubmitResult={handleGrade}
            />
          )}

          {currentExercise?.type === 'cloze' && (
            <ClozeExercise
              key={currentExercise.id}
              exercise={currentExercise}
              locked={isLocked}
              value={typedValue}
              onChange={setTypedValue}
              onSubmitResult={handleGrade}
            />
          )}

          {currentExercise?.type === 'error-spotting' && (
            <ErrorSpottingExercise
              key={currentExercise.id}
              exercise={currentExercise}
              locked={isLocked}
              onSubmitResult={handleGrade}
            />
          )}

          {currentExercise?.type === 'listening' && (
            <ListeningExercise
              key={currentExercise.id}
              exercise={currentExercise}
              muted={muted}
              locked={isLocked}
              selectedOption={selectedOption}
              onSelect={(opt, res) => {
                setSelectedOption(opt);
                handleGrade(res);
              }}
            />
          )}
        </div>
      </main>

      {/* Bottom Feedback Sheet */}
      {feedback && (
        <FeedbackBanner
          status={feedback.status}
          expected={feedback.expected}
          explanation={feedback.explanation}
          ttsText={feedback.ttsText}
          muted={muted}
          onContinue={() => {
            if (feedback.status === 'diacritic-retry') {
              setFeedback(null);
            } else {
              advance();
            }
          }}
        />
      )}

      {/* Exit confirmation modal */}
      {confirmExit && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Confirm exit session"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        >
          <div className="w-full max-w-sm rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-5 shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-[var(--text-primary)]">
              Leave this session?
            </h3>
            <p className="text-sm text-[var(--text-muted)]">
              Your progress in this session won&apos;t count toward unit completion until you finish.
            </p>
            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={() => setConfirmExit(false)}
                className="min-h-[48px] flex-1 rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] px-4 text-sm font-bold text-[var(--text-primary)]"
              >
                Keep practicing
              </button>
              <button
                type="button"
                onClick={() => {
                  ttsService.stop();
                  onExit();
                }}
                className="min-h-[48px] flex-1 rounded-xl bg-[var(--error)] px-4 text-sm font-bold text-white"
              >
                Leave
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
