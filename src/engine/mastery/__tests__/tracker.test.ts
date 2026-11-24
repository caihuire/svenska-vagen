import { describe, expect, it } from 'vitest';
import type { UserProgress } from '../../../types/index.ts';
import {
  computeUnitMastery,
  getWeakGrammarTags,
  localDateKey,
  recordGrammarAttempt,
  recordXpAndStreak,
} from '../tracker.ts';

const DAY_MS = 24 * 60 * 60 * 1000;

function makeProgress(overrides: Partial<UserProgress> = {}): UserProgress {
  return {
    schemaVersion: 1,
    xp: 0,
    streak: 0,
    freezes: 0,
    activeDates: [],
    unitProgress: {},
    srsCards: {},
    weakSkills: {},
    settings: {
      dailyXpGoal: 50,
      srsNewCap: 15,
      srsReviewCap: 60,
      autoAdvance: false,
      darkMode: false,
      freeBrowse: false,
      iosInstallDismissed: false,
    },
    updatedAt: 0,
    ...overrides,
  };
}

describe('mastery & streak tracker', () => {
  it('formats localDateKey as YYYY-MM-DD', () => {
    const d = new Date(2026, 10, 24, 15, 30, 0).getTime();
    expect(localDateKey(d)).toBe('2026-11-24');
  });

  it('increments streak on consecutive days, earns freeze every 7 days capped at 2, and consumes freeze on 1 missed day', () => {
    let p = makeProgress();
    const day0 = new Date(2026, 10, 1, 12, 0, 0).getTime();

    // 14 consecutive days -> streak 14, freezes = 2 (earned at day 7 and day 14)
    for (let i = 0; i < 14; i++) {
      p = recordXpAndStreak(p, 20, day0 + i * DAY_MS);
    }
    expect(p.xp).toBe(280);
    expect(p.streak).toBe(14);
    expect(p.freezes).toBe(2);
    expect(p.activeDates).toHaveLength(14);

    // 7 more consecutive days -> freezes stays capped at 2
    for (let i = 14; i < 21; i++) {
      p = recordXpAndStreak(p, 10, day0 + i * DAY_MS);
    }
    expect(p.streak).toBe(21);
    expect(p.freezes).toBe(2);

    // Multiple XP events on same day do not double-increment streak
    p = recordXpAndStreak(p, 15, day0 + 20 * DAY_MS + 3600_000);
    expect(p.streak).toBe(21);
    expect(p.activeDates).toHaveLength(21);

    // Skip 1 day (day 21 missed, resume on day 22) -> consumes 1 freeze, streak increments to 22
    p = recordXpAndStreak(p, 10, day0 + 22 * DAY_MS);
    expect(p.freezes).toBe(1);
    expect(p.streak).toBe(22);

    // Skip 2 consecutive days (day 23 and 24 missed, resume on day 25) -> streak resets to 1
    p = recordXpAndStreak(p, 10, day0 + 25 * DAY_MS);
    expect(p.streak).toBe(1);
  });

  it('maintains a max-20 ring buffer per grammarTag and flags weak tags (<75% with >=5 attempts)', () => {
    let p = makeProgress();

    // 4 incorrect attempts: < 5 attempts so not flagged yet
    for (let i = 0; i < 4; i++) {
      p = recordGrammarAttempt(p, 'v2-order', false);
    }
    expect(getWeakGrammarTags(p)).toEqual([]);

    // 5th incorrect attempt: now >= 5 attempts & 0% accuracy -> flagged
    p = recordGrammarAttempt(p, 'v2-order', false);
    expect(getWeakGrammarTags(p)).toEqual([
      { tag: 'v2-order', accuracy: 0, attempts: 5 },
    ]);

    // Add 20 correct attempts -> ring buffer evicts old failures, capped at 20
    for (let i = 0; i < 20; i++) {
      p = recordGrammarAttempt(p, 'v2-order', true);
    }
    expect(p.weakSkills['v2-order'].recentResults).toHaveLength(20);
    expect(getWeakGrammarTags(p)).toEqual([]);

    // Mixed tag: 2/5 = 40% (< 75%)
    for (const ok of [true, false, true, false, false]) {
      p = recordGrammarAttempt(p, 'en-ett', ok);
    }
    expect(getWeakGrammarTags(p)).toEqual([
      { tag: 'en-ett', accuracy: 0.4, attempts: 5 },
    ]);
  });

  it('computes Unit Mastery Tiers 0 -> 1 -> 2 -> 3 and 45-day needsRefresh', () => {
    const now = new Date('2026-11-24T12:00:00Z').getTime();
    const unitLexIds = ['noun:a', 'noun:b', 'noun:c', 'noun:d', 'noun:e'];

    let p = makeProgress();
    expect(computeUnitMastery('u01', unitLexIds, p, now)).toEqual({
      tier: 0,
      needsRefresh: false,
    });

    // Practice < 80% stays Tier 0
    p.unitProgress['u01'] = {
      practiceBestScore: 79,
      practiceAttempts: 1,
      readerPassed: true,
      lastStudiedAt: now,
    };
    expect(computeUnitMastery('u01', unitLexIds, p, now)).toEqual({
      tier: 0,
      needsRefresh: false,
    });

    // Practice >= 80%, reader false -> Tier 1
    p.unitProgress['u01'] = {
      practiceBestScore: 80,
      practiceAttempts: 1,
      readerPassed: false,
      lastStudiedAt: now,
    };
    expect(computeUnitMastery('u01', unitLexIds, p, now)).toEqual({
      tier: 1,
      needsRefresh: false,
    });

    // Reader passed -> Tier 2 (if <80% enrolled words at interval >= 4d)
    p.unitProgress['u01'].readerPassed = true;
    p.srsCards['noun:a'] = {
      lexId: 'noun:a',
      intervalDays: 4,
      ease: 2.5,
      reps: 2,
      lapses: 0,
      dueAt: now + DAY_MS,
      lastReviewedAt: now,
      enrolledAt: now - 5 * DAY_MS,
    };
    p.srsCards['noun:b'] = {
      lexId: 'noun:b',
      intervalDays: 1,
      ease: 2.5,
      reps: 1,
      lapses: 0,
      dueAt: now + DAY_MS,
      lastReviewedAt: now,
      enrolledAt: now - 5 * DAY_MS,
    };
    expect(computeUnitMastery('u01', unitLexIds, p, now)).toEqual({
      tier: 2,
      needsRefresh: false,
    });

    // 4 of 5 enrolled words (80%) at interval >= 4d -> Tier 3
    for (const id of ['noun:b', 'noun:c', 'noun:d']) {
      p.srsCards[id] = {
        lexId: id,
        intervalDays: 4,
        ease: 2.5,
        reps: 2,
        lapses: 0,
        dueAt: now + DAY_MS,
        lastReviewedAt: now,
        enrolledAt: now - 5 * DAY_MS,
      };
    }
    expect(computeUnitMastery('u01', unitLexIds, p, now)).toEqual({
      tier: 3,
      needsRefresh: false,
    });

    // >45 days stale -> needsRefresh: true
    const staleNow = now + 46 * DAY_MS;
    expect(computeUnitMastery('u01', unitLexIds, p, staleNow)).toEqual({
      tier: 3,
      needsRefresh: true,
    });
  });
});
