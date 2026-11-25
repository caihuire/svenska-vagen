export type SpeechRate = 1 | 0.75;

export interface TtsVoiceInfo {
  hasSwedishVoice: boolean;
  voiceName: string | null;
  totalVoices: number;
  lastError: string | null;
}

export interface TtsService {
  isSupported(): boolean;
  speak(text: string, rate?: SpeechRate): void;
  speakSentences(
    sentences: string[],
    rate?: SpeechRate,
    onSentenceIndex?: (idx: number | null) => void
  ): void;
  stop(): void;
  subscribe(cb: (speaking: boolean) => void): () => void;
  subscribeError(cb: (error: string | null) => void): () => void;
  getVoiceInfo(): TtsVoiceInfo;
}

const CANCEL_DELAY_MS = 60;

class SwedishTtsService implements TtsService {
  private voices: SpeechSynthesisVoice[] = [];
  private speaking = false;
  private sessionId = 0;
  private listeners = new Set<(speaking: boolean) => void>();
  private errorListeners = new Set<(error: string | null) => void>();
  private voicesBound = false;
  private activeSentenceCb: ((idx: number | null) => void) | null = null;
  // Retain active utterance to prevent Chromium GC from killing speech mid-playback
  private activeUtterance: SpeechSynthesisUtterance | null = null;
  private pendingTimer: ReturnType<typeof setTimeout> | null = null;
  private lastError: string | null = null;

  constructor() {
    const synth = this.getSynth();
    if (synth) {
      this.ensureVoicesLoaded(synth);
    }
  }

  private getSynth(): SpeechSynthesis | null {
    if (
      typeof window === 'undefined' ||
      !('speechSynthesis' in window) ||
      typeof SpeechSynthesisUtterance === 'undefined'
    ) {
      return null;
    }
    return window.speechSynthesis;
  }

  private ensureVoicesLoaded(synth: SpeechSynthesis): void {
    try {
      const current = synth.getVoices();
      if (current && current.length > 0) {
        this.voices = current;
      }
    } catch {
      // Ignore getVoices errors in restricted environments
    }
    if (!this.voicesBound) {
      this.voicesBound = true;
      const onVoicesChanged = () => {
        try {
          const updated = synth.getVoices();
          if (updated && updated.length > 0) {
            this.voices = updated;
          }
        } catch {
          // Ignore
        }
      };
      if (typeof synth.addEventListener === 'function') {
        synth.addEventListener('voiceschanged', onVoicesChanged);
      } else {
        synth.onvoiceschanged = onVoicesChanged;
      }
    }
  }

  private pickSwedishVoice(synth: SpeechSynthesis): SpeechSynthesisVoice | undefined {
    this.ensureVoicesLoaded(synth);
    const exactSvSe = this.voices.filter(
      (v) => v.lang.toLowerCase().replace('_', '-') === 'sv-se'
    );
    if (exactSvSe.length > 0) {
      return exactSvSe.find((v) => v.localService) ?? exactSvSe[0];
    }
    const anySv = this.voices.filter((v) =>
      v.lang.toLowerCase().startsWith('sv')
    );
    if (anySv.length > 0) {
      return anySv.find((v) => v.localService) ?? anySv[0];
    }
    return undefined;
  }

  private setSpeaking(next: boolean): void {
    if (this.speaking === next) return;
    this.speaking = next;
    for (const cb of this.listeners) {
      cb(next);
    }
  }

  private setError(next: string | null): void {
    if (this.lastError === next) return;
    this.lastError = next;
    for (const cb of this.errorListeners) {
      cb(next);
    }
  }

  private clearPendingTimer(): void {
    if (this.pendingTimer !== null) {
      clearTimeout(this.pendingTimer);
      this.pendingTimer = null;
    }
  }

  private queueUtterance(
    synth: SpeechSynthesis,
    utterance: SpeechSynthesisUtterance,
    activeSession: number,
    delayMs: number
  ): void {
    const startNow = () => {
      if (this.sessionId !== activeSession) return;
      this.activeUtterance = utterance;
      try {
        if (synth.paused) {
          synth.resume();
        }
        synth.speak(utterance);
      } catch {
        this.activeUtterance = null;
        this.setSpeaking(false);
        this.setError('Speech playback failed in this browser.');
      }
    };

    if (delayMs > 0) {
      this.pendingTimer = setTimeout(() => {
        this.pendingTimer = null;
        startNow();
      }, delayMs);
    } else {
      startNow();
    }
  }

  private formatPlaybackError(errCode: string | undefined, hasSwedishVoice: boolean): string | null {
    if (errCode === 'canceled' || errCode === 'interrupted') {
      return null;
    }
    if (!hasSwedishVoice) {
      return 'No Swedish (sv-SE) voice is installed in this browser/OS. Install a Swedish voice in system speech settings or use Edge/Chrome online voices.';
    }
    if (errCode === 'not-allowed') {
      return 'Browser blocked speech playback. Tap the audio button again to allow sound.';
    }
    return `Speech playback error (${errCode ?? 'unknown'}).`;
  }

  isSupported(): boolean {
    return this.getSynth() !== null;
  }

  getVoiceInfo(): TtsVoiceInfo {
    const synth = this.getSynth();
    const voice = synth ? this.pickSwedishVoice(synth) : undefined;
    return {
      hasSwedishVoice: Boolean(voice),
      voiceName: voice?.name ?? null,
      totalVoices: this.voices.length,
      lastError: this.lastError,
    };
  }

  stop(): void {
    this.sessionId++;
    this.clearPendingTimer();
    if (this.activeUtterance) {
      this.activeUtterance.onstart = null;
      this.activeUtterance.onend = null;
      this.activeUtterance.onerror = null;
      this.activeUtterance = null;
    }
    const prevSentenceCb = this.activeSentenceCb;
    this.activeSentenceCb = null;
    prevSentenceCb?.(null);

    const synth = this.getSynth();
    if (synth && (synth.speaking || synth.pending || synth.paused)) {
      try {
        synth.cancel();
      } catch {
        // Ignore browser speechSynthesis cancel errors
      }
    }
    this.setSpeaking(false);
  }

  speak(text: string, rate: SpeechRate = 1): void {
    const clean = text.trim();
    if (!clean) return;

    const synth = this.getSynth();
    if (!synth) return;

    const wasBusy = Boolean(synth.speaking || synth.pending);
    this.stop();
    this.setError(null);
    const activeSession = ++this.sessionId;

    const utterance = new SpeechSynthesisUtterance(clean);
    utterance.lang = 'sv-SE';
    utterance.rate = rate;
    const voice = this.pickSwedishVoice(synth);
    if (voice) {
      utterance.voice = voice;
      utterance.lang = voice.lang || 'sv-SE';
    }

    utterance.onstart = () => {
      if (this.sessionId === activeSession) {
        this.setSpeaking(true);
      }
    };
    utterance.onend = () => {
      if (this.sessionId === activeSession) {
        this.activeUtterance = null;
        this.setSpeaking(false);
      }
    };
    utterance.onerror = (event: SpeechSynthesisErrorEvent) => {
      if (this.sessionId === activeSession) {
        this.activeUtterance = null;
        this.setSpeaking(false);
        const msg = this.formatPlaybackError(event?.error, Boolean(voice));
        if (msg) {
          this.setError(msg);
        }
      }
    };

    this.setSpeaking(true);
    this.queueUtterance(synth, utterance, activeSession, wasBusy ? CANCEL_DELAY_MS : 0);
  }

  speakSentences(
    sentences: string[],
    rate: SpeechRate = 1,
    onSentenceIndex?: (idx: number | null) => void
  ): void {
    const synth = this.getSynth();
    const wasBusy = Boolean(synth && (synth.speaking || synth.pending));
    this.stop();
    this.setError(null);

    if (!synth || sentences.length === 0) {
      onSentenceIndex?.(null);
      return;
    }

    const activeSession = ++this.sessionId;
    this.activeSentenceCb = onSentenceIndex ?? null;
    const voice = this.pickSwedishVoice(synth);

    const playAt = (index: number, delayMs: number) => {
      if (this.sessionId !== activeSession) return;
      if (index >= sentences.length) {
        this.activeUtterance = null;
        this.activeSentenceCb = null;
        onSentenceIndex?.(null);
        this.setSpeaking(false);
        return;
      }

      const text = sentences[index].trim();
      if (!text) {
        playAt(index + 1, delayMs);
        return;
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'sv-SE';
      utterance.rate = rate;
      if (voice) {
        utterance.voice = voice;
        utterance.lang = voice.lang || 'sv-SE';
      }

      onSentenceIndex?.(index);
      this.setSpeaking(true);

      utterance.onend = () => {
        if (this.sessionId === activeSession) {
          playAt(index + 1, 0);
        }
      };
      utterance.onerror = (event: SpeechSynthesisErrorEvent) => {
        if (this.sessionId === activeSession) {
          this.activeUtterance = null;
          this.activeSentenceCb = null;
          onSentenceIndex?.(null);
          this.setSpeaking(false);
          const msg = this.formatPlaybackError(event?.error, Boolean(voice));
          if (msg) {
            this.setError(msg);
          }
        }
      };

      this.queueUtterance(synth, utterance, activeSession, delayMs);
    };

    playAt(0, wasBusy ? CANCEL_DELAY_MS : 0);
  }

  subscribe(cb: (speaking: boolean) => void): () => void {
    this.listeners.add(cb);
    cb(this.speaking);
    return () => {
      this.listeners.delete(cb);
    };
  }

  subscribeError(cb: (error: string | null) => void): () => void {
    this.errorListeners.add(cb);
    cb(this.lastError);
    return () => {
      this.errorListeners.delete(cb);
    };
  }
}

export const ttsService: TtsService = new SwedishTtsService();
