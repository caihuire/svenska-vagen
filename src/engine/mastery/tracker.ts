import type { UserProgress, WeakSkillRecord } from '../../types/index.ts';

const DAY_MS = 24 * 60 * 60 * 1000;
const MAX_FREEZES = 2;
const WEAK_RING_SIZE = 20;
const REFRESH_DAYS = 45;

export function localDateKey(nowMs: number): string {
  const d = new Date(nowMs);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function calendarDaysBetween(fromKey: string, toKey: string): number {
  const [fy, fm, fd] = fromKey.split('-').map(Number);
  const [ty, tm, td] = toKey.split('-').map(Number);
  const fromUtc = Date.UTC(fy, fm - 1, fd);
  const toUtc = Date.UTC(ty, tm - 1, td);
  return Math.round((toUtc - fromUtc) / DAY_MS);
}

export function computeStreakFromActiveDates(activeDates: string[]): number {
  if (activeDates.length === 0) return 0;
  const sorted = Array.from(new Set(activeDates)).sort();
  let streak = 1;
  for (let i = sorted.length - 1; i > 0; i--) {
    const diff = calendarDaysBetween(sorted[i - 1], sorted[i]);
    if (diff === 1) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

export function recordXpAndStreak(
  progress: UserProgress,
  xpDelta: number,
  nowMs: number
): UserProgress {
  const nextXp = Math.max(0, progress.xp + xpDelta);
  if (xpDelta <= 0) {
    return {
      ...progress,
      xp: nextXp,
      updatedAt: nowMs,
    };
  }

  const today = localDateKey(nowMs);
  const activeDatesSet = new Set(progress.activeDates);
  activeDatesSet.add(today);
  const activeDates = Array.from(activeDatesSet).sort();

  const sortedExisting = [...progress.activeDates].sort();
  const lastDate =
    progress.lastStreakCheckDate ??
    (sortedExisting.length > 0 ? sortedExisting[sortedExisting.length - 1] : undefined);

  let nextStreak = progress.streak;
  let nextFreezes = progress.freezes;
  let nextLastCheck = lastDate;

  if (!lastDate) {
    nextStreak = 1;
    nextLastCheck = today;
  } else if (today === lastDate) {
    if (nextStreak === 0) {
      nextStreak = 1;
    }
    nextLastCheck = today;
  } else {
    const dayDiff = calendarDaysBetween(lastDate, today);
    if (dayDiff === 1) {
      nextStreak = progress.streak + 1;
      if (nextStreak > 0 && nextStreak % 7 === 0) {
        nextFreezes = Math.min(MAX_FREEZES, nextFreezes + 1);
      }
      nextLastCheck = today;
    } else if (dayDiff === 2 && progress.freezes > 0) {
      nextFreezes = progress.freezes - 1;
      nextStreak = progress.streak + 1;
      nextLastCheck = today;
    } else if (dayDiff > 0) {
      nextStreak = 1;
      nextLastCheck = today;
    }
  }

  return {
    ...progress,
    xp: nextXp,
    streak: nextStreak,
    freezes: nextFreezes,
    activeDates,
    lastStreakCheckDate: nextLastCheck,
    updatedAt: nowMs,
  };
}

export function recordGrammarAttempt(
  progress: UserProgress,
  tag: string,
  correct: boolean,
  nowMs: number = Date.now()
): UserProgress {
  const existing: WeakSkillRecord = progress.weakSkills[tag] ?? {
    tag,
    recentResults: [],
    updatedAt: 0,
  };

  const recentResults = [...existing.recentResults, correct].slice(-WEAK_RING_SIZE);

  return {
    ...progress,
    weakSkills: {
      ...progress.weakSkills,
      [tag]: {
        tag,
        recentResults,
        updatedAt: nowMs,
      },
    },
    updatedAt: nowMs,
  };
}

export function getWeakGrammarTags(
  progress: UserProgress
): { tag: string; accuracy: number; attempts: number }[] {
  const weak: { tag: string; accuracy: number; attempts: number }[] = [];

  for (const record of Object.values(progress.weakSkills)) {
    const attempts = record.recentResults.length;
    if (attempts < 5) continue;
    const correctCount = record.recentResults.filter(Boolean).length;
    const accuracy = correctCount / attempts;
    if (accuracy < 0.75) {
      weak.push({ tag: record.tag, accuracy, attempts });
    }
  }

  weak.sort((a, b) => a.accuracy - b.accuracy || b.attempts - a.attempts);
  return weak;
}

export function computeUnitMastery(
  unitId: string,
  unitLexIds: string[],
  progress: UserProgress,
  nowMs: number
): { tier: 0 | 1 | 2 | 3; needsRefresh: boolean } {
  const unitProg = progress.unitProgress[unitId];
  if (!unitProg || unitProg.practiceBestScore < 80) {
    return { tier: 0, needsRefresh: false };
  }

  if (!unitProg.readerPassed) {
    return { tier: 1, needsRefresh: false };
  }

  const enrolledCards = unitLexIds
    .map((lexId) => progress.srsCards[lexId])
    .filter((card): card is NonNullable<typeof card> => Boolean(card));

  if (enrolledCards.length === 0) {
    return { tier: 2, needsRefresh: false };
  }

  const productionCount = enrolledCards.filter(
    (card) => card.intervalDays >= 4
  ).length;

  if (productionCount / enrolledCards.length < 0.8) {
    return { tier: 2, needsRefresh: false };
  }

  const latestActivity = Math.max(
    unitProg.lastStudiedAt,
    ...enrolledCards.map((card) => card.lastReviewedAt)
  );
  const needsRefresh =
    latestActivity > 0 && nowMs - latestActivity > REFRESH_DAYS * DAY_MS;

  return { tier: 3, needsRefresh };
}
