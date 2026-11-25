import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

class MockUtterance {
  text: string;
  lang = '';
  rate = 1;
  voice: SpeechSynthesisVoice | null = null;
  onstart: (() => void) | null = null;
  onend: (() => void) | null = null;
  onerror: ((e: { error: string }) => void) | null = null;

  constructor(text: string) {
    this.text = text;
  }
}

describe('SwedishTtsService', () => {
  const originalSynth = Object.getOwnPropertyDescriptor(window, 'speechSynthesis');
  const originalUtterance = globalThis.SpeechSynthesisUtterance;

  let mockSynth: {
    speaking: boolean;
    pending: boolean;
    paused: boolean;
    getVoices: ReturnType<typeof vi.fn>;
    speak: ReturnType<typeof vi.fn>;
    cancel: ReturnType<typeof vi.fn>;
    resume: ReturnType<typeof vi.fn>;
    addEventListener: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    vi.useFakeTimers();
    vi.resetModules();
    mockSynth = {
      speaking: false,
      pending: false,
      paused: false,
      getVoices: vi.fn(() => [
        {
          name: 'Microsoft Sofie',
          lang: 'sv-SE',
          localService: true,
          default: false,
          voiceURI: 'Microsoft Sofie',
        } as SpeechSynthesisVoice,
      ]),
      speak: vi.fn(),
      cancel: vi.fn(),
      resume: vi.fn(),
      addEventListener: vi.fn(),
    };
    Object.defineProperty(window, 'speechSynthesis', {
      configurable: true,
      writable: true,
      value: mockSynth,
    });
    (globalThis as unknown as { SpeechSynthesisUtterance: unknown }).SpeechSynthesisUtterance =
      MockUtterance;
  });

  afterEach(() => {
    vi.useRealTimers();
    if (originalSynth) {
      Object.defineProperty(window, 'speechSynthesis', originalSynth);
    } else {
      delete (window as unknown as Record<string, unknown>).speechSynthesis;
    }
    (globalThis as unknown as { SpeechSynthesisUtterance: unknown }).SpeechSynthesisUtterance =
      originalUtterance;
  });

  it('speaks synchronously without calling cancel() when idle and selects sv-SE voice', async () => {
    const { ttsService } = await import('./speech');
    ttsService.speak('Hej Sverige', 0.75);

    expect(mockSynth.cancel).not.toHaveBeenCalled();
    expect(mockSynth.speak).toHaveBeenCalledTimes(1);
    const spoken = mockSynth.speak.mock.calls[0][0] as MockUtterance;
    expect(spoken.text).toBe('Hej Sverige');
    expect(spoken.lang).toBe('sv-SE');
    expect(spoken.rate).toBe(0.75);
    expect(spoken.voice?.name).toBe('Microsoft Sofie');
  });

  it('cancels and delays speak() when interrupting active speech', async () => {
    const { ttsService } = await import('./speech');
    mockSynth.speaking = true;

    ttsService.speak('God morgon');
    expect(mockSynth.cancel).toHaveBeenCalledTimes(1);
    expect(mockSynth.speak).not.toHaveBeenCalled();

    vi.advanceTimersByTime(60);
    expect(mockSynth.speak).toHaveBeenCalledTimes(1);
  });

  it('resumes speechSynthesis if stuck in paused state', async () => {
    const { ttsService } = await import('./speech');
    mockSynth.paused = true;

    ttsService.speak('Tack så mycket');
    expect(mockSynth.resume).toHaveBeenCalled();
    expect(mockSynth.speak).toHaveBeenCalledTimes(1);
  });

  it('reports error via subscribeError when playback fails with no Swedish voice', async () => {
    mockSynth.getVoices.mockReturnValue([]);
    const { ttsService } = await import('./speech');
    const errors: Array<string | null> = [];
    const unsub = ttsService.subscribeError((e) => errors.push(e));

    ttsService.speak('Fika');
    const spoken = mockSynth.speak.mock.calls[0][0] as MockUtterance;
    spoken.onerror?.({ error: 'language-unavailable' });

    expect(errors[errors.length - 1]).toContain('No Swedish (sv-SE) voice');
    unsub();
  });
});
