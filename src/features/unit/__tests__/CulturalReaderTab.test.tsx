import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { StorageAdapter } from '../../../storage/adapter';
import { createInitialProgress } from '../../../storage/migrations';
import { AppProvider } from '../../../store/AppContext';
import type { LexiconEntry, UnitContent, UserProgress } from '../../../types/index';
import { CulturalReaderTab } from '../CulturalReaderTab';

afterEach(() => {
  cleanup();
});

function createMemoryAdapter(initial?: UserProgress): StorageAdapter {
  let state = initial ?? createInitialProgress();
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

describe('CulturalReaderTab', () => {
  it('highlights all spanGroup tokens together and opens glossary sheet with + SRS', () => {
    const adapter = createMemoryAdapter();
    const lexMap = new Map<string, LexiconEntry>([
      [
        'verb:tycka_om',
        {
          id: 'verb:tycka_om',
          lemma: 'tycka om',
          en: 'to like',
          pos: 'verb',
          unitId: 'u05',
          stage: 'A1',
        },
      ],
      [
        'noun:kaffe',
        {
          id: 'noun:kaffe',
          lemma: 'kaffe',
          en: 'coffee',
          pos: 'noun',
          unitId: 'u05',
          stage: 'A1',
          morph: { pos: 'noun', gender: 'ett', declension: 'uncount' },
        },
      ],
    ]);

    const unit: UnitContent = {
      id: 'u05',
      number: 5,
      stage: 'A1',
      title: 'Test Unit',
      grammarFocus: 'Test focus',
      available: true,
      grammarCards: [],
      lexiconIds: ['verb:tycka_om', 'noun:kaffe'],
      exercises: [],
      culturalText: {
        title: 'Fika',
        markup: 'Hon [tycker|g1:verb:tycka_om] mycket [om|g1] [kaffe|noun:kaffe].',
        englishSummary: 'She likes coffee very much.',
        comprehension: [],
      },
    };

    render(
      <AppProvider adapter={adapter}>
        <CulturalReaderTab
          unit={unit}
          lexMap={lexMap}
          onCompleteReader={vi.fn()}
        />
      </AppProvider>
    );

    const tyckerBtn = screen.getByRole('button', { name: 'tycker' });
    const omBtn = screen.getByRole('button', { name: 'om' });

    // Tap split second part "om" — both "tycker" and "om" highlight together and resolve verb:tycka_om
    fireEvent.click(omBtn);

    expect(tyckerBtn.className).toContain('bg-[var(--brand)]');
    expect(omBtn.className).toContain('bg-[var(--brand)]');
    expect(screen.getByText('tycka om')).toBeTruthy();
    expect(screen.getByText('to like')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: '+ SRS' }));
    expect(adapter.load().srsCards['verb:tycka_om']).toBeDefined();
    expect(screen.getByText('In SRS')).toBeTruthy();

    // Tap noun "kaffe" to verify GenderBadge in glossary sheet
    fireEvent.click(screen.getByRole('button', { name: 'kaffe' }));
    expect(screen.getByLabelText('Grammatical gender: ett')).toBeTruthy();
    expect(screen.getByText('coffee')).toBeTruthy();
  });
});
