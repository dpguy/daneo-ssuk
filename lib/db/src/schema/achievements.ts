import { integer, pgTable, text, timestamp, unique, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

import { usersTable } from "./users";

// All possible achievement definitions (static catalogue)
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
  first_word:      { label: "첫 단어!",          description: "첫 번째 단어를 저장했습니다",      icon: "star",           xp: 10  },
  word_10:         { label: "단어 10개",          description: "단어 10개를 학습했습니다",          icon: "library",        xp: 20  },
  word_50:         { label: "단어 50개",          description: "단어 50개를 학습했습니다",          icon: "book",           xp: 50  },
  word_100:        { label: "단어 100개",         description: "단어 100개를 학습했습니다",         icon: "bookmarks",      xp: 100 },
  word_300:        { label: "단어 300개",         description: "모든 단어를 완주했습니다! 🎉",     icon: "trophy",         xp: 300 },
  streak_3:        { label: "3일 연속",           description: "3일 연속 학습했습니다",             icon: "flame",          xp: 30  },
  streak_7:        { label: "1주 연속",           description: "7일 연속 학습했습니다",             icon: "flame",          xp: 70  },
  streak_30:       { label: "1달 연속",           description: "30일 연속 학습했습니다",            icon: "flame",          xp: 300 },
  perfect_review:  { label: "완벽한 복습",        description: "오늘 복습 단어를 모두 완료했습니다", icon: "checkmark-done", xp: 50  },
  unit_complete:   { label: "단원 완료",          description: "한 단원을 모두 학습했습니다",        icon: "ribbon",         xp: 40  },
  all_elementary:  { label: "초등 마스터",        description: "초등 단어를 모두 완주했습니다",      icon: "school",         xp: 150 },
  all_middle:      { label: "중학 마스터",        description: "중학 단어를 모두 완주했습니다",      icon: "school",         xp: 200 },
  all_high:        { label: "고등 마스터",        description: "고등 단어를 모두 완주했습니다",      icon: "school",         xp: 250 },
  speed_learner:   { label: "스피드 러너",        description: "하루에 20개 이상 학습했습니다",      icon: "flash",          xp: 60  },
  comeback:        { label: "컴백!",              description: "7일 후 다시 돌아왔습니다",          icon: "refresh-circle", xp: 20  },
};

export const achievementsTable = pgTable(
  "achievements",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    achievementId: text("achievement_id").notNull(),
    unlockedAt: timestamp("unlocked_at", { withTimezone: true }).notNull().defaultNow(),
    xpAwarded: integer("xp_awarded").notNull().default(0),
  },
  (t) => [unique().on(t.userId, t.achievementId)]
);

export const insertAchievementSchema = createInsertSchema(achievementsTable).omit({
  id: true,
  unlockedAt: true,
});
export type InsertAchievement = z.infer<typeof insertAchievementSchema>;
export type AchievementRow = typeof achievementsTable.$inferSelect;
