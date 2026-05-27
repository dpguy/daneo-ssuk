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
  difficulty?: "beginner" | "easy" | "medium" | "hard" | "advanced";
  level: "elementary" | "middle" | "high";
  grade: number;
  unit: number;
  category?: string;
  relatedWords?: string[];
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
