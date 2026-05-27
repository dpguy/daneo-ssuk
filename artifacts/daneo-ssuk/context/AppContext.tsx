import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import { getWordById, Review, SavedWord, Word } from "@/constants/mockData";

// ── Types ──────────────────────────────────────────────────────────────────────

interface AppState {
  savedWords: SavedWord[];
  reviews: Review[];
  customWords: Word[];
  streak: number;
  totalLearned: number;
  todayCount: number;
  completedUnits: string[];
  lastActiveDate: string | null;
  onboardingDone: boolean;
  isLoaded: boolean;
  isLoggedIn: boolean;
  userEmail: string | null;
  displayName: string | null;
  // Per-day history (date string "YYYY-MM-DD" → count)
  dailyWords: Record<string, number>;
  dailyReviews: Record<string, number>;
}

interface AppContextType extends AppState {
  saveWord: (wordId: string) => Promise<void>;
  unsaveWord: (wordId: string) => Promise<void>;
  isWordSaved: (wordId: string) => boolean;
  addReview: (wordId: string) => Promise<void>;
  updateReview: (wordId: string, difficulty: "easy" | "hard" | "forgot") => Promise<void>;
  getTodayReviews: () => Review[];
  getUpcomingReviews: () => Review[];
  markUnitComplete: (grade: number, unit: number) => Promise<void>;
  isUnitComplete: (grade: number, unit: number) => boolean;
  completeOnboarding: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  // Custom word CRUD
  saveCustomWord: (word: Word) => Promise<void>;
  updateCustomWord: (id: string, fields: Partial<Word>) => Promise<void>;
  deleteCustomWord: (id: string) => Promise<void>;
  /** Looks up a word by ID in the dataset first, then in customWords. */
  findWord: (id: string) => Word | undefined;
  // Reset helpers (dev / debug tools)
  resetSavedWords: () => Promise<void>;
  resetReviews: () => Promise<void>;
  resetCustomWords: () => Promise<void>;
  resetStudyProgress: () => Promise<void>;
  resetAll: () => Promise<void>;
}

// ── Spaced Repetition ─────────────────────────────────────────────────────────

function getNextInterval(
  difficulty: "easy" | "hard" | "forgot",
  current: Review
): number {
  const { interval, repetitions } = current;
  if (difficulty === "forgot") return 1;
  if (difficulty === "hard") return Math.max(1, Math.floor(interval * 1.2));
  if (repetitions === 0) return 1;
  if (repetitions === 1) return 3;
  if (repetitions === 2) return 7;
  if (repetitions === 3) return 14;
  return 30;
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function today(): string {
  return new Date().toISOString().split("T")[0];
}

// ── Storage keys ──────────────────────────────────────────────────────────────

const KEYS = {
  savedWords: "dss:savedWords",
  reviews: "dss:reviews",
  customWords: "dss:customWords",
  streak: "dss:streak",
  totalLearned: "dss:totalLearned",
  todayCount: "dss:todayCount",
  completedUnits: "dss:completedUnits",
  lastActiveDate: "dss:lastActiveDate",
  onboardingDone: "dss:onboardingDone",
  dailyWords: "dss:dailyWords",
  dailyReviews: "dss:dailyReviews",
};

async function load<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

async function save(key: string, value: unknown): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch {
    // AsyncStorage write failed; state is already updated in memory for this session.
    // On next cold start the old persisted value will be loaded — acceptable for MVP.
  }
}

// ── Context ───────────────────────────────────────────────────────────────────

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>({
    savedWords: [],
    reviews: [],
    customWords: [],
    streak: 0,
    totalLearned: 0,
    todayCount: 0,
    completedUnits: [],
    lastActiveDate: null,
    onboardingDone: false,
    isLoaded: false,
    isLoggedIn: false,
    userEmail: null,
    displayName: null,
    dailyWords: {},
    dailyReviews: {},
  });

  useEffect(() => {
    (async () => {
      const [
        savedWords,
        reviews,
        customWords,
        streak,
        totalLearned,
        todayCount,
        completedUnits,
        lastActiveDate,
        onboardingDone,
        dailyWords,
        dailyReviews,
      ] = await Promise.all([
        load<SavedWord[]>(KEYS.savedWords, []),
        load<Review[]>(KEYS.reviews, []),
        load<Word[]>(KEYS.customWords, []),
        load<number>(KEYS.streak, 0),
        load<number>(KEYS.totalLearned, 0),
        load<number>(KEYS.todayCount, 0),
        load<string[]>(KEYS.completedUnits, []),
        load<string | null>(KEYS.lastActiveDate, null),
        load<boolean>(KEYS.onboardingDone, false),
        load<Record<string, number>>(KEYS.dailyWords, {}),
        load<Record<string, number>>(KEYS.dailyReviews, {}),
      ]);

      const todayStr = today();
      let newStreak = streak;
      if (lastActiveDate) {
        const last = new Date(lastActiveDate);
        const now = new Date(todayStr);
        const diff = Math.floor((now.getTime() - last.getTime()) / 86400000);
        if (diff > 1) newStreak = 0;
      }

      const newTodayCount = lastActiveDate === todayStr ? todayCount : 0;

      setState((prev) => ({
        ...prev,
        savedWords,
        reviews,
        customWords,
        streak: newStreak,
        totalLearned,
        todayCount: newTodayCount,
        completedUnits,
        lastActiveDate,
        onboardingDone,
        isLoaded: true,
        dailyWords,
        dailyReviews,
      }));
    })();
  }, []);

  const completeOnboarding = useCallback(async () => {
    setState((prev) => ({ ...prev, onboardingDone: true }));
    await save(KEYS.onboardingDone, true);
  }, []);

  const saveWord = useCallback(
    async (wordId: string) => {
      const already = state.savedWords.find((s) => s.wordId === wordId);
      if (already) return;
      const newSaved: SavedWord = { wordId, savedAt: new Date().toISOString() };
      const updated = [...state.savedWords, newSaved];
      setState((prev) => ({ ...prev, savedWords: updated }));
      await save(KEYS.savedWords, updated);
    },
    [state.savedWords]
  );

  const unsaveWord = useCallback(
    async (wordId: string) => {
      const updated = state.savedWords.filter((s) => s.wordId !== wordId);
      setState((prev) => ({ ...prev, savedWords: updated }));
      await save(KEYS.savedWords, updated);
    },
    [state.savedWords]
  );

  const isWordSaved = useCallback(
    (wordId: string) => state.savedWords.some((s) => s.wordId === wordId),
    [state.savedWords]
  );

  const addReview = useCallback(
    async (wordId: string) => {
      const exists = state.reviews.find((r) => r.wordId === wordId);
      if (exists) return;

      const newReview: Review = {
        wordId,
        nextReview: addDays(new Date(), 1).toISOString(),
        interval: 1,
        easeFactor: 2.5,
        repetitions: 0,
      };

      const todayStr = today();
      const newTodayCount = state.lastActiveDate === todayStr ? state.todayCount + 1 : 1;
      const newStreak = state.lastActiveDate === todayStr ? state.streak : state.streak + 1;
      const newTotal = state.totalLearned + 1;
      const updatedReviews = [...state.reviews, newReview];

      // Track daily word count
      const updatedDailyWords = {
        ...state.dailyWords,
        [todayStr]: (state.dailyWords[todayStr] ?? 0) + 1,
      };

      setState((prev) => ({
        ...prev,
        reviews: updatedReviews,
        todayCount: newTodayCount,
        streak: newStreak,
        totalLearned: newTotal,
        lastActiveDate: todayStr,
        dailyWords: updatedDailyWords,
      }));

      await Promise.all([
        save(KEYS.reviews, updatedReviews),
        save(KEYS.todayCount, newTodayCount),
        save(KEYS.streak, newStreak),
        save(KEYS.totalLearned, newTotal),
        save(KEYS.lastActiveDate, todayStr),
        save(KEYS.dailyWords, updatedDailyWords),
      ]);
    },
    [state]
  );

  const updateReview = useCallback(
    async (wordId: string, difficulty: "easy" | "hard" | "forgot") => {
      const review = state.reviews.find((r) => r.wordId === wordId);
      if (!review) return;

      const nextInterval = getNextInterval(difficulty, review);
      const newRep = difficulty === "forgot" ? 0 : review.repetitions + 1;

      const updated = state.reviews.map((r) =>
        r.wordId === wordId
          ? {
              ...r,
              interval: nextInterval,
              repetitions: newRep,
              nextReview: addDays(new Date(), nextInterval).toISOString(),
            }
          : r
      );

      // Track daily review completions
      const todayStr = today();
      const updatedDailyReviews = {
        ...state.dailyReviews,
        [todayStr]: (state.dailyReviews[todayStr] ?? 0) + 1,
      };

      setState((prev) => ({
        ...prev,
        reviews: updated,
        dailyReviews: updatedDailyReviews,
      }));
      await Promise.all([
        save(KEYS.reviews, updated),
        save(KEYS.dailyReviews, updatedDailyReviews),
      ]);
    },
    [state.reviews, state.dailyReviews]
  );

  const getTodayReviews = useCallback((): Review[] => {
    const todayStr = today();
    return state.reviews.filter(
      (r) => new Date(r.nextReview).toISOString().split("T")[0] <= todayStr
    );
  }, [state.reviews]);

  const getUpcomingReviews = useCallback((): Review[] => {
    const todayStr = today();
    return state.reviews
      .filter((r) => new Date(r.nextReview).toISOString().split("T")[0] > todayStr)
      .sort((a, b) => a.nextReview.localeCompare(b.nextReview));
  }, [state.reviews]);

  const markUnitComplete = useCallback(
    async (grade: number, unit: number) => {
      const key = `${grade}-${unit}`;
      if (state.completedUnits.includes(key)) return;
      const updated = [...state.completedUnits, key];
      setState((prev) => ({ ...prev, completedUnits: updated }));
      await save(KEYS.completedUnits, updated);
    },
    [state.completedUnits]
  );

  const isUnitComplete = useCallback(
    (grade: number, unit: number) => state.completedUnits.includes(`${grade}-${unit}`),
    [state.completedUnits]
  );

  const signIn = useCallback(
    async (_email: string, _password: string): Promise<{ error: string | null }> => {
      return { error: "Supabase 연결 후 사용 가능합니다" };
    },
    []
  );

  const signUp = useCallback(
    async (_email: string, _password: string): Promise<{ error: string | null }> => {
      return { error: "Supabase 연결 후 사용 가능합니다" };
    },
    []
  );

  const signOut = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoggedIn: false, userEmail: null, displayName: null }));
  }, []);

  // ── Custom word CRUD ────────────────────────────────────────────────────────

  /**
   * Saves a brand-new custom word to AsyncStorage, and simultaneously
   * adds it to the user's saved words and review schedule.
   */
  const saveCustomWord = useCallback(
    async (word: Word) => {
      // Prevent duplicate saves
      if (state.customWords.some((w) => w.id === word.id)) return;

      const updatedCustom = [...state.customWords, word];

      // Also add to savedWords so it appears in "저장됨" immediately
      const alreadySaved = state.savedWords.some((s) => s.wordId === word.id);
      const updatedSaved = alreadySaved
        ? state.savedWords
        : [...state.savedWords, { wordId: word.id, savedAt: new Date().toISOString() }];

      // Also add to review schedule so it appears in memorization queues
      const alreadyReviewed = state.reviews.some((r) => r.wordId === word.id);
      const newReview: Review = {
        wordId: word.id,
        nextReview: addDays(new Date(), 1).toISOString(),
        interval: 1,
        easeFactor: 2.5,
        repetitions: 0,
      };
      const updatedReviews = alreadyReviewed ? state.reviews : [...state.reviews, newReview];

      // Update stats
      const todayStr = today();
      const newTotal = alreadyReviewed ? state.totalLearned : state.totalLearned + 1;
      const newStreak = state.lastActiveDate === todayStr ? state.streak : state.streak + 1;
      const newTodayCount = state.lastActiveDate === todayStr ? state.todayCount + 1 : 1;
      const updatedDailyWords = {
        ...state.dailyWords,
        [todayStr]: (state.dailyWords[todayStr] ?? 0) + 1,
      };

      setState((prev) => ({
        ...prev,
        customWords: updatedCustom,
        savedWords: updatedSaved,
        reviews: updatedReviews,
        totalLearned: newTotal,
        streak: newStreak,
        todayCount: newTodayCount,
        lastActiveDate: todayStr,
        dailyWords: updatedDailyWords,
      }));

      await Promise.all([
        save(KEYS.customWords, updatedCustom),
        save(KEYS.savedWords, updatedSaved),
        save(KEYS.reviews, updatedReviews),
        save(KEYS.totalLearned, newTotal),
        save(KEYS.streak, newStreak),
        save(KEYS.todayCount, newTodayCount),
        save(KEYS.lastActiveDate, todayStr),
        save(KEYS.dailyWords, updatedDailyWords),
      ]);
    },
    [state]
  );

  /**
   * Updates specific fields of an existing custom word (e.g. meaning, example, memoryTip).
   */
  const updateCustomWord = useCallback(
    async (id: string, fields: Partial<Word>) => {
      const updated = state.customWords.map((w) =>
        w.id === id ? { ...w, ...fields } : w
      );
      setState((prev) => ({ ...prev, customWords: updated }));
      await save(KEYS.customWords, updated);
    },
    [state.customWords]
  );

  /**
   * Removes a custom word and atomically cascades the deletion to savedWords and reviews
   * so the word disappears from the Search saved tab and Review queue immediately.
   */
  const deleteCustomWord = useCallback(
    async (id: string) => {
      const updatedCustom = state.customWords.filter((w) => w.id !== id);
      const updatedSaved = state.savedWords.filter((s) => s.wordId !== id);
      const updatedReviews = state.reviews.filter((r) => r.wordId !== id);
      setState((prev) => ({
        ...prev,
        customWords: updatedCustom,
        savedWords: updatedSaved,
        reviews: updatedReviews,
      }));
      await Promise.all([
        save(KEYS.customWords, updatedCustom),
        save(KEYS.savedWords, updatedSaved),
        save(KEYS.reviews, updatedReviews),
      ]);
    },
    [state.customWords, state.savedWords, state.reviews]
  );

  /**
   * Looks up a word by ID — checks the dataset first, then custom words.
   * Use this instead of getWordById in any screen that should support custom words.
   */
  const findWord = useCallback(
    (id: string): Word | undefined =>
      getWordById(id) ?? state.customWords.find((w) => w.id === id),
    [state.customWords]
  );

  // ── Reset helpers (developer / debug tools) ────────────────────────────────

  const resetSavedWords = useCallback(async () => {
    setState((prev) => ({ ...prev, savedWords: [] }));
    await save(KEYS.savedWords, []);
  }, []);

  const resetReviews = useCallback(async () => {
    setState((prev) => ({ ...prev, reviews: [] }));
    await save(KEYS.reviews, []);
  }, []);

  /** Clears custom words and cascades to any related savedWords/reviews entries. */
  const resetCustomWords = useCallback(async () => {
    const nonCustomSaved = state.savedWords.filter((s) => !s.wordId.startsWith("custom_"));
    const nonCustomReviews = state.reviews.filter((r) => !r.wordId.startsWith("custom_"));
    setState((prev) => ({
      ...prev,
      customWords: [],
      savedWords: nonCustomSaved,
      reviews: nonCustomReviews,
    }));
    await Promise.all([
      save(KEYS.customWords, []),
      save(KEYS.savedWords, nonCustomSaved),
      save(KEYS.reviews, nonCustomReviews),
    ]);
  }, [state.savedWords, state.reviews]);

  const resetStudyProgress = useCallback(async () => {
    setState((prev) => ({
      ...prev,
      streak: 0,
      totalLearned: 0,
      todayCount: 0,
      completedUnits: [],
      lastActiveDate: null,
      dailyWords: {},
      dailyReviews: {},
    }));
    await Promise.all([
      save(KEYS.streak, 0),
      save(KEYS.totalLearned, 0),
      save(KEYS.todayCount, 0),
      save(KEYS.completedUnits, []),
      save(KEYS.lastActiveDate, null),
      save(KEYS.dailyWords, {}),
      save(KEYS.dailyReviews, {}),
    ]);
  }, []);

  /** Wipes all local data — equivalent to a fresh install. */
  const resetAll = useCallback(async () => {
    setState((prev) => ({
      ...prev,
      savedWords: [],
      reviews: [],
      customWords: [],
      streak: 0,
      totalLearned: 0,
      todayCount: 0,
      completedUnits: [],
      lastActiveDate: null,
      dailyWords: {},
      dailyReviews: {},
    }));
    await AsyncStorage.multiRemove(Object.values(KEYS));
  }, []);

  return (
    <AppContext.Provider
      value={{
        ...state,
        saveWord,
        unsaveWord,
        isWordSaved,
        addReview,
        updateReview,
        getTodayReviews,
        getUpcomingReviews,
        markUnitComplete,
        isUnitComplete,
        completeOnboarding,
        signIn,
        signUp,
        signOut,
        saveCustomWord,
        updateCustomWord,
        deleteCustomWord,
        findWord,
        resetSavedWords,
        resetReviews,
        resetCustomWords,
        resetStudyProgress,
        resetAll,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp(): AppContextType {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside AppProvider");
  return ctx;
}
