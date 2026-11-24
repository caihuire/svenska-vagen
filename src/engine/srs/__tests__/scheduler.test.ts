import { describe, expect, it } from 'vitest';
import type { SrsCardState } from '../../../types/index.ts';
import {
  createSrsCard,
  getDueSrsQueue,
  isLeechCard,
  isProductionCard,
  reviewSrsCard,
} from '../scheduler.ts';

const DAY_MS = 24 * 60 * 60 * 1000;
const BASE_NOW = new Date('2026-11-24T10:00:00Z').getTime();

describe('SRS scheduler', () => {
  it('creates a new card due immediately at nowMs', () => {
    const card = createSrsCard('noun:bok', BASE_NOW);
    expect(card).toEqual({
      lexId: 'noun:bok',
      intervalDays: 0,
      ease: 2.5,
      reps: 0,
      lapses: 0,
      dueAt: BASE_NOW,
      lastReviewedAt: 0,
      enrolledAt: BASE_NOW,
    });
    expect(isProductionCard(card)).toBe(false);
    expect(isLeechCard(card)).toBe(false);
  });

  it('progresses good reviews 1d -> 4d -> round(interval * ease) and promotes to production at >=4d', () => {
    let card = createSrsCard('noun:bil', BASE_NOW);

    card = reviewSrsCard(card, 'good', BASE_NOW);
    expect(card.intervalDays).toBe(1);
    expect(card.reps).toBe(1);
    expect(card.dueAt).toBe(BASE_NOW + 1 * DAY_MS);
    expect(isProductionCard(card)).toBe(false);

    const t2 = BASE_NOW + 1 * DAY_MS;
    card = reviewSrsCard(card, 'good', t2);
    expect(card.intervalDays).toBe(4);
    expect(card.reps).toBe(2);
    expect(card.dueAt).toBe(t2 + 4 * DAY_MS);
    expect(isProductionCard(card)).toBe(true);

    const t3 = t2 + 4 * DAY_MS;
    card = reviewSrsCard(card, 'good', t3);
    expect(card.intervalDays).toBe(10); // Math.round(4 * 2.5)
    expect(card.reps).toBe(3);
    expect(card.dueAt).toBe(t3 + 10 * DAY_MS);
  });

  it('boosts interval and ease on easy reviews', () => {
    const card = createSrsCard('verb:resa', BASE_NOW);
    const easy1 = reviewSrsCard(card, 'easy', BASE_NOW);
    expect(easy1.ease).toBeGreaterThan(2.5);
    expect(easy1.intervalDays).toBeGreaterThanOrEqual(4);
    expect(isProductionCard(easy1)).toBe(true);

    const easy2 = reviewSrsCard(easy1, 'easy', BASE_NOW + easy1.intervalDays * DAY_MS);
    expect(easy2.ease).toBeGreaterThan(easy1.ease);
    expect(easy2.intervalDays).toBeGreaterThan(Math.round(easy1.intervalDays * easy1.ease));
  });

  it('resets interval to <10m, increments lapses, drops ease (min 1.3), and flags leech at 4 lapses', () => {
    let card = createSrsCard('noun:fönster', BASE_NOW);
    card = reviewSrsCard(card, 'good', BASE_NOW);
    card = reviewSrsCard(card, 'good', BASE_NOW + DAY_MS);
    expect(card.intervalDays).toBe(4);

    let t = BASE_NOW + 5 * DAY_MS;
    for (let i = 1; i <= 3; i++) {
      card = reviewSrsCard(card, 'again', t);
      expect(card.intervalDays).toBe(0);
      expect(card.reps).toBe(0);
      expect(card.lapses).toBe(i);
      expect(card.dueAt - t).toBeGreaterThan(0);
      expect(card.dueAt - t).toBeLessThan(10 * 60 * 1000);
      expect(isLeechCard(card)).toBe(false);
      t += 6 * 60 * 1000;
    }

    card = reviewSrsCard(card, 'again', t);
    expect(card.lapses).toBe(4);
    expect(isLeechCard(card)).toBe(true);

    // Ease never drops below 1.3 even after many lapses
    for (let i = 0; i < 10; i++) {
      t += 6 * 60 * 1000;
      card = reviewSrsCard(card, 'again', t);
    }
    expect(card.ease).toBe(1.3);
  });

  it('enforces daily newCap (15) and reviewCap (60) and excludes non-due cards', () => {
    const cards: Record<string, SrsCardState> = {};

    for (let i = 0; i < 20; i++) {
      const id = `new:${i}`;
      cards[id] = createSrsCard(id, BASE_NOW - 1000 + i);
    }
    for (let i = 0; i < 70; i++) {
      const id = `rev:${i}`;
      cards[id] = {
        lexId: id,
        intervalDays: 2,
        ease: 2.5,
        reps: 2,
        lapses: 0,
        dueAt: BASE_NOW - (70 - i) * 1000,
        lastReviewedAt: BASE_NOW - 2 * DAY_MS,
        enrolledAt: BASE_NOW - 10 * DAY_MS,
      };
    }
    cards['future:1'] = {
      lexId: 'future:1',
      intervalDays: 4,
      ease: 2.5,
      reps: 2,
      lapses: 0,
      dueAt: BASE_NOW + DAY_MS,
      lastReviewedAt: BASE_NOW - DAY_MS,
      enrolledAt: BASE_NOW - 5 * DAY_MS,
    };

    const queue = getDueSrsQueue(cards, BASE_NOW, 15, 60);
    expect(queue).toHaveLength(75);
    expect(queue.filter((c) => c.lastReviewedAt === 0)).toHaveLength(15);
    expect(queue.filter((c) => c.lastReviewedAt > 0)).toHaveLength(60);
    expect(queue.some((c) => c.lexId === 'future:1')).toBe(false);
  });
});
