import { useEffect, useMemo, useState } from 'react';
import { BookCheck, Check, ChevronDown, ChevronUp, Play, Plus, Square, X } from 'lucide-react';
import { AudioButton } from '../../components/AudioButton';
import { GenderBadge } from '../../components/GenderBadge';
import { extractSentences, parseCulturalMarkup } from '../../engine/reader/parser';
import { ttsService, type SpeechRate } from '../../services/tts/speech';
import { useApp } from '../../store/AppContext';
import type { LexiconEntry, TextToken, UnitContent } from '../../types/index';
import { ExerciseSession } from '../exercises/ExerciseSession';

interface CulturalReaderTabProps {
  unit: UnitContent;
  lexMap: Map<string, LexiconEntry>;
  onCompleteReader: (xpEarned: number) => void;
}

interface TokenWithMeta {
  token: TextToken;
  sentenceIndex: number;
}

function buildParagraphTokensWithSentenceIndex(
  paragraphs: TextToken[][]
): TokenWithMeta[][] {
  let sentenceIndex = 0;
  let sentenceHasWord = false;

  return paragraphs.map((para) => {
    const items = para.map((token) => {
      if (!token.isPunct) {
        sentenceHasWord = true;
      }
      const currentIdx = sentenceIndex;
      if (token.isPunct && /[.!?]/.test(token.surface) && sentenceHasWord) {
        sentenceIndex++;
        sentenceHasWord = false;
      }
      return { token, sentenceIndex: currentIdx };
    });

    if (sentenceHasWord) {
      sentenceIndex++;
      sentenceHasWord = false;
    }

    return items;
  });
}

export function CulturalReaderTab({
  unit,
  lexMap,
  onCompleteReader,
}: CulturalReaderTabProps) {
  const { progress, enrollWords } = useApp();
  const [activeToken, setActiveToken] = useState<TextToken | null>(null);
  const [activeSentenceIdx, setActiveSentenceIdx] = useState<number | null>(null);
  const [isPlayingAll, setIsPlayingAll] = useState(false);
  const [playRate, setPlayRate] = useState<SpeechRate>(1);
  const [showSummary, setShowSummary] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);

  const paragraphs = useMemo(
    () => parseCulturalMarkup(unit.culturalText.markup),
    [unit.culturalText.markup]
  );

  const sentences = useMemo(
    () => extractSentences(unit.culturalText.markup),
    [unit.culturalText.markup]
  );

  const paragraphsWithSentences = useMemo(
    () => buildParagraphTokensWithSentenceIndex(paragraphs),
    [paragraphs]
  );

  // Build spanGroup anchor map so any token in a group resolves its shared lexId/gloss
  const spanGroupInfo = useMemo(() => {
    const map = new Map<string, { lexId?: string; gloss?: string; surfaces: string[] }>();
    for (const para of paragraphs) {
      for (const t of para) {
        if (!t.spanGroup) continue;
        const prev = map.get(t.spanGroup) ?? { surfaces: [] };
        map.set(t.spanGroup, {
          lexId: prev.lexId ?? t.lexId,
          gloss: prev.gloss ?? t.gloss,
          surfaces: [...prev.surfaces, t.surface],
        });
      }
    }
    return map;
  }, [paragraphs]);

  useEffect(() => {
    const unsub = ttsService.subscribe((speaking) => {
      if (!speaking) {
        setIsPlayingAll(false);
      }
    });
    return () => {
      unsub();
      ttsService.stop();
    };
  }, [unit.id]);

  const ttsSupported = ttsService.isSupported();
  const unitProg = progress.unitProgress[unit.id];

  const handlePlayAll = () => {
    if (!ttsSupported || sentences.length === 0) return;
    setIsPlayingAll(true);
    ttsService.speakSentences(sentences, playRate, (idx) => {
      setActiveSentenceIdx(idx);
      if (idx === null) {
        setIsPlayingAll(false);
      }
    });
  };

  const handleStopPlayAll = () => {
    ttsService.stop();
    setIsPlayingAll(false);
    setActiveSentenceIdx(null);
  };

  // Resolve glossary info for activeToken
  const resolvedLexId = activeToken
    ? activeToken.lexId ??
      (activeToken.spanGroup
        ? spanGroupInfo.get(activeToken.spanGroup)?.lexId
        : undefined)
    : undefined;

  const resolvedGloss = activeToken
    ? activeToken.gloss ??
      (activeToken.spanGroup
        ? spanGroupInfo.get(activeToken.spanGroup)?.gloss
        : undefined)
    : undefined;

  const resolvedEntry = resolvedLexId ? lexMap.get(resolvedLexId) : undefined;
  const isEnrolled = resolvedEntry ? Boolean(progress.srsCards[resolvedEntry.id]) : false;

  const activeGroupText =
    activeToken?.spanGroup
      ? spanGroupInfo.get(activeToken.spanGroup)?.surfaces.join(' ')
      : undefined;

  if (showQuiz) {
    return (
      <ExerciseSession
        title={`${unit.culturalText.title} — Check`}
        subtitle="Cultural Reader"
        exercises={unit.culturalText.comprehension}
        xpPerCorrect={5}
        passBonusXp={0}
        onComplete={(res) => {
          onCompleteReader(Math.max(10, res.xpEarned));
        }}
        onExit={() => setShowQuiz(false)}
      />
    );
  }

  return (
    <div className="space-y-4 pb-8">
      {/* Header & Audio controls */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-4 shadow-sm space-y-3">
        <div>
          <h2 className="text-lg font-extrabold text-[var(--text-primary)]">
            {unit.culturalText.title}
          </h2>
          {unit.culturalText.subtitle && (
            <p className="text-xs font-medium text-[var(--text-muted)]">
              {unit.culturalText.subtitle}
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {isPlayingAll ? (
            <button
              type="button"
              onClick={handleStopPlayAll}
              className="inline-flex min-h-[48px] items-center gap-2 rounded-xl bg-[var(--error)] px-4 text-sm font-bold text-white select-none touch-manipulation"
            >
              <Square className="h-4 w-4 fill-current" aria-hidden="true" />
              <span>Stop</span>
            </button>
          ) : (
            <button
              type="button"
              disabled={!ttsSupported}
              onClick={handlePlayAll}
              className="inline-flex min-h-[48px] items-center gap-2 rounded-xl bg-[var(--brand)] px-4 text-sm font-bold text-white disabled:opacity-50 select-none touch-manipulation"
            >
              <Play className="h-4 w-4 fill-current" aria-hidden="true" />
              <span>{ttsSupported ? '▶ Play all' : 'Audio unavailable'}</span>
            </button>
          )}

          <button
            type="button"
            disabled={!ttsSupported}
            onClick={() => setPlayRate((prev) => (prev === 1 ? 0.75 : 1))}
            aria-pressed={playRate === 0.75}
            aria-label="Toggle reading speed"
            className={`min-h-[48px] min-w-[48px] rounded-xl border px-3 text-xs font-bold select-none touch-manipulation ${
              playRate === 0.75
                ? 'border-[var(--accent)] bg-[var(--accent)]/15 text-[var(--accent)]'
                : 'border-[var(--border)] bg-[var(--bg-surface)] text-[var(--text-muted)]'
            } disabled:opacity-50`}
          >
            {playRate === 0.75 ? '🐢 0.75×' : '1.0×'}
          </button>

          {unitProg?.readerPassed && (
            <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-[var(--success)]/12 px-2.5 py-1 text-xs font-bold text-[var(--success)]">
              <Check className="h-3.5 w-3.5" aria-hidden="true" />
              Passed
            </span>
          )}
        </div>
      </div>

      {/* Interactive Swedish passage */}
      <article className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-4 shadow-sm space-y-4">
        <p className="text-xs font-medium text-[var(--text-muted)]">
          Tap any highlighted word for instant translation, audio, and SRS save.
        </p>
        <div className="space-y-4 text-base leading-relaxed text-[var(--text-primary)]">
          {paragraphsWithSentences.map((para, pIdx) => (
            <p key={pIdx} className="leading-[1.85]">
              {para.map(({ token, sentenceIndex }, tIdx) => {
                const nextToken = para[tIdx + 1]?.token;
                const needsSpace =
                  nextToken &&
                  !nextToken.isPunct &&
                  token.surface !== '«' &&
                  token.surface !== '(' &&
                  token.surface !== '"';

                if (token.isPunct) {
                  return (
                    <span key={tIdx}>
                      {token.surface}
                      {needsSpace ? ' ' : ''}
                    </span>
                  );
                }

                const hasAnnotation = Boolean(
                  token.lexId || token.gloss || token.spanGroup
                );
                const isGroupMatch =
                  Boolean(activeToken?.spanGroup) &&
                  token.spanGroup === activeToken?.spanGroup;
                const isExactActive = activeToken === token;
                const isActiveSentence =
                  activeSentenceIdx !== null && activeSentenceIdx === sentenceIndex;

                return (
                  <span key={tIdx}>
                    <button
                      type="button"
                      onClick={() => setActiveToken(token)}
                      className={`inline rounded px-0.5 text-left align-baseline select-none touch-manipulation transition-colors ${
                        isGroupMatch || isExactActive
                          ? 'bg-[var(--brand)] text-white font-semibold'
                          : isActiveSentence
                            ? 'bg-[var(--accent)]/20 text-[var(--text-primary)]'
                            : hasAnnotation
                              ? 'underline decoration-dotted decoration-[var(--brand)]/70 underline-offset-4 hover:bg-[var(--brand)]/10'
                              : 'hover:bg-[var(--bg-surface)]'
                      }`}
                    >
                      {token.surface}
                    </button>
                    {needsSpace ? ' ' : ''}
                  </span>
                );
              })}
            </p>
          ))}
        </div>
      </article>

      {/* Collapsible English summary */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] overflow-hidden">
        <button
          type="button"
          onClick={() => setShowSummary((prev) => !prev)}
          aria-expanded={showSummary}
          className="flex min-h-[48px] w-full items-center justify-between px-4 py-3 text-sm font-bold text-[var(--text-primary)] select-none touch-manipulation"
        >
          <span>English Summary</span>
          {showSummary ? (
            <ChevronUp className="h-4 w-4 text-[var(--text-muted)]" aria-hidden="true" />
          ) : (
            <ChevronDown className="h-4 w-4 text-[var(--text-muted)]" aria-hidden="true" />
          )}
        </button>
        {showSummary && (
          <div className="border-t border-[var(--border)] px-4 py-3 text-sm leading-relaxed text-[var(--text-muted)]">
            {unit.culturalText.englishSummary}
          </div>
        )}
      </div>

      {/* Comprehension quiz launcher */}
      <button
        type="button"
        onClick={() => setShowQuiz(true)}
        className="inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-[var(--brand)] px-4 text-base font-bold text-white shadow-sm hover:opacity-95 select-none touch-manipulation"
      >
        <BookCheck className="h-5 w-5" aria-hidden="true" />
        <span>
          Comprehension Check ({unit.culturalText.comprehension.length} questions)
        </span>
      </button>

      {/* Bottom-docked glossary sheet */}
      {activeToken && (
        <div
          role="dialog"
          aria-label="Word glossary"
          className="fixed inset-x-0 bottom-0 z-40 border-t-2 border-[var(--brand)]/40 bg-[var(--bg-card)] p-4 pb-safe shadow-2xl"
        >
          <div className="mx-auto max-w-lg space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-lg font-extrabold text-[var(--text-primary)]">
                    {resolvedEntry?.lemma ?? activeGroupText ?? activeToken.surface}
                  </span>
                  {resolvedEntry?.morph?.pos === 'noun' && (
                    <GenderBadge gender={resolvedEntry.morph.gender} />
                  )}
                  {resolvedEntry && (
                    <span className="rounded-md bg-[var(--bg-surface)] px-2 py-0.5 text-xs font-semibold text-[var(--text-muted)]">
                      {resolvedEntry.pos}
                    </span>
                  )}
                </div>
                <p className="text-sm font-medium text-[var(--text-muted)]">
                  {resolvedEntry?.en ??
                    resolvedGloss ??
                    `Word form: "${activeToken.surface}"`}
                </p>
                {resolvedEntry?.ipa && (
                  <p className="text-xs font-mono text-[var(--text-muted)]">
                    {resolvedEntry.ipa}
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={() => setActiveToken(null)}
                aria-label="Close glossary sheet"
                className="flex min-h-[48px] min-w-[48px] shrink-0 items-center justify-center rounded-xl text-[var(--text-muted)] hover:bg-[var(--bg-surface)]"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <AudioButton
                text={resolvedEntry?.lemma ?? activeGroupText ?? activeToken.surface}
                label="Pronounce"
                showSlowToggle={false}
              />

              {resolvedEntry && (
                <button
                  type="button"
                  disabled={isEnrolled}
                  onClick={() => enrollWords([resolvedEntry.id])}
                  className={`inline-flex min-h-[48px] flex-1 items-center justify-center gap-1.5 rounded-xl border px-4 text-sm font-bold select-none touch-manipulation ${
                    isEnrolled
                      ? 'border-[var(--success)]/40 bg-[#ECFDF5] text-[var(--success)] dark:bg-[#0D2E22]'
                      : 'border-[var(--brand)] bg-[var(--brand)] text-white'
                  }`}
                >
                  {isEnrolled ? (
                    <>
                      <Check className="h-4 w-4" aria-hidden="true" />
                      <span>In SRS</span>
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4" aria-hidden="true" />
                      <span>+ SRS</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
