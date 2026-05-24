// Progress service — study stats and completed units persistence.
// Strategy: Supabase when available, AsyncStorage otherwise.
import AsyncStorage from "@react-native-async-storage/async-storage";

import { getCurrentUserId, getSupabase, isSupabaseEnabled } from "./supabase";

const KEYS = {
  streak:         "dss:streak",
  longestStreak:  "dss:longestStreak",
  totalLearned:   "dss:totalLearned",
  todayCount:     "dss:todayCount",
  completedUnits: "dss:completedUnits",
  lastActiveDate: "dss:lastActiveDate",
} as const;

export interface StudyStats {
  streak: number;
  longestStreak: number;
  totalLearned: number;
  todayCount: number;
  completedUnits: string[];
  lastActiveDate: string | null;
}

interface ProgressRow {
  streak: number;
  longest_streak: number;
  total_learned: number;
  today_count: number;
  completed_units: string[];
  last_active_date: string | null;
}

// ── AsyncStorage helpers ───────────────────────────────────────────────────────

async function localGet<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export async function localGetStats(): Promise<StudyStats> {
  const [streak, longestStreak, totalLearned, todayCount, completedUnits, lastActiveDate] =
    await Promise.all([
      localGet<number>(KEYS.streak, 0),
      localGet<number>(KEYS.longestStreak, 0),
      localGet<number>(KEYS.totalLearned, 0),
      localGet<number>(KEYS.todayCount, 0),
      localGet<string[]>(KEYS.completedUnits, []),
      localGet<string | null>(KEYS.lastActiveDate, null),
    ]);
  return { streak, longestStreak, totalLearned, todayCount, completedUnits, lastActiveDate };
}

async function localSaveStats(patch: Partial<StudyStats>): Promise<void> {
  const mapping: Record<keyof StudyStats, string> = {
    streak:         KEYS.streak,
    longestStreak:  KEYS.longestStreak,
    totalLearned:   KEYS.totalLearned,
    todayCount:     KEYS.todayCount,
    completedUnits: KEYS.completedUnits,
    lastActiveDate: KEYS.lastActiveDate,
  };
  await Promise.all(
    (Object.entries(patch) as [keyof StudyStats, unknown][]).map(([k, v]) =>
      AsyncStorage.setItem(mapping[k], JSON.stringify(v))
    )
  );
}

// ── Public API ─────────────────────────────────────────────────────────────────

export async function getStats(): Promise<StudyStats> {
  if (isSupabaseEnabled) {
    const userId = await getCurrentUserId();
    if (userId) {
      const { data, error } = await getSupabase()
        .from("study_progress")
        .select("streak, longest_streak, total_learned, today_count, completed_units, last_active_date")
        .eq("user_id", userId)
        .maybeSingle();

      if (!error && data) {
        const row = data as ProgressRow;
        return {
          streak:         row.streak,
          longestStreak:  row.longest_streak,
          totalLearned:   row.total_learned,
          todayCount:     row.today_count,
          completedUnits: row.completed_units ?? [],
          lastActiveDate: row.last_active_date,
        };
      }
    }
  }
  return localGetStats();
}

export async function updateStats(patch: Partial<StudyStats>): Promise<void> {
  if (isSupabaseEnabled) {
    const userId = await getCurrentUserId();
    if (userId) {
      await getSupabase()
        .from("study_progress")
        .upsert(
          {
            user_id:          userId,
            streak:           patch.streak,
            longest_streak:   patch.longestStreak,
            total_learned:    patch.totalLearned,
            today_count:      patch.todayCount,
            completed_units:  patch.completedUnits,
            last_active_date: patch.lastActiveDate,
          },
          { onConflict: "user_id" }
        );
      return;
    }
  }
  await localSaveStats(patch);
}

export async function markUnitComplete(grade: number, unit: number): Promise<void> {
  const key = `${grade}-${unit}`;
  const stats = await getStats();
  if (stats.completedUnits.includes(key)) return;
  await updateStats({ completedUnits: [...stats.completedUnits, key] });
}

export async function isUnitComplete(grade: number, unit: number): Promise<boolean> {
  const stats = await getStats();
  return stats.completedUnits.includes(`${grade}-${unit}`);
}

// Sync local AsyncStorage → Supabase (call after sign-in)
export async function syncLocalToSupabase(): Promise<void> {
  if (!isSupabaseEnabled) return;
  const userId = await getCurrentUserId();
  if (!userId) return;

  const local = await localGetStats();
  await getSupabase()
    .from("study_progress")
    .upsert(
      {
        user_id:          userId,
        streak:           local.streak,
        longest_streak:   local.longestStreak,
        total_learned:    local.totalLearned,
        today_count:      local.todayCount,
        completed_units:  local.completedUnits,
        last_active_date: local.lastActiveDate,
      },
      { onConflict: "user_id" }
    );
}
