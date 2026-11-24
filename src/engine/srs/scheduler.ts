import type { SrsCardState, SrsGrade } from '../../types/index.ts';

const DAY_MS = 24 * 60 * 60 * 1000;
const AGAIN_DELAY_MS = 5 * 60 * 1000;
const MIN_EASE = 1.3;
const MAX_EASE = 3.0;

export function createSrsCard(lexId: string, nowMs: number): SrsCardState {
  return {
    lexId,
    intervalDays: 0,
    ease: 2.5,
    reps: 0,
    lapses: 0,
    dueAt: nowMs,
    lastReviewedAt: 0,
    enrolledAt: nowMs,
  };
}

export function reviewSrsCard(
  card: SrsCardState,
  grade: SrsGrade,
  nowMs: number
): SrsCardState {
  if (grade === 'again') {
    const nextEase = Math.max(MIN_EASE, Number((card.ease - 0.2).toFixed(2)));
    return {
      ...card,
      intervalDays: 0,
      ease: nextEase,
      reps: 0,
      lapses: card.lapses + 1,
      dueAt: nowMs + AGAIN_DELAY_MS,
      lastReviewedAt: nowMs,
    };
  }

  const nextReps = card.reps + 1;

  if (grade === 'good') {
    let nextInterval: number;
    if (card.reps === 0 || card.intervalDays === 0) {
      nextInterval = 1;
    } else if (card.intervalDays === 1) {
      nextInterval = 4;
    } else {
      nextInterval = Math.max(
        card.intervalDays + 1,
        Math.round(card.intervalDays * card.ease)
      );
    }

    return {
      ...card,
      intervalDays: nextInterval,
      ease: Math.max(MIN_EASE, card.ease),
      reps: nextReps,
      dueAt: nowMs + nextInterval * DAY_MS,
      lastReviewedAt: nowMs,
    };
  }

  // grade === 'easy'
  const nextEase = Math.min(MAX_EASE, Number((card.ease + 0.15).toFixed(2)));
  let nextInterval: number;
  if (card.reps === 0 || card.intervalDays === 0) {
    nextInterval = 4;
  } else if (card.intervalDays === 1) {
    nextInterval = 6;
  } else {
    nextInterval = Math.max(
      card.intervalDays + 2,
      Math.round(card.intervalDays * nextEase * 1.3)
    );
  }

  return {
    ...card,
    intervalDays: nextInterval,
    ease: nextEase,
    reps: nextReps,
    dueAt: nowMs + nextInterval * DAY_MS,
    lastReviewedAt: nowMs,
  };
}

export function isProductionCard(card: SrsCardState): boolean {
  return card.intervalDays >= 4;
}

export function isLeechCard(card: SrsCardState): boolean {
  return card.lapses >= 4;
}

export function getDueSrsQueue(
  cards: Record<string, SrsCardState>,
  nowMs: number,
  newCap = 15,
  reviewCap = 60
): SrsCardState[] {
  const dueReviews: SrsCardState[] = [];
  const dueNew: SrsCardState[] = [];

  for (const card of Object.values(cards)) {
    if (card.dueAt > nowMs) continue;
    if (card.lastReviewedAt === 0 && card.reps === 0 && card.lapses === 0) {
      dueNew.push(card);
    } else {
      dueReviews.push(card);
    }
  }

  dueReviews.sort((a, b) => a.dueAt - b.dueAt || a.lexId.localeCompare(b.lexId));
  dueNew.sort((a, b) => a.enrolledAt - b.enrolledAt || a.lexId.localeCompare(b.lexId));

  return [
    ...dueReviews.slice(0, Math.max(0, reviewCap)),
    ...dueNew.slice(0, Math.max(0, newCap)),
  ];
}
