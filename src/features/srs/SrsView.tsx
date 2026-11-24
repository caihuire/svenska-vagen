import { useEffect, useMemo, useState } from 'react';
import { BookOpen, CheckCircle2, Flame, Plus, Sparkles, X } from 'lucide-react';
import { AudioButton } from '../../components/AudioButton';
import { GenderBadge } from '../../components/GenderBadge';
import { SwedishInput } from '../../components/SwedishInput';
import { loadUnit } from '../../data/curriculum/loader';
import { getA1LexiconMap } from '../../data/lexicon/index';
import { evaluateTypedAnswer } from '../../engine/morphology/normalizer';
import {
  getDueSrsQueue,
  isLeechCard,
  isProductionCard,
  reviewSrsCard,
} from '../../engine/srs/scheduler';
import { ttsService } from '../../services/tts/speech';
import { useApp } from '../../store/AppContext';
import type { LexiconEntry, SrsCardState, SrsGrade } from '../../types/index';

function renderCharDiff(typed: string, expected: string) {
  const actual = typed.trim();
  const maxLen = Math.max(actual.length, expected.length);
  const chars = [];
  for (let i = 0; i < maxLen; i++) {
    const expCh = expected[i] ?? '';
    const actCh = actual[i] ?? '';
    const matches =
      actCh.toLocaleLowerCase('sv-SE') === expCh.toLocaleLowerCase('sv-SE');
    chars.push(
      <span
        key={i}
        className={`inline-block rounded px-0.5 font-mono text-base font-bold ${
          matches
            ? 'text-[var(--success)]'
            : 'bg-[var(--error)]/15 text-[var(--error)]'
        }`}
      >
        {expCh || '·'}
      </span>
    );
  }
  return <div className="flex flex-wrap justify-center gap-0.5">{chars}</div>;
}

function formatIntervalLabel(card: SrsCardState, grade: SrsGrade, nowMs: number): string {
  if (grade === 'again') return '<10m';
  const next = reviewSrsCard(card, grade, nowMs);
  return `${next.intervalDays}d`;
}

export function SrsView() {
  const { progress, enrollWords, reviewCard } = useApp();
  const [lexMap, setLexMap] = useState<Map<string, LexiconEntry>>(new Map());
  const [sessionQueue, setSessionQueue] = useState<SrsCardState[] | null>(null);
  const [sessionIdx, setSessionIdx] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [typedAnswer, setTypedAnswer] = useState('');
  const [productionEval, setProductionEval] = useState<'exact' | 'diacritic-retry' | 'wrong' | null>(null);
  const [reviewedCount, setReviewedCount] = useState(0);

  useEffect(() => {
    let cancelled = false;
    getA1LexiconMap()
      .then((map) => {
        if (!cancelled) setLexMap(map);
      })
      .catch(() => {
        // Ignore
      });
    return () => {
      cancelled = true;
      ttsService.stop();
    };
  }, []);

  const nowMs = Date.now();

  const dueQueue = useMemo(
    () =>
      getDueSrsQueue(
        progress.srsCards,
        nowMs,
        progress.settings.srsNewCap,
        progress.settings.srsReviewCap
      ),
    [progress.srsCards, progress.settings.srsNewCap, progress.settings.srsReviewCap, nowMs]
  );

  const stats = useMemo(() => {
    const cards = Object.values(progress.srsCards);
    let newRemaining = 0;
    let mastered = 0;
    let leeches = 0;
    for (const c of cards) {
      if (c.lastReviewedAt === 0 && c.reps === 0 && c.lapses === 0) {
        newRemaining++;
      }
      if (isProductionCard(c)) {
        mastered++;
      }
      if (isLeechCard(c)) {
        leeches++;
      }
    }
    return {
      total: cards.length,
      dueToday: dueQueue.length,
      newRemaining,
      mastered,
      leeches,
    };
  }, [progress.srsCards, dueQueue.length]);

  const handleStartSession = () => {
    if (dueQueue.length === 0) return;
    setSessionQueue(dueQueue);
    setSessionIdx(0);
    setRevealed(false);
    setTypedAnswer('');
    setProductionEval(null);
    setReviewedCount(0);
  };

  const handleQueueStarterUnit = async () => {
    const u01 = await loadUnit('u01');
    enrollWords(u01.lexiconIds);
  };

  if (sessionQueue !== null) {
    const finished = sessionIdx >= sessionQueue.length;
    const currentCard = !finished ? sessionQueue[sessionIdx] : undefined;
    const entry = currentCard ? lexMap.get(currentCard.lexId) : undefined;

    if (finished || !currentCard) {
      return (
        <div className="fixed inset-0 z-40 flex min-h-dvh flex-col items-center justify-center bg-[var(--bg-surface)] p-6">
          <div className="w-full max-w-md rounded-3xl border border-[var(--border)] bg-[var(--bg-card)] p-6 text-center shadow-md space-y-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--success)]/15 text-[var(--success)]">
              <CheckCircle2 className="h-9 w-9" aria-hidden="true" />
            </div>
            <h2 className="text-2xl font-extrabold text-[var(--text-primary)]">
              SRS Review Complete!
            </h2>
            <p className="text-sm text-[var(--text-muted)]">
              You reviewed {reviewedCount} {reviewedCount === 1 ? 'word' : 'words'}.
            </p>
            <button
              type="button"
              onClick={() => {
                ttsService.stop();
                setSessionQueue(null);
              }}
              className="min-h-[48px] w-full rounded-xl bg-[var(--brand)] px-4 text-base font-bold text-white"
            >
              Back to Vocab
            </button>
          </div>
        </div>
      );
    }

    const isProd = isProductionCard(currentCard);
    const isLeech = isLeechCard(currentCard);

    const handleCheckProduction = () => {
      if (!entry || !typedAnswer.trim()) return;
      const res = evaluateTypedAnswer(typedAnswer, [entry.lemma]);
      if (res.status === 'diacritic-retry' && productionEval !== 'diacritic-retry') {
        setProductionEval('diacritic-retry');
        return;
      }
      setProductionEval(res.status);
      setRevealed(true);
    };

    const handleGrade = (grade: SrsGrade) => {
      ttsService.stop();
      reviewCard(currentCard.lexId, grade);
      setReviewedCount((prev) => prev + 1);
      setSessionIdx((prev) => prev + 1);
      setRevealed(false);
      setTypedAnswer('');
      setProductionEval(null);
    };

    return (
      <div className="fixed inset-0 z-40 flex min-h-dvh flex-col bg-[var(--bg-surface)]">
        <header className="pt-safe border-b border-[var(--border)] bg-[var(--bg-card)] px-3 py-2">
          <div className="mx-auto flex max-w-lg items-center gap-2">
            <button
              type="button"
              onClick={() => {
                ttsService.stop();
                setSessionQueue(null);
              }}
              aria-label="Exit SRS session"
              className="flex min-h-[48px] min-w-[48px] items-center justify-center rounded-xl text-[var(--text-muted)] hover:bg-[var(--bg-surface)]"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex items-center justify-between text-xs font-semibold text-[var(--text-muted)]">
                <span>{isProd ? 'Production Recall' : 'Recognition Recall'}</span>
                <span className="tabular-nums">
                  {sessionIdx + 1}/{sessionQueue.length}
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--border)]">
                <div
                  className="h-full rounded-full bg-[var(--brand)] transition-all"
                  style={{
                    width: `${((sessionIdx + (revealed ? 1 : 0)) / sessionQueue.length) * 100}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-4 py-5">
          <div className="mx-auto max-w-lg space-y-4">
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between gap-2">
                <span className="rounded-full bg-[var(--brand)]/10 px-2.5 py-0.5 text-xs font-bold text-[var(--brand)]">
                  {isProd ? 'Production (≥4d)' : 'Recognition'}
                </span>
                {isLeech && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-[var(--error)]/15 px-2.5 py-0.5 text-xs font-bold text-[var(--error)]">
                    <Flame className="h-3.5 w-3.5" aria-hidden="true" />
                    Svår
                  </span>
                )}
              </div>

              {!entry ? (
                <p className="text-sm text-[var(--text-muted)]">
                  Loading word ({currentCard.lexId})...
                </p>
              ) : isProd ? (
                <div className="space-y-4">
                  <div className="space-y-2 text-center">
                    <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                      Type the Swedish word
                    </p>
                    <p className="text-2xl font-extrabold text-[var(--text-primary)]">
                      {entry.en}
                    </p>
                    <div className="flex items-center justify-center gap-2">
                      {entry.morph?.pos === 'noun' && (
                        <GenderBadge gender={entry.morph.gender} />
                      )}
                      <span className="rounded-md bg-[var(--bg-surface)] px-2 py-0.5 text-xs font-semibold text-[var(--text-muted)]">
                        {entry.pos}
                      </span>
                    </div>
                    {isLeech && (
                      <p className="text-xs font-bold text-[var(--error)]">
                        Svår hint: starts with &ldquo;{entry.lemma[0]}…&rdquo; ({entry.lemma.length} letters)
                      </p>
                    )}
                  </div>

                  {!revealed && (
                    <div className="space-y-2">
                      {productionEval === 'diacritic-retry' && (
                        <p className="rounded-xl bg-[var(--accent)]/15 px-3 py-2 text-center text-xs font-bold text-[#8A4F04] dark:text-[var(--accent)]">
                          Almost! Check å/ä/ö and try once more.
                        </p>
                      )}
                      <SwedishInput
                        value={typedAnswer}
                        onChange={setTypedAnswer}
                        onSubmit={handleCheckProduction}
                        placeholder="Type Swedish word..."
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={() => setRevealed(true)}
                        className="min-h-[48px] w-full rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] text-sm font-bold text-[var(--text-muted)]"
                      >
                        Reveal Answer
                      </button>
                    </div>
                  )}

                  {revealed && (
                    <div className="space-y-3 border-t border-[var(--border)] pt-4 text-center">
                      {typedAnswer.trim() && (
                        <div className="space-y-1">
                          <p className="text-xs font-semibold text-[var(--text-muted)]">
                            Character check
                          </p>
                          {renderCharDiff(typedAnswer, entry.lemma)}
                        </div>
                      )}
                      <p className="text-2xl font-extrabold text-[var(--brand)]">
                        {entry.lemma}
                      </p>
                      {entry.ipa && (
                        <p className="text-xs font-mono text-[var(--text-muted)]">
                          {entry.ipa}
                        </p>
                      )}
                      <div className="flex justify-center">
                        <AudioButton text={entry.lemma} label="Hear word" />
                      </div>
                      {entry.example && (
                        <div className="rounded-xl bg-[var(--bg-surface)] p-3 text-left text-xs space-y-0.5">
                          <p className="font-semibold text-[var(--text-primary)]">
                            {entry.example.sv}
                          </p>
                          <p className="text-[var(--text-muted)]">
                            {entry.example.en}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4 text-center">
                  <div className="space-y-2">
                    <p className="text-3xl font-extrabold text-[var(--text-primary)]">
                      {entry.lemma}
                    </p>
                    <span className="inline-block rounded-md bg-[var(--bg-surface)] px-2 py-0.5 text-xs font-semibold text-[var(--text-muted)]">
                      {entry.pos}
                    </span>
                    <div className="flex justify-center pt-1">
                      <AudioButton text={entry.lemma} label="Hear word" />
                    </div>
                  </div>

                  {!revealed ? (
                    <button
                      type="button"
                      onClick={() => setRevealed(true)}
                      className="min-h-[48px] w-full rounded-xl bg-[var(--brand)] px-4 text-base font-bold text-white select-none touch-manipulation"
                    >
                      Show Answer
                    </button>
                  ) : (
                    <div className="space-y-3 border-t border-[var(--border)] pt-4">
                      <p className="text-xl font-bold text-[var(--text-primary)]">
                        {entry.en}
                      </p>
                      <div className="flex items-center justify-center gap-2">
                        {entry.morph?.pos === 'noun' && (
                          <GenderBadge gender={entry.morph.gender} />
                        )}
                        {entry.ipa && (
                          <span className="text-xs font-mono text-[var(--text-muted)]">
                            {entry.ipa}
                          </span>
                        )}
                      </div>
                      {entry.example && (
                        <div className="rounded-xl bg-[var(--bg-surface)] p-3 text-left text-xs space-y-0.5">
                          <p className="font-semibold text-[var(--text-primary)]">
                            {entry.example.sv}
                          </p>
                          <p className="text-[var(--text-muted)]">
                            {entry.example.en}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </main>

        {/* 3-Button Grading Bar (>=52px height) */}
        {revealed && (
          <footer className="pb-safe border-t border-[var(--border)] bg-[var(--bg-card)] p-3">
            <div className="mx-auto grid max-w-lg grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleGrade('again')}
                className="flex min-h-[52px] flex-col items-center justify-center rounded-xl border border-[var(--error)]/40 bg-[#FEF2F2] px-2 py-1.5 text-[var(--error)] dark:bg-[#331414] select-none touch-manipulation"
              >
                <span className="text-sm font-extrabold">Again</span>
                <span className="text-[11px] font-semibold">
                  {formatIntervalLabel(currentCard, 'again', nowMs)}
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleGrade('good')}
                className="flex min-h-[52px] flex-col items-center justify-center rounded-xl border border-[var(--brand)]/40 bg-[var(--brand)]/10 px-2 py-1.5 text-[var(--brand)] select-none touch-manipulation"
              >
                <span className="text-sm font-extrabold">Good</span>
                <span className="text-[11px] font-semibold">
                  {formatIntervalLabel(currentCard, 'good', nowMs)}
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleGrade('easy')}
                className="flex min-h-[52px] flex-col items-center justify-center rounded-xl border border-[var(--success)]/40 bg-[#ECFDF5] px-2 py-1.5 text-[var(--success)] dark:bg-[#0D2E22] select-none touch-manipulation"
              >
                <span className="text-sm font-extrabold">Easy</span>
                <span className="text-[11px] font-semibold">
                  {formatIntervalLabel(currentCard, 'easy', nowMs)}
                </span>
              </button>
            </div>
          </footer>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-dvh pb-24">
      <header className="pt-safe border-b border-[var(--border)] bg-[var(--bg-card)] px-4 py-4">
        <div className="mx-auto max-w-lg space-y-1">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-[var(--brand)]" aria-hidden="true" />
            <h1 className="text-xl font-extrabold text-[var(--text-primary)]">
              SRS Vocab Trainer
            </h1>
          </div>
          <p className="text-xs text-[var(--text-muted)]">
            Cards upgrade from Recognition to Typed Production at 4+ day intervals.
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-lg px-4 py-4 space-y-4">
        <section
          aria-label="Vocabulary summary"
          className="grid grid-cols-2 gap-2.5"
        >
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-4 shadow-sm">
            <p className="text-xs font-semibold text-[var(--text-muted)]">Due today</p>
            <p className="mt-1 text-2xl font-extrabold text-[var(--brand)]">
              {stats.dueToday}
            </p>
          </div>
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-4 shadow-sm">
            <p className="text-xs font-semibold text-[var(--text-muted)]">
              New remaining
            </p>
            <p className="mt-1 text-2xl font-extrabold text-[var(--text-primary)]">
              {stats.newRemaining}
            </p>
          </div>
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-4 shadow-sm">
            <p className="text-xs font-semibold text-[var(--text-muted)]">
              Mastered (≥4d)
            </p>
            <p className="mt-1 text-2xl font-extrabold text-[var(--success)]">
              {stats.mastered}
            </p>
          </div>
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-4 shadow-sm">
            <p className="text-xs font-semibold text-[var(--text-muted)]">
              Svår Leeches
            </p>
            <p className="mt-1 text-2xl font-extrabold text-[var(--error)]">
              {stats.leeches}
            </p>
          </div>
        </section>

        {stats.total === 0 ? (
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-5 shadow-sm space-y-3 text-center">
            <Sparkles className="mx-auto h-8 w-8 text-[var(--accent)]" aria-hidden="true" />
            <h2 className="text-base font-extrabold text-[var(--text-primary)]">
              Start your Swedish deck
            </h2>
            <p className="text-xs text-[var(--text-muted)]">
              Queue Unit 1&apos;s starter vocabulary or tap + SRS inside any unit&apos;s Words tab or Cultural Reader.
            </p>
            <button
              type="button"
              onClick={() => void handleQueueStarterUnit()}
              className="inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-[var(--brand)] px-4 text-sm font-bold text-white"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              <span>Queue Unit 1 Words</span>
            </button>
          </div>
        ) : (
          <button
            type="button"
            disabled={dueQueue.length === 0}
            onClick={handleStartSession}
            className="min-h-[52px] w-full rounded-xl bg-[var(--brand)] px-4 text-base font-bold text-white shadow-sm hover:opacity-95 disabled:opacity-50 select-none touch-manipulation"
          >
            {dueQueue.length > 0
              ? `Start Review (${dueQueue.length} due)`
              : 'All caught up for today!'}
          </button>
        )}

        {stats.total > 0 && (
          <section className="space-y-2">
            <h2 className="text-sm font-extrabold text-[var(--text-primary)]">
              Enrolled Words ({stats.total})
            </h2>
            <ul className="space-y-2">
              {Object.values(progress.srsCards)
                .slice(0, 20)
                .map((card) => {
                  const entry = lexMap.get(card.lexId);
                  return (
                    <li
                      key={card.lexId}
                      className="flex items-center justify-between gap-2 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] px-3.5 py-2.5"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="truncate text-sm font-bold text-[var(--text-primary)]">
                            {entry?.lemma ?? card.lexId}
                          </span>
                          {entry?.morph?.pos === 'noun' && (
                            <GenderBadge gender={entry.morph.gender} />
                          )}
                          {isLeechCard(card) && (
                            <span className="rounded-full bg-[var(--error)]/15 px-1.5 py-0.5 text-[10px] font-bold text-[var(--error)]">
                              Svår
                            </span>
                          )}
                        </div>
                        <p className="truncate text-xs text-[var(--text-muted)]">
                          {entry?.en ?? ''}
                        </p>
                      </div>
                      <span className="shrink-0 text-xs font-semibold text-[var(--text-muted)]">
                        {card.intervalDays === 0 ? 'New' : `${card.intervalDays}d`}
                      </span>
                    </li>
                  );
                })}
            </ul>
          </section>
        )}
      </main>
    </div>
  );
}
