export type SpeechRate = 1 | 0.75;

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
}

class SwedishTtsService implements TtsService {
  private voices: SpeechSynthesisVoice[] = [];
  private speaking = false;
  private sessionId = 0;
  private listeners = new Set<(speaking: boolean) => void>();
  private voicesBound = false;
  private activeSentenceCb: ((idx: number | null) => void) | null = null;

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
    const current = synth.getVoices();
    if (current.length > 0) {
      this.voices = current;
    }
    if (!this.voicesBound) {
      this.voicesBound = true;
      const onVoicesChanged = () => {
        this.voices = synth.getVoices();
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
      (v) => v.lang.toLowerCase() === 'sv-se'
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

  isSupported(): boolean {
    return this.getSynth() !== null;
  }

  stop(): void {
    this.sessionId++;
    const prevSentenceCb = this.activeSentenceCb;
    this.activeSentenceCb = null;
    prevSentenceCb?.(null);

    const synth = this.getSynth();
    if (synth) {
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

    this.stop();
    const activeSession = ++this.sessionId;

    const utterance = new SpeechSynthesisUtterance(clean);
    utterance.lang = 'sv-SE';
    utterance.rate = rate;
    const voice = this.pickSwedishVoice(synth);
    if (voice) {
      utterance.voice = voice;
    }

    utterance.onstart = () => {
      if (this.sessionId === activeSession) {
        this.setSpeaking(true);
      }
    };
    utterance.onend = () => {
      if (this.sessionId === activeSession) {
        this.setSpeaking(false);
      }
    };
    utterance.onerror = () => {
      if (this.sessionId === activeSession) {
        this.setSpeaking(false);
      }
    };

    this.setSpeaking(true);
    synth.speak(utterance);
  }

  speakSentences(
    sentences: string[],
    rate: SpeechRate = 1,
    onSentenceIndex?: (idx: number | null) => void
  ): void {
    this.stop();

    const synth = this.getSynth();
    if (!synth || sentences.length === 0) {
      onSentenceIndex?.(null);
      return;
    }

    const activeSession = ++this.sessionId;
    this.activeSentenceCb = onSentenceIndex ?? null;
    const voice = this.pickSwedishVoice(synth);

    const playAt = (index: number) => {
      if (this.sessionId !== activeSession) return;
      if (index >= sentences.length) {
        this.activeSentenceCb = null;
        onSentenceIndex?.(null);
        this.setSpeaking(false);
        return;
      }

      const text = sentences[index].trim();
      if (!text) {
        playAt(index + 1);
        return;
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'sv-SE';
      utterance.rate = rate;
      if (voice) {
        utterance.voice = voice;
      }

      onSentenceIndex?.(index);
      this.setSpeaking(true);

      utterance.onend = () => {
        if (this.sessionId === activeSession) {
          playAt(index + 1);
        }
      };
      utterance.onerror = () => {
        if (this.sessionId === activeSession) {
          this.activeSentenceCb = null;
          onSentenceIndex?.(null);
          this.setSpeaking(false);
        }
      };

      synth.speak(utterance);
    };

    playAt(0);
  }

  subscribe(cb: (speaking: boolean) => void): () => void {
    this.listeners.add(cb);
    cb(this.speaking);
    return () => {
      this.listeners.delete(cb);
    };
  }
}

export const ttsService: TtsService = new SwedishTtsService();
