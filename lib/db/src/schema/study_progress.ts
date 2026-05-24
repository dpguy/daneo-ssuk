import { integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

import { usersTable } from "./users";

export const studyProgressTable = pgTable("study_progress", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .unique()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  streak: integer("streak").notNull().default(0),
  longestStreak: integer("longest_streak").notNull().default(0),
  totalLearned: integer("total_learned").notNull().default(0),
  todayCount: integer("today_count").notNull().default(0),
  completedUnits: text("completed_units").array().notNull().default([]),
  lastActiveDate: text("last_active_date"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertStudyProgressSchema = createInsertSchema(studyProgressTable).omit({
  id: true,
  updatedAt: true,
});
export type InsertStudyProgress = z.infer<typeof insertStudyProgressSchema>;
export type StudyProgressRow = typeof studyProgressTable.$inferSelect;
