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
          ? 'border-[#1B4D7E]/30 bg-[#1B4D7E]/12 text-[#1B4D7E] dark:border-[#6BA4DC]/35 dark:bg-[#6BA4DC]/18 dark:text-[#93C5FD]'
          : 'border-[#D98A1A]/35 bg-[#D98A1A]/15 text-[#8A4F04] dark:border-[#F2B449]/35 dark:bg-[#F2B449]/18 dark:text-[#FCD34D]'
      } ${className}`}
      aria-label={`Grammatical gender: ${gender}`}
    >
      <span aria-hidden="true" className="text-[10px] leading-none">
        {isEn ? '●' : '◆'}
      </span>
      <span>{gender}</span>
    </span>
  );
}
