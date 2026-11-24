import { computeStreakFromActiveDates } from '../engine/mastery/tracker.ts';
import type {
  SrsCardState,
  SyncDiff,
  UnitProgress,
  UserProgress,
  WeakSkillRecord,
} from '../types/index.ts';

function pickNewerCard(local: SrsCardState, incoming: SrsCardState): SrsCardState {
  if (incoming.lastReviewedAt !== local.lastReviewedAt) {
    return incoming.lastReviewedAt > local.lastReviewedAt ? incoming : local;
  }
  if (incoming.reps !== local.reps) {
    return incoming.reps > local.reps ? incoming : local;
  }
  return incoming.enrolledAt > local.enrolledAt ? incoming : local;
}

function mergeUnitEntry(local: UnitProgress, incoming: UnitProgress): UnitProgress {
  return {
    practiceBestScore: Math.max(local.practiceBestScore, incoming.practiceBestScore),
    practiceAttempts: Math.max(local.practiceAttempts, incoming.practiceAttempts),
    readerPassed: local.readerPassed || incoming.readerPassed,
    lastStudiedAt: Math.max(local.lastStudiedAt, incoming.lastStudiedAt),
  };
}

function pickWeakSkill(
  local: WeakSkillRecord,
  incoming: WeakSkillRecord
): WeakSkillRecord {
  if (incoming.updatedAt !== local.updatedAt) {
    return incoming.updatedAt > local.updatedAt ? incoming : local;
  }
  return incoming.recentResults.length > local.recentResults.length
    ? incoming
    : local;
}

export function mergeProgress(
  local: UserProgress,
  incoming: UserProgress
): UserProgress {
  const activeDates = Array.from(
    new Set([...local.activeDates, ...incoming.activeDates])
  ).sort();

  const streak = computeStreakFromActiveDates(activeDates);
  const lastStreakCheckDate =
    activeDates.length > 0 ? activeDates[activeDates.length - 1] : undefined;

  const unitProgress: Record<string, UnitProgress> = {};
  const allUnitIds = new Set([
    ...Object.keys(local.unitProgress),
    ...Object.keys(incoming.unitProgress),
  ]);
  for (const unitId of allUnitIds) {
    const a = local.unitProgress[unitId];
    const b = incoming.unitProgress[unitId];
    if (a && b) {
      unitProgress[unitId] = mergeUnitEntry(a, b);
    } else {
      unitProgress[unitId] = { ...(a ?? b) };
    }
  }

  const srsCards: Record<string, SrsCardState> = {};
  const allLexIds = new Set([
    ...Object.keys(local.srsCards),
    ...Object.keys(incoming.srsCards),
  ]);
  for (const lexId of allLexIds) {
    const a = local.srsCards[lexId];
    const b = incoming.srsCards[lexId];
    if (a && b) {
      srsCards[lexId] = { ...pickNewerCard(a, b) };
    } else {
      srsCards[lexId] = { ...(a ?? b) };
    }
  }

  const weakSkills: Record<string, WeakSkillRecord> = {};
  const allTags = new Set([
    ...Object.keys(local.weakSkills),
    ...Object.keys(incoming.weakSkills),
  ]);
  for (const tag of allTags) {
    const a = local.weakSkills[tag];
    const b = incoming.weakSkills[tag];
    if (a && b) {
      const picked = pickWeakSkill(a, b);
      weakSkills[tag] = { ...picked, recentResults: [...picked.recentResults] };
    } else {
      const single = a ?? b;
      weakSkills[tag] = { ...single, recentResults: [...single.recentResults] };
    }
  }

  const settings =
    incoming.updatedAt > local.updatedAt
      ? { ...incoming.settings }
      : { ...local.settings };

  return {
    schemaVersion: 1,
    xp: Math.max(local.xp, incoming.xp),
    streak,
    freezes: Math.min(2, Math.max(local.freezes, incoming.freezes)),
    activeDates,
    ...(lastStreakCheckDate ? { lastStreakCheckDate } : {}),
    unitProgress,
    srsCards,
    weakSkills,
    settings,
    updatedAt: Math.max(local.updatedAt, incoming.updatedAt),
  };
}

export function computeSyncDiff(
  local: UserProgress,
  incoming: UserProgress
): SyncDiff {
  let newSrsCards = 0;
  let updatedSrsCards = 0;

  for (const [lexId, incCard] of Object.entries(incoming.srsCards)) {
    const locCard = local.srsCards[lexId];
    if (!locCard) {
      newSrsCards++;
    } else if (incCard.lastReviewedAt > locCard.lastReviewedAt) {
      updatedSrsCards++;
    }
  }

  let updatedUnits = 0;
  for (const [unitId, incUnit] of Object.entries(incoming.unitProgress)) {
    const locUnit = local.unitProgress[unitId];
    if (!locUnit) {
      updatedUnits++;
    } else if (
      incUnit.practiceBestScore > locUnit.practiceBestScore ||
      incUnit.practiceAttempts > locUnit.practiceAttempts ||
      (incUnit.readerPassed && !locUnit.readerPassed)
    ) {
      updatedUnits++;
    }
  }

  const localDateSet = new Set(local.activeDates);
  const newActiveDates = incoming.activeDates.filter(
    (d) => !localDateSet.has(d)
  ).length;

  return {
    newSrsCards,
    updatedSrsCards,
    updatedUnits,
    xpDelta: Math.max(0, incoming.xp - local.xp),
    newActiveDates,
  };
}
