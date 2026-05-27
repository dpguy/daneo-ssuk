// 단어쑥 vocabulary dataset — 1,500 words (Elementary 300, Middle 500, High 700)

export type { Word, SavedWord, Review } from "./wordTypes";
import type { Word } from "./wordTypes";

import { ELEMENTARY_WORDS } from "./vocabulary/elementary";
import { MIDDLE_WORDS } from "./vocabulary/middle";
import { MIDDLE_REST_WORDS } from "./vocabulary/middle_rest";
import { HIGH1_WORDS } from "./vocabulary/high1";
import { HIGH2_WORDS } from "./vocabulary/high2";

export const MOCK_WORDS: Word[] = [
  ...ELEMENTARY_WORDS,
  ...MIDDLE_WORDS,
  ...MIDDLE_REST_WORDS,
  ...HIGH1_WORDS,
  ...HIGH2_WORDS,
];

// ── Helpers & meta ────────────────────────────────────────────────────────────

export const TEXTBOOK_STRUCTURE = {
  elementary: {
    label: "초등학교",
    grades: [3, 4, 5, 6],
    unitsPerGrade: 8,
  },
  middle: {
    label: "중학교",
    grades: [1, 2, 3],
    unitsPerGrade: 10,
  },
  high: {
    label: "고등학교",
    grades: [1, 2, 3],
    unitsPerGrade: 16,
  },
};

export const POPULAR_WORDS = [
  "apple", "important", "analyze", "courage", "environment",
  "achieve", "evidence", "challenge", "perseverance", "innovative",
];

export const DEMO_SCAN_WORDS = [
  { word: "apple",        id: "e1"  },
  { word: "important",   id: "m1"  },
  { word: "analyze",     id: "h1"  },
  { word: "friendship",  id: "e7"  },
  { word: "significant", id: "h5"  },
  { word: "remember",    id: "m3"  },
  { word: "challenge",   id: "m42" },
  { word: "perseverance",id: "h6"  },
];

export const getWordsByLevel = (level: "elementary" | "middle" | "high") =>
  MOCK_WORDS.filter((w) => w.level === level);

export const getWordsByGradeAndUnit = (grade: number, unit: number) =>
  MOCK_WORDS.filter((w) => w.grade === grade && w.unit === unit);

export const getWordById = (id: string) => MOCK_WORDS.find((w) => w.id === id);

export const getRelatedWords = (word: Word) =>
  (word.relatedWords ?? [])
    .map((id) => MOCK_WORDS.find((w) => w.id === id))
    .filter(Boolean) as Word[];

export const getLevelLabel = (level: "elementary" | "middle" | "high") =>
  level === "elementary" ? "초등" : level === "middle" ? "중등" : "고등";

export const formatNextReview = (isoDate: string): string => {
  const next = new Date(isoDate);
  const now = new Date();
  const diffMs = next.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / 86400000);

  if (diffDays <= 0) return "오늘";
  if (diffDays === 1) return "내일";
  if (diffDays < 7) return `${diffDays}일 후`;
  if (diffDays < 14) return "1주 후";
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}주 후`;
  return "1달 후";
};
