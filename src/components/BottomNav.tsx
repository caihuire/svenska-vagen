import { NavLink } from 'react-router-dom';
import { BookOpen, Compass, Dumbbell, User } from 'lucide-react';

const NAV_ITEMS = [
  { to: '/', label: 'Path', icon: Compass, end: true },
  { to: '/vocab', label: 'Vocab', icon: BookOpen, end: false },
  { to: '/drills', label: 'Drills', icon: Dumbbell, end: false },
  { to: '/profile', label: 'Profile', icon: User, end: false },
] as const;

export function BottomNav() {
  return (
    <nav
      aria-label="Primary navigation"
      className="fixed bottom-0 inset-x-0 z-30 border-t border-[var(--border)] bg-[var(--bg-card)]/95 backdrop-blur-md pb-safe"
    >
      <div className="mx-auto grid max-w-lg grid-cols-4">
        {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex min-h-[56px] min-w-[48px] flex-col items-center justify-center gap-0.5 px-2 py-1.5 text-xs font-semibold transition-colors select-none touch-manipulation ${
                isActive
                  ? 'text-[var(--brand)]'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  className={`h-5 w-5 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.9]'}`}
                  aria-hidden="true"
                />
                <span>{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
