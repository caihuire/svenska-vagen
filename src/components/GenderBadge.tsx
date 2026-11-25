interface GenderBadgeProps {
  gender: 'en' | 'ett';
  className?: string;
}

export function GenderBadge({ gender, className = '' }: GenderBadgeProps) {
  const isEn = gender === 'en';
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold tracking-wide ${
        isEn
          ? 'border-[var(--brand)]/40 bg-[var(--brand)]/12 text-[var(--brand)]'
          : 'border-[var(--accent)]/60 bg-[var(--accent-bg)] text-[var(--accent-text)]'
      } ${className}`}
      aria-label={`Grammatical gender: ${gender}`}
    >
      <span aria-hidden="true" className="text-micro leading-none">
        {isEn ? '●' : '◆'}
      </span>
      <span>{gender}</span>
    </span>
  );
}
