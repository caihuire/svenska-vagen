import { useEffect, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { ttsService, type SpeechRate } from '../services/tts/speech';

interface AudioButtonProps {
  text: string;
  label?: string;
  muted?: boolean;
  showSlowToggle?: boolean;
  compact?: boolean;
  className?: string;
}

export function AudioButton({
  text,
  label = 'Listen',
  muted = false,
  showSlowToggle = true,
  compact = false,
  className = '',
}: AudioButtonProps) {
  const [rate, setRate] = useState<SpeechRate>(1);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isThisActive, setIsThisActive] = useState(false);
  const [ttsError, setTtsError] = useState<string | null>(null);
  const supported = ttsService.isSupported();
  const disabled = !supported || muted || !text.trim();

  useEffect(() => {
    const unsubSpeak = ttsService.subscribe((speaking) => {
      setIsSpeaking(speaking);
      if (!speaking) {
        setIsThisActive(false);
      }
    });
    const unsubErr = ttsService.subscribeError((err) => {
      setTtsError(err);
    });
    return () => {
      unsubSpeak();
      unsubErr();
    };
  }, []);

  const handleSpeak = (chosenRate: SpeechRate = rate) => {
    if (disabled) return;
    ttsService.speak(text, chosenRate);
    setIsThisActive(true);
  };

  const handleToggleRate = () => {
    const nextRate: SpeechRate = rate === 1 ? 0.75 : 1;
    setRate(nextRate);
    if (!disabled && isSpeaking && isThisActive) {
      ttsService.speak(text, nextRate);
      setIsThisActive(true);
    }
  };

  const activePulse = isSpeaking && isThisActive;

  return (
    <div className={`inline-flex items-center gap-1.5 ${className}`}>
      <button
        type="button"
        onClick={() => handleSpeak(rate)}
        disabled={disabled}
        aria-label={
          !supported
            ? 'Speech audio unavailable on this device'
            : muted
              ? 'Audio muted for this session'
              : `${label} (${rate === 1 ? '1.0x' : '0.75x'})`
        }
        title={
          !supported
            ? 'Swedish TTS unavailable'
            : muted
              ? 'Muted ("Can’t listen now" is on)'
              : ttsError
                ? ttsError
                : `Play Swedish audio (${rate === 1 ? '1.0x' : '0.75x'})`
        }
        className={`inline-flex min-h-[48px] min-w-[48px] items-center justify-center gap-2 rounded-xl border px-3 text-sm font-semibold transition-colors select-none touch-manipulation ${
          disabled
            ? 'cursor-not-allowed border-[var(--border)] bg-[var(--bg-surface)] text-[var(--text-muted)] opacity-60'
            : activePulse
              ? 'animate-pulse border-[var(--brand)] bg-[var(--brand)] text-[var(--on-brand)] shadow-sm'
              : 'border-[var(--border)] bg-[var(--bg-card)] text-[var(--brand)] hover:border-[var(--brand)] active:scale-[0.98]'
        }`}
      >
        {disabled ? (
          <VolumeX className="h-5 w-5 shrink-0" aria-hidden="true" />
        ) : (
          <Volume2 className="h-5 w-5 shrink-0" aria-hidden="true" />
        )}
        {!compact && (
          <span>{!supported ? 'No TTS' : muted ? 'Muted' : label}</span>
        )}
      </button>

      {showSlowToggle && (
        <button
          type="button"
          onClick={handleToggleRate}
          disabled={!supported || muted}
          aria-pressed={rate === 0.75}
          aria-label={rate === 0.75 ? 'Slow speed 0.75x active' : 'Switch to 0.75x slow speed'}
          title="Toggle 0.75x slow speed"
          className={`inline-flex min-h-[48px] min-w-[48px] items-center justify-center rounded-xl border px-2.5 text-xs font-bold transition-colors select-none touch-manipulation ${
            !supported || muted
              ? 'cursor-not-allowed border-[var(--border)] bg-[var(--bg-surface)] text-[var(--text-muted)] opacity-60'
              : rate === 0.75
                ? 'border-[var(--accent)] bg-[var(--accent)]/15 text-[var(--accent-text)]'
                : 'border-[var(--border)] bg-[var(--bg-card)] text-[var(--text-muted)] hover:border-[var(--brand)]'
          }`}
        >
          {rate === 0.75 ? '🐢 0.75×' : '1.0×'}
        </button>
      )}
    </div>
  );
}
