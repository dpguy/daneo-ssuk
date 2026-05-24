import { integer, pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const wordLevelEnum = pgEnum("word_level", ["elementary", "middle", "high"]);

export const wordsTable = pgTable("words", {
  id: text("id").primaryKey(),
  word: text("word").notNull(),
  pronunciation: text("pronunciation").notNull(),
  meaning: text("meaning").notNull(),
  example: text("example").notNull(),
  exampleKorean: text("example_korean").notNull(),
  idiom: text("idiom"),
  idiomMeaning: text("idiom_meaning"),
  memoryTip: text("memory_tip"),
  level: wordLevelEnum("level").notNull(),
  grade: integer("grade").notNull(),
  unit: integer("unit").notNull(),
  relatedWords: text("related_words").array(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertWordSchema = createInsertSchema(wordsTable).omit({
  createdAt: true,
});
export type InsertWord = z.infer<typeof insertWordSchema>;
export type DbWord = typeof wordsTable.$inferSelect;
