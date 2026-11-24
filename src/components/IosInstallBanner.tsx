import { Share, X } from 'lucide-react';
import { useApp } from '../store/AppContext';

export function isIosSafariOutsideStandalone(): boolean {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return false;
  }
  const ua = navigator.userAgent;
  const isIos =
    /iPad|iPhone|iPod/.test(ua) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  if (!isIos) return false;

  const isSafari =
    /Safari/i.test(ua) && !/CriOS|FxiOS|EdgiOS|OPiOS|DuckDuckGo/i.test(ua);
  if (!isSafari) return false;

  const navStandalone = (navigator as Navigator & { standalone?: boolean }).standalone === true;
  const displayStandalone =
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(display-mode: standalone)').matches;

  return !navStandalone && !displayStandalone;
}

export function IosInstallBanner() {
  const { progress, updateSettings } = useApp();

  const u01 = progress.unitProgress['u01'];
  const unit1Completed = Boolean(
    u01 && (u01.practiceAttempts > 0 || u01.readerPassed)
  );

  if (
    !unit1Completed ||
    progress.settings.iosInstallDismissed ||
    !isIosSafariOutsideStandalone()
  ) {
    return null;
  }

  return (
    <aside
      role="region"
      aria-label="Install app on iOS Home Screen"
      className="rounded-2xl border border-[var(--brand)]/30 bg-[var(--bg-card)] p-3.5 shadow-sm"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2.5">
          <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--brand)]/12 text-[var(--brand)]">
            <Share className="h-4 w-4" aria-hidden="true" />
          </div>
          <div className="space-y-1 text-sm">
            <p className="font-bold text-[var(--text-primary)]">
              Save your progress on iPhone/iPad
            </p>
            <p className="text-xs leading-relaxed text-[var(--text-muted)]">
              Tap Safari&apos;s <strong className="text-[var(--text-primary)]">Share</strong> button and choose{' '}
              <strong className="text-[var(--text-primary)]">Add to Home Screen</strong> so iOS doesn&apos;t clear local progress after 7 days away.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => updateSettings({ iosInstallDismissed: true })}
          aria-label="Dismiss iOS install tip"
          className="flex min-h-[48px] min-w-[48px] shrink-0 items-center justify-center rounded-xl text-[var(--text-muted)] hover:bg-[var(--bg-surface)]"
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>
    </aside>
  );
}
