import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { StorageAdapter } from '../../../storage/adapter';
import { createInitialProgress } from '../../../storage/migrations';
import { AppProvider } from '../../../store/AppContext';
import type { Exercise, UserProgress } from '../../../types/index';
import { ExerciseSession } from '../ExerciseSession';

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

function renderWithApp(ui: ReactNode) {
  const adapter = createMemoryAdapter();
  return {
    adapter,
    ...render(<AppProvider adapter={adapter}>{ui}</AppProvider>),
  };
}

describe('ExerciseSession', () => {
  it('supports 2-tier diacritic retry on MorphFillExercise before finalizing grade', () => {
    const morphEx: Exercise = {
      id: 'test-morph-1',
      unitId: 'u01',
      type: 'morph-fill',
      grammarTag: 'alphabet-spelling',
      prompt: 'Type the Swedish word for "language":',
      baseForm: 'language',
      accepted: ['språk'],
      explanation: 'Språk uses å.',
    };
    const onComplete = vi.fn();

    renderWithApp(
      <ExerciseSession
        title="Diacritic Test"
        exercises={[morphEx]}
        onComplete={onComplete}
        onExit={() => {}}
      />
    );

    const input = screen.getByPlaceholderText('Type the Swedish form...') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'sprak' } });
    fireEvent.click(screen.getByRole('button', { name: 'Check ↵' }));

    expect(screen.getByText('Almost! Check å/ä/ö')).toBeTruthy();
    expect(onComplete).not.toHaveBeenCalled();

    // Fix diacritic to språk and resubmit
    fireEvent.change(input, { target: { value: 'språk' } });
    fireEvent.click(screen.getByRole('button', { name: 'Check ↵' }));

    expect(screen.getByText('Correct!')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));

    expect(onComplete).toHaveBeenCalledWith(
      expect.objectContaining({
        correctCount: 1,
        totalCount: 1,
        scorePercent: 100,
      })
    );
  });

  it('handles WordOrder acceptedOrders, ErrorSpotting bottom sheet, and Listening mute fallback', () => {
    const exercises: Exercise[] = [
      {
        id: 'test-wo-1',
        unitId: 'u05',
        type: 'word-order',
        grammarTag: 'v2-fronting',
        prompt: 'Build the sentence:',
        chunks: ['Idag', 'arbetar', 'jag'],
        correctOrder: ['Idag', 'arbetar', 'jag'],
        acceptedOrders: [['jag', 'arbetar', 'Idag']],
        explanation: 'V2 word order.',
      },
      {
        id: 'test-es-1',
        unitId: 'u01',
        type: 'error-spotting',
        grammarTag: 'negation-preview',
        prompt: 'Tap the wrong word:',
        tokens: ['Hunden', 'inte', 'sover.'],
        errorIndex: 1,
        options: ['sover inte', 'inte hund'],
        correctCorrection: 'sover inte',
        explanation: 'Verb before inte.',
      },
      {
        id: 'test-listen-1',
        unitId: 'u01',
        type: 'listening',
        grammarTag: 'cognate-listening',
        prompt: 'Listen and choose:',
        audioText: 'En garderob',
        fallbackText: 'En garderob',
        ipa: '/ɛn ɡaɖɛˈroːb/',
        options: ['a wardrobe', 'a stone'],
        correctOption: 'a wardrobe',
        explanation: 'Garderob means wardrobe.',
      },
    ];

    const onComplete = vi.fn();
    renderWithApp(
      <ExerciseSession
        title="Mixed Test"
        exercises={exercises}
        onComplete={onComplete}
        onExit={() => {}}
      />
    );

    // 1. Word order using alternate accepted order
    fireEvent.click(screen.getByRole('button', { name: 'jag' }));
    fireEvent.click(screen.getByRole('button', { name: 'arbetar' }));
    fireEvent.click(screen.getByRole('button', { name: 'Idag' }));
    fireEvent.click(screen.getByRole('button', { name: 'Check Order' }));
    expect(screen.getByText('Correct!')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));

    // 2. Error spotting
    fireEvent.click(screen.getByRole('button', { name: 'inte' }));
    fireEvent.click(screen.getByRole('button', { name: 'sover inte' }));
    expect(screen.getByText('Correct!')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));

    // 3. Listening with "Can't listen now" mute toggle
    fireEvent.click(screen.getByRole('button', { name: "Can't listen now" }));
    expect(screen.getByText('En garderob')).toBeTruthy();
    expect(screen.getByText('/ɛn ɡaɖɛˈroːb/')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'a wardrobe' }));
    expect(screen.getByText('Correct!')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));

    expect(onComplete).toHaveBeenCalledWith(
      expect.objectContaining({
        correctCount: 3,
        totalCount: 3,
        scorePercent: 100,
      })
    );
  });
});
