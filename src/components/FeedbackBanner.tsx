import { CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import { AudioButton } from './AudioButton';

export type FeedbackStatus = 'correct' | 'diacritic-retry' | 'incorrect';

interface FeedbackBannerProps {
  status: FeedbackStatus;
  expected?: string;
  explanation?: string;
  ttsText?: string;
  muted?: boolean;
  onContinue: () => void;
  continueLabel?: string;
}

export function FeedbackBanner({
  status,
  expected,
  explanation,
  ttsText,
  muted = false,
  onContinue,
  continueLabel,
}: FeedbackBannerProps) {
  const isCorrect = status === 'correct';
  const isRetry = status === 'diacritic-retry';

  const containerStyle = isCorrect
    ? 'border-[var(--success)]/40 bg-[var(--success-bg)]'
    : isRetry
      ? 'border-[var(--accent)]/50 bg-[var(--accent-bg)]'
      : 'border-[var(--error)]/40 bg-[var(--error-bg)]';

  const headingColor = isCorrect
    ? 'text-[var(--success)]'
    : isRetry
      ? 'text-[var(--accent-text)]'
      : 'text-[var(--error)]';

  const buttonBg = isCorrect
    ? 'bg-[var(--success)] text-[var(--on-success)]'
    : isRetry
      ? 'bg-[var(--accent)] text-[var(--on-accent)]'
      : 'bg-[var(--error)] text-[var(--on-error)]';

  const title = isCorrect
    ? 'Correct!'
    : isRetry
      ? 'Almost! Check å/ä/ö'
      : 'Not quite';

  const resolvedLabel =
    continueLabel ?? (isRetry ? 'Edit answer' : 'Continue');

  return (
    <div
      role="status"
      aria-live="polite"
      className={`w-full rounded-t-2xl border-t-2 p-4 pb-safe shadow-lg ${containerStyle}`}
    >
      <div className="mx-auto max-w-lg space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-2.5 min-w-0">
            {isCorrect ? (
              <CheckCircle2
                className={`mt-0.5 h-5 w-5 shrink-0 ${headingColor}`}
                aria-hidden="true"
              />
            ) : isRetry ? (
              <AlertTriangle
                className={`mt-0.5 h-5 w-5 shrink-0 ${headingColor}`}
                aria-hidden="true"
              />
            ) : (
              <XCircle
                className={`mt-0.5 h-5 w-5 shrink-0 ${headingColor}`}
                aria-hidden="true"
              />
            )}

            <div className="min-w-0 space-y-1">
              <p className={`text-base font-bold ${headingColor}`}>{title}</p>
              {expected && !isRetry && (
                <p className="text-sm font-semibold text-[var(--text-primary)] break-words">
                  Expected: <span className="underline decoration-dotted">{expected}</span>
                </p>
              )}
              {isRetry && (
                <p className="text-sm text-[var(--text-primary)]">
                  Swedish å, ä, and ö are distinct letters — adjust your diacritics and try again.
                </p>
              )}
              {explanation && !isRetry && (
                <p className="text-sm leading-snug text-[var(--text-muted)]">
                  {explanation}
                </p>
              )}
            </div>
          </div>

          {ttsText && !isRetry && (
            <AudioButton
              text={ttsText}
              muted={muted}
              compact
              showSlowToggle={false}
            />
          )}
        </div>

        <button
          type="button"
          onClick={onContinue}
          className={`w-full min-h-[48px] rounded-xl px-4 text-base font-bold transition-opacity hover:opacity-95 active:scale-[0.99] select-none touch-manipulation ${buttonBg}`}
        >
          {resolvedLabel}
        </button>
      </div>
    </div>
  );
}
