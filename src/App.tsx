import { HashRouter, Route, Routes } from 'react-router-dom';

function PlaceholderHome() {
  return (
    <main className="min-h-dvh-safe flex flex-col items-center justify-center p-6 text-center">
      <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--brand)' }}>
        Svenska Vägen
      </h1>
      <p className="mt-2 text-sm" style={{ color: 'var(--text-muted)' }}>
        Swedish A0–B2 PWA scaffold ready.
      </p>
    </main>
  );
}

export function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="*" element={<PlaceholderHome />} />
      </Routes>
    </HashRouter>
  );
}

export default App;
