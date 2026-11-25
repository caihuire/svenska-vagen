import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it } from 'vitest';
import type { StorageAdapter } from '../../../storage/adapter';
import { createInitialProgress } from '../../../storage/migrations';
import { AppProvider } from '../../../store/AppContext';
import type { UserProgress } from '../../../types/index';
import { PathView } from '../PathView';

afterEach(() => {
  cleanup();
});

function adapterFor(initial: UserProgress): StorageAdapter {
  let state = initial;
  return {
    load: () => state,
    save: (next) => {
      state = next;
    },
    clear: () => {
      state = createInitialProgress();
    },
  };
}

function a1Mastered(freeBrowse = false): UserProgress {
  const p = createInitialProgress();
  p.settings.freeBrowse = freeBrowse;
  for (let u = 1; u <= 13; u++) {
    p.unitProgress[`u${String(u).padStart(2, '0')}`] = {
      practiceBestScore: 85,
      practiceAttempts: 1,
      readerPassed: true,
      lastStudiedAt: 1000 + u,
    };
  }
  return p;
}

function renderPath(progress: UserProgress) {
  render(
    <MemoryRouter>
      <AppProvider adapter={adapterFor(progress)}>
        <PathView />
      </AppProvider>
    </MemoryRouter>
  );
  // A2 starts collapsed; expand it.
  fireEvent.click(screen.getByRole('button', { name: /Stage A2/ }));
}

const unitLink = (n: number) =>
  document.querySelector(`a[href="/unit/u${String(n).padStart(2, '0')}"]`);

describe('PathView A2 unlock rules', () => {
  it('with u01-u13 mastered, u14 is unlocked and u15 is locked', () => {
    renderPath(a1Mastered());

    expect(unitLink(14)).not.toBeNull();
    expect(screen.queryByText('Unit 14 · Locked')).toBeNull();

    expect(unitLink(15)).toBeNull();
    expect(screen.getByText('Unit 15 · Locked')).toBeTruthy();
  });

  it('in Guided mode with no progress, u14 is locked', () => {
    renderPath(createInitialProgress());
    expect(unitLink(14)).toBeNull();
    expect(screen.getByText('Unit 14 · Locked')).toBeTruthy();
  });

  it('with freeBrowse on, u14-u25 are all open', () => {
    renderPath(a1Mastered(true));

    for (let n = 14; n <= 25; n++) {
      expect(unitLink(n), `u${n} should be a link`).not.toBeNull();
    }
    expect(screen.queryByText(/· Locked/)).toBeNull();
  });
});
