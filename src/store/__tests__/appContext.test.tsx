import { act, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it } from 'vitest';
import { ttsService } from '../../services/tts/speech.ts';
import type { StorageAdapter } from '../../storage/adapter.ts';
import { createInitialProgress } from '../../storage/migrations.ts';
import type { UserProgress } from '../../types/index.ts';
import { AppProvider, useApp } from '../AppContext.tsx';

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

describe('AppContext', () => {
  it('exposes progress actions and persists via StorageAdapter', () => {
    const adapter = createMemoryAdapter();
    const wrapper = ({ children }: { children: ReactNode }) => (
      <AppProvider adapter={adapter}>{children}</AppProvider>
    );

    const { result } = renderHook(() => useApp(), { wrapper });

    act(() => {
      result.current.enrollWords(['noun:kaffe', 'verb:dricka']);
    });
    expect(Object.keys(result.current.progress.srsCards)).toEqual([
      'noun:kaffe',
      'verb:dricka',
    ]);

    act(() => {
      result.current.reviewCard('noun:kaffe', 'good');
      result.current.completeUnitPractice('u01', 90, 25);
      result.current.completeUnitReader('u01', 15);
      result.current.recordAttempt('v2-order', false, 0);
      result.current.updateSettings({ darkMode: true });
    });

    expect(result.current.progress.srsCards['noun:kaffe'].intervalDays).toBe(1);
    expect(result.current.progress.unitProgress['u01']).toMatchObject({
      practiceBestScore: 90,
      practiceAttempts: 1,
      readerPassed: true,
    });
    expect(result.current.progress.weakSkills['v2-order'].recentResults).toEqual([
      false,
    ]);
    expect(result.current.progress.settings.darkMode).toBe(true);
    expect(result.current.progress.xp).toBe(45);
    expect(adapter.load().xp).toBe(45);

    act(() => {
      result.current.resetProgress();
    });
    expect(result.current.progress.xp).toBe(0);
    expect(result.current.progress.srsCards).toEqual({});
  });

  it('provides ttsService safe API in jsdom', () => {
    expect(typeof ttsService.isSupported()).toBe('boolean');
    let lastSpeaking = false;
    const unsub = ttsService.subscribe((s) => {
      lastSpeaking = s;
    });
    expect(lastSpeaking).toBe(false);
    ttsService.stop();
    unsub();
  });
});
