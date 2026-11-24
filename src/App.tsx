import { lazy, Suspense, useEffect } from 'react';
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import { BottomNav } from './components/BottomNav';
import { PathView } from './features/path/PathView';
import { AppProvider, useApp } from './store/AppContext';

const UnitView = lazy(() =>
  import('./features/unit/UnitView').then((m) => ({ default: m.UnitView }))
);
const SrsView = lazy(() =>
  import('./features/srs/SrsView').then((m) => ({ default: m.SrsView }))
);
const DrillArenaView = lazy(() =>
  import('./features/drills/DrillArenaView').then((m) => ({
    default: m.DrillArenaView,
  }))
);
const ProfileView = lazy(() =>
  import('./features/profile/ProfileView').then((m) => ({
    default: m.ProfileView,
  }))
);

function RouteFallback() {
  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <div className="h-32 animate-pulse rounded-2xl bg-[var(--border)]" />
    </div>
  );
}

function AppShell() {
  const { progress } = useApp();

  useEffect(() => {
    document.documentElement.classList.toggle(
      'dark',
      progress.settings.darkMode
    );
  }, [progress.settings.darkMode]);

  return (
    <div className="min-h-dvh-safe overflow-x-hidden bg-[var(--bg-surface)] text-[var(--text-primary)]">
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route path="/" element={<PathView />} />
          <Route path="/unit/:unitId" element={<UnitView />} />
          <Route path="/vocab" element={<SrsView />} />
          <Route path="/drills" element={<DrillArenaView />} />
          <Route path="/profile" element={<ProfileView />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
      <BottomNav />
    </div>
  );
}

export function App() {
  return (
    <AppProvider>
      <HashRouter>
        <AppShell />
      </HashRouter>
    </AppProvider>
  );
}

export default App;
