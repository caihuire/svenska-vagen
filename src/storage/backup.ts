import type { UserProgress } from '../types/index.ts';
import { migrateProgress } from './migrations.ts';

export async function exportProgressJson(progress: UserProgress): Promise<void> {
  const json = JSON.stringify(progress, null, 2);
  const filename = `svenska-vagen-backup-${new Date().toISOString().slice(0, 10)}.json`;

  if (
    typeof navigator !== 'undefined' &&
    typeof navigator.share === 'function' &&
    typeof File !== 'undefined'
  ) {
    try {
      const file = new File([json], filename, { type: 'application/json' });
      if (!navigator.canShare || navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: 'Svenska Vägen Backup',
          files: [file],
        });
        return;
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        return;
      }
      // Fall through to anchor download if Web Share is unavailable/blocked
    }
  }

  if (typeof document === 'undefined' || typeof URL === 'undefined') {
    throw new Error('JSON export is only supported in browser environments');
  }

  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.style.display = 'none';
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

export function parseProgressJson(text: string): UserProgress {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch (err) {
    throw new Error(
      `Invalid JSON backup file: ${err instanceof Error ? err.message : String(err)}`
    );
  }
  return migrateProgress(raw);
}
