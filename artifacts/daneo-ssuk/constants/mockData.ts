// 단어쑥 vocabulary dataset — 300 words (Elementary 100, Middle 100, High 100)

export type { Word, SavedWord, Review } from "./wordTypes";
import type { Word } from "./wordTypes";

import { ELEMENTARY_WORDS } from "./vocabulary/elementary";
import { MIDDLE_WORDS } from "./vocabulary/middle";
import { HIGH1_WORDS } from "./vocabulary/high1";

export const MOCK_WORDS: Word[] = [
  ...ELEMENTARY_WORDS,
  ...MIDDLE_WORDS,
  ...HIGH1_WORDS,
];

// ── Helpers & meta ────────────────────────────────────────────────────────────

export const TEXTBOOK_STRUCTURE = {
  elementary: {
    label: "초등학교",
    grades: [3, 4, 5, 6],
    unitsPerGrade: 4,
  },
  middle: {
    label: "중학교",
    grades: [1, 2, 3],
    unitsPerGrade: 4,
  },
  high: {
    label: "고등학교",
    grades: [1, 2, 3],
    unitsPerGrade: 4,
  },
};

export const POPULAR_WORDS = [
  "apple", "achieve", "discover", "courage", "community",
  "inspire", "equality", "creative", "global", "honest",
];

export const DEMO_SCAN_WORDS = [
  { word: "apple",     id: "e32"  },
  { word: "creative",  id: "m04"  },
  { word: "achieve",   id: "h01"  },
  { word: "brave",     id: "m03"  },
  { word: "equality",  id: "h09"  },
  { word: "evidence",  id: "m37"  },
  { word: "inspire",   id: "m100" },
  { word: "community", id: "m42"  },
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
