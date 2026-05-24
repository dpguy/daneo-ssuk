import { integer, pgTable, real, text, timestamp, unique, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

import { usersTable } from "./users";
import { wordsTable } from "./words";

export const reviewScheduleTable = pgTable(
  "review_schedule",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    wordId: text("word_id")
      .notNull()
      .references(() => wordsTable.id, { onDelete: "cascade" }),
    nextReview: timestamp("next_review", { withTimezone: true }).notNull(),
    interval: integer("interval").notNull().default(1),
    easeFactor: real("ease_factor").notNull().default(2.5),
    repetitions: integer("repetitions").notNull().default(0),
    lastDifficulty: text("last_difficulty"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
  },
  (t) => [unique().on(t.userId, t.wordId)]
);

export const insertReviewScheduleSchema = createInsertSchema(reviewScheduleTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertReviewSchedule = z.infer<typeof insertReviewScheduleSchema>;
export type ReviewScheduleRow = typeof reviewScheduleTable.$inferSelect;
