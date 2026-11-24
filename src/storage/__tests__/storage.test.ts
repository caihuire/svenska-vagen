import { describe, expect, it } from 'vitest';
import type { UserProgress } from '../../types/index.ts';
import { LocalStorageAdapter } from '../adapter.ts';
import { parseProgressJson } from '../backup.ts';
import { computeSyncDiff, mergeProgress } from '../merge.ts';
import { createInitialProgress, migrateProgress } from '../migrations.ts';
import { decodeSyncCode, encodeSyncCode } from '../syncCode.ts';

function createRichProgress(): UserProgress {
  const base = createInitialProgress();
  base.xp = 1250;
  base.streak = 5;
  base.freezes = 1;
  base.activeDates = [
    '2026-11-20',
    '2026-11-21',
    '2026-11-22',
    '2026-11-23',
    '2026-11-24',
  ];
  base.lastStreakCheckDate = '2026-11-24';
  base.updatedAt = 1795520000000;

  for (let u = 1; u <= 13; u++) {
    const unitId = `u${String(u).padStart(2, '0')}`;
    base.unitProgress[unitId] = {
      practiceBestScore: 80 + (u % 20),
      practiceAttempts: 2,
      readerPassed: u <= 10,
      lastStudiedAt: 1795500000000 + u * 1000,
    };
  }

  for (let i = 0; i < 100; i++) {
    const lexId = `noun:word_${i}`;
    base.srsCards[lexId] = {
      lexId,
      intervalDays: (i % 14) + 1,
      ease: 2.5,
      reps: (i % 5) + 1,
      lapses: i % 3,
      dueAt: 1795600000000 + i * 60000,
      lastReviewedAt: 1795500000000 + i * 1000,
      enrolledAt: 1795000000000 + i * 1000,
    };
  }

  base.weakSkills['v2-order'] = {
    tag: 'v2-order',
    recentResults: [true, false, false, true, false],
    updatedAt: 1795510000000,
  };

  return base;
}

describe('syncCode', () => {
  it('round-trips 100 SRS cards + 13 units losslessly under 1.5 KB', () => {
    const rich = createRichProgress();
    const code = encodeSyncCode(rich);

    expect(code.startsWith('SV1:')).toBe(true);
    expect(code.length).toBeLessThan(1536);

    const decoded = decodeSyncCode(code);
    expect(decoded).toEqual(rich);
  });

  it('throws checksum or format errors on truncation or 1-char mutation', () => {
    const rich = createRichProgress();
    const code = encodeSyncCode(rich);

    // Truncate
    expect(() => decodeSyncCode(code.slice(0, -1))).toThrow(/checksum/i);

    // Mutate 1 character in payload
    const lastChar = code[code.length - 1];
    const replacement = lastChar === 'A' ? 'B' : 'A';
    const mutated = code.slice(0, -1) + replacement;
    expect(() => decodeSyncCode(mutated)).toThrow(/checksum/i);

    // Mutate prefix
    expect(() => decodeSyncCode(`SV2:${code.slice(4)}`)).toThrow(/prefix/i);
  });
});

describe('mergeProgress & computeSyncDiff', () => {
  it('merges newest SRS card by lastReviewedAt, highest unit mastery, max XP, and union activeDates', () => {
    const local = createInitialProgress();
    local.xp = 300;
    local.activeDates = ['2026-11-20', '2026-11-21'];
    local.freezes = 1;
    local.updatedAt = 1000;
    local.unitProgress['u01'] = {
      practiceBestScore: 85,
      practiceAttempts: 2,
      readerPassed: false,
      lastStudiedAt: 1000,
    };
    local.srsCards['noun:bil'] = {
      lexId: 'noun:bil',
      intervalDays: 1,
      ease: 2.5,
      reps: 1,
      lapses: 0,
      dueAt: 5000,
      lastReviewedAt: 2000,
      enrolledAt: 1000,
    };

    const incoming = createInitialProgress();
    incoming.xp = 450;
    incoming.activeDates = ['2026-11-22', '2026-11-23'];
    incoming.freezes = 2;
    incoming.updatedAt = 3000;
    incoming.unitProgress['u01'] = {
      practiceBestScore: 70,
      practiceAttempts: 1,
      readerPassed: true,
      lastStudiedAt: 2500,
    };
    incoming.unitProgress['u02'] = {
      practiceBestScore: 90,
      practiceAttempts: 1,
      readerPassed: false,
      lastStudiedAt: 2900,
    };
    incoming.srsCards['noun:bil'] = {
      lexId: 'noun:bil',
      intervalDays: 4,
      ease: 2.65,
      reps: 2,
      lapses: 0,
      dueAt: 9000,
      lastReviewedAt: 2800,
      enrolledAt: 1000,
    };
    incoming.srsCards['verb:bo'] = {
      lexId: 'verb:bo',
      intervalDays: 1,
      ease: 2.5,
      reps: 1,
      lapses: 0,
      dueAt: 6000,
      lastReviewedAt: 2700,
      enrolledAt: 2600,
    };

    const diff = computeSyncDiff(local, incoming);
    expect(diff).toEqual({
      newSrsCards: 1,
      updatedSrsCards: 1,
      updatedUnits: 2,
      xpDelta: 150,
      newActiveDates: 2,
    });

    const merged = mergeProgress(local, incoming);
    expect(merged.xp).toBe(450);
    expect(merged.activeDates).toEqual([
      '2026-11-20',
      '2026-11-21',
      '2026-11-22',
      '2026-11-23',
    ]);
    expect(merged.streak).toBe(4);
    expect(merged.freezes).toBe(2);
    expect(merged.unitProgress['u01']).toEqual({
      practiceBestScore: 85,
      practiceAttempts: 2,
      readerPassed: true,
      lastStudiedAt: 2500,
    });
    expect(merged.srsCards['noun:bil'].intervalDays).toBe(4);
    expect(merged.srsCards['verb:bo']).toBeDefined();
  });
});

describe('LocalStorageAdapter, migrations, and JSON backup', () => {
  it('saves, loads, and clears progress via StorageAdapter', () => {
    const store = new Map<string, string>();
    const mockStorage = {
      getItem: (k: string) => store.get(k) ?? null,
      setItem: (k: string, v: string) => {
        store.set(k, v);
      },
      removeItem: (k: string) => {
        store.delete(k);
      },
      clear: () => store.clear(),
      key: () => null,
      length: 0,
    } as Storage;

    const adapter = new LocalStorageAdapter('test_key', mockStorage);
    const initial = adapter.load();
    expect(initial.schemaVersion).toBe(1);

    initial.xp = 99;
    adapter.save(initial);
    expect(adapter.load().xp).toBe(99);

    adapter.clear();
    expect(adapter.load().xp).toBe(0);
  });

  it('validates and migrates JSON backups', () => {
    const rich = createRichProgress();
    const parsed = parseProgressJson(JSON.stringify(rich));
    expect(parsed).toEqual(rich);

    expect(() => parseProgressJson('{bad json')).toThrow();
    expect(() => migrateProgress({ schemaVersion: 99 })).toThrow();
  });
});
