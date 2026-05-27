export interface Word {
  id: string;
  word: string;
  pronunciation: string;
  meaning: string;
  example: string;
  exampleKorean: string;
  idiom: string;
  idiomMeaning: string;
  memoryTip: string;
  difficulty?: "beginner" | "easy" | "medium" | "hard" | "advanced" | "custom";
  level: "elementary" | "middle" | "high";
  grade: number;
  unit: number;
  category?: string;
  relatedWords?: string[];
  // Custom word fields — only present when isCustom is true
  isCustom?: boolean;
  createdAt?: string;
}

export interface SavedWord {
  wordId: string;
  savedAt: string;
}

export interface Review {
  wordId: string;
  nextReview: string;
  interval: number;
  easeFactor: number;
  repetitions: number;
}
