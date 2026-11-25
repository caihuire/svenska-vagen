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

  it('enforces >=48px touch-target classes on mute toggle, short WordOrder tiles, and short ErrorSpotting tokens', () => {
    const exercises: Exercise[] = [
      {
        id: 'test-touch-wo',
        unitId: 'u01',
        type: 'word-order',
        grammarTag: 'v2-fronting',
        prompt: 'Build the sentence:',
        chunks: ['Det', 'är', 'bra'],
        correctOrder: ['Det', 'är', 'bra'],
        explanation: 'V2 word order.',
      },
      {
        id: 'test-touch-es',
        unitId: 'u01',
        type: 'error-spotting',
        grammarTag: 'prepositions',
        prompt: 'Tap the wrong word:',
        tokens: ['Jag', 'är', 'på', 'hem'],
        errorIndex: 2,
        options: ['i', 'hemma'],
        correctCorrection: 'i',
        explanation: 'Use i/hemma.',
      },
    ];

    renderWithApp(
      <ExerciseSession
        title="Touch Target Test"
        exercises={exercises}
        onComplete={() => {}}
        onExit={() => {}}
      />
    );

    // 1. ExerciseSession mute toggle button ("Can't listen now" / "Turn audio back on")
    const muteBtn = screen.getByRole('button', { name: "Can't listen now" });
    expect(muteBtn.className).toContain('min-w-[48px]');
    expect(muteBtn.className).toContain('min-h-[48px]');
    expect(muteBtn.className).toContain('justify-center');
    fireEvent.click(muteBtn);
    const unmuteBtn = screen.getByRole('button', { name: 'Turn audio back on' });
    expect(unmuteBtn.className).toContain('min-w-[48px]');
    expect(unmuteBtn.className).toContain('min-h-[48px]');

    // 2. WordOrderExercise short word tile ("är") in bank and placed tray
    const bankShortTile = screen.getByRole('button', { name: 'är' });
    expect(bankShortTile.className).toContain('min-w-[48px]');
    expect(bankShortTile.className).toContain('min-h-[48px]');
    fireEvent.click(bankShortTile);

    // Once placed, bank copy is disabled and placed copy is enabled
    const arButtons = screen.getAllByRole('button', { name: 'är' });
    expect(arButtons).toHaveLength(2);
    for (const btn of arButtons) {
      expect(btn.className).toContain('min-w-[48px]');
      expect(btn.className).toContain('min-h-[48px]');
    }

    // Complete WordOrder exercise to advance to ErrorSpotting
    fireEvent.click(screen.getByRole('button', { name: 'Det' }));
    fireEvent.click(screen.getByRole('button', { name: 'bra' }));
    fireEvent.click(screen.getByRole('button', { name: 'Check Order' }));
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));

    // 3. ErrorSpottingExercise short tokens ("på" and "är")
    const paToken = screen.getByRole('button', { name: 'på' });
    const arToken = screen.getByRole('button', { name: 'är' });
    expect(paToken.className).toContain('min-w-[48px]');
    expect(paToken.className).toContain('min-h-[48px]');
    expect(arToken.className).toContain('min-w-[48px]');
    expect(arToken.className).toContain('min-h-[48px]');
  });
});
