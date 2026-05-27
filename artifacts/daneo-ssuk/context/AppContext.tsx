import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import { Review, SavedWord } from "@/constants/mockData";

// ── Types ──────────────────────────────────────────────────────────────────────

interface AppState {
  savedWords: SavedWord[];
  reviews: Review[];
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

async function save(key: string, value: unknown) {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

// ── Context ───────────────────────────────────────────────────────────────────

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>({
    savedWords: [],
    reviews: [],
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
