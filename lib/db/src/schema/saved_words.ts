import { pgTable, text, timestamp, unique, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

import { usersTable } from "./users";
import { wordsTable } from "./words";

export const savedWordsTable = pgTable(
  "saved_words",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    wordId: text("word_id")
      .notNull()
      .references(() => wordsTable.id, { onDelete: "cascade" }),
    savedAt: timestamp("saved_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [unique().on(t.userId, t.wordId)]
);

export const insertSavedWordSchema = createInsertSchema(savedWordsTable).omit({
  id: true,
  savedAt: true,
});
export type InsertSavedWord = z.infer<typeof insertSavedWordSchema>;
export type SavedWordRow = typeof savedWordsTable.$inferSelect;
