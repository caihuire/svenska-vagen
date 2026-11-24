import type { UserProgress } from '../types/index.ts';
import { createInitialProgress, migrateProgress } from './migrations.ts';

export const STORAGE_KEY = 'svenska_vagen_progress_v1';

export interface StorageAdapter {
  load(): UserProgress;
  save(progress: UserProgress): void;
  clear(): void;
}

export class LocalStorageAdapter implements StorageAdapter {
  private readonly key: string;
  private readonly storage: Storage | undefined;

  constructor(key: string = STORAGE_KEY, storage?: Storage) {
    this.key = key;
    this.storage =
      storage ??
      (typeof globalThis !== 'undefined' && 'localStorage' in globalThis
        ? globalThis.localStorage
        : undefined);
  }

  load(): UserProgress {
    if (!this.storage) {
      return createInitialProgress();
    }
    try {
      const raw = this.storage.getItem(this.key);
      if (!raw) {
        return createInitialProgress();
      }
      return migrateProgress(JSON.parse(raw));
    } catch {
      return createInitialProgress();
    }
  }

  save(progress: UserProgress): void {
    if (!this.storage) return;
    try {
      this.storage.setItem(this.key, JSON.stringify(progress));
    } catch {
      // Ignore quota / private-mode storage failures gracefully
    }
  }

  clear(): void {
    if (!this.storage) return;
    try {
      this.storage.removeItem(this.key);
    } catch {
      // Ignore storage failures
    }
  }
}
