// Achievement service — unlockable achievements.
// Strategy: Supabase when available, AsyncStorage otherwise.
import AsyncStorage from "@react-native-async-storage/async-storage";

import { getCurrentUserId, getSupabase, isSupabaseEnabled } from "./supabase";

// ── Achievement catalogue (mirrors lib/db/src/schema/achievements.ts) ─────────

export const ACHIEVEMENT_IDS = [
  "first_word",
  "word_10",
  "word_50",
  "word_100",
  "word_300",
  "streak_3",
  "streak_7",
  "streak_30",
  "perfect_review",
  "unit_complete",
  "all_elementary",
  "all_middle",
  "all_high",
  "speed_learner",
  "comeback",
] as const;

export type AchievementId = (typeof ACHIEVEMENT_IDS)[number];

export const ACHIEVEMENT_META: Record<
  AchievementId,
  { label: string; description: string; icon: string; xp: number }
> = {
  first_word:     { label: "첫 단어!",       description: "첫 번째 단어를 저장했습니다",       icon: "star",           xp: 10  },
  word_10:        { label: "단어 10개",       description: "단어 10개를 학습했습니다",          icon: "library",        xp: 20  },
  word_50:        { label: "단어 50개",       description: "단어 50개를 학습했습니다",          icon: "book",           xp: 50  },
  word_100:       { label: "단어 100개",      description: "단어 100개를 학습했습니다",         icon: "bookmarks",      xp: 100 },
  word_300:       { label: "단어 300개",      description: "모든 단어를 완주했습니다! 🎉",      icon: "trophy",         xp: 300 },
  streak_3:       { label: "3일 연속",        description: "3일 연속 학습했습니다",             icon: "flame",          xp: 30  },
  streak_7:       { label: "1주 연속",        description: "7일 연속 학습했습니다",             icon: "flame",          xp: 70  },
  streak_30:      { label: "1달 연속",        description: "30일 연속 학습했습니다",            icon: "flame",          xp: 300 },
  perfect_review: { label: "완벽한 복습",     description: "오늘 복습 단어를 모두 완료했습니다", icon: "checkmark-done", xp: 50  },
  unit_complete:  { label: "단원 완료",       description: "한 단원을 모두 학습했습니다",        icon: "ribbon",         xp: 40  },
  all_elementary: { label: "초등 마스터",     description: "초등 단어를 모두 완주했습니다",      icon: "school",         xp: 150 },
  all_middle:     { label: "중학 마스터",     description: "중학 단어를 모두 완주했습니다",      icon: "school",         xp: 200 },
  all_high:       { label: "고등 마스터",     description: "고등 단어를 모두 완주했습니다",      icon: "school",         xp: 250 },
  speed_learner:  { label: "스피드 러너",     description: "하루에 20개 이상 학습했습니다",      icon: "flash",          xp: 60  },
  comeback:       { label: "컴백!",           description: "7일 후 다시 돌아왔습니다",          icon: "refresh-circle", xp: 20  },
};

const STORAGE_KEY = "dss:achievements";

interface AchievementRow {
  achievement_id: string;
  unlocked_at: string;
  xp_awarded: number;
}

export interface EarnedAchievement {
  achievementId: AchievementId;
  unlockedAt: string;
  xpAwarded: number;
  label: string;
  description: string;
  icon: string;
}

// ── AsyncStorage helpers ───────────────────────────────────────────────────────

async function localGetEarned(): Promise<EarnedAchievement[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as EarnedAchievement[]) : [];
  } catch {
    return [];
  }
}

async function localSetEarned(list: EarnedAchievement[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

// ── Public API ─────────────────────────────────────────────────────────────────

export async function getEarnedAchievements(): Promise<EarnedAchievement[]> {
  if (isSupabaseEnabled) {
    const userId = await getCurrentUserId();
    if (userId) {
      const { data, error } = await getSupabase()
        .from("achievements")
        .select("achievement_id, unlocked_at, xp_awarded")
        .eq("user_id", userId)
        .order("unlocked_at", { ascending: false });

      if (!error && data) {
        return (data as AchievementRow[]).map((row) => {
          const id = row.achievement_id as AchievementId;
          const meta = ACHIEVEMENT_META[id] ?? { label: id, description: "", icon: "star", xp: 0 };
          return {
            achievementId: id,
            unlockedAt: row.unlocked_at,
            xpAwarded: row.xp_awarded,
            label: meta.label,
            description: meta.description,
            icon: meta.icon,
          };
        });
      }
    }
  }
  return localGetEarned();
}

export async function isUnlocked(achievementId: AchievementId): Promise<boolean> {
  const earned = await getEarnedAchievements();
  return earned.some((a) => a.achievementId === achievementId);
}

export async function unlockAchievement(
  achievementId: AchievementId
): Promise<EarnedAchievement | null> {
  if (await isUnlocked(achievementId)) return null;

  const meta = ACHIEVEMENT_META[achievementId];
  const earned: EarnedAchievement = {
    achievementId,
    unlockedAt: new Date().toISOString(),
    xpAwarded: meta.xp,
    label: meta.label,
    description: meta.description,
    icon: meta.icon,
  };

  if (isSupabaseEnabled) {
    const userId = await getCurrentUserId();
    if (userId) {
      await getSupabase()
        .from("achievements")
        .upsert(
          { user_id: userId, achievement_id: achievementId, xp_awarded: meta.xp },
          { onConflict: "user_id,achievement_id" }
        );
      return earned;
    }
  }

  const current = await localGetEarned();
  await localSetEarned([earned, ...current]);
  return earned;
}

// Check and unlock any achievements earned based on current stats
export async function checkAndUnlock(stats: {
  totalLearned: number;
  streak: number;
  todayCount: number;
}): Promise<EarnedAchievement[]> {
  const checks: Array<[AchievementId, boolean]> = [
    ["first_word",    stats.totalLearned >= 1],
    ["word_10",       stats.totalLearned >= 10],
    ["word_50",       stats.totalLearned >= 50],
    ["word_100",      stats.totalLearned >= 100],
    ["word_300",      stats.totalLearned >= 300],
    ["streak_3",      stats.streak >= 3],
    ["streak_7",      stats.streak >= 7],
    ["streak_30",     stats.streak >= 30],
    ["speed_learner", stats.todayCount >= 20],
  ];

  const results = await Promise.all(
    checks
      .filter(([, condition]) => condition)
      .map(([id]) => unlockAchievement(id))
  );

  return results.filter((r): r is EarnedAchievement => r !== null);
}

// Sync local AsyncStorage → Supabase (call after sign-in)
export async function syncLocalToSupabase(): Promise<void> {
  if (!isSupabaseEnabled) return;
  const userId = await getCurrentUserId();
  if (!userId) return;

  const local = await localGetEarned();
  if (local.length === 0) return;

  const rows = local.map((a) => ({
    user_id:        userId,
    achievement_id: a.achievementId,
    xp_awarded:     a.xpAwarded,
  }));
  await getSupabase()
    .from("achievements")
    .upsert(rows, { onConflict: "user_id,achievement_id" });
}
