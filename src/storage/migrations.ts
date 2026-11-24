import type { UserProgress, UserSettings } from '../types/index.ts';

export const DEFAULT_SETTINGS: UserSettings = {
  dailyXpGoal: 50,
  srsNewCap: 15,
  srsReviewCap: 60,
  autoAdvance: false,
  darkMode: false,
  freeBrowse: false,
  iosInstallDismissed: false,
};

export function createInitialProgress(): UserProgress {
  return {
    schemaVersion: 1,
    xp: 0,
    streak: 0,
    freezes: 0,
    activeDates: [],
    unitProgress: {},
    srsCards: {},
    weakSkills: {},
    settings: { ...DEFAULT_SETTINGS },
    updatedAt: Date.now(),
  };
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function toFiniteNumber(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function toBoolean(value: unknown, fallback: boolean): boolean {
  return typeof value === 'boolean' ? value : fallback;
}

export function migrateProgress(raw: unknown): UserProgress {
  if (!isPlainObject(raw)) {
    throw new Error('Invalid progress data: expected an object');
  }

  if (
    'schemaVersion' in raw &&
    raw.schemaVersion !== undefined &&
    raw.schemaVersion !== 1
  ) {
    throw new Error(`Unsupported progress schemaVersion: ${String(raw.schemaVersion)}`);
  }

  const base = createInitialProgress();

  const rawSettings = isPlainObject(raw.settings) ? raw.settings : {};
  const settings: UserSettings = {
    dailyXpGoal: toFiniteNumber(rawSettings.dailyXpGoal, base.settings.dailyXpGoal),
    srsNewCap: toFiniteNumber(rawSettings.srsNewCap, base.settings.srsNewCap),
    srsReviewCap: toFiniteNumber(rawSettings.srsReviewCap, base.settings.srsReviewCap),
    autoAdvance: toBoolean(rawSettings.autoAdvance, base.settings.autoAdvance),
    darkMode: toBoolean(rawSettings.darkMode, base.settings.darkMode),
    freeBrowse: toBoolean(rawSettings.freeBrowse, base.settings.freeBrowse),
    iosInstallDismissed: toBoolean(
      rawSettings.iosInstallDismissed,
      base.settings.iosInstallDismissed
    ),
  };

  const activeDates = Array.isArray(raw.activeDates)
    ? Array.from(
        new Set(raw.activeDates.filter((d): d is string => typeof d === 'string'))
      ).sort()
    : [];

  const unitProgress: UserProgress['unitProgress'] = {};
  if (isPlainObject(raw.unitProgress)) {
    for (const [unitId, val] of Object.entries(raw.unitProgress)) {
      if (!isPlainObject(val)) continue;
      unitProgress[unitId] = {
        practiceBestScore: toFiniteNumber(val.practiceBestScore, 0),
        practiceAttempts: toFiniteNumber(val.practiceAttempts, 0),
        readerPassed: toBoolean(val.readerPassed, false),
        lastStudiedAt: toFiniteNumber(val.lastStudiedAt, 0),
      };
    }
  }

  const srsCards: UserProgress['srsCards'] = {};
  if (isPlainObject(raw.srsCards)) {
    for (const [key, val] of Object.entries(raw.srsCards)) {
      if (!isPlainObject(val)) continue;
      const lexId = typeof val.lexId === 'string' ? val.lexId : key;
      srsCards[lexId] = {
        lexId,
        intervalDays: toFiniteNumber(val.intervalDays, 0),
        ease: toFiniteNumber(val.ease, 2.5),
        reps: toFiniteNumber(val.reps, 0),
        lapses: toFiniteNumber(val.lapses, 0),
        dueAt: toFiniteNumber(val.dueAt, 0),
        lastReviewedAt: toFiniteNumber(val.lastReviewedAt, 0),
        enrolledAt: toFiniteNumber(val.enrolledAt, 0),
      };
    }
  }

  const weakSkills: UserProgress['weakSkills'] = {};
  if (isPlainObject(raw.weakSkills)) {
    for (const [key, val] of Object.entries(raw.weakSkills)) {
      if (!isPlainObject(val)) continue;
      const tag = typeof val.tag === 'string' ? val.tag : key;
      const recentResults = Array.isArray(val.recentResults)
        ? val.recentResults.filter((r): r is boolean => typeof r === 'boolean').slice(-20)
        : [];
      weakSkills[tag] = {
        tag,
        recentResults,
        updatedAt: toFiniteNumber(val.updatedAt, 0),
      };
    }
  }

  const result: UserProgress = {
    schemaVersion: 1,
    xp: Math.max(0, toFiniteNumber(raw.xp, 0)),
    streak: Math.max(0, toFiniteNumber(raw.streak, 0)),
    freezes: Math.min(2, Math.max(0, toFiniteNumber(raw.freezes, 0))),
    activeDates,
    ...(typeof raw.lastStreakCheckDate === 'string'
      ? { lastStreakCheckDate: raw.lastStreakCheckDate }
      : {}),
    unitProgress,
    srsCards,
    weakSkills,
    settings,
    updatedAt: toFiniteNumber(raw.updatedAt, base.updatedAt),
  };

  return result;
}
