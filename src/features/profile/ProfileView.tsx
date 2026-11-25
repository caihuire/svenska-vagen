import { useMemo, useRef, useState, type ChangeEvent } from 'react';
import {
  Check,
  Copy,
  Download,
  RefreshCw,
  Share2,
  Trash2,
  Upload,
  User,
} from 'lucide-react';
import { getWeakGrammarTags } from '../../engine/mastery/tracker';
import { isProductionCard } from '../../engine/srs/scheduler';
import { exportProgressJson, parseProgressJson } from '../../storage/backup';
import { computeSyncDiff } from '../../storage/merge';
import { decodeSyncCode, encodeSyncCode } from '../../storage/syncCode';
import { useApp } from '../../store/AppContext';
import type { SyncDiff, UserProgress } from '../../types/index';

interface PendingMerge {
  sourceLabel: string;
  incoming: UserProgress;
  diff: SyncDiff;
}

export function ProfileView() {
  const { progress, updateSettings, applyMergedProgress, resetProgress } =
    useApp();

  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [pasteCode, setPasteCode] = useState('');
  const [syncError, setSyncError] = useState<string | null>(null);
  const [syncSuccess, setSyncSuccess] = useState<string | null>(null);
  const [pendingMerge, setPendingMerge] = useState<PendingMerge | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const weakTags = useMemo(() => getWeakGrammarTags(progress), [progress]);
  const masteredWords = useMemo(
    () =>
      Object.values(progress.srsCards).filter((c) => isProductionCard(c))
        .length,
    [progress.srsCards]
  );

  const handleGenerateCopyCode = async () => {
    setSyncError(null);
    setSyncSuccess(null);
    const code = encodeSyncCode(progress);
    setGeneratedCode(code);
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(code);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 2000);
      } catch {
        // Clipboard permission denied — code is still displayed
      }
    }
  };

  const handleShareCode = async () => {
    setSyncError(null);
    const code = generatedCode ?? encodeSyncCode(progress);
    setGeneratedCode(code);
    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      try {
        await navigator.share({
          title: 'Svenska Vägen Sync Code',
          text: code,
        });
        return;
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') return;
      }
    }
    await handleGenerateCopyCode();
  };

  const handlePreviewSyncCode = () => {
    setSyncError(null);
    setSyncSuccess(null);
    try {
      const incoming = decodeSyncCode(pasteCode);
      const diff = computeSyncDiff(progress, incoming);
      setPendingMerge({
        sourceLabel: 'Sync Code',
        incoming,
        diff,
      });
    } catch (err) {
      setSyncError(
        err instanceof Error ? err.message : 'Invalid sync code'
      );
    }
  };

  const handleImportJsonFile = async (e: ChangeEvent<HTMLInputElement>) => {
    setSyncError(null);
    setSyncSuccess(null);
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      const text = await file.text();
      const incoming = parseProgressJson(text);
      const diff = computeSyncDiff(progress, incoming);
      setPendingMerge({
        sourceLabel: `Backup (${file.name})`,
        incoming,
        diff,
      });
    } catch (err) {
      setSyncError(
        err instanceof Error ? err.message : 'Failed to import JSON backup'
      );
    }
  };

  const handleConfirmMerge = () => {
    if (!pendingMerge) return;
    applyMergedProgress(pendingMerge.incoming);
    setPendingMerge(null);
    setPasteCode('');
    setGeneratedCode(null);
    setSyncSuccess('Progress merged successfully!');
  };

  return (
    <div className="min-h-dvh pb-24">
      <header className="pt-safe border-b border-[var(--border)] bg-[var(--bg-card)] px-4 py-4">
        <div className="mx-auto max-w-lg flex items-center gap-2">
          <User className="h-5 w-5 text-[var(--brand)]" aria-hidden="true" />
          <h1 className="text-xl font-extrabold text-[var(--text-primary)]">
            Profile &amp; Sync
          </h1>
        </div>
      </header>

      <main className="mx-auto max-w-lg px-4 py-4 space-y-5">
        {/* Learning Stats */}
        <section
          aria-label="Learning statistics"
          className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-4 shadow-sm space-y-3"
        >
          <h2 className="text-sm font-extrabold text-[var(--text-primary)]">
            Learning Stats
          </h2>
          <div className="grid grid-cols-2 gap-2.5">
            <div className="rounded-xl bg-[var(--bg-surface)] p-3">
              <p className="text-xs font-semibold text-[var(--text-muted)]">Total XP</p>
              <p className="text-xl font-extrabold text-[var(--brand)]">
                {progress.xp}
              </p>
            </div>
            <div className="rounded-xl bg-[var(--bg-surface)] p-3">
              <p className="text-xs font-semibold text-[var(--text-muted)]">
                Streak / Freezes
              </p>
              <p className="text-xl font-extrabold text-[var(--accent-text)]">
                {progress.streak}d · {progress.freezes}/2
              </p>
            </div>
            <div className="rounded-xl bg-[var(--bg-surface)] p-3">
              <p className="text-xs font-semibold text-[var(--text-muted)]">
                Mastered Words
              </p>
              <p className="text-xl font-extrabold text-[var(--success)]">
                {masteredWords}
              </p>
            </div>
            <div className="rounded-xl bg-[var(--bg-surface)] p-3">
              <p className="text-xs font-semibold text-[var(--text-muted)]">
                Weak Skills (&lt;75%)
              </p>
              <p className="text-xl font-extrabold text-[var(--text-primary)]">
                {weakTags.length}
              </p>
            </div>
          </div>

          {weakTags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {weakTags.map((w) => (
                <span
                  key={w.tag}
                  className="rounded-full bg-[var(--accent)]/15 px-2.5 py-0.5 text-xs font-semibold text-[var(--accent-text)]"
                >
                  {w.tag}: {Math.round(w.accuracy * 100)}%
                </span>
              ))}
            </div>
          )}
        </section>

        {/* Settings */}
        <section
          aria-label="Settings"
          className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-4 shadow-sm space-y-4"
        >
          <h2 className="text-sm font-extrabold text-[var(--text-primary)]">
            Settings
          </h2>

          <div className="space-y-1.5">
            <span className="block text-xs font-semibold text-[var(--text-muted)]">
              Daily XP Goal
            </span>
            <div className="grid grid-cols-3 gap-2">
              {[30, 50, 100].map((goal) => (
                <button
                  key={goal}
                  type="button"
                  onClick={() => updateSettings({ dailyXpGoal: goal })}
                  aria-pressed={progress.settings.dailyXpGoal === goal}
                  className={`min-h-[48px] rounded-xl border text-sm font-bold select-none touch-manipulation ${
                    progress.settings.dailyXpGoal === goal
                      ? 'border-[var(--brand)] bg-[var(--brand)] text-[var(--on-brand)]'
                      : 'border-[var(--border)] bg-[var(--bg-surface)] text-[var(--text-primary)]'
                  }`}
                >
                  {goal} XP
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <span className="block text-xs font-semibold text-[var(--text-muted)]">
              SRS Daily Caps (New / Review)
            </span>
            <div className="grid grid-cols-3 gap-2">
              {[
                { newCap: 10, reviewCap: 40, label: '10 / 40' },
                { newCap: 15, reviewCap: 60, label: '15 / 60' },
                { newCap: 25, reviewCap: 100, label: '25 / 100' },
              ].map((preset) => {
                const active =
                  progress.settings.srsNewCap === preset.newCap &&
                  progress.settings.srsReviewCap === preset.reviewCap;
                return (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() =>
                      updateSettings({
                        srsNewCap: preset.newCap,
                        srsReviewCap: preset.reviewCap,
                      })
                    }
                    aria-pressed={active}
                    className={`min-h-[48px] rounded-xl border text-xs font-bold select-none touch-manipulation ${
                      active
                        ? 'border-[var(--brand)] bg-[var(--brand)] text-[var(--on-brand)]'
                        : 'border-[var(--border)] bg-[var(--bg-surface)] text-[var(--text-primary)]'
                    }`}
                  >
                    {preset.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Toggle switches */}
          <div className="space-y-2 pt-1">
            {[
              {
                key: 'autoAdvance' as const,
                label: 'Auto-Advance on Correct',
                desc: 'Automatically advance after a short pause (default OFF)',
                value: progress.settings.autoAdvance,
              },
              {
                key: 'darkMode' as const,
                label: 'Dark Mode',
                desc: 'Switch between Warm Snow and Deep Midnight Nordic theme',
                value: progress.settings.darkMode,
              },
              {
                key: 'freeBrowse' as const,
                label: 'Free-Browse Mode',
                desc: 'Unlock all available Wave 1 units without 80% gates',
                value: progress.settings.freeBrowse,
              },
            ].map((item) => (
              <button
                key={item.key}
                type="button"
                role="switch"
                aria-checked={item.value}
                onClick={() => updateSettings({ [item.key]: !item.value })}
                className="flex min-h-[56px] w-full items-center justify-between gap-3 rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] px-3.5 py-2.5 text-left select-none touch-manipulation"
              >
                <div className="min-w-0">
                  <p className="text-sm font-bold text-[var(--text-primary)]">
                    {item.label}
                  </p>
                  <p className="text-xs text-[var(--text-muted)]">{item.desc}</p>
                </div>
                <span
                  className={`inline-flex h-7 w-12 shrink-0 items-center rounded-full p-1 transition-colors ${
                    item.value ? 'bg-[var(--brand)]' : 'bg-[var(--border)]'
                  }`}
                >
                  <span
                    className={`h-5 w-5 rounded-full bg-[var(--switch-knob)] shadow transition-transform ${
                      item.value ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* Portable Sync Code (SV1:...) */}
        <section
          aria-label="Portable Sync Code"
          className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-4 shadow-sm space-y-3"
        >
          <div>
            <h2 className="text-sm font-extrabold text-[var(--text-primary)]">
              Portable Sync Code (SV1:…)
            </h2>
            <p className="text-xs text-[var(--text-muted)]">
              Move progress between phones without an account. Smart-merge preserves newer SRS reviews, highest unit scores, and union of streak days.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => void handleGenerateCopyCode()}
              className="inline-flex min-h-[48px] items-center justify-center gap-1.5 rounded-xl bg-[var(--brand)] px-3 text-xs font-bold text-[var(--on-brand)] select-none touch-manipulation"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4" aria-hidden="true" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" aria-hidden="true" />
                  <span>Copy Sync Code</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => void handleShareCode()}
              className="inline-flex min-h-[48px] items-center justify-center gap-1.5 rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] px-3 text-xs font-bold text-[var(--text-primary)] select-none touch-manipulation"
            >
              <Share2 className="h-4 w-4" aria-hidden="true" />
              <span>Share to Chat</span>
            </button>
          </div>

          {generatedCode && (
            <textarea
              readOnly
              value={generatedCode}
              rows={3}
              aria-label="Generated SV1 sync code"
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] p-2.5 font-mono text-[16px] text-[var(--text-primary)]"
            />
          )}

          <div className="space-y-2 pt-2 border-t border-[var(--border)]">
            <label
              htmlFor="paste-sync-code"
              className="block text-xs font-bold text-[var(--text-muted)]"
            >
              Paste &amp; Smart-Merge an SV1: code
            </label>
            <textarea
              id="paste-sync-code"
              value={pasteCode}
              onChange={(e) => setPasteCode(e.target.value)}
              rows={3}
              placeholder="Paste SV1:... code here"
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] p-3 text-[16px] text-[var(--text-primary)] placeholder:text-[var(--text-muted)]/70"
            />
            <button
              type="button"
              disabled={!pasteCode.trim()}
              onClick={handlePreviewSyncCode}
              className="inline-flex min-h-[48px] w-full items-center justify-center gap-1.5 rounded-xl border border-[var(--brand)] bg-[var(--brand)]/10 px-4 text-sm font-bold text-[var(--brand)] disabled:opacity-45 select-none touch-manipulation"
            >
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
              <span>Preview Smart-Merge</span>
            </button>
          </div>
        </section>

        {/* JSON File Backup */}
        <section
          aria-label="JSON File Backup"
          className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-4 shadow-sm space-y-3"
        >
          <h2 className="text-sm font-extrabold text-[var(--text-primary)]">
            JSON File Backup
          </h2>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => void exportProgressJson(progress)}
              className="inline-flex min-h-[48px] items-center justify-center gap-1.5 rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] px-3 text-xs font-bold text-[var(--text-primary)] select-none touch-manipulation"
            >
              <Download className="h-4 w-4" aria-hidden="true" />
              <span>Export JSON</span>
            </button>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex min-h-[48px] items-center justify-center gap-1.5 rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] px-3 text-xs font-bold text-[var(--text-primary)] select-none touch-manipulation"
            >
              <Upload className="h-4 w-4" aria-hidden="true" />
              <span>Import &amp; Merge</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,application/json"
              onChange={(e) => void handleImportJsonFile(e)}
              className="hidden"
            />
          </div>
        </section>

        {syncError && (
          <div
            role="alert"
            className="rounded-xl border border-[var(--error)]/40 bg-[var(--error-bg)] p-3 text-sm font-semibold text-[var(--error)] "
          >
            {syncError}
          </div>
        )}

        {syncSuccess && (
          <div
            role="status"
            className="rounded-xl border border-[var(--success)]/40 bg-[var(--success-bg)] p-3 text-sm font-semibold text-[var(--success)]"
          >
            {syncSuccess}
          </div>
        )}

        {/* Diff Preview Modal/Card */}
        {pendingMerge && (
          <section
            role="dialog"
            aria-label="Merge preview"
            className="rounded-2xl border-2 border-[var(--brand)] bg-[var(--bg-card)] p-4 shadow-lg space-y-3"
          >
            <h3 className="text-base font-extrabold text-[var(--text-primary)]">
              Merge Preview ({pendingMerge.sourceLabel})
            </h3>
            <ul className="space-y-1 text-sm text-[var(--text-primary)]">
              <li>+{pendingMerge.diff.newSrsCards} new SRS cards</li>
              <li>{pendingMerge.diff.updatedSrsCards} updated SRS cards</li>
              <li>{pendingMerge.diff.updatedUnits} updated units</li>
              <li>+{pendingMerge.diff.xpDelta} XP</li>
              <li>+{pendingMerge.diff.newActiveDates} active streak days</li>
            </ul>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPendingMerge(null)}
                className="min-h-[48px] flex-1 rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] text-sm font-bold text-[var(--text-primary)]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmMerge}
                className="min-h-[48px] flex-1 rounded-xl bg-[var(--brand)] text-sm font-bold text-[var(--on-brand)]"
              >
                Confirm &amp; Merge
              </button>
            </div>
          </section>
        )}

        {/* Reset Progress */}
        <section className="rounded-2xl border border-[var(--error)]/30 bg-[var(--bg-card)] p-4 shadow-sm space-y-3">
          <h2 className="text-sm font-extrabold text-[var(--error)]">
            Danger Zone
          </h2>
          {!confirmReset ? (
            <button
              type="button"
              onClick={() => setConfirmReset(true)}
              className="inline-flex min-h-[48px] w-full items-center justify-center gap-1.5 rounded-xl border border-[var(--error)]/40 bg-[var(--error-bg)] px-4 text-sm font-bold text-[var(--error)] "
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
              <span>Reset All Progress</span>
            </button>
          ) : (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-[var(--text-primary)]">
                Are you sure? This permanently erases local XP, streaks, unit scores, and SRS cards.
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setConfirmReset(false)}
                  className="min-h-[48px] flex-1 rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] text-sm font-bold text-[var(--text-primary)]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    resetProgress();
                    setConfirmReset(false);
                    setGeneratedCode(null);
                  }}
                  className="min-h-[48px] flex-1 rounded-xl bg-[var(--error)] text-sm font-bold text-[var(--on-error)]"
                >
                  Confirm Reset
                </button>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
