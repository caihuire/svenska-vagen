import {
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent,
  type RefObject,
} from 'react';

interface SwedishInputProps {
  value: string;
  onChange: (next: string) => void;
  onSubmit: () => void;
  placeholder?: string;
  disabled?: boolean;
  autoFocus?: boolean;
  label?: string;
  id?: string;
  submitLabel?: string;
  inputRef?: RefObject<HTMLInputElement | null>;
}

const SWEDISH_CHARS_LOWER = ['å', 'ä', 'ö'] as const;
const SWEDISH_CHARS_UPPER = ['Å', 'Ä', 'Ö'] as const;

export function SwedishInput({
  value,
  onChange,
  onSubmit,
  placeholder = 'Type in Swedish...',
  disabled = false,
  autoFocus = false,
  label,
  id,
  submitLabel = 'Check ↵',
  inputRef: externalRef,
}: SwedishInputProps) {
  const internalRef = useRef<HTMLInputElement | null>(null);
  const inputElRef = externalRef ?? internalRef;
  const [uppercase, setUppercase] = useState(false);
  const pendingCursorRef = useRef<number | null>(null);

  useLayoutEffect(() => {
    const pos = pendingCursorRef.current;
    if (pos === null) return;
    pendingCursorRef.current = null;
    const el = inputElRef.current;
    if (el && typeof el.setSelectionRange === 'function') {
      try {
        el.setSelectionRange(pos, pos);
      } catch {
        // Ignore if input is not selectable
      }
    }
  }, [value, inputElRef]);

  const keepFocus = (e: PointerEvent<HTMLButtonElement> | MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
  };

  const insertChar = (char: string) => {
    if (disabled) return;
    const el = inputElRef.current;
    const start = el?.selectionStart ?? value.length;
    const end = el?.selectionEnd ?? value.length;
    const next = value.slice(0, start) + char + value.slice(end);
    pendingCursorRef.current = start + char.length;
    onChange(next);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (!disabled) {
        onSubmit();
      }
    }
  };

  const chars = uppercase ? SWEDISH_CHARS_UPPER : SWEDISH_CHARS_LOWER;

  return (
    <div className="w-full space-y-2">
      {label && (
        <label
          htmlFor={id}
          className="block text-sm font-medium text-[var(--text-muted)]"
        >
          {label}
        </label>
      )}
      <input
        ref={inputElRef}
        id={id}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        autoFocus={autoFocus}
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
        autoComplete="off"
        lang="sv"
        enterKeyHint="done"
        className="w-full min-h-[48px] rounded-xl border-2 border-[var(--border)] bg-[var(--bg-card)] px-3.5 py-2.5 text-[16px] font-medium text-[var(--text-primary)] placeholder:text-[var(--text-muted)]/70 focus:border-[var(--brand)] focus:outline-none disabled:opacity-60"
      />

      <div
        className="flex flex-wrap items-center gap-1.5"
        role="toolbar"
        aria-label="Swedish characters and check action"
      >
        {chars.map((ch) => (
          <button
            key={ch}
            type="button"
            disabled={disabled}
            onPointerDown={keepFocus}
            onMouseDown={keepFocus}
            onClick={() => insertChar(ch)}
            aria-label={`Insert ${ch}`}
            className="min-h-[48px] min-w-[48px] flex-1 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] px-2 text-lg font-bold text-[var(--text-primary)] transition-colors hover:border-[var(--brand)] active:bg-[var(--brand)]/10 disabled:opacity-50 select-none touch-manipulation"
          >
            {ch}
          </button>
        ))}

        <button
          type="button"
          disabled={disabled}
          onPointerDown={keepFocus}
          onMouseDown={keepFocus}
          onClick={() => setUppercase((prev) => !prev)}
          aria-pressed={uppercase}
          aria-label="Toggle uppercase Swedish letters"
          title="Toggle Å / Ä / Ö uppercase"
          className={`min-h-[48px] min-w-[48px] rounded-xl border px-3 text-base font-bold transition-colors select-none touch-manipulation ${
            uppercase
              ? 'border-[var(--brand)] bg-[var(--brand)]/15 text-[var(--brand)]'
              : 'border-[var(--border)] bg-[var(--bg-card)] text-[var(--text-muted)]'
          } disabled:opacity-50`}
        >
          ⇧
        </button>

        <button
          type="button"
          disabled={disabled}
          onPointerDown={keepFocus}
          onMouseDown={keepFocus}
          onClick={onSubmit}
          className="min-h-[48px] min-w-[88px] flex-[1.6] rounded-xl bg-[var(--brand)] px-3.5 text-sm font-bold text-white transition-opacity hover:opacity-95 active:scale-[0.98] disabled:opacity-50 select-none touch-manipulation"
        >
          {submitLabel}
        </button>
      </div>
    </div>
  );
}
