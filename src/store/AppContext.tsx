import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  type ReactNode,
} from 'react';
import {
  recordGrammarAttempt,
  recordXpAndStreak,
} from '../engine/mastery/tracker.ts';
import { createSrsCard, reviewSrsCard } from '../engine/srs/scheduler.ts';
import { LocalStorageAdapter, type StorageAdapter } from '../storage/adapter.ts';
import { mergeProgress } from '../storage/merge.ts';
import { createInitialProgress } from '../storage/migrations.ts';
import type { SrsGrade, UserProgress, UserSettings } from '../types/index.ts';

type AppAction =
  | {
      type: 'RECORD_ATTEMPT';
      tag: string;
      correct: boolean;
      xpDelta: number;
      nowMs: number;
    }
  | {
      type: 'COMPLETE_UNIT_PRACTICE';
      unitId: string;
      scorePercent: number;
      xpEarned: number;
      nowMs: number;
    }
  | {
      type: 'COMPLETE_UNIT_READER';
      unitId: string;
      xpEarned: number;
      nowMs: number;
    }
  | {
      type: 'ENROLL_WORDS';
      lexIds: string[];
      nowMs: number;
    }
  | {
      type: 'REVIEW_CARD';
      lexId: string;
      grade: SrsGrade;
      nowMs: number;
    }
  | {
      type: 'UPDATE_SETTINGS';
      patch: Partial<UserSettings>;
      nowMs: number;
    }
  | {
      type: 'APPLY_MERGED_PROGRESS';
      incoming: UserProgress;
      nowMs: number;
    }
  | {
      type: 'RESET_PROGRESS';
    };

function progressReducer(state: UserProgress, action: AppAction): UserProgress {
  switch (action.type) {
    case 'RECORD_ATTEMPT': {
      let next = recordGrammarAttempt(
        state,
        action.tag,
        action.correct,
        action.nowMs
      );
      if (action.xpDelta > 0) {
        next = recordXpAndStreak(next, action.xpDelta, action.nowMs);
      }
      return next;
    }

    case 'COMPLETE_UNIT_PRACTICE': {
      const prev = state.unitProgress[action.unitId];
      let next: UserProgress = {
        ...state,
        unitProgress: {
          ...state.unitProgress,
          [action.unitId]: {
            practiceBestScore: Math.max(
              prev?.practiceBestScore ?? 0,
              action.scorePercent
            ),
            practiceAttempts: (prev?.practiceAttempts ?? 0) + 1,
            readerPassed: prev?.readerPassed ?? false,
            lastStudiedAt: action.nowMs,
          },
        },
        updatedAt: action.nowMs,
      };
      if (action.xpEarned > 0) {
        next = recordXpAndStreak(next, action.xpEarned, action.nowMs);
      }
      return next;
    }

    case 'COMPLETE_UNIT_READER': {
      const prev = state.unitProgress[action.unitId];
      let next: UserProgress = {
        ...state,
        unitProgress: {
          ...state.unitProgress,
          [action.unitId]: {
            practiceBestScore: prev?.practiceBestScore ?? 0,
            practiceAttempts: prev?.practiceAttempts ?? 0,
            readerPassed: true,
            lastStudiedAt: action.nowMs,
          },
        },
        updatedAt: action.nowMs,
      };
      if (action.xpEarned > 0) {
        next = recordXpAndStreak(next, action.xpEarned, action.nowMs);
      }
      return next;
    }

    case 'ENROLL_WORDS': {
      let changed = false;
      const nextCards = { ...state.srsCards };
      for (const lexId of action.lexIds) {
        if (!nextCards[lexId]) {
          nextCards[lexId] = createSrsCard(lexId, action.nowMs);
          changed = true;
        }
      }
      if (!changed) return state;
      return {
        ...state,
        srsCards: nextCards,
        updatedAt: action.nowMs,
      };
    }

    case 'REVIEW_CARD': {
      const existing =
        state.srsCards[action.lexId] ?? createSrsCard(action.lexId, action.nowMs);
      const reviewed = reviewSrsCard(existing, action.grade, action.nowMs);
      const xpEarned = action.grade === 'again' ? 2 : 5;
      const withCard: UserProgress = {
        ...state,
        srsCards: {
          ...state.srsCards,
          [action.lexId]: reviewed,
        },
        updatedAt: action.nowMs,
      };
      return recordXpAndStreak(withCard, xpEarned, action.nowMs);
    }

    case 'UPDATE_SETTINGS': {
      return {
        ...state,
        settings: {
          ...state.settings,
          ...action.patch,
        },
        updatedAt: action.nowMs,
      };
    }

    case 'APPLY_MERGED_PROGRESS': {
      const merged = mergeProgress(state, action.incoming);
      return {
        ...merged,
        updatedAt: Math.max(merged.updatedAt, action.nowMs),
      };
    }

    case 'RESET_PROGRESS': {
      return createInitialProgress();
    }
  }
}

export interface AppContextValue {
  progress: UserProgress;
  recordAttempt: (tag: string, correct: boolean, xpDelta?: number) => void;
  completeUnitPractice: (
    unitId: string,
    scorePercent: number,
    xpEarned?: number
  ) => void;
  completeUnitReader: (unitId: string, xpEarned?: number) => void;
  enrollWords: (lexIds: string[]) => void;
  reviewCard: (lexId: string, grade: SrsGrade) => void;
  updateSettings: (patch: Partial<UserSettings>) => void;
  applyMergedProgress: (incoming: UserProgress) => void;
  resetProgress: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export interface AppProviderProps {
  children: ReactNode;
  adapter?: StorageAdapter;
}

export function AppProvider({ children, adapter }: AppProviderProps) {
  const adapterRef = useRef<StorageAdapter>(adapter ?? new LocalStorageAdapter());

  const [progress, dispatch] = useReducer(
    progressReducer,
    undefined,
    () => adapterRef.current.load()
  );

  useEffect(() => {
    adapterRef.current.save(progress);
  }, [progress]);

  const recordAttempt = useCallback(
    (tag: string, correct: boolean, xpDelta = 0) => {
      dispatch({
        type: 'RECORD_ATTEMPT',
        tag,
        correct,
        xpDelta,
        nowMs: Date.now(),
      });
    },
    []
  );

  const completeUnitPractice = useCallback(
    (unitId: string, scorePercent: number, xpEarned = 25) => {
      dispatch({
        type: 'COMPLETE_UNIT_PRACTICE',
        unitId,
        scorePercent,
        xpEarned,
        nowMs: Date.now(),
      });
    },
    []
  );

  const completeUnitReader = useCallback(
    (unitId: string, xpEarned = 15) => {
      dispatch({
        type: 'COMPLETE_UNIT_READER',
        unitId,
        xpEarned,
        nowMs: Date.now(),
      });
    },
    []
  );

  const enrollWords = useCallback((lexIds: string[]) => {
    dispatch({
      type: 'ENROLL_WORDS',
      lexIds,
      nowMs: Date.now(),
    });
  }, []);

  const reviewCard = useCallback((lexId: string, grade: SrsGrade) => {
    dispatch({
      type: 'REVIEW_CARD',
      lexId,
      grade,
      nowMs: Date.now(),
    });
  }, []);

  const updateSettings = useCallback((patch: Partial<UserSettings>) => {
    dispatch({
      type: 'UPDATE_SETTINGS',
      patch,
      nowMs: Date.now(),
    });
  }, []);

  const applyMergedProgress = useCallback((incoming: UserProgress) => {
    dispatch({
      type: 'APPLY_MERGED_PROGRESS',
      incoming,
      nowMs: Date.now(),
    });
  }, []);

  const resetProgress = useCallback(() => {
    adapterRef.current.clear();
    dispatch({ type: 'RESET_PROGRESS' });
  }, []);

  const value = useMemo<AppContextValue>(
    () => ({
      progress,
      recordAttempt,
      completeUnitPractice,
      completeUnitReader,
      enrollWords,
      reviewCard,
      updateSettings,
      applyMergedProgress,
      resetProgress,
    }),
    [
      progress,
      recordAttempt,
      completeUnitPractice,
      completeUnitReader,
      enrollWords,
      reviewCard,
      updateSettings,
      applyMergedProgress,
      resetProgress,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return ctx;
}
